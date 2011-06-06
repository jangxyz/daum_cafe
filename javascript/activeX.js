/*
UI Center 박한얼, 김희란
version history
- 1.0
  ; object, embed 태그를 js로 삽입
  ; ie의 경우 object 태그로, 이외의 경우 embed 태그로 activex 삽입
- 1.1
  ; 모질라의 경우 swf에 파라미터를 전달할 경우 flashvars를 src.swf?var=aaa로 값 전달 할 수 있도록 변경.
*/

document.domain='daum.net';

function swf_toUCC(_src,fw,fh,div){
	var html = ''
		+ '<object classid="clsid:d27cdb6e-ae6d-11cf-96b8-444553540000" codebase="http://fpdownload.macromedia.com/pub/shockwave/cabs/flash/swflash.cab#version=8,0,0,0"  width="'+fw+'" height="'+fh+'">\n'
		+ '<param name="allowScriptAccess" value="always" />'
		+ '<param name="movie" value="'+_src+'" />\n'
		+ '<param name="quality" value="high" />\n'
		+ '<param name="scale" value="exactfit" />\n'
		+ '<param name="wmode" value="transparent" />\n'
		+ '<embed src="'+_src+'" wmode="transparent" scale="exactfit" quality="high" width="'+fw+'" height="'+fh+'" allowScriptAccess="always" type="application/x-shockwave-flash" pluginspage="http://www.macromedia.com/go/getflashplayer" />\n'
		+ '</object>\n';
	document.getElementById(div).innerHTML = html;
}

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

// 한페이지에 한종류의 activeX가 복수개 삽입되는 경우 하단과 같이 function을 만들어서 사용
function daumFlash_rank(src,width,height,div){	//카페탑 - 실시간 급등 정보카페
	var obj = new Object();
	obj.type = 'application/x-shockwave-flash';
	obj.classid = 'clsid:d27cdb6e-ae6d-11cf-96b8-444553540000';
	obj.codebase = 'http://fpdownload.macromedia.com/pub/shockwave/cabs/flash/swflash.cab#version=8,0,0,0';
	obj.width = width;
	obj.height = height;

	var param = [		
		['movie','http://cafeimg.daum-img.net/swf/cafetop_ranking.swf'],
		['src','http://cafeimg.daum-img.net/swf/cafetop_ranking.swf'],
		['quality','high'],
		['wmode','transparent'],
		['bgcolor','#FFFFFF'],
		['FlashVars','txtURL=http://cafe.daum.net/_tms/realjump/REALJUMP_CAFE.txt']
	];
	obj.param = param;
	daumActiveX(obj,div);
}

function daumFlash_rank2(src,width,height,div){	//스페셜카페 검색 - 실시간 급등 정보카페
	var obj = new Object();
	obj.type = 'application/x-shockwave-flash';
	obj.classid = 'clsid:d27cdb6e-ae6d-11cf-96b8-444553540000';
	obj.codebase = 'http://fpdownload.macromedia.com/pub/shockwave/cabs/flash/swflash.cab#version=8,0,0,0';
	obj.width = width;
	obj.height = height;

	var param = [		
		['movie','http://cafeimg.daum-img.net/swf/cafespecial_ranking.swf'],
		['src','http://cafeimg.daum-img.net/swf/cafespecial_ranking.swf'],
		['quality','high'],
		['wmode','transparent'],
		['bgcolor','#FFFFFF'],
		['FlashVars','txtURL=http://cafe.daum.net/_tms/realjump/REALJUMP_CAFE.txt']
	];
	obj.param = param;
	daumActiveX(obj,div);
}

function daumFlash_rank3(src,width,height,div){	//개별카페 내 - 실시간 급등 정보카페
	var obj = new Object();
	obj.type = 'application/x-shockwave-flash';
	obj.classid = 'clsid:d27cdb6e-ae6d-11cf-96b8-444553540000';
	obj.codebase = 'http://fpdownload.macromedia.com/pub/shockwave/cabs/flash/swflash.cab#version=8,0,0,0';
	obj.width = width;
	obj.height = height;

	var param = [		
		['movie','http://cafeimg.daum-img.net/swf/cafes_ranking.swf'],
		['src','http://cafeimg.daum-img.net/swf/cafes_ranking.swf'],
		['quality','high'],
		['wmode','transparent'],
		['bgcolor','#FFFFFF'],
		['FlashVars','txtURL=http://cafe.daum.net/_tms/realjump/REALJUMP_CAFE.txt']
	];
	obj.param = param;
	daumActiveX(obj,div);
}

