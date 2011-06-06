function autolayer_off(target){
    var layid = document.getElementById("layer01");
    layid.style.visibility= 'hidden';
}

function searchCafeonUser(nickname, callback){
    //nickname --> 한글2자 이상이어야함..
    if(calculate_msglen(trim(nickname)) >= 4){
        try {
        	cafeonManager.searchUser(nickname, callback, this);
            oldCafeOnKeyword = nickname;
        } catch (e) {}
    } else {
        alert("검색어는 최소 4byte 이상 입력하셔야 합니다.");
    }
}

function searchCafeonShowUser(data){
    if(data && data.length>0){
        document.getElementById("cafeOnUserList").style.display="none";
        document.getElementById("msgNoResult").style.display="none";    
        document.getElementById("cafeOnUserListBySearch").style.display="";
        document.getElementById("btnCafeOnSearch").className="btn_search_all";
        document.getElementById("btnCafeOnSearch").title="목록";
    
        var userid = CAFEAPP.CAFE_ENCRYPT_LOGIN_USERID; //"$!{CAFE_ENCRYPT_LOGIN_USERID}";
        var innerHTML = "";
        for(var i = 0; i < data.length; i++){
            if(data[i].userid != userid){
                var nickName = data[i].nickname.replace(oldCafeOnKeyword, "<span class='skinTxt'>" + oldCafeOnKeyword + "</span>");
                innerHTML +="<li class=\"hand\" onmouseout=\"autolayer_off(this);\" onclick=\"autolayer_on(this,'"+data[i].profileid+"','"+data[i].userid+"','','"+ data[i].nickname+"','"+ data[i].rolecode+"');\" id=\""+data[i].userid+"\">";
                
                if(data[i].rolecode=="31"){
                    innerHTML += "<img height=\"13\" width=\"13\" class=\"imgR\" alt=\"\" src=\"http://i1.daumcdn.net/cafeimg/cf_img2/bbs2/_level_"+data[i].rolecode+".gif\"/><span ondblclick=\"goP2pChat('"+data[i].nickname+"','"+data[i].userid+"')\">"+nickName+"</span></li>";
                }else{
                    innerHTML += "<img height=\"13\" width=\"13\" class=\"imgR\" alt=\"\" src=\"http://i1.daumcdn.net/cafeimg/cf_img2/bbs2/"+roleicontype+"_level_"+data[i].rolecode+".gif\"/><span ondblclick=\"goP2pChat('"+data[i].nickname+"','"+data[i].userid+"')\">"+nickName+"</span></li>";
                }
            }
        }
        document.getElementById("cafeOnUserListBySearch").innerHTML = innerHTML;
    } else {
        showNoResult();
    }
}

function searchCafeOn(obj){
    if(obj){
        if(obj.className=="btn_search_all"){
            resetCafeOnSearch();
        } else if(document.getElementById("cafeOnLoging").style.display!="none") {
            alert("로딩이 완료되지 않았습니다.");
        } else {
            searchCafeonUser(document.getElementById('txtCafeOnSearch').value);     
        }
    }
}
function showNoResult(){
    document.getElementById("cafeOnUserListBySearch").style.display="none";
    document.getElementById("msgNoResult").style.display="";
    document.getElementById("cafeOnUserList").style.display="none";
    document.getElementById("btnCafeOnSearch").className="btn_search_all";
    document.getElementById("btnCafeOnSearch").title="목록";
}

function resetCafeOnSearch(){
    document.getElementById('btnCafeOnSearch').className = "btn_search";
    document.getElementById('btnCafeOnSearch').title = "검색";
    document.getElementById("cafeOnUserList").style.display="block";    
    document.getElementById("cafeOnUserListBySearch").style.display="none";
    document.getElementById("msgNoResult").style.display="none";
    document.getElementById("cafeOnUserListBySearch").innerHTML="";
    document.getElementById('txtCafeOnSearch').value = "";
    document.getElementById('txtCafeOnSearch').focus();
}

function readyCafeOnSearch(){
    document.getElementById("btnCafeOnSearch").className="btn_search";
    document.getElementById('btnCafeOnSearch').title = "검색";
}


var tmrCafeOnKeyword = null;
var oldCafeOnKeyword = "";
function watchCafeOnKeyword(){
    if (document.getElementById("cafeOnUserList").style.display == "none") {
        var cafeOnKeywordEl = document.getElementById("txtCafeOnSearch");
        if (cafeOnKeywordEl) {
            var cafeOnKeyword = cafeOnKeywordEl.value;
            if (cafeOnKeyword == "") {
                oldCafeOnKeyword = "";
                resetCafeOnSearch();
                clearInterval(tmrCafeOnKeyword);
            } else if (cafeOnKeyword != oldCafeOnKeyword) {
                readyCafeOnSearch();
            }
        }
    }
}

function onfocus_txtCafeOnSearch(obj){
    obj.className="inp_search";
}
function onblur_txtCafeOnSearch(obj){
    if(obj.value.replace(/\s/g, '') == ""){
        obj.className="blank inp_search";
    }
}

function CafeOnKeyEvent(evt){
    switch(evt.keyCode){
        case 13:
            if (document.getElementById('btnCafeOnSearch').className != "btn_search_all") {
                tmrCafeOnKeyword = setInterval('watchCafeOnKeyword();', 100);
                document.getElementById('btnCafeOnSearch').onclick();
            }
            break;
        case 27: 
            resetCafeOnSearch();
            break;
    }
}

function calculate_msglen(message){
    var nbytes = 0;
    for (i=0; i < message.length; i++) {
        var ch = message.charAt(i);
        if (escape(ch).length > 4) {
            nbytes += 2;
        } else if (ch != "\r") {
            nbytes++;
        }
    }
    return nbytes;
}