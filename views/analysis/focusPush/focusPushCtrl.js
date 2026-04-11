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
     * @brief 重点推送指令
     * @details [long description]
     *
     * @param e [description]
     * @param e [description]
     *
     * @return [description]
     */
    app.controller('focusPushCtrl', [
        '$scope', 'topicService', 'baseService', function ($scope, topicService, baseService) {
            $scope.status = -2;
            $scope.configure = false; // 是否有配置的权限

            $scope.timesRange = baseService.getSystemTime();
            // 功能权限
            $scope.$watch('$parent.resources', function (newValue, oldValue) {
                if (!newValue) {
                    return;
                }

                angular.forEach(newValue, function (resource) {
                    if (resource.link === '/analysis') { // 专题
                        if (resource.childRes) {
                            var Res = resource.childRes;
                            angular.forEach(Res, function (data) {
                                $scope.optAciton = data.optAction || [];
                                if ($.inArray('configure', $scope.optAciton) > -1) {
                                    $scope.configure = true;
                                }

                                return;
                            });
                        }
                    }

                });
            });
            $scope.treeGrid = {
                columns: [
                    {title: '组名', field: 'modelName'},
                    {title: '未读通话', field: 'unReadCall'},
                    {title: '总数', field: 'callCount'}
                ]
            };

            // 模型树itemclick后广播change事件
            $scope.$on('tree-item-click', function (e, d) {
                $scope.$broadcast('model-changed', d);
                $scope.selectedModel = d;
            });

            $scope.$on('date-parent', function (e, d) {
                $scope.timesRange.defaultStart = d.beginDate;
                $scope.timesRange.defaultEnd = d.endDate;
                $scope.$broadcast('date-init', {beginDate: d.beginDate, endDate: d.endDate});

            });

            $scope.getColumData = function () {
                $scope.$broadcast('date-changed', {
                    beginDate: $scope.timesRange.defaultStart,
                    endDate: $scope.timesRange.defaultEnd
                });
                // 获取未读通话数量
                var params = $.extend($scope.dateParams, {
                    beginDate: $scope.timesRange.defaultStart,
                    endDate: $scope.timesRange.defaultEnd
                });
                topicService.getUnReadCallCount(params)
                    .then(function (result) {
                        $scope.$emit('data-unreadcount', {
                            unReadCount: result.value
                        });
                    });
            };

            $scope.setReadAll = function () {
                var params = {
                    beginDate: $scope.timesRange.defaultStart,
                    endDate: $scope.timesRange.defaultEnd,
                    id: $scope.selectedModel.modelId,
                    modelOrGroup: $scope.selectedModel.modelOrGroup
                };
                if (params.modelOrGroup == 0) {
                    params.parentGroupId = $scope.selectedModel.parent.modelId;
                }

                topicService.setAllCallRead(params)
                    .then(function (result) {
                        $scope.$broadcast('call-read', {});
                        $scope.$broadcast('read-all', {});
                    });
            };

            $scope.$on('read-call', function () {
                $scope.$broadcast('call-read', {});
            });

        }]);
});
