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
    app.directive('viewSearch', ['$timeout', 'dialogService', 'CONSTANT', function ($timeout, dialogService, CONSTANT) {
        return {
            restrict: 'EA',
            replace: true,
            templateUrl: 'search/result/view-search-directive.htm',
            scope: {
                searchAuth: '@',
                advanceSearchAuth: '@',
                time: '=',
                chanelItem: '=',
                showTab: '=',
                optType: '=',
                searchKeyword: '=',
                advanceDim: '=',
                columns: '='
            },
            link: function ($scope, element, attrs) {
                // 总量
                $scope.allRec = 0;
                // 检索量
                $scope.total = 0;
                // enter键
                $scope.enterResultKey = function (event) {
                    event = event || window.event;
                    if (event.keyCode == 13) {
                        $scope.showViewResult(1);
                    }

                };

                // 搜索
                $scope.showViewResult = function (num, comfrom) {
                    $scope.$emit('previewSearchResult', {num: num, from: comfrom});
                    if (num === 1) {
                        $scope.showTab === 0 ? $scope.$broadcast('viewDetailResult') : $scope.$broadcast('viewListResult');
                    }

                };

                // 切换文本与列表tab
                $scope.changeTab = function (num) {
                    if (CONSTANT.searchReplace.test($scope.searchKeyword)) {
                        return;
                    }

                    $scope.showTab = num;
                    $timeout(function () {
                        $scope.showTab === 0 ? $scope.$broadcast('viewDetailResult') : $scope.$broadcast('viewListResult');
                    }, 100);

                };

                // 搜索的预处理
                $scope.preSearchResult = function () {
                    if (CONSTANT.searchReplace.test($scope.searchKeyword)) {
                        return false;
                    }

                    var dimensionParams = [];
                    angular.forEach($scope.advanceDim, function (item) {
                        if (item.inputValue) {
                            if (item.type === 'range') {
                                var values = [];
                                angular.forEach(item.value, function (value) {
                                    values.push(value.replace('~', '|'));
                                });
                                item.value = values;
                            }

                            dimensionParams.push({
                                filed: item.key,
                                type: item.type,
                                value: item.value,
                                isNegate: item.exclude ? 1 : 0
                            });
                        }

                    });

                    var optionType = $scope.optType === 0 ? 'and' : 'or';
                    var chanel = $scope.chanelItem.chanel === -1 ? 2 : $scope.chanelItem.chanel;
                    var params = {
                        content: $scope.searchKeyword,
                        startTime: $scope.time.startTime + $scope.time.startDatetimeTemp,
                        endTime: $scope.time.endTime + $scope.time.endDatetimeTemp,
                        chanel: chanel,
                        dimensionParams: JSON.stringify(dimensionParams),
                        optionType: optionType
                    };

                    return params;
                };

            }
        };
    }]);

});
