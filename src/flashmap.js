var iMap = function() {
	try {
		this.application = Ao.application;
		this.layerTool = Ao.$("#net.yhte.gis.tools.LayerTool").getInstance();
		this.AS = this.layerTool.attr("map");
		this.clientLayer = this.layerTool.attr("clientLayer");
		this.getDrawTool = function() {
			return this.layerTool.attr("drawTool")
		};
		this.getEditTool = function() {
			return this.layerTool.attr("editTool")
		};
		this.getNaviTool = function() {
			return this.layerTool.attr("naviTool")
		}
	} catch (a) {
		alert("构建iMap实例出错:" + a)
	}
};
iMap.extend = function(b) {
	for (var a in b) {
		if (this.prototype.hasOwnProperty(a)) {
			alert("扩展方法:" + a + "已存在!");
			continue
		}
		this.prototype[a] = b[a]
	}
};
iMap.VERSION = "特别版v.0.1";
iMap.prototype.toString = function() {
	return "[iMap:" + this.type + "]"
};
(function(e) {
	var d = function(k, m, o) {
		var o = o || "";
		for (var l = 0; l < m.length; l++) {
			var p = m[l] + o;
			var j = k + "." + p;
			var script = "iMap['" +p + 
                    "'] = function(options){return Ao.$('" + 
                    j + "',options);};"
           eval(script);
		}
	};
	var h = "com.esri.ags";
	d(h, ["Graphic"]);
	var c = h + ".geometry";
	d(c, ["MapPoint", "Polyline", "Polygon", "Extent"]);
	var b = h + ".symbols";
	d(b,	["SimpleLine", "Composite", "PictureFill", "SimpleMarker",
					"SimpleFill", "Text", "PictureMarker"], "Symbol");
	var f = h + ".layers";
	d(f, ["GraphicsLayer"]);
	var a = "net.yhte.gis";
	var g = a + ".layers";
	d(g, ["GJson", "Json", "GMap", "YhDynamic"], "Layer")
})(iMap);
iMap.extend({
			print : function(b) {
				var a = Ao.$("mx.printing.FlexPrintJob");
				if (a.start() != true) {
					return
				}
				a.addObject(map.AS, b || "none");
				a.send()
			},
			navi : function(a) {
				if (a == "next") {
					this.getNaviTool().zoomToNextExtent()
				} else {
					if (a == "prev") {
						this.getNaviTool().zoomToPrevExtent()
					} else {
						if (a == null) {
							this.getNaviTool().deactivate()
						} else {
							this.getNaviTool().activate(a, true)
						}
					}
				}
				return this
			},
			draw : function(d, b, c) {
				var a = arguments.callee;
				if (!d) {
					this.getDrawTool().deactivate()
				} else {
					this.getDrawTool().activate(d, true)
				}
				if (b) {
					if (a.drawEndHandler) {
						this.getDrawTool().removeEventListener("drawEnd",
								a.drawEndHandler)
					}
					a.drawEndHandler = b;
					this.getDrawTool().addEventListener("drawEnd", b)
				}
				if (c) {
					if (a.drawStartHandler) {
						this.getDrawTool().removeEventListener("drawStart",
								a.drawStartHandler)
					}
					a.drawStartHandler = c;
					this.getDrawTool().addEventListener("drawStart", c)
				}
				return this
			},
			drawGraphic : function(g, e, d) {
				var c = arguments.callee;
				if (!g) {
					this.getDrawTool().deactivate()
				} else {
					var b = AsObject.attr(d, "style", "solid");
					var a = AsObject.attr(d, "color", 16777215);
					var f = AsObject.attr(d, "alpha", 1);
					var d = iMap.SimpleFillSymbol({
								style : b,
								color : a,
								alpha : f
							});
					this.getDrawTool().attr({
								fillSymbol : d
							});
					this.getDrawTool().activate(g, true)
				}
				if (e) {
					if (c.drawEndHandler) {
						this.getDrawTool().removeEventListener("drawEnd",
								c.drawEndHandler)
					}
					c.drawEndHandler = function(j) {
						var i = j.attr("graphic");
						var h = iMap.util.GeoUtil.Gra2GeoJSON(i);
						e(h, i)
					};
					this.getDrawTool().addEventListener("drawEnd",
							c.drawEndHandler)
				}
				return this
			},
			edit : function(a) {
				if (a instanceof AsObject) {
					this.getEditTool().activate(3, [a])
				}
				return this
			},
			add : function(f, b, d, h) {
				var j = this;
				var g = d;
				var e = function(m) {
					j.getDrawTool().removeEventListener("drawEnd", e);
					c();
					var k = m.attr("graphic.geometry");
					var l = j.add(k, b, g);
					if (h) {
						h.call(j, l)
					}
				};
				var c = function() {
					j.getDrawTool().deactivate();
					j.getEditTool().deactivate();
					j.getNaviTool().deactivate()
				};
				if (typeof(f) == "string") {
					c();
					var i = ["point", "polyline", "polygon"].indexOf(f);
					switch (i) {
						case -1 :
							j.getDrawTool().activate("mappoint");
							break;
						case 0 :
							j.getDrawTool().activate("mappoint");
							break;
						case 1 :
							j.getDrawTool().activate("polyline");
							break;
						case 2 :
							j.getDrawTool().activate("polygon");
							break
					}
					j.getDrawTool().addEventListener("drawEnd", e)
				} else {
					if (f instanceof AsObject) {
						var a = iMap.Graphic();
						a.attr({
									geometry : f,
									symbol : b,
									attributes : d
								});
						j.clientLayer.add(a);
						return a
					}
				}
			},
			toScreen : function(b) {
				var c = iMap.MapPoint({
							x : b.x,
							y : b.y
						});
				var a = this.AS.toScreen(c);
				return {
					x : a.attr("x"),
					y : a.attr("y")
				}
			}
		});
