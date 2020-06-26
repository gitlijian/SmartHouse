(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory();
	else if(typeof define === 'function' && define.amd)
		define([], factory);
	else if(typeof exports === 'object')
		exports["wap2app"] = factory();
	else
		root["wap2app"] = factory();
})(this, function() {
return /******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	module.exports = __webpack_require__(1);


/***/ },
/* 1 */
/***/ function(module, exports, __webpack_require__) {

	var plusReady = __webpack_require__(2);
	var quit = __webpack_require__(3);
	var back = __webpack_require__(4);
	var gps = __webpack_require__(5);
	var shortcut = __webpack_require__(8);
	var sms = __webpack_require__(10);
	var share = __webpack_require__(11);
	var stack = __webpack_require__(12);
	var setting = __webpack_require__(7);

	var COST_WAP2APP_APP_ID = '__WAP2APP_APP_ID';
	var COST_WAP2APP_GPS_CHECK = '__WAP2APP_GPS_CHECK';
	var COST_WAP2APP_IS_FIRST = '__WAP2APP_IS_FIRST';

	var __a__ = document.createElement('a');
	var optionsConfig; //默认配置
	var headerConfig; //顶部导航栏配置
	var homeConfig; //wap首页webview配置
	var gpsConfig; //gps检查配置
	var smsConfig; //短信监听配置
	var webviewsConfig = {}; //多webview配置

	var appid;
	var overrideUrlLoading = false; //当前环境是否支持location.href拦截
	var isReady = false;
	var isFirstInit = true; //是否是第一次调用init
	var homeWebview; //wap首页webview
	var backBtnElem; //后退按钮
	var closeBtnElem; //关闭按钮
	var titleElem; //标题
	var isCloseSplashscreen = false; //是否已关闭splash
	var isBacking = false; //是否处于后退
	var isLoading = false; //是否处于loading
	var hasShortcut = false; //是否已创建快捷方式
	var isFirstInstall = true; //第一次安装
	var titleUpdateTimer;
	var isArray = Array.isArray ||
		function(object) {
			return object instanceof Array;
		};
	//退出回调
	var handleQuit = function() {};
	var oldQuit = quit;
	quit = function(msg) {
		if (!msg) {
			if (homeConfig.quit && typeof homeConfig.quit === 'object' && homeConfig.quit.msg) {
				msg = homeConfig.quit.msg;
			}
		}
		if (typeof homeConfig.quit === 'function') {
			homeConfig.quit(function(result) {
				if (result) {
					setTimeout(function() { //关闭所有非控制页
						var webviews = plus.webview.all();
						for (var i = 0, len = webviews.length; i < len; i++) {
							var _webview = webviews[i];
							if (_webview.id !== homeConfig.id && _webview.id !== plus.runtime.appid) {
								_webview.close('none');
							}
						}
					}, 20);
				}
			});
		} else {
			if (appid !== plus.runtime.appid && homeWebview) {
				oldQuit(msg, function() {
					homeWebview.close('auto');
					setTimeout(function() { //关闭所有非控制页
						var webviews = plus.webview.all();
						for (var i = 0, len = webviews.length; i < len; i++) {
							var _webview = webviews[i];
							if (_webview.id !== homeConfig.id && _webview.id !== plus.runtime.appid) {
								_webview.close('none');
							}
						}
					}, 20);
					typeof handleQuit === 'function' && handleQuit();
					return false;
				});
			} else {
				oldQuit(msg, handleQuit);
			}
		}
	};
	//初始化
	var init = function(config) {
		//重置所有状态
		homeWebview = null;
		backBtnElem = null;
		closeBtnElem = null;
		titleElem = null;
		isCloseSplashscreen = false; //是否已关闭splash
		isBacking = false; //是否处于后退
		isLoading = false; //是否处于loading
		homeConfig = false;

		var webview = plus.webview.currentWebview();

		overrideUrlLoading = typeof webview.overrideUrlLoading === 'function';

		if (webview.id !== plus.runtime.appid) { //如果不是入口页
			appid = plus.storage.getItem(COST_WAP2APP_APP_ID) || plus.runtime.appid;
		} else {
			appid = plus.runtime.appid;
			plus.storage.setItem(COST_WAP2APP_APP_ID, appid + '');
		}

		plus.screen.lockOrientation(config.lockOrientation || 'portrait-primary');

		optionsConfig = config.options || {};
		headerConfig = config.header || {};
		gpsConfig = config.gps;
		smsConfig = config.sms;
		webviewsConfig = config.webviews || [];

		initOptionsConfig();
		initWebviewsConfig(); //初始化webviews配置
		initHeader(); //初始化顶部
		initHome(); //初始化wap入口页webview
		initSms(); //初始化短信监听
		shortcut.create(); //前端创建快捷方式，兼容旧版本流应用
		if (isFirstInit && homeWebview.id !== appid) { //如果有控制页
			plus.key.addEventListener('backbutton', handleBack); //监听android后退按键	
		}
		isFirstInit = false;
		isReady = true;
		var readyCallback;
		while (readyCallback = readyCallbacks.pop()) {
			typeof readyCallback === 'function' && readyCallback();
		}
		setTimeout(function() {
			if (config.name) {
				hasShortcut = shortcut.hasShortcut(config.name);
			}
		}, 100);

		isFirstInstall = !plus.storage.getItem(COST_WAP2APP_IS_FIRST + '_' + appid);
		plus.storage.setItem(COST_WAP2APP_IS_FIRST + '_' + appid, 'TRUE');
		if (config.share) {
			setTimeout(function() {
				share.init();
			});
		}
	};

	//初始化顶部
	var initHeader = function() {
		if (headerConfig.backBtnSelector) { //如果配置了后退
			backBtnElem = document.querySelector(headerConfig.backBtnSelector);
			backBtnElem && backBtnElem.addEventListener('touchend', function() {
				handleBack();
			});
		}
		if (headerConfig.closeBtnSelector) { //如果配置了关闭
			closeBtnElem = document.querySelector(headerConfig.closeBtnSelector);
			closeBtnElem && closeBtnElem.addEventListener('touchend', function() {
				quit();
			});
		}
		if (headerConfig.titleSelector) {
			titleElem = document.querySelector(headerConfig.titleSelector);
		}
	};
	//初始化wap入口页webview
	var initHome = function(url) {
		for (var id in webviewsConfig) { //查找wap首页配置
			var config = webviewsConfig[id];
			if (config.quit) {
				homeConfig = config;
				homeConfig.styles = homeConfig.styles || {};
				homeConfig.styles.popGesture = 'none'; //处理首页的ios拖拽返回
				homeConfig.show = {
					aniShow: 'fade-in',
					duration: 300
				};
				break;
			}
		}
		var currentWebview = plus.webview.currentWebview();
		if (homeConfig && homeConfig.url) {
			homeWebview = plus.webview.getWebviewById(homeConfig.id);
			if (!homeWebview) {
				homeWebview = createWebview(homeConfig.url, homeConfig);
				if (homeWebview.id !== currentWebview.id) {
					currentWebview.append(homeWebview);
				}
				setTimeout(function() { //超时处理，如果超过2秒还没关闭splash，则直接执行
					if (!isCloseSplashscreen) {
						handleTitleUpdate('', homeWebview, homeConfig);
					}
				}, 2000);
			}
		} else {
			homeConfig.id = currentWebview.id;
			homeConfig.url = currentWebview.getURL();
			homeWebview = currentWebview;
			if (homeConfig.delay !== -1) {
				setTimeout(function() {
					homeWebview.show('fade-in', 300);
					plus.navigator.closeSplashscreen();
					plus.nativeUI.closeWaiting();
				}, homeConfig.delay || 300);
			}
			var injectConfig = { //注入的js需要的配置
				appid: appid,
				override: 'false',
				btns: homeConfig.btns,
				backbutton: homeConfig.backbutton,
				history: homeConfig.history,
				mode: homeConfig.mode || 'webview',
				prevent: homeConfig.prevent || {},
				injectStyle: homeConfig.injectStyle
			};
			injectWebviewJs(injectConfig);
			isCloseSplashscreen = true;
		}
	};
	//初始化webview全局配置
	var initOptionsConfig = function() {
		optionsConfig.history = optionsConfig.history || true;
		optionsConfig.show = optionsConfig.show || {
			aniShow: 'pop-in',
			duration: 300
		};
		if (optionsConfig.pullToRefresh !== false) {
			optionsConfig.pullToRefresh = simpleExtend({
				support: true, //是否启用下拉刷新
				height: "100px",
				range: "300px",
				contentdown: {
					caption: "下拉可以刷新"
				},
				contentover: {
					caption: "释放立即刷新"
				},
				contentrefresh: {
					caption: "正在刷新..."
				}
			}, optionsConfig.pullToRefresh);
		}
	};
	//初始化多窗口配置
	var initWebviewsConfig = function() {
		var i = 1;
		for (var id in webviewsConfig) { //赋值id
			var config = webviewsConfig[id];
			if (typeof config === 'string' || typeof config === 'function' || isArray(config) || config instanceof RegExp) { //pathname
				config = {
					pathname: config
				};
			}
			config.id = id;
			if (config.fake) {
				if (typeof config.fake === 'string') {
					(function(config) {
						setTimeout(function() {
							if (!plus.webview.getWebviewById(config.fake)) {
								plus.webview.create('_www/' + config.fake, config.fake);
							}
						}, 50 * (i++));
					})(config);
				}
			}
			webviewsConfig[id] = simpleExtend(optionsConfig, config); //merge
		}
	};

	//监听短信
	var initSms = function() {
		if (typeof smsConfig === 'function') {
			sms.register(function(msgs) {
				for (var i = 0, len = msgs.length; i < len; i++) {
					if (smsConfig(msgs[i].getDisplayMessageBody(), currentWebview())) {
						break;
					}
				}
			});
		}
	};

	//当前显示的webview
	var currentWebview = function() {
		return stack.last() || homeWebview;
	};
	var isWebviewLoading = false;
	//创建webview
	var createWebview = function(url, webviewConfig, opennerId) {
		var styles = webviewConfig.styles || {};
		styles.popGesture = styles.popGesture || 'close'; //解决iOS后退
		styles.hardwareAccelerated = styles.hardwareAccelerated || true; //默认硬件加速
		var injectConfig = { //注入的js需要的配置
			appid: appid,
			btns: webviewConfig.btns,
			backbutton: webviewConfig.backbutton,
			history: webviewConfig.history,
			mode: webviewConfig.mode || 'webview',
			prevent: webviewConfig.prevent || {},
			injectStyle: webviewConfig.injectStyle
		};
		var parentWebview = false;
		var parent = webviewConfig.parent;
		var fakeWebview = false;
		var fake = webviewConfig.fake;
		var show = webviewConfig.show;
		var id = webviewConfig.id || (url + '__wap2app_id_' + Math.random());
		if (fake) {
			if (typeof fake === 'string') {
				fakeWebview = plus.webview.getWebviewById(fake);
				if (!fakeWebview) {
					fakeWebview = plus.webview.create(fake, fake, null, {
						__wap2app_type: 'fake'
					});
					fakeWebview.addEventListener('titleUpdate', function() {
						fakeWebview.show(show.aniShow, show.duration);
					});
				} else {
					console.log('显示模板：' + (+new Date));
					fakeWebview.show(show.aniShow, show.duration);
				}
			}
		} else if (parent) {
			console.log('创建模板：' + (+new Date));
			parentWebview = plus.webview.create(parent, id + '___wap2app_parent', {
				popGesture: 'close',
				hardwareAccelerated: true
			}, {
				__wap2app_type: 'parent'
			});
			plus.nativeUI.showWaiting();
			parentWebview.addEventListener('titleUpdate', function() {
				console.log('显示模板：' + (+new Date));
				parentWebview.show(show.aniShow, show.duration);
			});
		}
		console.log('创建新页：' + (+new Date));
		var webview = plus.webview.create(url, id, styles, injectConfig);
		if (parentWebview) {
			webview.hide();
			parentWebview.append(webview);
		}
		var showWaiting = webviewConfig.showWaiting !== false;
		webview.addEventListener('loading', function() {
			console.log('新页loading：' + (+new Date));
			isWebviewLoading = true;
			showWaiting && isCloseSplashscreen && !isBacking && plus.nativeUI.showWaiting();
			if (typeof webviewConfig.loading === 'function') {
				webviewConfig.loading(webview);
			}
		});
		titleUpdateTimer = setTimeout(function() {
			console.log('新页titleUpdateTimer：' + (+new Date));
			handleTitleUpdate('', webview, webviewConfig, fakeWebview || parentWebview);
			webview.evalJS('(' + Function.prototype.toString.call(injectWebviewJs) + ')(\'' + JSON.stringify(injectConfig).replace(/\'/g, "\\u0027").replace(/\\/g, "\\u005c") + '\');');
		}, 2000);
		webview.addEventListener('titleUpdate', function(e) {
			console.log('新页titleUpdate：' + (+new Date));
			handleTitleUpdate(e.title, webview, webviewConfig, fakeWebview || parentWebview);
			webview.evalJS('(' + Function.prototype.toString.call(injectWebviewJs) + ')(\'' + JSON.stringify(injectConfig).replace(/\'/g, "\\u0027").replace(/\\/g, "\\u005c") + '\');');
		});

		webview.addEventListener('loaded', function() {
			console.log('新页loaded：' + (+new Date));
			//第一次不拦截(可能有隐患，比如一个页面301跳转多次触发loaded)
			//暂不启用overrideUrlLoading
			//		if (overrideUrlLoading) { //基座支持拦截跳转
			//			if (injectConfig.mode === 'history') { //指定规则内的url进行拦截跳转
			//				webview.overrideUrlLoading({
			//					mode: 'allow',
			//					match: webviewConfig.ignore || ''
			//				}, function(e) {
			//					handleOpen(e.url, webview.id);
			//				});
			//			} else {
			//				webview.overrideUrlLoading({ //指定规则内的url不进行拦截跳转
			//					mode: 'reject',
			//					match: webviewConfig.ignore || ''
			//				}, function(e) {
			//					handleOpen(e.url, webview.id);
			//				});
			//			}
			//		}
			if (!isCloseSplashscreen && webview.id === homeWebview.id) { //防止titleUpdate不触发
				handleTitleUpdate('', homeWebview, homeConfig);
			}
			if (opennerId) { //设置新开webview的referer。避免H5网站根据referer做一些逻辑处理
				var opennerWebview = plus.webview.getWebviewById(opennerId);
				opennerWebview && webview.evalJS('document.referer="' + opennerWebview.getURL() + '";');
			}
			webview.evalJS('(' + Function.prototype.toString.call(injectWebviewJs) + ')(\'' + JSON.stringify(injectConfig).replace(/\'/g, "\\u0027").replace(/\\/g, "\\u005c") + '\');');
			if (typeof webviewConfig.loaded === 'function') {
				webviewConfig.loaded(webview);
			}

		});
		//关闭后，移除堆栈
		var closeWebview = parentWebview || webview;
		closeWebview.onclose = function() {
			stack.pop();
			titleElem && (titleElem.innerText = currentWebview().getTitle());
			webviewConfig.mode !== 'history' && setBackAndCloseBtnState(currentWebview() !== homeWebview);
		};
		webview.addEventListener('show', function() {
			isLoading = false;
			if (fakeWebview) {
				setTimeout(function() {
					fakeWebview.hide('none');
					fakeWebview = false;
				}, 100);
			}
			stack.push(webview);
			webviewConfig.mode !== 'history' && setBackAndCloseBtnState(currentWebview() !== homeWebview);
		})
		var appendJsFiles = webviewConfig.appendJsFile;
		if (typeof appendJsFiles === 'string' && appendJsFiles) {
			appendJsFiles = [appendJsFiles];
		}
		if (isArray(appendJsFiles)) {
			for (var i = 0, len = appendJsFiles.length; i < len; i++) {
				appendJsFiles[i] && webview.appendJsFile('_www/' + appendJsFiles[i]);
			}
		}
		//设置webview下拉刷新
		if (webviewConfig.pullToRefresh && webviewConfig.pullToRefresh.support) {
			var callback = webviewConfig.pullToRefresh.callback;
			webview.setPullToRefresh(webviewConfig.pullToRefresh, function() {
				if (callback) { //如果指定了下拉回调
					callback(webview);
				} else { //下拉刷新回调，默认reload当前页面
					webview.endPullToRefresh();
					webview.reload();
				}
			});
		}
		return webview;
	};
	//需要注入webview的click拦截代码
	var injectWebviewJs = function(config) {

		if (window.__wap2app_injected) { //防止重复初始化
			return;
		}
		window.__wap2app_injected = true;
		if (typeof config === 'string') {
			config = JSON.parse(config);
		}
		var prevent = config.prevent || {
			hash: false,
			eventType: 'click'
		};
		var injectStyle = config.injectStyle || '';
		var hash = prevent.hash === true ? true : false;
		var eventType = prevent.eventType || 'click';
		var stopPropagation = prevent.stopPropagation === true ? true : false;
		var btns = config.btns || {};
		var backFunc = false;
		var backSelector = '';
		if (btns.back) {
			if (typeof btns.back === 'object') {
				backFunc = btns.back.callback || false;
				if (backFunc) {
					backFunc = '(' + backFunc + ')()';
				}
				backSelector = btns.back.selector || '';
			} else if (typeof btns.back === 'string') {
				backSelector = btns.back;
			}
		}
		var appid = config.appid || plus.storage.getItem(COST_WAP2APP_APP_ID) || plus.runtime.appid;
		var __a__ = document.createElement('a');

		if (injectStyle) {
			var style = document.createElement("style");
			style.appendChild(document.createTextNode(injectStyle));
			document.head.appendChild(style);
		}
		if (config.override !== false) {
			var currentWebview = plus.webview.currentWebview();
			var backFn = function(oldFn) {
				return function(index) {
					plus.webview.getWebviewById(appid).evalJS('typeof wap2app !== "undefined"&&wap2app.back("' + location.href + '")');
				}
			};
			//重写back,go方法
			window.history.back = backFn(window.history.back);
			window.history.go = backFn(window.history.go);
		}
		//拦截A链接跳转
		var handleHrefClick = function(e, target) {
			if (target.tagName === 'A' || target.tagName === 'AREA' && target.href) { //处理普通链接打开
				if (target.protocol === 'http:' || target.protocol === 'https:') {
					var _href = target.getAttribute('href');
					if (_href !== '') {
						if (hash === false && _href.indexOf('#') === 0) { //如果不支持hash跳转
							return true;
						}

						if (e.type === eventType) {
							var href = target.href;
							var oldTargetAttr = target.getAttribute('target');
							target.setAttribute('target', '_blank');
							console.log('点击链接：' + (+new Date));
							plus.webview.getWebviewById(appid).evalJS('typeof wap2app !== "undefined"&&wap2app.open("' + href + '","' + plus.webview.currentWebview().id + '")');
							e.preventDefault();
							stopPropagation && e.stopPropagation();
							setTimeout(function() {
								if (oldTargetAttr) {
									target.setAttribute('target', oldTargetAttr);
								} else {
									target.removeAttribute('target');
								}
							}, 500);
						} else if (e.type === 'click') { //当非click事件启用时，需要click的preventDefault()
							e.preventDefault();
							stopPropagation && e.stopPropagation();
						}
						return true;
					}
				}
			}
			if (prevent) { //自定义拦截规则
				if (prevent.attributes) {
					var attributes = prevent.attributes.split(',');
					for (var i = 0, len = attributes.length; i < len; i++) {
						var href = target.getAttribute(attributes[i]);
						if (href) {
							__a__.href = href;
							if (__a__.protocol === 'http:' || __a__.protocol === 'https:') {
								plus.webview.getWebviewById(appid).evalJS('typeof wap2app !== "undefined"&&wap2app.open("' + __a__.href + '","' + plus.webview.currentWebview().id + '")');
								e.preventDefault();
								e.stopPropagation();
								return true;
							}
						}
					}
				}
			}
			return false;
		};
		var handleBackClick = function(e, target, backbuttons) {
			if (backbuttons && backbuttons.length) { //查找是否是back按钮
				for (var i = 0, len = backbuttons.length; i < len; i++) {
					if (target === backbuttons[i]) { //执行后退逻辑
						var canBack = true;
						if (backFunc) {
							canBack = eval(backFunc);
						}
						if (canBack) {
							e.type === eventType && plus.webview.getWebviewById(appid).evalJS('typeof wap2app !== "undefined"&&wap2app.back("' + location.href + '")');
							e.preventDefault();
							e.stopPropagation();
							return true;
						}
					}
				}
			}
			return false;
		};
		var handleClick = function(e) {
			var backbuttons = [];
			if (e.type === eventType && backSelector) {
				backbuttons = document.querySelectorAll(backSelector);
			}
			var target = e.target;
			for (; target && target !== document; target = target.parentNode) {
				if (handleBackClick(e, target, backbuttons)) {
					return;
				}
			}
			//先循环back，再循环A链接，避免A链接在back里边
			target = e.target;
			for (; target && target !== document; target = target.parentNode) {
				if (handleHrefClick(e, target)) {
					return;
				}
			}
		};
		window.addEventListener(eventType, handleClick, true);
		eventType !== 'click' && window.addEventListener('click', handleClick, true);
		window.__wap2app_back = function() {
			var canBack = true;
			if (backFunc) {
				canBack = eval(backFunc);
			}
			if (!canBack) {
				return;
			}
			var backElem;
			if (config.backbutton) {
				var backElems = document.querySelectorAll(config.backbutton);
				if (backElems && backElems.length) {
					backElem = backElems[backElems.length - 1];
				}
			}
			if (backElem) {
				backElem.click();
			} else {
				plus.webview.getWebviewById(appid).evalJS('typeof wap2app !== "undefined"&&wap2app.back("' + location.href + '")');
			}
		};
		if (config.backbutton !== false) {
			plus.key.addEventListener('backbutton', window.__wap2app_back);
		}
	};
	//处理titleUpdate事件
	var handleTitleUpdate = function(title, webview, webviewConfig, extraWebview) {
		clearTimeout(titleUpdateTimer);
		titleElem && (titleElem.innerText = title);
		var url = webview.getURL();
		setTimeout(function() {
			isWebviewLoading = true; //先忽略此参数，如果以后需要识别，注释该行
			if ((isWebviewLoading && webview.id !== currentWebview().id) || !isCloseSplashscreen) {
				isWebviewLoading = false; //只有触发过loading后才show，避免因为多次titleUpdate导致重复show
				if (extraWebview) {
					console.log('新页显示：' + (+new Date));
					webview.show('fade-in', 300, function() {
						extraWebview.__wap2app_type === 'parent' && plus.nativeUI.closeWaiting();
					});
				} else {
					var show = webviewConfig.show;
					if (webview.parent()) {
						webview.parent().show(show.aniShow, show.duration);
					} else {
						webview.show(show.aniShow, show.duration);
					}
				}
			}
			if (!isCloseSplashscreen) {
				plus.navigator.closeSplashscreen(); //关闭splash
				plus.nativeUI.closeWaiting();
				isCloseSplashscreen = true;
			} else {
				setBackAndCloseBtnState(!isHome()); //显示后退及关闭按钮
				isBacking = false;
				isLoading = false;
				webviewConfig.showWaiting !== false && plus.nativeUI.closeWaiting(); //关闭waiting
			}
			//检查gps
			setTimeout(function() {
				handleGps(url);
			}, 10);
		}, webviewConfig.delay || 300);
	};
	//检查GPS开启及授权
	var handleGps = function(url) {
		if (gpsConfig && isGpsUrl(url)) {
			var check = gpsConfig.check;
			var needCheck = true;
			var localCheck = plus.storage.getItem(COST_WAP2APP_GPS_CHECK);
			if (typeof check === 'number') {
				if (localCheck) {
					if (localCheck >= check) {
						needCheck = false;
					}
				}
			} else if (typeof check === 'function') {
				needCheck = check();
			}
			if (needCheck) {
				if (gps.isEnabled(gpsConfig.disabledMsg)) {
					gps.checkPermission(function() {
						//如果用户重新授权了，刷新当前页面
						currentWebview().reload();
					}, gpsConfig.forbiddenMsg);
				}
				localCheck = parseInt(localCheck) || 0;
				plus.storage.setItem(COST_WAP2APP_GPS_CHECK, '' + (localCheck + 1));
			}

		}
	};
	//返回首页
	var goHome = function(url) {
		if (url !== homeWebview.getURL() || homeConfig.reload === true) {
			homeWebview.loadURL(url);
		}
		setTimeout(function() { //关闭所有非控制页，首页的webview
			var webviews = plus.webview.all();
			for (var i = 0, len = webviews.length; i < len; i++) {
				var _webview = webviews[i];
				if (_webview.id !== homeConfig.id && _webview.id !== appid && _webview.id !== plus.runtime.appid) {
					_webview.close('none');
				}
			}
		}, 20);
		stack.clear();
	};
	//打开页面
	var handleOpen = function(url, webviewId) {
		console.log('打开窗口：' + (+new Date));
		if (isLoading) {
			return;
		}
		isLoading = true;
		setTimeout(function() { //超时自动重置
			isLoading = false;
		}, 1500);
		var location = getLocation(url);
		if (isMatch(location, homeConfig)) { //如果是首页
			goHome(url);
			return true;
		}
		var config = getWebviewConfig(webviewId);
		if (config.mode === 'history') { //放到这里识别，是为了避免首页也被history，逻辑上应该排除首页外的，可能后续还要配置ignore列表
			plus.webview.getWebviewById(webviewId).evalJS('location.href="' + url + '";');
			return false;
		}
		for (var id in webviewsConfig) {
			var webviewConfig = webviewsConfig[id];
			if (isMatch(location, webviewConfig)) {
				var webview = plus.webview.getWebviewById(webviewConfig.id);
				if (!webview) { //如果不存在，则创建
					createWebview(url, webviewConfig, webviewId);
				} else { //已存在，直接load
					var parentWebview = webview.parent(); //如果有父，则动画是由父webview处理
					if (!parentWebview) {
						parentWebview = webview;
					}
					if (webviewId !== webviewConfig.id) {
						parentWebview.hide('none'); //先隐藏一下，方便走动画
					}
					if (webviewConfig.reload === true) {
						webview.loadURL(url);
						parentWebview.show('none');
					} else {
						if (webview.getURL() !== url) {
							webview.loadURL(url);
							parentWebview.show('none');
						} else {
							var show = webviewConfig.show;
							parentWebview.show(show.aniShow, show.duration);
						}
					}
				}
				return true;
			}
		}
		createWebview(url, simpleExtend(optionsConfig, {
			id: url + '__wap2app_id_' + Math.random()
		}), webviewId); //未匹配到多webview配置
		return false;
	};
	//处理wap首页后退逻辑
	var handleBack = function(e) {
		var url = typeof e === 'string' ? e : '';
		if (isLoading) {
			return;
		}
		var webview = currentWebview();

		if (webview) { //校验currentWebview是否存在
			if (!plus.webview.getWebviewById(webview.id)) {
				stack.pop();
				webview = null;
			}
		}
		if (webview && webview.id !== homeWebview.id) {
			var webviewConfig = getWebviewConfig(webview.id);
			var history = true;
			if (typeof webviewConfig.history === 'boolean') {
				history = webviewConfig.history;
			} else {
				history = isMatch(getLocation(webview.getURL(), webview.getTitle()), {
					pathname: webviewConfig.history
				});
			}
			var show = webviewConfig.show;
			aniShow = show.aniShow || 'pop-in';
			duration = show.duration || 300;
			if (~aniShow.indexOf('in')) {
				aniShow = aniShow.replace('in', 'out');
			} else {
				aniShow = aniShow.replace('out', 'in');
			}
			var backWebview = webview.parent() || webview;
			if (!history) {
				backWebview.close(aniShow, duration);
			} else {
				webview.canBack(function(e) {
					if (e.canBack) {
						webview.back();
					} else {
						backWebview.close(aniShow, duration);
					}
				});
			}
		} else {
			stack.clear(); //清空
			back(homeWebview, function() { //该回调处理页面无history则调用应用退出
				if (!isHome(url)) { //如果不是首页
					homeWebview.loadURL(homeConfig.url);
				} else {
					quit();
				}
			}, function() { //该回调处理页面有history则调用webview的back
				if (isHome(url)) { //如果当前url是首页，则为退出应用逻辑
					setBackAndCloseBtnState(false); //隐藏后退及close按钮
					quit();
				} else {
					isBacking = true;
					homeWebview.back();
				}
			});
		}
	};
	//设置后退及关闭按钮状态（是否显示）
	var setBackAndCloseBtnState = function(active) {
		backBtnElem && (backBtnElem.style.display = active ? 'inline-block' : 'none');
		closeBtnElem && (closeBtnElem.style.display = active ? 'inline-block' : 'none');
	};
	//匹配工具类
	var match = function(url, rule, extras) {
		if (typeof rule === 'string') { //字符串
			return rule === url;
		} else if (typeof rule === 'function') { //函数
			return rule(url, extras);
		} else if (isArray(rule)) { //数组
			return ~rule.indexOf(url);
		} else if (rule instanceof RegExp) { //正则
			return rule.test(url);
		}
		return false;
	};
	//匹配location
	var isMatch = function(location, config) {
		if (config.hostname) { //如果需要匹配hostname
			if (!match(location.hostname, config.hostname, location)) {
				return false;
			}
		}
		if (config.pathname) {
			if (!match(location.pathname, config.pathname, location)) {
				return false;
			}
		}
		if (config.title && location.title) {
			if (!match(location.title, config.title, location)) {
				return false;
			}
		}
		return true;
	};
	//判断当前url是否需要gps校验
	var isGpsUrl = function(url) {
		if (gpsConfig && gpsConfig.pathname) {
			return isMatch(getLocation(url), gpsConfig);
		}
		return false;
	};
	//判断当前页面是否是首页
	var isHome = function(url) {
		return homeWebview.id === currentWebview().id && isMatch(getLocation(url || homeWebview.getURL(), homeWebview.getTitle()), homeConfig);
	};
	//查询webview配置信息
	var getWebviewConfig = function(id) {
		return webviewsConfig[id] || optionsConfig;
	};
	//简单拷贝
	var simpleExtend = function(source1, source2) {
		var target = {};
		if (source1) {
			for (var key in source1) {
				if (source1.hasOwnProperty(key)) {
					target[key] = source1[key];
				}
			}
		}
		if (source2) {
			for (var key in source2) {
				if (source2.hasOwnProperty(key)) {
					target[key] = source2[key];
				}
			}
		}
		return target;
	};

	var properties = ['hash', 'host', 'hostname', 'href', 'origin', 'pathname', 'port', 'protocol', 'search'];
	var getLocation = function(url, title) {
		__a__.href = url;
		var result = {
			title: title
		};
		for (var i = 0, len = properties.length; i < len; i++) {
			var property = properties[i];
			result[property] = __a__[property];
		}
		return result;
	};
	//退出回调
	var onQuit = function(callback) {
		handleQuit = callback;
	};
	var readyCallbacks = [];
	var handleReady = function(callback) {
		if (isReady) {
			callback && callback();
		} else {
			readyCallbacks.push(callback);
		}
	};
	var setCookie = function(url, cname, cvalue, exdays) {
		exdays = exdays || 1;
		var d = new Date();
		d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
		var expires = "expires=" + d.toUTCString();
		plus.navigator.setCookie(url, cname + "=" + cvalue + "; " + expires);
	};
	var getCookie = function(url, cname) {
		var name = cname + "=";
		var ca = plus.navigator.getCookie(url);
		if (ca) {
			ca = ca.split(';');
			for (var i = 0; i < ca.length; i++) {
				var c = ca[i];
				while (c.charAt(0) == ' ') c = c.substring(1);
				if (c.indexOf(name) == 0) return c.substring(name.length, c.length);
			}
		}

		return "";
	};
	var removeCookie = function(url, cname) {
		setCookie(domain, cname, '', -1);
	};
	module.exports = {
		init: function(config) {
			plusReady(function() {
				if (config && config.network !== false) {
					if (plus.networkinfo.getCurrentType() === plus.networkinfo.CONNECTION_NONE) {
						plus.nativeUI.confirm('无法连接服务器，请检查网络设置', function(e) {
							if (e.index === 2) {
								setting.openAirPlaneModeSetting();
								plus.webview.currentWebview().reload();
							} else if (e.index === 1) {
								plus.webview.currentWebview().reload();
							} else {
								plus.runtime.quit();
							}
						}, '提示', ['退出', '重试', '设置网络']);
					} else {
						init(config);
					}
				} else {
					init(config);
				}
			});
		},
		ready: handleReady,
		back: handleBack,
		open: handleOpen,
		quit: oldQuit,
		share: {
			open: function(msg, callback, title) {
				if (typeof msg === 'string') {
					msg = JSON.parse(msg);
				}
				share.open(msg, callback, title);
			}
		},
		cookie: {
			set: setCookie,
			get: getCookie,
			remove: removeCookie
		},
		isFirst: function() {
			return isFirstInstall;
		},
		goHome: goHome,
		hasShortcut: function() {
			return hasShortcut;
		}
	};

/***/ },
/* 2 */
/***/ function(module, exports) {

	module.exports = function(callback) {
		if (window.plus) {
			callback();
		} else {
			document.addEventListener("plusready", function() {
				callback();
			}, false);
		}
	};

/***/ },
/* 3 */
/***/ function(module, exports) {

	var first = null;
	module.exports = function(msg, secondCallback, firstCallback) {
		if (typeof msg === 'function') {
			firstCallback = secondCallback;
			secondCallback = msg;
			msg = '';
		}
		if (!first) {
			first = new Date().getTime();
			plus.nativeUI.toast(msg || '再按一次退出应用');
			firstCallback && firstCallback();
			setTimeout(function() {
				first = null;
			}, 1000);
		} else {
			if (new Date().getTime() - first < 1000) {
				var isQuit = true;
				if (typeof secondCallback === 'function') {
					if (secondCallback() === false) {
						isQuit = false;
					}
				}
				isQuit && setTimeout(function() {
					plus.runtime.quit();
				}, 200);
			}
		}

	};

/***/ },
/* 4 */
/***/ function(module, exports) {

	module.exports = function(webview, webviewBackCallback, historyBackCallback) {
		webview.canBack(function(e) {
			if (e.canBack) {
				if (typeof historyBackCallback === 'function') {
					historyBackCallback(webview);
				} else {
					webview.back();
				}
			} else {
				if (typeof webviewBackCallback === 'function') {
					webviewBackCallback(webview);
				} else if (webviewBackCallback === 'close') {
					webviewBackCallback.close('auto');
				} else {
					webviewBackCallback.hide('auto');
				}
			}
		})
	};

/***/ },
/* 5 */
/***/ function(module, exports, __webpack_require__) {

	var os = __webpack_require__(6);
	var setting = __webpack_require__(7);
	var btns = ["确定", "取消"];
	var isShowing = false;
	module.exports = {
		isEnabled: function checkGPSPermission(msg, callback) {
			if (plus.os.name === 'iOS') {
				return true;
			}
			if (isShowing) {
				return;
			}
			var isEnabled = true;
			try {
				var mContext = plus.android.runtimeMainActivity();
				var mLocationManager = mContext.getSystemService("location");
				var LocationManager = plus.android.importClass(mLocationManager);
				var s = mLocationManager.isProviderEnabled(LocationManager.GPS_PROVIDER);
				//只能得知系统是否开启了GPS定位，不能获取手机安全软件是否授予了定位权限
				if (!s) { //是否开启了gps定位
					isEnabled = false;
				}
			} catch (e) {
				isEnabled = false;
			}
			if (!isEnabled) {
				if (typeof msg === 'function') {
					callback = msg;
					msg = '';
				}
				if (msg || callback) {
					msg = msg || '本机未开启定位功能，点确定进入设置开启定位功能';
					if (plus.os.name === 'Android') {
						isShowing = true;
						plus.nativeUI.confirm(msg, function(e) {
							if (e.index === 0) {
								setting.openLocationSource();
								callback && callback();
							} else {
								isShowing = false;
							}
						}, "提示", btns);
					}
				}
			}
			return isEnabled;
		},
		checkPermission: function(allowedCallback, msg, confirmCallback) {
			if (plus.os.name === 'iOS') {
				return true;
			}
			if (isShowing) {
				return;
			}
			var isAllowed = true;
			try {
				var context = plus.android.runtimeMainActivity();
				var Build = plus.android.importClass('android.os.Build');
				var Settings = plus.android.importClass('android.provider.Settings');
				var Context = plus.android.importClass('android.content.Context');
				if (Build.VERSION.SDK_INT >= 19) {
					var mAppOpsManager = context.getSystemService(Context.APP_OPS_SERVICE);
					var AppOpsManager = plus.android.importClass(mAppOpsManager);
					var pm = context.getPackageManager();
					plus.android.importClass(pm);　　
					var info = pm.getPackageInfo(context.getPackageName(), 0);
					var uid = plus.android.getAttribute(plus.android.getAttribute(info, 'applicationInfo'), 'uid');
					var pn = context.getPackageName();
					var mode = mAppOpsManager.checkOp(AppOpsManager.OPSTR_COARSE_LOCATION, uid, pn);
					if (mode != AppOpsManager.MODE_ALLOWED) {
						var mOnOpChangedListener;
						mOnOpChangedListener = plus.android.implements('android.app.AppOpsManager$OnOpChangedListener', {
							onOpChanged: function(op, packageName) {
								var newMode = mAppOpsManager.checkOp(AppOpsManager.OPSTR_COARSE_LOCATION, uid, pn);
								if (op == AppOpsManager.OPSTR_COARSE_LOCATION && newMode == AppOpsManager.MODE_ALLOWED) { //一次操作会执行两次，酌情处理
									allowedCallback && allowedCallback();
									//停止监听
									mAppOpsManager.stopWatchingMode(mOnOpChangedListener);
								}
							}
						});
						//启动状态监听
						mAppOpsManager.startWatchingMode(AppOpsManager.OPSTR_COARSE_LOCATION, pn, mOnOpChangedListener);
						isAllowed = false;
					}
				}
			} catch (e) {
				console.log(e);
			}
			if (!isAllowed) {
				if (typeof msg === 'function') {
					confirmCallback = msg;
					msg = '';
				}
				if (msg || confirmCallback) {
					msg = msg || '尚未赋予获取位置的权限。点确定进入设置，给{app}赋予定位权限';
					plus.runtime.getProperty(plus.runtime.appid, function(wgtinfo) {
						var appName = wgtinfo.name;
						if (os.qihoo) {
							appName = '360手机助手';
						} else if (os.stream) {
							appName = '流应用';
						}
						msg = msg.replace('{app}', appName);
						if (plus.os.name === 'Android') {
							isShowing = true;
							plus.nativeUI.confirm(msg, function(e) {
								if (e.index === 0) {
									setting.openApplicationDetail();
									confirmCallback && confirmCallback();
								} else {
									isShowing = false;
								}
							}, "提示", btns);
						}
					});
				}
			}
			return isAllowed;
		}
	}

/***/ },
/* 6 */
/***/ function(module, exports) {

	var os = {
		android: false,
		ios: false,
		plus: false,
		stream: false,
		qihoo: false
	};
	var ua = navigator.userAgent;
	if (ua.match(/(Android);?[\s\/]+([\d.]+)?/)) {
		os.android = true;
	} else if (ua.match(/(iPhone\sOS)\s([\d_]+)/)) {
		os.ios = true;
	}
	if (ua.match(/Html5Plus/i)) {
		os.plus = true;
		if (ua.match(/StreamApp/i)) {
			os.stream = true;
			if (ua.match(/Qihoo/i)) {
				os.qihoo = true;
			}
		}
	}

	module.exports = os;

/***/ },
/* 7 */
/***/ function(module, exports, __webpack_require__) {

	var os = __webpack_require__(6);
	var main, Intent, Settings, Uri;
	var init = function() {
		if (os.android) {
			main = plus.android.runtimeMainActivity();
			Intent = plus.android.importClass('android.content.Intent');
			Settings = plus.android.importClass('android.provider.Settings');
			Uri = plus.android.importClass("android.net.Uri");
		}
	};
	module.exports = {
		openLocationSource: function() {
			if (!main) {
				init();
			}
			main && main.startActivity(new Intent(Settings.ACTION_LOCATION_SOURCE_SETTINGS));
		},
		openApplicationDetail: function() {
			if (!main) {
				init();
			}
			main && main.startActivity(new Intent(Settings.ACTION_APPLICATION_DETAILS_SETTINGS, Uri.parse("package:" + main.getPackageName())));
		},
		openAirPlaneModeSetting: function() {
			if (!main) {
				init();
			}
			main && main.startActivity(new Intent(Settings.ACTION_AIRPLANE_MODE_SETTINGS));
		}
	}

/***/ },
/* 8 */
/***/ function(module, exports, __webpack_require__) {

	var CONST = __webpack_require__(9);

	function hasShortcut(name) {
		try {
			var Main = plus.android.runtimeMainActivity();
			var cr = Main.getContentResolver();
			plus.android.importClass(cr);
			var uri = getUriFromLauncher(Main);
			var c = cr.query(uri, ["title"], "title=? ", [name], null);
			plus.android.importClass(c);
			if (c && c.getCount() > 0) {
				if (!c.isClosed()) {
					c.close();
				}
				return true;
			}
		} catch (e) {
			return false;
		}
		return false;
	}

	//获取访问Launcher数据库查询的Uri
	function getUriFromLauncher(context) {
		var Uri = plus.android.importClass("android.net.Uri");
		var StringBuilder = plus.android.importClass("java.lang.StringBuilder");
		var Build = plus.android.importClass("android.os.Build");
		var uriStr = new StringBuilder();
		var authority = getAuthorityFromPermission(context, "com.android.launcher.permission.READ_SETTINGS");
		if (!authority) {
			authority = getAuthorityFromPermission(context, getLauncherPackageName(context) + ".permission.READ_SETTINGS");
		}
		uriStr.append("content://");
		if (!authority) {
			var sdkInt = Build.VERSION.SDK_INT;
			if (sdkInt < 8) { // Android 2.1.x(API 7)以及以下的
				uriStr.append("com.android.launcher.settings");
			} else if (sdkInt < 19) { // Android 4.4以下
				uriStr.append("com.android.launcher2.settings");
			} else { // 4.4以及以上
				uriStr.append("com.android.launcher3.settings");
			}
		} else {
			uriStr.append(authority);
		}
		uriStr.append("/favorites?notify=true");
		return Uri.parse(uriStr.toString());
	}

	//获取当前Launcher包名
	function getLauncherPackageName(context) {
		var Intent = plus.android.importClass("android.content.Intent");
		var PackageManager = plus.android.importClass("android.content.pm.PackageManager");
		var intent = new Intent(Intent.ACTION_MAIN);
		intent.addCategory(Intent.CATEGORY_HOME);
		var resolveInfo = context.getPackageManager().resolveActivity(intent, 0);
		if (!resolveInfo || !resolveInfo.activityInfo) {
			// should not happen. A home is always installed, isn't it?
			return "";
		}
		if (resolveInfo.activityInfo.packageName.equals("android")) {
			return "";
		} else {
			return resolveInfo.activityInfo.packageName;
		}
	}
	//获取查询时所需要的必要的权限
	function getAuthorityFromPermission(context, permission) {
		if (!permission) {
			return '';
		}
		try {
			var PackageInfo = plus.android.importClass("android.content.pm.PackageInfo");
			var PackageManager = plus.android.importClass("android.content.pm.PackageManager");
			var packs = context.getPackageManager().getInstalledPackages(PackageManager.GET_PROVIDERS);
			plus.android.importClass(packs);
			if (!packs) {
				return '';
			}
			for (var i = 0; i < packs.size(); i++) {
				var pack = packs.get(i);
				plus.android.importClass(pack);
				var providers = plus.android.getAttribute(pack, "providers");
				if (providers) {
					for (var j = 0; j < providers.length; j++) {
						var provider = providers[j];
						plus.android.importClass(provider);
						var readPermission = plus.android.getAttribute(provider, "readPermission");
						var writePermission = plus.android.getAttribute(provider, "writePermission");
						if (permission == readPermission || permission == writePermission) {
							var authority = plus.android.getAttribute(provider, "authority");
							return authority;
						}
					}
				}
			}

		} catch (e) {
			//TODO handle the exception
		}
		return '';
	}
	module.exports = {
		create: function(name, icon) {
			var versions = plus.runtime.innerVersion.split('.');
			if (versions[versions.length - 1] < 21299) {
				try {
					var shortcut = plus.storage.getItem(CONST.SHORTCUT);
					if (!shortcut) {
						plus.navigator.createShortcut({
							name: name,
							icon: icon
						});
						plus.storage.setItem(CONST.SHORTCUT, "TRUE");
					}
				} catch (e) {

				}
			}
		},
		hasShortcut: hasShortcut
	}

/***/ },
/* 9 */
/***/ function(module, exports) {

	module.exports = {
		IMEI: '__WAP2APP_IMEI',
		SHORTCUT: '__WAP2APP_SHORTCUT'
	};

/***/ },
/* 10 */
/***/ function(module, exports, __webpack_require__) {

	var plusReady = __webpack_require__(2);
	var callbacks = [];
	var receiver;
	var filter;
	var main;
	var isInit = false;
	var isRegistered = false;
	var isOlderVersion = false;
	var init = function(callback) {
		if (plus.os.name !== 'Android') {
			return;
		}
		try {
			var version = plus.runtime.innerVersion.split('.');
			isOlderVersion = parseInt(version[version.length - 1]) < 22298;
			main = plus.android.runtimeMainActivity();
			var Intent = plus.android.importClass('android.content.Intent');
			var IntentFilter = plus.android.importClass('android.content.IntentFilter');
			var SmsMessage = plus.android.importClass('android.telephony.SmsMessage');
			var receiverClass = 'io.dcloud.feature.internal.reflect.BroadcastReceiver';
			if (isOlderVersion) {
				receiverClass = 'io.dcloud.feature.internal.a.a';
			}
			filter = new IntentFilter();
			var onReceiveCallback = function(context, intent) {
				try {
					var action = intent.getAction();
					if (action == "android.provider.Telephony.SMS_RECEIVED") {
						var pdus = intent.getSerializableExtra("pdus");
						var msgs = [];
						for (var i = 0, len = pdus.length; i < len; i++) {
							msgs.push(SmsMessage.createFromPdu(pdus[i]));
						}
						for (var i = 0, len = callbacks.length; i < len; i++) {
							callbacks[i](msgs);
						}
					}
				} catch (e) {}
			}
			receiver = plus.android.implements(receiverClass, {
				a: onReceiveCallback,
				onReceive: onReceiveCallback
			});
			filter.addAction("android.provider.Telephony.SMS_RECEIVED");
			callback && callback();
		} catch (e) {}
	}

	var register = function(callback) {
		callbacks.push(callback);
		if (!isInit) {
			isInit = isRegistered = true;
			plusReady(function() {
				init(function() {
					setTimeout(function() {
						//					console.log('registerReceiver');
						try {
							if (isOlderVersion) {
								main.a(receiver, filter);
							} else {
								main.registerReceiver(receiver, filter); //注册监听
							}
						} catch (e) {}
					}, 300);
				});
			});
		} else if (!isRegistered) {
			//		console.log('registerReceiver');
			try {
				if (isOlderVersion) {
					main.a(receiver, filter);
				} else {
					main.registerReceiver(receiver, filter); //注册监听
				}
			} catch (e) {}
		}
	};
	var unregister = function(callback, remove) {
		for (var i = 0, len = callbacks.length; i < len; i++) {
			if (callbacks[i] === callback) {
				callbacks.splice(i, 1);
			}
		}
		if (remove && !callbacks.length) {
			if (main && isRegistered) {
				try {
					if (isOlderVersion) {
						main.a(receiver);
					} else {
						main.unregisterReceiver(receiver);
					}
				} catch (e) {}
				isRegistered = false;
				//			console.log('unregisterReceiver');
			}
		}
	};
	module.exports = {
		register: register,
		unregister: unregister
	};

/***/ },
/* 11 */
/***/ function(module, exports, __webpack_require__) {

	var os = __webpack_require__(6);
	var main;
	var shareServices = {};
	var oldVersion = false;
	var isInit = false;
	var init = function() {
		var versions = plus.runtime.innerVersion.split('.');
		oldVersion = versions[versions.length - 1] < 20133;
		if (os.android) {
			main = plus.android.runtimeMainActivity();
		}
		if (!oldVersion) {
			plus.share.getServices(function(services) {
				for (var i = 0, len = services.length; i < len; i++) {
					var service = services[i];
					shareServices[service.id] = service;
				}
			})
		}
		isInit = true;
	};

	function share(id, msg, callback) {
		var service = shareServices[id];
		if (!service) {
			plus.nativeUI.alert('无效的分享服务[' + id + ']');
			callback && callback(false);
			return;
		}
		if (service.authenticated) {
			_share(service, msg, callback);
		} else {
			service.authorize(function() {
				_share(service, msg, callback);
			}, function(e) {
				plus.nativeUI.alert("认证授权失败");
				callback && callback(false);
			})
		}
	}

	function _share(service, msg, callback) {
		service.send(msg, function() {
			plus.nativeUI.toast("分享到\"" + service.description + "\"成功！");
			callback && callback(true);
		}, function(e) {
			plus.nativeUI.toast("分享到\"" + service.description + "\"失败！");
			callback && callback(false);
		})
	}

	function openSystem(msg, callback, title) {
		if (!os.android || !isInit) {
			callback && callback(false);
		}
		var Intent = plus.android.importClass('android.content.Intent');
		if (main && Intent) {
			var intent = new Intent(Intent.ACTION_SEND);
			intent.setType("text/plain");
			intent.putExtra(Intent.EXTRA_TEXT, msg.content);
			intent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
			main.startActivity(Intent.createChooser(intent, title || "系统分享"));
			callback && callback(true);
		} else {
			callback && callback(false);
		}
	}

	function open(msg, callback, title) {
		if (!isInit) {
			callback && callback(false);
		}
		if (!oldVersion && shareServices.weixin) {
			plus.nativeUI.actionSheet({
				title: title || '分享到',
				cancel: "取消",
				buttons: [{
					title: "微信消息"
				}, {
					title: "微信朋友圈"
				}, {
					title: "更多分享"
				}]
			}, function(e) {
				var index = e.index;
				switch (index) {
					case 1: //分享到微信好友
						msg.extra = {
							scene: 'WXSceneSession'
						};
						share('weixin', msg, callback);
						break;
					case 2: //分享到微信朋友圈
						msg.title = msg.content;
						msg.extra = {
							scene: 'WXSceneTimeline'
						};
						share('weixin', msg, callback);
						break;
					case 3: //更多分享
						openSystem(msg, callback, title);
						break;
				}
			})
		} else {
			openSystem(msg, callback);
		}
	}
	module.exports = {
		init: init,
		open: open,
		openSystem: openSystem
	};

/***/ },
/* 12 */
/***/ function(module, exports) {

	var stack = [];
	module.exports = {
		size: function() {
			return stack.length;
		},
		last: function() {
			if (stack.length) {
				return stack[stack.length - 1];
			}
			return false;
		},
		push: function(webview) {
			for (var i = 0, len = stack.length; i < len; i++) {
				if (webview === stack[i]) {
					stack.splice(i, 1);
				}
			}
			stack.push(webview);
		},
		pop: function() {
			stack.pop();
		},
		clear: function() {
			stack = [];
		}
	};

/***/ }
/******/ ])
});
;