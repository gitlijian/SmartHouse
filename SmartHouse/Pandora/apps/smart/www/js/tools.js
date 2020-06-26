/*
 * 工具集合 
 * */

(function($, owner) {
	
	//字符串格式化启用
	owner.StringFormatDemo = function(){
		String.prototype.format = function(args) {
		    var result = this;
		    if (arguments.length < 1) {
		        return result;
		    }
		    
		    var data = arguments;       //如果模板参数是数组
		    if (arguments.length == 1 && typeof (args) == "object") {
		        //如果模板参数是对象
		        data = args;
		    }
		    for (var key in data) {
		        var value = data[key];
		        if (undefined != value) {
		            result = result.replace("{" + key + "}", value);
		        }
			}
		    return result;
		}
	};
	
		//刷新页面  参数页面的id 
	owner.UpdateWebView = function(webID){
		var opener = plus.webview.getWebviewById(webID);
		if(opener == null)
		{
			mui.alert("ID not find!");
		}else{
			opener.reload(true);
		}
	};
	
	//安卓返回键绑定事件----begin------------
	owner.goBack = function(){
		var backButtonPress = 0;
		mui.back = function(event) {
			backButtonPress++;
			if (backButtonPress > 1) {
				plus.runtime.quit();
			} else {
				plus.nativeUI.toast('再按一次退出应用');
			}
			setTimeout(function() {
				backButtonPress = 0;
			}, 1000);
			return false;
		};
	}
	//安卓返回键绑定事件----end------------
	
	
}(mui, window.tools = {}));