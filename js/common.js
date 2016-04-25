/**
 * @desc:   公用js
 * @author: zhanxin.lin
 * @depend: jQuery, jQuery scrollTo
 */
$(document).ready(function(){var a={nodeName:"J-backTop",scrollHeight:"100",linkBottom:"110px",linkRight:"1em",_scrollTop:function(){if(jQuery.scrollTo){jQuery.scrollTo(0,800,{queue:true})}},_scrollScreen:function(){var c=this,b=$("#"+c.nodeName);if(jQuery(document).scrollTop()<=c.scrollHeight){b.hide();return true}else{b.fadeIn()}},_resizeWindow:function(){var d=this,b=$("#"+d.nodeName);if($(window).width()>1024){var c=$(window).width()/2+400;b.css({right:"",left:c+"px",bottom:d.linkBottom})}else{b.css({left:"",right:d.linkRight,bottom:d.linkBottom})}},run:function(){var c=this,b=$('<a id="'+c.nodeName+'" href="#" class="toTop"><i class="fa fa-chevron-up"></i></a>');b.appendTo($("body"));b.css({display:"none",position:"fixed",left:"",right:c.linkRight,bottom:c.linkBottom});c._resizeWindow();if(jQuery.scrollTo){b.click(function(){c._scrollTop();return false})}jQuery(window).resize(function(){c._scrollScreen();c._resizeWindow()});jQuery(window).scroll(function(){c._scrollScreen()})}};a.run()});
/** 广告点击显示/隐藏 */
$(document).ready(function(){
	var ad = $('#ad');

	$('#ad h6').click(function(){
		var anim	= {		
			mb : 0,			// Margin Bottom
			pt : 25			// Padding Top
		};
		
		var el = $(this).find('.arrow');
		
		if(el.hasClass('down')){
			anim = {
				mb : -270,
				pt : 10
			};
		}
		
		ad.stop().animate({marginBottom: anim.mb});
		
		ad.find('.section').stop().animate({paddingTop:anim.pt},function(){
			el.toggleClass('down up');
		});
	});
});

