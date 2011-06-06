var form_widget_amount_slider_handle = 'http://i1.daumcdn.net/cafeimg/cf_img2/img_blank2.gif';
var slider_handle_image_obj = false;
var sliderObjectArray = new Array();
var slider_counter = 0;
var slideInProgress = false;
var handle_start_x;
var event_start_x;
var currentSliderIndex;

function form_widget_cancel_event(){
	return false;
}

function getImageSliderHeight(){
	if(!slider_handle_image_obj){
		slider_handle_image_obj = new Image();
		slider_handle_image_obj.src = form_widget_amount_slider_handle;
	}
	if(slider_handle_image_obj.width>0){
		return;
	}else{
		setTimeout('getImageSliderHeight()',50);
	}
}


function positionSliderImage(e,theIndex){
	if(!theIndex)theIndex = this.getAttribute('sliderIndex');
	var theValue = sliderObjectArray[theIndex]['formTarget'].value;
	if(!theValue.match(/^[0-9]*$/g))theValue=sliderObjectArray[theIndex]['min'] +'';
	if(theValue/1>sliderObjectArray[theIndex]['max'])theValue = sliderObjectArray[theIndex]['max'];
	if(theValue/1<sliderObjectArray[theIndex]['min'])theValue = sliderObjectArray[theIndex]['min'];
	sliderObjectArray[theIndex]['formTarget'].value = theValue;
	var handleImg = document.getElementById('slider_handle' + theIndex);
	var ratio = sliderObjectArray[theIndex]['width'] / (sliderObjectArray[theIndex]['max']-sliderObjectArray[theIndex]['min']);
	var currentValue = sliderObjectArray[theIndex]['formTarget'].value-sliderObjectArray[theIndex]['min'];
	handleImg.style.left = Math.round(currentValue * ratio) + 'px';
}



function adjustFormValue(theIndex){
	var handleImg = document.getElementById('slider_handle' + theIndex);
	var ratio = sliderObjectArray[theIndex]['width'] / (sliderObjectArray[theIndex]['max']-sliderObjectArray[theIndex]['min']);
	var currentPos = handleImg.style.left.replace('px','');
	sliderObjectArray[theIndex]['formTarget'].value = Math.round(currentPos / ratio) + sliderObjectArray[theIndex]['min'];
}

function initMoveSlider(e){
	if(document.all)e = event;
	slideInProgress = true;
	event_start_x = e.clientX;
	handle_start_x = this.style.left.replace('px','');
	currentSliderIndex = this.id.replace(/[^\d]/g,'');
	return false;
}

function startMoveSlider(e){
	if(document.all)e = event;
	if(!slideInProgress)return;
	var leftPos = handle_start_x/1 + e.clientX/1 - event_start_x;
	if(leftPos<0)leftPos = 0;
	if(leftPos/1>sliderObjectArray[currentSliderIndex]['width'])leftPos = sliderObjectArray[currentSliderIndex]['width'];
	document.getElementById('slider_handle' + currentSliderIndex).style.left = leftPos + 'px';
	document.getElementById('slider_slider1').style.width = leftPos + 'px';

	adjustFormValue(currentSliderIndex);
	if(sliderObjectArray[currentSliderIndex]['onchangeAction']){
		eval(sliderObjectArray[currentSliderIndex]['onchangeAction']);
	}
}

function stopMoveSlider(){
	slideInProgress = false;
}

