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
    *  reportGroupCtrl 实现报表管理  分组区域的逻辑
    *   @params:
    *       $http:  http请求服务Service
    *       $scope: $scope, 作用域Service
    *
    */
    app.directive('advanceSearch', [
        'dialogService',
        'dimensionService',
        'winHeightService',
        'CONSTANT', function (dialogService, dimensionService, winHeightService, CONSTANT) {
            return {
                restrict: 'EA',
                replace: true,
                templateUrl: 'search/advance/advance-search-directive.htm',
                scope: {
                    searchAuth: '@',
                    resetAuth: '@',
                    time: '=',
                    chanelItem: '=',
                    optType: '=',
                    searchKeyword: '=',
                    advanceDim: '=',
                    comFrom: '='
                },
                link: function ($scope, element, attrs) {
                    // 维度配置与、或切换
                    $scope.changeOpt = function () {
                        $scope.optType = 1 - $scope.optType;
                    };

                    // 获取全部维度
                    $scope.getAllDimInfos = function () {
                        dimensionService.searchDim({keyword: '', isReport: 3}).then(function (result) {
                            $scope.advanceDim = result.value || [];
                            $scope.lastDim = angular.copy($scope.advanceDim);
                        });
                    };

                    // 高级搜索前的预处理
                    $scope.showPreSearchResult = function () {
                        if (angular.isUndefined($scope.searchKeyword)) {
                            $scope.searchKeyword = '';
                        }

                        // 包含至少一个字词的处理
                        if ($scope.lessOne) {
                            if (CONSTANT.searchReplace.test($scope.lessOne)) {
                                dialogService.alert('搜索字段不能包含特殊字符');
                                return false;
                            }

                            $scope.lessOne = $.trim($scope.lessOne).replace(/\s/g, '|');
                            $scope.searchKeyword = $scope.searchKeyword + ' (' + $scope.lessOne + ')';
                            $scope.lessOne = '';
                        }

                        // 包含完整字句的处理
                        if ($scope.allWord) {
                            if (CONSTANT.searchReplace.test($scope.allWord)) {
                                dialogService.alert('搜索字段不能包含特殊字符');
                                return false;
                            }

                            $scope.allWord = $.trim($scope.allWord).replace(/\s/g, '');
                            $scope.searchKeyword = $scope.searchKeyword + ' "' + $scope.allWord + '"';
                            $scope.allWord = '';
                        }

                        // 不包含字词的处理
                        if ($scope.notWord) {
                            if (CONSTANT.searchReplace.test($scope.notWord)) {
                                dialogService.alert('搜索字段不能包含特殊字符');
                                return false;
                            }

                            $scope.notWord = $.trim($scope.notWord).replace(/\s/g, '|');
                            $scope.searchKeyword = $scope.searchKeyword + ' -(' + $scope.notWord + ')';
                            $scope.notWord = '';
                        }

                        $scope.$emit('previewSearchResult', {
                            num: 1
                        });
                    };

                    // 重置
                    $scope.resetAdvance = function () {
                        $scope.lessOne = '';
                        $scope.searchKeyword = '';
                        $scope.allWord = '';
                        $scope.notWord = '';
                        // $scope.time.startTime = "";
                        // $scope.time.endTime = "";
                        // $scope.time.defaultTime = "";
                        // $scope.time.defaultTimeName = "时间";
                        // $scope.time.timeType = "";
                        // $scope.chanelItem.chanelName = "";
                        // $scope.chanelItem.chanel = -1;
                        // $scope.advanceDim = angular.copy($scope.lastDim);

                        /*重置设置维度时间设置为近7天，声道选择为全部声道*/
                        $scope.time.startTime = $scope.time.startTime = $scope.$parent.systemDate && $scope.$parent.systemDate != '${systemDate}' ? $.datepicker.formatDate('yy-mm-dd', new Date(new Date($scope.$parent.systemDate).getTime() - 6 * 24 * 3600 * 1000)) : $.datepicker.formatDate('yy-mm-dd', new Date(new Date().getTime() - 6 * 24 * 3600 * 1000));
                        $scope.time.endTime = $scope.$parent.systemDate && $scope.$parent.systemDate != '${systemDate}' ? $scope.$parent.systemDate : $.datepicker.formatDate('yy-mm-dd', new Date());
                        $scope.time.defaultTime = $scope.time.startTime + ' 00:00:00~' + $scope.time.endTime + ' 23:59:59';
                        $scope.time.defaultTimeName = '一周内';
                        $scope.time.timeType = 'lastWeek';
                        $scope.chanelItem.chanelName = '全部声道';
                        $scope.chanelItem.chanel = 2;
                        $scope.advanceDim = angular.copy($scope.lastDim);
                    };

                    // 返回
                    $scope.closeAdvance = function (num) {
                        $scope.advanceDim = angular.copy($scope.lastDim);
                        $scope.$emit('previewSearchResult', {
                            num: num
                        });
                    };

                    $scope.winHeight = function () {
                        // 初始化调用
                        winHeightService.calculate();
                        // 浏览器窗口大小改变
                        angular.element(window).resize(function () {
                            winHeightService.calculate();
                        });
                    };

                    $scope.getAllDimInfos();
                    $scope.winHeight();
                }
            };
        }]);
});
