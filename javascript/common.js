(function (){
	if (typeof daum !== 'undefined' && daum.Browser) {
		/**
		 * Base on Jigu Javascript Framework for Mobile, v0.1
		 **/
		var b = daum.Browser;
		b.hasUaStr = function(str){
			return b.ua.indexOf(str) > -1;
		};
		b.getOsVersion = function(){
			var res = 0;
			try{
				if(b.iphone || b.ipad || b.ipod){
					res = b.ua.match(/os ([\w|\.|-|_]+) like/g)[0]
					.replace(/^os /,'').replace(/ like$/,'');
				} else if(b.android){
					res = b.ua.match(/android ([\w|\.|-]+);/g)[0]
					.replace(/^android /,'').replace(/;$/,'');
				} 
			}catch(e){}
			return res;
		}
		b.iemobile = b.hasUaStr('msie') && !b.hasUaStr('!opera');
		b.polaris = b.hasUaStr('polaris') || b.hasUaStr('natebrowser') || /([010|011|016|017|018|019]{3}\d{3,4}\d{4}$)/.test(b.ua);
		b.chrome = b.hasUaStr('chrome');
		b.webkit = b.hasUaStr('applewebkit');
		b.opera = b.hasUaStr('opera');
		b.android = b.hasUaStr('android');
		b.safari = b.hasUaStr('safari');
		b.iphone = b.hasUaStr(['iphone','!ipod']);
		b.ipad = b.hasUaStr('ipad');
		b.ipod = b.hasUaStr('ipod');
		b.webviewer = b.hasUaStr(['wv','lg']) || b.hasUaStr('uzard') || b.hasUaStr('opera mini');
		b.dolfin = b.hasUaStr('dolfin');
		b.xperiax1 = b.hasUaStr('sonyerricssonx1i');
		b.uiwebview = (b.iphone || b.ipad || b.ipod) && b.webkit && b.hasUaStr('!safari');
		b.osversion = b.getOsVersion();
	}
})();


function namespace(strNamespace){
	(function (arrNames, parentObj){
		if(!arrNames || !arrNames.length){return;}
		var pkgName = arrNames.shift();
		if(!parentObj[pkgName]){
			parentObj[pkgName] = {};
		}
		arguments.callee(arrNames, parentObj[pkgName]);
	})(strNamespace.split("."), window);
}

var clickAreaCheck = false;
document.onclick = function(e) {
    var e = e || window.event;
    var getElement = e.srcElement || e.target;
    var cafeLayers = ["scrapLayer","reply_emoticon","bbsLayer","gradeLayer","RssLayer","headerLayer","goServiceLayer","nameContextMenu","cafe_favCafeListLayer","viewFilterLayer","getUserListLayer","noMemberLayer","daumServiceLayer", "viewListLayer", "articleTypeLayer", "readSnsShareMore"];
    if (!clickAreaCheck) {
    	for(var i=0; i<cafeLayers.length; i++){      
           if(document.getElementById(cafeLayers[i])) {
                if(cafeLayers[i] == "cafe_favCafeListLayer") FavCafeList.hide();
                else if(cafeLayers[i] == "daumServiceLayer") ServiceList.hide();
                else if(cafeLayers[i] == "goServiceLayer") chg_class('btnGoSvcMenu','goServiceLayer','over');
                else divDisplay (cafeLayers[i], 'none');
           }      
        }
    } else {
        clickAreaCheck = false;
    }
}

function hideOtherLayer(btnName) {  
    var cafeLayerObj = {
        "btnScrapMenu":"scrapLayer",
        "btnReplyEmoticon":"reply_emoticon",
        "aticle_movie":"bbsLayer",
        "grade_modify":"gradeLayer",
        "btnShowRssMenu":"RssLayer",
        "btnShowHeaderMenu":"headerLayer",    
        "btnGoSvcMenu":"goServiceLayer",    
        "cafe_favCafeTitle":"cafe_favCafeListLayer",
        "viewFilterBtn":"viewFilterLayer",
        "btnnick":"nameContextMenu",
        "daumServiceLink":"daumServiceLayer",
        "viewListBtn":"viewListLayer",
        "articleTypeBtn":"articleTypeLayer",
        "showMoreSns":"readSnsShareMore"
    }
    delete cafeLayerObj[btnName];
    for (var btn in cafeLayerObj) {          
        if(document.getElementById(cafeLayerObj[btn])) {
            if(cafeLayerObj[btn] == "cafe_favCafeListLayer") FavCafeList.hide();
            else if(cafeLayerObj[btn] == "daumServiceLayer") ServiceList.hide();
            else if(cafeLayerObj[btn] == "goServiceLayer") chg_class('btnGoSvcMenu','goServiceLayer','over');
            else divDisplay (cafeLayerObj[btn], 'none');
        }     
    }             
}

function hideLayerAll(layer) {
    switch(layer) {
        case "member" :
            if (document.getElementById("sub_list2")) divDisplay ("sub_list2", 'none'); // 등급변경 레이어
            if (document.getElementById("ScrapLayer")) divDisplay ("ScrapLayer", 'none'); // 스크랩 레이어
            break;
        case "grade" :
            if (document.getElementById("nameContextMenu")) divDisplay ("nameContextMenu", 'none'); // 회원정보 레이어 
            if (document.getElementById("ScrapLayer")) divDisplay ("ScrapLayer", 'none'); // 스크랩 레이어
            break;
        case "scrap" :
            if (document.getElementById("nameContextMenu")) divDisplay ("nameContextMenu", 'none'); // 회원정보 레이어
            if (document.getElementById("sub_list2")) divDisplay ("sub_list2", 'none'); // 등급변경 레이어
            break;
        case "reserved" :
            if (document.getElementById("calendarBox")) divDisplay ("calendarBox", 'none'); // 예약발송메일 달력 레이어
            break;          
    }
}

function toggleDisplay(id) {
clickAreaCheck = false;
    var obj = document.getElementById(id);
    if(obj.style.display=="none") {
        clickAreaCheck = true;
        obj.style.display = "block";
    } else {
        
        obj.style.display = "none";
    }
}
var FavCafeList = {
	wrap : null,
	title : null,
	list : null,
	backboard : null,
	isLoaded : false,
	isVisible : false,
	login : '',
	init : function(){
		this.backboard.style.top = this.list.style.top = this.wrap.offsetHeight + 8 + 'px';		
	},
	load : function(){
		var loadingTxt = document.createElement('LI');		
		loadingTxt.className = 'favor_msg';
		if(this.login == "false"){
		loadingTxt.innerHTML = '';
		} else {
		loadingTxt.innerHTML = '자주가는카페목록 로딩중입니다..';
		}
		this.list.insertBefore(loadingTxt,this.list.firstChild);
		var url = '/_c21_/founder_FavoriteCafeList';
		cubeAjax.Request(url, {
            onComplete: function(req){
	           FavCafeList.list.removeChild(FavCafeList.list.firstChild);
               FavCafeList.add.call(FavCafeList,req.responseText);     
            }
	     });
	},
	clear : function(){
		var li = this.list.getElementsByTagName('LI');
		var LiLength = "";
		if(this.login == "false"){
			LiLength = li.length;						
		} else {
			LiLength = li.length-3;
		}
		for(var i=0,max=LiLength; i<max; i++){
			this.list.removeChild(li[0]);
		}		
	},
	add : function(data){
		var info;
		data = eval(data);
		if(this.login == "false"){
			var li = document.createElement('LI');		
			li.innerHTML = '<a href="javascript:;" onclick="mini_poplogin();">로그인해주세요</a>';
			this.list.insertBefore(li,this.list.firstChild);
			return;
		}
		if(data.length > 0){
			while( (info = data.pop()) ){			
				this.list.insertBefore(this.makeList(info),this.list.firstChild);
			}
			this.isLoaded = true;
		}else{
			var li = document.createElement('LI');
			li.className = 'favor_msg';
			li.innerHTML = '등록된 카페가 없습니다.';
			this.list.insertBefore(li,this.list.firstChild);
		}
	},
	makeList : function(data){
		var li = document.createElement('LI');

		if(parseInt(data.newdt,10) > 0 || data.grpcode == 'avatarchat'){
			li.className = 'newdt';
		}
		li.innerHTML = '<a href="http://cafe.daum.net/' + data.grpcode + '" target="_top">' + data.grpname + '</a>';
		return li;
	},
	toggle : function(){
		if(this.isVisible){
			this.hide();
		}else{
			this.show();
		}
	},
	show : function(){
		clickAreaCheck = true;
		if(this.isLoaded == false){
			this.clear();
			this.load();
		}
		if(this.title) this.title.className = 'on';
		if(this.layer) this.layer.style.display = 'block';
		window.setTimeout(function(b,l){
			return function(){
				b.style.height = l.offsetHeight + 'px';
				b.style.width = l.offsetWidth + 'px';
			}
		}(this.backboard,this.list),300);
		this.isVisible = true;
		hideOtherLayer(this.title.id);
	},
	hide : function(){
		if(this.title) this.title.className = '';
		if(this.layer) this.layer.style.display = 'none';
		this.isVisible = false;
	}
};

var ServiceList = {	
	btn : "daumServiceLink",
	layer : "daumServiceLayer",
	isVisible : false,	
	toggle : function(){
		if(this.isVisible){
			this.hide();
		}else{
			this.show();			
		}
	},
	show : function(){
		clickAreaCheck = true;
		var btn = document.getElementById(this.btn);
		var layer = document.getElementById(this.layer);
		layer.style.display = "block";
		btn.className = "on";
		this.isVisible = true;		
		hideOtherLayer(this.btn);
	},
	hide : function(){
		var btn = document.getElementById(this.btn);
		var layer = document.getElementById(this.layer);
		layer.style.display = "none";	
		btn.className = "";
		this.isVisible = false;
	}					
};

function copyUrl(url) {
    if (copyclipboard(url)){ 
        alert('클립보드에 주소가 복사되었습니다.');
    }
}

function copyRSSUrl(url, type) {
    if (copyclipboard(url)) 
    {
        window.clipboardData.setData("Text", url);
        if (type == "cafe"){
            alert('카페 RSS주소가 복사 되었습니다.');
        }else{
            alert('게시판 RSS주소가 복사 되었습니다.');
        }
    }
}

function copyclipboard(intext) {
    if (window.clipboardData) {
        window.clipboardData.setData("Text", intext);
            return true;
    }
    alert("이 브라우저에서는 주소 복사 기능을 제공하지 않습니다.\n아래 주소를 직접 드래그하여 복사해주세요.\n\n"+intext);
    return false;
}

function selectCheckboxes(combos){
    if(!combos) {
        return;
    }
    
    if(combos.length > 0){
        for(i = 0; i < combos.length; i++)
            combos[i].checked=true;
    }
    else 
        combos.checked=true;

}

function cancelCheckboxes(combos){
    if(!combos) {
        return;
    }
    
    if(combos.length > 0){
        for(i = 0; i < combos.length; i++)
            combos[i].checked = false;
    }
    else 
        combos.checked = false;

}

function hideNotiItem(grpid, fldid){	
	var items = $C($("primaryContent"), "icon_noti");
	var isChecked = $("hideNotiCheck").checked;
	if(items && items.length > 0){
		for(var i=0, len=items.length; i<len; i++){
			var notiItem = items[i].parentNode.parentNode;
			if(isChecked) {									
				notiItem.style.display = "none";
			} else {
				notiItem.style.display = "";
			}								
		}
		if(isChecked) { 
			setCookie("hideNoti", grpid+"//"+fldid);			
		} else { 
			deleteCookie("hideNoti");
		}
	}
}

/**
 *	option = {
 *		maxCloseCnt: 몇번 닫기 버튼을 누르면 다시 않보이게 할 지 설정. default: 1
 *		expireDays: 쿠키 만료일. default: 9999일
 *		showPeriod: [시작일, 종료일] - 예시 ["2010-10-20", "2010-10-31"]
 *		showDays: [{day: "보여지는 일짜", host: 보여지는 서버대역}] - 예시 [{day: "2010-10-20", host: 100}]
 *		today: "$!{YEAR}-$!{MONTH}-$!{TODAY}" - 벨로시티 값 고정.
 *	} 
 */
CafeNotiManager = function(boxId, option){
	if(!boxId) return;
	this.cookieName = boxId + "HideCookie";
	this.notiBox = $(boxId);
	this.hideBtn = $$(".btnClose", this.notiBox)[0];
	this.expireDays = 9999,
	this.maxCloseCnt = 1;
	this.closeCnt = parseInt(getCookie(this.cookieName)) || 0;
	this.today = null;
	this.showPeriod = [];
	this.showDays = [];
	this.isVisibility = false;
	this.init(option);
}; 
CafeNotiManager.prototype = {	
	init: function(option){
		if(this.hideBtn){ this.initEvent(); }		
		if(option){
			if(option.expireDays){ this.expireDays = option.expireDays; }			
			if(option.maxCloseCount){ this.maxCloseCnt = parseInt(option.maxCloseCount) }
			if(option.showPeriod){ this.showPeriod = option.showPeriod }
			if(option.showDays){ this.showDays = option.showDays }
			if(option.today){ this.today = this.makeDate(option.today); }
		}
		this.checkCondition();			
	},
	initEvent: function(){
		daum.Event.addEvent(this.hideBtn, "click", function(){
			setCookie(this.cookieName, ++this.closeCnt, this.expireDays);
			this.notiBox.style.display = "none";
		}.bind(this));
	},
	makeDate: function(date){
		var day = date.split("-");
		var date = null;
		if(day.length > 2){
			date = new Date(day[0], day[1]-1, day[2]);
		}
		return date;
	},
	checkCondition: function(){
		var isVisibility = false;
		if(this.showPeriod.length > 0){ 
			isVisibility = this.comparePeriod();
		}else if(this.showDays.length > 0){
			isVisibility = this.compareDayAndServer();
		}
		
		var isOver = this.isOverMaxCloseCount();
		isVisibility = isVisibility && !isOver
		this.setVisiblity(isVisibility);
	},
	isOverMaxCloseCount: function(){
		return (this.closeCnt >= this.maxCloseCnt);
	},
	comparePeriod: function(){
		var isVisibility = false;		
		if(this.showPeriod.length > 1){
			var start = this.makeDate(this.showPeriod[0]);
			var end = this.makeDate(this.showPeriod[1]);
			isVisibility = (this.today.getTime() >= start.getTime() && this.today.getTime() <= end.getTime());			
		} 
		return isVisibility;
	},
	compareDayAndServer: function(){
		var isCorrectDay = false;
		var isCorrectServer = false;
		if(this.showDays.length > 0){
			for(var i = 0; i < this.showDays.length; i++){
				var showDay = this.makeDate(this.showDays[i].day);
				if(showDay.getTime() == this.today.getTime()){ 
					isCorrectDay = true;
					isCorrectServer = this.checkHost(this.showDays[i].host);
					break;
				} 
			}
		}
		return isCorrectDay && isCorrectServer;
	},
	checkHost: function(serverNumber){
		var host = document.location.host.substring(0,7);
		var cafeHost = "cafe"+(parseInt(serverNumber/100, 10));
		return (host.indexOf(cafeHost) < 0)? false : true;
	},
	setVisiblity: function(isVisible){
		this.notiBox.style.display = isVisible ? "block" : "none";
	}
};

function toggleAll(formctrList) {
    toggleCheckboxes(formctrList);
}

function toggleCheckboxes(combos) {
	if (!combos) { return; }
	if (combos.length > 0) {
    	var chkcnt=0, i=0;
    	for (i=0;i<combos.length;i++) {
        	if (combos[i].checked) {
        		chkcnt++;
        	}
        }
    	// 모두 선택된 상태가 아니면 all check
    	var docheck = !(chkcnt == combos.length);
    	for (i=0;i<combos.length;i++) {
    		combos[i].checked=docheck;
    	}
    }
    else {
    	combos.checked=!combos.checked;
    }
}

function assertSelected(combos, alertMsg) {
	if (!combos) { return; }
	var checked = false;
	if (combos.length > 0) {
		for (var i=0; i<combos.length; i++) {
			if (combos[i].checked) { 
				checked = true;
				break;
			}
		}
	} else {
		checked = combos.checked;
	}
	if (!checked) { alert(alertMsg); }
	return checked;
}

function getAbsoluteTop(oNode){
    var oCurrentNode=oNode;
    var iTop=0;
    var scroll = (oCurrentNode.scrollTop) ? oCurrentNode.scrollTop : 0;
    while(oCurrentNode){
        if (oCurrentNode.tagName == "HTML") break;        
        var top = (oCurrentNode.offsetTop) ? oCurrentNode.offsetTop : 0;        
        iTop+=top;
        oCurrentNode=oCurrentNode.offsetParent;
    }   
    iTop = iTop + scroll;
    return iTop;
}
function getAbsoluteLeft(oNode){
    var oCurrentNode=oNode;
    var iLeft=0;
    while(oCurrentNode){
        if (oCurrentNode.tagName == "HTML") break;        
        var left = (oCurrentNode.offsetLeft) ? oCurrentNode.offsetLeft : 0;
        iLeft+=left;
        oCurrentNode=oCurrentNode.offsetParent;
    }
    return iLeft;
}

function showMenuList(){				
	document.getElementById('menu_folder').style.display = "none";
	document.getElementById('menu_folder_list').style.display = "block";	
	document.getElementById("leftmenu").contentWindow.reSize();
}

function hideMenuList(){				
	parent.document.getElementById('menu_folder').style.display = "block";
	parent.document.getElementById('menu_folder_list').style.display = "none";
}

function copyCafeRssChannel(rssurl) {
    var url = "/_c21_/founder_rss_board_management?grpid=" + CAFEAPP.GRPID + "&cmd=popCopyChannel&rssurl=" + rssurl + "&channelName=" + CAFEAPP.GRPNAME + "&isCafeRss=Y";
    window.open(url, 'pop_rss', 'width=530,height=400,resizable=no,scrollbars=no');
}

/**
 * [FROM] scriptForCookie.html
 * @param name
 * @return
 */
function getCookie(name) {

    var Found = false
    var start, end
    var i = 0
    // cookie 문자열 전체를 검색
    while(i <= document.cookie.length) {
        start = i;
        end = start + name.length;
        // name과 동일한 문자가 있다면
        if(document.cookie.substring(start, end) == name) {
            Found = true;
            break;
        }
        i++;
    }
    // name 문자열을 cookie에서 찾았다면
    if(Found == true) {
        start = end + 1;
        end = document.cookie.indexOf(';', start); 
        // 마지막 부분이라는 것을 의미(마지막에는 ';'가 없다) 
        if(end < start)
            end = document.cookie.length; 
            // name에 해당하는 value값을 추출하여 리턴한다. 
        return document.cookie.substring(start, end); 
    } 
        //찾지 못했다면
}

function setCookie(name, value, expiredays, domain) {
    var exdate = new Date();
    exdate.setDate( exdate.getDate() + expiredays );
    if (typeof(domain) == 'undefined') { domain = document.location.href.match(/cafe[0-9]{2,3}/g) + ".daum.net"; }    
    document.cookie=name+ "=" +escape(value)+"; path=/; domain=" + domain + ((expiredays==null) ? "" : ";expires="+exdate.toGMTString());    
}

function deleteCookie(name, domain)
{
	var expireDate = new Date();
	expireDate.setDate( expireDate.getDate() - 1 );
	if (typeof(domain) == 'undefined') { domain = document.location.href.match(/cafe[0-9]{2,3}/g) + ".daum.net"; }
	document.cookie = name + "= " + "; path=/; domain=" + domain + "; expires=" + expireDate.toGMTString() + ";";
}

