/**
 * 专题路径-分析结果指令
 * @apdate yancai2
 * @mail yancai2@iflytek.com
 * @time 2017/07/13
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
    app.directive('viewResult', ['topicService', function (topicService) {
        return {
            restrict: 'EA',
            replace: true,
            templateUrl: 'analysis/detail/view-result-directive.htm',
            scope: {
                item: '=',
                type: '@',
                pathId: '=',
                topicId: '=',
                assignAuth: '@',
                markAuth: '@'
            },
            link: function (scope, element, attrs) {

                /**
                 * 标识是展示通话列表还是聚类工具，默认是通话列表
                 * 1: 基础分析；
                 * 2：聚类分析；
                 * 3：热词分析；
                 * 4：漏斗分析；
                 */
                scope.resultType = Number(scope.type) || 1;

                /**
                 * @brief 全部刷新
                 * @details [long description]
                 * @return [description]
                 */
                scope.allRefresh = function () {
                    if (scope.resultType === 1) { // 基础分析
                        scope.$broadcast('refreshCall', {
                            pathId: scope.pathId
                        });
                        scope.$broadcast('refreshChart', {
                            pathId: scope.pathId
                        });
                        scope.getPathCounts();
                    }

                    if (scope.resultType === 2) {
                        scope.$broadcast('cluster', {
                            pathId: scope.pathId
                        });
                    }

                    if (scope.resultType === 3) {
                        scope.$broadcast('hotword', {
                            pathId: scope.pathId
                        });
                    }

                    if (scope.resultType === 4) { // 漏斗工具
                        scope.$broadcast('funnelTool', {
                            pathId: scope.pathId
                        });
                    }

                    // scope.getPathCounts();
                };

                /**
                 * @brief 获取匹配数量
                 * @details [long description]
                 *
                 * @param  [description]
                 * @return [description]
                 */
                scope.getPathCounts = function () {
                    if (scope.resultType === 1) {
                        return;
                    }

                    var params = {
                        topicId: scope.topicId,
                        pathId: scope.pathId,
                        searchDimension: JSON.stringify([]),
                        sortColumn: 'id',
                        sortType: 'asc',
                        pageNum: 1,
                        pageSize: 10
                    };
                    return topicService.getPathData(params)
                        .then(function (result) {
                            scope.counts = result.value.totalCount;
                            scope.$emit('pathCounts', scope.counts);
                        });
                };

                /**
                 * @brief 全部刷新
                 * @details [long description]
                 *
                 * @param t [description]
                 * @param a [description]
                 *
                 * @return [description]
                 */

                scope.$on('allFresh', function (event, data) {
                    scope.pathId = data.pathId;
                    scope.getPathCounts();
                    scope.allRefresh();
                    if (scope.resultType === 2 || scope.resultType === 3) {
                        scope.$broadcast('lastFlushTime', {
                            contentType: scope.resultType
                        });
                    }

                });

                /**
                 * @brief 切换通话列表与聚类工具标签
                 * @details [long description]
                 *
                 * @param  [description]
                 * @return [description]
                 */
                scope.showPathResultType = function (type) {
                    scope.resultType = type;
                    scope.$parent.contentType = type;
                    scope.allRefresh();
                    scope.$emit('curPageType', {
                        curPageType: scope.resultType
                    });
                };

                scope.showPathResultType(scope.resultType);

                /**
                 * @brief 保存的时候只刷新基础数据和漏斗工具
                 * @details [long description]
                 * @param t [description]
                 * @param a [description]
                 *
                 * @return [description]
                 */
                scope.$on('refreshData', function (event, data) {
                    scope.pathId = data.pathId;
                    scope.getPathCounts();
                    if (scope.resultType === 1) { // 基础分析
                        scope.$broadcast('refreshCall', {
                            pathId: scope.pathId
                        });
                        scope.$broadcast('refreshChart', {
                            pathId: scope.pathId
                        });
                    }

                    if (scope.resultType === 4) { // 漏斗工具
                        scope.$broadcast('funnelTool', {
                            pathId: scope.pathId
                        });
                    }

                });

                /**
                 * @brief 展开收取更新图表
                 * @details [long description]
                 *
                 * @param t [description]
                 * @param a [description]
                 *
                 * @return [description]
                 */
                scope.$on('childrenRefresh', function (event, data) {
                    if (scope.resultType === 1) {
                        scope.$broadcast('callChartRefresh');
                    }

                    if (scope.resultType === 2) { // 聚类工具
                        scope.$broadcast('cluster', {
                            pathId: scope.pathId
                        });
                    }

                    if (scope.resultType === 4) { // 漏斗工具
                        scope.$broadcast('resetTdWidth');
                    }

                });

                /**
                 * @brief 手动刷新
                 * @details [long description]
                 *
                 * @param t [description]
                 * @param a [description]
                 *
                 * @return [description]
                 */
                scope.$on('manualData', function (event, data) {
                    if (scope.resultType === 2) { // 聚类工具
                        scope.$broadcast('flushCluster', {
                            pathId: scope.pathId
                        });
                    }

                    if (scope.resultType === 3) { // 热词分析
                        scope.$broadcast('flushHotView', {
                            pathId: scope.pathId
                        });
                    }

                });
            }
        };
    }]);

});
