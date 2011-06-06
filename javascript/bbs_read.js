document.domain='daum.net';

function pop_mobile(szURL, szName, iWidth, iHeight) {
	window.open(szURL, szName, 'width=' + iWidth + ',height=' + iHeight + ',resizable=yes,scrollbars=yes');
}

function doPrint() {
	var url = "/_c21_/"+CAFEAPP.ui.BBS_PRINT+"?grpid="+CAFEAPP.GRPID+"&mgrpid="+CAFEAPP.MGRPID+"&fldid="+CAFEAPP.FLDID+"&dataid="+CAFEAPP.ui.DATAID;
	printWin=window.open(url, "printWin", "scrollbars=yes,toolbar=no,location=no,directories=no,width=640,height=650,resizable=yes,mebar=no,left=0,top=0");
	return;
}

function view_ccl(type)	{
	if (type == "1"){
		document.getElementById('cclArea_tooltip').style.display = "block";
	} else	{
		document.getElementById('cclArea_tooltip').style.display = "none";
	}
}

function goBbsList() {
    /*
    list : 앞, 뒤목록 액션 표시
    listval : 글보기 화면에서 글목록으로 갈 경우 리스트를 뽑기위한 기준 
    topid : 해당 게시판의 제일 큰 bbsdepth
    */
    // 앞,뒤목록 보기를 누른 경우
	var bbsForm = document.getElementById("bbsForm");

    bbsForm.page.value = CAFEAPP.ui.PAGE;
    bbsForm.prev_page.value = CAFEAPP.ui.PREV_PAGE;
    bbsForm.firstbbsdepth.value = CAFEAPP.ui.FIRSTBBSDEPTH;
    bbsForm.lastbbsdepth.value = CAFEAPP.ui.LASTBBSDEPTH;
    bbsForm.grpid.value=CAFEAPP.GRPID;
	bbsForm.mgrpid.value=CAFEAPP.MGRPID;
    bbsForm.fldid.value=CAFEAPP.FLDID;

   	bbsForm.action="/_c21_/"+CAFEAPP.ui.BBS_LIST_URI+"#bbs_list_title";
    bbsForm.submit();
}
//여기에 전달되는 contentval은 실제 pre,next로 변경됨 - 2007-10-18 by Jeid)
function goBbsRead(content,contentval) {
        /*
        list : 앞, 뒤목록 액션 표시
        listval : 글보기 화면에서 글목록으로 갈 경우 리스트를 뽑기위한 기준
        topid : 해당 게시판의 제일 큰 bbsdepth
        content : 앞, 뒷글 액션 표시
        contentval : 글읽기 화면에서 기준이 될 bbsdepth
        */
    // 글제목을 누른 경우
    var bbsForm = document.getElementById("bbsForm");
  
    bbsForm.page.value = CAFEAPP.ui.PAGE;
    bbsForm.prev_page.value = CAFEAPP.ui.PREV_PAGE;
    bbsForm.firstbbsdepth.value = CAFEAPP.ui.FIRSTBBSDEPTH;
    bbsForm.lastbbsdepth.value = CAFEAPP.ui.LASTBBSDEPTH;
    bbsForm.content.value = content;
    bbsForm.contentval.value = contentval;
    bbsForm.grpid.value=CAFEAPP.GRPID;
	bbsForm.mgrpid.value=CAFEAPP.MGRPID;
    bbsForm.fldid.value=CAFEAPP.FLDID;
    // bbs_read에서 content가 널이면, 글제목을 클릭하여 글을 읽는 경우이므로, 받은 dataid을 포함하?2개를 뽑는다.
   	bbsForm.action="/_c21_/"+CAFEAPP.ui.BBS_READ_URI;
    bbsForm.submit();
}

function goNeighborRead(dataid, contentval) {
	document.location.href = "/_c21_/"+CAFEAPP.ui.BBS_READ_URI+"?grpid="+CAFEAPP.GRPID+"&mgrpid="+CAFEAPP.MGRPID+"&fldid="+CAFEAPP.FLDID+"&datanum=" + dataid + "&contentval=" + contentval + "&listnum=" + CAFEAPP.ui.LISTNUM;
}

function check_reply(bbsdepth) {
    if(bbsdepth.lastIndexOf("zzzzz") == -1) {
    	alert("더 이상 답글을 달 수 없습니다.");
        return;
    }
	document.location.href = "/_c21_/"+CAFEAPP.ui.BBS_REPLY_URI+"?grpid="+CAFEAPP.GRPID+"&mgrpid="+CAFEAPP.MGRPID+"&fldid="+CAFEAPP.FLDID+"&dataid="+CAFEAPP.ui.DATAID+"&pardataname="+CAFEAPP.ui.ENCDATANAME+"&parbbsdepth="+CAFEAPP.ui.PARBBSDEPTH+((CAFEAPP.ui.ANONYN == "N" && CAFEAPP.ui.BBSNICKNAME) ?"&e_paruserid="+CAFEAPP.ui.CAFE_ENCRYPT_USERID :"")+"&pardatatype="+CAFEAPP.ui.PARDATATYPE+"&parregdt="+CAFEAPP.ui.Convert_REGDT+"&move="+CAFEAPP.ui.Convert_REFERER;
}