/*
 * CafeCookie by wracker1
 * cafe.daum.net domain 을 가지는 쿠키를 사용하기 위해
 * 스크립트 사용 전 #COOKIE_FRAME_INIT() 매크로를 한번 적어주고 사용해야 함.
 * http://play.daumcorp.com/pages/viewpage.action?pageId=38797351 참고.
 */
CafeCookie = {
	inited: false,
	cookieFrame: null,
	init: function(){
		this.cookieFrame = daum.$("iframeForCookie");
		this.frameContents = this.cookieFrame.contentWindow || this.cookieFrame.contentDocument;
		this.inited = true;
	},
	setCookie: function(name, value, expireDays){
		if(!this.inited) this.init();
		if(!this.frameContents) return;
		this.frameContents.setCookie(name, value, expireDays);
	},
	getCookie: function(name){
		if(!this.inited) this.init();
		if(!this.frameContents) return;
		return this.frameContents.getCookie(name);
	}
}

function openIcon(obj){ 
    var eventCookie=getCookie('pop_receipt');           //팝업할 쿠키의 이름    
    if (eventCookie == 'no') {  
        document.getElementById(obj).style.display = "none";
    } 
}
function closeIcon(obj) {
    setCookie("pop_receipt", "no" , 1000);
    document.getElementById(obj).style.display = "none";
}


/**
 * [FROM] scriptsForExif.html
 * @param num
 * @return
 */
function toggle_exif(num) {
    var photoExif = document.getElementById('photo_'+num).style.display;
    document.getElementById('photo_'+num).style.display = (photoExif=='none')?'block':'none';
}

/**
 * [FROM] cafe_inner_srearch.html
 */
function viewCafeSearchAll(){
    document.searchForm.jobcode.value="1";
    document.searchForm.grpid.value= CAFEAPP.GRPID;
    document.searchForm.mgrpid.value= CAFEAPP.MGRPID;
    document.searchForm.fldid.value= CAFEAPP.FLDID;
    document.searchForm.query.value = CAFEAPP.ui.QUERY;
    document.searchForm.item.value = CAFEAPP.ui.ITEM;
    document.searchForm.action="/_c21_/cafesearch";
    document.searchForm.submit();
}
function changeSearchViewType(type){   
	var srchList = $('searchList');
	var srchCafeList = $('searchCafeList');
    if(type == '1'){ // 제목보기 , 목록형 보기
    	if(srchList && srchList.className.indexOf("bbsList all") > -1){
    		srchList.className  = "bbsList tit";
        }
        if(srchCafeList && srchCafeList.className.indexOf("bbsList all") > -1){
        	srchCafeList.className  = "bbsList tit";
        }
        top.comment_area_fold = 1;        
    } else if(type == '2'){ // 제목+내용 , 요약형 보기      
    	if(srchList && srchList.className.indexOf("bbsList tit") > -1){
    		srchList.className  = "bbsList all";
        }
        if(srchCafeList && srchCafeList.className.indexOf("bbsList tit") > -1){
        	srchCafeList.className  = "bbsList all";
        }
        top.comment_area_fold = 0;
        if($C(document, 'thumImages')){
        	resizeImage_reload();
        }

    }
    SearchUtil.setViewtype();
}

/**
 * @deprecated
 */
function checkSearchViewType(){
    if (top.comment_area_fold == 0){ 
        changeSearchViewType('2');
    } else { 
        changeSearchViewType('1');
    }
}
/**
 * [FROM] myarticle_alimi.html
 */
function remove_my_alim(grpid, fldid, dataid, alim_seq) {   
    self.location.href = "/_c21_/my_alimi?cmd=REMOVE&grpid=" + grpid + "&fldid=" + fldid + "&dataid=" + dataid + "&alim_seq=" + alim_seq;
}
function deleteMyAlimi(page) {
	var form = (document.innerSearchForm) ? document.innerSearchForm : null;
	if(form){
		var page = (page == "" || !page) ? 1 : page;
		var dataInfo = form.datainfo;
		var infosForDelete = "";
		var cnt = 0;
		var datasize = dataInfo.length;

		if(datasize > 0){
			for(var i=0; i<datasize; i++){
				if(dataInfo[i].checked == true){
					if(cnt == 0){
						infosForDelete += dataInfo[i].value; 
					} else {
						infosForDelete += ","+dataInfo[i].value;
					}
					cnt++;
				}
			}
		}else {
		    if (dataInfo.checked) {
		        infosForDelete = dataInfo.value;
		    }
		}   
    		
		if(infosForDelete == ""){
			alert("삭제 할 내용을 선택 해주세요.");
		} else {
			form.infosForDelete.value = infosForDelete;
			form.cmd.value = "REMOVE";
			form.page.value = page;
			form.submit();
		}
	} else {
		return;
	}
} 
 
/**
 * [FROM] scriptsForString.html
 * @param str
 * @return
 */
function isEmptyString(str) {
    var splits = str.split(" ");
    if (str.length + 1 == splits.length) {
        return true;
    } else {
        return false;
    }   
}

function trim(s) {
    while (s.substring(0,1) == ' ') {
        s = s.substring(1,s.length);
    }
    while (s.substring(s.length-1,s.length) == ' ') {
        s = s.substring(0,s.length-1);
    }
    return s;
}

function strtrim(str) {
    while (str.charAt(0) == ' ')
        str = str.substring(1);
    while (str.charAt(str.length - 1) == ' ')
        str = str.substring(0, str.length - 1);
    return str;
}
// str이 length byte 넘어가면 .. 표시
function chop(str, length) {
    var strLength = 0;
    var retstr = "";
    
    for ( var i = 0; i < str.length ; i++) {
        if (escape(str.charAt(i)).length > 3) {
            strLength +=2;
            if (strLength > length) {
                retstr = retstr+"..";
                break;
            }
            retstr+= str.charAt(i);
        } else {
            strLength++;
            if (strLength > length) {
                retstr = retstr+"..";
                break;
            }
            retstr += str.charAt(i);
        }
    }
    return retstr;
}

function isContainQuote(str) {
    for (var i = 0; i < str.length; i++) {
        if (str.charAt(i) == "'" || str.charAt(i) == '"') {
            return true;
        }
    }

    return false;
}

function isContainBracket(str) {
    for (var i = 0; i < str.length; i++) {
        if (str.charAt(i) == "<" || str.charAt(i) == ">") {
            return true;
        }
    }

    return false;
}

function isContainBackslash(str) {
    for (var i = 0; i < str.length; i++) {
        if (str.charAt(i) == "\\") {
            return true;
        }
    }

    return false;
}

// 문자열의 길이를 바이트 단위로 리턴. i.e. 영문자 = 1 byte, 한글 = 2 bytes
function getKEStringBytes(str) {
    return(str.length + (escape(str) + "%u").match(/%u/g).length - 1);
}

// 문자열의 길이를 바이트 단위로 잘라서 리턴. i.e. 영문자 = 1 byte, 한글 = 2 bytes
function cutKEString(str, cut) {
    var ulen = str.length;
    var i;
    var res = "";
    var count = 0;

    for (i = 0; i < str.length; i++) {
        if (count >= cut) {
            return res;
        }
        var ch = str.charAt(i);
        if (escape(ch).length > 4) {
            if (count + 2 <= cut) {
                res += ch;
            }
            count += 2;
        } else {
            res += ch;
            count++;
        }
    }

    return res;
}

// 부가 컨텐츠 글자 자르기
function cutContent(content, size) {
    var slen = getKEStringBytes(content);
    if (slen > size) {
        content = cutKEString(content, size-2) + "..";
    }
    document.write(content);
}
 
// 부가 컨텐츠 페이지 변경에 쓰이는 함수 
function changeSideContPage(page, contype){ 
    var type = contype + "_page";
    var page1 = type + "1";
    var page2 = type + "2";

    if (document.getElementById(page1).className != "none") {
        if (page == 1) {
            return;
        }
        var contype = contype;
        document.getElementById(page1).className = "none";
        document.getElementById(page2).className = "block";
        document.getElementById(type).innerHTML = "<span class='arrow'>◀</span><a href='javascript:;' onclick=\"changeSideContPage(1,'"+contype+"');\" class='p11'>이전</a>";
    } else {
        if (page == 2) {
            return;
        }
        document.getElementById(page1).className = "block";
        document.getElementById(page2).className = "none";
        document.getElementById(type).innerHTML = "<a href='javascript:;' onclick=\"changeSideContPage(2,'"+contype+"');\" class='p11'>다음</a><span class='arrow'>▶</span>";
    }
}

function updateCharter(obj,view_obj,max_cnt)
{ 
    var str_cnt = 0;
    var tempStr, tempStr2;  
    var str_cnt_viewer = document.getElementById(view_obj);
    
    for(i=0; i<obj.value.length; i++)
    {
        tempStr = obj.value.charAt(i);
        if(escape(tempStr).length > 4) str_cnt += 1;
        else str_cnt += 0.5 ;
    }

    if (str_cnt > max_cnt){
        alert("최대 " + max_cnt + "자이므로 초과된 글자수는 자동으로 삭제됩니다.");       
        str_cnt = 0;        
        tempStr2 = "";
        for(i = 0; i < obj.value.length; i++) 
        {
            tempStr = obj.value.charAt(i);  
            if(escape(tempStr).length > 4) str_cnt += 1;
            else str_cnt += 0.5;
            if (str_cnt > max_cnt)
            {
                if(escape(tempStr).length > 4) str_cnt -= 1;
                else str_cnt -= 0.5 ;   
                break;              
            }
            else tempStr2 += tempStr;
        }       
        obj.value = tempStr2;
    }
    str_cnt_viewer.innerHTML = parseInt(str_cnt);
}
function updateRealCharter_forCafeMsg(obj,view_obj,max_cnt) 
{ 
	var str_cnt = 0; 
	var enter_cnt = 0;
	var tempStr, tempStr2;  
	var str_cnt_viewer = document.getElementById(view_obj);
	str_cnt = obj.value.length;

	var ua = navigator.userAgent.toLowerCase();
	if(ua.indexOf("msie") == -1 && ua.indexOf("opera") == -1){
		enter_cnt = countEnterKey(obj.value);
	}
	str_cnt += enter_cnt;
	
	if (str_cnt > max_cnt){
		alert("최대 " + max_cnt + "자이므로 초과된 글자수는 자동으로 삭제됩니다.");
		obj.value = obj.value.substring(0, max_cnt - enter_cnt);
		str_cnt = max_cnt; 
	}
	str_cnt_viewer.innerHTML = parseInt(str_cnt);
}

function countEnterKey(strValue){
	var encodedChar = encodeURIComponent(strValue);
	return encodedChar.split("%0A").length - 1;
}

function goManager(grpid, euserid, mgrpid) {
    if (typeof(mgrpid) == "undefined")  {       
        document.location.href = "/_c21_/cafe_profile?grpid="+grpid+"&view=manager";
    }else{
        window.open('/_c21_/group_member_manager?grpid='+grpid+'&mgrpid='+mgrpid+'&userid='+euserid, "manager", 'width=650,height=350,resizable=yes,scrollbars=yes');
    }

}


function divDisplay(id, act) {
    if (typeof(id) == "object") id.style.display = act;
    else document.getElementById(id).style.display = act;
}

function hideSideView() {
    if (document.getElementById("nameContextMenu")) {
        divDisplay ("nameContextMenu", 'none');
    }
}

function minidaum_onclick() {
    if (!clickAreaCheck) {
        hideSideView();
        if(document.getElementById("ScrapLayer")) {
            divDisplay ("ScrapLayer", 'none');
        }
        if(document.getElementById("emoticon")) {
            divDisplay ("emoticon", 'none');
        }
        if(document.getElementById("qMenu_service")) {
            divDisplay ("qMenu_service", "none");
            if(document.getElementById('dir_to_home').className == 'over'){
                document.getElementById('dir_to_home').className = 'out';
            }
        }
    } else {
        clickAreaCheck = false;
    }
}

function chg_class(target, div_id, val){
    clickAreaCheck = true;    
    var layer = document.getElementById(div_id);
    if(typeof(target) == "string") targetObj = document.getElementById(target);
    
    if(val && val == "over"){
        targetObj.className = 'out';        
        divDisplay (div_id, 'none');  
        return;  
    }
    if(layer.style.display != "none"){
        targetObj.className = 'out';        
        divDisplay (div_id, 'none');    
    }else{
        targetObj.className = 'over';
        divDisplay (div_id, 'block');        
        hideOtherLayer(target);
    }
}
function openMall()
{
    divDisplay ('DaumUI__minidaum_mall', 'block');
}
function closeMall(){
    divDisplay ('DaumUI__minidaum_mall', 'none');
}

function getStyle(e, cssProperty, mozCssProperty){          
    var mozCssProperty = mozCssProperty || cssProperty;                                 
    return (e.currentStyle) ? e.currentStyle[cssProperty] : document.defaultView.getComputedStyle(e, null).getPropertyValue(mozCssProperty);  
}
function getCoords(e, permissibleRange){
    var scope = permissibleRange ? permissibleRange : null;   
                         
    if(typeof(e) == 'object'){
         var element = e;
    } else {
         var element = document.getElementById(e);
    }   
    var w = element.offsetWidth;
    var h = element.offsetHeight;   
    //var s = (element.scrollTop) ? element.scrollTop : 0;
    var coords = { "left" : 0, "top" : 0, "right" : 0, "bottom" : 0 , "width" : 0 , "height" : 0 };
    while(element){
        if(element.tagName == "HTML") break;                                                                     
        coords.left += element.offsetLeft || 0;
        coords.top += element.offsetTop || 0; 
        element = element.offsetParent;   
        if(!scope && element){                
            var isPosRel = getStyle(element, "position");
            if(isPosRel !== "static") break;
        }          
        if(scope && element && element.tagName != "BODY" && element.tagName != "HTML") {           
           coords.top -= element.scrollTop; 
        } 
    }                               
    coords.width = w;
    coords.height = h;  
    coords.right = coords.left + w;                                                                 
    coords.bottom = coords.top + h;                            

    return coords;
}
function getCoords_old(e){                              
    var element = document.getElementById(e);
    var w = element.offsetWidth;
    var h = element.offsetHeight;   
    
    var coords = { "left" : 0, "top" : 0, "right" : 0, "bottom" : 0 , "width" : 0 , "height" : 0 };

    while(element){                                                                     
        coords.left += element.offsetLeft || 0;
        coords.top += element.offsetTop || 0;                                       
        if(element.tagName == "BODY") break;    
        element = element.offsetParent;     
        var isPosRel = getStyle(element, "position");
        if (isPosRel !== "static") break;
    }                               
    
    coords.width = w;
    coords.height = h;  
    coords.right = coords.left + w;                                                                 
    coords.bottom = coords.top + h;                            

    return coords;
}
function showLayerMenu(menu, btn, diff) {
    clickAreaCheck = true;
    
    if (typeof menu == 'string') { menu = document.getElementById(menu); }
    if (typeof btn == 'string') { btn = document.getElementById(btn); }
    
    hideOtherLayer(btn.id);
    
    if (menu.style.display == "block"){
    	divDisplay(menu, 'none');
    	return;
    }
    
    var layerPos = getCoords(btn);
    if (diff && diff.left) { layerPos.left+=diff.left; }
    if (diff && diff.top) { layerPos.top+=diff.top; }
    
    menu.style.left = layerPos.left + "px";
    menu.style.top = layerPos.top + layerPos.height + "px";
    divDisplay(menu, 'block');
}


function directGoUrl(url, p) {
    top.document.location.href=url;
}



/* SNS Connection */
function onclickSnsShareOnReply(event){
	var elCheck = daum.Event.getElement(event);
	connectSns(elCheck);
}

function connectSns(elCheck){
	var service_name = elCheck.className;
	if(service_name == "yozm"){
		checkYozmConnection(elCheck);
		return;
	}
	if(CAFEAPP.ui.sns.allows && CAFEAPP.ui.sns.allows.contains(service_name) == false){
		if(elCheck.checked){
			var url = "http://profile.daum.net/api/popup/JoinProfile.daum?service_name=" + [elCheck.className] + "&callback=snsShareOnReplyCallback";
			var send_sns = window.open(url, 'send_sns', 'width=500,height=400,resizable=no,scrollbars=no');
			
			try{
				if(!send_sns || send_sns.outerWidth == 0){
					alert("팝업 차단을 해제해 주세요.");
				}
			}catch(e){
				console.log(e);
			}
			
			elCheck.checked = false;
		}
	}
}

function checkYozmConnection(elCheck){
	WISNSShareService.isSecededUser(function(response){
		response = eval("(" + response + ")");
		if(response.status && response.status != 200){
			if (response.result_msg.indexOf("ErrorCode 4040") > -1){
				alert("요즘 서비스 탈퇴 처리 중입니다. 탈퇴한 후 48시간이 경과되지 않았습니다.");
				elCheck.checked = false;
			}		
		}
	});
}

function snsShareOnReplyCallback(service_name){
	if(CAFEAPP.ui.sns.allows.contains(service_name) == false){
		CAFEAPP.ui.sns.allows.push(service_name);
		setTimeout(function(){
			var elCheck = daum.$$("input." + service_name)[0];
			elCheck.checked = true;
			alert(service_name + " 서비스에 연결되었습니다.");
			applySnsAllows();
		}, 100);
	}
}

function applySnsAllows(){
	var allows = CAFEAPP.ui.sns.allows;
	for(var i = 0; i < allows.length; i++){
		var arrAllowLabels = daum.$$("." + allows[i]+"_label");
		for(var j = 0; j < arrAllowLabels.length; j++){
			arrAllowLabels[j].parentNode.className = arrAllowLabels[j].parentNode.className.replace(/sns_not_connected/g, ""); 
		}
	}
}


