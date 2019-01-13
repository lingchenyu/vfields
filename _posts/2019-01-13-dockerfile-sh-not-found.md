---
layout: post
title: Docker运行报错"/bin/sh ./run.sh&#58; not found"
description: Docker运行报错"/bin/sh ./run.sh&#58; not found"或者"standard_init_linux.go：207&#58; exec user process caused"
categories: docker
icon: code
---

折腾了整整两天，终于解决了，感人励志。。。

一开始<xcode>Dockerfile</xcode>最后一行是：

{% highlight txt %}
CMD ./run.sh
{% endhighlight %}

打包运行遇到第一个报错如下：

{% highlight shell %}
docker@test:/bin$ docker run confsvr
/bin/sh: ./run.sh: not found
{% endhighlight %}

然后改成：
{% highlight txt %}
CMD ["./run.sh"]
{% endhighlight %}

之后， 报错变成了
{% highlight shell %}
docker@test:/bin$ docker run confsvr
standard_init_linux.go:207: exec user process caused "no such file or directory"
{% endhighlight %}

其实都是因为含有特殊字符<xcode>^M</xcode>引起的，用<xcode>cat -v</xcode>可以看到文件中的非打印字符：

{% highlight shell %}
$ cat -v run.sh
#!/bin/sh^M
^M
echo "********************************************************"^M
echo "Waiting for the eureka server to start  on port $EUREKASERVER_PORT"^M
echo "********************************************************"^M
while ! `nc -z eurekaserver $EUREKASERVER_PORT`; do sleep 3; done^M
echo ">>>>>>>>>>>> Eureka Server has started"^M
^M
echo "********************************************************"^M
echo "Starting Configuration Service with Eureka Endpoint:  $EUREKASERVER_URI";^M
echo "********************************************************"^M
{% endhighlight %}


解决方法：
因为电脑装了<xcode>cygwin</xcode>，所以可以直接使用<xcode>dos2unix</xcode>转换：

{% highlight shell %}
wait@404-pc /cygdrive/d/gitcode/inaction/spmia-chapter5/confsvr/src/main/docker
$ dos2unix Dockerfile
dos2unix: 正在转换文件 Dockerfile 为Unix格式...

wait@404-pc /cygdrive/d/gitcode/inaction/spmia-chapter5/confsvr/src/main/docker
$ dos2unix run.sh
dos2unix: 正在转换文件 run.sh 为Unix格式...
{% endhighlight %}

或者把文件上传到一个<xcode>centos</xcode>系统安装<xcode>dos2unix</xcode>，转换完成后再替换本地的。

参考链接

[GitHub](https://github.com/docker/labs/issues/215#issuecomment-301784510)


