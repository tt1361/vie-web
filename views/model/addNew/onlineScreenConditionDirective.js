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

    app.directive('onlineScreenCondition', ['$document', '$q', 'dialogService', 'CONSTANT', function ($document, $q, dialogService, CONSTANT) {
        return {
            restrict: 'EA',
            replace: true,
            templateUrl: 'model/addNew/online-screen-condition.htm',
            scope: {
                item: '=',
                index: '@',
                type: '@'
            },
            link: function (scope, element, attrs) {
                $document.find('input').placeholder();
                scope.item.exclude = false;
                var excludeType = angular.copy(scope.item.exclude);
                // uncodeuid;
                scope.uid = Math.floor(Math.random() * 1000) + 1000;
                scope.item.defaultValue = [];
                // 默认全选为true
                scope.allchecked = true;
                if (!scope.item.value) {
                    var value = {
                        checked: false,
                        data: '',
                        type: scope.item.type,
                        isSelect: false
                    };
                    if (scope.item.type === 'range' || scope.item.type === 'timeRange') {
                        value.data = {
                            up: '',
                            low: ''
                        };
                    }

                    if (scope.item.type === 'mulEqu') {
                        value.data = '';
                    }

                    scope.item.defaultValue.push(value);
                }
                else {
                    // 组合维度默认值为对象
                    var val = [];
                    if (scope.item.inputValue) {
                        val = scope.item.inputValue.split(',');
                    }

                    $.each(scope.item.value, function (key, item) {
                        var value = {
                            checked: false,
                            data: item,
                            type: scope.item.type,
                            isSelect: false
                        };
                        if (scope.item.type === 'mulSel' || scope.item.type === 'model') {
                            if ($.inArray(item, val) > -1) {
                                value.checked = true;
                            }
                        }

                        if (scope.item.type === 'radio') {
                            if ($.inArray(item, val) > -1) {
                                value.isSelect = true;
                            }
                        }

                        if (scope.item.type === 'range' || scope.item.type === 'timeRange') {
                            value.data = {
                                up: item.split('~')[1],
                                low: item.split('~')[0]
                            };
                        }

                        if (scope.item.type === 'mulEqu') {
                            if (angular.isUndefined(item.dimValue)) {
                                value.data = item;
                            }
                            else {
                                value.data = item.dimValue;
                            }
                        }

                        scope.item.defaultValue.push(value);
                    });
                }

                angular.forEach(scope.item.defaultValue, function (item) {
                    if (!item.checked) {
                        scope.allchecked = false;
                        return;
                    }

                });

                var showDefaultValue = angular.copy(scope.item.defaultValue); // 中转参数接收
                scope.errrMessage = false;
                scope.$on('tell', function () {
                    scope.errrMessage = true;
                });
                // 下拉列表显示
                scope.showValues = function () {
                    var icon = element.find('.culum-value-wrap');

                    if (icon.hasClass('active')) {
                        icon.removeClass('active');
                        element.find('i.picture-select-down').removeClass('active');
                    }
                    else {
                        icon.addClass('active');
                        element.find('i.picture-select-down').addClass('active');
                    }
                    element.siblings().find('i.picture-select-down').removeClass('active');
                    element.siblings().find('.culum-value-wrap').removeClass('active');
                    // 重新赋值
                    scope.item.defaultValue = angular.copy(showDefaultValue);
                    scope.item.exclude = angular.copy(excludeType);

                    /*石勇 新增 模型上线选择枚举型展开时默认不勾选全选*/
                    if (scope.item.type === 'mulSel' || scope.item.type === 'model') {
                        scope.allchecked = true;
                        angular.forEach(scope.item.defaultValue, function (item) {
                            if (!item.checked) {
                                scope.allchecked = false;
                                return;
                            }

                        });
                    }

                    // 
                };

                // if clicked outside of calendar
                $document.on('click', function (e) {
                    var icon = element.find('.culum-value-wrap');
                    if (!icon.hasClass('active')) {
                        return;
                    }

                    var i = 0,
                        ele;

                    if (!e.target) {
                        return;
                    }

                    for (ele = e.target; ele; ele = ele.parentNode) {
                        // var nodeName = angular.lowercase(element.nodeName)
                        if (angular.lowercase(ele.nodeName) === 'dimension-value' || ele.nodeType === 9) {
                            break;
                        }

                        var uid = scope.$eval(ele.getAttribute('uid'));
                        if (!!uid && uid === scope.uid) {
                            return;
                        }

                    }

                    scope.showValues();
                    scope.$apply();
                });

                // 全选/全不选
                scope.toggleAllChecked = function () {
                    scope.allchecked = !scope.allchecked;
                    angular.forEach(scope.item.defaultValue, function (item) {
                        item.checked = scope.allchecked;
                    });
                };

                // 单选检验
                scope.checkedThis = function (item) {
                    if (!item.checked) {
                        scope.allchecked = false;
                        return;
                    }

                    var allchecked = true;
                    $.each(scope.item.defaultValue, function (key, item) {
                        if (!item.checked) {
                            allchecked = false;
                            return;
                        }

                    });

                    scope.allchecked = allchecked;
                };

                // 获取搜有单选按钮的值
                scope.checkedRadio = function (item) {
                    scope.selectValue = item.data;
                    scope.radioItem = [];
                    scope.radioItem.push(item.data);
                    angular.forEach(scope.item.defaultValue, function (item) {
                        item.isSelect = item.data === scope.selectValue;
                    });
                };

                // 获取全部复选框选中的值
                scope.getAllMulSelItem = function () {
                    scope.mulSelItem = [];
                    angular.forEach(scope.item.defaultValue, function (item) {
                        if (item.checked) {
                            scope.mulSelItem.push(item.data);
                        }

                    });
                };

                // 获取所有输入框的值
                scope.getAllMulEquItem = function () {
                    scope.mulEquItem = [];
                    angular.forEach(scope.item.defaultValue, function (item) {
                        if (!item.data) {
                            scope.isNull = true;
                            return $q.reject(false);
                        }

                        if (CONSTANT.negateReplace.test(item.data) && !item.data.low) {
                            scope.isValid = true;
                            return $q.reject(false);
                        }

                        if (angular.isUndefined(item.data.dimValue)) {
                            scope.mulEquItem.push(item.data);
                        }
                        else {
                            scope.mulEquItem.push(item.data.dimValue);
                        }
                        // scope.mulEquItem.push(item.data.dimValue);
                    });
                };

                // 获取所有区间输入框的值
                scope.getAllRangeItem = function () {
                    scope.rangeItem = [];
                    angular.forEach(scope.item.defaultValue, function (item) {
                        if (!item.data || !item.data.low || !item.data.up) {
                            scope.isNull = true;
                            return $q.reject(false);
                        }

                        if (!/^(0|[1-9][0-9]*)$/.test(item.data.low) || !/^(0|[1-9][0-9]*)$/.test(item.data.up)) {
                            scope.match = false;
                            return;
                        }

                        if (Number(item.data.low) > Number(item.data.up)) {
                            scope.isBig = true;
                            return;
                        }

                        scope.rangeItem.push(item.data.low + '~' + item.data.up);
                    });
                };

                // 新增
                scope.addNew = function () {
                    var addItem = {
                        data: '',
                        type: scope.item.type
                    };
                    scope.item.defaultValue.push(addItem);
                };

                // 删除
                scope.remove = function (index, event) {
                    try {
                        event.stopPropagation();
                    }
                    catch (e) {}
                    scope.item.defaultValue.splice(index, 1);
                };
                // 导入流水号
                scope.leadingVoiceIDout = function () {
                    $('.leadingVoiceIDout').uploadify({
                        height: 40,
                        width: 40,
                        buttonText: '',
                        buttonClass: 'leadingVoiceIDout',
                        auto: true,
                        multi: false,
                        fileObjName: 'uploadify',
                        // buttonClass: 'picture-leading',
                        swf: 'framework/uploadify/uploadify.swf',
                        uploader: 'business/modelImportData/importData',
                        fileTypeDesc: '请选择 .xlsx .txt文件', // 允许上传的文件类型的描述，在弹出的文件选择框里会显示 fileTypeExts: '*.jpg',//允许上传的文件类型，限制弹出文件选择框里能选择的文件
                        fileTypeExts: '*.xlsx;*.txt', // 允许上传的文件类型，限制弹出文件选择框里能选择的文件
                        checkExisting: false,
                        removeTimeout: 0.1,
                        overrideEvents: ['onDialogClose', 'onUploadSuccess', 'onUploadError', 'onSelectError'],
                        onUploadSuccess: function (file, data, response) {
                            scope.$apply(function () {
                                data = eval('(' + data + ')');
                                if (data.success && data.value.length > 0) {
                                    scope.dataInput = data.value;
                                    scope.dataInput = data.value;
                                    scope.item.defaultValue = [];
                                    angular.forEach(scope.dataInput, function (d) {
                                        scope.item.defaultValue.push({
                                            data: d
                                        });
                                    });
                                }
                                else {
                                    dialogService.alert('上传文件超过5000条，请重新上传！');
                                }

                            });
                        },
                        onSelectError: function (file, errorCode, errorMsg) {
                            var msgText = '上传失败\n';
                            switch (errorCode) {
                                case SWFUpload.QUEUE_ERROR.QUEUE_LIMIT_EXCEEDED:
                                    // this.queueData.errorMsg = "每次最多上传 " + this.settings.queueSizeLimit + "个文件";
                                    msgText += '每次最多上传 ' + this.settings.queueSizeLimit + '个文件';
                                    break;
                                case SWFUpload.QUEUE_ERROR.FILE_EXCEEDS_SIZE_LIMIT:
                                    msgText += '文件大小超过限制( ' + this.settings.fileSizeLimit + ' )';
                                    break;
                                case SWFUpload.QUEUE_ERROR.ZERO_BYTE_FILE:
                                    msgText += '文件大小为0';
                                    break;
                                case SWFUpload.QUEUE_ERROR.INVALID_FILETYPE:
                                    msgText += '文件格式不正确，仅限 ' + this.settings.fileTypeExts;
                                    break;
                                default:
                                    msgText += '错误代码：' + errorCode + '\n' + errorMsg;
                            }
                            dialogService.alert(msgText);
                        },
                        onUploadError: function (file, errorCode, errorMsg, errorString) {
                            // 手工取消不弹出提示
                            if (errorCode == SWFUpload.UPLOAD_ERROR.FILE_CANCELLED
                                || errorCode == SWFUpload.UPLOAD_ERROR.UPLOAD_STOPPED) {
                                return;
                            }

                            var msgText = '上传失败\n';
                            switch (errorCode) {
                                case SWFUpload.UPLOAD_ERROR.HTTP_ERROR:
                                    msgText += 'HTTP 错误\n' + errorMsg;
                                    break;
                                case SWFUpload.UPLOAD_ERROR.MISSING_UPLOAD_URL:
                                    msgText += '上传文件丢失，请重新上传';
                                    break;
                                case SWFUpload.UPLOAD_ERROR.IO_ERROR:
                                    msgText += 'IO错误';
                                    break;
                                case SWFUpload.UPLOAD_ERROR.SECURITY_ERROR:
                                    msgText += '安全性错误\n' + errorMsg;
                                    break;
                                case SWFUpload.UPLOAD_ERROR.UPLOAD_LIMIT_EXCEEDED:
                                    msgText += '每次最多上传 ' + this.settings.uploadLimit + '个';
                                    break;
                                case SWFUpload.UPLOAD_ERROR.UPLOAD_FAILED:
                                    msgText += errorMsg;
                                    break;
                                case SWFUpload.UPLOAD_ERROR.SPECIFIED_FILE_ID_NOT_FOUND:
                                    msgText += '找不到指定文件，请重新操作';
                                    break;
                                case SWFUpload.UPLOAD_ERROR.FILE_VALIDATION_FAILED:
                                    msgText += '参数错误';
                                    break;
                                default:
                                    msgText += '文件:' + file.name + '\n错误码:' + errorCode + '\n'
                                        + errorMsg + '\n' + errorString;
                            }
                            dialogService.alert(msgText);
                        }
                    });
                };

                // 导入手机号
                scope.leadingcallNumberout = function () {
                    $('.leadingcallNumberout').uploadify({
                        height: 40,
                        width: 40,
                        buttonText: '',
                        buttonClass: 'leadingcallNumberout',
                        auto: true,
                        multi: false,
                        fileObjName: 'uploadify',
                        // buttonClass: 'picture-leading',
                        swf: 'framework/uploadify/uploadify.swf',
                        uploader: 'business/modelImportData/importData',
                        fileTypeDesc: '请选择 xlsx txt文件', // 允许上传的文件类型的描述，在弹出的文件选择框里会显示 fileTypeExts: '*.jpg',//允许上传的文件类型，限制弹出文件选择框里能选择的文件
                        fileTypeExts: '*.xlsx;*.txt', // 允许上传的文件类型，限制弹出文件选择框里能选择的文件
                        checkExisting: false,
                        removeTimeout: 0.1,
                        overrideEvents: ['onDialogClose', 'onUploadSuccess', 'onUploadError', 'onSelectError'],
                        onUploadSuccess: function (file, data, response) {
                            scope.$apply(function () {
                                data = eval('(' + data + ')');
                                if (data.success && data.value.length > 0) {
                                    scope.dataInput = data.value;
                                    scope.dataInput = data.value;
                                    scope.item.defaultValue = [];
                                    angular.forEach(scope.dataInput, function (d) {
                                        scope.item.defaultValue.push({
                                            data: d
                                        });
                                    });
                                }
                                else {
                                    dialogService.alert('上传文件超过5000条，请重新上传！');
                                }
                            });
                            $('.leading-error').css('display', 'none');
                        },
                        onSelectError: function (file, errorCode, errorMsg) {
                            var msgText = '上传失败\n';
                            switch (errorCode) {
                                case SWFUpload.QUEUE_ERROR.QUEUE_LIMIT_EXCEEDED:
                                    // this.queueData.errorMsg = "每次最多上传 " + this.settings.queueSizeLimit + "个文件";
                                    msgText += '每次最多上传 ' + this.settings.queueSizeLimit + '个文件';
                                    break;
                                case SWFUpload.QUEUE_ERROR.FILE_EXCEEDS_SIZE_LIMIT:
                                    msgText += '文件大小超过限制( ' + this.settings.fileSizeLimit + ' )';
                                    break;
                                case SWFUpload.QUEUE_ERROR.ZERO_BYTE_FILE:
                                    msgText += '文件大小为0';
                                    break;
                                case SWFUpload.QUEUE_ERROR.INVALID_FILETYPE:
                                    msgText += '文件格式不正确，仅限 ' + this.settings.fileTypeExts;
                                    break;
                                default:
                                    msgText += '错误代码：' + errorCode + '\n' + errorMsg;
                            }
                            dialogService.alert(msgText);
                        },
                        onUploadError: function (file, errorCode, errorMsg, errorString) {
                            // 手工取消不弹出提示
                            if (errorCode == SWFUpload.UPLOAD_ERROR.FILE_CANCELLED
                                || errorCode == SWFUpload.UPLOAD_ERROR.UPLOAD_STOPPED) {
                                return;
                            }

                            var msgText = '上传失败\n';
                            switch (errorCode) {
                                case SWFUpload.UPLOAD_ERROR.HTTP_ERROR:
                                    msgText += 'HTTP 错误\n' + errorMsg;
                                    break;
                                case SWFUpload.UPLOAD_ERROR.MISSING_UPLOAD_URL:
                                    msgText += '上传文件丢失，请重新上传';
                                    break;
                                case SWFUpload.UPLOAD_ERROR.IO_ERROR:
                                    msgText += 'IO错误';
                                    break;
                                case SWFUpload.UPLOAD_ERROR.SECURITY_ERROR:
                                    msgText += '安全性错误\n' + errorMsg;
                                    break;
                                case SWFUpload.UPLOAD_ERROR.UPLOAD_LIMIT_EXCEEDED:
                                    msgText += '每次最多上传 ' + this.settings.uploadLimit + '个';
                                    break;
                                case SWFUpload.UPLOAD_ERROR.UPLOAD_FAILED:
                                    msgText += errorMsg;
                                    break;
                                case SWFUpload.UPLOAD_ERROR.SPECIFIED_FILE_ID_NOT_FOUND:
                                    msgText += '找不到指定文件，请重新操作';
                                    break;
                                case SWFUpload.UPLOAD_ERROR.FILE_VALIDATION_FAILED:
                                    msgText += '参数错误';
                                    break;
                                default:
                                    msgText += '文件:' + file.name + '\n错误码:' + errorCode + '\n'
                                        + errorMsg + '\n' + errorString;
                            }
                            dialogService.alert(msgText);
                        }
                    });
                };
                // 清空，还原默认
                scope.removeAll = function () {
                    try {
                        event.stopPropagation();
                    }
                    catch (e) {}
                    scope.item.defaultValue = [];
                };
                // 点击每个下拉列表的确定按钮获取编辑的值
                scope.chooseDimension = function () {
                    scope.chooseItem = [];
                    scope.isBig = false;
                    scope.isNull = false;
                    scope.isValid = false;
                    scope.match = true;
                    var mark = true;

                    if (scope.item.type === 'mulSel' || scope.item.type === 'model') {
                        scope.getAllMulSelItem();
                        scope.chooseItem = scope.mulSelItem;
                        if (!scope.chooseItem.length) {
                            // dialogService.alert("您还未选择任何值");
                            scope.item.inputValue = '';
                            showDefaultValue = angular.copy(scope.item.defaultValue);
                            excludeType = angular.copy(scope.item.exclude);
                            scope.showValues();
                            var $scope = scope;
                            if (angular.isUndefined($scope.preview)) {
                                $scope = $scope.$parent;
                                mark = false;
                                $scope.$emit('previewIsNull', mark);
                            }

                            // $scope.preview();
                            return;
                        }
                    }

                    if (scope.item.type === 'mulEqu') {
                        scope.getAllMulEquItem();
                        scope.chooseItem = scope.mulEquItem;
                        if (scope.isNull) {
                            dialogService.alert('存在未输入值的项');
                            showDefaultValue = angular.copy(scope.item.defaultValue);
                            excludeType = angular.copy(scope.item.exclude);
                            return;
                        }
                        if (scope.isValid) {
                            dialogService.alert('存在输入格式不正确的项，不能输入特殊字符');
                            scope.item.inputValue = '';
                            showDefaultValue = angular.copy(scope.item.defaultValue);
                            excludeType = angular.copy(scope.item.exclude);
                            return;
                        }

                        if (!scope.chooseItem.length) {
                            scope.item.inputValue = '';
                            showDefaultValue = angular.copy(scope.item.defaultValue);
                            excludeType = angular.copy(scope.item.exclude);
                            scope.showValues();
                            var $scope = scope;
                            // while(angular.isUndefined($scope.preview)){
                            //     $scope = $scope.$parent;
                            // }
                            // $scope.preview();
                            dialogService.alert('您还未输入任何值');
                            return;
                        }
                    }

                    if (scope.item.type === 'radio' || scope.item.type === 'timeRadio') {
                        scope.chooseItem = scope.radioItem || [];
                        if (!scope.chooseItem.length) {
                            // dialogService.alert("您还未选择任何值");
                            scope.item.inputValue = '';
                            showDefaultValue = angular.copy(scope.item.defaultValue);
                            excludeType = angular.copy(scope.item.exclude);
                            scope.showValues();
                            var $scope = scope;
                            if (angular.isUndefined($scope.preview)) {
                                $scope = $scope.$parent;
                                mark = false;
                                $scope.$emit('previewIsNull', mark);
                            }

                            // $scope.preview();
                            return;
                        }
                    }

                    if (scope.item.type === 'range' || scope.item.type === 'timeRange') {
                        scope.getAllRangeItem();
                        scope.chooseItem = scope.rangeItem;

                        if (scope.isNull) {
                            dialogService.alert('存在未输入值的项');
                            scope.item.inputValue = '';
                            showDefaultValue = angular.copy(scope.item.defaultValue);
                            excludeType = angular.copy(scope.item.exclude);
                            return;
                        }

                        if (scope.isBig) {
                            dialogService.alert('存在开始值大于结束值的项');
                            scope.item.inputValue = '';
                            showDefaultValue = angular.copy(scope.item.defaultValue);
                            excludeType = angular.copy(scope.item.exclude);
                            return;
                        }

                        if (!scope.match) {
                            dialogService.alert('存在输入格式不正确的项，只能输入非负整数');
                            scope.item.inputValue = '';
                            showDefaultValue = angular.copy(scope.item.defaultValue);
                            excludeType = angular.copy(scope.item.exclude);
                            return;
                        }

                        if (!scope.chooseItem.length) {
                            // dialogService.alert("您还未输入任何值");
                            scope.item.inputValue = '';
                            showDefaultValue = angular.copy(scope.item.defaultValue);
                            excludeType = angular.copy(scope.item.exclude);
                            scope.showValues();
                            var $scope = scope;
                            if (angular.isUndefined($scope.preview)) {
                                $scope = $scope.$parent;
                                mark = false;
                                $scope.$emit('previewIsNull', mark);
                            }

                            // $scope.preview();
                            return;
                        }
                    }

                    if (scope.chooseItem.length) {
                        if (scope.item.exclude) {
                            scope.item.inputValue = '!(' + scope.chooseItem.join(',') + ')';
                        }
                        else {
                            scope.item.inputValue = scope.chooseItem.join(',');
                        }
                        if (scope.item.type === 'range' || scope.item.type === 'mulEqu') {
                            scope.item.value = scope.chooseItem;
                            scope.item.chooseValue = scope.chooseItem;
                        }
                        else {
                            scope.item.chooseValue = scope.chooseItem;
                        }
                    }
                    else {
                        if (scope.item.type === 'range' || scope.item.type === 'mulEqu') {
                            scope.item.value = scope.chooseItem;
                            scope.item.chooseValue = scope.chooseItem;
                        }
                        else {
                            scope.item.chooseValue = scope.chooseItem;
                        }
                    }
                    showDefaultValue = angular.copy(scope.item.defaultValue);
                    excludeType = angular.copy(scope.item.exclude);
                    scope.showValues();

                    /*var $scope = scope;
                     while(angular.isUndefined($scope.preview)){
                     $scope = $scope.$parent;
                     }
                     $scope.preview();*/
                    scope.$emit('previewIsNull', mark);
                    // scope.$emit('previewIsNull',mark);

                };
                // 排除与包含的切换
                scope.changeType = function (e) {
                    scope.item.exclude = !scope.item.exclude;
                    var par = {name: e, exc: scope.item.exclude};
                    scope.$emit('excludeChanged', par);
                };
                // 删除条件
                scope.delCondition = function () {
                    scope.$parent.preDimensions.splice(scope.index, 1);
                    var $scope = scope;
                    while (angular.isUndefined($scope.dimensionHeight)) {
                        $scope = $scope.$parent;
                    }
                    $scope.dimensionHeight();
                };

            }
        };
    }]);

});
