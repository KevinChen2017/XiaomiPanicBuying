/**
 * this method is used for mention
 */
function createOrUpadateElement(str) {
	// create a new div element
	// and give it some content
	var my_body = document.getElementsByTagName("body");
	var div = document.getElementById("my_div");

	if (div) {
		if (div.childNodes[0].nodeValue !== str) {
			div.childNodes[0].nodeValue = str;
		}
	} else {
		div = document.createElement("div");
		var div_id = document.createAttribute("id");
		div_id.nodeValue = "my_div"
		var div_style = document.createAttribute("style");

		div_style.nodeValue = "position:absolute;top:250px;left:300px;background-color:white;z-index:99999;font: 30px/32px sans-serif;height:80px;color:red";
		div.setAttributeNode(div_id);
		div.setAttributeNode(div_style);

		var img = document.createElement("image");
		var img_src = document.createAttribute("src");
		img_src.nodeValue = chrome.extension.getURL("images/loading.gif");
		img.setAttributeNode(img_src);

		var newContent = document.createTextNode(str);

		div.appendChild(newContent); // add the text node to the newly
		// created
		// div.
		div.appendChild(img);
		// add the newly created element and its content into the DOM
		document.body.insertBefore(div, my_body);
	}

}

function getRealControl() {
	// buy phone start at 12:00:05
	var timestamp = new Date().getTime();
	// this url is for getting the real selection page
	var url = "http://tc.hd.xiaomi.com/hdget?callback=hdcontrol&_=" + timestamp;
	var xhr = new XMLHttpRequest();
	xhr.open("GET", url, false);
	xhr.send(null);
	console.log(xhr.responseText);
	return xhr.responseText;
}

// (function showLocalServerDiffTime() {
// // var realControl =
// "hdcontrol({'stime':1381821869,'status':{'allow':false,'miphone':{'hdstart':false,'hdstop':true,'hdurl':'mitv','duration':null,'pmstart':false},'mibox':{'hdstart':false,'hdstop':true,'hdurl':'','duration':null,'pmstart':false}}})";
// var realControl = getRealControl();
// if (realControl) {
// var config = eval(realControl.substring(9, realControl.length));
// var diffTime = parseInt(config.stime - parseInt(new Date().getTime()/1000));
// console.log(diffTime);
// }
// })();

var startTime = new Date().getTime();
var buyingTime = new Date(2013, 10, 19, 15, 0, 0).getTime();
var interval = 5000;
function buyPhone() {

	var nowTime = new Date().getTime();
	if (nowTime >= buyingTime) {
		if (nowTime - startTime >= interval) {
			createOrUpadateElement("小米助手正在拼命帮您抢购。。。。。。。。。。。");
			try {
				console.log("printing every 5 seconds!");
				eval(getRealControl());
				// var str =
				// "hdcontrol({'stime':1381821869,'status':{'allow':false,'miphone':{'hdstart':false,'hdstop':true,'hdurl':'mitv','duration':null,
				// 'pmstart':false},'mibox':{'hdstart':false,'hdstop':true,'hdurl':'','duration':null,'pmstart':false}}})";
				// eval(str);
			} catch (err) {
				console.log(err.message);
			}
			startTime = nowTime;
		}
	} else {
		createOrUpadateElement("不要着急，时间未到，(时间一到小米助手会自动帮您抢购)");
	}

}
timer = setInterval(buyPhone, 500);
// Util.showBox("phone");
