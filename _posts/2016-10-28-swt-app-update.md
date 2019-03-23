---
layout: post
title: swt的单独可运行exe小程序更新
description: swt打包成单独可运行的exe文件后，每次启动检测是否有新版本，如果有，则更新并重新启动
categories: java
icon: code
---
### 运行结果 ###

<img src="/images/20161028/run-result.gif" alt="swtApp更新效果图" />

为了图片小一点，删减了图片，用了16位色，看起来有点怪。但用文字来说明就是，检测到更新-->确认更新-->弹出更新程序运行-->更新完成并重启。左上角版本号已从2.2.3变成2.2.5

### 更新流程 ###

更新流程比较简单，就不画图了，简单描述如下:

1. 添加钩子，钩子里面用<xcode>Runtime</xcode>把替换当前<xcode>swtApp</xcode>交给另一个<xcode>update.exe</xcode>
2. <xcode>update.exe</xcode>把下载好的新版本<xcode>swtApp</xcode>替换，然后启动新版本<xcode>swtApp</xcode>

### 代码 ###

1. 检测更新的代码如下：
    <pre class="prettyprint">
    <icode class="java"> import com.bigao.diff.MainUI;
    import com.bigao.diff.util.HttpUtil;
    import com.bigao.diff.util.PathUtil;
    import org.apache.commons.io.FileUtils;
    import org.apache.commons.io.IOUtils;
    import org.eclipse.swt.SWT;
    import org.eclipse.swt.widgets.MessageBox;
    import org.eclipse.swt.widgets.Shell;

    import java.io.File;
    import java.io.IOException;
    import java.util.List;

    /**
     * Created by wait on 2016/10/27.
     */
    public class UpdateComposite {
        /** 现在的版本 */
        public static final String NOW_VERSION = "2.2.5";
        /** 版本号url */
        private static final String VERSION_URL = "http://xx.xx.xx.xx/downloads/version.txt";

        public static void checkUpdate(Shell shell) {
            // 检测版本
            String version = null;
            String downloadUrl = null;
            String updateExeUrl = null;
            try {
                List&lt;String&gt; data = IOUtils.readLines(HttpUtil.getInputStream(VERSION_URL));
                for (String line : data) {
                    // 这里使用key, value方式相对灵活一点
                    if (line.startsWith("version")) {
                        version = line.substring(line.indexOf("=") + 1);
                    } else if (line.startsWith("downloadUrl")) {
                        downloadUrl = line.substring(line.indexOf("=") + 1);
                    } else if (line.startsWith("updateExeUrl")) {
                        updateExeUrl = line.substring(line.indexOf("=") + 1);
                    }
                }
                if (version == null || downloadUrl == null || updateExeUrl == null) {
                    return;
                }
                if (NOW_VERSION.equals(version)) {
                    return;
                }
            } catch (IOException e) {
                MainUI.error(e);
                return;
            }
            // 弹出提示框, 是否要更新
            MessageBox messageBox = new MessageBox(shell, SWT.ICON_QUESTION | SWT.YES | SWT.NO);
            messageBox.setText("更新检测");
            messageBox.setMessage("检测到有新版本[" + version + "], 是否现在更新?");
            int response = messageBox.open();
            if (response == SWT.NO) {
                return;
            }
            // 这里开始去下载文件
            String updateFileName = PathUtil.getUserPath() + File.separator + "new_update.exe";
            try {
                File updateExeFile = new File("update.exe");
                if (!updateExeFile.exists()) {
                    FileUtils.copyInputStreamToFile(HttpUtil.getInputStream(updateExeUrl), updateExeFile);
                }
                FileUtils.copyInputStreamToFile(HttpUtil.getInputStream(downloadUrl), new File(updateFileName));
            } catch (IOException e) {
                MainUI.error(e);
                return;
            }

            File updateCompositeFile = new java.io.File(UpdateComposite.class.getProtectionDomain()
                    .getCodeSource()
                    .getLocation()
                    .getPath());
            String srcExeName = updateCompositeFile.getName();
            String nowExeName = srcExeName.endsWith(".exe") ? srcExeName : srcExeName + ".exe";
            // 重命名原来的exe, 移动现在的exe, 删除旧的exe
            String updateCommand = "cmd /c update.exe \"" + nowExeName + "\" \"" + updateFileName + "\"";
            Runtime.getRuntime().addShutdownHook(new Thread(new Runnable() {
                @Override
                public void run() {
                    // 这里开始执行bat命令
                    try {
                        Runtime.getRuntime().exec(updateCommand);
                    } catch (IOException e) {
                        e.printStackTrace();
                    }
                }
            }));

            System.exit(0);
        }
    }</icode>
    </pre>

