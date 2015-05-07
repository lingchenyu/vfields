---
layout: post
title: tomcat的hs_err_pid日志
description: tomcat部署在阿里云服务器每小时产生一个<code>hs_err_pid.log</code>文件
categories: [java]
icon: code
---
&nbsp;&nbsp;最近写了一个<code>web</code>的应用，部署在阿里云服务器上。但设置了虚拟目录，使用<code>war</code>的方式进行部署之后，就每个小时产生一个<code>hs_err_pid*.log</code>的文件，截图如下：
<img src="/images/20150507/2015-05-07_1.png" alt="阿里云服务器log截图"/>
&nbsp;&nbsp;搜了挺多资料，但都没有解决方案，折腾了两天无解，忧桑。。。。
&nbsp;&nbsp;但基本可以确定的是，这是阿里云服务器里面的进程报的错，因为里面有一段是这样的：

<div class="article_content">
<textarea name="code" class="txt" >
    Internal exceptions (1 events):
    Event: 0.025 Thread 0x00007f32e8009800 Threw 0x00000000db80f2c8 at /HUDSON/workspace/7u-2-build-linux-amd64/jdk7u79/2331/hotspot/src/share/vm/prims/jni.cpp:3991
</textarea>
</div>
&nbsp;&nbsp;这个<code>/HUDSON/workspace</code>绝逼不是朕的东西！！！
&nbsp;&nbsp;突然想起刚刚部署的时候，新手 + 图方便的原因，开了<code>tomcat</code>的<code>manager</code>，可以直接在本地上传<code>war</code>部署。然后服务器就被阿里云说检测到存在后门。然后去看了一下<code>localhost_access_log</code>，发现每隔一段时间，会有一个固定的<code>ip</code>过来扫描检测。如下：
<img src="/images/20150507/2015-05-07_2.png" alt="阿里云服务器检测扫描截图"/>
&nbsp;&nbsp;这个<code>ip</code>来自于：
<img src="/images/20150507/2015-05-07_3.png" alt="ip来源"/>
&nbsp;&nbsp;所以，感觉是因为tomcat的部署方式存在漏洞，被阿里云检测到了，然后阿里云尝试攻陷这个漏洞，但可能因为开启内存过小或者权限不足等，导致了异常，也可能是一种预警。因为之前被<code>deploy</code>过一个<code>Xiaozhe.war</code>。但是这个应用刚好被我及时发现删掉了。所以猜测阿里云在利用暴力方式想继续利用这个漏洞。或者是尝试使用另一种方式来测试<code>tomcat</code>的后门，这种方式的可能性可能大一点。
&nbsp;&nbsp;之前看过解决方法是把<code>jdk</code>升级为1.8。但我觉得这不是解决方法。然后我在想如果禁掉<code>war</code>的部署方式是否能终结这个问题。

###### 1、禁掉war的部署方式######
&nbsp;&nbsp;把<code>unpackWARs</code>和<code>autoDeploy</code>改为<code>false</code>，可能后面的这一个不需要改。但我想的是，如果每次都自动部署，比较容易导致<code>PermGen</code>溢出。所以基本每次都是停掉<code>tomcat</code>然后重新部署的。可能以后会搞个脚本，或者找到更好的方式，暂时比较菜，先酱紫吧= =
<img src="/images/20150507/2015-05-07_4.png" alt="阿里云服务器log截图"/>
###### 2、修改部署方式######
把<code>${CALANIA_HOME}/conf/server.xml</code>的这一行<code><Context docBase="/xxpath/xx.war" path="/xx" reloadable="true"/></code>修改为<code><Context docBase="/xxpath/xx" path="/xx" reloadable="true"/></code>

&nbsp;&nbsp;设置完成之后，暂时已经两次没有出现那个<code>log</code>了。
&nbsp;&nbsp;经过这次折腾，终于认识到网络安全的重要性。当初看到<code>tomcat</code>服务器里面多了一个应用，顿时就头皮发麻，我靠，这就遇上了，以后还要不要写代码了，还要不要活了= =
&nbsp;&nbsp;后来发现是阿里云的检测，才终于淡定，然后去看了一下关于安全方面的设置，重新设置了一下，在这过程中熟悉了很多<code>linux</code>的指令和关于<code>tomcat</code>的一些部署步骤等等。这个说起来比较长，有空再写吧。总的来说，还是很感谢这次神奇的<code>log</code>的