function form_widget_amount_slider(targetElId,formTarget,width,min,max,onchangeAction,sliderHandleWidth,sliderHeight){	
	if(!slider_handle_image_obj){
		getImageSliderHeight();
	}

	slider_counter = slider_counter +1;
	sliderObjectArray[slider_counter] = new Array();
	sliderObjectArray[slider_counter] = {"width":width - sliderHandleWidth,"min":min,"max":max,"formTarget":formTarget,"onchangeAction":onchangeAction};

	formTarget.setAttribute('sliderIndex',slider_counter);
	formTarget.onchange = positionSliderImage;

	var handleImg = document.createElement('IMG');
	handleImg.style.position = 'absolute';
	handleImg.style.left = '0px';
	handleImg.style.top = '0px';
	handleImg.style.zIndex = 5;
	handleImg.src = slider_handle_image_obj.src;
	handleImg.id = 'slider_handle' + slider_counter;
	handleImg.className = "icon_bgmcontrol hand";
	handleImg.onmousedown = initMoveSlider;

	document.getElementById(targetElId).style.width = document.getElementById('slider_slider1').offsetWidth + 'px';

	if(document.body.onmouseup){
		if(document.body.onmouseup.toString().indexOf('stopMoveSlider')==-1){
			//alert('You allready have an onmouseup event assigned to the body tag');
		}
	}else{
		document.body.onmouseup = stopMoveSlider;
		document.body.onmousemove = startMoveSlider;
	}
	handleImg.ondragstart = form_widget_cancel_event;
	document.getElementById(targetElId).appendChild(handleImg);
	positionSliderImage(false,slider_counter);
}



	var bgmOn = true;
	var nowPlayMusic =0;
	var repeatSingleMusic =false;
	var repeatType;
	function getRepeatType(){
		return repeatType;
	}
	function setRepeat(){
		if(_ISBGMRANDOM){
			top.bgm_hdn.CafeBGMCtrl.PlayRepeat(3);
			repeatType=3;
		}else{
			top.bgm_hdn.CafeBGMCtrl.PlayRepeat(2);
			repeatType=2;
		}
	}
	function setNowPlayMusic(musicIdx){
		nowPlayMusic = musicIdx;
		top.bgm_hdn.setNowPlayMusic(musicIdx);
	}
	function setNowPlayMusicForTop(musicIdx){
		nowPlayMusic = musicIdx;
	}

	function getNowPlayMusic(){
		return top.bgm_hdn.getNowPlayMusic();
	}

	function isRepeatSingleMusic(){
		return repeatSingleMusic;
	}
	function onMPrepeatOneMusic(musicIdx){
		if(musicIdx==0){
			repeatSingleMusic=false;
			setRepeat();
		}else{
			repeatType=1;
			top.bgm_hdn.CafeBGMCtrl.PlayGoto(musicIdx);
			top.bgm_hdn.CafeBGMCtrl.PlayRepeat(1);
			repeatSingleMusic=true;
		}
	}
	function onMPGoTo(musicIdx){
		repeatSingleMusic=false;
		setRepeat();
		top.bgm_hdn.CafeBGMCtrl.PlayGoto(musicIdx);
	}
	function onMPPrev(){
		try{
			top.bgm_hdn.CafeBGMCtrl.PlayPrev();
			top.bgm_hdn.CAFEBGMSTAT = top.bgm_hdn.playCode;
		} catch ( e ){

		}
	}

	function onMPNext(){
		try{
			top.bgm_hdn.CafeBGMCtrl.PlayNext();
			top.bgm_hdn.CAFEBGMSTAT = top.bgm_hdn.playCode;
		} catch ( e ){}
	}


	var LastPlayState_STOP = 0;
	var LastPlayState_PLAY = 1;

	function switchPlayAndStop() {
		try{
			if (top.bgm_hdn.CAFEBGMSTAT == top.bgm_hdn.playCode) {
				top.bgm_hdn.CafeBGMCtrl.LastPlayState = LastPlayState_STOP;
				onMPStop();
			}
			else {
				top.bgm_hdn.CafeBGMCtrl.LastPlayState = LastPlayState_PLAY;
				onMPPlay();	
			}
		} catch ( e ){}

	}
	function getPlayList(){

		top.bgm_hdn.CafeBGMCtrl.Stop();
		top.bgm_hdn.CafeBGMCtrl.GetPlayList(_ENC_CAFE_BGM_ARG);

		setRepeat();
		onMPPlay();

	}
	
	function onMPPlay(){
		try {
			top.bgm_hdn.CAFEBGMSTAT = top.bgm_hdn.playCode;
			top.bgm_hdn.OMplay();
		} catch ( e ){}
		if (hasBGMModule()) {
			syncBGMImg();
		}
	}

	function onMPStop(){
		try{
			top.bgm_hdn.CafeBGMCtrl.Stop();
			top.bgm_hdn.CAFEBGMSTAT = top.bgm_hdn.stopCode;
		} catch ( e ){}
		if (hasBGMModule()) {
			syncBGMImg();
		}
	}

	function onViewPlayList(){
		popup("/_c21_/bgm_play_list?grpid="+_GRPID,"playlist",550,450, 'resizable=no,scrollbars=no');
	}

	function changeTitle(lTitle, lArtist){
		try {
			if (hasBGMModule()){
				if (lTitle != "") {
					document.getElementById('bgmTitle').innerHTML = "<marquee direction=\"left\" behavior=\"scroll\" scrollamount=\"10\" scrolldelay=\"400\">" + lTitle + ' - ' + lArtist + "</marquee>";
				}
			}

		} catch(e) {}
	}


	function loading() {
		try{
		document.getElementById('bgmTitle').innerHTML = "<marquee direction=\"left\" behavior=\"scroll\" scrollamount=\"10\" scrolldelay=\"400\">음악을 들으시려면 ▶ 버튼을 눌러주세요</marquee>";
		}catch(e){}
	}

	function hasBGMModule() {
		try {
			top.bgm_hdn.checkBGMModule();
			if ( typeof( top.bgm_hdn.hasBGMModule ) != "undefined" ){
				return top.bgm_hdn.hasBGMModule;
			}else {
				return true;
			}
		} catch ( e ){ return false; }
	}

	function syncBgmStatus() {
		var title = top.bgm_hdn.curTitle;
		var artist = top.bgm_hdn.curArtist;

		changeTitle(title, artist);
		if (hasBGMModule()) {
			syncBGMImg();
		}
	}

	function syncBGMImg() {
		changPlayBtm();
	}

	function changPlayBtm() {
		if (top.bgm_hdn.CAFEBGMSTAT  == top.bgm_hdn.playCode) { // play
			document.getElementById('bgm_playbtn').className = "btn_bgm_stop hand";
			document.bgm_playbtn.alt = "정지";
		}
		else { // stopped
			document.getElementById('bgm_playbtn').className = "btn_bgm_play hand";
			document.bgm_playbtn.alt = "재생";
		}
	}


	function controlShuffle(){
		top.bgm_hdn.shuffle();
	}

	function caseHasBGMModule() {
		var bgmTag="";
		bgmTag += "<div id='bgmTitle'><marquee class='bgm_marquee' scrollamount='10' scrolldelay='400'></marquee></div>";
		bgmTag += "<div class='bgm_control'>";
		bgmTag += " <img src='http://i1.daumcdn.net/cafeimg/cf_img2/img_blank2.gif' onclick='onMPPrev()' width='11' height='11' alt='이전 곡' class='btn_bgm_back hand' /><img src='http://i1.daumcdn.net/cafeimg/cf_img2/img_blank2.gif' width='11' height='11' class='btn_bgm_play hand' id='bgm_playbtn' name='bgm_playbtn' onclick='switchPlayAndStop();' alt='' /><img class='btn_bgm_next hand' onclick='onMPNext();' height='11' alt='다음 곡' src='http://i1.daumcdn.net/cafeimg/cf_img2/img_blank2.gif' width='11' /><br />";
		bgmTag += "</div>";
		bgmTag += "<div class='bgm_vol_control'>";
		bgmTag += "	<div class='bgm_volumebg'>";
		bgmTag += "		<div id='slider_target'>";
		bgmTag += "			<div class='bgm_volume' id='slider_slider1'></div>";		
		bgmTag += "		</div>";
		bgmTag += " </div>";			
		bgmTag += "<img src='http://i1.daumcdn.net/cafeimg/cf_img2/img_blank2.gif' width='22' height='11' alt='list' class='btn_bgm_list hand' onclick='onViewPlayList()' />";
		bgmTag += "</div>";		
		document.getElementById("bgmBox").innerHTML = bgmTag;
		form_widget_amount_slider('slider_target',document.formBGM1.vol,40,0,100,"setVolume()",5,11);
		initVolume(top.bgm_hdn.getVolume());
		//현재 플레이 중이면 버큰 모양을 바꾼다.
		if(top.bgm_hdn.isPlaying()){
			changPlayBtm();
		}
	}

	function caseHasNotBGMModule() {
		if (navigator.userAgent.indexOf("MSIE") != -1) {  
			document.getElementById('bgmBox').innerHTML = "<span class=\"fr p11\">배경음악 플레이어를 설치해 주세요. <a href=\"http://i1.daumcdn.net/cafeimg/bgm12/Install_DaumBGMPlayer.exe\" class=\"txt_point\" title=\"수동설치\">설치</a></span>";
		} else {
			//document.getElementById('bgmBox').innerHTML = "";
		}
	}
	function setVolume(){
		var formObj = document.formBGM1;
		var vol = formObj.vol.value.replace(/[^\d]/,'');
		top.bgm_hdn.changeVolume(vol);
	}
	function initVolume(value) {
		top.bgm_hdn.CafeBGMCtrl.SetVol(value);
		document.getElementById('slider_handle1').style.left = (40 * value/100) + 'px';
		window.setTimeout("initVolumeBg('"+value+"')",10);
	}
	function initVolumeBg(value) {
		document.getElementById('slider_slider1').style.width = (40 * value/100) + 'px';
	}