 /* Copyright 1995-2008 Daum Communications Corp.
 *
 * 이 프로그램은 (주)다음커뮤니케이션 공용 소프트웨어 라이센스에 의거하여
 * 정해진 권한내에서 사용이 가능하다. 라이센스 원문은 LICENSE 파일이나
 * 아래의 URL을 참고하라.
 *	   http://dna.daumcorp.com/forge/docs/daum-license-1.0.txt
 */

var __Tiara = { version : '0.1' };

__Tiara.util = { };

__Tiara.util.StringBuffer = function (str) { 
	var buffer = [],
		len = 0;
	
	if (typeof str === 'string') {
		buffer.push(str);
		len += str.length;
	}

	return {
		push: function (s) {
			return this.append(s);
		},
		append: function (s) {
			if (typeof s !== 'string') {
				var str = s.toString();
				buffer.push(str);
				len += str.length;
			} else {
				buffer.push(s);
				len += s.length;
			}
			return this;
		},
		join: function (s) {
			return buffer.join(s);
		},
		isEmpty: function () {
			return buffer.length === 0 ? true : false;
		},
		length: function () {
			return len;
		},
		size: function () {
			return buffer.length;
		},
		toString: function () {
			return buffer.join('');
		}
	};
};

__Tiara.creater = function (h) {
	var __metainfo = [ 'category', 'subcategory', 'author', 'articleno', 'date', 'comments', 'isauthor', 'ishidden', 'param1', 'param2', 'param3', 'svcdomain' ], // 'description', 'keywords' remove
		t = this,
		tiara = __Tiara,
		__trackIFrame = null,													// iframe click
		__ua = navigator.userAgent.toLowerCase(),
		__miniDaum_varMode = (typeof miniDaum_varMode === 'string') ? miniDaum_varMode : null,
		__isIE = __ua.indexOf("msie") > -1,
		__isBot = __ua.indexOf('google web preview') > -1,
		__metaitems = null,
		__params = null,
		__top = top,
		__parent = parent,
		__w = window,
		__d = document,
	
		__title = __d.title,
		__url = __w.location.href,
		__referer = __d.referrer,
		__setRefererForce = false,
		__h = "http://track.tiara.daum.net",
		__trackerIFrameID = '__trackerIFrameID',
		__allowHash = false,
		__sendPV = false,
		__isiframe = false,
		__tiaraLoadTime = new Date(),

	encode = function (s) {
		if (!s || s === null) {
			return '';
		}
		if (typeof (encodeURIComponent) === 'function') {
			return encodeURIComponent(s);
		} else {
			return escape(s);
		}
	},

	cutString = function (s, len) {
		if (!s) {
			return '';
		}
		if (typeof s !== 'string') {
			return '';
		}
		if (s.length > len) {
			return s.substring(0, len);
		} else {
			return s;
		}
	},
	
	typeOf = function (value) {
		var s = typeof value;
		if (s === 'object') {
			if (value) {
				if (typeof value.length === 'number' &&
						!(value.propertyIsEnumerable('length')) &&
						typeof value.splice === 'function') {
					s = 'array';
				}
			} else {
				s = 'null';
			}
		}
		return s;
	},

	isEmpty = function (o) {
		var i, v;
		if (typeOf(o) === 'object') {
			for (i in o) {
				if (o.hasOwnProperty(i)) {
					v = o[i];
					if (v !== undefined && typeOf(v) !== 'function') {
						return false;
					}
				}
			}
		}
		return true;
	},

	getDocumentLoadTime = function () {
		if (typeof __w.__TiaraObj === 'undefined' || typeof __w.__TiaraObj !== 'object' || ! __w.__TiaraObj.startTime) {
			return '';
		}
		var startTime = __w.__TiaraObj.startTime.getTime(),
			nowTime = __tiaraLoadTime.getTime();
		return "&loadtime=" + (nowTime - startTime);
	},

	isIE = function () {
		return __isIE;
	},

	isHomePage = function () {
		var homeStr = new tiara.util.StringBuffer();
		homeStr.append("&ishome=");
		if (!isIE()) {
			return homeStr.append('U').toString();
		}
		var l = __w.location,
			docBody = null;
		
		if (__isiframe) {
			try {
				docBody = __top.document.body;
				l = __top.window.location;
			} catch (e) { }
		}
		
		if (typeof docBody === 'object') {
			try {
				docBody.style.behavior = 'url(#default#homepage)';
				var isHome = docBody.isHomePage(l.protocol + '//' + l.hostname) || 
						docBody.isHomePage(l.protocol + '//' + l.hostname + '/') || 
						docBody.isHomePage(l.href),
					yn = isHome ? 'Y' : 'N';
				return homeStr.append(yn).toString();
			} catch (e2) { }
		}
		return homeStr.append('U').toString();
	},

	relativeURL = function (s) {
		if (!s || typeof s !== 'string') {
			return '';
		}
		var l = __w.location;
		var url = s;
		var str = s.toString();
		if (str.charAt(0) === '/') {
			url = l.protocol + '//' + l.hostname + s;
		} else if (str.length > 9 && str.charAt(4) === ':' || str.charAt(5) === ':') {
			url = s;
		} else {
			url = l.protocol + '//' + l.hostname + l.pathname.substring(0, (l.pathname.lastIndexOf('/') + 1)) + s;
		}
		return url;
	},
	
	getRemoveHashURL = function (url) {
		if (typeof url !== 'string') {
			return url;
		}
		var url2 = url;
		var index = url2.indexOf('#');
		if (! __allowHash && (index > -1)) {
			url2 = url2.substring(0, index);
		}
		return url2;
	},

	getURL = function (nURL) {
		var url = (typeof nURL !== 'undefined') ? relativeURL(nURL) : __url;
		if (url.charAt(0) !== 'h') { 
			return '';
		}
		// Minidaum variable XXX
		if (!nURL && typeof __miniDaum_varMode !== 'undefined' && __miniDaum_varMode === 'iframe') {
			try {
				url = __parent.location.href;
			} catch (_e) {
				try {
					__d.domain = 'daum.net';
					url = __parent.location.href;
				} catch (e) {
					url = __referer;
				}
			}
		}
		if (! __allowHash) {
			url = getRemoveHashURL(url);
		}
		return "&url=" + encode(url);
	},

	getReferer = function () {
		if (__isiframe && !__setRefererForce) {
			var r;
			var x;
			if (typeof __miniDaum_varMode !== 'undefined' && __miniDaum_varMode === 'iframe') {
				// TODO ????
				try {
					x = __top.document.URL; 
				} catch (e) { 
					x = null; 
				}
				if (!x) {
					try {
						__d.domain = 'daum.net';
						x = __parent.document.URL;
					} catch (e1) {
						x = null;
					}
				}
				if (x === __d.referrer) {
					try {
						r = __parent.document.referrer;
					} catch (e2) {
						r = null;
					}
				} else {
					r = __d.referrer;
				}
			} else {
				try {
					x = __top.document.URL;
				} catch (e3) {
					x = null;
				}
				if (!x) {
					try {
						x = __parent.document.URL;
					} catch (e4) {
						x = null;
					}
				}
				if (x === __d.referrer) {
					try {
						r = __top.document.referrer;
					} catch (e5) {
						try {
							r = __parent.document.referrer;
						} catch (e6) {
							r = null;
						}
					}
				} else {
					r = __d.referrer;
				}
			}
			return "&referer=" + encode(getRemoveHashURL(r));
		} else {
			return "&referer=" + encode(getRemoveHashURL(__referer));
		}
	},

	getTitle = function () {
		var title = __title;
		// Minidaum variable XXX
		if (typeof __miniDaum_varMode !== 'undefined' && __miniDaum_varMode === 'iframe') {
			try {
				title = __parent.document.title;
			} catch (_e) { 
				try {
					__d.domain = 'daum.net';
					title = __parent.document.title;
				} catch (e) { }
			}
		}
		return "&title=" + encode(title);
	},
	
	checkMetaName = function (name) {
		if (!name && typeof name !== 'string') {
			return false;
		}
		for (var i = 0; i < __metainfo.length; i++) {
			if (name.toLowerCase() === __metainfo[i].toLowerCase()) {
				return true;
			}
		}
		return false;
	},

	checkMaximumURL = function (url, str) {
		if (typeof url === 'object' && typeof str === 'string') {
			var len = url.length() + str.length;
			if (isIE() && len > 2048) {
				return true;
			}
		}
		return false;
	},

	initMetaInfomation = function () {
		var head = __d.getElementsByTagName('head');
		if (!head) {
			return;
		}
		var metas = head[0].getElementsByTagName('meta');
		if (!metas) {
			return;
		}

		__metaitems = {};
		for (var i = 0; i < metas.length; i++) {
			if (metas[i].name && checkMetaName(metas[i].name)) {
				var name = metas[i].name;
				var content = metas[i].content;
				if (name && content) {
					__metaitems[cutString(name, 50).toLowerCase()] = cutString(content, 127);
				}
			}
		}
	},
	
	getMetaInfomations = function () {
		if (!__metaitems && __metaitems === null) {
			return '';
		}

		var arrs = [];
		for (var name in __metaitems) {
			if (__metaitems.hasOwnProperty(name)) {
				var content = __metaitems[name];
				if (content) {
					if (name === 'date') {
						arrs.push(encode('doc_date') + '=' + encode(content));
					} else {
						arrs.push(encode(name) + '=' + encode(content));
					}
				}
			}
		}
		return arrs.length > 0 ? '&' + arrs.join('&') : '';
	},

	getParams = function () {
		if (!__params) {
			return '';
		}
		var param = new tiara.util.StringBuffer();
		for (var key in __params) {
			if (__params.hasOwnProperty(key)) {
				param.append(encode(key));
				param.append('=');
				param.append(encode(__params[key]));
				param.append('&');
			}
		}
		if (param.isEmpty()) {
			return ''; //
		}
		return '&' + param.toString();
	},
	terminate = null;						// 변수 정의 마지막 ';'가 들어가야 합니다.
	
	return {
		__initData: function (obj) {
			try {
				var l;
				try {
					l = __top.document.URL;
				} catch (_e) {
					l = null; 
				}
				if (l !== __d.URL) {
					__isiframe = true;
				}
				initMetaInfomation(); // document meta information
				__params = {};
			} catch (e) { }
		},

		__setTitle: function (title) {
			if (!title || typeof title !== 'string') {
				return;
			}
			__title = title;
		},

		__setURL: function (url) {
			if (!url || typeof url !== 'string') {
				return;
			}
			__url = relativeURL(url);
		},

		__setMetaInfo: function (itemArrays) {
			if (typeof (itemArrays) !== 'object') {
				return;
			}
			if (typeof itemArrays.length === 'number') {
				__metainfo = itemArrays;
			}
		},

		__setReferer: function (referer) {
			if (!referer || typeof (referer) !== 'string') {
				return;
			}
			__referer = referer;
			__setRefererForce = true;
		},

		__setAllowHash: function (bool) {
			__allowHash = bool ? 1 : 0;
		},
		
		__addParam: function (key, value) {
			if (key && value) {
				if (checkMetaName(key)) {
					if (__metaitems) {
						__metaitems[cutString(key, 50)] = cutString(value, 127);
					}
				} else {
					__params[key] = value;
				}
			}
		},

		__trackClickView: function (agEvt) {
			try {
				var evt = agEvt || __w.event;
				var obj = (agEvt && agEvt.tagName) ? agEvt : evt.srcElement || evt.target;
				while (1) {
					if (obj.tagName.toLowerCase() === 'a') {
						break;
					} else {
						if (obj.parentNode) {
							obj = obj.parentNode;
						} else {
							break;
						}
					}
				}
				if (obj.href.indexOf('javascript') < 0) {
					var url = obj.href;
					if (url && url.charAt(0) !== 'h') {  // http only
						return;
					}

					var dummy = new Date().getTime() + Math.round(Math.random() * 2147483647);
					var callURL = new tiara.util.StringBuffer();
					callURL.push(__h);
					callURL.push("/queen/touch?dummy=");
					callURL.push(dummy);
					callURL.push(getDocumentLoadTime());
					callURL.push(isHomePage());
					callURL.push(getURL(url));
					callURL.push(getReferer());
					callURL.push(getTitle());
					callURL.push(getParams());
					var img = new Image(1, 1);
					img.src = callURL.toString();
					img.onload = function () { };
				}
			} catch (e) { }
		},

		__trackPageview: function (nURL) {
			if (__sendPV || __isBot) {
				return;
			}
			var dummy = new Date().getTime() + Math.round(Math.random() * 2147483647);
			var callURL = new tiara.util.StringBuffer();
			callURL.push(__h);
			callURL.push("/queen/footsteps?dummy=");
			callURL.push(dummy);
			callURL.push(getDocumentLoadTime());
			callURL.push(isHomePage());
			callURL.push(getReferer());
			callURL.push(getTitle());
			callURL.push(getMetaInfomations());
			callURL.push(getParams());
			var url = getURL(nURL);
			// http://support.microsoft.com/kb/208427 
			// Maximum URL length is 2,083 characters in Internet Explorer
			if (! checkMaximumURL(callURL, url)) {
				callURL.push(url);
			}
			var img = new Image(1, 1);
			img.src = callURL.toString();
			img.onload = function () { };
			if (!nURL) {
				__sendPV = true;
			}
		}
	};
};

__Tiara.__getTracker = function (h) {
	var obj;
	try {
		obj = new __Tiara.creater(h);
		obj.__initData();
	} catch (e) {
		obj = {};
		obj.__trackPageview = function () {};
		obj.__trackClickView = function () {};
	}
	return obj;
};
