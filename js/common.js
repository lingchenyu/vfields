$(function() {
$(window).scroll(function(){
        var scrolltop=$(this).scrollTop();		
        if(scrolltop>=200){		
            $("#elevator").fadeIn("slow").css("display", "block");
        }else{
            $("#elevator").fadeOut("slow").css("display", "none");
        }
	});		
	$("#elevator").click(function(){
		$("html,body").animate({scrollTop: 0}, 500);	
	});
});
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

