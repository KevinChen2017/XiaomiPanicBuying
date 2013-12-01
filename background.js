function CookieManager(){ 
	var tempCookies = [];
	function getCookies(filter){
		tempCookies = [];
		chrome.cookies.getAll({}, function(cookies) {
			console.log(cookies.length);
			for (var i in cookies) {
				console.log(cookies[i].domain);
				if(cookies[i].domain.indexOf(filter) != -1){
					tempCookies.push(cookies[i]);
				}
			}
		})
		console.log(tempCookies);
	}
	
	function getURL(cookie){
		return "http" + (cookie.secure ? "s" : "") + "://" + cookie.domain +
					cookie.path;
	}
	function removeCookies(){
		tempCookies.forEach(function(cookie){
			var url = getURL(cookie);
			chrome.cookies.remove({"url": url, "name": cookie.name});
		});
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
	this.removeCookies = removeCookies;
	this.restoreCookies = restoreCookies;
	this.getCookies = getCookies;
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
 var cookieManager = new CookieManager();
	 cookieManager.getCookies("xiaomi");
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

chrome.runtime.onConnect.addListener(function(port) {
  console.assert(port.name == "backWork");
  port.onMessage.addListener(function(msg) {
	  if(msg.method === "readInitConfig"){
			port.postMessage({"buyingTime":buyingTime,"diffTime":getServerLocalDiffTime()});
	  }
  })
});

(function init(){
	readConfig();
})();
