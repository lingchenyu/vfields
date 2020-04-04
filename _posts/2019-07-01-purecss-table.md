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

<pre class="prettyprint">
<icode class="html">&lt;html lang="zh"&gt;
&lt;head&gt;
    &lt;title&gt;测试&lt;/title&gt;
    &lt;link rel="stylesheet" href="https://unpkg.com/purecss@1.0.0/build/pure-min.css"
          integrity="sha384-nn4HPE8lTHyVtfCBi5yW9d20FjT8BJwUXyWZT9InLYax14RDjBj46LmSztkmNP9w" crossorigin="anonymous"&gt;
    &lt;!--[if lte IE 8]&gt;
        &lt;link rel="stylesheet" href="https://unpkg.com/purecss@1.0.0/build/grids-responsive-old-ie-min.css"&gt;
    &lt;![endif]--&gt;
    &lt;!--[if gt IE 8]&gt;&lt;!--&gt;
        &lt;link rel="stylesheet" href="https://unpkg.com/purecss@1.0.0/build/grids-responsive-min.css"&gt;
    &lt;!--&lt;![endif]--&gt;
&lt;/head&gt;
&lt;style&gt;
    body {
        background-color: #d1d1d1;
    }

    .content {
        margin: 30px auto;
    }

    .pure-table {
        margin: 0 auto;
        width: 80%;
        border: 0;
        background-color: #f3f3f3;
        box-shadow: 1px 2px 5px rgba(0, 0, 0, .1);
    }
    .pure-g {
        letter-spacing: 0;
    }
&lt;/style&gt;
&lt;body&gt;
&lt;div class="pure-g "&gt;
    &lt;div class="pure-u-xl-3-5 pure-u-lg-22-24 pure-u-md-22-24 pure-u-sm-23-24 pure-u-23-24 content"&gt;
        &lt;table class="pure-table pure-table-bordered"&gt;
            &lt;thead&gt;
            &lt;tr&gt;
                &lt;td&gt;描述&lt;/td&gt;
                &lt;td&gt;指令&lt;/td&gt;
            &lt;/tr&gt;
            &lt;/thead&gt;
            &lt;tbody&gt;
            &lt;tr&gt;
                &lt;td&gt;描述1&lt;/td&gt;
                &lt;td&gt;指令1&lt;/td&gt;
            &lt;/tr&gt;
            &lt;/tbody&gt;
        &lt;/table&gt;
    &lt;/div&gt;
&lt;/div&gt;
&lt;/body&gt;
&lt;/html&gt;</icode>
</pre>

代码为了节省版面，删掉了两行数据。