function controlImage(img_id) {
    var maxWidth = 750;
    var w = document.getElementById(img_id).width;
    if (w <= 0) {
    	time_id = window.setTimeout("controlImage('"+img_id+"')",10);
    } else {
        if (w > maxWidth) {
            document.getElementById(img_id).width = maxWidth;
        }
    }
}

function checkVirus(param) {
	var local = "/_c21_/pds_v3check?" + param;
	StartWin=window.open("", "StartWindow", "scrollbars=no,toolbar=no,location=no,directories=no,width=400,height=250,resizable=no,mebar=no,left=0,top=0");

	document.pdsV3CheckForm.action = local;
	document.pdsV3CheckForm.target = "StartWindow";
	document.pdsV3CheckForm.submit();
}

function albumViewer(title, url) {
    if (CAFEAPP.ui.DRAGPERMYN=="N") {
		alert('무단복사를 막기 위해\n마우스 드래그 금지가 설정되어 있습니다' );
		return;
    }
    window.open("/_c21_/album_viewer?grpid="+CAFEAPP.GRPID+"&fldid="+CAFEAPP.FLDID+"&dataid="+CAFEAPP.ui.DATAID+"&mgrpid="+CAFEAPP.MGRPID+"&url=" + escape(url) + "&title=" + title, "viewer", "resizable=yes,scrollbars=yes");
}

function fileFilterViewer(url, filekey, realname, v3param) {
	var sw = screen.availWidth;
	var sh = screen.availHeight;

	if (sw > 1280) {
		sw = 1280;
	}

	if (sh > 1024) {
		sh = 1024;
	}

	window.open("", "filefilter_viewer", "width=" + sw + ", height=" + sh + ", resizable=yes, scrollbars=no");

	document.filefilterForm.grpid.value = CAFEAPP.GRPID;
	document.filefilterForm.kind.value = "main";
	document.filefilterForm.url.value = url;
	document.filefilterForm.filekey.value = filekey;
	document.filefilterForm.realname.value = realname;
	document.filefilterForm.v3param.value = v3param;

	document.filefilterForm.action = "/_c21_/filefilter_viewer_hdn";
	document.filefilterForm.target = "filefilter_viewer";
	document.filefilterForm.submit();
}

function open_movie(grpid, moviekey, scrapable) {
	var url = "/_c21_/movie_play_popup?grpid="+CAFEAPP.GRPID+"&fldid="+CAFEAPP.FLDID+"&dataid="+CAFEAPP.ui.DATAID+"&is_cafe_button=true&scrapable="+scrapable;
	window.open(url, "MOVIE_VIEWER", "width=858,height=680,resizable=no,scrollbars=no");
}

function deleteArticleSomething(kind) {
    if ( confirm( "정말로 삭제하시겠습니까?" ) ) {
        document.location.href="/_c21_/article_something_delete_hdn?kind=" + kind + "&grpid="+CAFEAPP.GRPID+"&mgrpid="+CAFEAPP.MGRPID+"&fldid="+CAFEAPP.FLDID+"&dataid="+CAFEAPP.ui.DATAID;
    }
}

function popupSlide() {
	var dest = "/_c21_/album_slide_list?grpid="+CAFEAPP.GRPID+"&fldid="+CAFEAPP.FLDID+"&page="+CAFEAPP.ui.PAGE_page+"&prev_page="+CAFEAPP.ui.PREV_PAGE+"&firstbbsdepth="+CAFEAPP.ui.FIRSTBBSDEPTH+"&lastbbsdepth="+CAFEAPP.ui.LASTBBSDEPTH+"&albumtype=article&slide_type";
	var width = "819";
	var height = "644";

	slide = window.open(dest, "slide", "scrollbars=no,toolbar=no,location=no,directories=no,width="+width+",height="+height+",resizable=yes,mebar=no");
	slide.focus();
}


/* _scrap_info 이후 추가된 script */
function showList(curObj, targetObj){
	var listUL = document.getElementById(targetObj);
	if(listUL.style.display == 'none'){
		listUL.style.display = 'block';
	} else {
		listUL.style.display = 'none';
	}
}

