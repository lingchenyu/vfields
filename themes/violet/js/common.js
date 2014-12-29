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
/** 目录页切换(从bootstrap里面拷贝出来的一个函数) */
!function(e) {
    "use strict";
    var t = function(t) {
        this.element = e(t)
    };
    t.prototype = {constructor: t,show: function() {
            var t = this.element, n = t.closest("ul:not(.dropdown-menu)"), r = t.attr("data-target"), i, s, o;
            r || (r = t.attr("href"), r = r && r.replace(/.*(?=#[^\s]*$)/, ""));
            if (t.parent("li").hasClass("active"))
                return;
            i = n.find(".active:last a")[0], o = e.Event("show", {relatedTarget: i}), t.trigger(o);
            if (o.isDefaultPrevented())
                return;
            s = e(r), this.activate(t.parent("li"), n), this.activate(s, s.parent(), function() {
                t.trigger({type: "shown",relatedTarget: i})
            })
        },activate: function(t, n, r) {
            function o() {
                i.removeClass("active").find("> .dropdown-menu > .active").removeClass("active"), t.addClass("active"), s ? (t[0].offsetWidth, t.addClass("in")) : t.removeClass("fade"), t.parent(".dropdown-menu") && t.closest("li.dropdown").addClass("active"), r && r()
            }
            var i = n.find("> .active"), s = r && e.support.transition && i.hasClass("fade");
            s ? i.one(e.support.transition.end, o) : o(), i.removeClass("in")
        }};
    var n = e.fn.tab;
    e.fn.tab = function(n) {
        return this.each(function() {
            var r = e(this), i = r.data("tab");
            i || r.data("tab", i = new t(this)), typeof n == "string" && i[n]()
        })
    }, e.fn.tab.Constructor = t, e.fn.tab.noConflict = function() {
        return e.fn.tab = n, this
    }, e(document).on("click.tab.data-api", '[data-toggle="tab"], [data-toggle="pill"]', function(t) {
        t.preventDefault(), e(this).tab("show")
    })
}(window.jQuery)

