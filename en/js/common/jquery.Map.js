/*
 * jQuery Map Plugin
 * Copyright (c) 2015 Alvin So
 * Version: 1.48 (27-JUN-2022)
 */
(function($) {
	$.fn.extend({
		Map: function(options) {
			var _translate = {};
			var setting = {
				type: 'google',						//google or baidu or autonavi
				data: {},							//json format
				marker: false,						//false or { icon: '', width: '', height: '' }
				staticMarker: false,				//false or { icon: '', width: '', height: '' }
				transImage: 'img/trans.png',		//transparent image path
				showMarker: true,					//true or false
				key: '',							//developer key (baidu must need)
				responsiveWidth: 0,					//when object width less than this value, it will change to static image (int or function)
				staticWidth: 'auto',				//static image width
				staticHeight: 'auto',				//static image height
				path: {								//path style
					colour: '#ff0000',
					opacity: 0.4,
					weight: 4
				},
				style: [],							//map style
				staticStyle: true,					//static map style,
				zoomDelay: 500,                     //map zoom delay
				lang: '',                     		//map language (support google map and autonavi only)
				convert: false,                		//convert Latitude and Longitude from google to other format
				ready: function(map, element) {}	//ready event
			};
			$.extend(true, setting, options);
			switch(setting.type.toLowerCase())
			{
				case 'baidu':
				case 'autonavi':
					setting.type = setting.type.toLowerCase();
					break;
				default:
					setting.type = 'google';
					break;					
			}
			setting.data.center_lat = parseFloat(setting.data.center_lat);
			setting.data.center_lng = parseFloat(setting.data.center_lng);
			setting.data.map_lat = parseFloat(setting.data.map_lat);
			setting.data.map_lng = parseFloat(setting.data.map_lng);
			setting.data.path = setting.data.path ? $.map(setting.data.path.split('|'), function(value, key) {
				var ll = value.split(',');
				return {
					lat: parseFloat(ll[0]),
					lng: parseFloat(ll[1])
				};
			}) : [];
			var init = function(ready, _self) {
				var interval = setInterval(function() {
					var body = $('body')[0];
					if(typeof(ready) == 'undefined' || $.data(body, 'mapReady'))
					{
						if(! _self)
						{
							_self = $.data(body, setting.type + 'MapObj');
							window[setting.type + 'MapLoad'] = undefined;
						}
						$.data(body, 'mapReady', true);
						clearInterval(interval);						
						switch(setting.type)
						{
							case 'baidu':
								var map = new BMap.Map(_self);
								if(setting.style)
								{
									map.setMapStyleV2(typeof(setting.style) == 'string' ? {
										style: setting.style
									} : {
										styleJson: setting.style 
									});  							
								}
								translate(setting.data.center_lat, setting.data.center_lng, function(lat, lng) {
									map.centerAndZoom(new BMap.Point(lat, lng), setting.data.zoom); 
									map.addControl(new BMap.NavigationControl({
										type: BMAP_NAVIGATION_CONTROL_ZOOM,
										anchor: BMAP_ANCHOR_BOTTOM_RIGHT
									}));
									map.addControl(new BMap.MapTypeControl({
										mapTypes: [ BMAP_NORMAL_MAP, BMAP_HYBRID_MAP ],
										anchor: BMAP_ANCHOR_TOP_LEFT
									}));
									var panoramaCtrl = new BMap.PanoramaControl({
										anchor: BMAP_ANCHOR_BOTTOM_RIGHT,
										offset: new BMap.Size(10, 60)
									});
									map.addControl(panoramaCtrl);
									map.enableScrollWheelZoom(true);
									var marker_setting = {};
									if(setting.showMarker)
									{
										var marker = setting.staticMarker ? setting.staticMarker : setting.marker;
										if(marker)
										{
											marker_setting.icon = new BMap.Icon(marker.icon, new BMap.Size(marker.width, marker.height));
										}	
										translate(setting.data.map_lat, setting.data.map_lng, function(lat, lng) {
											map.addOverlay(new BMap.Marker(new BMap.Point(lat, lng), marker_setting));
										});
									}								
									if(setting.data.path)
									{
										var ll = [], tmp_ll = {};
										$.each(setting.data.path, function(key, value) {
											translate(value.lat, value.lng, function(lat, lng) {
												tmp_ll[key] = new BMap.Point(lat, lng);
												if(Object.keys(tmp_ll).length == setting.data.path.length)
												{
													$.each(tmp_ll, function(key, value) {
														ll.push(value);
														map.addOverlay(new BMap.Marker(value, marker_setting));
													});
													map.addOverlay(new BMap.Polyline(
														ll,    
														{
															strokeColor: setting.path.colour, 
															strokeWeight: setting.path.weight, 
															strokeOpacity: setting.path.opacity
														}
													)); 
												}
											});
										}); 
									}
									if(setting.data.map_type == 'Street')
									{
										translate(setting.data.map_lat, setting.data.map_lng, function(lat, lng) {
											var panorama = new BMap.Panorama(_self);
											panorama.setPosition(new BMap.Point(lat, lng));
											panorama.setPov({
												heading: setting.data.heading, 
												pitch: setting.data.pitch
											});
										});
									}
								});
								break;
							case 'autonavi':
								var map = new AMap.Map(_self, $.extend({
									resizeEnable: true
								}, setting.lang ? {
									lang: setting.lang
								} : {}));
								if(setting.style && typeof(setting.style) == 'string')
								{
									map.setMapStyle('amap://styles/' + setting.style);  							
								}
								translate(setting.data.center_lat, setting.data.center_lng, function(lat, lng) {
									map.setZoomAndCenter(setting.data.zoom, [lat, lng]); 
									map.plugin(['AMap.ToolBar', 'AMap.MapType'], function() {
										map.addControl(new AMap.ToolBar({
											position: 'RB',
											liteStyle: true
										}));
										map.addControl(new AMap.MapType());  
									});
									var marker_setting = '';
									if(setting.showMarker)
									{
										var marker = setting.staticMarker ? setting.staticMarker : setting.marker;
										if(marker)
										{
											marker_setting = new AMap.Icon({            
												image: marker.icon,
												size: new AMap.Size(marker.width, marker.height)
											});
										}	
										translate(setting.data.map_lat, setting.data.map_lng, function(lat, lng) {
											new AMap.Marker({
												map: map,
												position: [lat, lng],
												icon: marker_setting       
											});
										});
									}								
									if(setting.data.path)
									{
										var ll = [], tmp_ll = {};
										$.each(setting.data.path, function(key, value) {
											translate(value.lat, value.lng, function(lat, lng) {
												tmp_ll[key] = [lat, lng];
												if(Object.keys(tmp_ll).length == setting.data.path.length)
												{
													$.each(tmp_ll, function(key, value) {
														ll.push(value);
														new AMap.Marker({
															map: map,
															position: value,
															icon: marker_setting       
														});
													});
													new AMap.Polyline({
														map: map,
														path: ll,
														strokeColor: setting.path.colour,
														strokeWeight: setting.path.weight, 
														strokeOpacity: setting.path.opacity
													}); 
												}
											});
										}); 
									}
								});
								break;
							default:
								var map = new google.maps.Map(_self, {
									zoom: parseInt(setting.data.zoom),
									center: new google.maps.LatLng(setting.data.center_lat, setting.data.center_lng),
									mapTypeId: google.maps.MapTypeId.ROADMAP,
									streetViewControl: true,
									styles: setting.style
								});
								var marker_setting = {
									position: new google.maps.LatLng(setting.data.map_lat, setting.data.map_lng),
									animation: google.maps.Animation.DROP,
									map: map,
									draggable: false
								};
								if(setting.showMarker)
								{
									if(setting.marker)
									{
										var point = new google.maps.Point(0, 0);
										var anchor = 'point' in setting.marker ? new google.maps.Point(setting.marker.point[0], setting.marker.point[1]) : null;
										if('width' in setting.marker && 'height' in setting.marker)
										{
											marker_setting.icon = new google.maps.MarkerImage(setting.marker.icon, null, point, anchor, new google.maps.Size(setting.marker.width, setting.marker.height));
										}
										else
										{
											marker_setting.icon = new google.maps.MarkerImage(setting.marker.icon, null, point, anchor);
										}
									}
									new google.maps.Marker(marker_setting);
								}	
								if(setting.data.path)
								{
									$.each(setting.data.path, function(key, value) {
										new google.maps.Marker($.extend(marker_setting, {
											position: new google.maps.LatLng(value.lat, value.lng)
										}));
									});
									new google.maps.Polyline({
										path: setting.data.path,
										strokeColor: setting.path.colour,
										strokeOpacity: setting.path.opacity,
										strokeWeight: setting.path.weight,
										map: map
									});
								}						
								var panorama = map.getStreetView();
								if(setting.data.map_type == 'Street')
								{
									panorama.setPosition(new google.maps.LatLng(setting.data.map_lat, setting.data.map_lng));
									panorama.setPov({
									   heading: parseInt(setting.data.heading),
									   zoom: parseInt(setting.data.street_view_zoom),
									   pitch: parseInt(setting.data.pitch)
									});
									panorama.setVisible(true);
								}
								else
								{
									panorama.setVisible(false);
								}
								break;
						}
						setting.ready(map, $(_self));
						_self.map = map;
					}
				}, 1000);
			};	
			return this.each(function() {
				var _self = $(this);
				var body = $('body')[0];
				var map_container, map_link, map_image, fake_layer, fake_layer_img, hover_timeout;
				if(setting.responsiveWidth != 0)
				{					
					_self.html('<div class="fake-layer" style="width: 100%; height: 100%;"><div style="width: 100%; height: 100%;"></div><img style="position: absolute; top: 0; left: 0; width: 100%; height: 100%;" src="' + setting.transImage + '" /></div><a style="display: block;" target="_blank"><img alt="" style="max-width: 100%; max-height: 100%;" /></a>');
					fake_layer = _self.children('.fake-layer');
					fake_layer_img = fake_layer.children('img');
					map_container = fake_layer.children('div');
					map_link = _self.children('a');
					map_image = map_link.children('img');
					_self.hover(function() {
						clearTimeout(hover_timeout);
						hover_timeout = setTimeout(function() {
							fake_layer_img.hide();
						}, setting.zoomDelay);
					}, function() {
						fake_layer_img.show();
					});
				}
				else
				{
					map_container = _self;
					fake_layer = _self.children('div');
				}
				if($.data(body, setting.type + 'MapLoad'))
				{
					init(true, map_container[0]);
				}
				else
				{
					window[setting.type + 'MapLoad'] = init;
					$.data(body, setting.type + 'MapObj', map_container[0]);
					switch(setting.type)
					{
						case 'baidu':
							$.getScript('//api.map.baidu.com/api?v=3.0' + (setting.key ? '&ak=' + setting.key : '') + '&callback=' + setting.type + 'MapLoad');
							break;
						case 'autonavi':
							$.getScript('//webapi.amap.com/maps?v=1.4.6' + (setting.key ? '&key=' + setting.key : '') + '&callback=' + setting.type + 'MapLoad');
							break;
						default:
							if(setting.key)
							{								
								$.getScript('//maps.google.com/maps/api/js?sensor=true&key=' + setting.key + (setting.lang ? '&language=' + setting.lang : '') + '&callback=' + setting.type + 'MapLoad');
							}
							else
							{
								window[setting.type + 'MapLoad'] = undefined;
								$.data(body, 'mapReady', true);
								var link_url = '//maps.google.com/maps?q=';
								if('address' in setting.data)
								{
									link_url += setting.data.address;								
								}
								else
								{
									if(setting.showMarker)
									{
										link_url += setting.data.map_lat + ',' + setting.data.map_lng;
									}
									else
									{
										link_url += setting.data.center_lat + ',' + setting.data.center_lng;
									}
								}
								link_url += '&z=' + setting.data.zoom + (setting.lang ? '&hl=' + setting.lang : '') + '&output=embed';
								_self.html('<iframe width="100%" height="100%" frameborder="0" scrolling="no" src="' + link_url + '" allowfullscreen></iframe>');
								var map = _self.children('iframe');
								setting.ready(map, $(_self));
								_self.map = map;
							}
							break;
					}
				}
				if(map_image)
				{
					var width = setting.staticWidth == 'auto' ? map_container.width() : setting.staticWidth;
					var height = setting.staticHeight == 'auto' ? map_container.height() : setting.staticHeight;
					var map_static_url, link_static_url;
					switch(setting.type)
					{
						case 'baidu':
							width = Math.min(width, 1024);
							height = Math.min(height, 1024);										
							translate(setting.data.center_lat, setting.data.center_lng, function(lat, lng) {
								link_static_url = '//map.baidu.com/?location=';
								if(setting.showMarker)
								{
									translate(setting.data.map_lat, setting.data.map_lng, function(lat, lng) {
										link_static_url += base64_decode(lat) + ',' + base64_decode(lng);
										map_link.attr('href', link_static_url);
									});
								}
								else
								{
									link_static_url += base64_decode(lat) + ',' + base64_decode(lng);
									map_link.attr('href', link_static_url);
								}
								if(setting.data.map_type == 'Street')
								{
									map_static_url = '//api.map.baidu.com/panorama?&width=' + width + '&height=' + height + (setting.key ? '&ak=' + setting.key : '');
									if(setting.showMarker)
									{
										translate(setting.data.map_lat, setting.data.map_lng, function(lat, lng) {
											map_static_url += '&location=' + base64_decode(lat) + ',' + base64_decode(lng);
											map_image.attr('src', map_static_url);
										});
									}
									else
									{
										map_static_url += '&location=' + base64_decode(lat) + ',' + base64_decode(lng);
										map_image.attr('src', map_static_url);
									}
								}
								else
								{
									map_static_url = '//api.map.baidu.com/staticimage?center=' + base64_decode(lat) + ',' + base64_decode(lng) + '&zoom=' + Math.min(setting.data.zoom, 18) + '&width=' + width + '&height=' + height + '&dpiType=ph&scale=1';
									var marker_setting = '';
									var marker = setting.staticMarker ? setting.staticMarker : setting.marker;
									if(marker)
									{
										marker_setting = '&markerStyles=-1,' + encodeURIComponent(marker.icon);
									}
									if(setting.showMarker)
									{
										translate(setting.data.map_lat, setting.data.map_lng, function(lat, lng) {
											if(setting.data.path.length > 1)
											{
												addPath(map_image, map_static_url, marker_setting);
											}
											else
											{
												map_static_url += '&markers=' + base64_decode(lat) + ',' + base64_decode(lng) + marker_setting;
												map_image.attr('src', map_static_url);
											}
										});
									}
									else if(setting.data.path.length > 1)
									{
										addPath(map_image, map_static_url, marker_setting);
									}
									else
									{
										map_image.attr('src', map_static_url);
									}
								}
							});
							break;
						case 'autonavi':
							width = Math.min(width, 1024);
							height = Math.min(height, 1024);										
							translate(setting.data.center_lat, setting.data.center_lng, function(lat, lng) {
								link_static_url = '//www.amap.com/?location=';
								if(setting.showMarker)
								{
									translate(setting.data.map_lat, setting.data.map_lng, function(lat, lng) {
										link_static_url += lat + ',' + lng;
										map_link.attr('href', link_static_url);
									});
								}
								else
								{
									link_static_url += lat + ',' + lng;
									map_link.attr('href', link_static_url);
								}
								map_static_url = '//restapi.amap.com/v3/staticmap?location=' + lat + ',' + lng + '&zoom=' + Math.min(setting.data.zoom, 17) + '&size=' + width + '*' + height + '&scale=1' + (setting.key ? '&key=' + setting.key : '');
								var marker_setting = ',,';
								var marker = setting.staticMarker ? setting.staticMarker : setting.marker;
								if(marker)
								{
									marker_setting = '-1,' + encodeURIComponent(marker.icon);
								}
								if(setting.showMarker)
								{
									translate(setting.data.map_lat, setting.data.map_lng, function(lat, lng) {
										if(setting.data.path.length > 1)
										{
											addPath(map_image, map_static_url, marker_setting);
										}
										else
										{
											map_static_url += '&markers=' + marker_setting + ':' + lat + ',' + lng;
											map_image.attr('src', map_static_url);
										}
									});
								}
								else if(setting.data.path.length > 1)
								{
									addPath(map_image, map_static_url, marker_setting);
								}
								else
								{
									map_image.attr('src', map_static_url);
								}
							});
							break;
						default:
							link_static_url = '//maps.google.com/maps?q=';
							if(setting.showMarker)
							{
								link_static_url += setting.data.map_lat + ',' + setting.data.map_lng;
							}
							else
							{
								link_static_url += setting.data.center_lat + ',' + setting.data.center_lng;
							}
							link_static_url += '&zoom=' + setting.data.zoom + '&maptype=roadmap' + (setting.lang ? '&language=' + setting.lang : '');
							if(setting.data.map_type == 'Street')
							{
								map_static_url = '//maps.googleapis.com/maps/api/streetview?location=' + setting.data.center_lat + ',' + setting.data.center_lng + '&zoom=' + setting.data.street_view_zoom + '&heading=' + setting.data.heading + '&pitch=' + setting.data.pitch + (setting.key ? '&key=' + setting.key : '');
							}
							else
							{
								map_static_url = '//maps.googleapis.com/maps/api/staticmap?center=' + setting.data.center_lat + ',' + setting.data.center_lng + '&zoom=' + setting.data.zoom + (setting.key ? '&key=' + setting.key : '');
								var marker_setting = '';
								if(setting.showMarker)
								{				
									var marker = setting.staticMarker ? setting.staticMarker : setting.marker;
									if(marker)
									{
										marker_setting = 'icon:' + encodeURIComponent(marker.icon) + '%7C';
									}
									map_static_url += '&markers=' + marker_setting + setting.data.map_lat + ',' + setting.data.map_lng;
								}
								if(setting.data.path)
								{
									$.each(setting.data.path, function(key, value) {
										map_static_url += '&markers=' + marker_setting + value.lat + ',' + value.lng;
									});
									map_static_url += '&path=color:0x' + setting.path.colour.replace('#', '') + (setting.path.opacity * 255).toString(16) + '|weight:' + setting.path.weight + '|' + $.map(setting.data.path, function(value, key) {
										return value.lat + ',' + value.lng;
									}).join('|');
								}							
								map_static_url += '&maptype=roadmap';
							}						
							if(setting.style && setting.staticStyle)
							{							
								var get = [];
								$.each(setting.style, function(key, value) {
									var tmp = []
									$.each(value, function(ke, val) {
										var name = ke.toLowerCase().replace('type', '');
										if(typeof(val) == 'string')
										{      
											tmp.push(name + ':' + val);
										}
										else
										{
											$.each(val, function(k, v) {
												name = Object.keys(v)[0];
												tmp.push(name + ':' + v[name].toString().replace('#', '0x'));
											});
										}
									});
									get.push('style=' + tmp.join('|'));
								});
								map_static_url += '&' + get.join('&');
							}						
							map_static_url += '&size=' + width + 'x' + height + '&scale=4&mobile=true' + (setting.lang ? '&language=' + setting.lang : '') + '&format=png';
							map_link.attr('href', link_static_url);
							map_image.attr('src', map_static_url);
							break;
					}
					map_link.hide();
					var resize = function() {
						var width = typeof(setting.responsiveWidth) == 'function' ? setting.responsiveWidth() : setting.responsiveWidth;
						if(window.innerWidth <= width)
						{
							map_link.show();
							fake_layer.hide();
						}	
						else
						{
							fake_layer.show();
							map_link.hide();
						}
					};
					$(window).resize(resize);
					resize();
				}
				if(setting.type != 'google' || setting.key)
				{
					$.data(body, setting.type + 'MapLoad', true);
				}
			});
			
			function translate(lat, lng, callback) {
				if('address' in setting.data)
				{
					var latlng = setting.data.address.split(',');
					lat = latlng[0];			
					lng = latlng[1];			
				}
				if(setting.convert)
				{	
					var index = setting.type + '|' + lat + '|' + lng;
					if(! (index in _translate))
					{						
						switch(setting.type)
						{
							case 'baidu':
								$.getJSON('//api.map.baidu.com/ag/coord/convert?from=2&to=4&x=' + lng + '&y=' + lat + '&callback=?', function(result) {
									_translate[index] = {
										lat: result.x,
										lng: result.y
									};
									callback(_translate[index].lat, _translate[index].lng);
								}).fail(function() {
							    	alert('Map error, please check your key!');
							    });
								break;
							case 'autonavi':
								$.getJSON('//restapi.amap.com/v3/assistant/coordinate/convert?key=' + setting.key + '&locations=' + lng + ',' + lat + '&coordsys=gps&callback=?', function(result) {
									if(result.locations)
									{									
										var latlng = result.locations.split(',');
										_translate[index] = {
											lat: parseFloat(latlng[0]),
											lng: parseFloat(latlng[1])
										};
										callback(_translate[index].lat, _translate[index].lng);
									}
									else
									{
										alert(result.info);
									}
								}).fail(function() {
							    	alert('Map error, please check your key!');
							    });
								break;					
						}
					}
					else
					{
						callback(_translate[index].lat, _translate[index].lng);
					}
				}
				else
				{
					switch(setting.type)
					{
						case 'baidu':
							callback(lng, lat);
							break;
						default:
							callback(lat, lng);
							break;
					}
				}
			}
			
			function base64_decode(s) {
				var e = {}, i, b = 0, c, x, l = 0, a, r = '', w = String.fromCharCode, L = s.length;
				var A = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
				for(i = 0; i < 64; i++) 
				{
					e[A.charAt(i)] = i;
				}
				for(x = 0; x < L; x++)
				{
					c = e[s.charAt(x)];
					b= (b << 6) + c;
					l += 6;
					while (l >= 8) 
					{
						((a = (b >>> (l -= 8)) & 0xff) || (x < (L - 2))) 
						&& (r += w(a));
					}
				}
				return r;
			};
			
			function addPath(map_image, map_static_url, marker_setting) {
				var ll = [], tmp_ll = {};
				$.each(setting.data.path, function(key, value) {
					translate(value.lat, value.lng, function(lat, lng) {
						switch(setting.type)
						{
							case 'baidu':
								tmp_ll[key] = base64_decode(lat) + ',' + base64_decode(lng);
								break;
							case 'autonavi':
								tmp_ll[key] = lat + ',' + lng;
								break;		
						}
						if(Object.keys(tmp_ll).length == setting.data.path.length)
						{
							$.each(tmp_ll, function(key, value) {
								ll.push(value);
							});
							switch(setting.type)
							{
								case 'baidu':
									map_static_url += '&markers=' + ll.join('|') + marker_setting + '&paths=' + ll.join(';') + '&pathStyles=0x' + setting.path.colour.replace('#', '') + ',' + setting.path.weight + ',' + setting.path.opacity;
									break;
								case 'autonavi':
									map_static_url += '&markers=' + marker_setting + ':' + ll.join(';') + '&paths=' + setting.path.weight + ',0x' + setting.path.colour.replace('#', '') + ',' + setting.path.opacity + ',,:' + ll.join(';');
									break;	
							}
							map_image.attr('src', map_static_url);
						}
					});
				}); 
			}
		}
	});
})(jQuery);