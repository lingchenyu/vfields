---
layout: post
title: swt的app只启动一个
description: swt打包成单独可运行的exe文件后，每次最多启动单个应用
categories: java
icon: code
---
### 思路 ###

在app启动时，把句柄记录到一个文件中。每次启动先检测一下是否已经启动过，如果是，则把之前的app显示到顶层。

### 实现 ###
<pre class="prettyprint">
<icode class="java">import org.eclipse.swt.SWT;
import org.eclipse.swt.internal.win32.OS;
import org.eclipse.swt.layout.FillLayout;
import org.eclipse.swt.widgets.Display;
import org.eclipse.swt.widgets.Shell;

import java.io.File;
import java.nio.file.Files;

public class TestAppSingleton {

    private static File runningFile = new File("running.ini");

    public static void writeHandle(long handle) {
        try {
            Files.write(runningFile.toPath(), String.valueOf(handle).getBytes());
        } catch (Exception ignored) {

        }
    }

    private static boolean isRunning() {
        if (runningFile.exists()) {
            try {
                byte[] bytes = Files.readAllBytes(runningFile.toPath());
                long runningHandle = Long.valueOf(new String(bytes));
                OS.ShowWindow(runningHandle, OS.SW_RESTORE);
                OS.BringWindowToTop(runningHandle);
                return OS.SetForegroundWindow(runningHandle);
            } catch (Exception e) {
                return false;
            }
        }
        return false;
    }

    public static void main(String[] args) {
        if (isRunning()) {
            return;
        }
        Display display = new Display();
        Shell shell = new Shell(display);
        shell.setText("Test");
        shell.setSize(300, 200);
        shell.setLayout(new FillLayout(SWT.VERTICAL));

        writeHandle(shell.handle);
        shell.open();
        while (!shell.isDisposed()) {
            if (!display.readAndDispatch())
                display.sleep();
        }
        display.dispose();
    }
}</icode>
</pre>