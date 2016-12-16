---
layout: post
title: Java的Process产生的子进程没有关闭
description: Java使用子进程Process，如果在Process产生了线程A，关闭Process不会关闭A
categories: java
icon: code
---
#### 测试代码 ####

测试代码很简单，就是一个java类里面起一个子进程，子进程里面开一个线程，如下：

主测试类：

<pre class="prettyprint">
<icode class="java">import java.io.IOException;
import java.util.concurrent.TimeUnit;

public class TestProcessThread {

    public static void main(String[] args) throws InterruptedException {
        Runtime r = Runtime.getRuntime();
        Process process = null;
        try {
            System.out.println("ex start");
            process = r.exec(new String[]{"sh", "-c", "cd /home/wait/test&&java ProcessThread"});
            process.waitFor(60, TimeUnit.SECONDS);
        } catch (IOException e) {
            e.printStackTrace();
        } finally {
            if (process != null) {
                process.destroy();
            }
        }
        System.out.println("ex end");
        Thread.sleep(1000 * 60 * 2);
    }
}
</icode>
</pre>

另一个测试类：

<pre class="prettyprint">
<icode class="java">import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.nio.file.StandardOpenOption;

public class ProcessThread {

    public static void main(String[] args) throws IOException, InterruptedException {
        Files.write(Paths.get("/home/wait/", "abc.txt"), "start".getBytes(), StandardOpenOption.CREATE, StandardOpenOption.APPEND);
        new Thread(new Runnable() {
            private long last;

            @Override
            public void run() {
                while (true) {
                    if (System.currentTimeMillis() > last) {
                        try {
                            Files.write(Paths.get("/home/wait/", "abc.txt"), "sleep\n".getBytes(), StandardOpenOption.APPEND);
                        } catch (IOException e) {
                            e.printStackTrace();
                        }
                    }
                    last = System.currentTimeMillis() + 1000 * 60;
                }
            }
        }).start();
        Thread.sleep(2000);
        Files.write(Paths.get("/home/wait/", "abc.txt"), "end".getBytes(), StandardOpenOption.APPEND);
    }
}
</icode>
</pre>

#### 运行结果 ####
运行<code>TestProcessThread</code>，结果如下：
<img src="/images/20161007/test-process-result-1.jpg" alt="TestProcessThread运行结果"/>
可以很清晰的看到，执行到end而且即使<code>TestProcessThread</code>已经结束，<code>ProcessThread</code>还在运行。
想了一下，这个其实也很好理解。这个时候其实<code>ProcessThread</code>已经不算是线程了，而是作为一个新的进程或者子进程（至于具体是哪一种，本渣还没搞懂）。
之前没有考虑过这个问题，无意间踩了一个坑。其实看上去很复杂，但是刚刚在写这篇东西的时候，突然就搞懂了。我之前还以为是因为产生了一个线程，所以导致没有结束。
解决方法也挺简单，如果希望结束，则在<code>ProcessThread</code>后面加一句<code>System.exit(1);</code>，当然，这时候也要考虑<code>ShutdownHook</code>钩子的问题。