function daumFlash_rank4(src,width,height,div){	//검색스페셜 - 실시간 급등 정보카페
	var obj = new Object();
	obj.type = 'application/x-shockwave-flash';
	obj.classid = 'clsid:d27cdb6e-ae6d-11cf-96b8-444553540000';
	obj.codebase = 'http://fpdownload.macromedia.com/pub/shockwave/cabs/flash/swflash.cab#version=8,0,0,0';
	obj.width = width;
	obj.height = height;

	var param = [		
		['movie',src],
		['src',src],
		['quality','high'],
		['wmode','transparent'],	
		['FlashVars','txtURL=http://cafe.daum.net/_tms/realjump/REALJUMP_CAFE.txt']
	];
	obj.param = param;
	daumActiveX(obj,div);
}

function daumFlash_army(src,width,height,div){	//육본 탑 타이틀
	var obj = new Object();
	obj.type = 'application/x-shockwave-flash';
	obj.classid = 'clsid:d27cdb6e-ae6d-11cf-96b8-444553540000';
	obj.codebase = 'http://fpdownload.macromedia.com/pub/shockwave/cabs/flash/swflash.cab#version=8,0,0,0';
	obj.width = width;
	obj.height = height;

	var param = [		
		['movie','http://cafeimg.daum-img.net/top5/etc/army/top_flash.swf'],
		['src','http://cafeimg.daum-img.net/top5/etc/army/top_flash.swf'],
		['quality','high'],
		['wmode','transparent'],
		['bgcolor','#FFFFFF'],
	];
	obj.param = param;
	daumActiveX(obj,div);
}

function daumFlash_cafestory(src,width,height,div){	//개별카페 내 - 카페 멘터링 아이콘
	var obj = new Object();
	obj.type = 'application/x-shockwave-flash';
	obj.classid = 'clsid:d27cdb6e-ae6d-11cf-96b8-444553540000';
	obj.codebase = 'http://fpdownload.macromedia.com/pub/shockwave/cabs/flash/swflash.cab#version=7,0,0,0';
	obj.width = width;
	obj.height = height;

	var param = [		
		['movie','http://cafeimg.daum-img.net/event/060112_cafemovie/x.swf'],
		['src','http://cafeimg.daum-img.net/event/060112_cafemovie/x.swf'],
		['quality','high'],
		['wmode','transparent'],
		['bgcolor','#FFFFFF'],
	];
	obj.param = param;
	daumActiveX(obj,div);
}

function daumMedia_cafe(src,width,height,div){	//개별카페 내 - 첨부
	var obj = new Object();
	obj.type = 'application/x-oleobject';
	obj.classid = 'clsid:22d6f312-b0f6-11d0-94ab-0080c74c7e95';
	obj.codebase = 'http://activex.microsoft.com/activex/controls/mplayer/en/nsmp2inf.cab#version=5,1,52,701';
	obj.width = width;
	obj.height = height;

	var param = [		
		['filename',src],		
	];
	obj.param = param;
	daumActiveX(obj,div);
}

function daumFlash_general(src,width,height,div){
	var obj = new Object();
	obj.type = 'application/x-shockwave-flash';
	obj.classid = 'clsid:d27cdb6e-ae6d-11cf-96b8-444553540000';
	obj.codebase = 'http://fpdownload.macromedia.com/pub/shockwave/cabs/flash/swflash.cab#version=8,0,0,0';
	obj.wmode = 'transparent';
	obj.width = width;
	obj.height = height;

	var param = [
		['movie',src],
		['src',src],
		['wmode','transparent'],
		['quality','high'],
		['allowScriptAccess','always'],
		['bgcolor','#FFFFFF'],
		['pluginspage','http://www.macromedia.com/go/getflashplayer'],
	];

	obj.param = param;
	daumActiveX(obj,div);
}
