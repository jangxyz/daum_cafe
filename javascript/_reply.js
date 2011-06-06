ReplyEditor = {};

/**
 * ����� ����/����/����, ������ �ʱ�ȭ ����� ������ Ŭ����
 * @Singleton
 */
Reply = {
	lastHideList: [],
	HIGHLIGHT_COLOR: "ffff99",
	init: function(dataId) {
		// DWR ���ǥ�� ���̾� �ʱ�ȭ
		daum.Event.addEvent(window, "load", function() {
			DWRErrorController.install();
			DWRConnectionController.install();
		});
		// CAFEAPP ������ �Ľ�
		this.parseFormData(dataId);
		// ��ۿ� ������ �ʱ�ȭ
		if (!ReplyEditor[dataId]) {
			ReplyEditor[dataId] = {};
			ReplyEditor[dataId].head = new Memo.Editor("replyWrite-"+dataId, {mode:"reply", onsubmit:Reply.submit, dataId:dataId});
			ReplyEditor[dataId].tail = new Memo.Editor("_cmt_reply_editor-"+dataId, {mode:"reply", dataId:dataId, hiddenForm:true});
		}
		this.setEditorStatus(dataId, null, ReplyEditor[dataId].head);
		this.setEditorStatus(dataId, null, ReplyEditor[dataId].tail);
	},
	parseFormData: function(dataId) {
		var $commentData = Sizzle("input", daum.$("commentData-" + dataId));
		var data = {};
		for (var i = 0, len = $commentData.length; i < len; i++) {
			data[$commentData[i].name] = $commentData[i].value;
		}
		
		if (!CAFEAPP.longtail) CAFEAPP.longtail = {};
		CAFEAPP.longtail[dataId] = {
			POLL_URI : data.POLL_URI,
			POLL_active : data.POLL_active,
			CONTENTVAL : data.CONTENTVAL,
			DATAID : data.DATAID,
			COMMENT_FLOODED : data.COMMENT_FLOODED == "true",
			ESPAM : data.ESPAM,
			CPAGE : data.CPAGE || 1,
			PAGE_COUNT : data.PAGE_COUNT || 1,
			F_CDEPTH : data.F_CDEPTH,
			L_CDEPTH : data.L_CDEPTH,
			N_CDEPTH : data.N_CDEPTH,
			RECENT_MYFLDDATASEQ : data.RECENT_MYFLDDATASEQ,
			OPENED_SEQ : data.OPENED_SEQ,
			HAS_PERMISSION: data.HAS_PERMISSION == "true",
			IS_OPEN: data.CMTTYPE == "nonemember"
		};
		CAFEAPP.longtail.CMTTYPE 				= data.CMTTYPE;
		CAFEAPP.longtail.FOLDER_cmtTexticonyn 	= data.FOLDER_cmtTexticonyn == "true";
		CAFEAPP.longtail.IS_POLL_BOARD			= data.IS_POLL_BOARD == "true";
		CAFEAPP.longtail.IS_BBS_SEARCH_READ		= data.IS_BBS_SEARCH_READ == "true";
		CAFEAPP.longtail.IS_IMSI				= data.IS_IMSI == "true";
		CAFEAPP.longtail.IS_QABOARD				= data.IS_QABOARD == "true";
	},
	getList: function(dataId, targetPage, cdepth, isMovedPage) {
		if (CAFEAPP.longtail[dataId].CPAGE != targetPage || CAFEAPP.longtail[dataId].PAGE_COUNT == targetPage) {
			if (!cdepth) {
				if (CAFEAPP.longtail.IS_POLL_BOARD) {
					if (targetPage == "N") {
						cdepth = CAFEAPP.longtail[dataId].L_CDEPTH;
					} else if (targetPage == "P") {
						cdepth = CAFEAPP.longtail[dataId].F_CDEPTH;
					}
				} else {
					if (CAFEAPP.longtail[dataId].CPAGE < targetPage) {
						cdepth = CAFEAPP.longtail[dataId].L_CDEPTH;
					} else {
						cdepth = CAFEAPP.longtail[dataId].F_CDEPTH;
					}
				}
			}
			
			ShortComment.getList(
				CAFEAPP.FLDID,
				dataId,
				CAFEAPP.longtail[dataId].CPAGE,
				targetPage || null,
				cdepth,
				null,
				CAFEAPP.longtail[dataId].IS_OPEN,
				CAFEAPP.longtail.IS_IMSI,
				false,
				this.getResultList.bind(this, dataId, targetPage, isMovedPage)
			);
		} else {
			// ���� �������� ȣ���� ��� ������ ���������� cdepth �� �����´�.
			ShortComment.getList(
				CAFEAPP.FLDID,
				dataId,
				CAFEAPP.longtail[dataId].CPAGE,
				null,
				null,
				null,
				CAFEAPP.longtail[dataId].IS_OPEN,
				CAFEAPP.longtail.IS_IMSI,
				false,
				function(dataId, targetPage, result) {
					try {
						var cdepth_match = result.match(/name="F_CDEPTH"(.*)value="(.*)"/gi);
						if (!cdepth_match) return;
						var cdepth = cdepth_match[0].replace(/(.*)value="(.*)"/gi, "$2");
						CAFEAPP.longtail[dataId].CPAGE = CAFEAPP.longtail[dataId].PAGE_COUNT;
						this.getList(dataId, targetPage, cdepth);
					} catch(e) { }
				}.bind(this, dataId, targetPage)
			);
		}
		Reply.PV.sendData(dataId, { cpage: CAFEAPP.longtail[dataId].CPAGE });
	},
	getResultList: function(dataId, targetPage, isMovedPage, result) {
		if (!result || typeof result === "undefined") return;
			
		var commentPagingDiv = daum.$("commentPagingDiv-"+dataId);
		commentPagingDiv.innerHTML = result;
		
		if(isMovedPage){
			var content = daum.$("primaryContent");
			if (content){
				var coords = daum.Element.getCoords(content);
				var windowSize = daum.Browser.getWindowSize();
				window.scrollTo(0,coords.bottom - windowSize.height);
			} else {
				window.scrollTo(0,10000); //����¡�� ����¡ ��ư�� �ִ� ȭ���� �� ������ ��ũ�� �̵�.
			}
		}
		
		this.parseFormData(dataId);
		CAFEAPP.longtail[dataId].CPAGE = targetPage;
		
		if ($("cmtCnt")) {
			$("cmtCnt").innerHTML = $("_cmt_count-"+dataId).value;
		} else if ($("cmtCnt-"+dataId)) {
			$("cmtCnt-"+dataId).innerHTML = $("_cmt_count-"+dataId).value;
		}
		if ($("cmtCnt_g")) {
			$("cmtCnt_g").innerHTML = $("_cmt_guest_count-"+dataId).value;
		}
		if (this.recentSeq) {
			var id = dataId + "-" + this.recentSeq;
			var $cmt = $("_cmt-" + id);
			$cmt && Memo.Util.highLightFadeOut($cmt, this.HIGHLIGHT_COLOR);
			this.recentSeq = null;
		}
	},
	submit: function() {
		var editor = this;
		var data = {
			fldid: CAFEAPP.FLDID,
			dataid: editor.dataId,
			comment: editor.$textarea.value,
			texticon: editor.isTexticon,
			hidden: editor.isHidden,
			imageURL: editor.imageUrl,
			imageName: editor.imageName,
			imageSize: editor.imageSize,
			parseq: editor.parseq || null,
			
			snsServiceNames : editor.getSelectedSnsNames(),
			snsPrefix : CAFEAPP.ui.sns.snsPrefix,
			snsLink : CAFEAPP.ui.sns.snsLink,
			snsMetatype : CAFEAPP.ui.sns.snsMetatype,
			snsMetakey : CAFEAPP.ui.sns.snsMetakey,
			snsImagepath : CAFEAPP.ui.sns.snsImagePath,
			snsCaption : CAFEAPP.ui.sns.snsCaption
		};
		ShortComment.write(data, CAFEAPP.longtail[editor.dataId].IS_OPEN, function(result){
			Reply.getResultWrite(editor, result);
			editor.resetSns();
		});
	},
	cancel: function(dataId) {
		if (!dataId)  dataId = this.dataId;	// dataId ��� ���� ��� ������ �ݹ����� ������ dataId ���
		if (!ReplyEditor[dataId].tail) return;
		ReplyEditor[dataId].tail.hide();
		Reply.recoverHideList();
		$commentArea = $("commentArea-"+dataId);
		$commentArea.appendChild(ReplyEditor[dataId].tail.$form);
	},
	getResultWrite: function(editor, result) {
		if (result && result != -1) {
			var editorTail = ReplyEditor[editor.dataId].tail;	// �ۼ����̴� ����/��� ������ ���� ����
			var $commentArea = daum.$E("commentDiv-" + editorTail.dataId);
			daum.$E(editorTail.$form).hide();
			$commentArea.appendChild(editorTail.$form);
			
			editor.clear();
			if (editor == editorTail) {		// ��ۿ� ��� ���
				Reply.getList(editor.dataId, CAFEAPP.longtail[editor.dataId].CPAGE);
			} else {		// �Ϲ� ���, �ֱ� ��� ��۷� �̵�
				Reply.getList(editor.dataId);
			}
			this.recentSeq = result;	// ���̶����� ��� ����
		}
	},
	goPage: function(index, dataId) {
		Reply.getList(dataId, index, undefined, true);
	},
	remove: function(dataId, seq, parseq) {
		if (!confirm("���� �����Ͻðڽ��ϱ�?")) return;
		var data = {
			fldid: CAFEAPP.FLDID,
			dataid: dataId,
			seq: seq
		};
		ShortComment.remove(data, CAFEAPP.longtail[dataId].IS_OPEN, this.getResultRemove.bind(this, dataId));
	},
	getResultRemove: function(dataId, result) {
		if (result) {
			Reply.getList(dataId, CAFEAPP.longtail[dataId].CPAGE);
		} else {
			alert("��� ������ �����Ͽ����ϴ�.");
		}
	},
	viewReplyForm: function(dataId, seq) {
		var editor = ReplyEditor[dataId].tail;
		if (!editor) return;
		var id = dataId + "-" + seq;
		var $reply = $("_cmt-" + id);
		var $reply_menu = $E("_cmt_button-" + id);
		
		$reply.appendChild(editor.$form);
		this.hideAll($reply_menu);
		
		editor.onsubmit = this.submit;
		editor.oncancel = this.cancel;
		editor.changeButtonType("reply");
		
		this.setTexticonView(editor);
		editor.$menuHidden.hide();
		editor.isHidden = false;
		editor.show();
		editor.parseq = seq;
		
		editor.showSns();
		this.setEditorStatus(dataId, null, editor)
	},
	viewModifyForm: function(dataId, seq) {
		if (!ReplyEditor[dataId].tail) return;
		var data = {
			fldid: CAFEAPP.FLDID,
			dataid: dataId,
			seq: seq
		};
		ShortComment.read(data, true, CAFEAPP.longtail[dataId].IS_OPEN, this.getResultRead.bind(this, dataId, seq));
	},
	getResultRead: function(dataId, seq, result) {
		var id = dataId + "-" + seq;
		var $cmt = $("_cmt-" + id);
		var $cmt_wrap = $("_cmt_wrapper-" + id);
		var $cmt_content = $("_cmt_contents-" + id);
		var $cmt_attach = Sizzle(".attach_preview", $cmt_wrap) || null;
		var editor = ReplyEditor[dataId].tail;
		
		this.hideAll($cmt_wrap, $("_cmt_button-"+id));
		$cmt.appendChild(ReplyEditor[dataId].tail.$form);
		
		this.setTexticonView(editor);
		editor.show();
		
		editor.onsubmit = this.modify;
		editor.oncancel = this.cancel;
		editor.changeButtonType("modify");
		
		editor.seq = result.seq;
		editor.parseq = result.parseq;
		if (result.parseq == 0) {
			editor.$menuHidden.show();
			editor.isHidden = result.hidden;
			editor.changeHiddenView(result.hidden);
		} else {
			editor.$menuHidden.hide();
		}
		editor.isTexticon = result.texticon;
		if (Memo.Layer.Setting) {
			Memo.Layer.Setting.setTexticonCheck(result.texticon);
		}
		editor.setComment(result.comment);
		
		var data = {};
		data.imageUrl = result.imageURL;
		data.imageName = result.imageName;
		data.imageSize = result.imageSize;
		data.imageUrl && editor.setPreviewImage(data);

		editor.hideSns();
		this.hideSnsBar(editor);
	},
	modify: function() {
		var editor = this;
		if (!ReplyEditor[editor.dataId].tail) return;
		var data = {
			fldid: CAFEAPP.FLDID,
			dataid: editor.dataId,
			comment: editor.$textarea.value,
			texticon: editor.isTexticon,
			hidden: editor.isHidden,
			imageURL: editor.imageUrl,
			imageName: editor.imageName,
			imageSize: editor.imageSize,
			seq: editor.seq || "",
			parseq: editor.parseq || "",
			
			snsServiceNames : editor.getSelectedSnsNames(),
			snsPrefix : CAFEAPP.ui.sns.snsPrefix,
			snsLink : CAFEAPP.ui.sns.snsLink,
			snsMetatype : CAFEAPP.ui.sns.snsMetatype,
			snsMetakey : CAFEAPP.ui.sns.snsMetakey,
			snsImagepath : CAFEAPP.ui.sns.snsImagePath,
			snsCaption : CAFEAPP.ui.sns.snsCaption
		};
		
		ShortComment.modify(data, CAFEAPP.longtail[editor.dataId].IS_OPEN, Reply.getResultModify.bind(Reply));
	},
	getResultModify: function(result) {
		if (result) {
			this.cancel(result.dataid);
			var id = result.dataid + "-" + result.seq;
			var $cmt = $("_cmt-" + id);
			var $cmt_wrap = daum.$E("_cmt_wrapper-" + id);
			var $cmt_button = daum.$E("_cmt_button-" + id);
			var inner = "";
			inner += "<span id=\"_cmt_contents-"+ id +"\" class=\"comment_contents\">";
			if (result.hidden) {
				inner += "<img src=\"http://i1.daumcdn.net/cafeimg/cf_img2/img_blank2.gif\" class=\"icon_lock2 vam\" height=\"11\" width=\"11\" alt=\"��д��\" /> "
			}
			inner += result.comment.replaceAll("\n","<br\>") +"</span>";
			if (result.imageURL) {
				$cmt_wrap.addClassName("attached_wrapper");
				var imageURL = result.imageURL.replace("/image/", "/P85x110/");
				var inner_attach = "<div class=\"longtail_attach_image\">";
				inner_attach += "<a href=\"#\" onclick=\"Memo.Util.showImage(this); return false;\" class=\"line_sub\"><span>Ȯ��</span>";
				inner_attach += "<img src=\""+ imageURL +"\" width=\"85\" height=\"110\" alt=\"\" /></a></div>";
				inner = inner_attach + inner;
			}else if (result.attachtype == "MD" || result.attachtype == "MY"){	
				$cmt_wrap.addClassName("attached_wrapper");
				var inner_attach = "<div class=\"longtail_attach_video\">";
				inner_attach += "<a onclick=\"Memo.Util.showVideo(this, '"+result.attachtype+"','"+result.attachkey+"'); return false;\" href=\"#\">";
				if( result.attachtype == "MD" ){
					inner_attach += "<img alt=\"÷�� �̹���\" src=\"http://flvs.daum.net/viewer/MovieThumb.do?postfix=.mini&vid=" + result.attachkey +"\" />";
				}else if( result.attachtype == "MY"){
					inner_attach += "<img alt=\"÷�� �̹���\" src=\"http://img.youtube.com/vi/"+result.attachkey +"/1.jpg\" />";					
				}
				inner_attach +=	"<p class=\"play_icon\">PLAY</p><span>Ȯ��</span></a></div>";
				inner = inner_attach + inner;
			}else {
				$cmt_wrap.removeClassName("attached_wrapper");
			}
			$cmt_wrap.innerHTML = inner;
			this.changeReplyButtonView($cmt_button, !result.hidden);
			Memo.Util.highLightFadeOut($cmt, this.HIGHLIGHT_COLOR);
		} else {
			alert("��� ������ �����Ͽ����ϴ�.");
		}
	},
	changeReplyButtonView: function($cmt_button, isShow) {
		if (!$cmt_button) return;
		var $replyButton = daum.$E(Sizzle(".cmt_button_reply", $cmt_button)[0]);
		if ($replyButton) {
			var $replyBar = Sizzle(".cmt_button_reply", $cmt_button).length > 1 && daum.$E(Sizzle(".cmt_button_reply", $cmt_button)[1]);
			if (isShow) {
				$replyButton.show("inline");
				$replyBar.show("inline");
			} else {
				$replyButton.hide();
				$replyBar.hide();
			}
		}
	},
	hideAll: function() {
		this.recoverHideList();
		for (var i=0,len=arguments.length; i<len; i++) {
			if (arguments[i]) {
				this.lastHideList.push(arguments[i]);
				$E(arguments[i]).hide();
			}
		}
	},
	recoverHideList: function() {
		for (var i=0,len=this.lastHideList.length; i<len; i++) {
			$E(this.lastHideList[i]).show();
		}
		this.lastHideList = [];
	},
	activeCommentView: function(dataId, type, $target) {
		var $member_cmt = $E("member_cmt");
		var $nonemember_cmt = $E("nonemember_cmt");
		var $commentArea = $E("commentArea-"+dataId);
		
		if (type == "member") {
			if (!CAFEAPP.longtail[dataId].IS_OPEN) {
				$commentArea.toggle();
				return;
			} else {
				$commentArea.show();
			}
			CAFEAPP.longtail[dataId].IS_OPEN = false;
			$member_cmt.className = "comment_on txt_point";
			$nonemember_cmt.className = "comment_off";
		} else if (type == "nonemember") {
			if (CAFEAPP.longtail[dataId].IS_OPEN) {
				$commentArea.toggle();
				return;
			} else {
				$commentArea.show();
			}
			CAFEAPP.longtail[dataId].IS_OPEN = true;
			$member_cmt.className = "comment_off";
			$nonemember_cmt.className = "comment_on txt_point";
		}
		this.getList(dataId);
		this.setEditorStatus(dataId, type, ReplyEditor[dataId].head);
		this.setEditorStatus(dataId, type, ReplyEditor[dataId].tail);
	},
	activeCommentTemplate: function(dataId) {		// ��ۿ��� ���� �ε� (QnA�Խ���)
		var $commentAreaWrap = $E("commentAreaWrap-"+dataId);
		var $commentArea = $E("commentArea-"+dataId);
		if (!$commentArea) {
			ShortComment.getList(CAFEAPP.FLDID, dataId, 0, null, null, null, false, false, true, function(result) {
				try{
					$commentAreaWrap.innerHTML = result;
					$commentAreaWrap.show();
					delete(ReplyEditor[dataId]);
					Reply.init(dataId);
				}catch(e){
				}
				
				setTimeout(applySnsAllows, 500);
			});
		} else {
			$commentAreaWrap.toggle();
		}
	},
	setEditorStatus: function(dataId, cmtType, editor) {
		var editor = editor || ReplyEditor[dataId].head;
		var cmtType = cmtType || CAFEAPP.longtail.CMTTYPE;
		var isCommentExist = false;
		
		this.updateSnsVisible(editor, dataId);
		
		if (CAFEAPP.longtail[dataId].COMMENT_FLOODED) {
			editor.disable(Memo.Message.COMMENT_FLOODED);
			return;
		}
		if (!CAFEAPP.CAFE_ENCRYPT_LOGIN_USERID) {
			editor.disable(Memo.Message.NOT_LOGIN);
			daum.Event.addEvent(editor.$textarea, "click", this.openLoginWindow);
			return;
		}
		if (CAFEAPP.IS_NO_AUTH_SIMPLEID) {
			editor.disable(Memo.Message.NO_AUTH_SIMPLEID);
			daum.Event.addEvent(editor.$textarea, "click", this.openSimpleLoginWindow);
			return;
		}
		if (cmtType == "member") {
			editor.$menuPhoto && editor.$menuPhoto.show();
			editor.$menuHidden && editor.$menuHidden.show();
			
			if (!CAFEAPP.longtail[dataId].HAS_PERMISSION) {
				editor.disable(Memo.Message.DENY_PERMISSION);
				return;
			}
			isCommentExist = $("_cmt_count-"+dataId).value > 0;
		} else if (cmtType == "nonemember") {
			editor.$menuPhoto && editor.$menuPhoto.hide();
			editor.$menuHidden && editor.$menuHidden.hide();
			
			isCommentExist = $("_cmt_guest_count-"+dataId).value > 0;
		} else {
			editor.disable(Memo.Message.DENY_ACCESS);
			return;
		}
		
		this.updateSnsVisible(editor, dataId);
		
		editor.enable();
		
		this.setTexticonView(editor);
		if (!isCommentExist) {
			editor.setComment(Memo.Message.NO_COMMENTS);
		}
	},
	
	
	updateSnsVisible: function(editor, dataId){
		var isVisibleGuestCmt = false;
		if(daum.$("nonemember_cmt")){
			isVisibleGuestCmt = daum.Element.hasClassName(daum.$("nonemember_cmt"), "comment_on");
		}
		
		if(isVisibleGuestCmt){
			if(daum.Element.visible(editor.$menuPhoto) || daum.Element.visible(editor.$menuHidden) || daum.Element.visible(editor.$menuSetting)){
				this.showSnsBar(editor);
			} else {
				this.hideSnsBar(editor);
			}
		} else {
			if(!CAFEAPP.CAFE_ENCRYPT_LOGIN_USERID || CAFEAPP.IS_NO_AUTH_SIMPLEID || !CAFEAPP.longtail[dataId].HAS_PERMISSION){
				this.hideSnsBar(editor);
			} else {
				this.showSnsBar(editor);
			}
		}
		editor.resetSns();
	},
	
	showSnsBar : function(editor){
		var elBars = daum.$$(".bar2", editor.$controls);
		for(var i = 0; i < elBars.length; i++){
			daum.Element.show(elBars[i]);
		}
	},
	hideSnsBar : function(editor){
		var elBars = daum.$$(".bar2", editor.$controls);
		for(var i = 0; i < elBars.length; i++){
			daum.Element.hide(elBars[i]);
		}
	},
	
	setTexticonView: function(editor) {
		var useTexticon = CAFEAPP.longtail.FOLDER_cmtTexticonyn;
		if (useTexticon) {
			editor.$menuSetting && editor.$menuSetting.show();
		} else {
			editor.$menuSetting && editor.$menuSetting.hide();
		}
	},
	openLoginWindow: function() {
		window.open('/_c21_/poplogin?grpid=' + CAFEAPP.GRPID, 'poplogin', 'width=450,height=300,resizable=no,scrollbars=no');
	},
	openSimpleLoginWindow: function() {
		if(window.confirm("������̵�� ȸ�� ���� �� ���ۼ��� �����մϴ�.\nȸ�� ���� �������� �̵��Ͻðڽ��ϱ�?")){
			window.open('/_c21_/poplogin?grpid=' + CAFEAPP.GRPID + '&checksimpleid=Y', 'poplogin', 'width=450,height=300,resizable=no,scrollbars=no');
		}
	}
};

