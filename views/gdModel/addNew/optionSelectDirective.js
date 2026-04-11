/**
 * 本文件中的directive 实现模型详情页面静音规则中属性选择的组件
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
     *  条件配置操作下拉列表指令
     *  @params:
     *     $document: document元素
     *     $timeout: 定时器
     *     dialogService: 弹窗组件
     *     modelService: 接口服务
     *     baseService: 基础服务
     *         item: 传递标签对象
     *         index: 标签
     *         property：对象
     *         type： 表示是字还是词
     */
    app.directive('optionSelect', [
        '$document',
        '$timeout',
        'dialogService',
        'gdModelService',
        'baseService', function ($document, $timeout, dialogService, gdModelService, baseService) {
            return {
                restrict: 'EA',
                replace: true,
                templateUrl: 'model/addNew/option-select-directive.htm',
                scope: {
                    item: '=',
                    index: '@',
                    property: '=',
                    type: '@',
                    status: '@'
                },
                link: function ($scope, element, attrs) {
                    // ie8兼容placeholder
                    $timeout(function () {
                        $document.find('input').placeholder();
                    }, 500);
                    // 获取操作列表
                    $scope.propertyCode = $scope.item.propertyCode;
                    // 是否依赖，目前只针对相对位置
                    $scope.item.isDepend = $scope.item.isDepend || 0;
                    // 0代表输入框，1代表下拉框
                    $scope.item.flag = $scope.item.flag || 0;
                    // 用于接收操作
                    $scope.tagOperation = [];

                    $scope.objectDim = [];

                    /**
                     * @brief 展开收起属性
                     * @details [long description]
                     * @return [description]
                     */
                    $scope.showProperties = function () {
                        $scope.item.isPropertyShow = !$scope.item.isPropertyShow;
                        $scope.item.isDependShow = false;
                        $scope.item.isEquShow = false;
                        $scope.item.isOperationShow = false;
                    };

                    /**
                     * @brief 显示依赖
                     * @details [long description]
                     * @return [description]
                     */
                    $scope.showRelations = function () {
                        $scope.item.isDependShow = !$scope.item.isDependShow;
                        $scope.item.isEquShow = false;
                        $scope.item.isOperationShow = false;
                    };

                    /**
                     * @brief 显示等于号下拉
                     * @details [long description]
                     * @return [description]
                     */
                    $scope.showEqus = function () {
                        $scope.item.isEquShow = !$scope.item.isEquShow;
                        $scope.item.isOperationShow = false;
                        $scope.item.isDependShow = false;
                    };

                    /**
                     * @brief 显示操作下拉
                     * @details [long description]
                     * @return [description]
                     */
                    $scope.showOperations = function () {
                        $scope.item.isOperationShow = !$scope.item.isOperationShow;
                    };

                    /**
                     * @brief 删除属性
                     * @details [long description]
                     *
                     * @param  [description]
                     * @return [description]
                     */
                    $scope.removeOption = function (event) {
                        event = event || window.event;
                        try {
                            event.stopPropagation();
                        }
                        catch (e) {}
                        var sign = 0;
                        if ($scope.$parent.$parent.item.options.length === 1) {
                            var scope = $scope;
                            while (angular.isUndefined(scope.condition)) {
                                scope = scope.$parent;
                            }
                            angular.forEach(scope.condition, function (condition) {
                                angular.forEach(condition.options, function (option) {
                                    if ($scope.$parent.$parent.item.id === option.relativeobject) {
                                        sign = 1;
                                        return;
                                    }

                                });
                            });
                        }

                        if (sign) {
                            dialogService.alert('该标签已被引用，无法删除');
                            return;
                        }

                        $scope.$parent.$parent.item.options.splice($scope.index, 1);
                        if (!$scope.$parent.$parent.item.options.length) {
                            $scope.$parent.$parent.removeCondition();
                        }

                        // 计算高度
                        baseService.calculationHeight('.tjpz-new-content-wrap', 300, 500);
                    };

                    /**
                     * @brief 模型标签操作查询
                     * @details [long description]
                     *
                     * @param m [description]
                     * @param m [description]
                     *
                     * @return [description]
                     */
                    $scope.selectTagOperation = function (item, num) {
                        $scope.item.isDepend = item.isDepend;
                        $scope.item.flag = item.flag;
                        $scope.item.propertyCode = item.propertyCode;
                        $scope.item.propertyName = item.propertyName;
                        if ($scope.item.isDepend === 1) {
                            var pscope = $scope;
                            while (angular.isUndefined(pscope.condition)) {
                                pscope = pscope.$parent;
                            }

                            $scope.objectDim = pscope.condition;
                            $scope.item.relativeobject = $scope.item.relativeobject ? $scope.item.relativeobject : $scope.objectDim.length ? $scope.objectDim[0].id : '';
                            $scope.relativeobject = $scope.item.relativeobject;
                            $scope.item.reletionName = $scope.item.reletionName ? $scope.item.reletionName : $scope.objectDim.length ? $scope.objectDim[0].name : '';
                        }
                        else {
                            $scope.item.relativeobject = '';
                            $scope.relativeobject = '';
                            $scope.item.reletionName = '';
                        }

                        if ($scope.item.flag === 1) {
                            $scope.item.equOperation = '等于';
                        }

                        gdModelService.getTagOperation({
                            propertyId: item.propertyId,
                            propertyCode: item.propertyCode
                        }).then(function (result) {
                            $scope.tagOperation = result.value || [];
                            if ($scope.item.flag === 1 && $scope.type === 'zi') {
                                var index = -1;
                                $.each($scope.tagOperation, function (key, item) {
                                    if (item.type === 0) {
                                        $scope.item.equOperationCode = item.operationCode;
                                        index = key;
                                        return;
                                    }

                                });
                                $scope.tagOperation.splice(index, 1);
                            }

                            if ($scope.item.operationCode) {
                                var isExit = false;
                                angular.forEach($scope.tagOperation, function (operation) {
                                    if (operation.operationCode === $scope.item.operationCode) {
                                        isExit = true;
                                        $scope.operationCode = $scope.item.operationCode;
                                        return;
                                    }

                                });

                                if (!isExit) {
                                    $scope.operationCode = $scope.tagOperation.length ? $scope.tagOperation[0].operationCode : '';
                                    $scope.item.operationCode = $scope.operationCode;
                                    $scope.item.operationName = $scope.tagOperation.length ? $scope.tagOperation[0].operationName : '';
                                }
                            }
                            else {
                                $scope.operationCode = $scope.tagOperation.length ? $scope.tagOperation[0].operationCode : '';
                                $scope.item.operationCode = $scope.operationCode;
                                $scope.item.operationName = $scope.tagOperation.length ? $scope.tagOperation[0].operationName : '';
                            }
                            if (!num) {
                                $scope.showProperties();
                            }

                        });
                    };

                    /**
                     * @brief 选择关联对象
                     * @details [long description]
                     *
                     * @param  [description]
                     * @return [description]
                     */
                    $scope.selectrelationObject = function (item) {
                        $scope.item.relativeobject = item.id;
                        $scope.item.reletionName = item.name;
                        $scope.showRelations();
                    };

                    /**
                     * @brief 选择操作
                     * @details [long description]
                     *
                     * @param  [description]
                     * @return [description]
                     */
                    $scope.selectOperation = function (item) {
                        $scope.item.operationCode = item.operationCode;
                        $scope.item.operationName = item.operationName;
                        $scope.showOperations();
                    };

                    /**
                     * @brief 监听事件
                     * @details [long description]
                     *
                     * @param e [description]
                     * @param e [description]
                     *
                     * @return [description]
                     */
                    $scope.$watch('property', function (newValue, oldValue) {
                        if (newValue === oldValue) {
                            return;
                        }

                        if (newValue.length) {
                            $scope.propertyCode = $scope.item.propertyCode;
                            var selectItem;
                            angular.forEach(newValue, function (operation) {
                                if (operation.propertyCode === $scope.item.propertyCode) {
                                    selectItem = operation;
                                }

                            });
                            if (selectItem) {
                                $scope.selectTagOperation(selectItem, 1);
                            }
                        }

                    });

                    // 点击页面其他地方关闭弹窗
                    $(window.document).click(function (event) {
                        if (!angular.element(event.target).parents('.option-wrap.deiem').length
                            && !angular.element(event.target).hasClass('picture-select-down')
                            && $scope.item.isPropertyShow) {
                            $scope.item.isPropertyShow = false;
                        }

                        if (!angular.element(event.target).parents('.depend-wrap.deiem').length
                            && !angular.element(event.target).hasClass('picture-select-down')
                            && $scope.item.isDependShow) {
                            $scope.item.isDependShow = false;
                        }

                        if (!angular.element(event.target).parents('.flag-equ.deiem').length
                            && !angular.element(event.target).hasClass('picture-select-down')
                            && $scope.item.isEquShow) {
                            $scope.item.isEquShow = false;
                        }

                        if (!angular.element(event.target).parents('.opre-equ.deiem').length
                            && !angular.element(event.target).hasClass('picture-select-down')
                            && $scope.item.isOperationShow) {
                            $scope.item.isOperationShow = false;
                        }

                        $scope.$apply();
                    });
                }
            };
        }
    ]);
});
