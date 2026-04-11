/**
 * Created by hlhu on 2016/3/27.
 * update by gangwang11 2017/10/24.
 */



$(function () {
    var Base64 = {
        // private property
        _keyStr: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=",

        // public method for encoding
        encode: function(input) {
            var output = "";
            var chr1, chr2, chr3, enc1, enc2, enc3, enc4;
            var i = 0;
            input = Base64._utf8_encode(input);

            while (i < input.length) {
                chr1 = input.charCodeAt(i++);
                chr2 = input.charCodeAt(i++);
                chr3 = input.charCodeAt(i++);

                enc1 = chr1 >> 2;
                enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
                enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
                enc4 = chr3 & 63;

                if (isNaN(chr2)) {
                    enc3 = enc4 = 64;
                } else if (isNaN(chr3)) {
                    enc4 = 64;
                }
                output = output + this._keyStr.charAt(enc1) + this._keyStr.charAt(enc2) + this._keyStr.charAt(enc3) + this._keyStr.charAt(enc4);
            }
            return output;
        },

        // public method for decoding
        decode: function(input) {
            var output = "";
            var chr1, chr2, chr3;
            var enc1, enc2, enc3, enc4;
            var i = 0;
            input = input.replace(/[^A-Za-z0-9\+\/\=]/g, "");
            while (i < input.length) {
                enc1 = this._keyStr.indexOf(input.charAt(i++));
                enc2 = this._keyStr.indexOf(input.charAt(i++));
                enc3 = this._keyStr.indexOf(input.charAt(i++));
                enc4 = this._keyStr.indexOf(input.charAt(i++));
                chr1 = (enc1 << 2) | (enc2 >> 4);
                chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
                chr3 = ((enc3 & 3) << 6) | enc4;
                output = output + String.fromCharCode(chr1);
                if (enc3 != 64) {
                    output = output + String.fromCharCode(chr2);
                }
                if (enc4 != 64) {
                    output = output + String.fromCharCode(chr3);
                }
            }
            output = Base64._utf8_decode(output);
            return output;
        },

        // private method for UTF-8 encoding
        _utf8_encode: function(string) {
            string = string.replace(/\r\n/g, "\n");
            var utftext = "";
            for (var n = 0; n < string.length; n++) {
                var c = string.charCodeAt(n);
                if (c < 128) {
                    utftext += String.fromCharCode(c);
                } else if ((c > 127) && (c < 2048)) {
                    utftext += String.fromCharCode((c >> 6) | 192);
                    utftext += String.fromCharCode((c & 63) | 128);
                } else {
                    utftext += String.fromCharCode((c >> 12) | 224);
                    utftext += String.fromCharCode(((c >> 6) & 63) | 128);
                    utftext += String.fromCharCode((c & 63) | 128);
                }
            }
            return utftext;
        },

        // private method for UTF-8 decoding
        _utf8_decode: function(utftext) {
            var string = "";
            var i = 0;
            var c = c1 = c2 = 0;

            while (i < utftext.length) {

                c = utftext.charCodeAt(i);

                if (c < 128) {
                    string += String.fromCharCode(c);
                    i++;
                } else if ((c > 191) && (c < 224)) {
                    c2 = utftext.charCodeAt(i + 1);
                    string += String.fromCharCode(((c & 31) << 6) | (c2 & 63));
                    i += 2;
                } else {
                    c2 = utftext.charCodeAt(i + 1);
                    c3 = utftext.charCodeAt(i + 2);
                    string += String.fromCharCode(((c & 15) << 12) | ((c2 & 63) << 6) | (c3 & 63));
                    i += 3;
                }
            }
            return string;
        }
    }
    /*初始化隐藏数据源选择界面*/
    $(".dataSource-container").hide();
    $(".backgroundColor").hide();
    $(".login-container").show();
    /*查询业务*/
    var dataSource = "";
    var dimensionName = "";

    function AES_Encrypt(plainText){
    var key="1234567890123456";
    var iv="1234567890123456";
    var keyWordArray=CryptoJS.enc.Utf8.parse(key);
    var ivWordArray=CryptoJS.enc.Utf8.parse(iv);
    var encrypted=CryptoJS.AES.encrypt(plainText,keyWordArray,{iv:ivWordArray,mode:CryptoJS.mode.CBC,padding:CryptoJS.pad.Pkcs7});
    return encrypted.toString();
    }

    function loginGetUser(){
        var userName = $("#username").val();
        var pwd = $("#password").val();
        if(userName == ''){
            alert("请输入账号");
            return;
        }
        if(pwd == ''){
            alert("请输入密码");
            return;;
        }
        /*用户登陆验证*/
        $.ajax({
            type: "POST",
            url: "loginIn",
            data: {
                accountName: AES_Encrypt(userName),
                password: AES_Encrypt(pwd)
            },
            success: function (data) {
                if (data.success) {
                    var html ="";
                    var dataSourceList = "";

                    $.ajax({
                        type: "POST",
                        url: "datasource/getUserDataSourceList",
                        success:function(data){
                            dataSourceList = data.value;
                            $.each(dataSourceList,function(m,n){
                                html += "<span class='dataSourceSpan'" + " title='" + n.name  + "' id="+ n.businessCode + " data-name='" + n.dimensionName +"'" + ">" + n.name + "</span>";
                            });
                            $(".dataSource-content").html("");
                            $(".dataSource-content").append(html);
                            $(".dataSource-content span").click(function(e){
                                $(".error").hide();
                                dataSource = e.target.id;
                                dimensionName = $("#" + dataSource).data('name');
                                $(".dataSourceSpan").siblings().removeClass("action");
                                $(this).addClass("action");
                            });
                        }
                    });
                    $(".login-container").hide();
                    $(".dataSource-container").show(200);
                    $(".dataSource-footer span").click(function(){
                        if(dataSource){
                            /*选择数据源*/
                            $.ajax({
                                type: "POST",
                                url: "datasource/changeUserDataSource",
                                data:{
                                    dataSource:dataSource,
                                    dimensionName:dimensionName
                                },
                                success:function(data){
                                    if(data.success){
                                        window.location.href = "dataSource?r="+ new Date().getTime();
                                    }else {
                                        alert(data.message);
                                    }
                                }
                            });
                            window.localStorage.removeItem("setDataSource");
                            var str = JSON.stringify(dataSource);
                            // window.localStorage.setItem("setDataSource", str);
                            $.cookie("setDataSource", str, {expires: 7});
                        }else{
                            alert("请选择业务");
                        }
                    });
                }
                else {
                    alert(data.message);
                }
            }
        });
    }
    $('.required').bind('keyup', function(event) {
        if (event.keyCode == 13 || event.which == 13) {
            loginGetUser();
        }

    });
    $("#button_submit").click(function () {
        loginGetUser();
    });
});
