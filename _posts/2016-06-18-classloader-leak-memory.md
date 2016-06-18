---
layout: post
title: ClassLoader在Tomcat里面内存泄露问题
description: 场景是Tomcat里面加载一个应用，执行完逻辑之后，再把这个应用卸掉
categories: java
icon: code
---
&nbsp;&nbsp;  项目里面有一个验证配置的功能。主要流程如下：

<img src="/images/20160618/tomcat-check-flow.png" alt="业务流程图" />

&nbsp;&nbsp;  一开始代码写成这样，只是在<code>web</code>项目里面直接调用<code>check</code>逻辑

<div class="article_content">
<textarea name="dp-code" class="java" >
    public CheckResult test() {
        URLClassLoader classLoader = null;
        File dataFile = new File("xx.jar");
        File checkFile = new File("resourceDir");
        try {
            // 这里防止内存泄露,因为classLoader释放了,但里面的jar已经有缓存,没有释放
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

&nbsp;&nbsp;  但是这样会有一个问题，就是即使<code>ClassLoader</code>关闭了，但因为加载了一些<code>static</code>用作缓存，像<code>logback</code>日志类库等，会导致内存慢慢泄露。

&nbsp;&nbsp;  然后这个问题一直在纠结，而<code>ClassLoader</code>的机制我又不是很熟，有一天突然灵光一闪，想到了用子进程。然后代码改成了这样：

<div class="article_content">
<textarea name="dp-code" class="java" >
    public CheckResult test() {
        URLClassLoader classLoader = null;
        File dataFile = new File("xx.jar");
        File checkFile = new File("resourceDir");
        // 更新资源和代码, 并执行检测逻辑
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

&nbsp;&nbsp;  这个思路很简单，就是起一个子进程，然后让这个子进程去执行<code>check</code>逻辑，上面那个<code>CheckMain</code>代码如下：

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
 * 因为在tomcat里面直接执行这个检测逻辑, 会导致有一些静态变量的内存泄露, 所以暂时采用的解决方法时用Runtime启动一个子进程来执行这个逻辑
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
            // 这里用来替换地图, 暂时不要那个寻路算法
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

&nbsp;&nbsp;  <code>/usr/local/tomcat/apps</code>目录下放置<code>CheckMain.java</code>和<code>CheckMain.class</code>，然后就搞掂了。

&nbsp;&nbsp;  由于地图寻路算法需要做的预处理比较多，导致初始化比较慢，而其实验证配置并不需要寻路，所以我就把项目的<code>Q_mapConfig</code>初始化寻路那部分代码注释掉了。

&nbsp;&nbsp;  这个检测接口的目的很简单，如果重启配置验证不过，会导致起不了服而导致测试的工作中断，所以才在重启前还有配置被修改时让他们先验证一下。但这个简简单单的接口，真是折腾了挺久的。只能说对<code>ClassLoader</code>的机制太不熟，我想了一下，应该像<code>tomcat</code>那种，独立加载<code>webapp</code>的可以实现资源分离的方法才是正解，但那个还需要去看看书，以后看到了再折腾了。