/**
 * ��ü����/�ϰ�����/����ó�� ���� �����ڰ� �ϰ��� ó���ϴ� �κ��� ���
 * @Singleton
 */
Reply.Admin = {
	selectAll: function(dataId) {
		var oCheckbox = this.getCheckbox(dataId);
		var needCheck = oCheckbox.list.length != oCheckbox.checkCount;
		for (var i=0,len=oCheckbox.list.length; i<len; i++) {
			oCheckbox.list[i].checked = needCheck; 
		}
	},
	remove: function(dataId) {
		var oCheckbox = this.getCheckbox(dataId);
		if (oCheckbox.checkCount == 0) {
			alert("������ ����� ������ �ּ���.");
			return;
		}
		if (!confirm("���� ���� �Ͻðڽ��ϱ�?")) return;
		ShortComment.removeList(CAFEAPP.FLDID, dataId, oCheckbox.seqList, CAFEAPP.longtail[dataId].IS_OPEN, Reply.getList.bind(Reply, dataId, CAFEAPP.longtail[dataId].CPAGE));
	},
	setSpam: function(dataId) {
		var oCheckbox = this.getCheckbox(dataId);
		var checkCount = oCheckbox.checkCount;
		if (checkCount <= 0) {
			alert("����ó�� ����� �����ϼ���.");
			return;
		} else if(checkCount > 10) {
			alert("��� ���� �Ű�� �ѹ��� 10�Ǳ��� �����մϴ�.\n���ŷο�ô��� �ٽ� ���ּ���.");
			return;
		}
		if (!confirm("�ش� �� ������ ���ÿ� ȸ���� Ȱ�������Ǹ�, �մ��� ��쿡�� �ش�۸� �����˴ϴ�.")) return;
		ShortComment.removeListForSpam(CAFEAPP.FLDID, dataId, oCheckbox.seqList, CAFEAPP.longtail[dataId].IS_OPEN, Reply.getList.bind(Reply, dataId, CAFEAPP.longtail[dataId].CPAGE));
	},
	getCheckbox: function(dataId) {
		var checkboxs = Sizzle("#commentArea-" + dataId + " input:checkbox[NAME=sequence]");
		var seqList = [];
		var cnt = 0;
		for (var i=0,len=checkboxs.length; i<len; i++) {
			if (checkboxs[i].checked) {
				cnt++;
				seqList.push(checkboxs[i].value);
			}
		}
		return { list:checkboxs, checkCount:cnt, seqList:seqList };
	}
};

/**
 * ��� �񵿱�ó�� �� pv ���踦 ���� Ŭ����
 * @Singleton
 */
Reply.PV = {
	url: "http://cafe.daum.net/_cmtinfo.html",
	sendData: function(dataId, paramObj) {
		var $iframe = daum.$("cmtinfo");
		if (!$iframe) return;
		
		var params = "grpid=" + CAFEAPP.GRPID
			+ "&mgrpid=" + CAFEAPP.MGRPID
			+ "&fldid=" + CAFEAPP.FLDID
			+ "&contentval=" + CAFEAPP.longtail[dataId].CONTENTVAL
			+ "&datanum=" + dataId;
			
		for (var param in paramObj) {
			params += "&" + param + "=" + paramObj[param];
		}
		$iframe.src = this.url + "?" + params;
	}
}