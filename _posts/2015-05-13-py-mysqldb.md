---
layout: post
title: Commands out of sync; you can't run this command now
description: _mysql_exceptions.ProgrammingError: (2014, "Commands out of sync; you can't run this command now")
categories: [python]
icon: code
---
报错内容如下：
  File "C:\Python27\lib\site-packages\MySQLdb\cursors.py", line 207, in execute
    if not self._defer_warnings: self._warning_check()
  File "C:\Python27\lib\site-packages\MySQLdb\cursors.py", line 110, in _warning_check
    warnings = self._get_db().show_warnings()
  File "C:\Python27\lib\site-packages\MySQLdb\connections.py", line 335, in show_warnings
    self.query("SHOW WARNINGS")
_mysql_exceptions.ProgrammingError: (2014, "Commands out of sync; you can't run this command now")