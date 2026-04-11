/**
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
    app.controller('dimensionPopupCtrl', [
        '$scope',
        '$document',
        '$timeout',
        '$q',
        'dialogService',
        'topicService',
        'CONSTANT', function ($scope, $document, $timeout, $q, dialogService, topicService, CONSTANT) {
            $scope.item = $scope.$parent.item;
            // $scope.item.exclude = false;
            var excludeType = angular.copy($scope.item.exclude);
            $scope.defaultValue = [];
            // 默认全选为true
            $scope.allchecked = true;

            // 初始化参数
            if (!$scope.item.defaultValue || !$scope.item.defaultValue.length) {
                if ($scope.item.type === 'mulSel' || $scope.item.type === 'radio') {
                    angular.forEach($scope.item.value, function (item) {
                        $scope.defaultValue.push({
                            checked: false,
                            data: item,
                            type: $scope.item.type,
                            isSelect: false
                        });
                    });
                }
                else {
                    var value = {
                        checked: false,
                        data: '',
                        type: $scope.item.type,
                        isSelect: false
                    };
                    if ($scope.item.type === 'range' || $scope.item.type === 'timeRange') {
                        value.data = {
                            up: '',
                            low: ''
                        };
                    }

                    if ($scope.item.type === 'mulEqu') {
                        value.data = '';
                    }

                    $scope.defaultValue.push(value);
                }
                $scope.item.defaultValue = $scope.defaultValue;
            }

            // 复选框按钮

            // 处理是否全选标识
            angular.forEach($scope.item.defaultValue, function (item) {
                if (!item.checked) {
                    $scope.allchecked = false;
                    return;
                }

            });

            var showDefaultValue = angular.copy($scope.item.defaultValue); // 中转参数接收
            var oldValue = angular.copy($scope.item.defaultValue);
            // 全选/全不选
            $scope.toggleAllChecked = function () {
                $scope.allchecked = !$scope.allchecked;
                angular.forEach($scope.item.defaultValue, function (item) {
                    item.checked = $scope.allchecked;
                });
            };

            // 单选检验
            $scope.checkedThis = function (item) {
                if (!item.checked) {
                    $scope.allchecked = false;
                    return;
                }

                var allchecked = true;
                $.each($scope.item.defaultValue, function (key, item) {
                    if (!item.checked) {
                        allchecked = false;
                        return;
                    }

                });

                $scope.allchecked = allchecked;
            };

            // 排除与包含的切换
            $scope.changeType = function () {
                $scope.item.exclude = !$scope.item.exclude;
            };

            // 新增
            $scope.addNew = function () {
                var addItem = {
                    data: '',
                    type: $scope.item.type
                };
                $scope.item.defaultValue.push(addItem);
            };

            // 删除
            $scope.remove = function (index, event) {
                try {
                    event.stopPropagation();
                }
                catch (e) {}
                $scope.item.defaultValue.splice(index, 1);
            };

            // 清空，还原默认
            $scope.removeAll = function () {
                try {
                    event.stopPropagation();
                }
                catch (e) {}
                $scope.item.defaultValue = [];
            };

            // 获取搜有单选按钮的值
            $scope.checkedRadio = function (item) {
                $scope.selectValue = item.data;
                $scope.radioItem = [];
                $scope.radioItem.push(item.data);
                angular.forEach($scope.item.defaultValue, function (item) {
                    item.isSelect = item.data === $scope.selectValue;
                });
            };

            // 获取全部复选框选中的值
            $scope.getAllMulSelItem = function () {
                var mulSelItem = [];
                angular.forEach($scope.item.defaultValue, function (item) {
                    if (item.checked) {
                        mulSelItem.push(item.data);
                    }

                });
                return mulSelItem;
            };

            // 获取所有输入框的值
            $scope.getAllMulEquItem = function () {
                var mulEquItem = [];
                angular.forEach($scope.item.defaultValue, function (item) {
                    if (!item.data) {
                        $scope.isNull = true;
                        return $q.reject(false);
                    }

                    if (CONSTANT.negateReplace.test(item.data) && !item.data.low) {
                        $scope.isValid = true;
                        return $q.reject(false);
                    }

                    mulEquItem.push(item.data);
                });
                return mulEquItem;
            };

            // 获取所有区间输入框的值
            $scope.getAllRangeItem = function () {
                var rangeItem = [];
                angular.forEach($scope.item.defaultValue, function (item) {
                    if (!item.data || !item.data.low || !item.data.up) {
                        $scope.isNull = true;
                        return $q.reject(false);
                    }

                    if (!/^(0|[1-9][0-9]*)$/.test(item.data.low) || !/^(0|[1-9][0-9]*)$/.test(item.data.up)) {
                        $scope.isValid = true;
                        return;
                    }

                    if (Number(item.data.low) > Number(item.data.up)) {
                        $scope.isBig = true;
                        return;
                    }

                    rangeItem.push(item.data.low + '~' + item.data.up);
                });
                return rangeItem;
            };

            // 判断是否没有值
            $scope.isHasLength = function () {
                if (!$scope.chooseItem.length) {
                    $scope.msg = '您还未选择任何值';
                    showDefaultValue = angular.copy($scope.item.defaultValue);
                    excludeType = angular.copy($scope.item.exclude);
                    return false;
                }

                return true;
            };

            // 判断是否存在没有输入值
            $scope.isHasNull = function () {
                if ($scope.isNull) {
                    $scope.msg = '存在未输入值的项';
                    showDefaultValue = angular.copy($scope.item.defaultValue);
                    return false;
                }

                return true;
            };

            // 判断是否存在没有输入格式不正确的值
            $scope.isHasNotValid = function () {
                if ($scope.isValid) {
                    $scope.msg = '存在输入格式不正确的项，不能输入特殊字符';
                    showDefaultValue = angular.copy($scope.item.defaultValue);
                    excludeType = angular.copy($scope.item.exclude);
                    return false;
                }

                return true;
            };

            // 判断是否存在没有开始值小于结束值的值
            $scope.isHasBig = function () {
                if ($scope.isBig) {
                    $scope.msg = '存在开始值大于结束值的项';
                    showDefaultValue = angular.copy($scope.item.defaultValue);
                    excludeType = angular.copy($scope.item.exclude);
                    return false;
                }

                return true;
            };

            // 点击每个弹框确定按钮获取编辑的值
            $scope.chooseDimension = function () {
                $scope.chooseItem = [];
                $scope.isBig = false;
                $scope.isNull = false;
                $scope.isValid = false;
                $scope.match = true;
                $scope.msg = '';

                if ($scope.item.type === 'mulSel' || $scope.item.type === 'model') {
                    $scope.chooseItem = $scope.getAllMulSelItem() || [];
                    if (!$scope.isHasLength()) {
                        return;
                    }
                }

                if ($scope.item.type === 'mulEqu') {
                    $scope.chooseItem = $scope.getAllMulEquItem() || [];
                    if (!$scope.isHasNull()) {
                        return;
                    }

                    if (!$scope.isHasNotValid()) {
                        return;
                    }

                    if (!$scope.isHasLength()) {
                        return;
                    }
                }

                if ($scope.item.type === 'radio' || $scope.item.type === 'timeRadio') {
                    $scope.chooseItem = $scope.radioItem || [];
                    if (!$scope.isHasLength()) {
                        return;
                    }
                }

                if ($scope.item.type === 'range' || $scope.item.type === 'timeRange') {
                    $scope.chooseItem = $scope.getAllRangeItem() || [];
                    if (!$scope.isHasNull()) {
                        return;
                    }

                    if (!$scope.isHasBig()) {
                        return;
                    }

                    if (!$scope.isHasNotValid()) {
                        return;
                    }

                    if (!$scope.isHasLength()) {
                        return;
                    }
                }

                if ($scope.chooseItem.length) {
                    if ($scope.item.exclude) {
                        $scope.item.inputValue = '!(' + $scope.chooseItem.join(',') + ')';
                    }
                    else {
                        $scope.item.inputValue = $scope.chooseItem.join(',');
                    }

                    $scope.item.value = $scope.chooseItem;
                }

                showDefaultValue = angular.copy($scope.item.defaultValue);
                excludeType = angular.copy($scope.item.exclude);
                $scope.addPathDim();

            };

            // 新增或更新维度
            $scope.addPathDim = function () {
                var pathDim = {
                    field: $scope.item.key,
                    type: 'dimension',
                    value: $scope.item.inputValue,
                    isNegate: $scope.item.exclude ? 1 : 0
                };
                topicService.addPathDim({
                    dimId: $scope.item.id,
                    pathId: $scope.$parent.pathId,
                    pathDim: JSON.stringify(pathDim)
                }).then(function (result) {
                    $scope.item.id = $scope.item.id ? $scope.item.id : result.value || 0;
                    $scope.item.isNegate = pathDim.isNegate;
                    $scope.closeThisDialog($scope.item);
                });
            };

            // 取消按钮
            $scope.cancelSubmit = function () {

                /*var oldValue = $scope.item.inputValue.replace(/[!()]/g,'').split(',');*/
                $scope.item.defaultValue = oldValue;

                /*$scope.item.defaultValue = angular.copy(showDefaultValue);*/
                $scope.item.exclude = angular.copy(excludeType);
                $scope.closeThisDialog();
            };
        }
    ]);

});
