---
layout: post
title: java的Runtime在windows系统下调用ping命令乱码 
description: java下调用windows的ping指令乱码
categories: [java]
icon: code
---
&nbsp;&nbsp; 最终解决乱码的代码如下：    

<textarea name="code" class="java" >
import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
 
public class TestRuntimeExec {
	public static void main(String[] args) {
		Runtime r = Runtime.getRuntime();
		Process p;
		try {
			p = r.exec("ping 127.0.0.1");
			BufferedReader br = new BufferedReader(new InputStreamReader(p.getInputStream(), "gbk"));
			String inline;
			while ((inline = br.readLine()) != null) {
				String string = new String(inline.getBytes());
				System.out.println(string);
			}
			br.close();
		} catch (IOException e) {
			e.printStackTrace();
		}
	}
}
</textarea>

&nbsp;&nbsp; 运行结果如下：
<img src="/images/20141207/java-runtime-encode01.png" alt="runtime乱码效果图"/>

<div class="article_content">
<textarea name="code" class="java" >
BufferedReader br = new BufferedReader(new InputStreamReader(p.getInputStream(), "gbk"));
</textarea>
</div>

&nbsp;&nbsp; 其实关键就是上面这一句里面的“gbk”，如果没有后面的”gbk“，那么结果如下：
<img src="/images/20141207/java-runtime-encode02.png" alt="runtime乱码效果图"/>

&nbsp;&nbsp;    虽然知道乱码的产生是因为编码的问题，但要找到正确的编码和在合适的位置加入编码格式，有折腾过半个钟，主要是因为自己技术太菜吧o(╯□╰)o