(function(){
	namespace("daum.cafe.bbs");
	var sns = daum.cafe.bbs.Sns = function(elId){
		this._init(elId);
	};
	sns.prototype = {
		_init : function(elId){
			var el = daum.$(elId);
			if(!el){return;}
			this._el = el;
			
			
			daum.Event.addEvent(daum.$$(".yozm", el)[0], "click", this.sendSnsPopup.bindAsEventListener(this));
			daum.Event.addEvent(daum.$$(".twitter", el)[0], "click", this.sendSnsPopup.bindAsEventListener(this));
			daum.Event.addEvent(daum.$$(".nate", el)[0], "click", this.sendSnsPopup.bindAsEventListener(this));
			
			daum.Event.addEvent(daum.$$(".facebook", el)[0], "click", this.sendSnsPopup.bindAsEventListener(this));
			daum.Event.addEvent(daum.$$(".me2day", el)[0], "click", this.sendSnsPopup.bindAsEventListener(this));
			
			daum.Event.addEvent(daum.$$(".show_more_sns", el)[0], "click", this.toggleShowMore.bindAsEventListener(this));
			
			this._elSendCount = daum.$$(".sns_send_count", el)[0];
			
			this._callbackId = "sendSnsCallback" + elId;
			
			this._elMoreList = daum.$$(".sns_more_items", el)[0];
			
			window[this._callbackId] = this.sendSnsCallback.bind(this);
		},
		
		sendSnsPopup : function(ev){
			daum.Event.stopEvent(ev);
			hideOtherLayer();
			var el = daum.Event.getElement(ev);
			if(el.tagName.toLowerCase() != "a"){
				el = el.parentNode;
			}
			var url = el.href;
			url += "&callback=" + this._callbackId;
			var send_sns = window.open(url, 'send_sns', 'width=500,height=400,resizable=no,scrollbars=no');
			send_sns.focus();
			this.hide();
		},
		
		toggleShowMore : function(ev){
			daum.Event.stopEvent(ev);
			if(daum.Element.visible(this._elMoreList)){
				this.hide();
			} else {
				this.show();
			}
		},
		
		show: function(){
			var elMenus = daum.$("menus");
			if(elMenus && this._elMoreList.parentNode != elMenus){
				elMenus.appendChild(this._elMoreList);
				
			}
			this.updatePosition();
			hideOtherLayer("showMoreSns");
			daum.Element.show(this._elMoreList);
		},
		
		updatePosition: function(){
			var coords = daum.Element.getCoords(this._el);
			var offsetX = 0;
			var offsetY = -12;
			if(daum.Browser.ie){
				offsetX = -40;
				offsetY = -2;
			}
			daum.Element.setPosition(this._elMoreList, coords.left + offsetX, coords.bottom + offsetY);
		},
		
		hide: function(){
			daum.Element.hide(this._elMoreList);
		},
		
		sendSnsCallback : function(post_id, service_name, message, permalink){
			try{
				this.updateToSnsCount(post_id, service_name, message, permalink);
				this.updateUI();
			}catch(e){
				alert(e);
			}
		},
		
		updateToSnsCount : function(post_id, service_name, message, permalink){
			WISNSShareService.reportSNSShareResult(
					{
						grpid : CAFEAPP.GRPID,
						fldid : CAFEAPP.FLDID,
						dataid : CAFEAPP.ui.DATAID,
						serviceName : service_name || "", 
						postid : post_id || "",
						message : message || "",
						permalink : permalink || ""
					},
					{
						callback : function(){
							try{
								console.log("report ok");
							}catch(e){}
						},
						errorHandler:function(errStr, e) {
							try{
								console.error('error [SNS 보내기 카운트 업데이트에 실패했습니다.] : ', e);
							}catch(e){
								//alert('SNS 보내기 카운트 업데이트에 실패했습니다. ');
							}
						}
					}
			);
		},
		
		updateUI : function(){
			var cnt = parseInt(this._elSendCount.innerHTML) || 0;
			cnt++;
			this._elSendCount.innerHTML = cnt;
		}
	};
})();





/**
 * [FROM]scrap_v1.0.7.js 
 */
function setScrapMenu(ownerId, link1, link2, link3) {
    var copyList = ["카페", "블로그", "메일"];
	var str = "<ul>";
	for (var i=0; i < copyList.length; i++) {
	    str += "<li><a href=\'#\' onclick='" +eval("link"+Number(i+1)) + "; return false;'>" + copyList[i] + "</a></li>";
	}
	str += "</ul>";
	
	return str;
}
function showScrapLayerMenu(ownerId, link1, link2, link3) {
	if(CAFEAPP.IS_NO_AUTH_SIMPLEID){
		poplogin_simple("스크랩");
		return;
	}
    var name = "scrapLayer";    
    var layerPos = getCoords(ownerId,"all");
    if (!document.getElementById(name)) {
        var cElement = document.createElement("DIV");
        cElement.id = name;
        cElement.style.zIndex = 50;
        cElement.className = 'cafeLayer';       
        document.body.appendChild(cElement);
    }
    clickAreaCheck = true;
    hideOtherLayer(ownerId);
    var menu = document.getElementById(name);
    if(menu.style.display == "block"){
        divDisplay(name, 'none');
        return;
    }
    divDisplay(name, 'block');      
    
    var offsetY = 0;
    if(daum.Browser.ie){
    	offsetY = -2;
    }
    
	menu.style.left = layerPos.left + "px";
    menu.style.top = layerPos.top + layerPos.height + offsetY + "px";    
    menu.innerHTML = setScrapMenu(ownerId, link1, link2, link3);
}
function goScrapCafe( node, grpid, fldid, dataid ) {
    window.open("http://scrap.cafe.daum.net/_dss_/scrap_cafe?location_id="+grpid+"&folder_id="+fldid+"&data_id="+dataid+"&source_location_code=1&source_etc="+node,'scrap','width=620, height=460', 'resizable=yes,scrollbars=yes');
}

function goScrapBlog( node, grpid, fldid, dataid ) {    
    window.open("http://scrap.cafe.daum.net/_dss_/scrap_cafe?location_id="+grpid+"&folder_id="+fldid+"&data_id="+dataid+"&source_location_code=1&source_etc="+node+"&target_location_code=4",'scrap','width=620, height=460', 'resizable=yes,scrollbars=yes');
}

function goScrapPlanet( node, grpid, fldid, dataid ) {                      
    window.open("http://scrap.cafe.daum.net/_dss_/scrap_cafe?location_id="+grpid+"&folder_id="+fldid+"&data_id="+dataid+"&source_location_code=1&source_etc="+node+"&target_location_code=3",'scrap','width=620, height=460', 'resizable=yes,scrollbars=yes');
}

function goScrapHanmail( node, grpid, fldid, dataid ) {
        window.open("http://scrap.cafe.daum.net/_dss_/scrap_cafe?location_id="+grpid+"&folder_id="+fldid+"&data_id="+dataid+"&source_location_code=1&source_etc="+node+"&target_location_code=15",'scrap','width=620, height=460', 'resizable=yes,scrollbars=yes');
}

//popup
function popupSingo(menu_color,grpname,grpcode) {
	url='/_c21_/clean_singo?uiversion=cube&menu_color='+menu_color+'&grpcode='+grpcode+'&grpname='+grpname;    
    window.open(url, 'singo','width=560,height=390,resizable=yes,scrollbars=no');
}

function popup(szURL, szName, iWidth, iHeight, properties) {
    var p ;
    if (typeof(properties) == "undefined")  {
        p= 'resizable=yes,scrollbars=yes,';
    }else{
        p = properties;
    }
       window.open(szURL, szName, 'width=' + iWidth + ',height=' + iHeight + ', '+p);
}

/**
 * [FROM] minidaum.js
 */
function logout(){
    top.personal_area_on = 0;
    top.personal_area_load = 0;
    
    if (CAFEAPP.CAFEINFO_currentPublic) {
        var url = "http://login.daum.net/Mail-bin/logout.cgi?url="+encodeURIComponent(document.location.href);
    } else {
        var dummy = new Date().getTime() + Math.round(Math.random() * 100000);
        var img = new Image();
        img.src = 'http://www.daum.net/doc/loginoutClick.html?t__nil_navi=logout&nil_src=cafebbs&dummy=' + dummy
        var url = "http://login.daum.net/Mail-bin/logout.cgi?url=http://www.daum.net/?t__nil_navi=logout";
    }
    
    if(top.down==null){
        document.location.href = url;
    }else{
        if (CAFEAPP.CAFEON) {
            try{
                top.logoutCafeonV2();
            } catch ( Exception ){}
            
            try{
				top.cafeonManager.logoutCafeon();
			} catch ( Exception ){}
        }

        if (CAFEAPP.CAFEINFO_currentPublic) {
            top.down.location.href = url;
        } else {
            top.location.href = url;
        }
        
        top.power_editor_load = 0;
    }
    
}

function login(reffer){
	var reffer = reffer || (top.down ? top.down.location.href : top.location.href);
    var url = "http://login.daum.net/accounts/loginform.do?url="+encodeURIComponent(reffer)+"&category=cafe&t__nil_navi=login";
    top.location.href = url;
}

function poplogin_simple(strActionName){
	strActionName = strActionName || "글 작성";
	
	if(window.confirm("간편아이디는 회원 인증 후 " + strActionName + "이 가능합니다.\n회원 인증 페이지로 이동하시겠습니까?")){
		window.open('/_c21_/poplogin?grpid=' + CAFEAPP.GRPID + '&checksimpleid=Y', 'poplogin', 'width=450,height=300,resizable=no,scrollbars=no');
	}
}

/*
function poplogin(isSimple){
	var strChkSimple = isSimple ? "&checksimpleid=Y" : "";
	window.open('/_c21_/poplogin?grpid=' + CAFEAPP.GRPID + strChkSimple, 'poplogin', 'width=450,height=300,resizable=no,scrollbars=no');
}
*/

function caller(url) {
    if(CAFEAPP.NOT_EDITOR){
        top.status='';
        if (top.flag != null) {
            top.deflag();
        }
    }
    location.href=url;
}

var human = ["001", "002", "003", "004", "005", "006", "007", "008", "009", "010"];
var plant = [ "011", "015", "020", "025", "030", "035", "040", "045","050"];
var animal  = [ "051", "055", "060", "065", "070", "075","080", "085", "090"];
var food = ["091","095", "100", "105", "110", "115", "120", "125", "130"];
var communi = ["131","135", "140", "145", "150", "155", "160", "165", "170"];
var medal = ["171","189", "193", "197", "198", "202", "206", "208", "209", "210"];
var ranking = new Array( human, plant, animal, food, communi, medal );  

function isRankingGroup(rankgroup,rank) {
    if ( rankgroup[0] <= rank &&  rankgroup[ rankgroup.length-1 ] >= rank ){
        return true;
    } else {
        return false;
    }
}
function addEvent(el, type, fn) {
    if (window.addEventListener) {
        el.addEventListener(type, fn, false);
    }
    else if (window.attachEvent) {
        el.attachEvent('on' + type, fn);
    }
    else {
        el['on' + type] = fn;
    }
}

function resizeContentImg(){
	var user_cont = document.getElementById('user_contents').getElementsByTagName("img");
	for(var i=0; i < user_cont.length; i++){
		if(user_cont[i].offsetWidth > userContWidth){
			user_cont[i].style.width = userContWidth + 'px';
		}
	}
}

function setMinWidth_Img(val,maxWidth){    
    var uc = document.getElementById("user_contents");
    var ucc_img = uc.getElementsByTagName("img")
    for(var i=0,len=ucc_img.length;i<len;i++){
        if(parseInt(ucc_img[i].width) > maxWidth)ucc_img[i].style.width = val+"px";
    }
}
function resizeMinWidthWrap() {
    var ele = document.getElementById("wrap");
    ele.style.width = (document.body.clientWidth < 1024) ?  "971px" : "auto";      
    window.setTimeout('resizeMinWidthWrap()',250);    	
}

/**
 * [FROM] _cafenoti_mini.html
 * Generated by Blues System
 */
Scrolling = function(preid,interval,height)
{
    this.preid = preid;
    this.speed = 1;             
    this.height = height;       
    this.div = document.getElementById(this.preid);
    this.div_scroll = document.getElementById(this.preid+"_scroll");
    this.div_scroll_list = this.div_scroll.getElementsByTagName("li");
    this.cnt = this.div_scroll_list.length;
    this.interval = interval;
    this.tmp = 0; this.ncnt=1;
    if(this.cnt > 0 ) this.div.style.display = "block";
    if(this.cnt > 1 ){
        var self=this;
	    for(var i=0,len=this.cnt; i<len; i++){
	        var cur = i+1;
	        this.div_scroll_list[i].innerHTML += '<span class="noti_cnt">&nbsp;&nbsp; <a class="num" href="#" onclick="ScrollNoti.isover=true;ScrollNoti.showLayer();return false;">(<strong class="txt_point b">'+cur+'</strong> / '+this.cnt+')</a> &nbsp;<span class="arrowB">▼</span></span>';
	    }
        //this.div.onmouseover=this.div_scroll.onmouseover=function(){ this.isover=true;  self.showLayer(); }
        //this.div.onmouseout=this.div_scroll.onmouseout=function(){ this.isover=false; setTimeout(function(){self.hideLayer()},500); }
        this.div.onmouseover=this.div_scroll.onmouseover=function(){ this.isover=true; }
        this.div_scroll.onmouseout=function(){ this.isover=false; setTimeout(function(){self.hideLayer()},500); }        
        window.setTimeout(function(){self.play()}, 5000);
    }
    
}
Scrolling.prototype.play = function() {
    var self=this;    
    var top = 0;
    if(self.div_scroll.isover) {
       // top = 0;
//        self.ncnt=1;
//        self.tmp=0;
//        this.div_scroll.style.top=0;
    }else {
        top = parseInt(self.div_scroll.style.top) || 0;
        if(++self.tmp > self.cnt-1)
        {
            this.div_scroll.style.top=0; self.ncnt=1; 
            self.tmp=0;
            window.setTimeout(function(){self.play()}, this.interval);
            return;
        }
        else {
            this.div_scroll.style.top=top-self.height+"px";
        }
    }     
    window.setTimeout(function(){self.play()},this.interval);
}
Scrolling.prototype.showLayer = function(){
    this.div.className ="more_notice";
    this.div_scroll.className = "bg_sub";
    this.div_scroll.style.top = 0;
    this.ncnt=1;
}
Scrolling.prototype.hideLayer = function(){    
    if(this.div_scroll.isover == true) return;
    this.div.className ="simple_notice";
    this.div_scroll.className = "";
    this.div_scroll.style.top = 0;
    this.ncnt=1;                
}

/**
 * [FROM] cafeinfobox.html
 */

var touch_cooname= "touch_install";
var alimNewImageTag = "<img src=\"http://i1.daumcdn.net/cafeimg/cf_img2/bbs2/icon_new6.gif\" width=\"8\" height=\"8\" alt=\"new\" />";
function goWebMemoBox() {
    window.open('http://mail.daum.net/msg/Index.daum#ViewCafeMsgBoxCmd:fromPage=,toPage=,first=,last=,grpid=,mode=');
}

function goHanmailBox() {
    window.open('http://mail.daum.net/hanmail/Goto.daum?error=login&amp;_top_cafetop=login_mail');
}

function SetCookie(cookieName, cookieVal){
  date=new Date();
  validity=100;
  date.setDate(date.getDate()+validity);
  document.cookie=cookieName+'='+escape(cookieVal)+'; expires='+date.toGMTString();
}

function GetCookie(cookieName){
  allCookies=document.cookie.split('; ');  // cookies are separated by semicolons
  for (i=0;i<allCookies.length;i++){
    cookieArray= allCookies[i].split('='); // a name/value pair (a crumb) is separated by an equal sign
    if (cookieName==cookieArray[0]){
        return allCookies[i];
    }
  }
  return null;
}

function goMyArticleList(){
    form = document.searchMyForm;
    form.submit();
}

var exige_autosave_load = 0;
var power_autosave_load = 0;
var isSendPersonalRequest = false;


/* copy from cindex.html for personal area local test. */
var clean = "";
function cleanPersonalArea(arg){
	if(top.clean != arg){
		top.webmemo_cnt = 0;
		top.webmemo_new = false;
		top.is_webmemo_load = false;
		top.hanmail_cnt = 0;
		top.is_hanmail_load = false;
		top.my_alimi = 0;
		top.clean = arg;
	}
}
/* copy from cindex.html for personal area local test. */

function initPersonalArea(){
	top.cleanPersonalArea(CAFEAPP.CAFE_ENCRYPT_LOGIN_USERID);
    getAllPersonalCount(); //메일, 쪽지 갯수 불러오기
    loadMyArticleFeedback(); //내글 반응 불러오기
}

function getAllPersonalCount(){
    if(isSendPersonalRequest){
        return;
    }
    if(top.is_webmemo_load && top.is_hanmail_load){
    	SetAllPersonalCountForCafe(top.hanmail_cnt, top.webmemo_cnt, top.webmemo_new);
    	return;
    }
    top.isSendPersonalRequest = true;
    var url = "http://personal.cafe.daum.net:8080/_c21_/allcountforcafe_hdn";
    headElement = document.getElementsByTagName("head").item(0);
    var scriptTag = document.createElement("script");
    scriptTag.setAttribute("id", "PersonalScript");
    scriptTag.setAttribute("type", "text/javascript");
    scriptTag.setAttribute("src", url);
    headElement.appendChild(scriptTag);
}

/**
 * 
 * 메일, 쪽지 수 초기화되는 과정
 * 마크업 기본값은 메일 : 0, 쪽지 : 읽기
 * 요청시 갯수가 숫자가 아닌 값(ex : '확인')이 들어오면 그대로 유지(읽기 실패 인 상태)
 * 실제 읽기 실패여서 콜백이 호출이 안되었을 경우 : 그대로 유지
 * 실제 읽기 성공하여 콜백이 호출되고, 숫자 값이 들어온 경우, 숫자 표시
 * 
 * 레거시 코드와 비교했을 때, 새로 불러오는 빈도수 비교 : 둘다 동일하게 아래 패턴을 따른다.
 *  	쪽지, 메일은 둘 중 한개라도 불러오지 못했으면 다시 부른다. --> 성공이 아니라 요청했는지 여부
 *  	내글반응은 초기값인 0이고, 로그인한 상태라면 불러온다. (반응이 없다면 -1로 바뀜)
 *  
 */
function SetAllPersonalCountForCafe(hanmailCount, webMemoCount, isNew){
	insertHanmailCnt(hanmailCount);
	insertWebMemoCnt(webMemoCount, isNew);
}

function loadMyArticleFeedback(){
	if(top.my_alimi > 0){
		insertMyAlimCnt(top.my_alimi);
		return;
	}
	var myAlimiFrame = document.getElementById('ifr_my_alimi');
	if (top.my_alimi == 0 && CAFEAPP.MEMBER_MEMBER && myAlimiFrame) {
		myAlimiFrame.src = "/_c21_/my_alimi?cmd=IS_NEW&grpid="+CAFEAPP.GRPID;
    }
}

function setInnerHtmlWithElementId(elId, value){
	var el = document.getElementById(elId);
	if(el){
		el.innerHTML = value;
	}
}

function insertHanmailCnt(cntOrg) {
	var cnt = parseInt(cntOrg);
	top.hanmail_cnt = cntOrg;
	top.is_hanmail_load = true;
	if(typeof cnt == "number" && !isNaN(cnt)){
		setInnerHtmlWithElementId('mail_cnt', cnt);
	}
}

function insertWebMemoCnt(cntOrg, isNew) {
	
	top.webmemo_new = (isNew == 'true' || isNew === true);;
	top.is_webmemo_load = true;
	top.webmemo_cnt = cntOrg; 
	var cnt = parseInt(cntOrg);
	
	if(top.webmemo_new === true){
		setInnerHtmlWithElementId('alimi_new', alimNewImageTag);
		setInnerHtmlWithElementId('webmemo_new', alimNewImageTag);
	}
	if(typeof cnt == "number" && !isNaN(cnt)){
		setInnerHtmlWithElementId('webmemo_cnt', top.webmemo_cnt); 
	}
}

function insertMyAlimCnt(count) {
	count = parseInt(count);
	top.my_alimi = count;
	if(typeof count == "number" && !isNaN(count)){
		if (count > 0){
			setInnerHtmlWithElementId('my_alimi_new', alimNewImageTag);
			setInnerHtmlWithElementId('alimi_new', alimNewImageTag);
		}
	}
}

function getAutoSaveIframe() {
    if (navigator.appName.indexOf("Microsoft") != -1) {
      return window['ifr_exige_autosave'];
    } else {
      return window.frames['ifr_exige_autosave'];
    }
}


/**
 * [FROM] searchbox.html
 */