2. 更新应用的代码如下：            
    <pre class="prettyprint">
    <icode class="java"> import java.io.File;
    import java.io.FileInputStream;
    import java.io.FileOutputStream;
    import java.io.IOException;
    import java.nio.channels.FileChannel;

    /**
     * Created by wait on 2016/10/27.
     */
    public class Update {

        public static void copyFile(File sourceFile, File destFile) throws IOException {
            if (!destFile.exists()) {
                destFile.createNewFile();
            }

            FileChannel source = null;
            FileChannel destination = null;

            try {
                source = new FileInputStream(sourceFile).getChannel();
                destination = new FileOutputStream(destFile).getChannel();
                destination.transferFrom(source, 0, source.size());
            } finally {
                if (source != null) {
                    source.close();
                }
                if (destination != null) {
                    destination.close();
                }
            }
        }

        public static void main(String[] args) {
            if (args.length < 2) {
                return;
            }
            String nowExeName = args[0];
            String updateFileName = args[1];

            File updateExeFile = new File(updateFileName);
            if (!updateExeFile.exists()) {
                return;
            }
            try {
                copyFile(updateExeFile, new File(nowExeName));
                Runtime.getRuntime().exec("cmd.exe /c " + nowExeName).waitFor();
            } catch (IOException e) {
                e.printStackTrace();
            } catch (InterruptedException e) {
                e.printStackTrace();
            }
        }
    }</icode>
    </pre>

3. <xcode>version.txt</xcode>内容如下：
    {% highlight txt %}
    version=2.2.5
    downloadUrl=http://xx.xx.xx.xx/xx/diff-tool/downloads/diff-tool225.exe
    updateExeUrl=http://xx.xx.xx.xx/xx/update.exe {% endhighlight %}


### 结束 ###
看代码也知道，逻辑真的超级简单。当然，我的异常处理写得不好。

1. 首先判断<xcode>update.exe</xcode>存不存在，如果不存在，则去下载；如果存在，则下载新版本的<xcode>swtApp</xcode>

2. 等新版本的<xcode>swtApp</xcode>下载完成后，则把替换工作交给<xcode>update.exe</xcode>。
    这是因为，在<xcode>windows</xcode>下好像是不能修改正在运行的程序的，这个我不是很肯定，但之前用脚本重命名-->移动新的过来-->删掉旧的-->启动新的，这个在<code>windows7</xcode>上不行。
    可能是我操作不对，但我用我自己的方式解决了这个问题，虽然并不优雅，但内部使用，就先这样了。

3. <xcode>update.exe</xcode>做的工作超级简单，就是替换，然后启动

4. 其实用<xcode>Java</xcode>写桌面应用真的不好，我也在学<xcode>pyqt</xcode>，但<xcode>pyqt</xcode>没找到[NatTable](http://www.eclipse.org/nattable/)这么好用的<xcode>table</xcode>处理框架，就又回来折腾<xcode>Java</xcode>了，哭/(ㄒoㄒ)/~~

5. 之前一直觉得想想就好难，但没想过可以这么简单，哎，还是要鼓起勇气多折腾= =

### 2018.05.30更新 ###
之前的<xcode>update.exe</xcode>是用<xcode>Java</xcode>写的，更新之后会出现文件拖拽失效的问题。一直没找到原因，后来改用<xcode>Python</xcode>写可以解决问题。
<pre class="prettyprint">
<icode class="python">#!/usr/bin/env python3
import os
import sys
from shutil import copyfile

if __name__ == '__main__':
    if len(sys.argv) < 2:
        sys.exit()
    nowExe = sys.argv[1]
    updateExe = sys.argv[2]
    if os.path.isfile(nowExe):
        copyfile(updateExe, nowExe)
        os.system("cmd.exe /c" + nowExe)
</icode>
</pre>


### 2019.03.23更新 ###
在使用上面的<xcode>python</xcode>代码使用<xcode>pyinstaller</xcode>编译为<xcode>exe</xcode>之后，一直没出过什么问题，直到最近工具用到了不能连外网的电脑上，有一台机子会报

<pre class="prettyprint">
<icode class="txt">Error loading python Python35.Dll,
error code 127
</icode>
</pre>

具体的报错因为但是没截图，又是内网比较难取出来，只记得这些，想了一下，这个更新逻辑也不是很复杂，直接用<xcode>c</xcode>写算了，代码如下：

<pre class="prettyprint">
<icode class="c">#include &lt;stdio.h&gt;
#include &lt;stdlib.h&gt;
#include &lt;string.h&gt;
#include &lt;unistd.h&gt;
 
int main(int argc, char **argv)
{
   if(argc < 2){
      return 0; 
   }
   char *source_file = argv[1];
   char *target_file = argv[2];
   if(access( source_file, F_OK ) == -1) {
     return 0;
   } 
    
   if(access( target_file, F_OK ) != -1) {
     remove(target_file); 
   }
 
   rename(source_file, target_file);
   
   char command[80] = "cmd.exe /c ";
   strcat(command, target_file);
   
   system(command);
 
   return 0;
}
</icode>
</pre>


暂时能用，后面遇到问题再更新，嗯，希望不需要再更新了，踩了这么多坑也是醉了。。。
