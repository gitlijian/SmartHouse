/*
 * 与server 交互相关函数入口
 * */
//localStorage
(function($, owner) {
	var ImgURL= "http://182.254.133.58/SmartHouse_Server/";
	var BaseURL= "http://182.254.133.58/SmartHouse_Server/";

	var serURL = BaseURL + "doServer.php"; 
	var serImgURL = BaseURL + "doimg.php";
	var serAudioURL = BaseURL + "doaudio.php";
	var serHeadURL = BaseURL + "doHead.php";
	var serSMSURL = BaseURL + "SMSVerify.php";//短信url
	//var payURL= BaseURL + "pingpp/server/example/pay.php";//支付url
	var nwaiting = null;
	var mask = mui.createMask(owner.OnmaskClose); //callback为用户点击蒙版时自动执行的回调；

	owner.OnMaskClose = function() {
		if (nwaiting != null) {
			nwaiting.close();
			mask.close();
			nwaiting = null;
			return true; 
		} else
			return false;
	};
	/*
	 * 向服务器请求一个数据，使用post传递
	 * json，要请求的字符串 如果是json类型，用JSON.stringify（）转换
	 * isShowWait：是否显示等待框
	 * isShowMask:是否显示蒙板背景
	 * callback：回调函数，带一个参数（返回的json数据）
	 */
	owner.OnDoPostServerJson = function(json, isShowWait, isShowMask, callback) {
		//json.userID = parseInt(localStorage.getItem("userID"));
		//json.dynamickey = localStorage.getItem("dynamic_key");
		jsonsrt = JSON.stringify(json);

		if (isShowWait) {
			if(nwaiting == null)
			{
				nwaiting = plus.nativeUI.showWaiting("加载中..."); //显示原生等待框	
				//				{						
				//					width: "100%",
				//					height: "106%",
				//					round:"0px"
				//				});//显示原生等待框
				if (isShowMask) {
					mask.show(); //显示遮罩	
				}	
			}

		} else {
			nwaiting = null;
		}
		//ajax
		mui.ajax(serURL, {
			data: {
				jsons: jsonsrt
			},
			dataType: 'json', //服务器返回json格式数据
			type: 'post', //HTTP请求类型
			timeout: 30000, //超时时间设置为60秒；
			success: function(data) {
				//服务器返回响应，根据响应结果，分析是否登录成功；
				if (isShowWait && nwaiting != null) {
					nwaiting.close();
					mask.close(); //显示遮罩
				}
				callback(data);
			},
			error: function(xhr, type, errorThrown) {
				console.log('errorThrown')
				console.log(errorThrown)
				console.log(type)
//				console.log(xhr)
				//异常处理；
				if (isShowWait && nwaiting != null) {
					nwaiting.close();
					mask.close(); //显示遮罩
				}
//				plus.nativeUI.toast(type);
			}
		});
	};

	
	//图片接口 发送图片消息用此接口
	/**
	 * @param json 请求json
	 * @param img	图片base64
	 * @param isShowWait 是否显示等待框
	 * @param isShowMask 是否显示遮罩
	 * @param callback	回调
	 */
	owner.OnDoPostServerJsonImg = function(json,img, isShowWait, isShowMask, callback) {
		jsonsrt = JSON.stringify(json);

		if (isShowWait) {
			if(nwaiting == null)
			{
				nwaiting = plus.nativeUI.showWaiting("加载中..."); //显示原生等待框	
				if (isShowMask) {
					mask.show(); //显示遮罩	
				}	
			}
		} else {
			nwaiting = null;
		}

		//ajax
		mui.ajax(serImgURL, {
			data: {
				jsons: jsonsrt,
				img:img
			},
			dataType: 'json', //服务器返回json格式数据
			type: 'post', //HTTP请求类型
			timeout: 60000, //超时时间设置为60秒；
			success: function(data) {
				//服务器返回响应，根据响应结果，分析是否登录成功；
				if (isShowWait && nwaiting != null) {
					nwaiting.close();
					mask.close(); //显示遮罩
				}
				callback(data);
			},
			error: function(xhr, type, errorThrown) {
				//异常处理；
				//console.log(type);
				if (isShowWait && nwaiting != null) {
					nwaiting.close();
					mask.close(); //显示遮罩
				}
//				plus.nativeUI.toast(type);
				mui.alert(errorThrown);
			}
		});
	};
	
	//音频接口 发送语音消息用此接口
	/**
	 * @param json 请求json
	 * @param audio	文件base64
	 * @param isShowWait 是否显示等待框
	 * @param isShowMask 是否显示遮罩
	 * @param callback	回调
	 */
	owner.OnDoPostServerJsonAudio= function(json,audio_, isShowWait, isShowMask, callback) {
		jsonsrt = JSON.stringify(json);

		if (isShowWait) {
			if(nwaiting == null)
			{
				nwaiting = plus.nativeUI.showWaiting("加载中..."); //显示原生等待框	
				if (isShowMask) {
					mask.show(); //显示遮罩	
				}	
			}
		} else {
			nwaiting = null;
		}

		//ajax
		mui.ajax(serAudioURL, {
			data: {
				jsons: jsonsrt,
				audio:audio_
			},
			dataType: 'json', //服务器返回json格式数据
			type: 'post', //HTTP请求类型
			timeout: 60000, //超时时间设置为60秒；
			success: function(data) {
				//服务器返回响应，根据响应结果，分析是否登录成功；
				if (isShowWait && nwaiting != null) {
					nwaiting.close();
					mask.close(); //显示遮罩
				}
				callback(data);
			},
			error: function(xhr, type, errorThrown) {
				//异常处理；
				//console.log(type);
				if (isShowWait && nwaiting != null) {
					nwaiting.close();
					mask.close(); //显示遮罩
				}
//				plus.nativeUI.toast(type);
				mui.alert(errorThrown);
			}
		});
	};
	
	//头像接口
	owner.OnDoPostServerJsonHead = function(json,imgs,isShowWait, isShowMask, callback) {
		jsonsrt = JSON.stringify(json);

		if (isShowWait) { 
			nwaiting = plus.nativeUI.showWaiting("加载中..."); //显示原生等待框	
			if (isShowMask) {
				mask.show(); //显示遮罩	
			}
		} else {
			nwaiting = null;
		}

		//ajax
		mui.ajax(serHeadURL, {
			data: {
				jsons: jsonsrt,
				img:imgs
			},
			dataType: 'json', //服务器返回json格式数据
			type: 'post', //HTTP请求类型
			timeout: 60000, //超时时间设置为60秒；
			success: function(data) {
				//服务器返回响应，根据响应结果，分析是否登录成功；
				if (isShowWait && nwaiting != null) {
					nwaiting.close();
					mask.close(); //显示遮罩
				}
				callback(data);
			},
			error: function(xhr, type, errorThrown) {
				//异常处理；
				//console.log(type);
				if (isShowWait && nwaiting != null) {
					nwaiting.close();
					mask.close(); //显示遮罩
				}
//				plus.nativeUI.toast(type);
			}
		});
	};
	
	/*
	 * 短信验证请求，使用post传递
	 * phone，要请求验证的手机号
	 * callback：回调函数，带一个参数（返回的json数据）
	 */
	owner.OnDoPostServerJsonSMS = function(phone, callback) {
		var smsInfo = {
				to: phone
			}

		jsonsrt = JSON.stringify(smsInfo);

		//ajax
		mui.ajax(serSMSURL, {
			data: {
				jsons: jsonsrt
			},
			dataType: 'json', //服务器返回json格式数据
			type: 'post', //HTTP请求类型
			timeout: 60000, //超时时间设置为60秒；
			success: function(data) {
				//服务器返回响应，根据响应结果，分析是否成功；
				callback(data);
			},
			error: function(xhr, type, errorThrown) {
				//异常处理；
//				plus.nativeUI.toast(type);
			}
		});
	};
	
	/*
	 *返回头像物理地址
	 * strImg:图片逻辑地址(及数据库地址)
	 * doc：图片的上一级目录
	 * */
	owner.GetImgSrc = function(doc,strImg)
	{
		return BaseURL + doc + "/" + strImg;
	};
	
	owner.GetSoundSrc = function(doc,strImg)
	{
		return BaseURL + doc + "/" + strImg;
	};
	owner.GetImg = function(imgName)
	{
		var totalUrl = ImgURL + imgName;
		return totalUrl;
	};
	owner.GetGuideImg = function(imgName)
	{
		var totalUrl = ImgURL +"cxh/mobile/images/GuidePage/"+ imgName;
		return totalUrl;
	};
	/*
	 *显示或关闭遮罩
	 * */
	owner.showMask = function()
	{
		mask.show();
		nwaiting = plus.nativeUI.showWaiting("加载中...");
	};
	owner.closeMask = function()
	{
		mask.close();
		nwaiting.close();
	};
}(mui, window.service = {}));