function goBbsCafeSearch() {
	if (CAFEAPP.NEW_SEARCH_ENGINE){
	    if (document.bbssearchBox.dispQuery.value == "") {
	        alert('검색할 키워드를 입력해주세요.');
	        return false;
	    }
	}else {
	    if (document.bbssearchBox.searchcmd.value == "") {
	        alert('검색할 키워드를 입력해주세요.');
	        return false;
	    }
	}
    document.bbssearchBox.action="/_c21_/cafesearch";
    
    var form = document.bbssearchBox;
    SearchUtil.encodingQuery(form.query, form.dispQuery.value);
    
    document.bbssearchBox.submit();
    
}

function goPopKeywordSearch(popquery) {
	if (CAFEAPP.NEW_SEARCH_ENGINE){
	    if (popquery == "") {
	        return;
	    }
	
	    document.bbssearchBox.popquery.value=popquery;
	    document.bbssearchBox.action="/_c21_/cafesearch";
	    document.bbssearchBox.submit();
	}
}

function clearText(thefield){ 
    if (thefield.defaultValue==thefield.value) 
        thefield.value = "" 
        thefield.style.backgroundImage = '';
} 

function check_setcomment(contents){    
    var form = document.writeForm;      
    form.contents.value = document.getElementById(contents).value;
    if(form.contents.value == ""){
        alert("내용을 입력해주세요.");
        document.getElementById(contents).value = '';
        return;
    }
    if(contents != 'subcontents'){
        form.pcmtid.value = '';
    }
    form.usetexticon.checked = document.getElementById('texticon1').checked;        
    form.submit();
}
    
var key;    
function blockKeyCode(e){                   
    if(window.event) {
        // for IE, e.keyCode or window.event.keyCode can be used
        key = e.keyCode;            
    }
    else if(e.which) {
        // netscape,firefox
        key = e.which;  
    }
    else {
        // no event, so pass through
        key=0;
    }
}

var refreshed = false; // 한번만 리프레쉬 되도록 한다.
function refreshField(){
    if (!refreshed){
        document.getElementById("query").value = "";
        refreshed = true;
    }
}



/**
 * [FROM] _title.html
 */
function goTitleCafeSearch() {
    if (document.titleSearchBox.dispQuery.value == "") {
        alert('검색할 키워드를 입력해주세요.');
        return false;
    }
    document.titleSearchBox.action="/_c21_/cafesearch";
    var form = document.titleSearchBox;
    SearchUtil.encodingQuery(form.query, form.dispQuery.value);
    
	document.titleSearchBox.submit();
}
/**
 * [FROM] bbs_read.html
 */
function onClipBoard(isSuccess, title, url){
    if(isSuccess) {
        alert(title + " 주소가 복사되었습니다.");
    }
    else { alert(title + " 주소가 복사되지 않았습니다.\n아래 주소를 직접 드래그하여 복사해주세요.\n\n" + url); }
}

function replaceImageToOriginal(url) {
    var replace_url = url.replace("image", "original");
    albumViewer('viewer', replace_url);
}

function showOriginalImage(ex) {
    var url;
    try {
        url = ex.target.src;
    } catch (e) {
        url = ex.srcElement.src;
    }
    replaceImageToOriginal(url);
}

function change_content(isOrgCont) {
    if(isOrgCont){
        document.getElementById('spamMsg').style.display = "none";
        document.getElementById('user_contents').innerHTML = document.getElementById('org_cont_id').innerHTML;
    } else {
    }
}

function show_event_pop() {
    var x,y;
    if (self.innerHeight) // all except Explorer
    {
        x = self.innerWidth;
        y = self.innerHeight;
    }
    else if (document.documentElement && document.documentElement.clientHeight)
        // Explorer 6 Strict Mode
    {
        x = document.documentElement.clientWidth;
        y = document.documentElement.clientHeight;
    }
    else if (document.body) // other Explorers
    {
        x = document.body.clientWidth;
        y = document.body.clientHeight;
    }

    document.getElementById('msnEvt').style.left = x / 2 - 188;
    document.getElementById('msnEvt').style.top = 120;
    document.getElementById('msnEvt').style.display = '';
}

function hide_event_pop() {
    document.getElementById('msnEvt').style.display = 'none';
}


/**
 * [FROM] components
 */
function group_go() {
    var frm = document.getElementById("somoimForm");
    if ( frm.goLink.options[frm.goLink.options.selectedIndex].value != 'jjj' ){
        caller('/_c21_/' + frm.goLink.options[frm.goLink.options.selectedIndex].value); // 음악끊김을 막기위해
    }
}   
var group_progress = false;
function showSmallGroupList() {
    if( group_progress == false ){
        var url = "/_c21_/cafesmallgroup?grpid="+CAFEAPP.GRPID;
        cubeAjax.Request(url, {
            onComplete: FillDropDown
         });
    }  
}
function FillDropDown(xmlHttp){            
    var xmlDoc = eval('(' + xmlHttp.responseText + ')');
    var objDDL = document.forms['somoimForm'].elements['goLink'];        
    objDDL.options.length = 0;
    for(i=0;i< xmlDoc.cafelist.length;i++){                                   
      var theText = xmlDoc.cafelist[i].name;                                      
      var theValue = xmlDoc.cafelist[i].value;
                                           
      var option = new Option(theText, theValue);                           
      objDDL.options.add(option, objDDL.options.length);
    }       
    group_progress = true;    
} 

function changeSideCont_pupular(obj) {                                                                              
    if(obj == "count"){                                     
        document.getElementById('popular_cnt').className = "inBox block";
        document.getElementById('popular_reply').className = "inBox none";
        changeSideContPage(1,'popular_cnt');
    } else {
        document.getElementById('popular_cnt').className = "inBox none";
        document.getElementById('popular_reply').className = "inBox block";
        changeSideContPage(1,'popular_reply');
    }
}

function changeSideCont_member(obj) {                                               
    if(obj == "visit"){
        document.getElementById('member_visit').className = "inBox block";
        document.getElementById('member_article').className = "inBox none";
        document.getElementById('member_reply').className = "inBox none";
        if (document.getElementById('member_visit_page1')) changeSideContPage(1,'member_visit');
    } else if(obj == "article") {
        document.getElementById('member_visit').className = "inBox none";
        document.getElementById('member_article').className = "inBox block";
        document.getElementById('member_reply').className = "inBox none";
        if (document.getElementById('member_article_page1')) changeSideContPage(1,'member_article');
    } else {
        document.getElementById('member_visit').className = "inBox none";
        document.getElementById('member_article').className = "inBox none";
        document.getElementById('member_reply').className = "inBox block";
        if (document.getElementById('member_reply_page1')) changeSideContPage(1,'member_reply');                            
    }
}

function changeSideCont_noti(obj) {                                                                             
    if(obj == "visit"){                                     
        document.getElementById('member_noti_visitor').className = "inBox block";
        document.getElementById('member_noti_join').className = "inBox none";
        changeSideContPage(1,'visitor');
    } else {
        document.getElementById('member_noti_visitor').className = "inBox none";
        document.getElementById('member_noti_join').className = "inBox block";
        changeSideContPage(1,'join');                           
    }
}

function changeSideCont_cafeqa(obj) {                                               
    if(obj == "answer"){
        document.getElementById('cafeqa_answer').className = "inBox block";
        document.getElementById('cafeqa_faq').className = "inBox none";
        if (document.getElementById('cafeqa_answer_page1')) changeSideContPage(1,'cafeqa_answer');
    } else {
        document.getElementById('cafeqa_answer').className = "inBox none";
        document.getElementById('cafeqa_faq').className = "inBox block";
        if (document.getElementById('cafeqa_faq_page1')) changeSideContPage(1,'cafeqa_faq');
    }
}

function goDownFrame(url){
    top.down.location.href=url;
    if (CAFEAPP.CAFE_TEMPLATE_TYPE_CODE == "1"){
        document.location.reload();
    }
}

/* textarea resizing + byte check */
function resizeArea(curObj, min, max, limit, limitcnt){
	
	updateCharter(curObj,limit,300);
	
	textarea = curObj;
	if (navigator.userAgent.indexOf("SV1") > 0){   } 
	else if(navigator.userAgent.indexOf("MSIE 7")>0) {  }
	else { max = 300; }

	if (navigator.userAgent.indexOf("Chrome/2") > 0){
		scrollheight = curObj.scrollHeight - 4;
	} 
	else { scrollheight = curObj.scrollHeight; }

	if(scrollheight<=min) {
		textarea.style.height = min + 'px';
		textarea.style.overflowY = "hidden";
	}else if(scrollheight>max){
		textarea.style.height = max + 'px';
		textarea.style.overflowY = "auto";
	}else{
		textarea.style.height = scrollheight + 'px';
		textarea.style.overflowY = "hidden";
	}
}

// component: cafestat
function changeCafeStat(id){
	var obj = document.getElementById('tab_' + id + "_stat");
	if(obj && obj.className=="txt_point"){
		return false;
	}
	document.getElementById('grph_homevisit').className="none";
	document.getElementById('grph_newjoin').className="none";
	document.getElementById('grph_newarticle').className="none";
	document.getElementById('grph_newcomment').className="none";
	
	document.getElementById('tab_homevisit_stat').className="opacity";
	document.getElementById('tab_newjoin_stat').className="opacity";
	document.getElementById('tab_newarticle_stat').className="opacity";
	document.getElementById('tab_newcomment_stat').className="opacity";
	
	document.getElementById('grph_'+id).className="grph_wrap";
	obj.className="txt_point";
	return false;
}

function showGrph(id){
	//세로선 관련 옵션들 
	var hGridGap = 15;
	var hGridCount = 6;
	var hGridOffsetTop = 1;
	var grph =  document.getElementById(id);
	var dd = grph.getElementsByTagName("DD");
	if(dd.length == 0){return;}
	
	
	if (!grph.hasHGrid) {
		var hGrid = document.createElement("div");
		hGrid.className = "divLine component_tit_line opacity";
		
		for (var i = 0; i < hGridCount; i++) {
			hGrid.style.top = (hGridOffsetTop + (hGridGap * i)) + "px";
			var cNode = hGrid.cloneNode(false);
			if(i == hGridCount-1){
				cNode.className += " bottomLine" 
			}
			grph.appendChild(cNode);
		}
	}
	grph.hasHGrid = true;
	
	
	var max = 0;
	for(var i = 0;i < dd.length; i++){
		var n = parseInt(dd[i].innerHTML);
		if(isNaN(n) || ((typeof n).toLowerCase() == "number" && 0 > n)){n=0;}
		if(max < n){max=n;}
	}
	var unit = max / 74;
	for(var i = 0; i < dd.length; i++){
		var n = parseInt(dd[i].innerHTML);
		if(isNaN(n)){n=0;}
		var height = Math.ceil(n / unit);
		if(isNaN(height) || ((typeof height).toLowerCase() == "number" && 0 >= height)){ height = 1;}
		dd[i].style.height = height + "px";
	}
	
	if(!grph.hasTooltip){
		var grph_tooltip = document.createElement("div");
		grph_tooltip.className="grph_tooltip none";
		
		var dt = grph.getElementsByTagName("DT");
		
		for(var i = 0; i < dd.length;i++){
			var grph_tt = grph_tooltip.cloneNode(false);
			grph_tt.id = id + "_tooltip" + (i+1);
			
			var d = dt[i].innerHTML.replace(/([0-9]{4})([0-9]{2})([0-9]{2})/, "$1.$2.$3");
			dt[i].innerHTML = dt[i].innerHTML.replace(/([0-9]{4})([0-9]{2})([0-9]{2})/, "$3");
			var v = dd[i].innerHTML.replace(/([0-9]+)([0-9]{3})/, "$1,$2").replace(/([0-9]+)([0-9]{3})/, "$1,$2");
			grph_tt.innerHTML = "<p>" + d + "</p><p class=\"txt_point\">" + v + "</p>";
			grph.appendChild(grph_tt);
		}
		
		grph.onmouseover = function(evt){
			evt = window.event || evt;
			var el = evt.target || evt.srcElement;
			var tooltip_id = this.id + "_tooltip" + el.className.replace(/[^\d]*/, "");
			if(el.tagName.toLowerCase() == "dd" || el.tagName.toLowerCase() == "dt" || el == document.getElementById(tooltip_id)){
				
				var dd = this.getElementsByTagName("dd");
				var height = dd[el.className.replace(/[^\d]*/, "") - 1].offsetHeight;
				
				showTooltip(tooltip_id, el.offsetLeft, el.offsetWidth, this.offsetWidth, height);	
			}
		}
		grph.onmouseout = function(evt){
			evt = window.event || evt;
			var el = evt.target || evt.srcElement;
			var tooltip_id = this.id + "_tooltip" + el.className.replace(/[^\d]*/, "");
			if(el.tagName.toLowerCase() == "dd" || el.tagName.toLowerCase() == "dt"){
				closeTooltip(tooltip_id);	
			}
		}
	}
	grph.hasTooltip = true;		
	
	for(var i = 0; i < dd.length; i++){
		new growUp(dd[i], 700);
	}
}

function showTooltip(id, left, width, maxRight, height){
	var tooltip = document.getElementById(id);
	tooltip.className = tooltip.className.replace(/\snone/, "");
	
	left = left + width / 2 - tooltip.offsetWidth / 2;
	if(left < 0){left = 0;}
	else if(left + tooltip.offsetWidth > maxRight){left = maxRight-tooltip.offsetWidth;}
	tooltip.style.left = left + "px";
	tooltip.style.top = (74 - height - 29) + "px"; 
}

function closeTooltip(id){
	var tooltip = document.getElementById(id);
	tooltip.className = tooltip.className.replace(/\snone/, "");
	tooltip.className += " none";
}

function growUp(obj, duration){
	var dest = obj.offsetHeight;
	var gap = (dest<20)?2:10;
	var height = 0;
	var interval = parseInt(duration / 36);
	var start = (new Date()).getTime();
	obj.style.height = "0px";
	var growTimer = setInterval(function(){
		var end = new Date().getTime();
		if(height >= dest){
			clearInterval(growTimer);
			obj.style.height = dest + "px";
			return;
		}
		height += gap;
		obj.style.height =  height + "px";
		if(gap!=1) gap--;
	}, interval);
}

function calYValue(minY, maxY) {	
	if (minY == 0 && maxY == 0) {
		return  "yAxisMinValue='0' yAxisMaxValue='5' adjustDiv='0' numDivLines='4'";
	} else {
		var value = maxY - minY;
		
		if (value < 5) {
			maxY += 3;
			minY -= 3;
		} else {
			maxY += Math.round(value * 0.1);
			minY -= Math.round(value * 0.1);
		}
		
		if (minY < 0) minY = 0;
		
		value = maxY - minY;
		var rest = value % 5;
		
		if (rest != 0) {
			maxY += Math.floor((5 - rest) / 2);
			minY -= Math.ceil((5 - rest) / 2);
			if (minY < 0) minY = 0;
		}
		
		return "yAxisMinValue='" + minY + "' yAxisMaxValue='" + maxY + "' adjustDiv='0' numDivLines='4'";
	}
}

// 소모임 탈퇴
function exitGroup() {
	if (confirm("정말로 탈퇴 하시겠습니까?")) {
		window.document.location.href = '/_c21_/group_member_exit?grpid=' + CAFEAPP.GRPID + '&mgrpid=' + CAFEAPP.MGRPID;
	}
}

//통검  유입 읽기 화면 배경음악 플레이어에서 사용
function daumActiveX(obj,div){
	// generate html code
	// for ie obejct
	var html = '<object ';
	if (!obj.id && !obj.name){
		var r = Math.round(Math.random()*100);
		html += 'id="daumActiveXObject'+r+'" name="daumActiveXObject'+r+'" ';
	} else {
		if (obj.id) html += 'id="'+obj.id+'" ';
		else html += 'id="'+obj.name+'" ';
		if (obj.name) html += 'name="'+obj.name+'" ';
		else html += 'name="'+obj.id+'" ';
	}
	if (obj.type) html += 'type="'+obj.type+'" ';
	if (obj.classid) html += 'classid="'+obj.classid+'" ';
	if (obj.width) html += 'width="'+obj.width+'" ';
	if (obj.height) html += 'height="'+obj.height+'" ';
	if (obj.codebase) html += 'codebase="'+obj.codebase+'" ';
	// append events
	for (var i in obj.events){
		if (obj.events[i]){
			html += obj.events[i][0]+'="'+obj.events[i][1]+'" ';
		}
	}
	// end of object tag
	html += '>\n';
	// append params
	for (var i in obj.param){
		html += '<param name="'+obj.param[i][0]+'" value="'+obj.param[i][1]+'"/>\n';
	}

	// for ns embed
	html += '<embed ';
	if (!obj.id && !obj.name){
		var r = Math.round(Math.random()*100);
		html += 'id="daumActiveXObject'+r+'" name="daumActiveXObject'+r+'" ';
	} else {
		if (obj.id) html += 'id="'+obj.id+'" ';
		if (obj.name) html += 'name="'+obj.name+'" ';
	}
	if (obj.type) html += 'type="'+obj.type+'" ';
	if (obj.width) html += 'width="'+obj.width+'" ';
	if (obj.height) html += 'height="'+obj.height+'" ';
	// append params
	for (var i in obj.param){
		if (obj.param[i]){
			if (obj.param[i][0]=='movie' || obj.param[i][0]=='src'){
				var _src = obj.param[i][1];
			}
			html += obj.param[i][0]+'="'+obj.param[i][1]+'" ';
		}
	}
	html += '/>\n';
	html += '</object>';

	var isIE = (document.all)?true:false;
	if (isIE){
		document.getElementById(div).innerHTML = html;
	} else if (obj.type=='application/x-shockwave-flash' || obj.classid=='clsid:d27cdb6e-ae6d-11cf-96b8-444553540000'){
		// ie외의 브라우저에서 activex가 flash인 경우만 노출
		document.getElementById(div).innerHTML = html;
	}
}

function daumtrans(){
	var date = new Date().getTime().toString();
	document.getElementById('daumtrans').src = "http://go.daum.net/bin/daumtrans.gif?"+date;	
	window.setTimeout('daumtrans()',1200000);    	
}

/*
 * 말풍선 레이어: 이거 TTLayer (tool tip layer)로 이름 바꾸는게 좋을듯.
 */
var BalloonLayer={
	dir: {
		TOP: 1,
		RIGHT: 2,
		BOTTOM: 3,
		LEFT: 4
	},
	show:function(elm, where, diff){
		var icon=daum.$(elm);
		var layer=daum.$(icon.hash.substr(1));
		
		var c=daum.Element.getCoords(icon, true);
		
		var dx=0,dy=0;
		if (diff && diff.x) { dx = diff.x; }
		if (diff && diff.y) { dy = diff.y; }
		
		daum.Element.show(layer);
		
		switch(where) {
		case BalloonLayer.dir.TOP:
			daum.Element.setPosition(layer, (c.left-(layer.offsetWidth-icon.offsetWidth)/2)+dx, (c.top-layer.offsetHeight)+dy);
			break;
		case BalloonLayer.dir.RIGHT:
			daum.Element.setPosition(layer, c.left+icon.offsetWidth+dx, c.top+dy);
			break;
		case BalloonLayer.dir.BOTTOM:
			daum.Element.setPosition(layer, (c.left-(layer.offsetWidth-icon.offsetWidth)/2)+dx, c.top+c.offsetHeight+dy);
			break;
		case BalloonLayer.dir.LEFT:
			daum.Element.setPosition(layer, c.left-layer.offsetWidth+dx, c.top+dy);
			break;
		}
	},
	hide: function(elm){
		var icon=daum.$(elm);
		var layer=daum.$(icon.hash.substr(1));
		daum.Element.hide(layer);
	}
};