iMap.extend({
			extent : function(f) {
				var b = this;
				if (arguments.length == 0) {
					var g = b.AS.attr("extent.xmin");
					var e = b.AS.attr("extent.ymin");
					var d = b.AS.attr("extent.xmax");
					var a = b.AS.attr("extent.ymax");
					return [g, e, d, a]
				} else {
					var c = iMap.Extent({
								xmin : f[0],
								ymin : f[1],
								xmax : f[2],
								ymax : f[3]
							});
					b.AS.attr({
								extent : c
							});
					return this
				}
			},
			centerAt : function(a, d) {
				var b = this;
				var c = iMap.MapPoint({
							x : a[0],
							y : a[1]
						});
				if (b.AS.attr("spatialReference.wkid") == 102113 && a[0] < 180) {
					c = AsObject.$("#com.esri.ags.utils.WebMercatorUtil")
							.geographicToWebMercator(c)
				} else {
					if (b.AS.attr("spatialReference.wkid") == 4326
							&& a[0] > 180) {
						c = AsObject.$("#com.esri.ags.utils.WebMercatorUtil")
								.webMercatorToGeographic(c)
					}
				}
				b.AS.centerAt(c);
				if (typeof d === "number") {
					b.AS.attr({
								level : d
							})
				}
				return this
			},
			addLayer : function(a) {
				var b = iMap.YhDynamicLayer({
							url : a.url || null,
							where : a.where || null,
							outFields : a.outFields || [],
							mode : a.mode || "multi",
							showBusy : a.showBusy || false
						});
				this.AS.addLayer(b);
				return b
			},
			deactivateAllMode : function() {
				this.getNaviTool().deactivate();
				this.getDrawTool().deactivate();
				this.getEditTool().deactivate();
				return this
			},
			setYhMode : function(f, g, c) {
				this.deactivateAllMode();
				var b = this;
				var a = function(i) {
					var h = i.attr("graphic.geometry.x");
					var j = i.attr("graphic.geometry.y");
					g.call(b, [h, j]);
					b.getDrawTool().removeEventListener("drawEnd", a);
					b.deactivateAllMode()
				};
				var e = function(h) {
					if (g) {
						g.call(b, h)
					}
					b.getDrawTool().removeEventListener("drawEnd", d)
				};
				var d = function(j) {
					var i = j.attr("graphic.geometry");
					var h = b.AS.getLayer(c);
					h.query(i, e);
					b.deactivateAllMode()
				};
				if (f == "mark") {
					this.getDrawTool().activate("mappoint", true);
					this.getDrawTool().addEventListener("drawEnd", a)
				}
				return this
			}
		});
iMap.extend({
			addOvMap : function(b) {
				var a = this.application.attr("moduleTool");
				a.addModule("OverMap", b)
			},
			removeOvMap : function() {
				var a = map.application.attr("moduleTool").getModule("OverMap");
				a.attr("visible", false)
			}
		});
iMap.extend({
			addBaseLayer : function(b, a) {
				map.layerTool.load(b, a);
				map.clientLayer = map.layerTool.attr("clientLayer")
			},
			setToggleVisible : function(b) {
				var a = this.application.attr("moduleTool")
						.getModule("LayerToggle");
				a.attr("visible", b)
			},
			addLayerToggle : function(b) {
				var a = this.application.attr("moduleTool");
				a.addModule("LayerToggle", b)
			}
		});
