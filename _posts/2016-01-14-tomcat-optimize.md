---
layout: post
title: Tomcat优化记录
description: 记录Tomcat的一些小优化，记录下来以后好找。
categories: java
icon: code
---
### 1、静态资源使用nginx代理 ###
&nbsp;&nbsp;  <xcode>nginx</xcode>配置，端口神马的只是示例。这里这个<xcode>X-Real-IP</xcode>在后面<xcode>Tomcat</xcode>的<xcode>access_log</xcode>有用到。

{% highlight nginx %}
http {

    upstream local_tomcat {
        server localhost:8080;
    }
    
    server {
        listen       8082;
        server_name  localhost;

        location / {
            proxy_pass http://127.0.0.1:8080;
            # 设置代理服务器ip头，代码获取时的参数
            proxy_set_header X-forwarded-for $proxy_add_x_forwarded_for;
            # 允许将发送到被代理服务器的请求头重新定义或者增加一些字段，显示真实的客户端的IP
            proxy_set_header X-Real-IP  $remote_addr;
        }
        location ~ \.jsp$ {
            proxy_pass http://127.0.0.1:8080;
        }
		
        location ~ \.(html|js|css|png|gif|jpg|gif|swf|ico)$ {
	    root /usr/local/tomcat/ROOT;
        }
    }
}
{% endhighlight %}

### 2、访问日志记录真实IP ###
&nbsp;&nbsp;  这里配置有个问题，就是没有热部署，找了挺多资料也还没搞掂，还在折腾中╮(╯▽╰)╭

{% highlight xml %}
<Host name="localhost" appBase="webapps" unpackWARs="true" autoDeploy="true" deployOnStartup="false">
    <!--这里的docBase路径改到非webapps目录, 否则会导致初始化两次-->
	<Context path="/" docBase="/usr/local/tomcat/apps/xxxxx" debug="0" privileged="true" reloadable="true"/>
    <!--远程主机ip 访问时间 HTTP请求的第一行 HTTP状态码 处理请求所耗费的毫秒数-->
    <Valve className="org.apache.catalina.valves.AccessLogValve" directory="logs"
           prefix="access_log" suffix=".txt"
           pattern="%{X-Real-IP}i  %t &quot;%r&quot; %s %D" />
</Host>
{% endhighlight %}

### 3、隐藏Tomcat版本号 ###
&nbsp;&nbsp;  这个就比较简单了。但是修改必须要先关闭<xcode>Tomcat</xcode>，要不然会报找不到<xcode>org.catalina.core</xcode>包的一些类，不要问我怎么知道的，真的，我出手很重！！！！

{% highlight shell %}
mkdir test
cd test
jar xf ../catalina.jar
vi org/apache/catalina/util/ServerInfo.properties
server.info=Svr
server.number=2
server.built=Jan 10 2015 15:52:20 UTC
jar cf ../catalina.jar ./*
cd ..
rm -rf test
{% endhighlight %}

### 4、在webapp关闭时释放内存 ###
&nbsp;&nbsp;  因为使用了<xcode>DbUtils</xcode>和<xcode>Logback</xcode>的异步邮件发送，所以在关闭的时候需要手动释放。
&nbsp;&nbsp;  可能<xcode>Logback</xcode>的释放再搞一个<xcode>try...catch</xcode>比较好，但一直用下来没什么问题，就先这样了。

<pre class="prettyprint">
<icode class="java">@Service
public class DisposeService implements DisposableBean {

    @Override
    public void destroy() throws Exception {
        try {
            Enumeration&lt;Driver&gt; drivers = DriverManager.getDrivers();
            while (drivers.hasMoreElements()) {
                Driver driver = drivers.nextElement();
                try {
                    DriverManager.deregisterDriver(driver);
                    System.out.printf("unregister jdbc driver: [%s]\n", driver);
                } catch (SQLException e) {
                    System.out.printf("Error unregister driver: [%s]\n ", driver);
                }
            }
        } catch (Exception e) {
            System.out.printf("unregister driver problem : [%s]\n", e.getMessage());
        }
        try {
            AbandonedConnectionCleanupThread.shutdown();
            System.out.println("AbandonedConnectionCleanupThread shutdown");

            ((LoggerContext) LoggerFactory.getILoggerFactory()).stop();
        } catch (InterruptedException e) {
            System.out.printf("SEVERE problem cleaning up: [%s]\n", e.getMessage());
        }
    }
}
</icode>
</pre>

&nbsp;&nbsp;  完。
