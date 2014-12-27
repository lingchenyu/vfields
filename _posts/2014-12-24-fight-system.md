---
layout: post
title: 传说中的战斗系统
description: 2014想做的最后一件事，一个超简单的rpg战斗模拟
categories: [java]
icon: code
---

&nbsp;&nbsp; 2014想做的第3件算是差不多了吧，虽然暂时还是做得比较烂，但其实也差不多达到我想要的效果了。如下：

<img src="/images/20141224/fight.gif" alt="战斗系统效果图" />

&nbsp;&nbsp;现在只是做了两个战斗角色进行战斗，多个的话，后端是可以支持的，但前端怎么显示还没折腾好。这个gif有点粗糙，还有那个特效是我随意偷过来的，在释放技能的时候，就播放一下，其实没神马意思，只是有时候不知道下一步怎么走的时候，就随意写一个循环嘚瑟一下，所以，不要注意细节。下面是它的流程图：

<img src="/images/20141224/fight-flow-chart.png" alt="战斗系统流程图" />

&nbsp;&nbsp;主要是读取excel表，然后根据流程图的节奏，开打，下面是excel表的数据截图：

<img src="/images/20141224/fight-excel-data.png" alt="战斗数据来源截图" />

&nbsp;&nbsp;根据流程图，其实最主要是根据各种属性判断命中、伤害、暴击等，然后技能进入冷却，而公式暂时是做的比较烂的，毕竟朕只是一个后端程序员，而不是一个数值，而且经验神马的还不够，公式是我乱配的，所以，不要问我为神马是酱紫的，公式如下：

<div class="article_content">
  <textarea name="code" class="html" >
##战力=攻击*1.3+防御*1.8+生命*1.1+速度*0.5+命中*1+闪避*1+暴击*2.1+韧性*2.1
#attack:攻击
#defense
#hp
#speed
#hit
#dodge
#crit
#tough
playerScore=#{attack} * 1.3 + #{defense} * 1.8 + #{hp} * 1.1 + #{speed} * 0.5 + #{hit} * 1 + #{dodge} * 1 + #{crit} * 2.1 + #{tough} * 2.1


##=========================战斗命中============================
##命中概率10000则表示100%命中
##命中概率=基础命中率 + (攻击方命中值 - 防御方的闪避值) * 1.1 + (攻击方战力 - 防御方战力)
#attackHit:攻击方命中值
#enemyDodge:防御方的闪避值
#srcScore:攻击方战力
#enemyScore:防御方战力
hitRate=9000 + (#{attackHit} - #{enemyDodge}) * 1.1 + #{srcScore} - #{enemyScore}

##=========================战斗暴击============================
##暴击概率10000则表示100%暴击
##暴击概率=攻击方的暴击值 - 防御方的韧性值
#attackCrit:攻击方的暴击值
#enemyTough:防御方的韧性值
critRate=#{attackCrit} - #{enemyTough}

##=========================战斗伤害============================
##总公式=(攻方的攻击力 * 0.9 / (1 + 防方的防御力 * 0.1)) * 技能加成
#srcAttack:攻方的攻击力
#enemyDefense:防方的防御力
#skillHurt:技能附加伤害
hurt=(#{srcAttack} * 0.9 / (1 + #{enemyDefense} * 0.1)) * #{skillHurt}
  </textarea>
</div>

&nbsp;&nbsp;下一步应该是看一下netty源码，在搭好通信之后，把这个系统扩展成一个简单的游戏，这时候其实主要的系统就是任务系统和世界boss等；最后做一个简单的管理后台，这时候可以去学<code>js</code>、<code>css</code>，最重要的是要学习<code>mysql</code>。我想，我是停不下了吧。我也不知道，只是想学。。。
