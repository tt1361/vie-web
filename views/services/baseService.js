/**
*  封装$http请求
*   @params:
*       url:  http请求服务url
*       params: $hhtp请求服务参数
*
*/
(function (factory) {
    if (typeof define === 'function' && !!define.amd) {
        define([
            'app'
        ], factory);
    }
    else {
        factory(window.app);
    }
})(function (app) {

    app.service('baseService', ['$http', '$rootScope', '$q', '$timeout', 'dialogService', 'CONSTANT', function ($http, $rootScope, $q, $timeout, dialogService, CONSTANT) {

        return {

            /*get请求有参数*/
            getHttp: function (url, params) {
                return $http.get(url, params)
                    .then(function (response) {
                        if (response.status === 200 && response.data.success) {
                            return response.data;
                        }

                        dialogService.error(response.data.message);
                        return $q.reject(response);
                    });
            },

            /*post请求有参数*/
            postHttp: function (url, params) {
                return $http.post(url, params)
                    .then(function (response) {
                        if (response.status === 200 && response.data.success) {
                            return response.data;
                        }

                        dialogService.error(response.data.message);
                        return $q.reject(response);
                    });
            },

            /*成功失败都有返回值*/
            postHttpNoReject: function (url, params) {
                return $http.post(url, params)
                    .then(function (response) {
                        if (response.status === 200 && response.data.success) {
                            return true;
                        }

                        return false;
                    });
            },

            /*接口返回错误没有弹窗*/
            postHttpNoDialog: function (url, params) {
                return $http.post(url, params)
                    .then(function (response) {
                        if (response.status === 200 && response.data.success) {
                            return response.data;
                        }

                        return $q.reject(response);
                    });
            },

            /*校验搜索字段规则*/
            validWord: function (word) {
                if (word) {
                    if (word.replace(/[^\x00-\xff]/g, 'xx').length > 100) {
                        dialogService.alert(CONSTANT.SEARCH_WORD_MAXLENGTH);
                        return false;
                    }

                    if (CONSTANT.textReplace.test(word)) {
                        dialogService.alert(CONSTANT.SEARCH_WORD_UNVALID);
                        return false;
                    }
                }

                return true;
            },

            /*获取最近一周时间*/
            getSystemTime: function () {
                var timesRange = {
                    defaultStart: $rootScope.systemDate && $rootScope.systemDate != '${systemDate}' ? $.datepicker.formatDate('yy-mm-dd', new Date(new Date($rootScope.systemDate).getTime() - 7 * 24 * 3600 * 1000)) : $.datepicker.formatDate('yy-mm-dd', new Date(new Date().getTime() - 7 * 24 * 3600 * 1000)),
                    defaultEnd: $rootScope.systemDate && $rootScope.systemDate != '${systemDate}' ? $rootScope.systemDate : $.datepicker.formatDate('yy-mm-dd', new Date())
                };
                return timesRange;
            },

            /*设置页面title,兼容ie8*/
            fixTitle: function () {
                var originalTitle = 'VIE';
                var ie = navigator.appName === 'Microsoft Internet Explorer' ? true : false;
                if (ie) {
                    document.title = originalTitle;
                    document.attachEvent('onpropertychange', function (evt) {
                        evt = evt || window.event;
                        if (evt.propertyName === 'title' && document.title !== originalTitle) {
                            setTimeout(function () {
                                document.title = originalTitle;
                            }, 1);
                        }

                    });
                }

            },

            /*获取光标位置*/
            getOffsetPointer: function (_mOffset) {
                if (document.selection) {
                    var OffsetObject = new Object();
                    var _allText = _mOffset.value; // 输入框的所有值
                    _mOffset.focus(); // 输入框获得焦点
                    var s = _mOffset.scrollTop; // 获得滚动条的位置
                    var _rOffset = document.selection.createRange(); // 创建文档选择对象根据当前文字选择返回 TextRange 对象
                    var _tOffset = _mOffset.createTextRange(); // 创建输入框文本对象
                    _tOffset.collapse(true); // 将光标移到头
                    _tOffset.select(); // 显示光标，整体选中
                    var _nOffset = document.selection.createRange(); // 鼠标选中textarea的左上位置。
                    _rOffset.setEndPoint('StartToStart', _nOffset); // 把原本选中的范围的开始位置拉伸到textarea的开始位置。
                    var _leftText = _rOffset.text.replace(/\r\n/g, ''); // 获得文档选择对象的文本(从鼠标焦点到文档开头的文本)
                    // alert(_rOffset.text);     //文档开头到鼠标焦点位置文本
                    var leFTPos = _leftText.length; // 文档开头到鼠标焦点的文本长度
                    var _rightText = _allText.substring(leFTPos); // 获取鼠标焦点到文档结束的文本
                    // alert(_rightText)
                    OffsetObject.length = leFTPos;
                    OffsetObject.scrollTop = s;
                    OffsetObject.leftValue = _leftText;
                    OffsetObject.rightValue = _rightText;
                    _tOffset.moveStart('character', leFTPos); // 将开始点移动到位置。  光标还在原位置。 位置计算好几个\R\N，加上
                    _tOffset.collapse(true);
                    _tOffset.select();
                    return leFTPos;
                }

                return _mOffset.selectionStart; // 非ie下获得鼠标点击位置
            },

            /*计算高度*/
            calculationHeight: function (el, hgt, time) {
                $timeout(function () {
                    var height = angular.element(el).height();
                    if (height >= hgt) {
                        angular.element(el).addClass('scroll');
                    }
                    else {
                        angular.element(el).removeClass('scroll');
                    }
                }, time);
            }
        };
    }]);

});
