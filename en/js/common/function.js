function genurl(page, func, extra, get, language, hash) 
{
	var location = window.location;
	var base_path = lang.basePath;
	var relative_path = location.pathname.replace(base_path, '');
	var para = relative_path.toString().split('/');
	if(lang.lang)
	{
		var para_language = para.shift();
		base_path += (language ? language + '/' : (para_language ? para_language + '/' : ''));
	}
	var para_page = para.shift();
	para_page = para_page ? para_page : decodeURIComponent(lang.defPage);
	var para_func = para.shift();
	para_func = para_func ? para_func : decodeURIComponent(lang.defFunc);
	var para_extra = para.join('/');
	if(page !== undefined)
	{
		base_path += encodeURIComponent(page ? page : para_page) + '/';
	}
	if(func !== undefined)
	{
		base_path += encodeURIComponent(func ? func : para_func) + '/';
	}
	if(extra !== undefined)
	{
		if(extra && extra !== true)
		{
			base_path += extra + '/';
		}
		else
		{
			base_path += para_extra;
		}
	}
	if(get)
	{
		if(typeof get == 'object')
		{
			para = {};
			for(var i in get)
			{
				para[i] = get[i];
			}
			var tmp_para = [];
			for(var i in para)
			{
				if(typeof para[i] == 'object')
				{
					$.each(para[i], function(key, value) {
						tmp_para.push(i + '[' + key + ']=' + value);
					});
				}
				else
				{
					tmp_para.push(i + '=' + para[i]);
				}
			}
			base_path += '?' + tmp_para.join('&');
		}
		else
		{
			base_path += location.search;
		}
	}
	if(hash)
	{
		if(hash !== true)
		{
			base_path += '#' + hash;
		}
		else
		{
			base_path += location.hash;
		}
	}
	return base_path;
}

