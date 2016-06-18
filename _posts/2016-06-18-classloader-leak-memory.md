---
layout: post
title: ClassLoader��Tomcat�����ڴ�й¶����
description: ������Tomcat�������һ��Ӧ�ã�ִ�����߼�֮���ٰ����Ӧ��ж��
categories: java
icon: code
---
&nbsp;&nbsp;  ��Ŀ������һ����֤���õĹ��ܡ���Ҫ�������£�

<img src="/images/20160618/tomcat-check-flow.png" alt="ҵ������ͼ" />

&nbsp;&nbsp;  һ��ʼ����д��������ֻ����web��Ŀ����ֱ�ӵ���check�߼�

<div class="article_content">
<textarea name="dp-code" class="java" >
    public CheckResult test() {
        URLClassLoader classLoader = null;
        File dataFile = new File("xx.jar");
        File checkFile = new File("resourceDir");
        try {
            // �����ֹ�ڴ�й¶,��ΪclassLoader�ͷ���,�������jar�Ѿ��л���,û���ͷ�
            URL jarUrl = dataFile.toURI().toURL();
            URLConnection jarConnection = jarUrl.openConnection();
            jarConnection.setUseCaches(true);

            classLoader = new URLClassLoader(new URL[]{jarUrl});
            Class<?> centerClass = classLoader.loadClass("com.xx.data.DataCenter");
            Object centerObject = centerClass.getMethod("getInstance").invoke(null);
            Field field = centerClass.getField("gameConfigGroup");
            Object gameConfigGroupObject = field.get(centerObject);

            String uploadUrlPath = checkFile.toURI().toURL().toString();

            Method loadMethod = gameConfigGroupObject.getClass().getDeclaredMethod("load", String.class);
            Method checkMethod = gameConfigGroupObject.getClass().getDeclaredMethod("check", gameConfigGroupObject.getClass());

            loadMethod.invoke(gameConfigGroupObject, uploadUrlPath);
            checkMethod.invoke(gameConfigGroupObject, gameConfigGroupObject);

            return CheckResult.suc();
        } catch (Exception e) {
            StringWriter writer = new StringWriter();
            Throwable cause;
            Throwable resultCause = e;
            if (resultCause.getCause() == null) {
                resultCause.printStackTrace(new PrintWriter(writer));
            } else {
                while (null != (cause = resultCause.getCause()) && (resultCause != cause)) {
                    resultCause = cause;
                    if (!(resultCause instanceof InvocationTargetException)) {
                        resultCause.printStackTrace(new PrintWriter(writer));
                    }
                }
            }
            return CheckResult.err(writer.toString());
        } finally {
            if (classLoader != null) {
                try {
                    classLoader.close();
                } catch (IOException e) {
                    logger.error(e.getMessage(), e);
                }
            }
        }
    }
</textarea>
</div>

&nbsp;&nbsp;  ������������һ�����⣬���Ǽ�ʹ<code>ClassLoader</code>�ر��ˣ�����Ϊ������һЩ<code>static</code>�������棬��<code>logback</code>��־���ȣ��ᵼ���ڴ�����й¶��
&nbsp;&nbsp;  Ȼ���������һֱ�ھ��ᣬ��<code>ClassLoader</code>�Ļ������ֲ��Ǻ��죬��һ��ͻȻ���һ�����뵽�����ӽ��̡�Ȼ�����ĳ���������

<div class="article_content">
<textarea name="dp-code" class="java" >
    public CheckResult test() {
        URLClassLoader classLoader = null;
        File dataFile = new File("xx.jar");
        File checkFile = new File("resourceDir");
        // ������Դ�ʹ���, ��ִ�м���߼�
        StringWriter stringWriter = new StringWriter();
        PrintWriter outputStream = new PrintWriter(stringWriter);
        try {
            String cmd = "java -XX:-OmitStackTraceInFastThrow -Xms512m -cp .:/usr/local/tomcat/apps CheckMain " + dataFile.getPath() + " " + checkFile.getCanonicalPath();
            Process p = Runtime.getRuntime().exec(new String[]{"/bin/sh", "-c", "cd " + dataFile.getParent() + ";svn up;" + cmd});

            StreamGobbler errorGobbler = new StreamGobbler(p.getErrorStream(), "ERROR", outputStream);
            StreamGobbler outputGobbler = new StreamGobbler(p.getInputStream(), "");

            taskExecutor.execute(errorGobbler);
            taskExecutor.execute(outputGobbler);

            long start = System.currentTimeMillis();
            logger.info("start waiting...[{}]", cmd);
            try {
                p.waitFor(20, TimeUnit.SECONDS);
            } finally {
                p.destroy();
            }

            outputStream.flush();
            String rs = stringWriter.toString();
            logger.info("finish, useTime:[{}]", (System.currentTimeMillis() - start));
            if (StringUtils.isNotBlank(rs)) {
                return CheckResult.err(rs);
            }
        } catch (Exception e) {
            logger.error(e.getMessage(), e);
            StringWriter writer = new StringWriter();
            e.printStackTrace(new PrintWriter(writer));
            return CheckResult.err(writer.toString());
        } finally {
            outputStream.close();
        }
        return CheckResult.suc();
    }
