---
layout: post
title: 用purecss展示表格
description: 一个html，里面内容就是一个table
categories: css
icon: code
---

可能需求过于简单，搜索了挺久都没有自己想要的。需求很简单，一页<xcode>html</xcode>里面就只有一张表格，背景色不要太亮，然后不要太难看。

后来自己动手折腾的效果如下：

<img src="/images/20190701/purecss.png" alt="purecss显示表格效果图"/>

代码也比较简单，如下：

{% highlight html %}
<html lang="zh">
<head>
    <title>测试</title>
    <link rel="stylesheet" href="https://unpkg.com/purecss@1.0.0/build/pure-min.css"
          integrity="sha384-nn4HPE8lTHyVtfCBi5yW9d20FjT8BJwUXyWZT9InLYax14RDjBj46LmSztkmNP9w" crossorigin="anonymous">
    <!--[if lte IE 8]>
        <link rel="stylesheet" href="https://unpkg.com/purecss@1.0.0/build/grids-responsive-old-ie-min.css">
    <![endif]-->
    <!--[if gt IE 8]><!-->
        <link rel="stylesheet" href="https://unpkg.com/purecss@1.0.0/build/grids-responsive-min.css">
    <!--<![endif]-->
</head>
<style>
    body {
        background-color: #d1d1d1;
    }

    .content {
        margin: 30px auto;
        background-color: #f3f3f3;
        box-shadow: 1px 2px 5px rgba(0, 0, 0, .1);
    }

    .pure-table {
        width: 100%;
		border: 0;
    }
    .pure-g {
        letter-spacing: 0;
    }
</style>
<body>
<div class="pure-g ">
    <div class="pure-u-xl-3-5 pure-u-lg-22-24 pure-u-md-22-24 pure-u-sm-23-24 content">
        <table class="pure-table pure-table-bordered">
            <thead>
            <tr>
                <td>描述</td>
                <td>指令</td>
            </tr>
            </thead>
            <tbody>
            <tr>
                <td>描述1</td>
                <td>指令1</td>
            </tr>
            </tbody>
        </table>
    </div>
</div>
</body>
</html>
{% endhighlight %}

代码为了节省版面，删掉了两行数据。
