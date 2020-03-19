---
layout: post
title: jQuery用DataTables过滤和搜索
description: DataTables自定义搜索和显示列、隐藏列
categories: javascript
icon: code
---
现在估计都在用<xcode>Vue</xcode>了，但为了兼容以前的老项目，折腾了一下，支持选择某些列搜索，隐藏列，结果如下图：
<img src="/images/20200319/20200319.png" alt="DataTables自定义效果图"/>

代码优化空间比较大，但暂时先这样，如下：
{% highlight html %}
<html>
<head>
    <link rel="stylesheet" type="text/css" href="https://cdn.datatables.net/1.10.20/css/jquery.dataTables.css">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/jquery.sumoselect/3.0.2/sumoselect.min.css">
    <link rel="stylesheet" href="https://unpkg.com/purecss@1.0.1/build/pure-min.css"
          integrity="sha384-oAOxQR6DkCoMliIh8yFnu25d7Eq/PHS21PClpwjOTeU2jRSq11vu66rf90/cZr47" crossorigin="anonymous">
    <style>
        .content {
            margin: 10px auto;
            max-width: 900px;
        }

        .SumoSelect {
            text-align: left;
            vertical-align: middle;
        }

        .search-bar {
            margin-top: .5em;
            padding: .5em;
            border: 1px solid #aaa;
            border-radius: .5em;
        }

        .search-bar input[type="checkbox"] + label {
            display: inline-block;
            vertical-align: middle;
            width: 12em;
            margin: 0 0 0 .2em;
        }

        .search-bar input[type="checkbox"] {
            display: none;
        }

        .search-bar input[type="checkbox"] + label::before {
            width: 15px;
            height: 15px;
            border-radius: 2px;
            border: 2px solid #8cad2d;
            background-color: #fff;
            display: block;
            content: "";
            float: left;
            margin-right: 5px;
        }

        .search-bar input[type="checkbox"]:checked + label::before {
            box-shadow: inset 0 0 0 3px #fff;
            background-color: #8cad2d;
        }

        .dataTables_filter {
            display: none;
        }


    </style>
</head>
<body>
<div class="pure-g content">
    <div class="pure-u-x1-22-24 pure-g-lg-22-24 pure-u-md-22-24 pure-u-sm-23-24 pure-u-23-24">
        <div class="search-bar pure-form">
            <label>选择搜索列</label>
            <select id="filterBox" multiple="multiple" placeholder="要搜索的列" class="SlectBox">
                <option value="0">Column 1</option>
                <option value="1">Column 2</option>
                <option value="2">Column 3</option>
            </select>
            <input type="text" id="searchTxt" placeholder="关键词" class="pure-input-rounded">
            <button id="search" type="button" class="pure-button pure-button-primary">搜索</button>
            <button id="reset" type="button" class="pure-button pure-button-primary">重置</button>
            <input id="showC3" type="checkbox">
            <label for="showC3">显示Column 3</label>
        </div>
        <table id="table_id" class="display">
            <thead>
            <tr>
                <th>Column 1</th>
                <th>Column 2</th>
                <th>Column 3</th>
            </tr>
            </thead>
            <tbody>
            <tr>
                <td>Row 1 Data 11</td>
                <td>Row 1 Data 12</td>
                <td>Row 1 Data 13</td>
            </tr>
            <tr>
                <td>Row 2 Data 21</td>
                <td>Row 2 Data 22</td>
                <td>Row 2 Data 23</td>
            </tr>
            </tbody>
        </table>
    </div>
</div>
<script type="text/javascript" charset="utf8"
        src="https://cdnjs.cloudflare.com/ajax/libs/jquery/3.4.1/jquery.min.js">
</script>
<script type="text/javascript" charset="utf8"
        src="https://cdn.datatables.net/1.10.20/js/jquery.dataTables.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/jquery.sumoselect/3.0.2/jquery.sumoselect.min.js"></script>
<script type="text/javascript">
    let searchCols = null;
    let searchTxt = '';
    $.fn.dataTable.ext.search.push(
        function (settings, data, dataIndex) {
            if (searchCols == null) {
                return true;
            }
            const len = searchCols.length;
            if (len < 1 || searchTxt === '') {
                return true;
            }
            for (let i = 0; i < len; i++) {
                const d = data[searchCols[i]];
                if (d === searchTxt || d.includes(searchTxt)) {
                    return true;
                }
            }
            return false;
        }
    );
    $(document).ready(function () {
        const table = $('#table_id').DataTable({
            "scrollY": "530px",
            "scrollCollapse": false,
            "paging": false,
            "ordering": false,
            "responsive": true,
            "orderClasses": false,
            "deferRender": false,
            "info": false,
            "columnDefs": [
                {
                    "targets": [2],
                    "visible": false
                }
            ]
        });

        const box = $('#filterBox');
        box.SumoSelect({
            csvDispCount: 2,
            selectAll: true
        });
        box[0].sumo.selectAll();

        $('#search').click(function () {
            var columns = $('#filterBox').val();
            if (!columns || columns.length < 1) {
                return;
            }
            searchCols = columns;
            searchTxt = $('#searchTxt').val();
            table.draw();
        });
        $('#reset').click(function () {
            var box = $('#filterBox');
            box[0].sumo.selectAll();
            $('#searchTxt').val('');
            searchTxt = '';
            searchCols = box.val();
            table.draw();
        });
        $('#showC3').click(function () {
            const column = table.column(2);
            column.visible(!column.visible());
        });
        window.onresize = function (ev) {
            table.draw();
        }
    });
</script>
</body>
</html>

{% endhighlight %}