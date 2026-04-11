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
     * 搜索指令
     * @params:
     *     searchService: 搜索接口服务
     *         time: 传递事件条件
     *         condition: 传递维度条件
     *         isSearchShow: 传递是否显示搜索
     */
    app.directive('searchView', [
        'searchService', function (searchService) {
            return {
                restrict: 'EA',
                replace: true,
                templateUrl: 'model/addNew/search-view-directive.htm',
                scope: {
                    time: '=',
                    condition: '=',
                    isSearchShow: '@'
                },
                link: function ($scope, element, attrs) {
                    // 初始化分页
                    $scope.pageOptions = {
                        pageNum: 1,
                        pageSize: 10
                    };
                    // 初始化总数量
                    $scope.counts = 0;
                    // 总量
                    $scope.allRec = 0;
                    // 检索量
                    $scope.total = 0;

                    $scope.chanelItem = {
                        chanel: 2
                    };

                    /**
                     * @brief 监听事件
                     * @details [long description]
                     *
                     * @param t [description]
                     * @param a [description]
                     *
                     * @return [description]
                     */
                    $scope.$on('searchResult', function (event, data) {
                        $scope.keyword = data.keyword;
                        $scope.pageOptions.pageNum = 1;
                        $scope.getSearchResult();
                    });

                    /**
                     * @brief 获取搜索结果
                     * @details [long description]
                     *
                     * @param  [description]
                     * @return [description]
                     */
                    $scope.getSearchResult = function (params) {
                        var dimensionParams = [];
                        angular.forEach($scope.condition, function (item) {
                            if (item.inputValue) {
                                if (item.type === 'range') {
                                    var values = [];
                                    angular.forEach(item.value, function (value) {
                                        values.push(value.replace('~', '|'));
                                    });
                                    item.value = values;
                                }

                                var index = item.inputValue.indexOf('!');
                                dimensionParams.push({
                                    filed: item.key,
                                    type: item.type,
                                    value: item.value,
                                    isNegate: index > -1 ? 1 : 0
                                });
                            }

                        });

                        params = $.extend(true, {
                            content: $scope.keyword,
                            startTime: $scope.time.defaultStart,
                            endTime: $scope.time.defaultEnd,
                            chanel: 2,
                            dimensionParams: JSON.stringify(dimensionParams),
                            optionType: 'and'
                        }, $scope.pageOptions);

                        searchService.getSearchResult(params)
                            .then(function (result) {
                                $scope.searchResult = result.value.rows || [];
                                $scope.counts = result.value.total || 0;
                                $scope.allRec = result.value.allRec || 0;
                                $scope.allRec = Number(result.value.allRec) || 0;
                                $scope.total = result.value.total || 0;
                            });
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
                    $scope.$watch('isSearchShow', function (newValue, oldValue) {
                        if (newValue && newValue === 'true') {
                            $scope.getSearchResult();
                        }

                    });
                }
            };
        }
    ]);
});
