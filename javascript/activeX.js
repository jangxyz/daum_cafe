/*
UI Center ���Ѿ�, �����
version history
- 1.0
  ; object, embed �±׸� js�� ����
  ; ie�� ��� object �±׷�, �̿��� ��� embed �±׷� activex ����
- 1.1
  ; �������� ��� swf�� �Ķ���͸� ������ ��� flashvars�� src.swf?var=aaa�� �� ���� �� �� �ֵ��� ����.
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
		// ie���� ���������� activex�� flash�� ��츸 ����
		document.getElementById(div).innerHTML = html;
	}
}

// ���������� �������� activeX�� ������ ���ԵǴ� ��� �ϴܰ� ���� function�� ���� ���
function daumFlash_rank(src,width,height,div){	//ī��ž - �ǽð� �޵� ����ī��
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

function daumFlash_rank2(src,width,height,div){	//�����ī�� �˻� - �ǽð� �޵� ����ī��
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

function daumFlash_rank3(src,width,height,div){	//����ī�� �� - �ǽð� �޵� ����ī��
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

function daumFlash_rank4(src,width,height,div){	//�˻������ - �ǽð� �޵� ����ī��
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

function daumFlash_army(src,width,height,div){	//���� ž Ÿ��Ʋ
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

function daumFlash_cafestory(src,width,height,div){	//����ī�� �� - ī�� ���͸� ������
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

function daumMedia_cafe(src,width,height,div){	//����ī�� �� - ÷��
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
