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
    *  本文件中的Controller 实现so
    *
    */
    app.directive('dimSet', ['$document', '$http', '$q', '$timeout', 'dialogService', 'CONSTANT', function ($document, $http, $q, $timeout, dialogService, CONSTANT) {
        return {
            restrict: 'EA',
            replace: true,
            templateUrl: 'search/advance/dimension-set-directive.htm',
            scope: {
                item: '='
            },
            link: function (scope, element, attrs) {
                $timeout(function () {
                    $document.find('input').placeholder();
                }, 500);

                if (!scope.item.exclude) {
                    scope.item.exclude = false;
                }

                var excludeType = angular.copy(scope.item.exclude);

                // uncodeuid;
                scope.uid = Math.floor(Math.random() * 1000) + 1000;
                scope.allchecked = true;
                scope.allcheckedModel = true;
                scope.defaultValue = [];
                // scope.item.value = angular.copy(scope.item).value;
                var showDefaultValue = []; // 中转参数接收
                if (!scope.item.defaultValue || !scope.item.defaultValue.length) {
                    if (scope.item.type === 'mulSel' || scope.item.type === 'model' || scope.item.type === 'radio' || scope.item.type === 'offLineTagId') {
                        angular.forEach(scope.item.value, function (item) {
                            scope.defaultValue.push({
                                checked: false,
                                data: item,
                                type: scope.item.type,
                                isSelect: false
                            });
                        });
                    }
                    else {
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

                        scope.defaultValue.push(value);
                    }

                    scope.item.defaultValue = scope.defaultValue;
                }

                showDefaultValue = angular.copy(scope.item.defaultValue);

                scope.isAllChecked = function () {
                    scope.allchecked = true;
                    angular.forEach(scope.item.defaultValue, function (item) {
                        if (!item.checked) {
                            scope.allchecked = false;
                        }

                    });
                };

                // 展开收起
                scope.toggleOpened = function (index) {
                    scope.item.defaultValue[index].isOpen = !scope.item.defaultValue[index].isOpen;
                };

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
                    scope.allchecked = true;
                    scope.allcheckedModel = true;
                    angular.forEach(scope.item.defaultValue, function (item) {
                        if (!item.checked && item.type != 'offLineTagId') {
                            scope.allchecked = false;
                            return;
                        }

                        if (item.type == 'offLineTagId') { // 增加对模型的全选判断
                            angular.forEach(item.data.value, function (i) {
                                if (!i.isSelect) {
                                    scope.allcheckedModel = false;
                                    return;
                                }

                            });
                        }

                    });
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
                        if (angular.lowercase(ele.nodeName) === 'dim-set' || ele.nodeType === 9) {
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

                angular.forEach(scope.item.value, function (item) {
                    angular.forEach(item.value, function (value) {
                        if (!value.isSelect) {
                            scope.allChecked = false;
                            return;
                        }

                    });
                });
                // 全选/全不选
                scope.toggleAllChecked = function () {
                    scope.allchecked = !scope.allchecked;
                    angular.forEach(scope.item.defaultValue, function (item) {
                        item.checked = scope.allchecked;
                    });
                };

                scope.toggleAllCheckedModel = function () {
                    scope.allcheckedModel = !scope.allcheckedModel;
                    angular.forEach(scope.item.defaultValue, function (item) {
                        angular.forEach(item.data.value, function (i) {
                            if (!scope.content) {
                                i.isSelect = scope.allcheckedModel;
                            }
                            else if (i.value.indexOf(scope.content) > -1) {
                                i.isSelect = scope.allcheckedModel;
                            }

                        });
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

                scope.checkedThisModel = function (item) {
                    if (!item.isSelect) {
                        scope.allcheckedModel = false;
                        return;
                    }

                    var allchecked = true;
                    angular.forEach(scope.item.defaultValue, function (key) {
                        item.isOpen = false;
                        angular.forEach(key.data.value, function (item) {
                            if (!item.isSelect) {
                                item.isOpen = true;
                                allchecked = false;
                                return;
                            }

                        });

                    });
                    scope.allcheckedModel = allchecked;
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

                // 获取模型组全部复选框选中的值
                scope.getAllMulSelItem2 = function () {
                    scope.mulSelItem = [];
                    angular.forEach(scope.item.defaultValue, function (key) {
                        angular.forEach(key.data.value, function (item) {
                            if (item.isSelect) {
                                var map = {key: item.key, value: item.value};
                                scope.mulSelItem.push(map);
                            }

                        });
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

                        scope.mulEquItem.push(item.data);
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
                    scope.chooseItemModel = [];
                    scope.isBig = false;
                    scope.isNull = false;
                    scope.isValid = false;
                    scope.match = true;

                    if (scope.item.type === 'offLineTagId') {
                        scope.getAllMulSelItem2();
                        scope.chooseItemModel = scope.mulSelItem;
                        if (!scope.chooseItemModel.length) {
                            // dialogService.alert("您未选择任何值");
                            scope.item.inputValue = '';
                            showDefaultValue = angular.copy(scope.item.defaultValue);
                            excludeType = angular.copy(scope.item.exclude);
                            scope.showValues();
                            return;
                        }
                    }

                    if (scope.item.type === 'mulSel' || scope.item.type === 'model') {
                        scope.getAllMulSelItem();
                        scope.chooseItem = scope.mulSelItem;
                        if (!scope.chooseItem.length) {
                            // dialogService.alert("您未选择任何值");
                            scope.item.inputValue = '';
                            showDefaultValue = angular.copy(scope.item.defaultValue);
                            excludeType = angular.copy(scope.item.exclude);
                            scope.showValues();
                            return;
                        }
                    }

                    if (scope.item.type === 'mulEqu') {
                        scope.getAllMulEquItem();
                        scope.chooseItem = scope.mulEquItem;
                        if (scope.isNull) {
                            dialogService.alert('存在未输入值的项');
                            scope.item.inputValue = '';
                            showDefaultValue = angular.copy(scope.item.defaultValue);
                            excludeType = angular.copy(scope.item.exclude);

                            /*scope.showValues();*/
                            return;
                        }
                        if (scope.isValid) {
                            dialogService.alert('存在输入格式不正确的项，不能输入特殊字符');
                            scope.item.inputValue = '';
                            showDefaultValue = angular.copy(scope.item.defaultValue);
                            excludeType = angular.copy(scope.item.exclude);

                            /*scope.showValues();*/
                            return;
                        }

                        if (!scope.chooseItem.length) {
                            // dialogService.alert("您未输入任何值");
                            scope.item.inputValue = '';
                            showDefaultValue = angular.copy(scope.item.defaultValue);
                            excludeType = angular.copy(scope.item.exclude);
                            scope.showValues();
                            return;
                        }
                    }

                    if (scope.item.type === 'radio' || scope.item.type === 'timeRadio') {
                        scope.chooseItem = scope.radioItem || [];
                        if (!scope.chooseItem.length) {
                            // dialogService.alert("您未选择任何值");
                            scope.item.inputValue = '';
                            showDefaultValue = angular.copy(scope.item.defaultValue);
                            excludeType = angular.copy(scope.item.exclude);
                            scope.showValues();
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

                            /*scope.showValues();*/
                            return;
                        }

                        if (scope.isBig) {
                            dialogService.alert('存在开始值大于结束值的项');
                            scope.item.inputValue = '';
                            showDefaultValue = angular.copy(scope.item.defaultValue);
                            excludeType = angular.copy(scope.item.exclude);

                            /*scope.showValues();*/
                            return;
                        }

                        if (!scope.match) {
                            dialogService.alert('存在输入格式不正确的项，只能输入非负整数');
                            scope.item.inputValue = '';
                            showDefaultValue = angular.copy(scope.item.defaultValue);
                            excludeType = angular.copy(scope.item.exclude);

                            /*scope.showValues();*/
                            return;
                        }

                        if (!scope.chooseItem.length) {
                            // dialogService.alert("您未输入任何值");
                            scope.item.inputValue = '';
                            showDefaultValue = angular.copy(scope.item.defaultValue);
                            excludeType = angular.copy(scope.item.exclude);
                            scope.showValues();
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

                        scope.item.value = scope.chooseItem;
                    }

                    if (scope.chooseItemModel.length) {
                        scope.item.inputValue = '';
                        for (var i = 0; i < scope.chooseItemModel.length; i++) {
                            if (scope.item.exclude) {
                                scope.item.inputValue += '!(' + scope.chooseItemModel[i].value + ',' + ')';
                            }
                            else {
                                scope.item.inputValue += scope.chooseItemModel[i].value + ',';
                            }
                        }
                        if (scope.item.inputValue.charAt(scope.item.inputValue.length - 1) === ',') {
                            scope.item.inputValue = scope.item.inputValue.substring(0, scope.item.inputValue.length - 1);
                        }

                        scope.item.value = scope.chooseItemModel;
                    }

                    showDefaultValue = angular.copy(scope.item.defaultValue);
                    excludeType = angular.copy(scope.item.exclude);
                    scope.showValues();
                };

                scope.changeType = function () {
                    scope.item.exclude = !scope.item.exclude;
                };

                scope.isAllChecked();

            }
        };
    }]);

});
