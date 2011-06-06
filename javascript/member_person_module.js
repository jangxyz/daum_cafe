document.domain='daum.net';

function escapeSingleQuote(str) {		
	str = str.replace(/\\/g,"\\\\");
	str = str.replace(/\'/g,"\\\'");	
	return str;
}

function SidwViewRow(idx, name, text, onclickEvent, isAdmin) {
	this.idx = idx;
	this.name = name;
	this.text = text;
	this.isAdmin = isAdmin;
	this.onclickEvent = onclickEvent;
	this.renderRow = renderRow;
	
	this.isVisible = true;
	this.isDim = false;
}

function renderRow() {
	if (!this.isVisible) {
		return "";
	}
	var target = "";
	if (this.isAdmin=="admin") target = "target=\"_blank\"";
	var str = "<li id='sideViewRow_"+this.name+"'>";
	if (this.isDim) {
		str += "<a href=\"#\" class=\"dim\">";
	} else {
		str += "<a href=\"#\" onclick=\"hideSideView(); clickAreaCheck=true;"+this.onclickEvent+"; return false;\">";
	}

	str += this.text;
	if (!this.isDim) str+= "</a>";
	str+= "</li>";
	
	if (this.name=="article") str+= "<li class='layer_dotline'></li>";
	return str;
}

function RoleCheck(){
	alert("해당 서비스는 정회원 이상만 사용 가능합니다.");
}

function SideView(targetObj, curObj, encset, planetUserid, myNick, targetNick, grpname, node, rolecode, isAdmin, isGuest, isMine) {
	this.grpid = CAFEAPP.GRPID;
	this.mgrpid = CAFEAPP.MGRPID;
	
	this.targetObj = targetObj;
	this.curObj = curObj;
	this.encset = encset;
	this.planetUserid = planetUserid;
	this.myNick = myNick;
	this.targetNick = targetNick;
	this.grpname = grpname;
	this.node = (node == null ? "" : node);
	this.showLayer = showLayer;
	this.makeNameContextMenus = makeNameContextMenus;
	this.heads = new Array();
	this.insertHead = insertHead;
	this.tails = new Array();
	this.insertTail = insertTail;
	this.getRow = getRow;
	this.hideRow = hideRow;		
	this.dimRow = dimRow;
	this.isGuest = isGuest;
	if(this.isGuest == "GUEST"){
		this.insertTail("blog", "블로그 가기", "goBlog('"+this.grpid+"', '"+this.mgrpid+"', '"+this.encset+"', '"+this.node+"');");
		this.insertTail("yozm", "요즘 가기", "goYozm('"+this.grpid+"', '"+this.mgrpid+"', '"+this.encset+"', '"+this.node+"');");
	}
	else
	{
		this.insertTail("member", "회원정보", "goProfile('"+this.grpid+"', '"+this.mgrpid+"', '"+this.encset+"', '"+this.node+"')");
		this.insertTail("article", "작성글보기",	"goArticle('"+this.encset+"','"+this.grpid+"', '"+this.item+"', '"+this.targetNick+"', '"+this.node+"', '"+ isAdmin +"', '" + isMine + "')");
		this.insertTail("blog", "블로그 가기", "goBlog('"+this.grpid+"', '"+this.mgrpid+"', '"+this.encset+"', '"+this.node+"');");
		this.insertTail("yozm", "요즘 가기", "goYozm('"+this.grpid+"', '"+this.mgrpid+"', '"+this.encset+"', '"+this.node+"');");

		if(rolecode >=25 ){
			this.insertTail("msg", "쪽지 보내기", "goSendWebMsg('"+this.encset+"', '"+this.grpid+"', '"+this.node+"')");
			this.insertTail("mail", "메일 보내기", "goSendMail('"+this.grpid+"', '"+this.mgrpid+"', '"+this.encset+"','', '"+this.node+"')");
			this.insertTail("sms", "SMS 보내기", "goMobileMsg()");
		}else{
			this.insertTail("msg", "쪽지 보내기", "RoleCheck()");
			this.insertTail("mail", "메일 보내기", "RoleCheck()");
			this.insertTail("sms", "SMS 보내기", "RoleCheck()");
		}

		if( this.targetNick == this.myNick ) {
		}	    
	}
}
function showLayer(isCafeon) {
	clickAreaCheck = true;
	var oSideViewLayer = document.getElementById(this.targetObj);
	var oBody = document.body;   

	if (oSideViewLayer == null) {
		oSideViewLayer = document.createElement("DIV");
		oSideViewLayer.id = this.targetObj;
		oSideViewLayer.className = "commLayer";
		oBody.appendChild(oSideViewLayer);
	}
	oSideViewLayer.innerHTML = this.makeNameContextMenus();      

	var objDisplay = document.getElementById(this.targetObj);
	var layerPos = getCoords(this.curObj,"all");  
	oSideViewLayer.style.left = layerPos.left + "px";
	oSideViewLayer.style.top = layerPos.top + layerPos.height + "px";   
	hideOtherLayer(this.curObj);
	if (objDisplay.style.display != "block") {
		divDisplay(this.targetObj, 'block');
	} else {
	  divDisplay(this.targetObj, 'none');
	}
}

function showLayer_old(isCafeon) {
	clickAreaCheck = true;
	var oSideViewLayer = document.getElementById(this.targetObj);
	var oBody = document.body;

	if (oSideViewLayer == null) {
		oSideViewLayer = document.createElement("DIV");
		oSideViewLayer.id = this.targetObj;
		oSideViewLayer.className = "commLayer";
		oBody.appendChild(oSideViewLayer);
	}
	oSideViewLayer.innerHTML = this.makeNameContextMenus();
	
	if (!isCafeon) {
		if (getAbsoluteTop(this.curObj) + this.curObj.offsetHeight + oSideViewLayer.scrollHeight + 100 > oBody.scrollHeight) {
			oSideViewLayer.style.top = (getAbsoluteTop(this.curObj) - oSideViewLayer.scrollHeight + 4) + 'px';
		} else {
			oSideViewLayer.style.top = (getAbsoluteTop(this.curObj) + this.curObj.offsetHeight + 4) + 'px';
		}
	} else {
		oSideViewLayer.style.top = (getAbsoluteTop(this.curObj) + this.curObj.offsetHeight + 4) + 'px';
	}

	oSideViewLayer.style.left = getAbsoluteLeft(this.curObj) + 'px';
	var objDisplay = document.getElementById(this.targetObj).style.display;
	if (objDisplay=="none") {
		divDisplay(this.targetObj, 'block');
	} else {
		divDisplay(this.targetObj, 'none');
	}
}

function makeNameContextMenus() {
	var str = "<ul>";
	
	var i=0;
	for (i=this.heads.length - 1; i >= 0; i--) {
		str += this.heads[i].renderRow();
	}
   
	var j=0;
	for (j=0; j < this.tails.length; j++) {
		str += this.tails[j].renderRow();
	}
	
	str += "</ul>";
	return str;
}

function getRow(name) {
	var i = 0;
	var row = null;
	for (i=0; i<this.heads.length; ++i) {
		row = this.heads[i];
		if (row.name == name) return row;
	}
	for (i=0; i<this.tails.length; ++i) {
		row = this.tails[i];
		if (row.name == name) return row;
	}
	return row;
}

function hideRow(name) {
	var row = this.getRow(name);
	if (row != null) {
		row.isVisible = false;
	}
}

function dimRow(name) {
	var row = this.getRow(name);
	if (row != null) {
		row.isDim = true;
	}
}

function insertHead(name, text, evt) {
	var idx = this.heads.length;
	var row = new SidwViewRow(-idx, name, text, evt);
	this.heads[idx] = row;
	return row;
}

function insertTail(name, text, evt) {
	var idx = this.tails.length;
	var row = new SidwViewRow(idx, name, text, evt);
	this.tails[idx] = row;
	return row;
}

// global function
function getCafeUrl(url, node) {		
	if (node == null || node == '') {
		return url;
	} else if (node == 'unknown') {
		url = url.replace(/\/_c21_/, "http://cafe.daum.net/_service");
	} else {
		url = 'http://' + node + '.daum.net' + url;
	}
	return url;
}

function goProfile(grpid, mgrpid, euserid, node) {
	if (mgrpid == null) mgrpid = "";
	var winname = grpid + mgrpid;
	var url = getCafeUrl('/_c21_/member_profile?userid='+euserid+'&grpid='+grpid+'&mgrpid='+mgrpid, node);
	window.open(url, winname, 'width=382,height=500,resizable=no,scrollbars=no');	
}

function goPlanet(grpid, mgrpid, euserid, node) {
	if (mgrpid == null) mgrpid = "";
	var url = getCafeUrl('/_c21_/sideview_hdn?name=planet&userid='+euserid+'&grpid='+grpid+'&mgrpid='+mgrpid, node);
	window.open(url,'planet','scrollbars=no,resizable=no,width=936,height=672');
}

function goBlog(grpid, mgrpid, euserid, node) {
	if (mgrpid == null) mgrpid = "";
	var url = getCafeUrl('/_c21_/sideview_hdn?name=blog&userid='+euserid+'&grpid='+grpid+'&mgrpid='+mgrpid, node);
	window.open(url);		
}

function goYozm(grpid, mgrpid, euserid, node) {
	if (mgrpid == null) mgrpid = "";
	var url = getCafeUrl('/_c21_/sideview_hdn?name=yozm&userid='+euserid+'&grpid='+grpid+'&mgrpid='+mgrpid, node);
	window.open(url);		
}

function goMobileMsg() {
	window.open('http://mail.daum.net/hanmail/mobile/MsgCompose.daum?popup=1&cmd=send&phone=&sp=4', '_mobile', 'width=720,height=610,toolbar=no,resizable=no,scrollbars=no');
}

function goArticle(e_userid, grpid, item, targetNick, node, isAdmin, isMine) {
	var item = 'writer';
	var jobcode = '3';
	var enc_userid = e_userid || "";

	var targetNick = targetNick.replace(/(<b>|<\/b>)/g, "");

	var p=['#', '\\?', '/', ':', '&'];
	var r=['%23', '%3F', '%2F', '%3A', '%26'];
	for (var i=0;i<p.length;i++){
	    var pt=new RegExp(p[i], 'g');
	    targetNick=targetNick.replace(pt, r[i]);
	}
	var url = "";
	if(isMine == "true"){
		url = getCafeUrl("/_c21_/member_article_cafesearch?item=userid&grpid=" + grpid);
	} else {
		url = getCafeUrl('/_c21_/member_article_cafesearch?grpid='+grpid+'&item='+item+'&nickname='+targetNick+'&enc_userid='+enc_userid, node); 
	}

	if (isAdmin=="admin") {
		//새로운 팝업을 띄웠을 경우 한글 닉네임이 깨지는 문제 때문에 빈 창을 띄우고 url 변경
		var popArticle = window.open('about:blank','pop_article');
		popArticle.location.href = url;
	} else {
		if (opener) {
			opener.document.location.href = url;
			opener.focus();
			return;
		}
		if(parent.document.location.href.indexOf("cafe.daum.net") != -1){
			document.location.href = url;
		}
		else{
			parent.document.location.href = url;
		}
	}
}

function goSendMail(grpid, mgrpid, userid, luserid, node) {
	var winname = grpid+mgrpid;
	var url = getCafeUrl('/_c21_/mailto?grpid='+grpid, node);
	if (mgrpid != null && mgrpid != '') {
		url += '&mgrpid='+mgrpid;
	}		 
	url += '&userid='+userid;
	window.open(url, winname, 'width=660,height=470,resizable=no,scrollbars=yes');
}

// 메신저 친구 추가 org
function goSendMsg3(toUserid, toNickname, fromNickname, grpname) {
	var url = 'http://messenger.daum.net/webbuddy/buddy.jsp?euserid='+toUserid+'&toname='+toNickname+'&fromname='+fromNickname+'&cafename='+grpname;
	window.open(url, '_sendmsg', 'width=450,height=390,toolbar=no,resizable=no,scrollbars=no');
}
// 쪽지 보내기
function goSendMsg(toUserid, grpid) {
	try{
		var sn = document.location.href.split("/_c21");
		top.hidden.document.getElementById('_touch_temp').src = sn[0] + "/_c21_/touch_send_param?grpid="+grpid+"&euserid="+toUserid;
	} catch ( e ){
		try {
			opener.top.hidden.document.getElementById('_touch_temp').src = sn[0] + "/_c21_/touch_send_param?grpid="+grpid+"&euserid="+toUserid;
		} catch ( e2 ) {}
	
	}
}

// 플래닛 1:1 쪽지 보내기
function goSendWebMsg(toUserid, grpid, node) {
	var url = getCafeUrl('/_c21_/webmemo_send_popup?grpid='+grpid+'&euserid='+toUserid, node);
	window.open(url,'webmemo','width=420,height=420,scrollbars=0,status=0');
}

// 메신저 친구 추가 new
function addMessengerFriend(grpid, mgrpid, euserid, node) {
	if (mgrpid == null) mgrpid = "";
	var url = getCafeUrl('/_c21_/sideview_hdn?name=messenger&userid='+euserid+'&grpid='+grpid+'&mgrpid='+mgrpid, node);
	window.open(url,'_sendmsg','width=450,height=390,toolbar=no,resizable=no,scrollbars=no');
}