$(document).ready(function(){
	$.each($('.lightbox'), function() {
		$(this).colorbox({
			maxWidth: '80%',
			maxHeight: '80%',
			width: $(this).data('width') ? $(this).data('width') : false,
			height: $(this).data('height') ? $(this).data('height') : false,
			rel: $(this).data('rel') ? $(this).data('rel') : false
		});
	});
	$('select').selectbox({
		className: 'row,.col'
	});
	$('input[type="radio"]', 'form').radiobox();
	$('input[type="checkbox"]', 'form').checkbox();
	$('.ellipsis').ellipsis();
	$('select[name="menu"]').change(function() {
		location.href = $(this).val();
	});
	$.datepicker.setDefaults(lang.datepicker);
	$.timepicker.setDefaults(lang.timepicker);
	$('.date, .datetime').keydown(function(e) {
		if(e.which == 8 || e.which == 46)
		{
			$(this).val('');
		}
	});
	$.each($('.date'), function() {
		let min_date, max_date;
		if($(this).data('min'))
		{
			min_date = new Date();
			min_date.setDate(min_date.getDate() - parseInt($(this).data('min'))); 
		}
		if($(this).data('max'))
		{
			max_date = new Date();
			max_date.setDate(max_date.getDate() + parseInt($(this).data('max'))); 
		}
		$(this).attr('readonly', true).datepicker({
			dateFormat: $(this).data('format1') ? $(this).data('format1') : 'yy-mm-dd',
			changeMonth: true,
			changeYear: true,
			yearRange: 'c-50:c+10',
			minDate: min_date,
			maxDate: max_date
		});
	});
	$.each($('.datetime'), function() {
		let min_date, max_date;
		if($(this).data('min'))
		{
			min_date = new Date();
			min_date.setDate(min_date.getDate() - parseInt($(this).data('min'))); 
		}
		if($(this).data('max'))
		{
			max_date = new Date();
			max_date.setDate(max_date.getDate() + parseInt($(this).data('max'))); 
		}
		$(this).attr('readonly', true).datetimepicker({
			dateFormat: $(this).data('format1') ? $(this).data('format1') : 'yy-mm-dd',
			timeFormat: $(this).data('format2') ? $(this).data('format2') : 'HH:mm',
			changeMonth: true,
			changeYear: true,
			yearRange: 'c-50:c+10',
			stepMinute: 5,
			stepSecond: 5,
			addSliderAccess: true,
			sliderAccessArgs: { touchonly: false },
			minDate: min_date,
			maxDate: max_date
		});
	});
	$.each($('input[name="page"]'), function() {
		var value, max = parseInt($(this).data('max'));
		$(this).on({
			focus: function() {
				value = $(this).val();
				$(this).select();
			},
			keydown: function(e) {
				if(e.which == 13 && ! $(this).val())
				{
					e.preventDefault();
				}
			},
			keyup: function(e) {
				if(! $.trim($(this).val()) || (/^\d+$/.test($(this).val()) && parseInt($(this).val()) > 0 && parseInt($(this).val()) <= max))
				{					
					value = $(this).val();		
				}
				else
				{
					$(this).val(value);
				}
			}
		});
	});
	$.each($('.custom-form'), function() {
		$(this).submit(function() {
			var _validator = new Validator($);
			$('.error', this).removeClass('error');
			$('.form-notice, .valid-notice', this).removeClass('show');
			$.each($('[data-email]', this), function() {
				switch($(this).prop('tagName').toLowerCase())
				{
					case 'input':
					default:
						if($(this).val() && ! _validator.val($(this).val(), 'email'))
						{
							$(this).addClass('error').nextAll('.valid-notice:first').html(lang.email).addClass('show');
						}
						break;
					case 'textarea':
						if($(this).val() && ! _validator.val($(this).val(), 'email'))
						{
							$(this).addClass('error').nextAll('.valid-notice:first').html(lang.email).addClass('show');
						}
						break;
				}
			});
			$.each($('[data-number]', this), function() {
				switch($(this).prop('tagName').toLowerCase())
				{
					case 'input':
					default:
						if($(this).val() && ! _validator.val($(this).val(), 'customize=^\\-?\\d+((\\.\\d+)?|( +\\d+)*)$'))
						{
							$(this).addClass('error');
							$(this).nextAll('.valid-notice:first').html(lang.number).addClass('show');
						}
						break;
					case 'textarea':
						if($(this).val() && ! _validator.val($(this).val(), 'customize=^\\-?\\d+((\\.\\d+)?|( +\\d+)*)$'))
						{
							$(this).addClass('error');
							$(this).nextAll('.valid-notice:first').html(lang.number).addClass('show');
						}
						break;
				}
			});
			$.each($('[data-min]:not(.date,.datetime)', this), function() {
				if($(this).val() && ! _validator.val($(this).val(), 'minlen=' + $(this).data('min')))
				{
					$(this).addClass('error');
					$(this).nextAll('.valid-notice:first').html(lang.min.replace('%s', $(this).data('min'))).addClass('show');
				}
			});
			$.each($('[data-max]:not(.date,.datetime)', this), function() {
				if($(this).val() && ! _validator.val($(this).val(), 'maxlen=' + $(this).data('max')))
				{
					$(this).addClass('error');
					$(this).nextAll('.valid-notice:first').html(lang.max.replace('%s', $(this).data('max'))).addClass('show');
				}
			});
			$.each($('[data-required]', this), function() {
				switch($(this).prop('tagName').toLowerCase())
				{
					case 'input':
					default:
						switch($(this).attr('type'))
						{								
							case 'text':
							case 'password':
							default:
								if(! _validator.val($(this).val(), 'req'))
								{
									$(this).addClass('error').nextAll('.valid-notice:first').html(lang.required).addClass('show');
								}
								break;
							case 'radio':
								if(! _validator.val($('input[name="' + $(this).attr('name') + '"]'), 'selone_radio'))
								{
									$(this).next().addClass('error');
									$(this).parent().nextAll('.valid-notice:first').html(lang.required).addClass('show');
								}
								break;	
							case 'checkbox':
								if(! _validator.val($('input[name="' + $(this).attr('name') + '"]'), 'selone_chk'))
								{
									$(this).next().addClass('error');
									$(this).parent().nextAll('.valid-notice:first').html(lang.required).addClass('show');
								}
								break;
							case 'file':
								break;
						}
						break;
					case 'textarea':
						if(! _validator.val($(this).val(), 'req'))
						{
							$(this).addClass('error').nextAll('.valid-notice:first').html(lang.required).addClass('show');
						}
						break;
					case 'select':
						if(! _validator.val($(this).val(), ['req', 'notequal=-1']))
						{
							$(this).next().addClass('error');
							$(this).nextAll('.valid-notice:first').html(lang.required).addClass('show');
						}
						break;
				}
			});
			$.each($('input[type="file"]', this), function() {
				let is_multi = new RegExp('\\[\\]$').test($(this).attr('name'));
				if($(this).data('required') && 
				   ! $('.form-upload', $(this).closest('.input')).length && 
				   ((! is_multi && ! _validator.val($(this).val(), 'req')) || (is_multi && ! _validator.val($(this).siblings('input[type="file"]').length, 'get=1'))))
				{
					$(this).addClass('error').nextAll('.valid-notice:first').html(lang.required).addClass('show');
				}
				else if($(this).val() && $(this).attr('accept'))
				{	
					var flag = true;
					var files = $(this).prop('files');
					var tmp_ext = $(this).attr('accept').replace(/\./g, '').split(',');
					$.each(files, function(key, value) {
						if(! _validator.val(value.name, 'customize=\\.(' + tmp_ext.join('|') + ')$'))
						{
							flag = false;
							return false;
						}
					});
					if(! flag)
					{
						$(this).addClass('error').nextAll('.valid-notice:first').html(lang.extInvalid.replace('%s', $(this).attr('accept'))).addClass('show');
					}
				}
			});
			if($('input[name="captcha"]', this).length && ! _validator.val($('input[name="captcha"]', this).val(), ['req', 'minlen=4', 'maxlen=' + ($('input[name="captcha"]', this).attr('maxlength') ? $('input[name="captcha"]', this).attr('maxlength') : 4), 'remote=' + genurl('captcha', 'verify')]))
			{
				$('input[name="captcha"]', this).addClass('error').nextAll('.valid-notice:first').html(lang.captchaWrong).addClass('show');
			}
			else if($('.g-recaptcha', this).length && ! _validator.val(grecaptcha.getResponse(), 'req'))
			{
				 $('.g-recaptcha').addClass('error');
			}
			if(! _validator.getValStatus())
			{
				$('.form-notice', this).addClass('show');
			}
			else
			{
				if($('input[name="c_password"]', this).length && ! _validator.val($('input[name="c_password"]', this).val(), 'equal=' + $('input[name="password"]', this).val()))
				{
					$('input[name="c_password"]', this).addClass('error').nextAll('.valid-notice:first').html(lang.password).addClass('show');
				}
				if($('input[name="c_email"]', this).length)
				{
					if($('input[name="email"]', this).length && ! _validator.val($('input[name="email"]', this).val(), 'remote=' + genurl('member', 'email', 'y')))
					{
						$('input[name="email"]', this).addClass('error').nextAll('.valid-notice:first').html(lang.emailExists).addClass('show');
					}
					if(! _validator.val($('input[name="c_email"]', this).val(), 'equal=' + $('input[name="email"]', this).val()))
					{
						$('input[name="c_email"]', this).addClass('error').nextAll('.valid-notice:first').html(lang.email2).addClass('show');
					}
				}
				else if($('.member-form').length && $('input[name="email"]', this).length && ! _validator.val($('input[name="email"]', this).val(), 'remote=' + genurl('member', 'email')))
				{
					$('input[name="email"]', this).addClass('error').nextAll('.valid-notice:first').html(lang.emailUsed).addClass('show');
				}
			}
			if(! _validator.getValStatus() && $('.error', this).length)
			{
				$('html, body').animate({
					scrollTop: $('.error', this).first().offset().top
				});
				if($('.slide-submit').length)
				{
					$(this).slideSubmit('revert');
				}
			}
			else if(_validator.getValStatus() && $('input[name="g-recaptcha-response"]', this).length)
			{
				let form = $(this);
				grecaptcha.ready(function() {
					let recaptcha = $('input[name="g-recaptcha-response"]', form);
					grecaptcha.execute(recaptcha.data('site-key'), {action: 'submit'}).then(function(token) {
						recaptcha.val(token);
						form[0].submit();
					});
				});
				return false;
			}
			return _validator.getValStatus();
		}).on('reset', function() {
			$('.error', this).removeClass('error');
			$('.form-notice, .valid-notice', this).removeClass('show');
		});
		if($('.slide-submit').length)
		{
			$(this).slideSubmit({
				handler: $('#submit', this),
				offset: 10
			});
		}
	});
	$('form[name="subscribe-form"]').submit(function() {
		var _validator = new Validator($);
		$('.error', this).removeClass('error');
		if(! _validator.val($('input[name="email"]', this).val(), ['req', 'email']))
		{
			$('input[name="email"]', this).addClass('error');
		}
		return _validator.getValStatus();
	});
	var qty;
	let updateTotal = function(response) {
		$('.common-cart-table-price.total').html(response.total);				
		$('.cart-discount', '.common-cart-table-price').html(response.code ? response.code : '&nbsp;');
		$('.common-cart-table-price.event').html(response.event ? response.event : '&nbsp;');
		if(response.event != null)
		{
			$('.common-cart-table-price.event').closest('.common-cart-row').removeClass('hide');
		}
		else
		{
			$('.common-cart-table-price.event').closest('.common-cart-row').addClass('hide');
		}	
		$('.common-cart-table-price.discount').html(response.discount);	
		if(response.discount != 0)
		{
			$('.common-cart-table-price.discount').closest('.common-cart-row').removeClass('hide');
		}
		else
		{
			$('.common-cart-table-price.discount').closest('.common-cart-row').addClass('hide');
		}
		$('.common-cart-table-price.grand-total').html(response.grand_total);
	};
	$(this).on('keyup', 'input[name="qty"]', function(e) {
		if(new RegExp('^[0-9]+$').test($(this).val()))
		{
			qty = $(this).val();
			var max_qty = parseInt($(this).data('max'));
			if(max_qty > 0)
			{
				qty = Math.min(qty, max_qty);
				$(this).val(qty);
			}
		}
		else if($(this).val())
		{
			$(this).val(qty);
		}
		if(e.which == 13)
		{
			$(this).trigger('blur');
		}
	}).on('blur', 'input[name="qty"]', function() {
		if(! $(this).val())
		{		
			$(this).val(1);
		}
	}).on('focus', 'input[name="qty"]', function() {
		qty = $(this).val();
		$(this).select();
	}).on('blur', '.common-cart-table input[name="qty"]', function() {
		var id = $(this).data('id');
		qty = $(this).val();
		$.ajax({
			url: genurl('cart', 'update', id),
			type: 'post',
			data: {
				qty: qty
			},
			dataType: 'json',
			async: false,
			success: function(response) {
				if('product_total' in response)
				{
					$('.price[data-id="' + id + '"]', '.common-cart-table').html(response.product_total);
					$('input[name="qty"][data-id="' + id + '"]', '.common-cart-table').val(qty);
					updateTotal(response);
				}
				else
				{
					location.reload();
				}
			}
		});
	}).on('click', '.deleteFromCart', function() {
		return confirm(lang.confirmDelete);
	}).on('change', 'select[name="delivery"]', function() {
		$.ajax({
			url: genurl('cart', 'delivery', $(this).val()),
			dataType: 'json',
			async: false,
			success: function(response) {
				updateTotal(response);
			}
		});
	}).on('click', '[data-apply="true"]', function() {
		var _validator = new Validator();
		$('input[name="promotion_code"]', '.common-cart-footer').removeClass('error');
		if(! _validator.val($('input[name="promotion_code"]', '.common-cart-footer').val(), ['req', 'maxlen=20', 'customize=^[a-zA-Z0-9\\_\\-\\@\\%\\&]+$']))
		{
			$('input[name="promotion_code"]', '.common-cart-footer').addClass('error');
		}
		return _validator.getValStatus();
	});
	if($('.common-notice-popup').length)
	{
		$.colorbox({
			title: $('.common-notice-popup').attr('title'),
			html: $('.common-notice-popup'),
			maxWidth: '80%',
			maxHeight: '80%'
		});
	}
	$('.close', '.common-notice-left, .common-notice-right').click(function(e) {
		$.ajax({
			url: genurl('home', 'close'),
			type: 'post',
			data: {
				id: $(this).data('id')
			}
		});
		$(this).closest('section[class^="common-notice-"]').fadeOut(function() {
			$(this).remove();
		});
		e.preventDefault();
	});
	var menu = $('.content-menu');
	if(menu.length)
	{		
		var content = $('.content-container');
		var extra = function(object) {
			return  parseInt(object.css('paddingTop')) + 
					parseInt(object.css('paddingBottom')) + 
					parseInt(object.css('marginTop')) + 
					parseInt(object.css('marginBottom')) + 
					parseInt(object.css('borderTopWidth')) + 
					parseInt(object.css('borderBottomWidth'));
		};
		setInterval(function() {
			menu.css('height', 'auto');
			content.css('height', 'auto');
			if($(window).width() >= lang.tablet)
			{
				var height = Math.max(menu.outerHeight(true), content.outerHeight(true));
				menu.css('height', (height - extra(menu)) + 'px');
				content.css('height', (height - extra(content)) + 'px');
			}
		}, 500);
	}
	$('#back-to-top').click(function(e) {
		$('html, body').animate({
			scrollTop: 0
		});
		e.preventDefault();
	});
	var back_to_top = false;
	$(window).on('scroll', function() {
		if($(this).scrollTop() > $(this).height() / 2)
		{
			if(! back_to_top)
			{
				$('#back-to-top').stop(true, true).fadeIn();
				back_to_top = true;
			}
		}
		else if(back_to_top)
		{
			$('#back-to-top').stop(true, true).fadeOut();
			back_to_top = false;
		}
	});
	$('#accept').click(function(e) {
		$.ajax({
			url: genurl('home', 'accept'),
			type: 'post',
			data: {
				accept: 'y'
			}
		});
		$('#cookies').fadeOut(function() {
			$(this).remove();
		});
	});
	$('a[href="#"]', '.menu').click(function(e) {
		e.preventDefault();
	});
	if($('.common-cart-table').length)
	{
		$('.common-cart-table').table({
			className: 'common-cart-table-responsive',
			width: 768		
		});
	}
});
$(window).load(function() {
	if($('#loading').length)
	{	
		if(! $(window.location.hash).length)
		{
			$('html, body').animate({
				scrollTop: 0
			});
		}
		$('#loading').fadeOut();
	}
});