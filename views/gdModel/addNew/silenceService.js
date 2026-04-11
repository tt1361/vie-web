/**
 * 本文件实现依赖任何一个 Angular 的module, 如果不采用本系统的框架，
 *      可以可以在  factory(window.app) app 修改你所创建的模块名称
 *  @dependece: Angular Module
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

    /**
    *  silenceService 实现模型与后台交互的接口
    *   @params:
    *       $http:  http请求服务Service
    *       baseService: 自定义的基础服务，封装$http请求
    *
    */
    app.service('silenceService', ['dialogService', 'gdModelConstant', function (dialogService, gdModelConstant) {

        return {

            /*组合验证规则*/
            combinationRule: function (condition, type) {
                // 关键词编码
                var keyCode = type === 'zi' ? gdModelConstant.MODEL_SILENCE_CODE.KEYWORD_ZI : gdModelConstant.MODEL_SILENCE_CODE.KEYWORD_CI;
                // 关键词列表编码
                var listPropCode = type === 'zi' ? gdModelConstant.MODEL_SILENCE_CODE.PROP_LIST_ZI : gdModelConstant.MODEL_SILENCE_CODE.PROP_LIST_CI;
                // 静音编码
                var muteCode = type === 'zi' ? gdModelConstant.MODEL_SILENCE_CODE.MUTE_ZI : gdModelConstant.MODEL_SILENCE_CODE.MUTE_CI;
                // 静音大小或数值编码
                var valuePropCode = type === 'zi' ? gdModelConstant.MODEL_SILENCE_CODE.PROP_VALUE_ZI : gdModelConstant.MODEL_SILENCE_CODE.PROP_VALUE_CI;
                // 数值或大小提示
                var tip = type === 'zi' ? '数值' : '大小';
                var isErroe = false;
                var isSelectList = false;
                var isSelectValue = false;
                angular.forEach(condition, function (screen) {
                    if (isErroe) {
                        return;
                    }

                    if (!screen.dimensionName) {
                        dialogService.alert(screen.name + '未选择质检项');
                        isErroe = true;
                        return;
                    }

                    angular.forEach(screen.options, function (option) {
                        if (!option.propertyName) {
                            dialogService.alert(screen.name + '中包含未选择的属性');
                            isErroe = true;
                            return;
                        }

                        if (!option.flag) {
                            if (!option.inputValue) {
                                dialogService.alert(screen.name + '的"' + option.propertyName + '"属性没有填写，请输入内容。');
                                isErroe = true;
                                return;
                            }

                            if (screen.dimensionCode === keyCode && option.propertyCode === listPropCode) { // 关键词列表规则验证
                                if (!/^[\u4e00-\u9fa5|#a-zA-Z0-9]+$/.test(option.inputValue)) {
                                    dialogService.alert(screen.name + '的"' + option.propertyName + '"属性只能输入汉字、数字、英文、|、#这五类。');
                                    isErroe = true;
                                    return;
                                }
                            }
                            else {
                                if (!/^(0|[1-9][0-9]*)$/.test(option.inputValue)) {
                                    dialogService.alert(screen.name + '的"' + option.propertyName + '"属性只能输入非负整数。');
                                    isErroe = true;
                                    return;
                                }
                            }

                            if (Number(option.inputValue) > 2147483647) {
                                dialogService.alert(screen.name + '的"' + option.propertyName + '"属性值过大。');
                                isErroe = true;
                                return;
                            }
                        }

                        if (screen.dimensionCode === keyCode) { // 关键词必须选择列表
                            if (option.propertyCode === listPropCode) {
                                isSelectList = true;
                            }
                        }

                        if (screen.dimensionCode === muteCode) { // 静音必须能选择数值或大小
                            if (option.propertyCode === valuePropCode) {
                                isSelectValue = true;
                            }
                        }

                    });

                    if (!isErroe) {
                        if (!isSelectList && screen.dimensionCode === keyCode) {
                            dialogService.alert('请先选择关键词列表');
                            isErroe = true;
                            return;
                        }

                        if (!isSelectValue && screen.dimensionCode === muteCode) {
                            dialogService.alert('请先选择静音' + tip);
                            isErroe = true;
                            return;
                        }
                    }

                });
                return isErroe;
            }
        };
    }
    ]);

});