function getExtImg(ext) {
	switch(ext) {
		case "doc": return "http://i1.daumcdn.net/cafeimg/cf_img2/bbs2/p_word_s.gif";
		case "xls": return "http://i1.daumcdn.net/cafeimg/cf_img2/bbs2/p_xls_s.gif";
		case "ppt": return "http://i1.daumcdn.net/cafeimg/cf_img2/bbs2/p_ppt_s.gif";
		case "pdf": return "http://i1.daumcdn.net/cafeimg/cf_img2/bbs2/p_pdf_s.gif";
		case "txt": return "http://i1.daumcdn.net/cafeimg/cf_img2/bbs2/p_txt_s.gif";
		case "hwp": return "http://i1.daumcdn.net/cafeimg/cf_img2/bbs2/p_hwp_s.gif";
		case "jpg": return "http://i1.daumcdn.net/cafeimg/cf_img2/bbs2/p_jpg_s.gif";
		case "gif": return "http://i1.daumcdn.net/cafeimg/cf_img2/bbs2/p_gif_s.gif";
		case "png": case "bmp": return "http://i1.daumcdn.net/cafeimg/cf_img2/bbs2/p_png_s.gif";
		case "zip": case "alz": return "http://i1.daumcdn.net/cafeimg/cf_img2/bbs2/p_zip_s.gif";
		case "mp3": case "wav": return "http://i1.daumcdn.net/cafeimg/cf_img2/bbs2/p_mp3_s.gif";
		case "avi": case "mpeg": case "wmv": return "http://i1.daumcdn.net/cafeimg/cf_img2/bbs2/p_movie_s.gif";
		case "swf": return "http://i1.daumcdn.net/cafeimg/cf_img2/bbs2/p_swf_s.gif";
		case "html": return "http://i1.daumcdn.net/cafeimg/cf_img2/bbs2/p_html_s.gif";
		default: return "http://i1.daumcdn.net/cafeimg/cf_img2/bbs2/p_etc_s.gif";
	}
}

function setFileTypeImg(filename, idx) {
	var firstpos = filename.lastIndexOf('.')
	var ext = '';

	if (firstpos != -1) {
		ext = filename.substring(firstpos + 1);
		ext = ext.toLowerCase();
	}

	var imgUrl = getExtImg(ext);

	document.getElementById('fileExt' + idx).style.backgroundImage = 'url(' + imgUrl + ')';
}
/* bbs/_reply.html 다음에 들어있던 script 중 static 부분*/
function commentViewBtn(tarObj) {
	var commentArea = document.getElementById('commentArea');
	setVisibleComment(commentArea.style.display != "block")
}

function setVisibleComment(bool){
	var commentArea = document.getElementById('commentArea');
	if (bool){
		commentArea.style.display = "block";		
	} else {
		commentArea.style.display = "none";
	}
}

/* _reply.js 으로 이동 - 제거 대상 */
function activeCommentView(strType, obj)
{
	setVisibleComment(true);
	document.getElementById('cmttype').value=strType;

    if (strType=="member") {
        if($('member_cmt').className ==  "comment_on txt_point"){
            $('commentArea').style.display = "none";
            $('member_cmt').className = "comment_on txt_point more"
        }
        else{
	    	$('member_cmt').className = "comment_on txt_point"
	    	$('nonemember_cmt').className = "comment_off"
	        $('memberTailTable').style.display = ''; // table
	        $('nomemberTailTable').style.display = "none";        
	        $('commentArea').style.display = "block";
        }
    } else if (strType=="nonemember") {
        if($('nonemember_cmt').className ==  "comment_on txt_point"){
            $('commentArea').style.display = "none";
            $('nonemember_cmt').className = "comment_on txt_point more"    
        }
        else{
	    	$('member_cmt').className = "comment_off"
	    	$('nonemember_cmt').className = "comment_on txt_point"    
	        $('nomemberTailTable').style.display = '';	// table
	        $('memberTailTable').style.display = "none";
	        $('commentArea').style.display = "block";
        }
    }
	CPAGE='';
	goPage(0);
	return false;
}

function poplogin(p){
	var param = CAFEAPP.ui.BBS_WRITE_URI+"?grpid="+CAFEAPP.GRPID+"&mgrpid="+CAFEAPP.MGRPID+"&fldid="+CAFEAPP.FLDID+"&page="+CAFEAPP.ui.PAGER_page+"&prev_page="+CAFEAPP.ui.PREV_PAGE+"&firstbbsdepth="+CAFEAPP.ui.P_FIRSTBBSDEPTH+"&lastbbsdepth="+CAFEAPP.ui.P_LASTBBSDEPTH;
	if (p) { param = p; }
	var encodeParam = encodeBase64(param);
	window.open("/_c21_/poplogin?grpid="+CAFEAPP.GRPID+"&param="+encodeParam,"poplogin", 'width=450,height=300,resizable=no,scrollbars=no');
}

// 읽기페이지 링크 재정의 
function redefineLink(container) {
	var oDoc = daum.$(container);
	if (!oDoc) { oDoc = daum.$("user_contents"); }
	var aLinks = oDoc.getElementsByTagName("a");
	
	var redefineLinkHandler = function(elLink) {
		var sLinkUrl = elLink.getAttribute("href");
		if (!sLinkUrl) return;
		if (elLink.id=="article_poll_view") return;
		if (sLinkUrl.indexOf('#') > -1 || sLinkUrl.toLowerCase().indexOf('javascript') > -1) return;
		if (elLink.getAttribute("onclick")) return;
		if (elLink.className=="tx-link") return;	//신규에디터에 URL 기능중 현재창에 띄우기 기능 추가 _self
		if (elLink.className=="sng-link") return;
		
		elLink.setAttribute("target", "_blank");
	}
	
	for(var i=0; i<aLinks.length; i++) {
		redefineLinkHandler(aLinks[i], false);
	}
}

