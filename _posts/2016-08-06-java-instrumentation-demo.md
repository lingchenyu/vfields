---
layout: post
title: Java使用Instrumentation来进行热加载
description: Instrumentation里面有一个redefineClasses方法，可以用于热加载，折腾了一下
categories: java
icon: code
---
#### 项目结构 ####

<img src="/images/20160806/project-desc.png" alt="项目结构效果图"/>

用<code>tree /f</code>指令查看如下：

<div class="article_content">
<textarea name="dp-code" class="txt" >
│  pom.xml // maven项目pom文件
│          
├─src
│  ├─main
│  │  ├─java
│  │  │  └─com
│  │  │      └─wait
│  │  │          └─test
│  │  │                  JavaAgent.java // 用于接收Instrumentation的类
│  │  │                  Sky.java // 测试数据
│  │  │                  SkyData.java // 测试数据
│  │  │                  TestA.java // main class，执行热更，查看结果
│  │  │                  
│  │  └─resources
│  └─test
│      └─java
└─target
    │  w-1.0-SNAPSHOT.jar
    │  
    ├─classes
    │  └─com
    │      └─wait
    │          └─netty
    │                  JavaAgent.class
    │                  Sky.class
    │                  SkyData.class
    │                  TestA.class
</textarea>
</div>

#### 增加运行参数 ####
首先用<code>maven</code>生成<code>target/w-1.0-SNAPSHOT.jar</code>，接着编辑<code>Run-->Edit Configurations</code>，增加运行参数，如下图：
<img src="/images/20160806/edit-java-vm-command.png" alt="编辑java的运行参数"/>

#### 修改SkyData并编译 ####
修改<code>SkyData</code>里的<code>toString</code>方法如下（其实就是加了一句打印）：

<div class="article_content">
<textarea name="dp-code" class="java" >
    @Override
    public String toString() {
        System.err.println("=====================");
        return "SkyData{" +
                "number=" + number +
                ", skies=" + skies.hashCode() + "(" + skies + ")" +
                '}';
    }
</textarea>
</div>

<code>Ctrl+Shif+F9</code>重新编译<code>SkyData</code>，运行<code>TestA</code>，由于<code>TestA</code>是直接去读取<code>target</code>下的<code>class</code>文件，这样可以免去拷贝（我比较懒- -），运行结果如下：
<img src="/images/20160806/run-result.png" alt="运行结果"/>

其中，<code>TestA</code>的代码如下：
<div class="article_content">
<textarea name="dp-code" class="java" >
package com.wait.test;

import java.io.IOException;
import java.lang.instrument.ClassDefinition;
import java.lang.instrument.Instrumentation;
import java.lang.instrument.UnmodifiableClassException;
import java.nio.file.Files;
import java.nio.file.Paths;

/**
 * Created by wait on 2016/8/5.
 */
public class TestA {

    public static void main(String[] args) throws IOException, UnmodifiableClassException, ClassNotFoundException {
        SkyData skyData = new SkyData();
        skyData.add(); // 模拟进行了逻辑
        System.err.println(skyData);
        if (JavaAgent.getIns() != null) {
            byte[] data = Files.readAllBytes(Paths.get("E:/iwork/w/target/classes/com/wait/test/", "SkyData.class"));
            Instrumentation ins = JavaAgent.getIns();
            // 动态加载类, 只是为了测试写死, 用在真实项目的话, 可以把类名和byte数据通过socket等传进来
            ins.redefineClasses(new ClassDefinition(SkyData.class, data));
            System.err.println(skyData);
        }
    }
}
</textarea>
</div>

#### 注意点和收获 ####
* 在<code>pom</code>中自定义<code>MAINFEST.MF</code>。以前没折腾过，现在知道了。其中<code><Can-Redefine-Classes>true</Can-Redefine-Classes></code>这个参数一定要设置，要不然调用<code>redefineClasses</code>会抛出<code>UnsupportedOperationException</code>异常
<div class="article_content">
<textarea name="dp-code" class="xml" >
<plugin>
    <groupId>org.apache.maven.plugins</groupId>
    <artifactId>maven-jar-plugin</artifactId>
    <version>3.0.2</version>
    <configuration>
        <archive>
            <manifest>
                <mainClass>com.wait.test.TestA</mainClass>
            </manifest>
            <manifestEntries>
                <Premain-Class>com.wait.test.JavaAgent</Premain-Class>
                <Agent-Class>com.wait.test.JavaAgent</Agent-Class>
                <Can-Redefine-Classes>true</Can-Redefine-Classes>
                <Can-Retransform-Classes>true</Can-Retransform-Classes>
                <Boot-Class-Path>w-1.0-SNAPSHOT.jar</Boot-Class-Path>
            </manifestEntries>
        </archive>
    </configuration>
</plugin>
</textarea>
</div>

* 需要在<code>pom.xml</code>中增加这个，要不然打包会报找不到类定义的错。
<div class="article_content">
<textarea name="dp-code" class="xml" >
<profiles>
    <profile>
        <id>windows_profile</id>
        <activation>
            <os>
                <family>Windows</family>
            </os>
        </activation>
        <dependencies>
            <dependency>
                <groupId>com.sun</groupId>
                <artifactId>tools</artifactId>
                <version>1.8</version>
                <scope>system</scope>
                <systemPath>${java.home}/../lib/tools.jar</systemPath>
            </dependency>
        </dependencies>
    </profile>
</profiles>
</textarea>
</div>

* 这个<code>redefineClasses</code>有一个比较好的地方。

> This method does not cause any initialization except that which would occur under the customary JVM semantics

就是不会调用初始化，从<code>SkyData</code>的<code>toString</code>方法看来，里面的数据和引用都没有发生改变，而且我用过<code>Guice</code>测试过，调用<code>redefineClasses</code>之后的类，<code>Guice</code>里面也能直接生效。

* 又看了一下，发现这个<code>redefineClasses</code>还可以新增<code>private static/final</code>的方法，犀利。
<img src="/images/20160806/redefine-method-desc.png" alt="redefineClasses方法的功能"/>
参考：[JVM源码分析之javaagent原理完全解读](http://www.infoq.com/cn/articles/javaagent-illustrated)


[=====================代码下载=======================](/files/20160806/java-instrumentation-demo.zip)