</textarea>
</div>

&nbsp;&nbsp;  ���˼·�ܼ򵥣�������һ���ӽ��̣�Ȼ��������ӽ���ȥִ��check�߼��������Ǹ�CheckMain�������£�

<div class="article_content">
<textarea name="dp-code" class="java" >
import java.io.File;
import java.io.IOException;
import java.lang.reflect.Field;
import java.lang.reflect.Method;
import java.net.URL;
import java.net.URLClassLoader;
import java.nio.file.Files;
import java.nio.file.Paths;

/**
 * ��Ϊ��tomcat����ֱ��ִ���������߼�, �ᵼ����һЩ��̬�������ڴ�й¶, ������ʱ���õĽ������ʱ��Runtime����һ���ӽ�����ִ������߼�
 * Created by wait on 2016/6/15.
 */
public class CheckMain {

    static class ExtClassLoader extends URLClassLoader {
        private String path;

        public ExtClassLoader(URL[] urls, String path) {
            super(urls);
            this.path = path;
        }

        public Class<?> loadClass(String name) throws ClassNotFoundException {
            // ���������滻��ͼ, ��ʱ��Ҫ�Ǹ�Ѱ·�㷨
            if (name.equals("com.xx.data.game.config.impl.Q_mapConfig")) {
                try {
                    byte[] buf = Files.readAllBytes(Paths.get(path, "Q_mapConfig.class"));
                    return defineClass(name, buf, 0, buf.length);
                } catch (IOException e) {
                    throw new ClassNotFoundException(name, e);
                }
            }
            return super.loadClass(name);
        }
    }

    private static void check(String dataPath, String urlPath) {
        File dataFile = new File(dataPath);
        URLClassLoader classLoader = null;
        try {
            String uploadUrlPath = new File(urlPath).toURI().toURL().toString();

            URL[] loadUrl = new URL[]{dataFile.toURI().toURL(), dataFile.getParentFile().toURI().toURL()};
            classLoader = new ExtClassLoader(loadUrl, "/usr/local/tomcat/apps");

            Class<?> centerClass = classLoader.loadClass("com.xx.data.DataCenter");
            Object centerObject = centerClass.getMethod("getInstance").invoke(null);
            Field field = centerClass.getField("gameConfigGroup");
            Object gameConfigGroupObject = field.get(centerObject);

            Method loadMethod = gameConfigGroupObject.getClass().getDeclaredMethod("load", String.class);
            Method checkMethod = gameConfigGroupObject.getClass().getDeclaredMethod("check", gameConfigGroupObject.getClass());

            loadMethod.invoke(gameConfigGroupObject, uploadUrlPath);
            checkMethod.invoke(gameConfigGroupObject, gameConfigGroupObject);
        } catch (Exception e) {
            Throwable cause;
            Throwable resultCause = e;
            if (resultCause.getCause() == null) {
                e.printStackTrace();
            } else {
                while (null != (cause = resultCause.getCause()) && (resultCause != cause)) {
                    resultCause = cause;
                    resultCause.printStackTrace();
                }
            }
        } finally {
            if (classLoader != null) {
                try {
                    classLoader.close();
                } catch (IOException e) {
                    e.printStackTrace();
                }
            }
        }
    }

    public static void main(String[] args) {
        if (args.length < 2) {
            return;
        }
//        args = new String[]{"E:\\game\\data.jar", "E:\\3_res"};
        long start = System.currentTimeMillis();
        System.out.println("args:" + args[0] + ", " + args[1]);
        check(args[0], args[1]);
        System.out.println("finish:" + args[0] + ", " + args[1] + " useTime[ms]:" + (System.currentTimeMillis() - start));
    }
}

</textarea>
</div>

&nbsp;&nbsp;  <code>/usr/local/tomcat/apps</code>Ŀ¼�·���<code>CheckMain.java</code>��<code>CheckMain.class</code>��Ȼ��͸���ˡ�
&nbsp;&nbsp;  ���ڵ�ͼѰ·�㷨��Ҫ����Ԥ����Ƚ϶࣬���³�ʼ���Ƚ���������ʵ��֤���ò�����ҪѰ·�������ҾͰ���Ŀ��<code>Q_mapConfig</code>��ʼ��Ѱ·�ǲ��ִ���ע�͵��ˡ�
&nbsp;&nbsp;  ������ӿڵ�Ŀ�ĺܼ򵥣��������������֤�������ᵼ�����˷������²��ԵĹ����жϣ����Բ�������ǰ�������ñ��޸�ʱ����������֤һ�¡��������򵥵��Ľӿڣ�����������ͦ�õġ�ֻ��˵��<code>ClassLoader</code>�Ļ���̫���죬������һ�£�Ӧ����tomcat���֣���������<code>webapp</code>�Ŀ���ʵ����Դ����ķ����������⣬���Ǹ�����Ҫȥ�����飬�Ժ󿴵����������ˡ