// 태그제한 필터링 메소드
function removeRestrictTag(xmp) {
	var templateXmp = daum.$(xmp);
	if (!templateXmp) { templateXmp = daum.$("template_xmp"); }
	if (!templateXmp) return; 
	var after = templateXmp.innerHTML;
	var regStr1 = new RegExp("behavior[ ]*:[ ]*url\(.*\)", "gi");
	var regStr2 = new RegExp("<[ ]*meta(>|[ ]+[^>]*>)", "gi");

	var regStr31 = new RegExp("background[ ]*=[ ]*#[^ ]*", "gi");
	var regStr32 = new RegExp("background[ ]*=[ ]*\'#[^\']*\'", "gi");
	var regStr33 = new RegExp("background[ ]*=[ ]*\"#[^\"]*\"", "gi");

	var regStr4 = new RegExp("textarea[ ]*(.*)template_jst", "gi");

	var replaceStr = "[안내]태그제한으로등록되지않습니다.";
	var replaceStrMeta = "<!--[안내]태그제한으로등록되지않습니다-->";

	var after1 = after.replace(regStr1,replaceStr);
    var after2 = after1.replace(regStr2,replaceStrMeta);
    var after31 = after2.replace(regStr31,replaceStr);
    var after32 = after31.replace(regStr32,replaceStr);
    var after33 = after32.replace(regStr33,replaceStr);
    var after4 = after33.replace(regStr4, "br");
    
    var after5 = refiltering(after4);
    after = after5;
    return after;
}

//스크랩 게시글에서도 스크립트 필터링 제거
function refilteringInfoScript(xmp){
	var templateXmp = daum.$(xmp);
	if (!templateXmp) { templateXmp = daum.$("template_xmp"); }
	if (!templateXmp) return; 
	var after = templateXmp.innerHTML;
	var after1 = refiltering(after);
    after = after1;
    return after;
}

//더보기, 기능이나 음악,상품 정보 첨부시 스크립트 필터링 제거
function refiltering(after){
	//더보기
	if(after.indexOf('txc-moreless') > -1){
 		var moreStr = morelessAdd(after);
 		after = moreStr;
    }
    //정보첨부
	if(after.indexOf('http://editor.daum.net/view/info/') > -1 || after.indexOf('http://cia.daum.net/view/') > -1){
		//정보첨부 스크립트 풀어주기
	    var regStr1 = new RegExp("<xscript.*http://editor.daum.net/view/info/\\d+.\\d+/(\\D+).js.*</xscript>", "gi");
	    while((arr=regStr1.exec(after)) !=null){
	    	var regStr2 = new RegExp("(<xscript.*http://editor.daum.net/view/info/\\d+.\\d+/"+RegExp.$1+".js.*</xscript>)", "gi");
	    	var replaceStr = refilteringScript(after, regStr2);
	    	if(replaceStr != '' && replaceStr != 'undefined'){
		    	after = replaceStr;
		    }	    	
		}		
	    
	    //뮤직 정보 첨부
	    if(after.indexOf('xxjavascript:txBuyBgm') > -1 || after.indexOf('xxjavascript:txDownSong') > -1 
			    || after.indexOf('xxjavascript:txListenSong') > -1){				    	
	    	var scriptStr = refilteringMusicScript(after);
	    	after = scriptStr;
	    }
	    
	    //상품 정보 첨부
	    if(after.indexOf('xxjavascript:txShowBigImage') > -1 || after.indexOf('xxjavascript:txAddWishList') > -1){
	   		var productStr = refilteringProductScript(after);
	   		after = productStr;
	    }	
	    
	    //뮤직에서 바로보내기시 새로운 regular exp 필터링 풀어주기
	    if(after.indexOf('http://cia.daum.net/view/music') > -1){					   		    
	    	var regStr = new RegExp("(<xscript.*http://cia.daum.net/view/music/\\D+/\\d+.js.*</xscript>)", "gi");
	    	while((arr=regStr.exec(after)) !=null){
	    		var musicReplaceStr = refilteringScript(after, regStr);
	    		after = musicReplaceStr;
	    	}
	    }	    	    	 
	}

    return after;
}

