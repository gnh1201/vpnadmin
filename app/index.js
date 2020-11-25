var OldBrowser = (function(exports) {
	exports.getIEVersion = function() {
		var undef,
			v = 3,
			div = document.createElement('div'),
			all = div.getElementsByTagName('i');

		while (
			div.innerHTML = '<!--[if gt IE ' + (++v) + ']><i></i><![endif]-->',
			all[0]
		);

		return v > 4 ? v : undef;
	};

	exports.addScript = function(url, callback, test, ttl) {
		var _callback = function(el, ttl) {
			var result = test(el);
			if (typeof(result) !== "undefined") {
				callback(el);
			} else {
				setTimeout(function() {
					if (ttl > 0) {
						_callback(el, ttl - 1);
					} else {
						console.log("failed load " + url);
					}
				}, 1);
			}
		};

		var el = document.createElement("script");
		el.src = url;
		el.type = "text/javascript";
		el.charset = "utf-8";
		document.head.appendChild(el);

		if (typeof(test) === "function" && typeof(callback) === "function") {
			// Time-To-Live: default value is 30 seconds
			ttl = (typeof(ttl) == "number" ? ttl : 30000);
			el.onload = _callback(el, ttl);
		} else if (typeof(callback) === "function") {
			el.onload = callback(el);
		}

		return el;
	};

	exports.addStylesheet = function(url, callback) {
		var el = document.createElement("link");
		el.href = url;
		el.rel = "stylesheet";
		el.type = "text/css";
		el.media = "screen, projection";
		document.head.appendChild(el);
		if (typeof(callback) === "function") {
			el.onload = callback(el);
		}
		return el;
	};

	exports.setContent = function(content) {
		document.getElementById("app").innerHTML = content;
	};

	exports.start = function(callback) {
		var IEVersion = exports.getIEVersion();

		// load jQuery and cross browsing libraries
		if (IEVersion == 8) {
			exports.addScript("app/assets/css/jquery/webreflection-ie8-0.8.1.min.js");
		}
		exports.addScript("app/assets/js/html5shiv-printshiv-3.7.3.min.js");
		if (IEVersion < 9) {
			exports.addScript("app/assets/js/welsonjs-respond-1.4.2-modified.js");
			exports.addScript("app/assets/js/welsonjs-selectivizr-1.0.2-modified.js");
			exports.addScript("app/assets/js/excanvas-565afad.js");
			exports.addScript("app/assets/js/jquery-1.11.3.min.js", callback, function(el) {
				return window.jQuery;
			});
			exports.addScript("http://api.html5media.info/1.1.6/html5media.min.js");
		} else {
			exports.addScript("app/assets/js/jquery-3.5.1.min.js", callback, function(el) {
				return window.jQuery;
			});
		}
		exports.addScript("app/assets/js/jquery.html5-placeholder-shim-5a87f05.js");

		// load Modernizr (2.8.3)
		exports.addScript("app/assets/js/modernizr-2.8.3.min.js");

		// load jQuery UI (1.12.1)
		exports.addScript("app/assets/js/jquery-ui-1.21.1.min.js");

		// load jsRender (1.0.8)
		exports.addScript("app/assets/js/jsrender-1.0.8.min.js");
	};

	exports.reload = function() {
		window.location.reload();
	};

	exports.close = function() {
		exit(0);
	};
	
	return exports;
})({});

var CookieObject = function() {
	this.setCookie = function(key, value, expiredays) {
		var todayDate = new Date();
		todayDate.setDate(todayDate.getDate() + expiredays);
		document.cookie = key + "=" + escape(value) + "; path=/; expires=" + todayDate.toGMTString() + ";";
	};

	this.getCookie = function(key) {
		var result = null;
		var cookie = document.cookie.split(';');
		cookie.some(function (item) {
			item = item.replace(' ', '');
			var dic = item.split('=');
			if (key === dic[0]) {
				result = dic[1];
				return true;
			}
		});
		return result;
	};
};

var COOKIE = new CookieObject();

var apiUrl = "http://211.238.32.1";
var token = COOKIE.getCookie("token");
var userId = COOKIE.getCookie("userid");

var getUsers = function() {
	
};

OldBrowser.start(function() {
	if (!!token) {
		$.get("app/users.html", function(res) {
			OldBrowser.setContent(res);
			getUsers();
		});
	} else {
		$.get("app/login.html", function(res) {
			OldBrowser.setContent(res);

			document.getElementById("loginform").onsubmit = function(ev) {
				ev.preventDefault();
			};

			document.getElementById("btn_submit").onclick = function() {
				var credential = {
					"email": document.getElementById("txt_email").value,
					"password": document.getElementById("txt_password").value
				};
				
				var onSuccess = function(res) {
					if ("error" in res) {
						console.error(res.error.message);
					} else if ("data" in res) {
						COOKIE.setCookie("token", res.data.token, 30);
						COOKIE.setCookie("userid", res.data.user.id, 30);
						OldBrowser.reload();
					}
				};

				$.post(apiUrl + "/netsolid/auth/authenticate", credential, onSuccess);
			};
		});
	}
});
