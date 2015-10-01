---
layout: post
title: java����bat���svn�ύ
description: java��windows��ͨ�����ñ���ָ����svn�ύ��
categories: [java]
icon: code
---
&nbsp;&nbsp; һ������ż��͵����С������r(�s���t)�q��
<div class="article_content">
<textarea name="code" class="java" >
import java.io.*;

/**
 * ���
 * Created by wait on 2015/9/30.
 */
public class PackUtil {

    /**
     * ����svn
     *
     * @param svnPath Ҫ���µ�svnĿ¼
     * @throws IOException
     * @throws InterruptedException
     */
    public static void svnUpdate(String svnPath) throws IOException, InterruptedException {
        File file = new File(svnPath);
        if (!file.isDirectory()) {
            throw new RuntimeException(svnPath + "����Ŀ¼");
        }
        String diskName = file.getAbsolutePath().substring(0, 1);
        StringBuilder builder = new StringBuilder();
        builder.append(diskName).append(":");
        builder.append("&&");
        builder.append("cd ");
        builder.append(svnPath);
        builder.append("&&");
        builder.append("svn up");
        String[] commands = new String[]{
                "cmd.exe",
                "/C",
                builder.toString()
        };
        Runtime rt = Runtime.getRuntime();
        Process process = rt.exec(commands);

        StreamGobbler errorGobbler = new StreamGobbler(process.getErrorStream(), "ERROR");
        StreamGobbler outputGobbler = new StreamGobbler(process.getInputStream(), "");

        errorGobbler.start();
        outputGobbler.start();

        int exitVal = process.waitFor();
        if (exitVal != 0) {
            throw new RuntimeException("����svn����");
        }
        process.destroy();
    }

    /**
     * ע��:����ֻ���ύ���������޸ĵ��ļ�, ������ɾ�����ļ�, û��������, ��Ҫ�ֶ�
     *
     * @param svnPath    svnĿ¼
     * @param nowVersion �ύʱ�İ汾��, ����ע��
     * @throws IOException
     * @throws InterruptedException
     */
    public static void svnAddAndCommit(String svnPath, String nowVersion) throws IOException, InterruptedException {
        File file = new File(svnPath);
        if (!file.isDirectory()) {
            throw new RuntimeException(svnPath + "����Ŀ¼");
        }
        // ����ʹ�� svn add --depth=infinity --force *, һ�и��svn add, ��ʹ��force��֪���᲻����ʲô����
        String diskName = file.getAbsolutePath().substring(0, 1);
        StringBuilder builder = new StringBuilder();
        builder.append(diskName).append(":");
        builder.append("&&");
        builder.append("cd ");
        builder.append(svnPath);
        builder.append("&&");
        builder.append("svn st");

        // ��ȥ��ȡ��ǰĿ¼����ӵ��ļ�
        String[] commands = new String[]{
                "cmd.exe",
                "/C",
                builder.toString()
        };
        Runtime rt = Runtime.getRuntime();
        Process process = rt.exec(commands);

        InputStreamReader isr = new InputStreamReader(process.getInputStream(), "gbk");
        BufferedReader br = new BufferedReader(isr);
        String line;
        builder.delete(0, builder.length());
        builder.append(diskName).append(":");
        builder.append("&&");
        builder.append("cd ");
        builder.append(svnPath);
        builder.append("&&");
        // ��ȡ����ӵ��ļ�
        while ((line = br.readLine()) != null) {
            if (line.startsWith("?")) {
                String data = line.substring(1).trim();
                builder.append("svn add ").append(data).append("&&");
            }
        }
        // �ύ
        builder.append("svn commit -m ").append(nowVersion);
        process.destroy();

        commands[2] = builder.toString();
        process = rt.exec(commands);
        StreamGobbler errorGobbler = new StreamGobbler(process.getErrorStream(), "ERROR");
        StreamGobbler outputGobbler = new StreamGobbler(process.getInputStream(), "");

        errorGobbler.start();
        outputGobbler.start();

        int exitVal = process.waitFor();
        if (exitVal != 0) {
            throw new RuntimeException("�ύsvn����");
        }
        process.destroy();
    }


    /**
     * �����ļ���
     *
     * @param src
     * @param dest
     * @throws IOException
     */
    public static void copyFolder(File src, File dest) throws IOException {
        if (src.isDirectory()) {
            if (!dest.exists()) {
                dest.mkdir();
                System.out.println("Directory copied from " + src + "  to " + dest);
            }
            String files[] = src.list();
            for (String file : files) {
                File srcFile = new File(src, file);
                File destFile = new File(dest, file);
                copyFolder(srcFile, destFile);
            }
        } else {
            copyFile(src, dest);
        }
    }


    public static void copyFile(File from, File to) throws IOException {
        try (InputStream in = new FileInputStream(from)) {
            try (OutputStream out = new FileOutputStream(to)) {
                byte[] buffer = new byte[1024];
                int length;
                while ((length = in.read(buffer)) > 0) {
                    out.write(buffer, 0, length);
                }
                System.out.println("File copied from " + from + " to " + to);
            }
        }
    }


    static class StreamGobbler extends Thread {
        InputStream is;
        String type;

        public StreamGobbler(InputStream is, String type) {
            this.is = is;
            this.type = type;
        }

        public void run() {
            try {
                InputStreamReader isr = new InputStreamReader(is, "gbk");
                BufferedReader br = new BufferedReader(isr);
                String line;
                while ((line = br.readLine()) != null) {
                    System.out.println(type + ">" + line);
                }
            } catch (IOException ioe) {
                ioe.printStackTrace();
            }
        }
    }

    public static void main(String[] args) throws IOException, InterruptedException {
        String svnPath = "E:\\svnwork";
        String srcPath = "E:\\tmp";

        // 1.�ȸ���svnĿ¼
        svnUpdate(svnPath);

        // 2.���Ŵ���Ŀ�Ĵ��Ŀ¼�Ѵ���õ��ļ�������svnĿ¼��������Ŀ¼��svnĿ¼һ��������������ⲽ��
        copyFolder(new File(srcPath), new File(svnPath));

        // 3.�ύsvn
        svnAddAndCommit(svnPath, "test_version");
    }
}
</textarea>
</div>
&nbsp;&nbsp;Դ�ļ�Ŀ¼���£�
<img src="/images/20151001/src_file.png" alt="Դ�ļ�Ŀ¼"/>
&nbsp;&nbsp;����Ƚϼ򵥣����ұ����ϣ����ǰ�<code>E:\tmp</code>Ŀ¼�������ʵ����Ӧ������Ŀ�������ʱĿ¼����Ȼ��Ҳ����ֱ�Ӵ����svnĿ¼������������һ���������µ��ļ�������<code>E:\svnwork</code>

&nbsp;&nbsp;��������н�����£�
<img src="/images/20151001/java_run_result.png" alt="��������н��"/>

&nbsp;&nbsp;���ս�����£�
<img src="/images/20151001/svn_result.png" alt="���ս��"/>