function morelessAdd(after) {
	
	var regStr1 = new RegExp("(<div\\s.*txc-.*(moreless|[\uac00-\ud79f])\">)","gi"); //moreless이거나 한글인지 체크
	var regStr2 = new RegExp("</p></div>", "gi");
	
	var replaceStr1 = "<div class=\"txc-moretext\"><a href=\"javascript:;\" onclick=\"toggleMoreLess(this);\">더보기</a></div>";
	var replaceStr2 = "<div class=\"txc-lesstext\"><a href=\"javascript:;\" onclick=\"toggleMoreLess(this);\">접기</a></div>";
	var replaceStr3 = "<div class=\"txc-morecontents\">";
	
	var arr = regStr1.exec(after);	
	var reStr = RegExp.$1;
	var replaceStr = reStr + replaceStr1 + replaceStr2 + replaceStr3;
	var after1 = after.replace(regStr1, replaceStr);
	var after2 = after1.replace(regStr2, "</p></div></div>");
		
	return after2;
}

function refilteringMusicScript(after) {
	var regStr1 = new RegExp("x*javascript:txBuyBgm", "gi");
	var regStr2 = new RegExp("x*javascript:txDownSong", "gi");
	var regStr3 = new RegExp("x*javascript:txListenSong", "gi");

	var after1 = after.replace(regStr1, "javascript:txBuyBgm");
	var after2 = after1.replace(regStr2, "javascript:txDownSong");
	var after3 = after2.replace(regStr3, "javascript:txListenSong");	
	
	return after3;

}

function refilteringProductScript(after) {
	var regStr1 = new RegExp("x*javascript:txShowBigImage", "gi");
	var regStr2 = new RegExp("x*javascript:txAddWishList", "gi");
	
	var after1 = after.replace(regStr1, "javascript:txShowBigImage");
	var after2 = after1.replace(regStr2, "javascript:txAddWishList");	
	
	return after2;
}

function refilteringScript(str, regStr){
	var regStr2 = new RegExp("xscript", "gi");
	var regStr3 = new RegExp("xxjavascript", "gi");
	
	var after3;	
	var arr = regStr.exec(str);
	var reStr1 = RegExp.$1;
	var after1 = reStr1.replace(regStr2, "script");
	var after2 = after1.replace(regStr3, "javascript");
	after3 = str.replace(reStr1, after2);		
	return after3;
}

/*
 * 앨범게시판 미리보기 슬라이드 뷰 - by wracker1 2011.02.24
 * wiki url - http://play.daumcorp.com/pages/viewpage.action?pageId=41387194
 * 
 */

SlideView = function(setup, params, userFunction){
	this.slideIndex = 0;
	this.dataListInfos = [];
	this.slideListInfos = [];
	this.ulPosition = 0;
	this.preLoadCount = 0;
	this.duration = 0.6;
	this.bufferSize = 2;
	this.hasMarkup = true;
	this.isMoving = false;
	this.init(setup, params, userFunction);
};

