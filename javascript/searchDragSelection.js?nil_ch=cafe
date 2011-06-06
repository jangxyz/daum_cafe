//**************************************************************************
// DragSearchHandler For DaumSearch
//
// Daum Communications 
// Front End Technology Center, Contents Front End Technology TFT 
// By.. wjlee - (2009.02.19)  /  Lst Modify : 2011.03.10
//**************************************************************************

__jsDragSearchHandler = (function() {
	try{

		var DragSelectionRange, DragSelectionTxt, DragSelectionTxtOld, DragSelectionTxtHtml, DragSelectionBtn, DragNewRange;
		var DragPos, DragSelectionLayer, DragChkO, DragDispChk;
		var DragSchIdPos = "DragSchLayerPos";
		var DragSchIdLay = "DragSchLayer";
		var MSIE = navigator.userAgent.indexOf("MSIE");
		var OPERA=navigator.userAgent.indexOf("Opera");		
		_jsAddEvent = function(object, type, listener) {	
			if(object.addEventListener) {if(type=='mousewheel')type='DOMMouseScroll'; object.addEventListener(type, listener, false)}
			else { object.attachEvent("on"+type, listener); }
		}
		_jsStopEvent = function(event) {
			var e=event || window.event;
			if(e.preventDefault) {e.preventDefault(); e.stopPropagation(); }
			else {e.returnValue = false; e.cancelBubble = true;}
		}
		_jsRemove = function(element) {
			element = document.getElementById(element);
			element.parentNode.removeChild(element);
			return element;
		}	
		_jsGetStyle=function(el, style) {
			var value = el.style[style];
			if(!value) {
				if(document.defaultView && document.defaultView.getComputedStyle && OPERA == -1)  {
					var css = document.defaultView.getComputedStyle(el, null);
					value = css ? css[style] : null;
				}  else if (el.currentStyle) {
					if( style == "backgroundPosition" ) value = el.currentStyle["backgroundPositionX"] + " " + el.currentStyle["backgroundPositionY"] ;
					else  value = el.currentStyle[style];
				}
			}
			return value == 'auto' ? null : value;
		}
		_jsTrim = function(s) { return s.replace(/(^\s*)|(\s*$)/g, "") }

		_jsDragHandler = function(event) {
			try {
				DragSelectionTxtOld = DragSelectionTxt;
				if (DragSelectionLayer || DragSelectionBtn) _jsCleanSelection();
				
				if(window.getSelection) {
					if (document.activeElement &&
                        (document.activeElement.tagName.toLowerCase () != "textarea" &&
                         document.activeElement.tagName.toLowerCase () != "input")) {
						DragSelectionRange = window.getSelection();
						DragSelectionTxt = DragSelectionRange.toString();
						DragSelectionTxtHtml = DragSelectionTxt;
					}
				} else if(document.selection) {
					DragSelectionRange = document.selection.createRange();
					DragSelectionTxt = DragSelectionRange.text.toString();
					DragSelectionTxtHtml = DragSelectionRange.htmlText;
				}		
				DragSelectionTxt = _jsTrim(DragSelectionTxt);

				if ((DragSelectionTxt != "")&&(DragSelectionTxt != DragSelectionTxtOld)&&(DragSelectionTxt.length > 1)) {	
					_jsGetStrChk(event);
					if (DragChkO) {										
						_jslayerHandler();
						_jsStopEvent(event);
					} else {
						_jsCleanSelection();
					}
				} else {
					_jsCleanSelection();
				}
			} catch (e) { _jsCleanSelection(); }
		}

		_jsGetStrChk= function(event) {
			var strChkL = DragSelectionTxtHtml.length;
			DragChkO = true;
			if (DragSelectionTxt.indexOf(" ") > 0) {
				if(DragSelectionTxt.length > 10) DragChkO = false;
			} else {
				if(DragSelectionTxt.length > 20) DragChkO = false;
			}
			if (DragChkO) {			
				if (navigator.appName == "Microsoft Internet Explorer") {
					_event = window.event;
					_nodeName = _event.srcElement.nodeName;
				} else if (navigator.appName == "Netscape") {
					_event = event;
					_nodeName = _event.target.nodeName;
				} else {
					_event = window.event;
					_nodeName = _event.srcElement.nodeName;
				}
				if(_nodeName=="INPUT"||_nodeName=="SELECT"||_nodeName=="TEXTAREA"||_nodeName=="FIELDSET") DragChkO = false;
				if((MSIE!=-1)&&(DragChkO)){
					if (strChkL > 4) {
						strChkBr = _jsTrim(DragSelectionTxtHtml.substring ( strChkL - 4, strChkL));
						if (strChkBr.toUpperCase() == "<BR>") DragChkO = false;
						if (DragSelectionTxtHtml.toUpperCase().indexOf("</DT>") > 0) DragChkO = false;
					}
				}
			}
		}
		
		_jslayerHandler = function() {
			try {
				DragSelectionBtn = document.createElement('span')
				DragSelectionBtn.id = DragSchIdPos;
				DragSelectionBtn.style.position = 'absolute';
				DragSelectionBtn.style.width = '0px';
				DragSelectionBtn.style.height = '0px';
				DragSelectionBtn.style.fontSize = '0px';	
				
				if (MSIE!=-1) {				
					var tmp = document.createElement('div');
					tmp.appendChild(DragSelectionBtn);
					DragNewRange = DragSelectionRange.duplicate();
					DragNewRange.setEndPoint( "StartToEnd", DragSelectionRange);
					DragNewRange.pasteHTML(tmp.innerHTML);
					DragSelectionBtn = document.getElementById(DragSchIdPos);
				} else {
					var range = DragSelectionRange.getRangeAt(0);
					DragNewRange = document.createRange();
					DragNewRange.setStart(DragSelectionRange.focusNode, range.endOffset);
					DragNewRange.insertNode(DragSelectionBtn);
				}
				
				if(!document.getElementById(DragSchIdLay)){				
					var el_body = document.getElementsByTagName("body");
					var el_DragSchLayer = document.createElement("span");		
					el_DragSchLayer.setAttribute("id", DragSchIdLay);
					el_body[0].appendChild(el_DragSchLayer);
					document.getElementById(DragSchIdLay).style.display = "none";
				}
							
				DragSelectionLayer = document.getElementById(DragSchIdLay);
				
				DragSelectionLayer.style.display = 'block';	
				DragSelectionLayer.style.position = 'absolute';
				DragSelectionLayer.style.cursor = 'pointer';
				DragSelectionLayer.style.zIndex = '9000';
				DragSelectionLayer.style.background = 'url(http://imgsrc.search.daum-img.net/search_all/2008_new/200806/button.gif)';
				DragSelectionLayer.style.width = '65px';
				DragSelectionLayer.style.height = '22px'
				if (MSIE!=-1)
					DragSelectionLayer.style.margin = '-23px 0 0 -5px';
				else
					DragSelectionLayer.style.margin = '-21px 0 0 -5px';	

				_jsPositionHandler();

				_jsAddEvent(DragSelectionLayer, 'mouseup', _jsLinkHandler);
				_jsAddEvent(window,"resize",_jsPositionHandler);

				DragDispChk = self.setInterval(_jsChkNodeStyle,500);
			} catch (e) { _jsCleanSelection(); }
		}
		
		_jsPositionHandler =  function(e) {
			if (DragSelectionLayer && DragSelectionBtn){
				DragPos = _jsPositionOffset(document.getElementById(DragSchIdPos));

				DragSelectionLayer.style.top = DragPos[0] +"px";
				DragSelectionLayer.style.left = DragPos[1] +"px";
			}
		}
		_jsPositionOffset= function(e) {
			var valueT = 0, valueL = 0;
			do {
				valueT += e.offsetTop || 0; 
				valueL += e.offsetLeft || 0; 
				e = e.offsetParent;
			} while (e); 

			if(valueT < 22){valueT = valueT + 40;}
			if(valueL + 70 > document.body.offsetWidth) {
				valueL = valueL - 60;
			}
			return [valueT, valueL];
		}

		_jsLinkHandler = function (event) {			
			
			if (document.getElementById("DragSearchJs")) {			
				var Dfrom = document.getElementById("DragSearchJs").src;
				if ( Dfrom.length > 0 ) {
					var Dstart, Dend
					Dstart = Dfrom.indexOf ("?") + 1;
					if ( Dstart != -1 ) {
						Dend = Dfrom.length
						Dfrom = unescape ( Dfrom.substring ( Dstart, Dend ) );
						Dfrom = "&" + Dfrom;
					} else {
						Dfrom = "";
					}
				}
			} else Dfrom = "";

			var url = "http://drag.search.daum.net/fcgi/dha_morph_delete_josa.fcgi?q="+ encodeURIComponent(DragSelectionTxt) +"&nil_profile=dragsearch"+Dfrom +"&nil_search=btn";

			var searchpop = window.open(url);
			if (searchpop) searchpop.focus();

			_jsCleanSelection();
			_jsStopEvent(event);
		}

		_jsChkNodeStyle = function() { 
			if (document.getElementById("DragSchLayerPos")) {			
				var p = document.getElementById("DragSchLayerPos");
				do {
					if(p.nodeType != 1) { p = null; break; } else {	p = p.parentNode; }
					var ChkDisplay = _jsGetStyle(p,"display")
					if (ChkDisplay == "none") {
						_jsCleanSelection();
						break;
					}
				} while(p.nodeName.toUpperCase() != "BODY")
			}
		}

		_jsCleanSelection = function() { 
			try{
				DragSelectionRange = null;
				DragSelectionBtn = null;
				DragSelectionTxt = '';
				DragNewRange && DragNewRange.pasteHTML && DragNewRange.pasteHTML('');
				DragNewRange = null;
				if (document.getElementById(DragSchIdPos)) _jsRemove(DragSchIdPos);
				if (document.getElementById(DragSchIdLay)) document.getElementById(DragSchIdLay).style.display = "none";
				if (document.getElementById(DragSchIdLay)) _jsRemove(DragSchIdLay);
				clearInterval(DragDispChk);
			} catch (e) {}
		}
		
		return {
			initialize: function() {
				_jsAddEvent(document, 'mouseup', _jsDragHandler);
			}
		};
	
	} catch (e) {}

})();

__jsDragSearchHandler.initialize();