$(document).ready(function(){
	$('.table-responsive', '.editor').table({
		className: 'table-responsive-wrapper',
		width: lang.mobile		
	});
	$('.refresh').click(function(e) {
		$(this).prev().attr('src', genurl('captcha', 'main', new Date().getTime()));
		$(this).next().val('');
		e.preventDefault();
	});
	$('.trigger').click(function(e) {
		var panel = $(this).nextAll('.panel:first');
		if(panel.hasClass('show'))
		{
			panel.removeClass('show');
			$(this).removeClass('open');
		}
		else
		{
			$('.panel.show').removeClass('show');
			$('.trigger.open').removeClass('open');
			panel.addClass('show');
			$(this).addClass('open');
		}
		e.preventDefault();
	});
	$('.trigger, .panel').click(function(e) {
		e.stopPropagation();
	});
	$(this).click(function() {
		$('.panel.show').removeClass('show');
		$('.trigger.open').removeClass('open');
	});
	$('#menu-trigger', 'header').click(function(e) {
		$('.menu', 'header').css('margin-top', $('.container', 'header').height() + 51);
		$('html').addClass('open');
		e.preventDefault();
	});
	$('#menu-close', 'header').click(function(e) {
		$('html').removeClass('open');
		$('.menu', 'header').removeAttr('style');
		e.preventDefault();
	});
	$('.has-sub-menu > a').click(function(e) {
		if($(window).width() < 1200) {
			$(this).parent().toggleClass('open');
			e.preventDefault();
		}
	});
	$(window).resize(function() {
		if($('.control-panel.border', 'header').length > 0) {
			$('.right-wrapper', 'header').css('padding-right', $('.control-panel', 'header').width() + 28);
		}
		$('.menu', 'header').removeAttr('style');
		if($(window).width() >= 1200) {
			$('html').removeClass('open');
		}
		if($('html').hasClass('open')) {
			$('.menu', 'header').css('margin-top', $('.container', 'header').height() + $('.control-panel', 'header').height());
		}
		else {
			$('.menu', 'header').removeAttr('style');
		}
	}).resize();
});
$(window).on('load resize redraw').load(function() {
	if($('.control-panel.border', 'header').length > 0) {
		$('.right-wrapper', 'header').css('padding-right', $('.control-panel', 'header').width() + 28);
	}
	if($('.subscribe-message').length)
	{
		$('html, body').animate({
			scrollTop: $('.subscribe-message').offset().top + 'px'
		});
	}
	$('.whatsapp').css('top', $('header').innerHeight() + 20);
}).load(function() {
	$('.right-wrapper', 'header').animate({'opacity': 1});
}).on('load resize redraw', function() {
	if($('body').hasClass('fixed'))
	{
		$('body').css('paddingTop', $('header').outerHeight(true) + 'px');
	}
});