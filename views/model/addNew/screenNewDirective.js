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
     * 标签操作下拉列表指令
     * @params:
     *     $rootScope: 根作用域
     *     $timeout: 定时器
     *     $document: document元素
     *     dialogService: 弹窗组件
     *     modelService: 接口服务
     *     baseService: 基础服务
     *         item: 传递标签对象
     *         tagDimension: 传递标签值
     *         index: 标签
     */
    app.directive('screenNew', [
        '$rootScope',
        '$timeout',
        '$document',
        'dialogService',
        'modelService',
        'baseService', function ($rootScope, $timeout, $document, dialogService, modelService, baseService) {
            return {
                restrict: 'EA',
                replace: true,
                templateUrl: 'model/addNew/screen-new-directive.htm',
                scope: {
                    item: '=',
                    tagDimension: '=',
                    index: '@'
                },
                link: function ($scope, element, attrs) {
                    // ie8兼容性placeholder
                    $timeout(function () {
                        $document.find('input').placeholder();
                    }, 500);

                    /**
                     * @details 显示下拉列表
                     * @return [description]
                     */
                    $scope.showObjects = function () {
                        $scope.item.isShow = !$scope.item.isShow;
                    };

                    /**
                     * @details 模型标签查询
                     * @return [description]
                     */
                    $scope.getTagDimension = function () {
                        if (!$scope.dimensionCode) {
                            return;
                        }

                        $scope.$watch('tagDimension', function (newValue, oldValue) {
                            if (newValue) {
                                var index = $rootScope.myInArray($scope.tagDimension, 'dimensionCode', $scope.dimensionCode);
                                if (index === -1) {
                                    return;
                                }

                                var selectTag = $scope.tagDimension[index];
                                $scope.selectTagDimension(selectTag, 1);
                            }

                        });
                    };

                    /**
                     * @details 查询标签下的维度操作
                     *
                     * @param item 标签对象
                     * @param num 标识是不是初始化
                     *
                     * @return [description]
                     */
                    $scope.selectTagDimension = function (item, num) {
                        $scope.item.dimensionCode = item.dimensionCode;
                        $scope.item.dimensionName = item.dimensionName;
                        modelService.getTagProperty({
                            dimensionId: item.dimensionId,
                            dimensionCode: item.dimensionCode
                        }).then(function (result) {
                            $scope.tagProperty = result.value || [];
                            if (!num) {
                                $scope.item.options = [];
                                $scope.item.options.push({});
                                $scope.showObjects();
                            }

                        });
                    };

                    /**
                     * @details 删除对象
                     *
                     * @param  event 事件
                     * @return [description]
                     */
                    $scope.removeCondition = function (event) {
                        event = event || window.event;
                        try {
                            event.stopPropagation();
                        }
                        catch (e) {}
                        var sign = 0;
                        angular.forEach($scope.$parent.condition, function (condition) {
                            angular.forEach(condition.options, function (option) {
                                if (condition.id === option.relativeobject) {
                                    sign = 1;
                                    return;
                                }

                            });
                        });
                        // 该标签被其他对象引用
                        if (sign) {
                            dialogService.alert('该标签已被引用，无法删除');
                            return;
                        }

                        $scope.$parent.condition.splice($scope.index, 1);
                        // 计算高度
                        baseService.calculationHeight('.tjpz-new-content-wrap', 300, 500);
                    };

                    /**
                     * @brief 添加属性
                     * @details [long description]
                     * @return [description]
                     */
                    $scope.addOption = function () {
                        var option = {};
                        $scope.item.options.push(option);
                        // 计算高度
                        baseService.calculationHeight('.tjpz-new-content-wrap', 300, 500);
                    };

                    /**
                     * @brief 监听对象
                     * @details [long description]
                     *
                     * @param e [description]
                     * @param e [description]
                     *
                     * @return [description]
                     */
                    $scope.$watch('item', function (newValue, oldValue) {
                        if (newValue.dimensionCode) {
                            $scope.dimensionCode = $scope.item.dimensionCode;
                            $scope.getTagDimension();
                        }

                    });

                    // 点击页面其他地方关闭弹窗
                    $(window.document).click(function (event) {
                        if (!angular.element(event.target).parents('.object-wrap.deiem').length
                            && !angular.element(event.target).hasClass('picture-select-down')
                            && $scope.item.isShow) {
                            $scope.item.isShow = false;
                        }

                        $scope.$apply();
                    });

                    // 初始化
                    $scope.getTagDimension();

                }
            };
        }
    ]);
});
