---
layout: post
title: java调用bat完成svn提交
description: java在windows下通过调用本地指令，完成svn提交。
categories: [java]
icon: code
---
&nbsp;&nbsp; 一个用于偶尔偷懒的小工具类╮(╯▽╰)╭：


<div class="article_content">
<textarea name="code" class="java" >
import java.io.*;

/**
 * 打包
 * Created by wait on 2015/9/30.
 */
public class PackUtil {

    /**
     * 更新svn
     *
     * @param svnPath 要更新的svn目录
     * @throws IOException
     * @throws InterruptedException
     */
    public static void svnUpdate(String svnPath) throws IOException, InterruptedException {
        File file = new File(svnPath);
        if (!file.isDirectory()) {
            throw new RuntimeException(svnPath + "不是目录");
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
            throw new RuntimeException("更新svn出错");
        }
        process.destroy();
    }

    /**
     * 注意:这里只是提交新增和有修改的文件, 但对于删除的文件, 没有做处理, 需要手动
     *
     * @param svnPath    svn目录
     * @param nowVersion 提交时的版本号, 或者注释
     * @throws IOException
     * @throws InterruptedException
     */
    public static void svnAddAndCommit(String svnPath, String nowVersion) throws IOException, InterruptedException {
        File file = new File(svnPath);
        if (!file.isDirectory()) {
            throw new RuntimeException(svnPath + "不是目录");
        }
        // 可以使用 svn add --depth=infinity --force *, 一行搞掂svn add, 但使用force不知道会不会有什么问题
        String diskName = file.getAbsolutePath().substring(0, 1);
        StringBuilder builder = new StringBuilder();
        builder.append(diskName).append(":");
        builder.append("&&");
        builder.append("cd ");
        builder.append(svnPath);
        builder.append("&&");
        builder.append("svn st");

        // 先去获取当前目录新添加的文件
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
        // 读取新添加的文件
        while ((line = br.readLine()) != null) {
            if (line.startsWith("?")) {
                String data = line.substring(1).trim();
                builder.append("svn add ").append(data).append("&&");
            }
        }
        // 提交
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
            throw new RuntimeException("提交svn出错");
        }
        process.destroy();
    }


    /**
     * 拷贝文件夹
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

        // 1.先更新svn目录
        svnUpdate(svnPath);

        // 2.接着从项目的打包目录把打包好的文件拷贝到svn目录【如果打包目录跟svn目录一样，则可以跳过这步】
        copyFolder(new File(srcPath), new File(svnPath));

        // 3.提交svn
        svnAddAndCommit(svnPath, "test_version");
    }
}
</textarea>
</div>
&nbsp;&nbsp;源文件目录如下：
<img src="/images/20151001/src_file.png" alt="源文件目录"/>
&nbsp;&nbsp;这个比较简单，在我本机上，就是把<code>E:\tmp</code>目录【这个在实际中应该是项目打包的临时目录，当然，也可以直接打包到svn目录，这样可以少一步拷贝】下的文件拷贝到<code>E:\svnwork</code>

&nbsp;&nbsp;程序的运行结果如下：
<img src="/images/20151001/java_run_result.png" alt="程序的运行结果"/>

&nbsp;&nbsp;最终结果如下：
<img src="/images/20151001/svn_result.png" alt="最终结果"/>