/* 특수문자인지 여부 */
function isSpecialCharacter(c){
	var code = c.charCodeAt(0);
	if (code <= 0x7e) { return false; } // keyboard letter
	if (code >= 0x3131 && code <= 0x318e) { return false; } // Hangul Letter
	if (code >= 0x3041 && code <= 0x3093) { return false; } // Hiragana
	if (code >= 0x30a1 && code <= 0x30f6) { return false; } // Katakana
	if (code >= 0x4e00 && code <= 0x9fa5) { return false; } // CJK Unified Ideograph
	if (code >= 0xac00 && code <= 0xd7a3) { return false; } // Hangul syllable
	if (code >= 0xf900 && code <= 0xfa0b) { return false; } // CJK compatibility Ideograph
	return true;
}

/* 팝업 리사이즈 */
function resizeToAutoHeight(width, heightOffset, offsets){
	var gap = 0;
	heightOffset = heightOffset?heightOffset:0;
	if(offsets){
		for(var i = 0;i < offsets.length; i++){
			if(offsets[i].bw){heightOffset = offsets[i].offset;}
		}
	}
	width = width?width:document.documentElement.scrollWidth;
	if(daum.Browser.cr){
		if (document.documentElement.clientHeight > 0) { gap = 50; }
		window.resizeTo(width, document.body.clientHeight + gap + heightOffset);
		return;
	}//Chrome
	var height = daum.Browser.sf ? document.body.clientHeight : document.body.scrollHeight;
	window.resizeTo(width, height); //set Standard Size...
	var innerHeight=document.documentElement.scrollHeight?document.documentElement.scrollHeight:document.body.scrollHeight;
	var contentHeight=0;
	if(daum.Browser.ie || daum.Browser.op){
		contentHeight = document.documentElement.clientHeight?document.documentElement.clientHeight:document.body.clientHeight;
		if(daum.Browser.ie_sv1){innerHeight = document.body.scrollHeight;}
	}
	else if(daum.Browser.ff){
		contentHeight = window.innerHeight;
	}
	else if(daum.Browser.sf)
	{
		innerHeight = document.body.clientHeight;
		contentHeight = window.innerHeight;
	}
	if(innerHeight && contentHeight && innerHeight != contentHeight){
		gap = innerHeight - contentHeight;
	}

	window.resizeTo(width, height+gap+heightOffset);
}

/* 게시글 신고 팝업 */
function openBbsReport(isMine, isLogin, grpid, mgrpid, fldid, dataid) {
	if (isMine) {
		alert("본인이 작성한 게시물은 신고하실 수 없습니다.");
		return;
	}
	
	var gourl = "spam_article_report?grpid=" + grpid + "&mgrpid=" + mgrpid + "&fldid=" + fldid + "&dataid=" + dataid;
	var url = "";
	if (!isLogin) {
		if (confirm("Daum로그인 후 신고하실 수 있습니다. 계속하시겠습니까?")) {
			var encodeParam = encodeBase64(gourl);
			url = "/_c21_/poplogin?grpid=" + grpid + "&reloadSelf=Y" + "&param="+encodeParam;
		}
	} else {
		url = "/_c21_/" + gourl;
	}
	
	var popBbs = window.open(url, 'bbsReport', 'width=450, height=300, resizable=yes, scrollbars=no');
	popBbs.focus();
}

/* 전사 통합 신고 팝업으로 신고 팝업 띄우기 */
function openSpam119(isMine, isLogin, grpid, mgrpid, fldid, dataid, title) {
	if (isMine) {
		alert("본인이 작성한 게시물은 신고하실 수 없습니다.");
		return;
	}
	
	var docurl = encodeURIComponent("http://cafe.daum.net/_service/bbs_read?grpid=" + grpid + "&mgrpid=" + mgrpid + "&fldid=" + fldid + "&datanum=" + dataid);
	
	var gourl = "http://spam119.daum.net/rainbow/report_popup?docurl=" + docurl + "&service_code=1&title=" + encodeURIComponent(title);
	var url = "";
	if (!isLogin) {
		if (confirm("Daum로그인 후 신고하실 수 있습니다. 계속하시겠습니까?")) {
			var encodeParam = encodeBase64(gourl);
			url = "/_c21_/poplogin?grpid=" + grpid + "&otherSite=Y&reloadSelf=Y" + "&param="+encodeParam;
		}
	} else {
		url = gourl;
	}
	
	var popBbs = window.open(url, 'bbsReport', 'width=450, height=300, resizable=yes, scrollbars=no');
	popBbs.focus();
}

/* 게시글 목록수 보기 */
function setListNum(listNum) {
	if (typeof listNum == "undefined") return;
	var form;
	if (document.pageForm && document.pageForm.listnum) {
		form = document.pageForm;
	} else if (document.searchForm && document.searchForm.listnum) {
		form = document.searchForm;
	} else if (document.listForm && document.listForm.listnum) {
		form = document.listForm;
	} else {
		return;
	}
	
	form.listnum.value = listNum;
	if (typeof CAFEAPP != "undefined" && typeof CAFEAPP.ui != "undefined") CAFEAPP.ui.LISTNUM = listNum;
	goPage(1);
}

/* 더보기 */
function toggleMoreLess(obj) {
	var _elWrap = obj.parentNode.parentNode;
	if(!_elWrap.className) {
		return;
	}
	if(_elWrap.className.indexOf("txc-moreless-spread") > -1) {
		_elWrap.className = 'txc-moreless';
	} else {
		_elWrap.className = 'txc-moreless-spread';
	}
}

GameListController = {
	index: 1,
	pixelPerPage : 52,
	pageGap : 6,
	gameList: null,
	gameListHeight: 0,
	btnPrev: null,
	btnNext: null,
	init: function(){
		if(this.gameList){return}
		var gameListWrap = daum.$("cafeGameListWrap");
		this.pixelPerPage = gameListWrap.offsetHeight;
		this.gameList = gameListWrap.getElementsByTagName("ul")[0];
		this.gameListHeight = this.gameList.offsetHeight;
		this.btnPrev = daum.$("gameListBtnPrev");
		this.btnNext = daum.$("gameListBtnNext");
	},
		
	goToOtherList: function(pageMoveType){
		this.init();
		if(pageMoveType == "prev" && this.hasPrev()){
			this.index--;
		}else if(pageMoveType == "next" && this.hasNext()){
			this.index++;
		}
		var pixelWithIndex = this.getPixelWithIndex(this.index);
		var curPagePixel = (pixelWithIndex * -1).px();
		this.gameList.style.marginTop = curPagePixel;
		this.gameList.className = "line_" + (pixelWithIndex / 53);
		this.changeBtnClass();
	},
	
	getPixelWithIndex : function(index){
		return (index-1) * this.pixelPerPage;
	},
	
	hasNext : function(){
		return this.gameListHeight > this.getPixelWithIndex(this.index+1) + this.pageGap;
	},
	
	hasPrev : function(){
		return this.index > 1;
	},
	
	changeBtnClass: function(){
		if(this.hasPrev()){
			daum.Element.removeClassName(this.btnPrev, "opacity");
		} else {
			daum.Element.addClassName(this.btnPrev, "opacity");
		}
		if(this.hasNext()){
			daum.Element.removeClassName(this.btnNext, "opacity");
		} else {
			daum.Element.addClassName(this.btnNext, "opacity");
		}
	}		
};

TooltipLayer = {	
	tooltipLayers : [],
	
	makeTooltipLayer : function(helpIcons){
		var tooltipString = [];
		var tooltip = daum.Element.getNext(helpIcons);		
		
		if(tooltip && tooltip.tagName.toLowerCase() == "p"){
			this.tooltipLayers.push({"icon" : helpIcons, "tooltip" : tooltip});
			document.body.appendChild(tooltip);
			
			if(tooltip){
				daum.Element.show(tooltip);			
				this.setTooltipPosition(helpIcons, tooltip);			
			}
		}
	},	
	setTooltipPosition : function(helpIcons, tooltip){
		if(tooltip){
			var position = daum.Element.getCoords(helpIcons);
			var layerWidth = tooltip.offsetWidth;
			var layerHeight = tooltip.offsetHeight;			
			var iconWidth = (helpIcons.width)? helpIcons.width : 0;
			
			var posX = parseInt(layerWidth/2 - (iconWidth/4));
			var posY = layerHeight + 1;			
			
			daum.Element.setLeft(tooltip, position.left - posX);
			daum.Element.setTop(tooltip, position.top - posY);
		}
	},
	showTooltip : function(elem){
		var tooltipLayer = this.getTooltipLayer(elem);
		
		if(tooltipLayer){
			daum.Element.show(tooltipLayer);
			this.setTooltipPosition(elem, tooltipLayer);
		} else {
			this.makeTooltipLayer(elem);
		}
	},
	hideTooltip : function(elem){		
		var tooltipLayer = this.getTooltipLayer(elem);		
		
		if(tooltipLayer){
			daum.Element.hide(tooltipLayer);
		}
	},
	getTooltipLayer : function(elem){
		if(this.tooltipLayers){		
	    	for(var i=0; i<this.tooltipLayers.length; i++){	    		
	    		if(this.tooltipLayers[i].icon == elem){
	    			return this.tooltipLayers[i].tooltip; 
	    		}
	    	}
		}    			
	}
};

/* 게시글 추천 */
function recommendBBS(grpid, fldid, dataid, recommendCnt, isLogin, member, grpcode, title){
	var recmdCnt = 0;
	
	if(!isLogin){
		if(confirm("게시글을 추천하시려면\n로그인 해주세요.")){ login(); }
		return;
	}
	if(!member){
		if(confirm("카페 회원만 추천할 수 있습니다.\n카페에 가입하시겠습니까?")){ document.location.href = "/_c21_/join_register?grpid="+grpid; }
		return;
	}
	
	recmdCnt = parseInt(recommendCnt, 10);
			
	if(CAFEAPP.RECOMMENDED){
		alert("이미 추천 하셨습니다.");
	} else {
		BbsRead.updateRecommedCount(grpid, fldid, dataid, grpcode, title ,{ callback:function(data) {
			if(data == "UPDATE"){
				var elRecommendCnt = daum.$("recommendCnt");
				elRecommendCnt.innerHTML = parseInt(elRecommendCnt.innerHTML, 10) + 1;
			}else if(data == "DUPLICATE"){
				alert("이미 추천 하셨습니다.");
			}else if(data == "ERROR"){
				//error log
			    new daum.Ajax({url: "http://magpie.daum.net/magpie/opencounter/Open.do?service=cafe&key=CAFE_BBS_BULLETIN_RECOMMEND_FAIL&extra=192EP"}).request();
			}
		}, errorHandler:function(errStr, e) {}});
	}
	CAFEAPP.RECOMMENDED = true;
	
}

/*
 * darkLayer - by wracker 2011.05.18
 * ex) darkLayer.show(targetLayer); darkLayer.hide();
 */
var darkLayer = {
	init: function(layerEl) {
		this.zIndex = 99999999;
		this.needToHideSearchQuery = "object, select";
		this.needtoHide = daum.$$(this.needToHideSearchQuery, document);
		this.positionMode = "fixed";
		this.layerArr = [];
		
		this.layerEl = layerEl;
		this.darkLayerEl = daum.$("cafeDarkLayer");
		
		this.layerArr.push(this.layerEl);
		this.layerArr.push(this.darkLayerEl);
		this.appendLayer();
		
		if(daum.Browser.ie6 || (daum.Browser.ie && this.isQuirksMode())) {
			this.positionMode = "absolute";
			this.setAbsoluteLayer();
		}
		
		daum.Event.addEvent(window, "resize", this.modifyLayerPosition.bind(this));
		
		this.layerEl.style.zIndex = this.zIndex + 2; 
		this.darkLayerEl.style.zIndex = this.zIndex;
		
		this.inited = true;
	},
	
	hideElement: function() {
		if(this.needtoHide) {
			for(var i=0, length = this.needtoHide.length; i < length; i++) {
				if(!this.isChildNodeOfLayer(this.needtoHide[i])) {
					this.needtoHide[i].style.visibility = "hidden";
				}
			}
		}
	},
	
	showElement: function() {
		if(this.needtoHide) {
			for(var i=0, length = this.needtoHide.length; i < length; i++) {
				if(!this.isChildNodeOfLayer(this.needtoHide[i])) {
					this.needtoHide[i].style.visibility = "visible";
				}
			}
		}
	},
	
	isChildNodeOfLayer: function(elem) {
		this.layerChildren = daum.$$(this.needToHideSearchQuery, this.layerEl);
		
		for(var i=0, length = this.layerChildren; i < length; i++) {
			if(elem === this.layerChildren[i]) {
				return true;
			}
		}
		return false;
	},
	
	isQuirksMode: function() {
		var doctype = "";
		
		if(document.doctype) {
			doctype = document.doctype.publicId;
		} else {
			doctype = document.getElementsByTagName("!")[0].nodeValue;
		}
		
		return doctype.indexOf("//W3C//DTD HTML 4.01") > -1;
	},
	
	setAbsoluteLayer: function() {
		this.layerEl.style.position = "absolute";
		this.setDarkLayerSize();
		daum.Event.addEvent(window, "scroll", this.modifyLayerPosition.bind(this));
	},
	
	appendLayer: function() {
			var appendTarget = daum.$("dialogs");
			var offset = null;
			
			if(appendTarget) {
				clearInterval(this.interval);
				
				for(var i = 0, length = this.layerArr.length; i < length ; i++) {
					appendTarget.appendChild(this.layerArr[i]);
				}
				
				this.showLayers();
				
				if(this.positionMode === "absolute") {
					offset = daum.Browser.getScrollOffsets(); 
				}
				this.setLayerPosition(offset);
			}
	},
	
	setLayerPosition: function(offset) {
		var windowSize = daum.Browser.getWindowSize();
		var leftValue = (windowSize.width - this.layerEl.offsetWidth) / 2;
		var topValue = (windowSize.height - this.layerEl.offsetHeight) / 2;
		
		leftValue +=  (offset && offset.left) ? offset.left : 0
		topValue +=  (offset && offset.top) ? offset.top : 0
		
		for(var i = 0, length = this.layerArr.length; i < length ; i++) {
			if(this.layerArr[i] === this.layerEl) {
				this.layerArr[i].style.left = leftValue.px();

				if(this.positionMode === "absolute") {
					daum.Fx.animate(this.layerArr[i], "top:" + topValue.px(), {duration: 0.5});
				} else {
					this.layerArr[i].style.top = topValue.px();
				}
			}
		}
		
		this.setDarkLayerSize();
	},
	
	modifyLayerPosition: function() {
		var offset = daum.Browser.getScrollOffsets();
		this.setLayerPosition(offset);
	},
	
	setDarkLayerSize: function() {
		var windowSize = daum.Browser.getWindowSize();
		var width = (daum.Browser.ie6 || (daum.Browser.ie && this.isQuirksMode())) ? this.getDocumentSize().width : windowSize.width;
		var height = (daum.Browser.ie6 || (daum.Browser.ie && this.isQuirksMode())) ? this.getDocumentSize().height : windowSize.height;
		
		if(parseInt(this.darkLayerEl.style.width, 10) !== width) {
			this.darkLayerEl.style.width = width.px();
		}
		
		if(parseInt(this.darkLayerEl.style.height, 10) !== height) {
			this.darkLayerEl.style.height = height.px();
		}
	},
	
	getDocumentSize: function() {
		
		return {
			width: Math.max(
				Math.max(document.body.scrollWidth, document.documentElement.scrollWidth),
				Math.max(document.body.offsetWidth, document.documentElement.offsetWidth),
				Math.max(document.body.clientWidth, document.documentElement.clientWidth)
			),
			
			height: Math.max(
				Math.max(document.body.scrollHeight, document.documentElement.scrollHeight),
				Math.max(document.body.offsetHeight, document.documentElement.offsetHeight),
				Math.max(document.body.clientHeight, document.documentElement.clientHeight)
			)
		};
	},
	
	show: function(layerEl) {
		if(layerEl) {
			this.init(layerEl);
		}
	},
	
	showLayers: function() {
		for(var i = 0, length = this.layerArr.length; i < length ; i++) {
			daum.Element.show(this.layerArr[i]);
		}
		
		this.hideElement();
	},
	
	hide: function() {
		this.showElement();
		
		for(var i = 0, length = this.layerArr.length; i < length ; i++) {
			daum.Element.hide(this.layerArr[i]);
		}
	}
};

/*
 * darkLayer 띄우기
 * ie6 tested
 * TODO: iframe, select, object show 시 숨기기, hide 시 보이기 추가 필요. - wracker1
 */
var cafeDarkLayer = {
		layerEl : null,
		layerShadowEl : null,
		darkLayerEl : null,
		_offsetX : 0,
		
		
		show : function(layerEl, shadowEl, offsetX){
			this.setOffsetX(offsetX);
			this.layerEl = daum.$(layerEl);
			this.layerShadowEl = daum.$(shadowEl);
			this.darkLayerEl = daum.$("cafeDarkLayer");
			daum.Element.show(this.darkLayerEl);
			this.updateDarkLayer();
		},
		
		hide : function(){
			clearTimeout(this.darkLayerTimer);
			daum.Element.hide(this.darkLayerEl);
		},
		
		setOffsetX : function(offsetX){
			offsetX = parseInt(offsetX);
			if(!!offsetX){
				this._offsetX = offsetX;

			}
		},
				
		updateDarkLayer : function(){
			var FAST_UPDATE_TIME = 100;
			var SLOW_UPDATE_TIME = 300;
			clearTimeout(this.darkLayerTimer);
			
			this.updateLayerPosition();
			
			if(daum.Browser.ie6 && this.darkLayerEl){
				var isUpdate = false;
				if(document.body.scrollHeight != this.darkLayerEl.offsetHeight){
					this.darkLayerEl.style.height = document.body.scrollHeight.px();
					isUpdate = true;
				}
				if(document.body.scrollWidth != this.darkLayerEl.offsetWidth){
					this.darkLayerEl.style.width = document.body.scrollWidth.px();
					isUpdate = true;
				}
				if(isUpdate){
					this.darkLayerTimer = setTimeout(this.updateDarkLayer.bind(this), FAST_UPDATE_TIME);
					return;
				}
			}
			
			this.darkLayerTimer = setTimeout(this.updateDarkLayer.bind(this), SLOW_UPDATE_TIME);
		},
		
		updateLayerPosition : function(){
			if(!this.layerEl){return;}
			elOffset = daum.Element.getCoords(this.layerEl, true),
	    	bOffset = daum.Browser.getWindowSize(),
	    	w = elOffset.right - elOffset.left,
	    	h = elOffset.bottom - elOffset.top,
	    	l = document.documentElement.scrollLeft || document.body.scrollLeft,
	    	t = document.documentElement.scrollTop || document.body.scrollTop,
	    	x = (bOffset.width-w)*0.5,
	    	y = (bOffset.height-h)*0.5;
			if(daum.Browser.ie6){
				x += l;
				y += t;
			}
			daum.Element.setPosition(this.layerEl, (parseInt(x) + this._offsetX), parseInt(y));		    
		    this.updateShadowLayerPosition ();
		},
		updateShadowLayerPosition : function(){
			if(this.layerShadowEl){
				this.layerShadowEl.style.display = "none";
		    	this.layerShadowEl.style.left = parseInt(x).px();
		    	this.layerShadowEl.style.top = parseInt(y).px();
		    	this.layerShadowEl.style.width = this.layerEl.offsetWidth.px();
		    	this.layerShadowEl.style.height = this.layerEl.offsetHeight.px();
		    }
		}
	};