iMap.extend({
			distance : function() {
				var i = this;
				var c = arguments.callee;
				var d = arguments[0] ? arguments[0] : function() {
				};
				var g = function(o) {
					var m = o.attr("graphic");
					map.clientLayer.add(m);
					var q = o.attr("graphic.geometry");
					var k = c.call(i, d, q);
					d(k);
					var n;
					if (k < 1000) {
						k = Math.round(k * 100) / 100;
						n = k + "米"
					} else {
						k = Math.round(k / 1000 * 100) / 100;
						n = k + "千米"
					}
					var u = q.attr("paths")[0];
					var s = u[u.length - 1];
					var t = iMap.PictureMarkerSymbol({
								source : map.baseurl + "css/cancel.png",
								xoffset : 15
							});
					var r = iMap.TextSymbol({
								color : 16711680,
								border : true,
								borderColor : 16711680,
								background : true,
								backgroundColor : 16777215,
								yoffset : -22,
								htmlText : "<font size='15'><b>总长:" + n
										+ "</b></font>"
							});
					var l = iMap.CompositeSymbol({
								symbols : [t, r]
							});
					var j = iMap.Graphic({
								geometry : s,
								symbol : l,
								toolTip : "删除此测距"
							});
					var p = function() {
						map.clientLayer.remove(m);
						map.clientLayer.remove(j);
						j.removeEventListener("click", p)
					};
					j.addEventListener("click", p);
					map.clientLayer.add(j);
					this.removeEventListener("drawEnd", arguments.callee);
					i.draw()
				};
				if (arguments.length < 2) {
					i.deactivateAllMode();
					i.getDrawTool().attr({
								showDrawTips : false
							});
					var h = iMap.SimpleLineSymbol({
								color : "0xff0000",
								width : 2
							});
					var e = iMap.SimpleMarkerSymbol({
								style : "circle",
								color : "0xFFFFFF",
								size : 8,
								outline : h
							});
					var a = iMap.SimpleLineSymbol({
								color : "0xff0000",
								width : 2.5
							});
					var b = iMap.CompositeSymbol({
								symbols : [a, e]
							});
					i.getDrawTool().attr("lineSymbol", b);
					i.draw("polyline", g)
				} else {
					if (arguments.length > 1
							&& arguments[1] instanceof AsObject
							&& arguments[1].klass === "Polyline") {
						var f = i.AS.attr("spatialReference.wkid");
						if (f == 102113) {
							arguments[1] = AsObject
									.$("#com.esri.ags.utils.WebMercatorUtil")
									.webMercatorToGeographic(arguments[1])
						}
						return AsObject.$("#net.yhte.gis.utils.GeometryUtil")
								.geodesicLengths([arguments[1]], "esriMeters")
					}
				}
			},
			area : function() {
				var c = this;
				var f = arguments.callee;
				var g = arguments[0] ? arguments[0] : function() {
				};
				var d = function(m) {
					var l = m.attr("graphic");
					l.attr("autoMoveToTop", false);
					map.clientLayer.add(l);
					var o = m.attr("graphic.geometry");
					var i = f.call(c, g, o);
					g(i);
					var j;
					if (i < 1000000) {
						i = Math.round(i * 100) / 100;
						j = i + "平方米"
					} else {
						i = Math.round(i / 1000000 * 100) / 100;
						j = i + "平方千米"
					}
					var q = o.attr("rings")[0];
					var r = q[q.length - 2];
					var s = iMap.PictureMarkerSymbol({
								source : map.baseurl + "css/cancel.png",
								xoffset : 15
							});
					var p = iMap.TextSymbol({
								color : 16711680,
								border : true,
								borderColor : 16711680,
								background : true,
								backgroundColor : 16777215,
								yoffset : -22,
								htmlText : "<font size='15'><b>总面积:" + j
										+ "</b></font>"
							});
					var k = iMap.CompositeSymbol({
								symbols : [s, p]
							});
					var h = iMap.Graphic({
								geometry : r,
								symbol : k,
								toolTip : "删除此测面"
							});
					var n = function() {
						map.clientLayer.remove(l);
						map.clientLayer.remove(h);
						h.removeEventListener("click", n)
					};
					h.addEventListener("click", n);
					map.clientLayer.add(h);
					this.removeEventListener("drawEnd", arguments.callee);
					c.draw()
				};
				if (arguments.length < 2) {
					c.deactivateAllMode();
					c.getDrawTool().attr({
								showDrawTips : false
							});
					var a = iMap.SimpleLineSymbol({
								color : "0xff3300",
								width : 2
							});
					var b = iMap.SimpleFillSymbol({
								color : 16755200,
								alpha : 0.6,
								outline : a
							});
					c.getDrawTool().attr("fillSymbol", b);
					c.draw("polygon", d)
				} else {
					if (arguments.length > 1
							&& arguments[1] instanceof AsObject
							&& arguments[1].klass === "Polygon") {
						var e = c.AS.attr("spatialReference.wkid");
						if (e == 102113) {
							arguments[1] = AsObject
									.$("#com.esri.ags.utils.WebMercatorUtil")
									.webMercatorToGeographic(arguments[1])
						}
						return AsObject.$("#com.esri.ags.utils.GeometryUtil")
								.geodesicAreas([arguments[1]],
										"esriSquareMeters")
					}
				}
			}
		});