SlideView.prototype = {
	init: function(setup, params, userFunction) {
		this.slideWrap = daum.$(setup.wrapId);
		this.ul = daum.$$("ul", this.slideWrap)[0];
		this.liSize = setup.liSize;
		this.numberOfShowItems = setup.numberOfShowItems || 5;
		this.moveDistance = this.liSize * this.numberOfShowItems;
		
		this.liClassName = setup.liClassName || null;
		this.btnDisableClassName = setup.btnDisableClassName || "disabled";
		this.pointClassName = setup.pointClassName || "box_point";
		this.blankNodeInnerHTML = "<div class='blank_thumb'></div>";
		
		this.prevButton = daum.Element.getPrev(this.slideWrap);
		this.nextButton = daum.Element.getNext(this.slideWrap);
		
		this.getData = (userFunction && userFunction.getData) ? userFunction.getData : this.ajaxCall;
		this.easing = (userFunction && userFunction.easing) ? userFunction.easing : this.easeOutExpo;
		
		this.numberOfTotalSlides = 5;
		this.maxPreLoadCount = setup.maxPreLoadCount || 0;
		
		if(!this.ul) {
			this.ul = document.createElement("ul");
			this.slideWrap.appendChild(this.ul);
			this.hasMarkup = false;
		}
		this.initCustomInfoSet(params);
		this.getData(params, this.initLoadHandler.bind(this));
		this.initEvent();
	},
	
	initCustomInfoSet: function(params){
		// only cafe
		this.link = "/_c21_/"+CAFEAPP.ui.BBS_READ_URI+"?grpid="+CAFEAPP.GRPID+"&mgrpid="+CAFEAPP.MGRPID+"&fldid="+CAFEAPP.FLDID + "&listnum=" + CAFEAPP.ui.LISTNUM;
		this.dataId = params.dataId;
		this.contentVal = params.contentVal;
	},
	
	ajaxCall: function(params, callbackFunction) {
		BbsRead.getAlbumList(CAFEAPP.GRPID, CAFEAPP.FLDID, params.dataId, params.contentVal, params.prevDataCnt, params.nextDataCnt, {
			
			callback: callbackFunction,
			
			errorHandler: function(errStr, e){ }
		});
	},
	
	makeList: function(index, callbackFunction, data){
		var slideInfo = this.getSlideInfoByReferenceIndex(index);
		
		if(slideInfo) {
			var count = 0;

			for(var i = 1, length = data.length - 1 ; i < length; i++) {
				this.setLiClassName(slideInfo.slide[count], data[i]);
				this.setLiInnerContent(slideInfo.slide[count], data[i])
				count++;
			}
		}
		
		if(!this.getDataListInfoByIndex(index)) {
			this.puchDataListInfo(data, index);
		}
		
		if(callbackFunction) {
			callbackFunction.bind(this)(index, this.getAttachType(index));
		}
	},
	
	setLiInnerContent: function(li, listInfo){
		if(listInfo.dataid && listInfo.bbsdepth && listInfo.thumnail) {
			var firstContentInLi = li.firstChild;
			
			if(firstContentInLi.tagName.toLowerCase() == "a") {
				firstContentInLi.href = this.link + "&datanum=" + listInfo.dataid + "&contentval=" + listInfo.bbsdepth;
				
				if(firstContentInLi.firstChild.tagName.toLowerCase() == "img") {
					firstContentInLi.firstChild.src = listInfo.thumnail;
				}
			} else {
				li.innerHTML = "<a href=" + this.link + "&datanum=" + listInfo.dataid + "&contentval=" + listInfo.bbsdepth + "><img src=" + listInfo.thumnail + " alt='" + listInfo.dataname + "' /></a>";   
			}
		} else {
			li.innerHTML = this.blankNodeInnerHTML;
		}
	},
	
	getParams: function(btnData, btnType){ // dwr 호출에 필요한 파라메터를 가져온다.
		var params = {};
		params.dataId = btnData.dataid;
		params.contentVal = btnData.bbsdepth;
		
		if(btnType == "left"){
			params.prevDataCnt = 5;
			params.nextDataCnt = 2;
		} else if(btnType == "right"){
			params.prevDataCnt = 1;
			params.nextDataCnt = 6;
		}
		return params;
	},
	
	getButtonInfos: function(ajaxData){
		return {
			prevData: ajaxData[0],
			prevAble: (ajaxData[0].dataid && ajaxData[0].bbsdepth) ? true : false,
			nextData: ajaxData[ajaxData.length - 1],
			nextAble: (ajaxData[ajaxData.length - 1].dataid && ajaxData[ajaxData.length - 1].bbsdepth) ? true : false
		};
	},
	
	initLoadHandler: function(data) {
		if(this.hasMarkup){
			this.liArr = daum.$$("li", this.ul);
			
			for(var i = 0; i < this.numberOfTotalSlides; i++){
				if(i < this.bufferSize) {
					this.ul.insertBefore(this.initBufferWithIndex(i), this.liArr[0]);
				} else if( i == this.bufferSize) {
					this.setListInitInfo(data);
				} else {
					this.ul.appendChild(this.initBufferWithIndex(i));
				}
			}
		} else {
			for(var i = 0; i < this.numberOfTotalSlides ; i++){
				this.ul.appendChild(this.initBufferWithIndex(i));
			}
			this.makeList(this.slideIndex, null, data);
		}
		this.setListWidthAndPosition();
	},
	
	setListInitInfo: function(data) {
		this.pushSlideListInfo(this.liArr, this.slideIndex + this.bufferSize, this.slideIndex);
		this.puchDataListInfo(data, this.slideIndex);
		this.setBtnStatusClassName(this.getButtonInfos(data));
		this.checkPreLoad(this.slideIndex);
	},
	
	setLiClassName: function(li, listInfo){
		if(this.dataId == listInfo.dataid && this.contentVal == listInfo.bbsdepth) {
			if(!daum.Element.hasClassName(li, this.pointClassName)) {
				daum.Element.addClassName(li, this.pointClassName);
			}
		} else {
			if(daum.Element.hasClassName(li, this.pointClassName)) {
				daum.Element.removeClassName(li, this.pointClassName);
			}
			if(!daum.Element.hasClassName(li, this.liClassName)) {
				daum.Element.addClassName(li, this.liClassName);
			}
		}
	},
	
	initBufferWithIndex: function(index){
		var fragment = document.createDocumentFragment();
		var slide = [];
		
		for(var i=0; i<this.numberOfShowItems; i++) {
			var li = document.createElement("li");
			
			if(this.liClassName) {
				daum.Element.addClassName(li, this.liClassName);
			}
			li.innerHTML = this.blankNodeInnerHTML;
			fragment.appendChild(li);
			slide.push(li);
		}
		this.pushSlideListInfo(slide, index, index - this.bufferSize);
		
		return fragment;
	},
	
	puchDataListInfo: function(data, index){
		this.dataListInfos.push({
			listData: data,
			index: index
		});
	},
	
	pushSlideListInfo: function(slide, index, listDataIndex) {
		this.slideListInfos.push({
			slide: slide,
			index: index,
			referenceListIndex: listDataIndex
		});
	},
	
	checkPreLoad: function(index){
		if(this.preLoadCount < this.maxPreLoadCount){
			var listInfo = this.getDataListInfoByIndex(index);
			var btnInfo = null;
			
			if(listInfo){
				btnInfo = this.getButtonInfos(listInfo.listData);
				// 왼쪽으로 preload
				if(btnInfo.prevAble){
					var hasListInfo = !!this.getDataListInfoByIndex(listInfo.index - 1);
					if(!hasListInfo) {
						this.preLoadData(btnInfo.prevData, listInfo.index - 1, "left");
					}
				}
				
				// 오른쪽으로 preload
				if(btnInfo.nextAble){
					var hasListInfo = !!this.getDataListInfoByIndex(listInfo.index + 1);
					if(!hasListInfo) {
						this.preLoadData(btnInfo.nextData, listInfo.index + 1, "right");
					}
				}
			}
		}
	},
	
	preLoadData: function(data, index, attachType){
		var params = this.getParams(data, attachType);
		this.getData(params, this.makeList.bind(this, index, this.checkPreLoad.bind(this, index)));
		this.preLoadCount++;
	},
	
	getSlideInfoByReferenceIndex: function(referenceIndex) {
		for(var i = 0, length = this.slideListInfos.length ; i < length ; i++) {
			if(this.slideListInfos[i].referenceListIndex == referenceIndex) {
				return this.slideListInfos[i];
			}
		}
		return null;
	},
	
	getFirstOrLastIndex: function(type){
		var index = null;
		if(type){
			index = this.dataListInfos[0].index;
			for(var i = 0, length = this.dataListInfos.length ; i < length; i++) {
				if(type === "first" && this.dataListInfos[i].index < index){
					index = this.dataListInfos[i].index; 
				} else if(type === "last" && this.dataListInfos[i].index > index){
					index = this.dataListInfos[i].index;
				}
			}	
		}
		return index;
	},
	
	getAttachType: function(index) {
		return (this.slideIndex > index) ? "left" : "right";
	},
	
	getDataListInfoByIndex: function(index) {
		for(var i = 0, length = this.dataListInfos.length ; i < length ; i++) {
			if(this.dataListInfos[i].index == index) {
				return this.dataListInfos[i];
			}
		}
		return null;
	},
	
	setBtnStatusClassName: function(btnInfos){
		if(!btnInfos) return;
		if(btnInfos.prevAble){
			daum.Element.removeClassName(this.prevButton, this.btnDisableClassName);
		} else {
			daum.Element.addClassName(this.prevButton, this.btnDisableClassName);
		}
		
		if(btnInfos.nextAble){
			daum.Element.removeClassName(this.nextButton, this.btnDisableClassName);
		} else {
			daum.Element.addClassName(this.nextButton, this.btnDisableClassName);
		}
	},
	
	setListWidthAndPosition: function(){
		this.ulPosition = this.moveDistance * this.bufferSize * -1;
		this.ul.style.width = (this.moveDistance * this.numberOfTotalSlides).px();
		this.ul.style.left = this.ulPosition.px();
	},
	
	initEvent: function(){
		daum.addEvent(this.prevButton, "click", this.clickBtnAction.bind(this, "prev"));
		daum.addEvent(this.nextButton, "click", this.clickBtnAction.bind(this, "next"));
	},
	
	clickBtnAction: function(direction, ev){
		daum.stopEvent(ev);
		var elem = daum.getElement(ev);
		elem = this.findItem(".btn", elem);
		
		if(!daum.Element.hasClassName(elem, this.btnDisableClassName) && !this.isMoving){
			this.isMoving = true;
			var index = this.slideIndex;
			
			if(direction === "prev"){
				index--;
			} else if(direction === "next"){
				index++;
			}
			this.selectListLoadType(index);
		}
	},
	
	selectListLoadType: function(index) {
		var listInfo = this.getDataListInfoByIndex(index);
		var btnData = null;
		var attachType = this.getAttachType(index);
		
		if(listInfo){
			this.makeList.bind(this)(index, this.moveList, listInfo.listData);
		} else {
			btnData = this.getButtonInfos(this.getDataListInfoByIndex(this.slideIndex).listData);
			if(btnData){
				if(attachType === "left"){
					btnData = btnData.prevData;
				} else if(attachType === "right"){
					btnData = btnData.nextData;
				}
				var params = this.getParams(btnData, attachType);
				this.getData(params, this.makeList.bind(this, index, this.moveList));
			}
		}
	},
	
	moveList: function(index){
		var attachType = this.getAttachType(index);
		this.setBtnStatusClassName(this.getButtonInfos(this.getDataListInfoByIndex(index).listData));
		this.ulPosition = (attachType === "left") ? this.moveDistance * -1 : this.moveDistance * -3;
		
		daum.Fx.animate(this.ul, "left:"+this.ulPosition+"px;",{easing: this.easing, duration: this.duration, callback:function(){
			this.slideIndex = index;
			this.moveBufferList(attachType);
			this.isMoving = false;
			
			if(this.maxPreLoadCount > 0){
				this.preLoadCount = 0;
				var preIndex = this.getFirstOrLastIndex((attachType === "left") ? "first" : "last");
				
				if(this.isNeedPreload(preIndex, index)) {
					this.checkPreLoad(preIndex);
				}
			}
			cafeAjaxPV(2000);
		}.bind(this)});
	},
	
	moveBufferList: function(attachType) {
		var temp = null;
		
		if(attachType === "right") {
			temp = this.slideListInfos.shift();
			this.slideListInfos.push(temp);
			
			for(var i = 0, length = temp.slide.length ; i < length ; i++) {
				this.ul.appendChild(temp.slide[i]);
			}
		} else {
			temp = this.slideListInfos.pop();
			this.slideListInfos.unshift(temp);
			
			for(var i = 0, length = temp.slide.length ; i < length ; i++) {
				this.ul.insertBefore(temp.slide[i], this.slideListInfos[1].slide[0]);
			}
		}
		
		this.updateSlideIndexAndPosition(attachType);
	},
	
	updateSlideIndexAndPosition: function(attachType) {
		this.ul.style.left = (this.moveDistance * this.bufferSize * -1).px();
		var referenceIndex = this.slideIndex - this.bufferSize;
		
		for(var i = 0, length =  this.slideListInfos.length; i < length ; i++) {
			this.slideListInfos[i].index = i;
			this.slideListInfos[i].referenceListIndex = referenceIndex + i;
		}
	},
	
	isNeedPreload: function(preIndex, index) {
		return Math.abs(preIndex - index) < 2;
	},
	
	findItem: function(query, item) {
		var queries = query.split(".");
		var tagName = null;
		var className = null;
		var itemTagName = item.tagName.toLowerCase();
		
		switch(queries.length) {
			case 1: 
				tagName = queries[0]; 
				break;
			case 2: 
				tagName = queries[0];
				className = queries[1];
				break;
			default:
				return null;
		}
		
		if(tagName && className){
			if(itemTagName === tagName && daum.Element.hasClassName(item, className)) return item;
		} else if(tagName){
			if(itemTagName === tagName) return item;
		} else if(className){
			if(daum.Element.hasClassName(item, className)) return item;
		}
		
		if(item.parentNode){
			return this.findItem(query, item.parentNode);
		} else {
			return null;
		}
	}
};



