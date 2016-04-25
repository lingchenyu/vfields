---
layout: post
title: 1号店图片抓取
description: 抓取1号店的商品展示图片
categories: python
icon: code
---
&nbsp;&nbsp;最终效果图如下：
<img src="/images/20150425/grab-02.png" alt="抓取图片结果"/>


&nbsp;&nbsp;挺简单的抓取1号店的商品展示图片代码，其中抓取的图片位置为：

<img src="/images/20150425/grab-01.png" alt="抓取图片的位置"/>

&nbsp;&nbsp;其实真实代码挺简单，只是刚开始折腾，神马都不懂，o(︶︿︶)o 唉

&nbsp;&nbsp;展示区域一排50 * 50小图标与<code>html</code>标签位置对应关系如下：
<img src="/images/20150425/grab-06.png" alt="展示区与html标签对应关系"/>

&nbsp;&nbsp;在这一排小图标上，当鼠标移上去时，会出现大图，这个大图的链接其实是通过<code>js</code>生成的，截图如下：
<img src="/images/20150425/grab-05.png" alt="展示区与html标签对应关系"/>

&nbsp;&nbsp;所以我们只要按流程对小图的链接进行拼接就妥了。不过我偷了很多懒，直接就取了<code>__600x600</code>，没有去做判断：

<div class="article_content">
<textarea name="code" class="js" >
    if (detailparams.isBGCloth == 1) {
        n = "_600x600";
        y = "_332*464"
    }
</textarea>
</div>
&nbsp;&nbsp;最终代码如下：

<div class="article_content">
<textarea name="code" class="python" >
#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""
__title__ = ''
__author__ = 'wait'
__time__ = '2015/4/25'
"""

import os
from xlrd import open_workbook
import requests
from lxml import etree
import urllib


def download_img():
    book = open_workbook("./product.xls")
    top_dir = "./image/"
    if not os.path.isdir(top_dir):
        os.mkdir(top_dir)
    # 读取所有sheet
    for sheet in book.sheets():
        mid_dir = top_dir + sheet.name + "--"
        row_num = sheet.nrows
        cur_row = 1
        while cur_row < row_num:
            image_dir = sheet.cell(cur_row, 0).value
            # 去掉路径不合法字符
            image_dir = image_dir.replace("/", "-")
            image_dir = image_dir.replace("*", "x")
            now_dir = mid_dir + image_dir
            now_dir = now_dir.strip()
            if not os.path.isdir(now_dir):
                os.mkdir(now_dir)
            if os.path.isdir(now_dir):
                url = sheet.cell(cur_row, 6).value
                r = requests.get(url)
                page = etree.HTML(r.text)
                image_urls = page.xpath("//div[@id='jsproCrumb']/div[@class='hideBox']/div[@class='mBox clearfix']/b/img")
                print 'image:', image_urls
                index = 1
                for href in image_urls:
                    z = href.attrib['src']
                    n = "_600x600"
                    suffix = z[z.rindex("."):len(z)]
                    c = z[0:z.rindex("_")] + n + suffix
                    urllib.urlretrieve(c, now_dir + "/" + str(index) + suffix)
                    index += 1
                    print c
                # print url
            cur_row += 1


def main():
    download_img()


if __name__ == '__main__':
    main()
</textarea>
</div>

&nbsp;&nbsp;其中<code>product.xls</code>的结构图如下：
<img src="/images/20150425/grab-07.png" alt="product.xls结构图"/>

&nbsp;&nbsp;这样写出来不知道会不会被打= =，想家了。。。
