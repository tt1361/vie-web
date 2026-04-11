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
    *  本文件中的directives  删除的功能
    *   item: Object;  待删除的对象
    *   update: 当删除确认时候， 调用父controller进行数据更新
    *
    */
    app.directive('dimensionValue', ['$rootScope', 'ngDialog', '$timeout', 'dialogService', 'topicService', function ($rootScope, ngDialog, $timeout, dialogService, topicService) {
        return {
            restrict: 'EA',
            replace: true,
            templateUrl: 'analysis/detail/dimension/dimension-value-directive.htm',
            scope: {
                item: '=',
                pathId: '=',
                index: '@'
            },
            link: function (scope, element, attrs) {

                var operate = {
                    ADD: 0, // 添加
                    ADDED: 1, // 已添加
                    UPDATE: 2, // 更新
                    UPDATED: 3 // 已更新
                };

                scope.item.operateType = operate.ADD; // 默认可以添加

                // 设置维度值
                scope.setPathDimValue = function () {
                    if (!scope.$parent.path) {
                        dialogService.error('全局路径下，维度选择不可用，请切换路径！');
                        $timeout(function () {
                            ngDialog.close('errorDialog');
                        }, 3000);
                    }

                    ngDialog.open({
                        template: 'analysis/detail/dimension/dimension-popup-directive.htm',
                        controller: 'dimensionPopupCtrl',
                        scope: scope,
                        showClose: false,
                        closeByEscape: false,
                        closeByDocument: false,
                        disableAnimation: true,
                        className: 'ngdialog-theme-default ngdialog-theme-model newDimension'
                    }).closePromise.then(function (dialog) {
                        // 当弹出层关闭后，自动更新 维度对象
                        if (angular.isUndefined(dialog.value) || dialog.value == '$document') {
                            return;
                        }

                        scope.item = dialog.value;
                        scope.initData();
                    });
                };

                // 删除选中维度
                scope.deleteDim = function () {
                    topicService.delPathDim({
                        dimId: scope.item.id
                    })
                        .then(function (result) {
                            var $scope = scope;
                            while (angular.isUndefined($scope.newDimensions)) {
                                $scope = $scope.$parent;
                            }
                            $scope.newDimensions.splice(scope.index, 1);
                            try {
                                delete scope.item.inputValue;
                                delete scope.item.id;
                                delete scope.item.defaultValue;
                                delete scope.item.exclude;
                                delete scope.item.operateType;
                            }
                            catch (e) {}
                            $scope.pathDims.push(scope.item);
                        });
                };

                // 新增按钮
                scope.pushIntoRoute = function () {
                    if (!scope.$parent.path) {
                        return;
                    }

                    var inSelect = false;

                    angular.forEach(scope.$parent.path.subRoute, function (route) {
                        if (scope.item.modelId === route.value) {
                            inSelect = true;
                            return;
                        }

                    });
                    if (!inSelect) {
                        var path = {
                            field: scope.item.key,
                            type: 'dimension',
                            value: scope.item.inputValue,
                            name: scope.item.name,
                            isNegate: 0,
                            notView: false
                        };
                        scope.$parent.path.subRoute.push(path);
                        scope.$parent.path.isSave = false;
                        scope.$emit('getPathValue');
                        scope.item.operateType = operate.ADDED;
                        return;
                    }
                    else {
                        dialogService.alert('该路径中已存在该维度');
                        return;
                    }
                };

                // 更新
                scope.updateIntoRoute = function () {
                    if (!scope.$parent.path) {
                        return;
                    }

                    var index = $rootScope.myInArray(scope.$parent.path.subRoute, 'field', scope.item.key);
                    if (index > -1) {
                        scope.$parent.path.subRoute[index].value = scope.item.inputValue;
                        scope.$parent.path.isSave = false;
                        scope.item.operateType = operate.UPDATED;
                        if (scope.$parent.path.subRoute.length - 1 != index) { // 更新的不是最后一个
                            if (scope.$parent.path.subRoute.length) {
                                var i = index === 0 ? 0 : -1; // 判断是更新中间的还是第一个
                                var lastItem = scope.$parent.path.subRoute[scope.$parent.path.subRoute.length - 1];
                                var prePath = scope.$parent.path.subRoute.slice(0, index + i + 1);
                                var pathTab = angular.copy(prePath);
                                scope.$emit('getPathValue', {index: index, i: i, pathTab: pathTab, lastItem: lastItem});
                            }
                        }
                        else { // 更新最后一个
                            scope.$emit('getPathValue');
                        }
                    }

                };

                // 初始化
                scope.initData = function () {
                    if (!scope.$parent.path) {
                        return;
                    }

                    var index = $rootScope.myInArray(scope.$parent.path.subRoute, 'field', scope.item.key);
                    if (index > -1) { // 存在该路径中
                        scope.item.operateType = operate.ADDED;
                        if (scope.item.inputValue != scope.$parent.path.subRoute[index].value) { // 值不等
                            scope.item.operateType = operate.UPDATE;
                        }
                    }
                    else {
                        scope.item.operateType = operate.ADD;
                    }
                };

                scope.initData();

            }
        };
    }]);

});
