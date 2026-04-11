/**
 * 本文件中的directive 实现模型详情页面模型筛选条件的组件
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

    app.directive('screenCondition', ['$document', '$q', 'dialogService', 'CONSTANT', function ($document, $q, dialogService, CONSTANT) {
        return {
            restrict: 'EA',
            replace: true,
            templateUrl: 'model/addNew/screen-condition-directive.htm',
            scope: {
                item: '=',
                index: '@'
            },
            link: function (scope, element, attrs) {
                $document.find('input').placeholder();
                // 石勇 删除下面这一行 目的是不给exclude默认值
                if (!scope.item.exclude) {
                    scope.item.exclude = false;
                    // 在添加维度时无法获取exclude，所以就对inputValue和value进行判断，从而获取对应的exclude值
                    if (scope.item.inputValue == '!(' + scope.item.value.toString() + ')') {
                        scope.item.exclude = true;
                    }
                }

                // scope.item.exclude = false;
                // 
                var excludeType = angular.copy(scope.item.exclude);
                // uncodeuid;
                scope.uid = Math.floor(Math.random() * 1000) + 1000;

                scope.item.defaultValue = [];
                // 默认全选为true
                scope.allchecked = true;
                if (!scope.item.value.length) {
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
                            value.data = item;
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
                    scope.isBig = false;
                    scope.isNull = false;
                    scope.isValid = false;
                    scope.match = true;

                    if (scope.item.type === 'mulSel' || scope.item.type === 'model') {
                        scope.getAllMulSelItem();
                        // 石勇 新增 如果没有输入项的时候，清空对应的value值
                        // console.log(scope.mulSelItem.length)
                        if (scope.mulSelItem.length == 0) {
                            scope.item.value = [];
                        }

                        // 
                        // 
                        scope.chooseItem = scope.mulSelItem;
                        if (!scope.chooseItem.length) {
                            // dialogService.alert("您还未选择任何值");
                            scope.item.inputValue = '';
                            showDefaultValue = angular.copy(scope.item.defaultValue);
                            excludeType = angular.copy(scope.item.exclude);
                            scope.showValues();
                            var $scope = scope;
                            while (angular.isUndefined($scope.preview)) {
                                $scope = $scope.$parent;
                            }
                            $scope.preview();
                            return;
                        }
                    }

                    if (scope.item.type === 'mulEqu') {
                        scope.getAllMulEquItem();
                        // 石勇 新增 如果没有输入项的时候，清空对应的value值
                        // console.log(scope.mulEquItem.length)
                        if (scope.mulEquItem.length == 0) {
                            scope.item.value = [];
                        }

                        // 
                        // 
                        scope.chooseItem = scope.mulEquItem;
                        if (scope.isNull) {
                            dialogService.alert('存在未输入值的项');
                            scope.item.inputValue = '';
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
                            // dialogService.alert("您还未输入任何值");
                            scope.item.inputValue = '';
                            showDefaultValue = angular.copy(scope.item.defaultValue);
                            excludeType = angular.copy(scope.item.exclude);
                            scope.showValues();
                            var $scope = scope;
                            while (angular.isUndefined($scope.preview)) {
                                $scope = $scope.$parent;
                            }
                            $scope.preview();
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
                            while (angular.isUndefined($scope.preview)) {
                                $scope = $scope.$parent;
                            }
                            $scope.preview();
                            return;
                        }
                    }

                    if (scope.item.type === 'range' || scope.item.type === 'timeRange') {
                        scope.getAllRangeItem();
                        scope.chooseItem = scope.rangeItem;

                        // 石勇 新增 如果没有输入项的时候，清空对应的value值
                        // console.log(scope.rangeItem.length)
                        if (scope.rangeItem.length == 0) {
                            scope.item.value = [];
                        }

                        // 
                        // 

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
                            while (angular.isUndefined($scope.preview)) {
                                $scope = $scope.$parent;
                            }
                            $scope.preview();
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

                    showDefaultValue = angular.copy(scope.item.defaultValue);
                    excludeType = angular.copy(scope.item.exclude);
                    scope.showValues();

                    /*var $scope = scope;
                    while(angular.isUndefined($scope.preview)){
                        $scope = $scope.$parent;
                    }
                    $scope.preview();*/
                };
                // 排除与包含的切换
                scope.changeType = function () {
                    scope.item.exclude = !scope.item.exclude;
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
