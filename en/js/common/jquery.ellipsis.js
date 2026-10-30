/*
 * jQuery Ellipsis Plugin
 * Copyright (c) 2015 Alvin So
 * Version: 1.73 (4-JUN-2025)
 */
(function($) {
	$.fn.extend({
		ellipsis: function(options) {
			var setting = {
				height: 'auto',							//element height
				sign: '...',							//string append to element end when it exceed height
				class: 'ellipsis',						//class append to element end when it exceed height
				responsive: true,						//enable responsive function
				timeout: 100,							//time to update when window resize and responsive function enabled
				beforeResize: function(element) {},		//event before resize
				afterResize: function(element) {},		//event after resize
				afterInit: function(element) {}			//event after initiate
			};
			$.extend(true, setting, options);
			return this.each(function(i) {
				var _self = $(this);
				_self.find('*').each(function() {
					$(this).replaceWith($(this).contents());
				});
				var content = _self.html();
				var render = function() {					
					var max_height = setting.height == 'auto' ? parseInt(_self.attr('data-height')) : parseInt(setting.height);
					_self.append(setting.sign);
					if(_self.height() > max_height)
					{
						var temp, result = '', mid, low = 0, high = content.length;
						while(low <= high)
						{
							mid = low + ((high - low) >> 1);
							temp = content.substring(0, mid + 1);
							if(! temp.match(/[\u4E00-\u9FA5]+/g) && temp.slice(-1) != ' ')
							{
								temp = temp.substring(0, temp.lastIndexOf(' '));
							}
							temp += setting.sign;
							_self.html(temp);
							if(_self.height() > max_height)
							{
								high = mid - 1;
							}
							else
							{
								low = mid + 1;
								result = result.length > temp.length ? result : temp;
							}
						}
						if(result.length > 0)
						{
							_self.html(result).addClass(setting.class);
						}
					}
					else
					{
						_self.html(content).removeClass(setting.class);				
					}
				}
				render();
				setting.afterInit(_self);
				if(setting.responsive)
				{
					var timeout;
					$(window).resize(function() {
						clearTimeout(timeout);
						timeout = setTimeout(function() {
							_self.html(content);
							setting.beforeResize(_self);
							render();
							setting.afterResize(_self);
						}, setting.timeout);
					});
				}
			});
		}
	});
})(jQuery);