/* 상세검색 관련 by wracker1 2010.11.10 - change3 */
CafeMenuInfo = function(param){
	this.li = null;
	this.refer = null;
	this.title = param.title;
	this.fldid = param.fldid;
	this.index = param.index;
	this.type = param.type;		
    if(param.elem){
    	this.li = param.elem.cloneNode(true);
		this.refer = param.elem;
    }
};

/* 상세검색 카페리스트 셀렉터 */
ListSelector = {
	listWrap: null,
	leftList: [],
	leftUl: null,
    rightList: [],
    rightUl: null,
    btnWrap: null,
	init: function(){
		this.listWrap = $("cafeMenuListWrap");
		this.leftUl = document.createElement("ul");
		this.leftUl.className = "box left";
		
		this.btnWrap = document.createElement("div");
		this.btnWrap.className = "btn_wrap";
		
		this.rightUl = document.createElement("ul");
		this.rightUl.className = "box";
		
		this.listWrap.innerHTML = "<div class='checkbox_wrap'><input type='checkbox' id='selectAllMenu' /><label for='selectAllMenu' tabindex='1'>전체게시판</label></div>";
		this.listWrap.appendChild(this.leftUl);
		this.listWrap.appendChild(this.btnWrap);
		this.listWrap.appendChild(this.rightUl);
		
		var tempArr = [];
		tempArr.push("<a href='#' class='menu_add'><span class='btn_bg bg05'></span><span class='btn_txt bt05 w04'>넣기<span>▶</span></span></a>");
		tempArr.push("<a href='#' class='menu_remove'><span class='btn_bg bg05'></span><span class='btn_txt bt05 w04'><span>◀</span>빼기</span></a>");
		this.btnWrap.innerHTML = tempArr.join(""); 
		
		this.getListData();
		this.registerEventListener();
	},
	getListData: function(){
		WICafeSearch.listSearchableFolders(CAFEAPP.GRPID, {
	        callback: function(data){
	        	ListSelector.makeList(data);
	        }
	    });
	},
	makeList: function(data){
		if(data){
			for(var i=0; i < data.length; i++){
				this.leftList.push(new CafeMenuInfo({title:data[i].fldname, fldid:data[i].fldid, type:"icon_"+data[i].fldtype}));
			}
			
			for(var i=0; i<this.leftList.length; i++){
				this.leftList[i].li = document.createElement("li");
				this.leftList[i].li.innerHTML = this.leftList[i].title;
				this.leftList[i].li.className = this.leftList[i].type;
				this.leftUl.appendChild(this.leftList[i].li);
			}
			
			for(var i=0; i<this.rightList.length; i++){
				this.rightList[i].li = document.createElement("li");
				this.rightList[i].li.innerHTML = this.leftList[i].title;
				this.rightUl.appendChild(this.rightList[i].li);
			}
			
			// 안좋은데... 의존성 걸림.
			DetailSearchManager.setInputsByFormElements(DetailSearchManager.form);
		}
	},
	registerEventListener: function(){
		daum.Event.addEvent(this.leftUl, "click", this.onclickListener.bind(this, this.leftList));
		daum.Event.addEvent(this.rightUl, "click", this.onclickListener.bind(this, this.rightList));
		
		daum.Event.addEvent(this.leftUl, "dblclick", this.addMenu.bind(this));
		daum.Event.addEvent(this.rightUl, "dblclick", this.removeMenu.bind(this));
		
		this.selectAll = $$(".checkbox_wrap > input", this.listWrap)[0];
		daum.Event.addEvent(this.selectAll, "click", this.checkAll.bind(this));
		
		var addBtn = $$(".menu_add", this.listWrap)[0];
		daum.Event.addEvent(addBtn, "click", this.addMenuList.bind(this));
		this.addBtnSpan = daum.$$("span", addBtn);
		
		var removeBtn = $$(".menu_remove", this.listWrap)[0];
		daum.Event.addEvent(removeBtn, "click", this.removeMenuList.bind(this));
		this.removeBtnSpan = daum.$$("span", removeBtn);
		
		if(daum.Browser.ie){
			this.changeSelectable(false, this.leftUl);
			this.changeSelectable(false, this.rightUl);
		}
	},
	checkAll: function(ev){
		var elem = daum.getElement(ev);
		if(elem.tagName.toLowerCase() == "input"){
			if(elem.checked){
				this.addAll();
			} else {
				this.removeAll();
			}
		}
	},
	addAll: function(){
		daum.$E(this.leftUl).addClassName("selected");
		daum.$E(this.rightUl).addClassName("selected");
		
		if(this.addBtnSpan && this.removeBtnSpan){
			if(this.addBtnSpan.length == this.removeBtnSpan.length){
				for(var i=0; i<this.addBtnSpan.length; i++){
					daum.$E(this.addBtnSpan[i]).addClassName("txt_sub");
					daum.$E(this.removeBtnSpan[i]).addClassName("txt_sub");
				}
			}
		}
		
		this.addMenuList();
	},
	removeAll: function(){
		daum.$E(this.leftUl).removeClassName("selected");
		daum.$E(this.rightUl).removeClassName("selected");
		
		if(this.addBtnSpan && this.removeBtnSpan){
			if(this.addBtnSpan.length == this.removeBtnSpan.length){
				for(var i=0; i<this.addBtnSpan.length; i++){
					daum.$E(this.addBtnSpan[i]).removeClassName("txt_sub");
					daum.$E(this.removeBtnSpan[i]).removeClassName("txt_sub");
				}
			}
		}
		
		this.removeMenuList();
	},
	addMenu: function(ev){
		daum.Event.stopEvent(ev);
    	var elem = daum.getElement(ev);
    	if(elem.tagName.toLowerCase() == "li" && elem.className.indexOf("added") < 0 && this.leftUl.className.indexOf("selected") < 0){
			var menuInfo = this.search(elem, this.leftList);
			if(menuInfo){
				elem.addClassName("added");
				elem.removeClassName("selected");
				elem.removeClassName("bg_sub");
				var item = new CafeMenuInfo({elem: elem, title: menuInfo.title, fldid: menuInfo.fldid, type: menuInfo.type});
				this.rightUl.appendChild(item.li);
				this.rightUl.scrollTop = this.rightUl.scrollHeight;
				this.rightList.push(item);								
				elem.addClassName("txt_sub");
			}
    	}
	},
	removeMenu: function(ev){
		daum.Event.stopEvent(ev);
		var elem = daum.getElement(ev);
    	if(elem.tagName.toLowerCase() == "li" && this.leftUl.className.indexOf("selected") < 0){
    		var menuInfo = this.search(elem, this.rightList);
    		if(menuInfo){
        		menuInfo.refer.removeClassName("added");
        		menuInfo.refer.removeClassName("txt_sub");
        		this.rightList.splice(menuInfo.index, 1);						
        		menuInfo.li.parentNode.removeChild(menuInfo.li);
    		}
    	}
	},
	onclickListener: function(list, ev){
		daum.Event.stopEvent(ev);
		var chkCtrl = (ev.metaKey)? ev.metaKey : ev.ctrlKey;
		var chkShift = ev.shiftKey;
		var elem = $E(daum.getElement(ev));
		
    	if(elem.tagName.toLowerCase() == "li" && this.leftUl.className.indexOf("selected") < 0 && this.rightUl.className.indexOf("selected") < 0){
           	if(chkCtrl && elem.className.indexOf("selected") < 0){
           		elem.addClassName("selected bg_sub");
           	}else if(!chkCtrl && !chkShift){
           		this.clearSelecteItems(list);
           		elem.addClassName("selected bg_sub");
           	}else if(chkShift){
           		var point = this.getStartEndPoint(elem, list);
                if(point.start && point.end){
                    var selected = false;
                    for(var i=0; i<list.length; i++){
                        if(list[i] == point.start || list[i] == point.end){
                        	selected = !selected;
                        }
                        if(selected || point.end == list[i]){
                            list[i].li.addClassName("selected bg_sub");
                        }
                    }
                }
           	} 
    	}else{
    		this.clearSelecteItems(list);
    	}
	},
	clearSelecteItems: function(list){
       	for(var i=0; i<list.length; i++){
           	$E(list[i].li).removeClassName("selected");
           	$E(list[i].li).removeClassName("bg_sub");
       	}
	},
	addMenuList: function(ev){
		if(ev){ 
			daum.Event.stopEvent(ev); 
			var elem = daum.getElement(ev);
			
			if(elem.tagName.toLowerCase() == "span" && elem.className.indexOf("txt_sub") > -1){
				return;
			}
		}
    	var items = [];
    	for(var i=0; i<this.leftList.length; i++){
    		if(!ev && this.selectAll.checked == true && this.leftList[i].li.className.indexOf("added") < 0){
    			items.push(this.leftList[i]);
    		}else if(this.leftList[i].li.className.indexOf("selected") > -1 && this.leftList[i].li.className.indexOf("added") < 0){
            	items.push(this.leftList[i]);
        	}
    	}
		if(items){
        	for(var i=0; i<items.length; i++){
            	daum.Element.addClassName(items[i].li, "added");
            	daum.Element.removeClassName(items[i].li, "selected");
            	var item = new CafeMenuInfo({ elem: items[i].li, title: items[i].title, fldid: items[i].fldid, type: items[i].type });
            	this.rightUl.appendChild(item.li);
				this.rightList.push(item);
				daum.Element.addClassName(items[i].li, "txt_sub");
        	}
		}
		this.rightUl.scrollTop = this.rightUl.scrollHeight;
		this.clearSelecteItems(this.leftList);
	},
	removeMenuList: function(ev){
		if(ev){ 
			daum.Event.stopEvent(ev); 
			var elem = daum.getElement(ev);
			
			if(elem.tagName.toLowerCase() == "span" && elem.className.indexOf("txt_sub") > -1){
				return;
			}
		}

		var items = [];
    	for(var i=0; i<this.rightList.length; i++){
       		this.rightList[i].index = i;
       		if(!ev && this.selectAll.checked == false){
       			items.push(this.rightList[i]);
       		} else if(this.rightList[i].li.className.indexOf("selected") > -1){
            	items.push(this.rightList[i]);
        	}
    	}
    	if(items){
    		for(var i=items.length-1; i>-1; i--){
    			items[i].refer.removeClassName("added");
    			items[i].refer.removeClassName("txt_sub");
        		this.rightList.splice(items[i].index, 1);
        		items[i].li.parentNode.removeChild(items[i].li);
    		}
    	}
	},
	search: function(elem, list){
    	for(var i=0; i<list.length; i++){
        	if(list[i].li == elem){
        		list[i].index = i;
				return list[i];
            }
    	}
	},
	getStartEndPoint: function(elem, list){
		var s = null;
       	var e = null;
        for(var i=0; i<list.length; i++){
            if(list[i].li.className.indexOf("selected") > -1 || list[i].li == elem){
            	if(!s){
                	s = list[i]; 
            	}else{
                	e = list[i];
            	}
            }		                            	                                
        }
        return {start:s, end:e};
	},
	changeSelectable: function(isSelect, elem){
		var elem = (elem) ? elem : document.body;
		if (daum.Browser.webkit) {
			elem.style.KhtmlUserSelect = isSelect ? '':'none';
		} else if (daum.Browser.gecko) {
			elem.style.MozUserSelect = isSelect ? '':'none';
		} else {
			if (isSelect) {
				daum.Event.removeEvent(elem, 'selectstart', this.blockContent);
				daum.Event.removeEvent(elem, 'dragstart', this.blockContent);
			} else {
				daum.Event.addEvent(elem, 'selectstart', this.blockContent);
				daum.Event.addEvent(elem, 'dragstart', this.blockContent);
			}
		}		
	},
	blockContent: function(ev) {
		daum.Event.stopEvent(ev);
	}
};

/* 상세검색에 사용하는 달력 */
Calendar = {
	inited: false,
	today: null,
	init: function(){
		this.calendarDiv = daum.$E('calendarDiv');
		this.calendarBackground = daum.$E('calendarBackground');
		this.btnCalPrev = daum.$E('btnCalPrev');
		this.btnCalNext = daum.$E('btnCalNext');
		this.curDate = daum.$E('curDate');
		this.calendarBody = daum.$E('calendarBody');
		
		daum.Event.addEvent(this.calendarBody, 'click', this.onClickDate.bind(this));
		daum.Event.addEvent(this.calendarBody, 'mouseover', this.onOverDate.bind(this));
		daum.Event.addEvent(this.calendarBody, 'mouseout', this.onOutDate.bind(this));
		daum.Event.addEvent(this.btnCalPrev, 'click', this.prevMonth.bind(this));
		daum.Event.addEvent(this.btnCalNext, 'click', this.nextMonth.bind(this));
		this.inited = true;
	},
	showCalendar: function(ev, calEl, inpEl, today){		
		daum.Event.stopEvent(ev);
		if (!ev) ev = window.event; 
		if(!this.inited) this.init();
		
		this.calEl = daum.$E(calEl);
		this.inpEl = daum.$E(inpEl);
		
		if(!this.today) this.today = this.strToDate(today);		
		
		this.selectedDate = this.strToDate(this.inpEl.value);
		this.setDate();		
		this.setPosition();
		
		var elem = daum.Event.getElement(ev);
		if(this.elem != elem){ 
			this.calendarDiv.show();
			this.calendarBackground.show();
		} else if(this.calendarDiv.visible()){
			this.calendarDiv.hide();
			this.calendarBackground.hide();
		} else {
			this.calendarDiv.show();
			this.calendarBackground.show();
		}
		this.elem = elem;
	},
	setDate: function() {
		this.sDate = new Date(this.selectedDate.getFullYear(), this.selectedDate.getMonth(), 1);
		this.eDate = new Date(this.selectedDate.getFullYear(), this.selectedDate.getMonth()+1, -1);
		this.sDay = this.sDate.getDay();
		this.tDay = this.sDate.getDay() + this.eDate.getDate();
		this.week = parseInt((this.tDay)/7);
		this.onRender();
	},
	onRender: function() {
		this.curDate.innerHTML = this.selectedDate.getFullYear() +"."+ (this.selectedDate.getMonth()+1);
		var cnt = 0, arrCalEl = [];

		for (j=0; j<=this.week ;j++ ){		
			for (i=0; i<7 ; i++){
				if (this.eDate.getDate() >= cnt){
					if ( i < this.sDay && j==0){
						var span = document.createElement('SPAN');						
						arrCalEl.push(span);
					}else{
						cnt++;
						var span = document.createElement('SPAN');
						if(i == 0) daum.$E(span).addClassName('holiday');	// 일요일 
						if(this.checkToday(cnt)) daum.$E(span).addClassName('today'); // 오늘 
						if(this.checkEnable(cnt)) { // 사용여부
							daum.$E(span).addClassName('enable');
						} else {
							if(i!=0 || !this.checkToday(cnt)) daum.$E(span).addClassName('disable txt_sub');
						}
						span.innerHTML = cnt;
						arrCalEl.push(span);
					}
				}
			}
		}
		Dom.removeNodes(this.calendarBody);
		for(var i=0; i< arrCalEl.length; i++) {
			this.calendarBody.appendChild(arrCalEl[i]);
		}
	},
	strToDate: function(str){
		return new Date(parseInt(str.substr(0,4)), (str.substr(5,2))-1, str.substr(8,2));
	},
	onClickDate: function(ev) {
		daum.Event.stopEvent(ev);
		var span = daum.Event.getElement(ev);
		if (span == undefined || span.tagName.toLowerCase() != "span") return;		
		if (daum.Element.hasClassName(span, 'enable')) {
			
			var day = (span.innerHTML.length<2) ? "0" +span.innerHTML : span.innerHTML;
			var month = (this.selectedDate.getMonth()+1).toString();
			if (month.length<2) month = "0"+ month;
 
			this.inpEl.value = this.selectedDate.getFullYear() +"."+  month +"."+ day;
			this.closeLayer();			
		}
	},
	onOverDate: function(ev) {
		var span = daum.Event.getElement(ev);		
		if (span == undefined || span.tagName.toLowerCase() != "span") return;
		if (daum.Element.hasClassName(span, 'enable') && !daum.Element.hasClassName(span, 'today')) {
			daum.Element.addClassName(span, 'bg_sub');
		}
	},
	onOutDate: function(ev) {
		var span = daum.Event.getElement(ev);
		if (span == undefined || span.tagName.toLowerCase() != "span") return;
		if (daum.Element.hasClassName(span, 'enable') && !daum.Element.hasClassName(span, 'today')) {
			daum.Element.removeClassName(span, 'bg_sub');
		}
	},
	prevMonth:function(ev){
		daum.Event.stopEvent(ev);
		var prevDate = new Date(this.selectedDate.getFullYear(),this.selectedDate.getMonth()-1,this.selectedDate.getDate());
		this.selectedDate = prevDate;
		this.setDate();
	},
	nextMonth:function(ev){
		daum.Event.stopEvent(ev);
		var nextDate = new Date(this.selectedDate.getFullYear(),this.selectedDate.getMonth()+1,this.selectedDate.getDate());
		this.selectedDate = nextDate;
		this.setDate();
	},
	closeLayer: function() { 
		this.calendarDiv.hide();
		this.calendarBackground.hide();
	},
	setPosition: function() {
		var p = daum.Element.getCoordsTarget(this.calEl, this.calEl.parentNode);
		this.calendarDiv.style.top = (p.top+19)+"px";
		this.calendarDiv.style.left = p.left+"px";
		this.calendarBackground.style.top = (p.top+19)+"px";
		this.calendarBackground.style.left = p.left+"px";
	},
	checkToday: function(cnt) {
		var selectedDate = Date.parse(new Date(this.selectedDate.getFullYear(), this.selectedDate.getMonth(), cnt));
		var today = Date.parse(this.today);
		return (selectedDate==today) ? true : false;
	},
	checkEnable: function(cnt) {
		var selectedDate = Date.parse(new Date(this.selectedDate.getFullYear(), this.selectedDate.getMonth(), cnt));
		return selectedDate <= this.today;
	}
};

Dom = {
	indexNum : 0,
	insertAfter: function(newEl, targetEl) {
		var parent = targetEl.parentNode;
		if (parent.lastChild == targetEl) {
			parent.appendChild(newEl);
		} else {
			parent.insertBefore(newEl, targetEl.nextSibling);
		}
	},
	removeNodes: function(el) {
		while(el.firstChild) {
			childNode = el.firstChild;
			el.removeChild(childNode);
		}
	},
	createIndex: function() {
		return "d2w"+ this.indexNum++;
	}
};

