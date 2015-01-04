---
layout: post
title: gcj43在windows下编译swt项目
description: 把Java项目用gcj编译成exe文件从而脱离jvm
categories: [java]
icon: code
---
&nbsp;&nbsp;  现在应该已经没有人会用这种过期的东东了，而且网上也一大堆人说<code>Java</code>不应该用于做应用程序，说不符合<code>Java</code>跨平台或者不是<code>Java</code>的长项等等。但有时候有朋友让我帮忙做一个很简单的只是单纯套用公式的应用，让我在短时间去学<code>c++</code>或者<code>c#</code>也有点难度，所以就还是冒着被鄙视的风险，把<code>Java</code>用gcj编译成exe文件。当然，最后还是让我折腾出来了。
   
&nbsp;&nbsp;  首先分享一下经验:           

###### 1、版本 ######                
&nbsp;&nbsp;  现在在<code>windows</code>系统能下载到的版本暂时是<code>gcj43</code>，下载地址（我下载的是[GCC/GCJ 4.3](http://www.thisiscool.com/gcc_mingw.htm#gcj43))   

<textarea name="code" class="html" >
http://www.thisiscool.com/gcc_mingw.htm
</textarea>
&nbsp;&nbsp; 当然，在<code>Ubuntu</code>下的系统比这个要高一点。而且能兼容1.7，还是比较给力的，只不过，让朕做应用程序的人用的是windows系统，所以还是踏踏实实在windows下编译吧。(＞﹏＜) 

###### 2、使用 ######
&nbsp;&nbsp;  windows系统下<code>gcj43</code>根据我的折腾发现，<font class="red">只支持到jdk1.4</font>，这个就比较肉痛了。<font class="red">这意味着不能使用泛型（也就是很多地方要自己强制类型转换一下），还有一些Java的语法糖也不能用（这里遇到的主要是自动装箱和拆箱），还有不能使用正则</font>。这个是我自己暂时折腾到结果，具体是否是因为我打开的方式错了，要根据大神的结论。所以<code>String</code>里面的<code>spilt</code>和<code>replaceAll</code>等用到正则的方法，是我自己实现的。

&nbsp;&nbsp; 下面首先介绍如何编译<code>gcj43</code>目录里面<code>example</code>里面<code>swt demo</code>（前面其实就是<code>build.sh</code>文件里面的内容，但后面内容会包括一起打包dll文件）：           

*   首先下载完<code> gcc43-20061204.tar.tar</code>后，解压到某一个目录，并将<code>bin</code>文件夹添加到环境变量中，这个比较简单，就不一一介绍了   
*   然后切换到<code>examples\HelloSWT</code>目录下，先练一下<code>examples</code>里面的项目。因为其实<code>gcc43\swt\win32\3218</code>这个目录有我们需要的编译脚本。<font color="red-strong">只是在这里有个天坑，就是这里路径明明是3218</font>
<img src="/images/20141207/gcj-win01.png" alt="gcj目录1"/>
&nbsp;&nbsp; 但在<code>examples\HelloSWT</code>目录下的<code>build.sh</code>文件里面编译的却是：
<img src="/images/20141207/gcj-win02.png" alt="gcj目录2"/>
&nbsp;&nbsp; <font color="blue">两个版本，也就是路径不一样，一开始在这里折腾了好久，最后知道真相之后眼泪都掉下来了。</font>把第二行的3138改成 3218之后，执行命令如下：
<img src="/images/20141207/gcj-win03.png" alt="gcj编译swt demo"/>
* 执行成功，而且完全木有报错有没有，但其实这时候你执行<code>HelloSWT.exe</code>是神马东西都木有的，即使你使用命令窗口执行，也是虾米都没有的，like this：
<img src="/images/20141207/gcj-win04.png" alt="gcj运行swt demo"/>
* 好吧，这里当时也搞得我崩溃了，后来查了很多资料，也连蒙带撞的，把<code>\swt\win32\3218</code>目录下的两个dll文件：<code>swt-gdip-win32-3218.dll</code>和<code>swt-win32-3218.dll</code>拷贝到<code>HelloSWT</code>文件夹下，才终于可以运行了，截图纪念一下：
<img src="/images/20141207/gcj-win05.png" alt="gcj成功运行swt demo"/>
* 但<font class="red">其实这时候会有一个问题</font>，就是一旦没有<code>dll</code>文件就不能运行了，而且以后要打包出去给其他人使用的时候，那两个<code>dll</code>文件看上去也有点累赘，如果能把<code>dll</code>文件打包进去<code>exe</code>文件中就好了。对于这个，可以用外部软件把<code>dll</code>文件打包进去。暂时折腾过的有两个软件，一个<code>MoleBox</code> ，这个软件只是帮忙绑在一起。而另一个软件 <code>EXE ResPacker</code>  除了把<code>dll</code>或者资源等打包进去之外，还可以对<code>exe</code>进行加密。但这两个软件都是收费的。我用的是<code>Molebox</code>打包，这里路径不用纠结，这是我为了备份，把<code>HelloSWT.exe</code>，还有两个<code>dll</code>文件额外拿出来折腾的。最后截图如下：
<img src="/images/20141207/gcj-win06.png" alt="MoleBox打包dll文件"/>

### 总结 ###
* 对于<code>build.sh</code>文件的两条命令，其实都比较好理解，对于第一条命令   

<textarea name="code" class="html" >
i686-pc-mingw32-gcj -c -o swtgif.o --resource=swt.gif swt.gif
</textarea>
  是把<code>swt.gif</code>文件编译成类似二进制文件，第二条命令比较长，                         

<textarea name="code" class="html" >
i686-pc-mingw32-gcj -s -fjni --main=HelloSWT -s --classpath ../../swt/win32/3218/swt.jar 
-o HelloSWT.exe HelloSWT.java swtgif.o -L../../swt/win32/3218 -Wl,--whole-archive -lswtimgloader 
-Wl,--no-whole-archive -lswt -mwindows
</textarea>


  最后一个选项，<code>-mwindows</code>，加了这个之后不会弹出那个命令行窗口，如果把这个选项去掉，执行命令：

<textarea name="code" class="html" >
i686-pc-mingw32-gcj -s -fjni --main=HelloSWT -s --classpath ../../swt/win32/3218/swt.jar 
-o HelloSWT.exe HelloSWT.java swtgif.o -L../../swt/win32/3218 -Wl,--whole-archive -lswtimgloader 
-Wl,--no-whole-archive -lswt
</textarea>


* 结果将会是这样子：
<img src="/images/20141207/gcj-win07.png" alt="gcj编译后带命令窗口"/>
* 而那个

<textarea name="code" class="html" >
-Wl,--whole-archive -lswtimgloader -Wl,--no-whole-archive -lswt
</textarea>

  前面主要是把所用东西打包，后面的<code>swtimgloader</code>是用于加载图片，把之前的图片加载进去成为<code>exe</code>文件的一部分。

* demo项目既然都跑通了，那么其实就已经成功一半了，不过可能还是要折腾一下子，下面把一个完整项目的命令发上来：    

<textarea name="code" class="html" >
i686-pc-mingw32-gcj -s -fjni --main=com.wait.calsoft.StartSoft -s --classpath lib/win32/swt.jar -o abc.exe
src/com/wait/calsoft/*.java src/com/wait/calsoft/cal/*.java src/com/wait/calsoft/UI/*.java
src/com/wait/calsoft/util/*.java src/logo.o -lswt -Llib/win32/ -Wl,--whole-archive -lswtimgloader -Wl,--no-whole-archive
-lswt -mwindows
</textarea>

  这个项目的目录结构如下：

<textarea name="code" class="html" >
│  swt-gdip-win32-3218.dll
│  swt-win32-3218.dll
│  
├─config  //这个目录是我的项目的配置文件目录
│      config.txt
│      lang.txt
│      testData.txt
│      
├─lib
│  └─win32 //这个目录其实是用gcc43/swt目录里面拷贝过来的
│          libswt.a
│          libswtimgloader.a
│          swt-gdip-win32-3218.dll
│          swt-win32-3218.dll
│          swt.jar
│          swt.o
│          
└─src
    │  logo.png
    │  logo.o // 由上面的png编译而成，读取代码：MainUI.class.getResourceAsStream("/logo.png"));
    │  
    └─com
        └─wait
            └─calsoft
                │  StartSoft.java
                │  
                ├─cal
                │      Calculator.java
                │      FormulaParser.java
                │      Operator.java
                │      
                ├─UI
                │      MainUI.java
                │      
                └─util
                        ExpressionNames.java
                        LangExpressionUtil.java
                        LangUtils.java
                        MixUtils.java
                        UINames.java
</textarea>

   = =一时找不到可以显示目录和文件的软件，就先用<code>tree</code>命令简单打印一下了

* 然后就可以运行了，但要保证<code>config</code>等外部资源的路径一致性，当然图片因为已经打包进去，就可以删掉，截图如下：
<img src="/images/20141207/gcj-win08.png" alt="项目成功运行截图"/>

* 最后再送上一个<code>ant</code>编译的<code>build.xml</code>文件，首先<code>Eclipse</code>的包结构如下图：
<img src="/images/20141207/gcj-win09.png" alt="项目成功运行截图"/>

* <code>build.xml</code>文件内容如下：     

<div class="article_content">
<textarea name="code" class="xml" >
<?xml version="1.0" encoding="UTF-8" standalone="no"?>
<project basedir="." default="calTest" name="cal-test">
	<property name="gcj" value="gcj" />
	<property name="dist" value="dist" />
	<property name="outputfile" value="outputfile.exe" />

	<target name="calTest">
		<antcall target="cleanCalTest">
		</antcall>
		<antcall target="buildCalTest">
		</antcall>
		<antcall target="runCalTest">
		</antcall>
	</target>

	<!-- 编译项目 -->
	<target name="buildCalTest" description="buildCalTest">
		<mkdir dir="${dist}" />
		<exec executable="${gcj}" dir="${basedir}/${dist}">
			<arg value="--main=com.wait.calsoft.StartSoft" />
			<arg value="-o" />
			<arg value="${outputfile}" />
			<arg value="../src/com/wait/calsoft/*.java" />
			<arg value="../src/com/wait/calsoft/cal/*.java" />
			<arg value="../src/com/wait/calsoft/UI/*.java" />
			<arg value="../src/com/wait/calsoft/util/*.java" />
			<arg value="../logo.o" />
			<arg value="-lswt" />
			<arg value="-L../lib/win32" />
			<arg value="--classpath=../lib/win32/swt.jar" />
			<arg value="-mwindows" />
		</exec>
	</target>

	<!-- 运行项目  -->
	<target name="runCalTest" if="${basedir}/${dist}/${outputfile}" description="runCalTest">
		<exec executable="${basedir}/${dist}/${outputfile}">
		</exec>
	</target>

	<!-- 清除项目 -->
	<target name="cleanCalTest" description="cleanCalTest">
		<delete file="${dist}/${outputfile}" />
	</target>
</project>
</textarea>
</div>

* 最后把<code>config</code>目录和两个<code>dll</code>文件拷贝过去，双击即可运行。
