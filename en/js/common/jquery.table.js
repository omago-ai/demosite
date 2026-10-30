/*
 * jQuery Table Plugin
 * Copyright (c) 2015 Alvin So
 * Version: 1.20 (20-FEB-2024)
 */
(function($) {
	$.fn.extend({
		table: function(options) {
			if(typeof(options) == 'object')
			{
				var setting = {
					className: '',												//Class for responsive table
					connector: ' & ',											//string for colspan td
					width: 0,													//when object width less than this value, it will show responsive table (int or function)
					timeout: 100,												//time to update when window resize
					beforeResize: function(element, responsive_element) {},		//event before resize
					afterResize: function(element, responsive_element) {},		//event after resize
					afterInit: function(element, responsive_element) {}			//event after initiate
				};
				$.extend(true, setting, options);				
				return this.each(function() {
					$.each($(this), function() {
						var _self = $(this);
						var table = _self.after('<table><tbody></tbody></table>').next().addClass(setting.className).hide();
						var tbody = table.children();
						var thead = [];
						$.each($('th, td', _self.find('tr:first')), function() {
							var colspan;
							if($(this).attr('colspan'))
							{
								colspan = parseInt($(this).attr('colspan'));
							}
							else
							{
								colspan = 1;
							}
							for(var i = 0; i < colspan; i++)
							{
								thead.push({
									tag:		$(this).prop('tagName'),
									html:		$(this).html(),					
									className:	$(this).attr('class'),
									style:		$(this).attr('style')		
								});
							}
						});
						var last_row_span = {};
						$.each($('tr', _self).not(':first'), function() {
							var tr = tbody.append('<tr><td></td></tr>').children(':last').addClass($(this).attr('class'));
							if(tr.closest('tfoot').length)
							{
								tr.remove();
								return false;
							}
							var new_tbody = tr.children(':last').html('<table><tbody></tbody></table>').children().addClass(_self.attr('class')).attr('style', _self.attr('style')).children();
							var index = 0;
							var insertRowSpan = function() {
								while(index in last_row_span) {
									var length = last_row_span[index].colspan;
									new_tr = new_tbody.append('<tr />').children(':last');
									createElement(new_tr, last_row_span[index].title);
									createElement(new_tr, last_row_span[index].content);
									last_row_span[index].rowspan--;
									if(last_row_span[index].rowspan <= 1)
									{
										delete last_row_span[index];
									}
									index += length;
								};
							}
							$.each($('th, td', $(this)), function() {		
								var new_tr;	
								var colspan = parseInt($(this).attr('colspan'));
								var rowspan = parseInt($(this).attr('rowspan'));
								var title = {};
								var content = {
									tag:		$(this).prop('tagName'),
									html:		$(this).html(),					
									className:	$(this).attr('class'),
									style:		$(this).attr('style')	
								};
								if(colspan > 1)
								{
									var tmp = [];
									for(var i = 0; i < colspan; i++)
									{
										if($.inArray(thead[(index + i)].html, tmp) == -1)
										{
											tmp.push(thead[(index + i)].html);
										}
									}
									$.extend(title, thead[index], {
										html: tmp.join(setting.connector)
									});
								}
								else
								{
									colspan = 1;
									title = thead[index];
								}
								insertRowSpan();
								if(rowspan > 1)
								{
									last_row_span[index] = {
										title: title,
										content: content,
										colspan: Math.max(colspan, 1),
										rowspan: rowspan
									};
								}
								new_tr = new_tbody.append('<tr />').children(':last');
								createElement(new_tr, title);
								createElement(new_tr, content);
								index += colspan;
								insertRowSpan();
							});
						});
						if(_self.children('tfoot').length)
						{
							var tfoot = table.append('<tfoot><tr><td></td></tr></tfoot>').find('td:last');
							tfoot.html('<table />').children().addClass(_self.attr('class')).append(_self.children('tfoot').clone());
						}
						var render = function() {
							var width = typeof(setting.width) == 'function' ? setting.width() : setting.width;
							if(window.innerWidth <= width)
							{
								table.show();
								_self.hide();
							}	
							else
							{
								_self.show();
								table.hide();
							}
						};
						_self[0].setting = setting;
						_self[0].table = table;
						var name = Math.random().toString(36).substring(2, 15);
						_self.attr('data-name', name);
						render();
						setting.afterInit(_self, table);
						var timeout;
						$(window).on('resize.' + name, function() {
							clearTimeout(timeout);
							timeout = setTimeout(function() {
								setting.beforeResize(_self, table);
								render();
								setting.afterResize(_self, table);
							}, setting.timeout);
						});
					});
					
					function createElement(tr, obj)
					{
						if(obj)
						{
							tr.append('<' + obj.tag + ' />').children(':last').html(obj.html).addClass(obj.className).attr('style', obj.style);
						}
					}
				});
			}
			else
			{
				return this.each(function() {
					var _self = $(this);
					switch(options)
					{
						case 'refresh':
							var option = _self[0].setting;
							if(option != undefined)
							{								
								_self.table('destroy').table(option);
							}
							break;
						case 'destroy':
							$(window).off('resize.' + _self.attr('data-name'));
							_self.removeAttr('data-name');
							if(_self[0].setting != undefined)
							{
								delete(_self[0].setting);
							}
							if(_self[0].table != undefined)
							{
								_self[0].table.remove();
								delete(_self[0].table);
							}
							break;
					}
				});
			}
		}
	});
})(jQuery);