/* 상세검색 관리 */
DetailSearchManager = {
	layers: [],
	inited: false,
	showed: false,
	form: null,
	params: {
		item: "searchContentType",
		query: "searchKeyword",
		nickname: "writer",
		searchPeriod: "selectTerm"
	},
	init: function(){
		this.form = document.searchForm ? document.searchForm : document.innerSearchForm;
		this.detailWrap = $$(".detail_search_wrap", document.body)[0];
		if(daum.Browser.ie6){ this.detailWrap.style.position = "absolute"; }
		this.darkLayer = $$(".dark_layer", document.body)[0];
		
		document.body.appendChild(this.detailWrap);
		document.body.appendChild(this.darkLayer);
		
		this.darkLayer.style.width = parseInt(document.body.scrollWidth).px();
		this.darkLayer.style.height = parseInt(document.body.scrollHeight).px();		
		daum.Element.setOpacity(this.darkLayer, 0.5);
		
		this.footerBtn = $$(".footer_btn_wrap > a", this.detailWrap);
		this.resetBtn = $$(".footer_btn_wrap > .reset", this.detailWrap)[0];
		this.calendarDiv = daum.$("calendarDiv");
		this.calendarBackground = daum.$("calendarBackground");
		this.layers.push(this.calendarDiv);
		this.layers.push(this.calendarBackground);
		
		this.selectTerm = {select: daum.$("selectTerm"), div: daum.$("forDateArea")};
		this.selectContentType = {select: daum.$("docTypeSelect"), div: daum.$("fileTypeSelect")};
		
		ListSelector.init();
		
		this.initEvent();
	},
	initEvent: function(){
		daum.Event.addEvent(this.footerBtn[0], "click", this.onclickSearchListener.bind(this));
		daum.Event.addEvent(this.footerBtn[1], "click", this.toggleLayer.bind(this));
		daum.Event.addEvent(this.detailWrap, "click", this.onclickListener.bind(this));
		daum.Event.addEvent(this.selectTerm.select, "change", this.onchangeTermListener.bind(this));
		daum.Event.addEvent(this.selectContentType.select, "change", this.onchangeContentTypeListener.bind(this));
		daum.Event.addEvent(this.resetBtn, "click", this.resetComponentValue.bind(this));
		
		var topCloseBtn = $$(".detail_search_layer > h3 > a", this.detailWrap)[0];
		daum.Event.addEvent(topCloseBtn, "click", this.toggleLayer.bind(this));
		
		this.addWindowEvent();
	},
	addWindowEvent: function(){
		this.isMobile = (daum.Browser.ua.indexOf("mobile") > -1) ? true : false;
		
		if(this.isMobile || daum.Browser.ie6){
			daum.Event.addEvent(window, "scroll", this.onscrollLayerAction.bind(this));
		} else {
			daum.Event.addEvent(window, "resize", this.resizeDarkLayer.bind(this));
		}
	},
	toggleLayer: function(ev){
		if(ev){
			daum.Event.stopEvent(ev);
		}
		if(!CAFEAPP.DETAIL_SEARCH_INITED){
			this.init();
			CAFEAPP.DETAIL_SEARCH_INITED = true;
		}
		if(this.showed){
			this.showed = false;
			daum.Element.hide(this.detailWrap);
			daum.Element.hide(this.darkLayer);
			daum.Element.hide(this.calendarDiv);
			daum.Element.hide(this.calendarBackground);
			
			if(!daum.Browser.ie){
				ListSelector.changeSelectable(true);
			}
		} else {
			this.showed = true;
			daum.Element.show(this.detailWrap);
			daum.Element.show(this.darkLayer);
			this.centeringLayer();
			
			if(!daum.Browser.ie){
				ListSelector.changeSelectable(false);
			}
		}
		
	},
	onclickListener: function(ev){
		var elem = daum.Event.getElement(ev);	
		if(elem){
			for(var i=0; i<this.layers.length; i++){
				if(this.layers[i] != elem && this.layers[i] != elem.parentNode){
					daum.Element.hide(this.layers[i]);
				}
			}
		}
	},
	onclickSearchListener: function(ev){
		daum.Event.stopEvent(ev);
		var checked = this.isCheckedParams(this.form);
		
		if(checked){
			var fldids = this.form.fldid.value.split(",");
			if(fldids.length > 1 || fldids == ""){
				this.form.action = "/_c21_/cafesearch";
			}
			this.form.submit();
		}
	},
	isCheckedParams: function(form){
		//검색어
		var query = daum.String.trim(daum.$(this.params.query).value);
		//글쓴이
		var nickname = daum.String.trim(daum.$(this.params.nickname).value);

		if(query || nickname){ // 검색어가 있을 경우
			if(nickname && !query){
				form.item.value = "writer";
			} else {
				form.item.value = daum.$(this.params.item).value;
			}
			form.query.value = query;
			form.nickname.value = nickname;
		} else if(!query && !nickname){
			alert("검색어 또는 글쓴이를 입력해 주세요.");
			return false;
		}
		
		//게시판선택
		var bbsList = ListSelector.rightList;
		var fldid = "";
		if(bbsList && !(bbsList.length == ListSelector.leftList.length)){
			for(var i=0; i<bbsList.length; i++){
				if(i == 0){
					fldid += bbsList[i].fldid;
				} else {
					fldid += "," + bbsList[i].fldid;
				}
			}
		}
		form.fldid.value = fldid;
		
		//기간선택
		var searchPeriod = $(this.params.searchPeriod).value;
		if(searchPeriod == "manual"){
			searchPeriod = daum.$('sForDate').value + "-" + daum.$('eForDate').value;
		} else if(!searchPeriod){
			searchPeriod = "";
		}
		form.searchPeriod.value = searchPeriod;
		
		//문서유형
		var docType = daum.$("docTypeSelect").value;
		if(docType == "file") {
			var fileType = daum.$("fileTypeSelect").value;
			if(fileType == "i" || fileType == "m"){
				form.media_info.value = fileType;
				form.attachfile_yn.value = "";
			} else {
				form.attachfile_yn.value = fileType;
				form.media_info.value = "";
			}
		} else {
			form.attachfile_yn.value = "";
			form.media_info.value = "";
		}
		
		if(form.head) form.head.value = "";
		
		return true;
	},
	setInputsByFormElements: function(form){
		//검색어
		if(form.item.value == "subject" || form.item.value == "onlytitle" || form.item.value == "filename"){
			daum.$(this.params.item).value = form.item.value;
		} else {
			daum.$(this.params.item).value = "subject";
		}
		//쿼리, 글쓴이
		daum.$(this.params.nickname).value = form.nickname.value;
		daum.$(this.params.query).value = decodeURIComponent(form.query.value);
		
		//게시판선택
		var fldid = form.fldid.value.split(",");
		if(fldid.length > 0 || fldid == ""){
			var menuList = ListSelector.leftList;
			if(menuList.length == fldid.length || fldid == ""){
				ListSelector.selectAll.checked = true;
				ListSelector.addAll();
			} else {
				for(var i=0; i<menuList.length; i++){
					for(var j=0; j<fldid.length; j++){
						if(fldid[j] == menuList[i].fldid){
							daum.Element.addClassName(menuList[i].li, "selected");
						}
					}
				}
				ListSelector.addMenuList();
			}
		}
		
		//기간선택
		var searchPeriod = form.searchPeriod.value;
		if(searchPeriod == "aWeek" || searchPeriod == "aMonth") {
			daum.$(this.params.searchPeriod).value = searchPeriod;
		} else if(searchPeriod == "all" || searchPeriod == "") {
			daum.$(this.params.searchPeriod).value = "all";
		} else {
			var dates = searchPeriod.split("-");
			if(dates.length > 1){
				daum.$('sForDate').value = dates[0]; 
				daum.$('eForDate').value = dates[1];
				
				daum.$(this.params.searchPeriod).value = "manual";
			}
		}
		this.onchangeTermListener();
		
		//문서유형
		var docType = (form.media_info.value) ? form.media_info.value : form.attachfile_yn.value;
		if(docType == "all" || docType == ""){
			daum.$("docTypeSelect").value = "all";
		} else {
			daum.$("docTypeSelect").value = "file";
			daum.$("fileTypeSelect").value = docType;
		}
		this.onchangeContentTypeListener();
	},
	onchangeTermListener: function(){
		if(this.selectTerm.select.value == "manual"){
			daum.Element.show(this.selectTerm.div);
		} else if(daum.Element.visible(this.selectTerm.div)){
			daum.Element.hide(this.selectTerm.div);
		}
	},
	onchangeContentTypeListener: function(){
		if(this.selectContentType.select.value == "file"){
			daum.Element.show(this.selectContentType.div);
		} else if(daum.Element.visible(this.selectContentType.div)){
			daum.Element.hide(this.selectContentType.div);
		}
	},
	onscrollLayerAction: function(ev){
		if(this.showed){
			var elOffset = daum.Element.getCoords(this.detailWrap, true);
	    	var bOffset = daum.Browser.getWindowSize();
	    	
	    	var width = elOffset.right - elOffset.left;
	    	var height = elOffset.bottom - elOffset.top;
	    	
	    	if(bOffset.width > width && bOffset.height > height){
	    		var top = (window.scrollY)? window.scrollY : document.documentElement.scrollTop;
	    		this.detailWrap.style.top = (top + this.detailWrapScrollY).px();
	    	}
		}
	},
	resetComponentValue: function(ev){
		daum.Event.stopEvent(ev);
		//검색어
		daum.$("searchContentType").value = "subject";
		daum.$("searchKeyword").value = "";
		//글쓴이
		daum.$("writer").value = "";
		//게시판 선택
		ListSelector.selectAll.checked = false;
		ListSelector.removeAll();
		//기간선택
		daum.$("selectTerm").value = "all";
		if(Calendar.today){
			daum.$("sForDate").value = this.getDate(Calendar.today);
			daum.$("eForDate").value = this.getDate(Calendar.today);
		}
		this.onchangeTermListener();
		//문서유형
		daum.$("docTypeSelect").value = "all";
		this.onchangeContentTypeListener();
	},
	getDate: function(day){
		return day.getFullYear()+"."+(day.getMonth()+1)+"."+day.getDate();
	},
	resizeDarkLayer: function(){
		if(this.showed && this.darkLayer.style.width != document.body.scrollWidth || this.darkLayer.style.height != document.body.scrollHeight){
			this.darkLayer.style.width = parseInt(document.body.scrollWidth).px();
			this.darkLayer.style.height = parseInt(document.body.scrollHeight).px();
			this.centeringLayer();
		}
	},
	centeringLayer: function(){
		var elOffset = daum.Element.getCoords(this.detailWrap, true);
    	var bOffset = daum.Browser.getWindowSize();
    	
    	var width = elOffset.right - elOffset.left;
    	var height = elOffset.bottom - elOffset.top;
    	
    	if(bOffset.width > width){
	    	this.detailWrapScrollX = (bOffset.width-width)*0.5;
	    	this.detailWrapScrollY = (bOffset.height-height)*0.5;
	    	
	    	if(daum.Browser.ie6){
		    	var top = document.documentElement.scrollTop || document.body.scrollTop;
		    	var left = document.documentElement.scrollLeft || document.body.scrollLeft;
		    	this.detailWrapScrollY += top;
		    	this.detailWrapScrollX += left;
	    	}
		    
	    	this.detailWrap.style.left = parseInt(this.detailWrapScrollX).px();
	    	this.detailWrap.style.top = parseInt(this.detailWrapScrollY).px();
    	}
	}
};

/* 날짜 검색 */
var SelectMaker = function(target, className, date1, date2){
	this.targetSelect = $(target);
	this.data = [];
	this.date1 = date1;
	this.date2 = date2;
	this.className = className;
	this.id = this.getIdentification();
	this.closeEventHandler = this.closeEvent.bind(this);
	this.init();
};

SelectMaker.prototype = {
	init : function(){
		var head,body;

		this.targetSelect.onmousedown = function(e){
			var e = e || window.event;
			var target = e.target || e.srcElement;
			$('s_b_'+this.id).style.left = $E(this.targetSelect).getCoords(true,$('wrap')).left + 'px';
			SelectMaker.toggle('s_b_'+this.id);
			if(!daum.ff){
				target.disabled = 'disabled';
				setTimeout(function(){
					target.disabled = '';
				},400);
				daum.stopEvent(e);
			}
		}.bind(this);
		
		this.targetSelect.onfocus = function(e){
			var e = e || window.event;
			var target = e.target || e.srcElement;
			daum.stopEvent(e);
			target.blur();
		}
		
		this.getDataFromSelect();
		body = daum.createElement(this.createBodyElm());

		var next;
		if(next = $E(this.targetSelect).getNext()){			
			this.targetSelect.parentNode.insertBefore(body, next);
		}else{
			this.targetSelect.parentNode.appendChild(body);
		}

		SelectMaker.hash[this.id] = this;
		daum.addEvent(document, 'mouseup', this.closeEventHandler, false);
	},
	closeEvent : function(e){
		var e = e || window.event;
		var target = e.target || e.srcElement;
		
		if(target == this.targetSelect) return;
		do{
			if(target.id == 's_b_'+this.id) return;
		}while((target = target.parentNode) && target.tagName != 'BODY');
		
		$E($('s_b_'+this.id)).hide();
		
	},
	getDataFromSelect : function(){
		var i,loop,opts = $A(this.targetSelect.options);
		for(i=0, loop=opts.length; i<loop; i++){
			this.data.push({value : opts[i].value, text : opts[i].text});
		};
	},

	createHeaderElm : function(){
		return '<a id="s_t_'+this.id+'" class="'+ this.className+'_header img_selectbox" href="#" onclick="SelectMaker.toggle(\'s_b_'+this.id+'\');">' + (this.data[0].text || '') + '</a>';
	},
	createBodyElm : function(){
		var tmp = [];
		tmp.push('<div class="'+ this.className+'_body box bg" style="display:none;" id="s_b_' + this.id + '">');
		tmp.push('<ul>');
		for(var i=0,loop=this.data.length;i<loop;i++){
			tmp.push('<li>');
			if(this.data[i].value.indexOf('#DURATION') > -1){
				tmp.push(this.createDurationElm(i));
			}else{
				tmp.push('<a href="javascript:;" onclick="SelectMaker.clickEvent('+this.id+',\''+this.data[i].value+'\',\''+this.data[i].text+'\')">'+this.data[i].text+'</a>');
			}
			tmp.push('</li>');
		}
		tmp.push('</ul>');
		//tmp.push('<iframe marginheight="0" marginwidth="0" frameborder="0" scrolling="no"></iframe>')
		tmp.push('</div>');

		return tmp.join('');
	},

	createDurationElm : function(i){
		var tmp = [];
		var today = new Date();
		var year = today.getFullYear();
		var month = today.getMonth() + 1;
		month = month>9?month:'0'+month;
		var day = today.getDate();
		day = day>9?day:'0'+day;

		today = year +'.'+ month +'.'+ day;

		tmp.push('직접 입력<br /><p><input type="text" id="s_t_1_'+this.id+'" value="'+this.date1+'" class="inp" />-');
		tmp.push('<input type="text" id="s_t_2_'+this.id+'"  value="'+this.date2+'" class="inp" /></p>');
		tmp.push('<p class="button_set" onclick="SelectMaker.clickEvent('
			+ '\'' + this.id + '\''
			+ ', $(\'s_t_1_'
			+ this.id
			+ '\').value + \'\' +'
			+ ' $(\'s_t_2_'
			+ this.id
			+ '\').value'
			+ ', null, \''
			+ this.data[i].value
			+ '\')">');
		tmp.push('<span class="btn_bg bg08"></span><span class="btn_txt bt08 w03">확인</span></p>');

		return  tmp.join('');
	},
	getInputs : function(){
		return $A($('s_b_' + this.id).getElementsByTagName('INPUT'));
	},
	clickEvent : function(value, text, type){
		var num = type ? this.getIndexForValue(type) : this.getIndexForValue(value);
		if(type == '#DURATION'){
			var tmp = value.match(/([1-2][0-9]{3})\.(0[0-9]|1[0-2])\.([0-2][0-9]|3[0-1])([1-2][0-9]{3})\.(0[0-9]|1[0-2])\.([0-2][0-9]|3[0-1])/);
			if(tmp){
				if(new Date(tmp[1], tmp[2], tmp[3]).getTime() > new Date(tmp[4], tmp[5], tmp[6]).getTime()){
					alert("시작 날짜가 잘못되었습니다.")
					return;
				}else{
					SearchUtil.setDuration(tmp[1] + '.' + tmp[2] + '.' + tmp[3] + '-' + tmp[4] + '.' + tmp[5] + '.' + tmp[6])
				}				
			}else{
				alert('입력양식이 잘못되었습니다.');
				return;
			}			

			this.targetSelect.value = '#DURATION';

		}else{
			this.targetSelect.options[num].value = value;
			this.targetSelect.value = value;
		}
		$E($('s_b_'+this.id)).toggle();
	},

	getIdentification : function(){
		return new Date().getTime() * Math.floor(Math.random() * 100);
	},

	getIndexForValue : function(v){
		for(var i=0, loop=this.data.length; i<loop; i++){
			if(this.data[i].value == v) return i;
		}
	}
};

SelectMaker.hash = {};
SelectMaker.clickEvent = function(id, value , text,  type){
	SelectMaker.hash[id].clickEvent(value, text, type);
};
SelectMaker.toggle = function(id){
	//alert($(id));
	if($(id).style.display == 'none'){
		$(id).style.display = 'block';
	}else{
		$(id).style.display = 'none';
	}
};

/* 말머리 검색 */
function checkHeadCont(elem) {
	if(elem.tagName.toLowerCase() == "select"){
		var headContSelect = daum.Element.getNext(elem);
		var wrap = headContSelect.parentNode;
		if(headContSelect.tagName.toLowerCase() == "select" && elem.value == "head"){
			headContSelect.style.display = "";
		} else {
			headContSelect.style.display = "none";
		}
	}
}

