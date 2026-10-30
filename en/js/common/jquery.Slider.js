/*
 * jQuery Slider Plugin
 * Copyright (c) 2016 Alvin So
 * Version: 1.54 (6-MAY-2026)
 */
(function($) {
	$.fn.extend({
		Slider: function(options, extra) {
			if(typeof(options) == 'object')
			{
				var setting = {
					slides: '> div',																//number of slides pre animate (string or jQuery object)
					maxSlide: 'auto',																//maximum number of slides pre animate (string or int or function)
					minSlide: 'auto',																//minimum number of slides pre animate (string or int or function)
					fixedSlide: 0,																	//fixed number of slides pre animate (int or function)
					slidesClass: 'slider',															//class name for slides wrapper
					beforeClass: 'before',															//class name for before slide
					currentClass: 'current',														//class name for current slide
					afterClass: 'after',															//class name for after slide
					prev: '.prev',																	//element to control previous (string or jQuery object)
					next: '.next',																	//element to control next (string or jQuery object)
					disableClass: 'disable',														//class name for control when it can't be clicked
					direction: 'horizontal',														//animate direction (horizontal or vertical)
					clickToSlide: false,															//slide to the clicked slide
					arrowControl: false,															//press ← and → to change slides
					mouseControl: false,															//scroll mouse wheel up and down to change slides
					swipeControl: true,															//swipe left and right to change slides
					swipeDistance: 100,																//swipe distance bigger than it will trigger swipe
					swipeByMouse: false,															//swipe support mouse drag
					timeout: 100,																	//time to update when slider resize
					autoPlay: 0,																	//millisecond for auto slide
					animateTime: 'normal',															//animation time (string or int)
					offset: 0,																		//slide distance offset (int or function)
					autoMargin: true,																//margin between each slides
					minMargin: 0,																	//minimum margin between each slides when autoMargin enabled (int or function)
					skipBoundary: 0,																//skip margin left and right of first and last slides when autoMargin enabled and slider longer than it (int or function)
					fixWidth: true,																	//slide distance base on first slide (boolean or function)
					fadeOut: false,																	//animate in fadeout effect
					infiniteLoop: false,															//only available when fadeOut is false and slider having 2 or more slides
					dummySlide: false,																//only available when fadeOut is false and slider having 2 or more slides
					pager: '',																		//element to build pager (string or jQuery object)
					pagerTemplate: function(page, total_page) {										//pager template (string or function)
						return '<a href="#" />';		
					},
					autoStop: true,																	//stop autoplay when click prev, next or pager
					autoHide: true,																	//auto hide prev, next and pager when one slide only
					lazyLoad: false,																//load img when slider is visible only (data-src)
					sizeCompatible: true,															//calculate slide size in compatible mode
					slideToLast: true,																//slide to last slide
					beforeSlide: function(slider, slides, current_page, next_page, total_page) {
						return true;
					},	//event before slide
					afterSlide: function(slider, slides, current_page, total_page) {},				//event after slide
					beforeResize: function(slider, slides, current_page, next_page, total_page) {},	//event before resize
					afterResize: function(slider, slides, current_page, total_page) {},				//event after resize
					afterInit: function(slider, slides, current_page, total_page) {}				//event after initiate
				};
				$.extend(true, setting, options);
				
				function getSize(obj) {
					var width, height;
					if(obj.length)
					{						
						if(setting.sizeCompatible)
						{							
							var rect = obj[0].getBoundingClientRect();
							if(rect.width) 
							{
								width = rect.width;
							}
							else 
							{
								width = rect.right - rect.left;
							}
							if(rect.height) 
							{
								height = rect.height;
							}
							else 
							{
								height = rect.bottom - rect.top;
							}
						}
						else
						{
							width = obj.width();
							height = obj.height();
						}
					}
					return {
						width: width ? width : 1,
						height: height ? height : 1
					};
				}

				return this.each(function() {
					$.each($(this), function() {
						var _self = $(this);
						var _slides = $(setting.slides, _self);
						var _first = _slides.first();
						var _parent = _first.parent();
						var _prev = $(setting.prev, _self);
						var _next = $(setting.next, _self);
						var _pager = $(setting.pager, _self);
						var max = $(setting.slides, _self).length;
						var width = height = 0;
						var count = 1, total, auto_interval, resize_interval, init_interval, animate = false;
						var infinite_loop = setting.infiniteLoop && ! setting.fadeOut && max >= 2;
						var dummy_slide = setting.dummySlide && ! setting.fadeOut && max >= 2;
						var updateClass = function() {
							if(setting.disableClass && ! setting.fadeOut && ! infinite_loop)
							{
								_prev.add(_next).removeClass(setting.disableClass);
								if(count <= 1)
								{
									_prev.addClass(setting.disableClass);
								}
								var can_slide = count < total;					
								if(can_slide && ! setting.slideToLast)
								{
									var last_slide = _parent.children(':last'); 	
									if(setting.direction == 'horizontal')
									{
										can_slide = getSize(_self).width < (last_slide.position().left + getSize(last_slide).width);
									}
									else
									{
										can_slide = getSize(_self).height < (last_slide.position().top + getSize(last_slide).height);
									}
								}
								if(! can_slide)
								{
									_next.addClass(setting.disableClass);
								}
							}
							var tmp_children = _parent.children();
							var tmp_slides = tmp_children.filter(':not([data-dummy="true"])');
							var current_slide;
							if(! infinite_loop)
							{
								current_slide = tmp_slides.eq(count - 1);
							}
							else
							{
								current_slide = tmp_slides.eq(0);
							}
							var tmp_page;
							if(setting.pager)
							{
								tmp_page = _pager.children();
							}
							if(setting.beforeClass)
							{
								var prev = current_slide.prev();
								if(! prev.length)
								{
									prev = tmp_slides.filter(':last');
								}
								tmp_children.removeClass(setting.beforeClass);
								prev.addClass(setting.beforeClass);
								if(setting.pager)
								{
									prev = tmp_page.eq(count - 2);
									if(! prev.length)
									{
										prev = tmp_page.filter(':last');
									}
									tmp_page.removeClass(setting.beforeClass);
									prev.addClass(setting.beforeClass);
								}
							}
							if(setting.currentClass)
							{
								tmp_children.removeClass(setting.currentClass);
								current_slide.addClass(setting.currentClass);
								if(setting.pager)
								{
									tmp_page.removeClass(setting.currentClass).eq(count - 1).addClass(setting.currentClass);
								}
							}
							if(setting.afterClass)
							{
								var next = current_slide.next();
								if(! next.length)
								{
									next = tmp_slides.filter(':first');
								}
								tmp_children.removeClass(setting.afterClass);
								next.addClass(setting.afterClass);
								if(setting.pager)
								{
									next = tmp_page.eq(count);
									if(! next.length)
									{
										next = tmp_page.filter(':first');
									}
									tmp_page.removeClass(setting.afterClass);
									next.addClass(setting.afterClass);
								}
							}
						};
						var prevValue = function(obj, index, offset) {
							var value = 0;
							if(setting.direction == 'horizontal')
							{
								$.each(obj.slice(0, index), function() {
									value += getSize($(this)).width + offset;
								});								
							}
							else
							{
								$.each(obj.slice(0, index), function() {
									value += getSize($(this)).height + offset;
								});
							}		
							return value;
						}
						var slideAnimate = function(new_count, direction, stop_play, skip_animate) {
							if(! animate && count != new_count && setting.beforeSlide(_self, _slides, count, new_count, total))
							{
								animate = true;
								var child = _parent.children();
								child.stop(true, true);						
								if(setting.fadeOut)
								{		
									var tmp_slides = child.filter(':not([data-dummy="true"])');
									if(_slides.length > 1)
									{
										child.hide();
										tmp_slides.eq(count - 1).show().fadeOut(skip_animate ? 0 : setting.animateTime);
									}
									tmp_slides.eq(new_count - 1).css({
										position: 'absolute',
										zIndex: 1
									}).fadeIn(skip_animate ? 0 : setting.animateTime, function() {
										$(this).css({
											position: 'relative',
											zIndex: 'unset'
										});
										setting.afterSlide(_self, _slides, new_count, total);
										count = new_count;
										updateClass();
										animate = false;
									});
								}
								else
								{
									var total_run = child.length;
									var offset = typeof(setting.offset) == 'function' ? setting.offset(_self, _slides) : setting.offset;
									var tmp_slides = _parent.children(':not([data-dummy="true"])');
									var base_value, slide_index;
									var responsive_fix_width = typeof(setting.fixWidth) == 'function' ? setting.fixWidth(_self, _slides) : setting.fixWidth;
									if(infinite_loop)
									{		
										if(direction == 'prev')
										{	
											slide_index = tmp_slides.eq(new_count - count - 1).index();
											slide_index %= tmp_slides.length;
											$.each(tmp_slides.eq(slide_index).nextAll(':not([data-dummy="true"])'), function() {
												$(this).insertBefore(tmp_slides.filter(':not([data-dummy="true"]):first'));	
											});
											if(dummy_slide)
											{
												var prev_dummy = $(tmp_slides.prevAll('[data-dummy="true"]').get().reverse());
												var next_dummy = tmp_slides.nextAll('[data-dummy="true"]');
												$.each(prev_dummy.eq(slide_index).nextAll('[data-dummy="true"]').not(next_dummy), function() {
													$(this).insertBefore(prev_dummy.filter('[data-dummy="true"]:first'));	
												});
												$.each(next_dummy.eq(slide_index).nextAll('[data-dummy="true"]').not(prev_dummy), function() {
													$(this).insertBefore(next_dummy.filter('[data-dummy="true"]:first'));
												});
											}
											slide_index = tmp_slides.filter(':first').index();
											child.css(responsive_fix_width ? (setting.direction == 'horizontal' ? {
												left: '-' + (slide_index * (width + offset)) + 'px'
											} : {
												top: '-' + (slide_index * (height + offset)) + 'px'
											}) : (setting.direction == 'horizontal' ? {
												left: '-' + prevValue(_parent.children(), slide_index, offset) + 'px'
											} : {
												top: '-' + prevValue(_parent.children(), slide_index, offset) + 'px'
											}));
										}
										base_value = tmp_slides.eq(new_count - count).index()
									}
									else
									{
										base_value = tmp_slides.eq(new_count - 1).index();
									}
									child.animate(responsive_fix_width ? (setting.direction == 'horizontal' ? {
										left: '-' + (base_value * (width + offset)) + 'px'
									} : {
										top: '-' + (base_value * (height + offset)) + 'px'
									}) : (setting.direction == 'horizontal' ? {
										left: '-' + prevValue(_parent.children(), base_value, offset) + 'px'
									} : {
										top: '-' + prevValue(_parent.children(), base_value, offset) + 'px'
									}), skip_animate ? 0 : setting.animateTime, function() {
										if(--total_run == 0)
										{
											count = new_count;
											if(infinite_loop && direction == 'next')
											{
												var tmp_slides = _parent.children(':not([data-dummy="true"])');
												slide_index = tmp_slides.filter(':first').index();
												child.css(responsive_fix_width ? (setting.direction == 'horizontal' ? {
													left: '-' + (slide_index * (width + offset)) + 'px'
												} : {
													top: '-' + (slide_index * (height + offset)) + 'px'
												}) : (setting.direction == 'horizontal' ? {
													left: '-' + prevValue(_parent.children(), slide_index, offset) + 'px'
												} : {
													top: '-' + prevValue(_parent.children(), slide_index, offset) + 'px'
												}));
												base_value %= tmp_slides.length;
												$.each(tmp_slides.eq(base_value).prevAll(':not([data-dummy="true"])'), function() {
													$(this).insertAfter(tmp_slides.filter(':not([data-dummy="true"]):last'));	
												});
												if(dummy_slide)
												{
													var prev_dummy = $(tmp_slides.prevAll('[data-dummy="true"]').get().reverse());
													var next_dummy = tmp_slides.nextAll('[data-dummy="true"]');
													$.each(prev_dummy.eq(base_value).prevAll('[data-dummy="true"]').not(next_dummy), function() {
														$(this).insertAfter(prev_dummy.filter('[data-dummy="true"]:last'));
													});
													$.each(next_dummy.eq(base_value).prevAll('[data-dummy="true"]').not(prev_dummy), function() {
														$(this).insertAfter(next_dummy.filter('[data-dummy="true"]:last'));
													});
												}
											}
											updateClass();
											animate = false;
											setting.afterSlide(_self, _slides, count, total);
										}
									});
								}
								if(stop_play == undefined && setting.autoStop)
								{
									_self[0].stop();
								}
							}
						};
						var autoSlide = function() {
							if(setting.autoPlay > 0)
							{
								clearInterval(auto_interval);
								auto_interval = setInterval(function() {
									if(setting.autoPlay > 0)
									{
										if(count < total)
										{
											slideAnimate(count + 1, 'next', true);
										}
										else
										{
											slideAnimate(1, 'next', true);
										}
									}
									else
									{
										clearInterval(auto_interval);
									}
								}, setting.autoPlay);
							}
						};
						var prevSlide = function() {
							var can_slide = setting.fadeOut || infinite_loop;
							if(count > 1)
							{
								autoSlide();
								slideAnimate(count - 1, 'prev');
							}
							else if(can_slide)
							{
								slideAnimate(total, 'prev');
							}
						}
						var nextSlide = function() {
							var can_slide = setting.fadeOut || infinite_loop;
							if(count < total)
							{	
								if(! can_slide)
								{				
									if(! setting.slideToLast)
									{										
										var last_slide = _parent.children(':last'); 						
										if(setting.direction == 'horizontal')
										{
											can_slide = getSize(_self).width < (last_slide.position().left + getSize(last_slide).width);
										}
										else
										{
											can_slide = getSize(_self).height < (last_slide.position().top + getSize(last_slide).height);
										}
									}
									else
									{
										can_slide = true;
									}			
								}
								if(can_slide)
								{									
									autoSlide();
									slideAnimate(count + 1, 'next');
								}
							}
							else if(can_slide)
							{
								slideAnimate(1, 'next');
							}
						}
						var buildSlider = function() {
							var responsive_fix_width = typeof(setting.fixWidth) == 'function' ? setting.fixWidth(_self, _slides) : setting.fixWidth;
							if(responsive_fix_width)
							{
								if(setting.direction == 'horizontal')
								{
									total = Math.ceil(max / Math.floor(getSize(_parent).width / getSize(_first).width));				
								}
								else
								{
									total = Math.ceil(max / Math.floor(getSize(_parent).height / getSize(_first).height));
								}					
							}
							else
							{
								if(setting.direction == 'horizontal')
								{
									var tmp_width = 0;
									$.each(_slides, function() {
										tmp_width += getSize($(this)).width;
									});
									total = Math.ceil(tmp_width / getSize(_parent).width);		
								}
								else
								{
									var tmp_height = 0;
									$.each(_slides, function() {
										tmp_height += getSize($(this)).height;
									});
									total = Math.ceil(tmp_height / getSize(_parent).height);		
								}
							}							
							_prev.click(function(e) {
								prevSlide();
								e.preventDefault();
							});
							_next.click(function(e) {
								nextSlide();
								e.preventDefault();
							});
							if(setting.arrowControl)
							{
								$(document).keydown(function(e) {
									if(e.which == 37)
									{
										prevSlide();
										e.preventDefault();
									}
									else if(e.which == 39)
									{
										nextSlide();
										e.preventDefault();
									}
								});
							}
							if(setting.mouseControl)
							{
								$(document).on('mousewheel', function(e) {
									if(e.originalEvent.wheelDelta / 120 > 0)
									{
										prevSlide();
									}
									else
									{
										nextSlide();
									}
								});
							}
							if(setting.swipeControl)
							{
								var pos = {
									startX: 0,
									startY: 0,
									endX: 0,
									endY: 0
								};
								var move = clicked = false;
								var start = function(e) {
									if(total > 1)
									{									
										var event = 'touches' in e.originalEvent ? e.originalEvent.touches[0] : e.originalEvent;
										pos.startX = pos.endX = event.pageX;
										pos.startY = pos.endY = event.pageY;
										move = true;
										clicked = false;
									}
								}
								var update = function(e) {
									if(total > 1 && move)
									{									
										var event = 'touches' in e.originalEvent ? e.originalEvent.touches[0] : e.originalEvent;
										pos.endX = event.pageX;
										pos.endY = event.pageY;
										if(setting.direction == 'vertical')
										{
											e.preventDefault();
										}
									}
								}
								var end = function(e) {
									if(total > 1 && move)
									{
										var diff_x = pos.endX - pos.startX;
										var diff_y = pos.endY - pos.startY;
										if(setting.direction == 'horizontal')
										{
											if(Math.abs(diff_x) > setting.swipeDistance)
											{							
												if(diff_x > 0)
												{
													prevSlide();
												}
												else
												{
													nextSlide();
												}
												e.preventDefault();
											}
											/*else if(e.type == 'touchend')
											{
												$('html, body').stop(true, true).animate({
													scrollTop: ($(document).scrollTop() + diff_y * -1) + 'px'
												}, 'fast', 'linear');
											}*/
											else
											{
												clicked = true;
											}
										}
										else if(setting.direction == 'vertical')
										{
											if(Math.abs(diff_y) > setting.swipeDistance)
											{												
												if(diff_y > 0)
												{
													prevSlide();
												}
												else
												{
													nextSlide();
												}
												e.preventDefault();
											}
											else if(e.type == 'touchend')
											{
												$('html, body').stop(true, true).animate({
													scrollLeft: ($(document).scrollLeft() + diff_x * -1) + 'px'
												}, 'fast', 'linear');
											}
											else
											{
												clicked = true;								
											}
										}
										move = false;
									}
								}
								_parent.on({
									touchstart: start,
									touchmove: update,
									touchend: end
								});
								if(setting.swipeByMouse)
								{
									_parent.on({
										mousedown: start,
										mousemove: update,
										mouseup: end
									});
									_slides.click(function(e) {
										if(! clicked)
										{										
											e.preventDefault();
										}
									});
								}
							}
							var resize = function(init) {
								if(_self.is(':visible'))
								{
									var parent_width = getSize(_parent).width;
									var parent_height = getSize(_parent).height;
									if((setting.direction == 'horizontal' && width != parent_width) || 
									   (setting.direction == 'vertical' && height != parent_height))
									{
										width = parent_width;
										height = parent_height;
										setting.beforeResize(_self, _slides, count, total);
										var extra_value = 0;
										var min_margin = typeof(setting.minMargin) == 'function' ? setting.minMargin(_self, _slides) : setting.minMargin;
										if(setting.autoMargin)
										{
											if(setting.direction == 'horizontal')
											{
												_slides.css({
													marginLeft: min_margin,
													marginRight: min_margin
												});
											}
											else
											{
												_slides.css({
													marginTop: min_margin,
													marginBottom: min_margin
												});
											}
											var responsive_width = typeof(setting.skipBoundary) == 'function' ? setting.skipBoundary(_self, _slides) : setting.skipBoundary;
											var	skip_boundary = responsive_width && getSize(_self).width > responsive_width;
											if(skip_boundary)
											{
												extra_value = min_margin * 2;
											}
										}
										var max_slide = 1, min_slide = 1, fix_slide = 0;
										if(setting.fixedSlide)
										{
											fix_slide = typeof(setting.fixedSlide) == 'function' ? setting.fixedSlide(_self, _slides) : setting.fixedSlide;
										}
										if(init || fix_slide > 0)
										{
											_parent.append(_slides).children().stop(true, true).not(_slides).remove();
										}
										var slide_width, slide_height;	
										var responsive_fix_width = typeof(setting.fixWidth) == 'function' ? setting.fixWidth(_self, _slides) : setting.fixWidth;
										if(responsive_fix_width)
										{
											slide_width = getSize(_first).width;
											slide_height = getSize(_first).height;
										}
										if(fix_slide)
										{
											max_slide = min_slide = fix_slide;
										}
										else
										{			
											if(responsive_fix_width)
											{											
												if(setting.direction == 'horizontal')
												{
													max_slide = Math.floor((width + extra_value) / (slide_width + min_margin * 2));					
												}
												else
												{
													max_slide = Math.floor((height + extra_value) / (slide_height + min_margin * 2));
												}
											}							
											if(setting.maxSlide != 'auto')
											{
												max_slide = Math.min(parseInt(typeof(setting.maxSlide) == 'function' ? setting.maxSlide(_self, _slides) : setting.maxSlide),  max_slide);
											}
											if(setting.minSlide != 'auto')
											{
												min_slide = Math.max(parseInt(typeof(setting.minSlide) == 'function' ? setting.minSlide(_self, _slides) : setting.minSlide),  max_slide);
											}
											max_slide = Math.max(min_slide, max_slide);
										}
										if(responsive_fix_width)
										{
											if(init || fix_slide > 0)
											{												
												$.each(_slides.filter(':nth-child(' + max_slide + 'n)'), function() {
													$(this).prevAll().slice(0, max_slide - 1).add($(this)).wrapAll('<div' + (setting.slidesClass ? ' class="' + setting.slidesClass + '"' : '') + ' />');
												});
												_parent.children().filter(_slides).wrapAll('<div' + (setting.slidesClass ? ' class="' + setting.slidesClass + '"' : '') + ' />');
											}
											_parent.children().css(setting.direction == 'horizontal' ? {
												position: 'relative',
												width: width + 'px'
											} : {
												position: 'relative',
												height: height + 'px'
											});
										}
										else
										{
											var tmp_count = 1;
											var tmp_margin = min_margin * 2;
											if(setting.direction == 'horizontal')
											{
												var tmp_width = ! skip_boundary ? tmp_margin : 0;
												$.each(_slides, function() {
													var tmp_slide_width = getSize($(this)).width + tmp_margin;
													var tmp_total = tmp_width + tmp_slide_width;
													if((tmp_total - extra_value) > width || ((setting.maxSlide != 'auto' || fix_slide > 0) && tmp_count >= max_slide))
													{
														$($(this).prevAll().filter(_slides).get().reverse()).wrapAll('<div' + (setting.slidesClass ? ' class="' + setting.slidesClass + '"' : '') + ' style="width: ' + (tmp_width - extra_value) + 'px;" />');
														tmp_width = tmp_slide_width;
														tmp_count = 1;
														if(! skip_boundary)
														{
															tmp_width += tmp_margin;
														}
													}
													else
													{
														tmp_width = tmp_total;
														tmp_count++;
													}
												});
												if(init || fix_slide > 0)
												{
													_parent.children().filter(_slides).wrapAll('<div' + (setting.slidesClass ? ' class="' + setting.slidesClass + '"' : '') + ' style="width: ' + (tmp_width - extra_value) + 'px;" />');
												}
												else
												{
													_parent.children().css('width', (tmp_width - extra_value) + 'px');
												}												
											}
											else
											{
												var tmp_height = ! skip_boundary ? tmp_margin : 0;
												$.each(_slides, function() {
													var tmp_slide_height = getSize($(this)).height + tmp_margin;
													var tmp_total = tmp_height + tmp_slide_height;
													if((tmp_total - extra_value) > height || ((setting.maxSlide != 'auto' || fix_slide > 0) && tmp_count >= max_slide))
													{
														$($(this).prevAll().filter(_slides).get().reverse()).wrapAll('<div' + (setting.slidesClass ? ' class="' + setting.slidesClass + '"' : '') + ' style="height: ' + (tmp_height - extra_value) + 'px;" />');
														tmp_height = tmp_slide_height;
														tmp_count = 1;
														if(! skip_boundary)
														{
															tmp_height += tmp_margin;
														}
													}
													else
													{
														tmp_height = tmp_total;
														tmp_count++;
													}
												});
												_parent.children().filter(_slides).wrapAll('<div' + (setting.slidesClass ? ' class="' + setting.slidesClass + '"' : '') + ' style="height: ' + (tmp_height - extra_value) + 'px;" />');
											}	
											_parent.children().css({
												position: 'relative'
											});									
										}
										var tmp_slides = _parent.children(':not([data-dummy="true"])');
										total = tmp_slides.length;
										count = Math.min(count, total);
										var offset = typeof(setting.offset) == 'function' ? setting.offset(_self, _slides) : setting.offset;
										var dummy_slide_total = 0;
										if((init || fix_slide > 0) && dummy_slide)
										{
											var slider_width = getSize(_self).width;
											var remain_width;
											do {
												_parent.prepend(tmp_slides.clone().attr('data-dummy', true));
												_parent.append(tmp_slides.clone().attr('data-dummy', true));
												remain_width = _parent.children(':last').offset().left - offset;
												dummy_slide_total += total;
											} while(remain_width < slider_width);											
										}
										if(! setting.fadeOut)
										{
											if(responsive_fix_width)
											{										
												_parent.children().css(setting.direction == 'horizontal' ? {
													left: '-' + (dummy_slide_total * (width + offset)) + 'px'
												} : {
													top: '-' + (dummy_slide_total * (height + offset)) + 'px'
												});
											}
											else
											{
												_parent.children().css(setting.direction == 'horizontal' ? {
													left: '-' + prevValue(_parent.children(), dummy_slide_total, offset) + 'px'
												} : {
													top: '-' + prevValue(_parent.children(), dummy_slide_total, offset) + 'px'
												});	
											}
										}
										else if(init || fix_slide > 0)
										{
											count = 1;
											_parent.children().filter(':gt(0)').hide();
											updateClass();
											slideAnimate(1, 'next', true, true);
										}
										if(setting.autoMargin)
										{
											var margin = 0;
											if(responsive_fix_width)
											{
												var counted_slide = max_slide;
												var factor = 1;
												if(skip_boundary) 
												{
													counted_slide--;
												}
												else
												{
													factor = max_slide / (max_slide + 1);
												}
												var value1, value2;
												if(setting.direction == 'horizontal')
												{
													value1 = width;
													value2 = getSize(_first).width;
												}
												else
												{
													value1 = height;
													value2 = getSize(_first).height;										
												}
												margin = Math.floor((value1 - (max_slide * value2)) / counted_slide / 2 * factor * 10) / 10;
												if(margin > 0)
												{
													_slides.css(setting.direction == 'horizontal' ? {
														marginLeft: margin + 'px',
														marginRight: margin + 'px'
													} : {
														marginTop: margin + 'px',
														marginBottom: margin + 'px'
													});
												}
												if(! skip_boundary)
												{
													var margin_double = margin * 2;
													$.each(_parent.children(), setting.direction == 'horizontal' ? function() {
														$(this).children(':first').css('marginLeft', margin_double + 'px');
														$(this).children(':last').css('marginRight', margin_double + 'px');
													} : function() {
														$(this).children(':first').css('marginTop', margin_double + 'px');
														$(this).children(':last').css('marginBottom', margin_double + 'px');
													});
												}
											}
											else
											{
												if(setting.direction == 'horizontal')
												{
													$.each(_parent.children(), function() {
														var counted_slide = $(this).children().length;
														if(! skip_boundary)
														{
															counted_slide++;
														}
														margin = Math.floor((getSize($(this)).width - prevValue($(this).children(), $(this).children().length, offset) + extra_value) / counted_slide / 2 * 10) / 10;
														$(this).children().css({
															marginLeft: margin + 'px',
															marginRight: margin + 'px'
														});
														if(! skip_boundary)
														{
															var margin_double = margin * 2;
															$(this).children(':first').css('marginLeft', margin_double + 'px');
															$(this).children(':last').css('marginRight', margin_double + 'px');
														}
													});
												}
												else
												{	
													$.each(_parent.children(), function() {
														var counted_slide = $(this).children().length;
														if(! skip_boundary)
														{
															counted_slide++;
														}
														margin = Math.floor((getSize($(this)).height - prevValue($(this).children(), $(this).children().length, offset) + extra_value) / counted_slide / 2 * 10) / 10;
														$(this).children().css({
															marginTop: margin + 'px',
															marginBottom: margin + 'px'
														});
														if(! skip_boundary)
														{
															var margin_double = margin * 2;
															$(this).children(':first').css('marginTop', margin_double + 'px');
															$(this).children(':last').css('marginBottom', margin_double + 'px');
														}
													});									
												}
											}
											if(skip_boundary)
											{
												$.each(_parent.children(), setting.direction == 'horizontal' ? function() {
													$(this).children(':first').css('marginLeft', 0);
													$(this).children(':last').css('marginRight', 0);
												} : function() {
													$(this).children(':first').css('marginTop', 0);
													$(this).children(':last').css('marginBottom', 0);
												});
											}
										}
										if(setting.clickToSlide)
										{
											_slides.click(function() {
												var index = Object.values(_slides).findIndex(x => x == this) + 1;
												if(index != count)
												{
													slideAnimate(index, index > count ? 'next' : 'prev');
												}
											});
										}
										if(setting.pager)
										{
											_pager.children().remove();
											for(var i = 1; i <= total; i++)
											{
												_pager.append(typeof(setting.pagerTemplate) == 'function' ? setting.pagerTemplate(i, total) : setting.pagerTemplate).children(':last').click(function(e) {
													_self[0].page($(this).index() + 1);
													e.preventDefault();
												});
											}
										}
										updateClass();
										if(setting.autoHide)
										{
											if(total > 1)
											{
												_prev.add(_next).add(_pager).show();
											}
											else
											{
												_prev.add(_next).add(_pager).hide();
											}
										}
										setting.afterResize(_self, _slides, count, total);
									}
								}
							}
							var auto_play = setting.autoPlay;
							_self[0].start = function() {
								setting.autoPlay = auto_play;
								autoSlide();
							};
							_self[0].stop = function() {
								setting.autoPlay = 0;
							};
							_self[0].prev = function() {
								prevSlide();
							};
							_self[0].next = function() {
								nextSlide();
							};
							_self[0].page = function(page) {
								if(count != page)
								{
									var old_count = count;
									var new_count = Math.min(page, total);
									if(new_count != old_count)
									{
										slideAnimate(new_count, new_count > old_count ? 'next' : 'prev');
									}
								}
							};
							_self[0].jump = function(page) {
								if(count != page)
								{
									var old_count = count;
									var new_count = Math.min(page, total);
									if(new_count != old_count)
									{
										slideAnimate(new_count, new_count > old_count ? 'next' : 'prev', undefined, true);
									}
								}
							};
							_self[0].update = function() {
								width = height = 0;
							};
							_self[0].refresh = function() {
								updateClass();
							};
							_self[0].exec = function(extra) {
								extra(_self, _slides, count, total);
							};
							_self[0].destroy = function() {
								clearInterval(auto_interval);
								clearInterval(resize_interval);
								clearInterval(init_interval);
								_parent.children().stop(true, true);
								_parent.append(_slides).children().not(_slides).remove();
								_pager.children().remove();
								if(setting.autoMargin)
								{								
									_slides.css(setting.direction == 'horizontal' ? {
										marginLeft: '',
										marginRight: ''
									} : {
										marginTop: '',
										marginBottom: ''
									});
								}
								_prev.add(_next).off('click').removeClass(setting.disableClass);
								if(setting.beforeClass)
								{
									_parent.children().removeClass(setting.beforeClass);
								}
								if(setting.currentClass)
								{
									_parent.children().removeClass(setting.currentClass);
								}
								if(setting.swipeControl)
								{
									_parent.off('touchstart touchmove touchend');
									if(setting.swipeByMouse)
									{
										_parent.off('mousedown mousemove mouseup');
										_slides.off('click');
									}
								}
								if(setting.clickToSlide)
								{
									_slides.off('click');
								}
								if(setting.autoHide)
								{
									_prev.add(_next).add(_pager).show();
								}
								_self[0].start = _self[0].stop = _self[0].page = _self[0].update = _self[0].refresh = _self[0].exec = _self[0].destroy = _self[0].total = _self[0].init = undefined;
							};
							_self[0].total = total;
							resize_interval = setInterval(resize, setting.timeout);
							resize(true);
							autoSlide();
							_self[0].init = true;
							setting.afterInit(_self, _slides, count, total);
						}
						var initSlider = function() {
							if(_self.is(':visible'))
							{
								clearInterval(init_interval);
								if(setting.lazyLoad)
								{
									var all_lazy_obj = $('img[data-src], iframe[data-src], source[data-src]', _self);
									if(all_lazy_obj.length > 0)
									{				
										var lazy_count = 0;	
										_self.css('opacity', 0);				
										$.each(all_lazy_obj, function() {
											$(this).attr('src', $(this).attr('data-src'));
											$(this).removeAttr('data-src');
										});
										all_lazy_obj.load(function() {
											if(++lazy_count >= all_lazy_obj.length)
											{
												_self.animate({
													opacity: 1
												});
												buildSlider();
											}
										});
									}
									else
									{
										buildSlider();
									}
								}
								else
								{
									buildSlider();
								}
							}
						}
						init_interval = setInterval(initSlider, setting.timeout);
						initSlider();
					});
				});
			}
			else
			{
				return this.each(function() {
					if(this.init)
					{
						switch(options)
						{
							case 'start':
								this.start();
								break;
							case 'stop':
								this.stop();
								break;
							case 'prev':
								this.prev();
								break;
							case 'next':
								this.next();
								break;
							case 'first':
								this.page(1);
								break;
							case 'last':
								this.page(this.total);
								break;
							case 'page':
								this.page(extra);
								break;
							case 'jump':
								this.jump(extra);
								break;
							case 'update':
								this.update();
								break;
							case 'refresh':
								this.refresh();
								break;
							case 'exec':
								this.exec(extra);
								break;
							case 'destroy':
								this.destroy();
								break;
						}						
					}
				});
			}
		}
	});
})(jQuery);