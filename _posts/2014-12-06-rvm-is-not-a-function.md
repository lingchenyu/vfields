---
layout: post
title: RVM is not a function 
description: RVM is not a function, selecting rubies with 'rvm use ...' will not work. 
categories: [ubuntu]
icon: code
---

&nbsp;&nbsp;报错如下：     

<div>
<textarea name="code" class="html" >
wait@ubuntu:~$ rvm use 2.0.0

RVM is not a function, selecting rubies with 'rvm use ...' will not work.

You need to change your terminal emulator preferences to allow login shell.
Sometimes it is required to use `/bin/bash --login` as the command.
Please visit https://rvm.io/integration/gnome-terminal/ for an example.
</textarea>
</div>

&nbsp;&nbsp;解决办法主要是添加环境变量，网上也有很多其他的解决办法，我是用这个解决的，如下：

<textarea name="code" class="html" >
wait@ubuntu:~$ export PATH="$PATH:$HOME/.rvm/bin" 
[[ -s "$HOME/.rvm/scripts/rvm" ]] && source "$HOME/.rvm/scripts/rvm"
</textarea>
