/**
 * 本文件中的directive 实现模型详情页面静音规则下对象的组件
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

    app.directive('silentScreen', [
        '$http',
        '$timeout',
        '$document',
        'dialogService',
        'modelService', function ($http, $timeout, $document, dialogService, modelService) {
            return {
                restrict: 'EA',
                replace: true,
                templateUrl: 'model/addNew/silent-screen-directive.htm',
                scope: {
                    item: '=',
                    tagDimension: '=',
                    index: '@',
                    status: '@'
                },
                link: function ($scope, element, attrs) {
                    $scope.uid = Math.floor(Math.random() * 1000) + 1000;
                    $timeout(function () {
                        $document.find('input').placeholder();
                    }, 500);

                    $scope.tagProperty = [];
                    // 显示下拉列表
                    $scope.showObjects = function () {
                        $scope.item.isShow = !$scope.item.isShow;
                    };
                    // 模型标签查询
                    $scope.getTagDimension = function () {
                        if ($scope.dimensionCode) {
                            $scope.$watch('tagDimension', function (newValue, oldValue) {
                                if (newValue) {
                                    var selectTag;
                                    angular.forEach($scope.tagDimension, function (item) {
                                        if (item.dimensionCode === $scope.dimensionCode) {
                                            selectTag = item;
                                            return;
                                        }

                                    });
                                    $scope.selectTagDimension(selectTag, 1);
                                }

                            });
                        }

                    };

                    $scope.selectTagDimension = function (item, num) {
                        $scope.item.dimensionCode = item.dimensionCode;
                        $scope.item.dimensionName = item.dimensionName;
                        modelService.getTagProperty({dimensionId: item.dimensionId, dimensionCode: item.dimensionCode})
                            .then(function (result) {
                                $scope.tagProperty = result.value || [];

                                if (!num) {
                                    $scope.item.options = [];
                                    $scope.item.options.push({});
                                    $scope.showObjects();
                                }

                            });

                    };
                    // 删除对象
                    $scope.removeCondition = function (event) {
                        event = event || window.event;
                        try {
                            event.stopPropagation();
                        }
                        catch (e) {}
                        var sign = 0;
                        angular.forEach($scope.$parent.condition, function (condition) {
                            angular.forEach(condition.options, function (option) {
                                if ($scope.item.id === option.relativeobject) {
                                    sign = 1;
                                    return;
                                }

                            });
                        });

                        if (sign) {
                            dialogService.alert('该标签已被引用，无法删除');
                            return;
                        }

                        $scope.$parent.condition.splice($scope.index, 1);
                    };

                    // 添加属性
                    $scope.addOption = function () {
                        var option = {};
                        $scope.item.options.push(option);
                    };

                    $scope.$watch('item', function (newValue, oldValue) {
                        if (newValue.dimensionCode) {
                            $scope.dimensionCode = $scope.item.dimensionCode;
                            $scope.getTagDimension();
                        }

                    });

                    $document.on('click', function (e) {
                        var icon = $scope.item.isShow;
                        if (!icon) {
                            return;
                        }

                        var i = 0,
                            ele;

                        if (!e.target) {
                            return;
                        }

                        for (ele = e.target; ele; ele = ele.parentNode) {
                            // var nodeName = angular.lowercase(element.nodeName)
                            if (angular.lowercase(ele.nodeName) === 'tjpz-new' || ele.nodeType === 9) {
                                break;
                            }

                            var uid = $scope.$eval(ele.getAttribute('uid'));
                            if (!!uid && uid === $scope.uid) {
                                return;
                            }

                        }

                        $scope.showObjects();
                        $scope.$apply();
                    });

                    $scope.getTagDimension();

                }
            };
        }]);

});