iMap.http = {};
iMap.http.Http = function(config) {
	this.http = AsObject.$("mx.rpc.http.HTTPService");
	this.url = Ao.attr(config, "url");
	this.method = Ao.attr(config, "method", "GET");
	this.http.attr({
				url : this.url,
				method : this.method
			});
	if (config.success && typeof config.success == "function") {
		this.http.addEventListener("result", function(e) {
					var result = e.attr("result");
					result = eval("(" + result + ")");
					config.success.call(null, result)
				})
	}
	if (config.error && typeof config.error == "function") {
		this.http.addEventListener("fault", config.error)
	}
};
iMap.http.Http.prototype.send = function(a) {
	var b;
	if (a) {
		b = a
	} else {
		b = {}
	}
	b.timeId = new Date().getTime();
	this.http.send(b)
};
iMap.net = {};
iMap.net.Socket = function(a) {
	this.host = Ao.attr(a, "host");
	this.port = Ao.attr(a, "port", 0);
	this.socket = Ao.$("flash.net.Socket");
	this.databack = Ao.attr(a, "databack");
	this.lineback = Ao.attr(a, "lineback");
	this.lineSuffix = Ao.attr(a, "lineSuffix", "\r\n");
	this.charSet = Ao.attr(a, "charSet", "utf-8");
	this.errback = Ao.attr(a, "errback");
	this.connback = Ao.attr(a, "connback");
	this.closeback = Ao.attr(a, "closeback")
};
iMap.net.Socket.prototype.connect = function() {
	var a = "";
	var c = function(d) {
		console.log(d)
	};
	if (this.closeback) {
		this.socket.addEventListener("close", this.closeback)
	}
	if (this.connback) {
		this.socket.addEventListener("connect", this.connback)
	}
	if (this.errback) {
		this.socket.addEventListener("ioError", this.errback);
		this.socket.addEventListener("securityError", this.errback)
	}
	var b = this;
	this.socket.addEventListener("socketData", function(j) {
				while (this.attr("bytesAvailable")) {
					var f = [];
					while (this.attr("bytesAvailable")) {
						f.push(this.readMultiByte(this.attr("bytesAvailable"),
								b.charSet))
					}
					if (b.databack) {
						b.databack.call(null, f.join(""))
					}
					if (b.lineback) {
						a += f.join("");
						var g = a.split(new RegExp(b.lineSuffix, "g"));
						var d = g.length;
						a = g.splice(d - 1);
						for (var h = 0; h < g.length; h++) {
							b.lineback.call(null, g[h])
						}
					}
				}
			});
	this.socket.connect(this.host, this.port)
};
iMap.net.Socket.prototype.close = function(a) {
	this.socket.close()
};
iMap.net.Socket.prototype.send = function(a) {
	var b = Ao.$("flash.utils.ByteArray");
	b.writeUTFBytes(a);
	this.socket.writeBytes(b);
	this.socket.flush()
};
iMap.extend({
			glintPoint : function(j, h, d) {
				var f = iMap.MapPoint({
							x : j,
							y : h
						});
				var i = iMap.SimpleLineSymbol({
							color : 16711680,
							width : 4
						});
				var e = iMap.SimpleMarkerSymbol({
							style : "circle",
							alpha : 0,
							color : 16777215,
							size : 30,
							outline : i
						});
				var c = iMap.SimpleMarkerSymbol({
							style : "circle",
							alpha : 0,
							color : 16777215,
							size : 20,
							outline : i
						});
				var a = iMap.Graphic({
							symbol : e,
							geometry : f
						});
				map.clientLayer.add(a);
				var g = 0;
				var b = setInterval(function() {
							if (g == 0) {
								a.attr("symbol", c);
								g = 1
							} else {
								a.attr("symbol", e);
								g = 0
							}
						}, 500);
				if (d != -1) {
					setTimeout(function() {
								clearInterval(b);
								map.clientLayer.remove(a)
							}, d)
				}
				return a
			}
		});