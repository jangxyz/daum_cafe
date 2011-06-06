/* base function */
var UI = {};
UI.$=function(s) { return document.getElementById(s) };
UI.$N=function(n) { return document.getElementsByName(n)[0] };
UI.$F=function(n) {
	try
	{
		var s=null;
		s = UI.$(n)||document.getElementsByName(n)[0];
		if(s.type=="checkbox")
		{
			var c=[];
			var r=document.getElementsByName(n);
			for(var i=0;i<r.length; i++) if(r[i].checked) c.push(r[i].value);
			return (c.length>0)?c:"";
		}
		else if(s.type=="radio")
		{
			var r=document.getElementsByName(n);
			for(var i=0;i<r.length; i++) if(r[i].checked) return r[i].value;
			return "";
		}
		return s.value;	
	}
	catch (e)
	{
		return false;
	}

};
var eventForm = function(name, method, action) {
		if(UI.$("eventFormDiv")==null) {
			var div = document.createElement("div");
			document.body.appendChild(div);
			div.id="eventFormDiv";
		}
		this.form = document.createElement("form");
		if(OBJ_FORM==null) {			
			UI.$("eventFormDiv").appendChild(this.form);		
			this.name = name;
			this.method = method;
			this.action = action;
			this.id = name;
			this.create();
		}
};

eventForm.prototype = {
	create:function() {
		this.form.setAttribute("name",this.name);
		this.form.setAttribute("method",this.method);
		this.form.setAttribute("action",this.action);		
		this.form.setAttribute("id",this.id);		
		this.form.style.display = "none";
	},	
	submit:function() {
		if(sFormTarget!="" && sFormTarget!=null) {
			var _submitWindow = window.open("",sFormTarget,"width=1050,height=750,status=1,toolbar=no,menubar=no,scrollbars=yes,resizable=yes")
			_submitWindow.focus();
			this.form.setAttribute("target",sFormTarget);
		}		
		this.form.submit();
	},
	addInput:function(type, name, value) {
		if(value) {
			var _o = document.createElement("input");
			_o.setAttribute("type", type);
			_o.setAttribute("name", name);
			_o.setAttribute("value", value);
			this.form.appendChild(_o);
		}
	}
};

/* user function */
var sFormName = "eventForm";
var sFormMethod = "POST";
var sFormAction = "http://application.event.daum.net/event/application/userInfoConsent.daum";
var sFormTarget = "submitWindow";
var OBJ_FORM = null;
var EVENT_ID = "";

function sendApplication(id, key, checkUrl, retUrl , errmsg, val1, val2, val3, val4, val5, val6, val7, val8, val9, val10) {	
	var vals = new Array;
	for(var i=1 ; i<11 ; i++) {
		tempFormVal = UI.$F(eval("val"+i));
		tempVal = eval("val"+i);
		tempObjType = typeof(UI.$N(tempVal));
		if(tempObjType=="object") {
			if (tempFormVal.length>0) {
				vals.push(tempFormVal);
			} else {
				if (errmsg.length <= 0) {
					errmsg = "Please input your answer.";
				}
				alert(errmsg);
				return false;
			}
		} else if (tempVal!=undefined) {
			vals.push(tempVal);
		}
	}
	if(EVENT_ID!=id) {
		if(UI.$("eventFormDiv")!=null) {
			UI.$("eventFormDiv").innerHTML = "";
			OBJ_FORM = null;
		}
		OBJ_FORM = new eventForm(sFormName, sFormMethod, sFormAction);	
		OBJ_FORM.addInput("hidden", "event_id", id); 	
		OBJ_FORM.addInput("hidden", "event_key", key);
		OBJ_FORM.addInput("hidden", "check_url", checkUrl);		
		OBJ_FORM.addInput("hidden", "ret_url", retUrl);		
		for(i in vals) {
			OBJ_FORM.addInput("hidden", "event_data_"+(parseInt(i)+1), vals[i]);
		}	
	}
	EVENT_ID=id;
	if(OBJ_FORM.name==sFormName) {
		OBJ_FORM.submit();
	}
};
