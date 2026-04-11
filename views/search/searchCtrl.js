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
    app.controller('globalSearchCtrl', [
        '$scope',
        '$document',
        '$timeout',
        'dialogService',
        'CONSTANT', function ($scope, $document, $timeout, dialogService, CONSTANT) {
            $document.find('input').placeholder();
            $scope.searchAuth = false; // 是否有搜索权限
            $scope.advanceSearchAuth = false; // 是否有高级权限
            $scope.resetAuth = false; // 是否有重置权限
            $scope.assignDimensionAuth = false; // 是否有分配维度权限
            $scope.optType = 0; // 0表示与，1表示或，默认与
            $scope.searchKeyword = ''; // 设置搜索的全局参数
            $scope.advanceDim = []; // 用于接收所有维度

            // 默认显示主页面，0为主页面，1为搜索结果页面，2为高级搜索页面
            $scope.showResult = 0;

            $scope.showTab = 0; // 搜索结果显示格式，0表示文本，1表示列表

            // 0从首页进入高级搜索,1从搜索页面进入高级搜索
            $scope.comFrom = 0;

            $scope.timeRange = {
                defaultTimeName: '一周内',
                defaultTime: '',
                timeType: 'lastWeek',
                startTime: $scope.systemDate && $scope.systemDate != '${systemDate}' ? $.datepicker.formatDate('yy-mm-dd', new Date(new Date($scope.systemDate).getTime() - 6 * 24 * 3600 * 1000)) : $.datepicker.formatDate('yy-mm-dd', new Date(new Date().getTime() - 6 * 24 * 3600 * 1000)),
                endTime: $scope.systemDate && $scope.systemDate != '${systemDate}' ? $scope.systemDate : $.datepicker.formatDate('yy-mm-dd', new Date())
            };

            $scope.columns = [];

            // 默认2，0坐席，1客户，2全部
            $scope.chanelItem = {
                chanel: 2,
                chanelName: '全部声道'
            };

            // 监听显示页面
            $scope.$on('previewSearchResult', function (event, data) {
                if (!$scope.validPreSearch()) {
                    return;
                }

                $timeout(function () {
                    if (data.num === 1) {
                        $scope.showTab === 0 ? $scope.$broadcast('viewDetailResult') : $scope.$broadcast('viewListResult');
                    }

                    $scope.showResult = data.num;
                    $scope.comFrom = data.from ? data.from : $scope.comFrom;
                }, 100);
            });

            // 搜索之前的校验
            $scope.validPreSearch = function () {
                if (!$scope.timeRange.startTime || !$scope.timeRange.endTime) {
                    dialogService.alert('请选择时间');
                    return false;
                }

                if ($scope.chanelItem.chanel === -1) {
                    dialogService.alert('请选择声道来源');
                    return false;
                }

                if ($scope.searchKeyword && CONSTANT.searchReplace.test($scope.searchKeyword)) {
                    dialogService.alert('搜索字段不能包含特殊字符');
                    return false;
                }

                return true;
            };

            // 功能权限
            $scope.$watch('$parent.resources', function (newValue, oldValue) {
                if (!newValue) {
                    return;
                }

                angular.forEach(newValue, function (resource) {
                    if (resource.link === '/search.do') { // 模型
                        $scope.optAciton = resource.optAction || [];
                        if ($.inArray('search', $scope.optAciton) > -1) {
                            $scope.searchAuth = true;
                        }

                        if ($.inArray('advanceSearch', $scope.optAciton) > -1) {
                            $scope.advanceSearchAuth = true;
                        }

                        if ($.inArray('reset', $scope.optAciton) > -1) {
                            $scope.resetAuth = true;
                        }

                        if ($.inArray('assignDimension', $scope.optAciton) > -1) {
                            $scope.assignDimensionAuth = true;
                        }

                        return;
                    }

                });
            });
        }
    ]);

});
