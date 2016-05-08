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