function del() {
	var bbsForm = document.getElementById("bbsForm");
    if (isDelAuthorized && confirm("정말로 삭제하시겠습니까?")) {
    	bbsForm.fldid.value=CAFEAPP.FLDID;
        bbsForm.dataid.value=CAFEAPP.ui.DATAID;
        bbsForm.move.value=CAFEAPP.ui.ENCREFERER;
		bbsForm["viewcount" + CAFEAPP.ui.DATAID].value=CAFEAPP.ui.VIEWCOUNT;
		bbsForm["regdt" + CAFEAPP.ui.DATAID].value=CAFEAPP.ui.PLAIN_REGDT;
		bbsForm.grpid.value=CAFEAPP.GRPID;
		bbsForm.mgrpid.value=CAFEAPP.MGRPID;
        bbsForm.action = "/_c21_/bbs_delete_action";
        bbsForm.submit();
    }
}

function spam() {
    if (isSpamAuthorized && confirm("스팸처리를 하시겠습니까?\n해당 글 삭제와 동시에 회원은 활동중지되며, Daum클린센터에 바로 신고 접수됩니다.")) {
    	var bbsForm = document.getElementById("bbsForm");

        bbsForm.fldid.value=CAFEAPP.FLDID;
        bbsForm.dataid.value=CAFEAPP.ui.DATAID;
        bbsForm.move.value=CAFEAPP.ui.ENCREFERER;
        bbsForm["espam" + CAFEAPP.ui.DATAID].value=CAFEAPP.ui.ESPAM;
        bbsForm.grpid.value=CAFEAPP.GRPID;
		bbsForm.mgrpid.value=CAFEAPP.MGRPID;
        bbsForm.action = CAFEAPP.ui.BBS_DELETE_SPAM;
        bbsForm.submit();
	}
}


function goModifyLvl(changerolecode) {
	if(!isModifyAuthorized){return;}
	var bbsForm = document.getElementById("bbsForm");
	bbsForm.changerolecode.value=changerolecode;

    bbsForm.userlist.value=CAFEAPP.ui.CAFE_ENCRYPT_USERID;
    bbsForm.grpid.value=CAFEAPP.GRPID;
	bbsForm.mgrpid.value=CAFEAPP.MGRPID;
	bbsForm.mode.value=7;
	bbsForm.dataid.value=CAFEAPP.ui.CAFE_ENCRYPT_USERID;
	bbsForm.action = "/_c21_/updateLvl_action";
	bbsForm.submit();
}