SearchUtil = {
	form: null,
	inited: false,
	init: function(){
		this.form = daum.$("searchForm");
		this.inited = true;
	},
	searchType: function(value){ // 리스트 필터: 전체, 이미지, 동영상, 첨부파일
		if(!this.inited){ this.init(); }
		if(this.form){
			if(value == "A,B" || value == "A"){ // 첨부파일 있는 경우 or 문서만 있는 경우
				this.form.attachfile_yn.value = value;
				this.form.media_info.value = "";
			} else if(value == "i" || value == "m"){ // i: 이미지가 있는 경우, m: 동영상이 있는 경우
				this.form.media_info.value = value;
				this.form.attachfile_yn.value = "";
			} else if(value == "all") { // 모든 종류 검색
				this.form.media_info.value = "";
				this.form.attachfile_yn.value = "";
			}
			this.form.submit();
		}
	},
	
	setDuration : function(dur){
		if(!this.inited){ this.init(); }
		this.form['searchPeriod'].value = dur;
	},
	
	setViewtype : function() {
		if(!this.inited){ this.init(); }
		if(daum.$("viewTypeTit") && daum.$("viewTypeTit").checked){ // 게시판 리스트 형태
			this.form.viewtype.value = "tit"; // 목록형
		} else {
			this.form.viewtype.value = "all"; // 요약형
		}
	},
	
	searchBBS: function(elem){ // 게시판 검색
		if(!this.inited){ this.init(); }
		var searchWrap = (elem.className == "btn_search" || elem.className == "suggest") ? elem.parentNode : null; 
		if(this.form && searchWrap){
			var selects = $$("select", searchWrap);
			var query = $$(".query", searchWrap)[0];
			var isMemberArticleSearchPage = (this.form.action.indexOf("member_article") > -1); // 내가 쓴 글, 남이 쓴 글 페이지인지 아닌지...
			
			if(query){ 
				this.form.query.value = query.value; 
			};
	
			for(var i=0; i<selects.length; i++){
				if(selects[i].name == "searchPeriod" && selects[i].value != '#DURATION'){ //기간
					this.form.searchPeriod.value = selects[i].value;
				} else if(selects[i].name == "item"){
					if(isMemberArticleSearchPage && this.form.query.value == ""){
						this.form.item.value = "writer";
					} else {
						this.form.item.value = selects[i].value;
					};
				} else if(selects[i].name == "head" && daum.Element.visible(selects[i])){
					this.encodingQuery(this.form.head, selects[i].value);
					if (this.form.headsort) {
						this.form.headsort.value = "";
					};
				} else if(this.form.head && !daum.Element.visible(selects[i])){
					this.form.head.value = "";
				};
			};
			
			if (this.form.item.value == "writer") { // 닉네임 검색일 경우에는 nickname 파라메터에.
				this.form.nickname.value = query.value;
				this.form.query.value = "";
			} else if(!isMemberArticleSearchPage) {
				this.form.nickname.value = "";
			};
			
			this.encodingQuery(this.form.query, this.form.query.value);
			
			this.setViewtype();
			this.formCheck();	
		}
	},
	formCheck : function(){
		if(this.form.item.value == "head"){
			if(this.form.head.value == "head_selected"){				
				alert('말머리를 선택해 주세요');
				this.form.head.style.display = "block";
				return false;
			}else{
				this.form.submit();
			}
		}else{
			if(this.form.query.value != "" || (this.form.item.value == "writer" && this.form.nickname.value != "") || this.form.enc_userid){
				this.form.submit();
			}else{
				alert('검색어를 입력해 주세요');
				return false;
			}
		}			
	},
	
	searchRelevantKeyword: function(keyword){
		if(!this.inited){ this.init(); }
		
		if(keyword){
			this.form.nickname.value = "";
			this.form.pagenum.value = "1";
			this.form.searchPeriod.value = "all";
			this.form.attachfile_yn.value = "";
			this.form.media_info.value = "";
			
			this.form.item.value = "subject";
			this.form.query.value = keyword;
			this.form.submit();
		}
	},
	
	headcontSearch: function(elem){
		if(!this.inited){ this.init(); }
		
		var headcont = "";
		if(elem.tagName && elem.tagName.toLowerCase() == "select"){
			headcont = elem.value;
		} else {
			headcont = elem;
		}
		
		this.encodingQuery(this.form.head, headcont);
		this.form.pagenum.value = "1";
		this.form.query.value = ""; // 검색했다가 다시 뒤로온경우 쿼리가 남는 경우가 있다.
		
		if(headcont == ""){
			var url = this.getListURL(document.location.pathname);
			this.form.item.value = "";
			this.form.action = url;
		} else {
			this.form.item.value = "head";
		}
		
		if(this.form.headsort) this.form.headsort.value = "Y";
		this.form.submit();
	},
	
	getListURL: function(pathname){
		var url = "";
		if(pathname.indexOf("album_") > -1){
			url = "/_c21_/album_list";
		} else if(pathname.indexOf("bbs_") > -1){
			url = "/_c21_/bbs_list";
		}
		
		return url;
	},
		
	checkKeyEvent: function(e){
		var ev = e || window.event;
		if(ev.keyCode == 13){
			var elem = daum.Event.getElement(ev);
			if(elem){
				this.searchBBS(elem.parentNode);
			}	
		}
	},
	
	encodingQuery: function(queryInput, query) {
		// URIEncoding이 MS949로 변경되면서 필요없어짐
		//queryInput.value = encodeURIComponent(query);
		queryInput.value = query;//encodeURIComponent(query);
	}
}


Suggest = {
	init: function(){
		this.queryInputs = $$(".query", document.body);
		daum.suggest.Service.init();
		for(var i=0; i<this.queryInputs.length; i++){
			this.queryInputs[i].setAttribute("autocomplete","off");
			var wrapper = this.queryInputs[i].parentNode;
			var btn = $$("button", wrapper)[0];
			daum.suggest.Service.add(this.queryInputs[i], wrapper, "http://sug.search.daum.net", "/search_nsuggest", "/suggestProxy.html").
			setYellowClip(btn).
			setLimit([5,2]);
		}
	}
};


/* 검색 리스트 이미지 에러처리 */
var errorImage = function(thisimage){
	thisimage.src = "http://i1.daumcdn.net/cafeimg/cf_img2/img_blank2.gif";
	thisimage.width = 0;
	thisimage.height = 0;
}

/* 검색 리스트 이미지 리사이즈 */
var resizeImage = function(img){
	var landscope = img.width < img.height ? true : false;
	var wrap = img.parentNode; 
	
	if(img.offsetWidth > 100 || img.offsetHeight > 100){
		if(landscope){
			img.height = "100";
		}else{
			img.width = "100";
		}
	}
	
	if(img.width == 0 || img.height == 0) setTimeout(function(){resizeImage(img)},500);
}

var resizeImage_reload = function(){
	$C(document, 'thumImages').each(function(el){
	    resizeImage(el);
	});
}


function playTvpot(elem, url) {
	var tvpotWrap = elem.parentNode;
	if (tvpotWrap.blocked) {
		alert("삭제된 동영상입니다.");
		return;
	}
	var playIcon = null;
	var playIcon = daum.Element.getElementsByClassName(elem, "play-icon")[0];
	playIcon.className = "loading-indicator";
	
	var video = null;
	var isIpadCheck = daum.Browser.ua.indexOf("ipad") > -1 ? true : false;
	if (tvpotWrap.getElementsByTagName("video").length > 0) {
		video = tvpotWrap.getElementsByTagName("video")[0];
	} else {
		video = daum.createElement('video', {controls: true});
		video.src = url;
		video.type = "video/mp4";
	};
	
	video.style.display = "block";
	video.addEventListener('pause', function () {
		video.style.opacity = "0";
		playIcon.className = "play-icon";
		if (isIpadCheck) {
			setTimeout(function() {
				tvpotWrap.className = "";
				video.style.display = "none";
			}, 500);
		};
	});
	
	video.addEventListener('play', function () {
		video.style.opacity = "1";
		if (isIpadCheck) {
			tvpotWrap.className = "ipad";
			video.className = "ipad";
		};
	});
	video.addEventListener('error', function () {
		alert("삭제된 동영상입니다.");
		tvpotWrap.blocked = true;
		video.style.opacity = "0";
		playIcon.style.display = "none";
		if (isIpadCheck) {
			setTimeout(function() {
				tvpotWrap.className = "";
				video.style.display = "none";
			}, 500);
		}
	});
	video.play();
	tvpotWrap.insertBefore(video, elem);
};


//관련 검색어
RelevantSearch = {
	init: function(fldid, dataid, keywords){
		this.relevantUl = daum.$("relevantResultList");
		this.relevantTableWrap = daum.$("resultTableWrap");
		this.keywordArr = keywords;
		this.fldid = fldid;
		this.dataid = dataid;
		
		var keywordList = [];
		for(var i=0; i<this.keywordArr.length; i++){
			var keyword = this.keywordArr[i];
			if(i == 0){
				this.selectedIndex = i;
				keywordList.push("<li class='box_point'><a href='#' class='txt_point'>"+keyword.shortKeyword+"<span class='arrow'>▶</span></a></li>");
			} else {
				keywordList.push("<li><a href='#'>"+keyword.shortKeyword+"</a></li>");
			}
		}
		this.relevantUl.innerHTML = keywordList.join("");
		this.getRelevantSearchData(this.keywordArr[this.selectedIndex].keyword);		
	},
	getRelevantSearchData: function(keyword){
		WICafeSearch.getRelevantArticleList(CAFEAPP.GRPID, this.fldid, this.dataid, keyword, {
	        callback: function(data){
	        	RelevantSearch.makeTable(data, keyword);
	        }
	    });
	},
	makeTable: function(data, keyword){
		var relevantTable = [];
		relevantTable.push("<table id='relevantResultTable'><thead>");
		relevantTable.push("<tr><th class='title line'>제목</th><th class='author line'>글쓴이</th><th class='line'>작성일</th><th class='view line'>조회</th></tr></thead><tbody>");
		var bbsLink = "/_c21_/cafe_nsread?grpid="+CAFEAPP.GRPID+"&dataidlist="+CAFEAPP.ui.DATAIDLIST+"&fldidlist="+CAFEAPP.ui.FLDIDLIST+"&query="+keyword+"&search_ctx="+data.searchCtx+"&item=&jobcode=&totcnt=&listnum=";
		if(data.articleList && data.articleList.length > 0){
			var first = "class='first'";
			for(var i=0; i<data.articleList.length; i++){
				if(i == 0){
					relevantTable.push("<tr class='first'>");
				} else {
					relevantTable.push("<tr>");
				}
				relevantTable.push("<td class='title'>");
				
				if(data.articleList[i].curArticle){
					relevantTable.push("<span class='txt_point'>현재글</span>");
				}
				relevantTable.push("<a href='"+bbsLink+"&fldid="+data.articleList[i].fldid+"&contentval="+data.articleList[i].bbsdepth+"&datanum="+data.articleList[i].dataid+"&page=1&cpage=0&sorttype=0&from=total'>"+data.articleList[i].dataname+"</a>");
				
				if(data.articleList[i].shrtcmtcnt == 0){
					relevantTable.push("</td>");
				} else {
					relevantTable.push("<span class='txt_point'>["+data.articleList[i].shrtcmtcnt+"]</span></td>");
				}
				
				relevantTable.push("<td nowrap='nowrap' class='author'>");
				if(data.articleList[i].anonymouse){
					relevantTable.push("비공개");
				} else {
					var rolecodeImg = (data.articleList[i].rolecode && data.articleList[i].rolecode != "1Z")? "<img src='http://i1.daumcdn.net/cafeimg/cf_img2/bbs2/"+CAFEAPP.ui.ROLEICONTYPE+"_level_"+data.articleList[i].rolecode+".gif' width='14' height='14' alt='회원등급' />" : "";
					relevantTable.push(rolecodeImg + "<a href='#"+data.articleList[i].encUserid+"'>"+data.articleList[i].nickname+"</a>");
				}
				relevantTable.push("</td>");
				relevantTable.push("<td class='date'>"+data.articleList[i].regdtshow+"</td>");
				relevantTable.push("<td class='view'>"+data.articleList[i].viewcount+"</td></tr>");
			}
			if(data.more){
				relevantTable.push("<tr><td class='more' colspan='4'><a href='/_c21_/cafesearch?query="+keyword+"&x=0&y=0&searchtype=0&grpid="+CAFEAPP.GRPID+"&item=subject' target='_blank'>검색결과 더보기</a><span class='arrow'>▶</span></td></tr>");
			}
		} else {
			relevantTable.push("<tr class='empty_data'><td colspan='4'>검색결과가 없습니다.<p class='txt_sub'>"+keyword+"(으)로 검색한 다른 카페글 <a href='http://search.daum.net/search?w=cafe&enc=utf8&ASearchType=1&m=board&q="+encodeURIComponent(keyword)+"' target='_blank'>보기</a><span class='arrow'>▶</span></p></td></tr>");
		}
		relevantTable.push("</tbody></table>");
		this.relevantTableWrap.innerHTML = relevantTable.join("");
		this.initEvent();
	},
	initEvent: function(){
		daum.addEvent(this.relevantUl, "click", this.onclickLiAction.bind(this));
		daum.addEvent(this.relevantTableWrap, "click", this.onclickAuthorAction.bind(this));
	},
	onclickLiAction: function(ev){
		var elem = daum.getElement(ev);
		daum.stopEvent(ev);
		
		if(elem.tagName.toLowerCase() == "a" && elem.parentNode.className.indexOf("box_point") < 0){
			var li = $$("li", this.relevantUl);
			for(var i=0; i<li.length; i++){
				if(elem.parentNode == li[i]){
					elem.parentNode.className = "box_point";
					elem.className = "txt_point";
					elem.innerHTML += "<span class='arrow'>▶</span>";
					break;
				}
			}
			var lastLi = li[this.selectedIndex];
			daum.$E(lastLi).removeClassName("box_point");
			lastLi.innerHTML = "<a href='#'>"+this.keywordArr[this.selectedIndex].shortKeyword+"</a>";
			this.selectedIndex = i;
			var keyword = this.keywordArr[this.selectedIndex].keyword;
			
			if(keyword){
				this.getRelevantSearchData(keyword);
			}
		}
	},
	onclickAuthorAction: function(ev){
		var elem = daum.getElement(ev);
		if(elem.tagName.toLowerCase() == "a" && elem.parentNode.className == "author"){
			daum.Event.stopEvent(ev);
			var eUserId = elem.hash.substr(1);
			var nickname = elem.firstChild.nodeValue;
			showSideView(elem, eUserId, '', nickname);
		}
	}
};

/* 터치 인터페이스 대응 */
TouchUI = {
	scrollBoxSetup: function() {
		if (typeof daum === 'undefined' || !daum.Browser.ipad) return false;
		var TARGET_CLASS = "touch-scroll",
			targetList = daum.$$('.' + TARGET_CLASS);
		if (targetList.length <= 0) return false;	
		targetList.each(function(el) {
			new TouchUI.TouchScrollBox(el);
		});
		var $style = daum.createElement('<style type="text/css"></style>'),
			barStyle = ".touch-scroll div.touch-scroll-bar {position:absolute; top:0; right:3px; width:5px; margin:5px 0; overflow:hidden; background:#666; opacity:0.5; min-width:5px; min-height:10px; z-index:11; -webkit-border-radius:2px 3px;}";
		$style.appendChild(document.createTextNode(barStyle));
		daum.$$('head')[0].appendChild($style);
	}
}

/* 터치 인터페이스에서 스크롤 가능한 박스 */
TouchUI.TouchScrollBox = function(elemId) {
	this.setup(elemId);
}

TouchUI.TouchScrollBox.prototype = {
	flag: {
		mousedown: false
	},
	setup: function(elemId) {
		this.$outerBox = daum.$(elemId);
		this.$innerBox = daum.Element.getFirstChild(this.$outerBox);
		this.$innerBox.top = 0;
		daum.Element.setStyle(this.$innerBox, 'position:absolute; top:0;');
		
		if (daum.Browser.webkit) {
			daum.Event.addEvent(this.$outerBox, 'touchstart', this.touchStartHandler.bind(this));
			daum.Event.addEvent(this.$outerBox, 'touchmove', this.touchMoveHandler.bind(this));
			daum.Event.addEvent(this.$outerBox, 'touchend', this.touchEndHandler.bind(this));
		}
		this.calculateBoxHeight(this.addScrollbar.bind(this));
	},
	addScrollbar: function() {
		var scrollRatio = this.$outerBox.height / this.$innerBox.height,
			height = this.$outerBox.height * scrollRatio;
		if (this.$bar || scrollRatio >= 1.0) return;
		this.$bar = daum.createElement('<div class="touch-scroll-bar" style="height:' + Math.max(height - 15, 15) + 'px;"></div>');
		this.$outerBox.appendChild(this.$bar);
	},
	touchStartHandler: function(ev) {
		daum.Event.stopEvent(ev);
		this.startY = this.getY(ev);
		this.startX = this.getX(ev);
		this.distY = this.distX = 0;
		this.flag.mousedown = true;
		this.$innerBox.top = parseInt(this.$innerBox.style.top);
	},
	touchMoveHandler: function(ev) {
		if (this.flag.mousedown) {
			daum.Event.preventDefault(ev);
		} else {
			return;
		}
		
		this.distX = this.getX(ev) - this.startX;
		this.distY = this.getY(ev) - this.startY;
		this.moveBox(this.$innerBox.top + this.distY);
	},
	touchEndHandler: function(ev) {
		this.flag.mousedown = false;
		if (Math.abs(this.distX) <= 5 && Math.abs(this.distY) <= 5) {
			var target = daum.Event.getElement(ev);
			var clickEvt = document.createEvent('MouseEvents');
			clickEvt.initMouseEvent('click', true, true, ev.view, 1, 
				ev.screenX, ev.screenY, ev.clientX, ev.clientY, ev.ctrlKey, ev.altKey, ev.shiftKey, ev.metaKey, 0, null);
			target.dispatchEvent(clickEvt);
		}
	},
	moveBox: function(top) {
		top = this.boundNumber(top, -1 * (this.$innerBox.height - this.$outerBox.height), 0);
		daum.Element.setStyle(this.$innerBox, { top: daum.String.px(top) } );
		scrollRatio = this.$outerBox.height / this.$innerBox.height;
		if (this.$bar) {
			daum.Element.setStyle(this.$bar, { top: daum.String.px(top * scrollRatio * -1) } );
		}
	},
	getX: function(ev) {
		return ev.changedTouches ? ev.changedTouches[0].pageX : ev.pageX;
	},
	getY: function(ev) {
		return ev.changedTouches ? ev.changedTouches[0].pageY : ev.pageY;
	},
	boundNumber: function(val, min, max) {
		return Math.max( Math.min(val, max), min );
	},
	calculateBoxHeight: function(callback) {
		var tmpDisplay = this.$outerBox.style.display,
			tmpLeft = this.$outerBox.style.left;
		daum.Element.setStyle(this.$outerBox, {
			display: 'block',
			left: '-9999em'
		});
		setTimeout(function() {
			this.$outerBox.height = this.$outerBox.offsetHeight;
			this.$innerBox.height = this.$innerBox.offsetHeight;
			daum.Element.setStyle(this.$outerBox, {
				display: tmpDisplay,
				left: tmpLeft
			});
			callback();
		}.bind(this), 1);
	}
};

function selectFavCafeForGame(gameId) {
	window.open('http://cafe.daum.net/_c21_/game_mycafe_popup?gameid=' + gameId, 'cafeSNG', 'width=440, height=280, resizable=1');
}

// 지표 호출 함출 - ajax 로 사용할 경우
function cafeAjaxPV(timerDelay, params) {
	timerDelay = timerDelay || 1;
	if(window.pvTimer){
		clearTimeout(window.pvTimer);
	}
	
	window.pvTimer = setTimeout(function(){
		// 코클
		var service = "cafe";
		var ref = encodeURIComponent(document.referrer);
		var loc = encodeURIComponent(document.location);
		var tit = encodeURIComponent(document.title);
		var domain = window.location.host;
		
		if(typeof ifr_korClick !== 'undefined'){
			ifr_korClick.location.href='http://'+ domain +'/cafeservice_pv.html?service='+service+'&ref='+ref+'&loc='+loc+'&tit='+tit+'&v='+new Date().getTime();
		}
		
		// 티아라
		__pageTracker = __Tiara.__getTracker();
		try {
			if (typeof __pageTracker !== 'undefined') {
				__pageTracker.__setTitle("Daum 카페 - " + CAFEAPP.GRPNAME);
				__pageTracker.__setReferer(window.location.href);
				
				if(params) {
					for(var item in params) {
						__pageTracker.__addParam(item, params[item]);	
					}
				}
				
				window.setTimeout('try { __pageTracker.__trackPageview(window.location.href); } catch(e) {}', 1);
			}
		} catch(e) { }
	}, timerDelay);
}

/**
 * cafemenu.html -> menu_folderlist.html 에서 가져온 함수들
 * 같은 역할을 하는 함수들로 교체해야함.
*/

function goBBS(url){
	location.href = url;
}

function toggleFoldingGroupMenu(elIdx){
	var elMenuGroup = daum.$("title_" + elIdx);
	if(elMenuGroup){
		daum.Element.toggle(elMenuGroup);
		
		var elMenuGroupHandler = daum.$("div_menu_title_" + elIdx);
		var elSpan = daum.$$(".group_ic a span", elMenuGroupHandler)[0];
		var elImg = daum.$$(".group_ic a img", elMenuGroupHandler)[0];
		
		if(daum.Element.visible(elMenuGroup)){
			elSpan.innerHTML = "▲";
			elImg.className = "icon_view02";
		} else {
			elSpan.innerHTML = "▼";
			elImg.className = "icon_view01";
		}
	}
}