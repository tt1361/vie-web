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
    app.service('silenceService', ['dialogService', 'modelConstant', function (dialogService, modelConstant) {

        return {

            /*组合验证规则*/
            combinationRule: function (condition, type) {
                // 关键词编码
                var keyCode = type === 'zi' ? modelConstant.MODEL_SILENCE_CODE.KEYWORD_ZI : modelConstant.MODEL_SILENCE_CODE.KEYWORD_CI;
                // 关键词列表编码
                var listPropCode = type === 'zi' ? modelConstant.MODEL_SILENCE_CODE.PROP_LIST_ZI : modelConstant.MODEL_SILENCE_CODE.PROP_LIST_CI;
                // 静音编码
                var muteCode = type === 'zi' ? modelConstant.MODEL_SILENCE_CODE.MUTE_ZI : modelConstant.MODEL_SILENCE_CODE.MUTE_CI;
                // 静音大小或数值编码
                var valuePropCode = type === 'zi' ? modelConstant.MODEL_SILENCE_CODE.PROP_VALUE_ZI : modelConstant.MODEL_SILENCE_CODE.PROP_VALUE_CI;

                /*石勇 新增 语速音量的初始值*/
                // 语速编码
                var speedCode = modelConstant.MODEL_SILENCE_CODE.SPEED_ZI;
                // 语速平均
                var speedAverage = modelConstant.MODEL_SILENCE_CODE.SPEED_AVERAGE_ZI;
                // 语速单句
                var speedOne = modelConstant.MODEL_SILENCE_CODE.SPEED_ONE_ZI;
                // 语速次数
                var speedNumber = modelConstant.MODEL_SILENCE_CODE.SPEED_NUMBER_ZI;
                // 音量编码
                var volumeCode = modelConstant.MODEL_SILENCE_CODE.VOLUME_ZI;
                // 音量分贝
                var volumeDecibel = modelConstant.MODEL_SILENCE_CODE.VOLUME_DECIBEL_ZI;
                // 声道编码
                var trackCode = modelConstant.MODEL_SILENCE_CODE.PROP_TRACK_ZI;

                /**/

                // 数值或大小提示
                var tip = type === 'zi' ? '数值' : '大小';
                var isErroe = false;

                angular.forEach(condition, function (screen) {
                    var isSelectList = false,
                        isSelectValue = false,
                        isSelectSpeedTrack = false,
                        isSelectVolumeTrack = false,
                        isSelectSpeedOneOrAverage = false,
                        isSelectVolumeDecibel = false;

                    if (isErroe) {
                        return;
                    }

                    if (!screen.dimensionName) {
                        dialogService.alert(screen.name + '未选择质检项');
                        isErroe = true;
                        return;
                    }

                    if (screen.dimensionCode === speedCode) {
                        angular.forEach(screen.options, function (option) {
                            if (option.propertyCode === speedAverage) {
                                angular.forEach(screen.options, function (option1) {
                                    if (!isErroe && option1.propertyCode === speedOne) {
                                        dialogService.alert(screen.name + '的"平均"属性和"单句"属性不能同时选择。');
                                        isErroe = true; // 用来确定是否发送请求，为true时不发送
                                        return;
                                    }

                                    if (!isErroe && option1.propertyCode === speedNumber) {
                                        dialogService.alert(screen.name + '的"平均"属性和"次数"属性不能同时选择。');
                                        isErroe = true; // 用来确定是否发送请求，为true时不发送
                                        return;
                                    }

                                });
                            }

                        });
                    }

                    angular.forEach(screen.options, function (option) {
                        if (!isErroe) {
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
                                    else if (/^#/.test(option.inputValue) || /#$/.test(option.inputValue)) {
                                        dialogService.alert(screen.name + '的"' + option.propertyName + '"属性 #运算符前、后均需要有汉字、数字或英文字母');
                                        isErroe = true;
                                        return;
                                    }
                                    else if (/^\|/.test(option.inputValue) || /\|$/.test(option.inputValue)) {
                                        dialogService.alert(screen.name + '的"' + option.propertyName + '"属性 |符号前、后均需要有汉字、数字或英文字母');
                                        isErroe = true;
                                        return;
                                    }
                                    else if (/#{2,}/.test(option.inputValue)) {
                                        dialogService.alert(screen.name + '的"' + option.propertyName + '"属性不可连续使用多个#');
                                        isErroe = true;
                                        return;
                                    }
                                    else if (/\|{2,}/.test(option.inputValue)) {
                                        dialogService.alert(screen.name + '的"' + option.propertyName + '"属性不可连续使用多个|');
                                        isErroe = true;
                                        return;
                                    }
                                    else if (/\|#/.test(option.inputValue)) {
                                        dialogService.alert(screen.name + '的"' + option.propertyName + '"属性包含错误运算符组合"|#');
                                        isErroe = true;
                                        return;
                                    }
                                    else if (/#\|/.test(option.inputValue)) {
                                        dialogService.alert(screen.name + '的"' + option.propertyName + '"属性包含错误运算符组合"#|"');
                                        isErroe = true;
                                        return;
                                    }
                                }
                                else if (screen.dimensionCode === speedCode && (option.propertyCode === speedAverage || option.propertyCode === speedOne)) {
                                    if (!/^(([0-9]+)|([0-9]+\.[0-9]{1,2}))$/.test(option.inputValue)) {
                                        dialogService.alert(screen.name + '的"' + option.propertyName + '"属性只能输入到小数点后两位的非负数。');
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

                            /*石勇 新增*/
                            if (screen.dimensionCode === speedCode) { // 语速必须选择声道
                                if (option.propertyCode === trackCode) {
                                    isSelectSpeedTrack = true;
                                }
                            }

                            if (screen.dimensionCode === volumeCode) { // 音量必须选择声道
                                if (option.propertyCode === trackCode) {
                                    isSelectVolumeTrack = true;
                                }
                            }

                            if (screen.dimensionCode === speedCode) { // 语速必须选择单句或平均
                                if (option.propertyCode === speedOne || option.propertyCode === speedAverage) {
                                    isSelectSpeedOneOrAverage = true;
                                }
                            }

                            if (screen.dimensionCode === volumeCode) { // 音量必须选择分贝
                                if (option.propertyCode === volumeDecibel) {
                                    isSelectVolumeDecibel = true;
                                }
                            }

                            /**/
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

                        /*石勇 新增*/
                        if (!isSelectSpeedTrack && screen.dimensionCode === speedCode) {
                            dialogService.alert('请先选择语速声道');
                            isErroe = true;
                            return;
                        }

                        if (!isSelectVolumeTrack && screen.dimensionCode === volumeCode) {
                            dialogService.alert('请先选择音量声道');
                            isErroe = true;
                            return;
                        }

                        if (!isSelectSpeedOneOrAverage && screen.dimensionCode === speedCode) {
                            dialogService.alert('请先选择语速平均或单句属性');
                            isErroe = true;
                            return;
                        }

                        if (!isSelectVolumeDecibel && screen.dimensionCode === volumeCode) {
                            dialogService.alert('请先选择音量分贝属性');
                            isErroe = true;
                            return;
                        }

                        /**/
                    }

                });
                return isErroe;
            }
        };
    }
    ]);

});