(function($) {
	$.fn.extend({	
		selectbox: function(method) {
			return this.each(function() {
				var self = $(this);
				var is_multiple = !! self.attr('multiple');
				var default_value = self.find('option:selected').map(function() {
					return $(this).val();
				});
				self.click(eventHandle);
				if(self.attr('data-reset-event') == undefined)
				{
					self.parents('form:first').on('reset', function(){
						self.find('option').removeAttr('selected');
						$.each(default_value, function() {
							self.find('option[value="' + this + '"]').prop('selected', true).attr('selected', 'selected');
						});
						self.selectbox('refresh');
					});
					self.attr('data-reset-event', true);
				}
				switch(method){
					case 'refresh':
						var select = self.next('.select');
						select.children('.select-container').children().remove();
						updateText();
						buildOption();
						break;
					case 'destroy':
						self.removeAttr('data-reset-event').show().off('click change').next('.select').remove();
						break;
					default:
						var select = self.hide().after('<div class="select"><a class="select-input" href="#"></a><div class="select-container"></div></div>').next('.select');
						var parent = select.parent();
						if(typeof(method) == 'object')
						{
							if('className' in method)
							{							
								parent = select.parents('.' + method.className);
								select.data('className', method.className);
							}
							if('noSelectText' in method)
							{								
								select.data('noSelectText', method.noSelectText);
							}
						}
						updateText();
						var z_index = parent.first().css('zIndex');
						z_index = parseInt(z_index) ? z_index + 1 : 1;
						var alt_z_index = z_index - 1;
						var str = [], timeout;
						select.click(function(e){
							if(! self.is(':disabled'))
							{			
								if($(this).hasClass('select-fix'))
								{						
									hide();
								}
								else
								{						
									hide();
									$(this).addClass('select-fix');
									select.children('.select-container').show();
									parent.css('zIndex', z_index);
								}
								self.trigger('click');
							}
							eventHandle(e);
						}).addClass(self.attr('class')).keydown(function(e) {
							switch(e.which)
							{
								case 38:
									move('up');
									break;
								case 40:
									move('down');
									break;
								case 13:
									if($(this).hasClass('select-fix'))
									{
										var option = select.find('.select-container > div:not(.optgroup)');
										var index = option.index(option.filter('.selected'));
										if(index >= 0)
										{
											selectOpt(index);
										}
									}
									break;
							}			
				
							function move(direction)
							{
								if(! select.hasClass('select-fix'))
								{
									select.trigger('click');
								}
								var container = select.find('.select-container');
								var option = container.children('div');
								var selected = option.filter('.selected');
								option.removeClass('selected');
								var index;
								var selector = ':not(.optgroup):first';
								var first = option.filter(selector).index();
								if(direction == 'up')
								{
									index = Math.max(selected.length ? selected.prevAll(selector).index() : 0, first);
								}
								else
								{
									var last = option.filter(':not(.optgroup):last').index();
									index = Math.min(selected.length ? (selected.nextAll(selector).length ? selected.nextAll(selector).index() : last) : first, last);
								}
								option.eq(index).addClass('selected');
								scroll();
								e.preventDefault();
							}
						}).keypress(function(e) {
							if(e.which > 0)
							{								
								str.push(String.fromCharCode(e.which));
								clearTimeout(timeout);
								timeout = setTimeout(function() {
									str = [];
								}, 500);
								var option = select.find('.select-container > div:not(.optgroup)');
								$.each(option, function(index) {
									if($(this).text().toLowerCase().indexOf(str.join('')) == 0)
									{
										selectOpt(index, true);
										scroll();
										return false;
									}
								})
							}
						});
						buildOption();
						$(document).click(hide);
						if(window.location != window.parent.location){
							$('*', top.document).click(hide);
						}
				}
				
				function selectOpt(index, no_change)
				{
					var option = select.find('.select-container > div:not(.optgroup):eq(' + index + ')');
					if(is_multiple)
					{
						if(! no_change)
						{							
							if(option.hasClass('checked'))
							{
								option.removeClass('checked');
								self.find('option').eq(index).prop('selected', false).removeAttr('selected');
							}
							else
							{
								option.addClass('checked');
								self.find('option').eq(index).prop('selected', true).attr('selected', 'selected');
							}
							updateText();
							self.trigger('change');
						}
					}
					else if(index != self[0].selectedIndex)
					{
						option.addClass('selected').siblings().removeClass('selected');
						if(! no_change)
						{	
							self.find('option').prop('selected', false).removeAttr('selected').eq(index).prop('selected', true).attr('selected', 'selected');
							updateText();
							self.trigger('change');
						}
					}
				}
				
				function eventHandle(e)
				{
					e.preventDefault();
					e.stopPropagation(); 
				}
				
				function hide()
				{
					if(select.data('className'))
					{
						$('.select').parents('.' + select.data('className')).css('zIndex', alt_z_index);
					}
					else
					{
						$('.select').parent().css('zIndex', alt_z_index);
					}
					$('.select-fix').removeClass('select-fix');
					$('.select-container').hide();
					$('.select-container div.selected').removeClass('selected');
				}
				
				function buildOption()
				{
					$.each(self.find('option'), function(){
						if($(this).parent('optgroup').length && ! $(this).index())
						{
							select.children('.select-container').append('<div class="optgroup">' + $(this).parent('optgroup').attr('label') + '</div>');	
						}
						var class_name = [];
						if($(this).is(':disabled'))
						{
							class_name.push('disabled');
						}
						if(is_multiple)
						{
							class_name.push('select-option');
							if($(this).is(':selected'))
							{
								class_name.push('checked');
							}
						}
						select.children('.select-container').append('<div' + (class_name.length ? ' class="' + class_name.join(' ') + '"' : '') + '>' + $(this).text() + '</div>');	
					});
					select.find('.select-container > div').click(function(e){
						if(! $(this).hasClass('disabled')){
							if(! is_multiple && ! $(this).hasClass('optgroup'))
							{								
								hide();
							}
							if($(this).hasClass('optgroup'))
							{
								if(is_multiple)
								{									
									var option = $(this).nextUntil('.optgroup', '.select-option');
									var checked = option.filter('.checked').length != option.length;
									$.each(option, function() {
										if((checked && ! $(this).hasClass('checked')) ||
										   (! checked && $(this).hasClass('checked')))
										{										
											var index = $(this).siblings('div:not(.optgroup)').addBack().index(this);
											selectOpt(index);
										}
									});
								}
							}
							else
							{								
								var index = $(this).siblings('div:not(.optgroup)').addBack().index(this);
								selectOpt(index);
							}
						}
						eventHandle(e);
					}).hover(function() {
						$(this).addClass('selected').siblings().removeClass('selected');
					}, function() {
						$(this).removeClass('selected');
					});
				}
				
				function scroll()
				{
					var h = 0;
					$.each(select.find('.select-container > div.selected:not(.optgroup)').prevAll(), function() {
						h += $(this).outerHeight();
					});
					select.children('.select-container').stop(true, true).animate({
						scrollTop: h + 'px'
					});
				}
				
				function updateText()
				{
					var text = [];
					$.each(self.find(':selected'), function() {
						text.push($(this).text());
					});
					select.children('.select-input').html(text.length > 0 ? text.join(', ') : select.data('noSelectText'));
				}
				
			});
		},
		radiobox: function(checked) {
			return this.each(function() {
				var self = $(this).hide();		
				if(checked == undefined)
				{	
					var is_checked = self.is(':checked');				
					var radio;
					var obj = self[0];
					if(obj.nextSibling)
					{
						var all_obj = [];
						do
						{
							obj = obj.nextSibling;
							all_obj.push(obj);
						} while(obj.nextSibling);
						radio = $(all_obj).wrapAll('<a class="radio" data-name="' + self.attr('name') + '" href="#"></a>').parent();
					}
					else
					{
						radio = $(obj).after('<a class="radio no-label" data-name="' + self.attr('name') + '" href="#"></a>').next();
					}
					radio.click(function(e, h){
						if(! self.is(':disabled'))
						{
							$('.radio[data-name="' + self.attr('name') + '"]').removeClass('checked');
							$(this).addClass('checked');
							if(! h)
							{
								self.trigger('click', 'y');
							}					
						}					
						e.preventDefault();
					}).keydown(function(e) {
						if(e.which == 32)
						{
							radio.trigger('click');
							e.preventDefault();
						}
					});
					if(is_checked){
						radio.addClass('checked');
					}
					radio.addClass(self.attr('class'));
					self.parents('form:first').on('reset', function(){
						setTimeout(function() {
							if(is_checked)
							{
								radio.addClass('checked');
								self.prop('checked', true);
							}
							else
							{
								radio.removeClass('checked');
								self.prop('checked', false);
							}
							self.trigger('change');
						}, 0);
					});
				}
				else
				{
					self.prop('checked', checked);
					var target = self.next('.radio')[0] || self.parent('.radio')[0];
					if(checked)
					{
						$(target).addClass('checked');
					}
					else
					{
						$(target).removeClass('checked');
					}
					self.trigger('change');
				}
			});
		},
		checkbox: function(checked) {
			return this.each(function() {
				var self = $(this).hide();
				if(checked == undefined)
				{	
					var ie_ver = detectIE();
					var is_checked = self.is(':checked');
					var checkbox;
					var obj = self[0];
					if(obj.nextSibling)
					{
						var all_obj = [];
						do
						{
							obj = obj.nextSibling;
							all_obj.push(obj);
						} while(obj.nextSibling);
						checkbox = $(all_obj).wrapAll('<a class="checkbox" href="#"></a>').parent();
					}
					else
					{
						checkbox = $(obj).after('<a class="checkbox no-label" href="#"></a>').next();
					}
					checkbox.click(function(e){
						if(! self.is(':disabled'))
						{										
							if($(this).hasClass('checked')){
								$(this).removeClass('checked');
								setTimeout(function() {
									if(ie_ver && ie_ver <= 8 || self.prop('checked'))
									{
										self.prop('checked', false).trigger('change');
									}
								}, 0);
							}
							else
							{
								$(this).addClass('checked');
								setTimeout(function() {
									if(ie_ver && ie_ver <= 8 || ! self.prop('checked'))
									{
										self.prop('checked', true).trigger('change');
									}
								}, 0);
							}
						}
						e.preventDefault();
					}).keydown(function(e) {
						if(e.which == 32)
						{
							checkbox.trigger('click');
							e.preventDefault();
						}
					});
					if(is_checked){
						checkbox.addClass('checked');
					}
					checkbox.addClass(self.attr('class'));
					self.parents('form:first').on('reset', function(){
						setTimeout(function() {
							if(is_checked)
							{
								checkbox.addClass('checked');
								self.prop('checked', true);
							}
							else
							{
								checkbox.removeClass('checked');
								self.prop('checked', false);
							}
							self.trigger('change');
						}, 0);
					});
				}
				else
				{
					self.prop('checked', checked);
					var target = self.next('.checkbox')[0] || self.parent('.checkbox')[0];
					if(checked)
					{
						$(target).addClass('checked');
					}
					else
					{
						$(target).removeClass('checked');
					}
					self.trigger('change');
				}
			});
			
			function detectIE() 
			{
				var ua = window.navigator.userAgent;
				var msie = ua.indexOf('MSIE ');
				if (msie > 0) {
					return parseInt(ua.substring(msie + 5, ua.indexOf('.', msie)), 10);
				}
				var trident = ua.indexOf('Trident/');
				if (trident > 0) {
					var rv = ua.indexOf('rv:');
					return parseInt(ua.substring(rv + 3, ua.indexOf('.', rv)), 10);
				}
				var edge = ua.indexOf('Edge/');
				if (edge > 0) {
				   return parseInt(ua.substring(edge + 5, ua.indexOf('.', edge)), 10);
				}
				return false;
			}
		}
	});
})(jQuery);