/**
 * @desc:   公用js
 * @author: zhanxin.lin
 * @depend: jQuery, jQuery scrollTo
 */
$(document).ready(function(){var a={nodeName:"J-backTop",scrollHeight:"100",linkBottom:"110px",linkRight:"1em",_scrollTop:function(){if(jQuery.scrollTo){jQuery.scrollTo(0,800,{queue:true})}},_scrollScreen:function(){var c=this,b=$("#"+c.nodeName);if(jQuery(document).scrollTop()<=c.scrollHeight){b.hide();return true}else{b.fadeIn()}},_resizeWindow:function(){var d=this,b=$("#"+d.nodeName);if($(window).width()>1024){var c=$(window).width()/2+400;b.css({right:"",left:c+"px",bottom:d.linkBottom})}else{b.css({left:"",right:d.linkRight,bottom:d.linkBottom})}},run:function(){var c=this,b=$('<a id="'+c.nodeName+'" href="#" class="toTop"><i class="fa fa-chevron-up"></i></a>');b.appendTo($("body"));b.css({display:"none",position:"fixed",left:"",right:c.linkRight,bottom:c.linkBottom});c._resizeWindow();if(jQuery.scrollTo){b.click(function(){c._scrollTop();return false})}jQuery(window).resize(function(){c._scrollScreen();c._resizeWindow()});jQuery(window).scroll(function(){c._scrollScreen()})}};a.run()});
/* =============================================================================
#     FileName: codepiano.js
#         Desc: javascript for blog
#       Author: codepiano
#        Email: codepiano.li@gmail.com
#     HomePage: http://www.weibo.com/anyexingchen
#      Version: 0.0.1
#   LastChange: 2013-05-12 01:39:30
#      History:
============================================================================= */
/* 页面加载后执行 */
!function ($) {
  $(function(){

    /* 目录页导航 */
    var url = window.location.href;
    if(url.indexOf('categories.html') > -1){
      $('#categories-nav a').click(function (e){
        $(this).tab('show');
      });

      /* 自动打开链接中的锚点 */
      var matches = url.match(/categories\.html(#.*)/);
      if(matches){
        $('#categories-nav a[href="' + matches[1] + '"]').tab('show');
      }else{
        $('#categories-nav a:first').tab('show');
      }
    }

   });

}(window.jQuery);

