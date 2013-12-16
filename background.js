localStorage["year"] = 2013;
localStorage["month"] = 11;
localStorage["day"] = 17;
localStorage["hour"] = 12;
localStorage["minute"] = 00;
localStorage["second"] = 00;
function CookieManager(){ 
	var tempCookies = [];
	this.isComplete = false;
	var _this = this;
	function getCookies(filter){
		tempCookies = [];
		chrome.cookies.getAll({}, function(cookies) {
			for (var i in cookies) {
				if(cookies[i].domain.indexOf(filter) != -1){
					tempCookies.push(cookies[i]);
				}
			}
			_this.isComplete = true;
		})
		
		console.log(tempCookies);
	}
	
	function getURL(cookie){
		return "http" + (cookie.secure ? "s" : "") + "://" + cookie.domain +
					cookie.path;
	}
	function removeCookies(){
		console.log("enter removeCookies method");
		tempCookies.forEach(function(cookie){
			var url = getURL(cookie);
			chrome.cookies.remove({"url": url, "name": cookie.name});
		});
		console.log("out removeCookies method");
	}
	function restoreCookies(){
		tempCookies.forEach(function(cookie){
			var url = getURL(cookie);
			cookie.url = url;
			delete cookie.hostOnly;
			delete cookie.session;
			chrome.cookies.set(cookie);
		});
	}
	function checkReady(){
		while(!this.isComplete){
			console.log("wait complete");
		}
	}
	this.removeCookies = removeCookies;
	this.restoreCookies = restoreCookies;
	this.getCookies = getCookies;
	this.checkReady = checkReady;
}

function readConfig(){
	var year = localStorage["year"];
	var month = localStorage["month"];
	var day = localStorage["day"];
	var hour = localStorage["hour"];
	var minute = localStorage["minute"];
	var second = localStorage["second"];
	buyingTime = new Date(year,month,day,hour,minute,second).getTime()
}

function getRealControl() {
	// buy phone start at 12:00:00
	var timestamp = new Date().getTime();
	// this url is for getting the real selection page
	var url = "http://tc.hd.xiaomi.com/hdget?callback=hdcontrol&_=" + timestamp;
	var xhr = new XMLHttpRequest();
	xhr.open("GET", url, false);
	xhr.send(null);
	console.log(xhr.responseText);
	return xhr.responseText;
}
function getHdcontrolObject(){
     var realControl = getRealControl();
     if (realControl) {
     var hdObject = JSON.parse(realControl.substring(10, realControl.length-1));
     if(hdObject){
         return hdObject;
     }
     return null;
     }
 }
 /**
  *get time seconds diff between server and local
  */
 function getServerLocalDiffTime(){
 
	 //cookieManager.checkReady();
	 //remove cookies temporarily
	 cookieManager.removeCookies();
     var startRequest = new Date().getTime();
     var config = getHdcontrolObject();
	 //restore cookies after request
	 cookieManager.restoreCookies();
     var endRequest = new Date().getTime();
     var requestTime =  parseInt((endRequest -startRequest)/1000);

     var diffTime = parseInt(parseInt(buyingTime/1000) - config.stime - requestTime);
     return diffTime;
 }
var cookieManager = new CookieManager();
chrome.runtime.onConnect.addListener(function(port) {
  console.assert(port.name == "backWork");
  port.onMessage.addListener(function(msg) {
	
	  if(msg.method === "readInitConfig"){
	 
		  cookieManager.getCookies("xiaomi");
		  window.setTimeout(function() {
							   port.postMessage({"buyingTime":buyingTime,"diffTime":getServerLocalDiffTime()});
						}, 2*1000);
				
	  }
  })
});

(function init(){
	readConfig();
})();
