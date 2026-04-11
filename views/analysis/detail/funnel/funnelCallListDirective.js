/**
 * 本文件实现依赖任何一个 Angular 的module, 如果不采用本系统的框架，
 *      可以可以在  factory(window.app) app 修改你所创建的模块名称
 *  @dependece: Angular Module
 *  自动定主--漏斗工具
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
    app.directive('funnelCallList', [
        '$q',
        '$rootScope',
        'ngDialog',
        'topicService', function ($q, $rootScope, ngDialog, topicService) {
            return {
                restrict: 'EA',
                replace: true,
                templateUrl: 'analysis/detail/funnel/funnel-call-list-directive.htm',
                scope: {
                    pathId: '=', // 路径id,
                    topicId: '=',
                    isNumData: '=',
                    condition: '=',
                    showFunnel: '=',
                    currentName: '=',
                    backPageType: '='
                },
                link: function (scope, element, attrs) {
                    scope.browser = $rootScope.getBowerserInfo();
                    scope.btnUp = 'id';
                    scope.sortParams = {
                        sortColumn: 'id',
                        sortType: 'asc'
                    };
                    // 一句任务查询通话列表默认传参
                    scope.defaultTaskCallParams = 'voiceId,duration';
                    scope.defaultTaskCallParamsLast = ',keyword,modelName';
                    scope.isAnalysisTask = $rootScope.isTask;

                    scope.pageOptions = {
                        pageNum: 1,
                        pageSize: 20
                    };

                    // 标识通话列表展示维度
                    scope.from = 'callList';
                    scope.columns = [];
                    scope.childColumn = [];

                    scope.ifEmpty = true;
                    scope.curTaskId = '';

                    /**
                     * [setDimension 打开维度弹出框]
                     */
                    scope.setDimension = function () {
                        ngDialog.open({
                            template: 'analysis/detail/dimension-libs-directive.htm',
                            controller: 'dimensionLibsCtrl',
                            scope: scope,
                            showClose: false,
                            closeByEscape: false,
                            closeByDocument: true,
                            disableAnimation: true,
                            className: 'ngdialog-theme-default ngdialog-theme-model-push'
                        }).closePromise.then(function (dialog) {
                            // 当弹出层关闭后，自动更新 维度对象
                            if (angular.isUndefined(dialog.value) || dialog.value == '$document') {
                                return;
                            }

                            scope.columns = [];
                            scope.childColumn = [];
                            angular.forEach(dialog.value.pushDim, function (item) {
                                if (item.key != 'taskId') {
                                    scope.columns.push({
                                        column: item.key,
                                        columnName: item.name
                                    });
                                    scope.childColumn.push(item.key);
                                }

                            });
                            scope.getCallList();
                        });
                    };

                    // 给父级菜单赋值
                    scope.setParams = function () {
                        var pscope = scope;
                        while (angular.isUndefined(pscope.tabPaths)) {
                            pscope = pscope.$parent;
                        }
                        if (pscope.tabPaths) {
                            angular.forEach(pscope.tabPaths, function (item) {
                                if (item.pathId === scope.pathId) {
                                    item.funnelDimensions = scope.columns;
                                    return -1;
                                }

                            });
                        }

                    };

                    // 获取父级菜单的值
                    scope.getParams = function () {
                        var deferred = $q.defer();
                        var pscope = scope;
                        while (angular.isUndefined(pscope.tabPaths)) {
                            pscope = pscope.$parent;
                        }
                        angular.forEach(pscope.tabPaths, function (item) {
                            if (item.pathId === scope.pathId) {
                                scope.columns = item.funnelDimensions || [];
                                deferred.resolve(scope.columns);
                                return -1;
                            }

                        });
                        return deferred.promise;
                    };

                    /**
                     * [getCallList 获取通话列表]
                     * @param  {[type]} params [description]
                     * @return {[type]}        [description]
                     */
                    scope.getCallList = function (params) {
                        scope.curTaskId = '';
                        params = $.extend(params, scope.pageOptions, scope.sortParams, {
                            topicId: scope.topicId,
                            pathId: scope.pathId,
                            isNumData: scope.isNumData,
                            condition: scope.condition,
                            searchDimension: JSON.stringify(scope.columns)
                        });

                        return topicService.getFunnelList(params)
                            .then(function (result) {

                                /*向上传递通话列表导出参数*/
                                scope.$emit('funnelCallListParams', {params: params, totalCount: result.value.totalCount});
                                scope.childColumn = [];
                                angular.forEach(scope.columns, function (column, index, arr) {
                                    scope.childColumn.push(column.column);
                                });
                                scope.dimCulumns = result.value.columns || [];
                                scope.callLists = result.value.previewList.rows || [];
                                scope.counts = result.value.totalCount;
                                scope.counts ? scope.ifEmpty = false : scope.ifEmpty = true;
                                if (scope.callLists.length) {
                                    return $q.reject(result);
                                }

                                if (scope.pageOptions.pageNum === 1 && result.value.totalRows === 0) {
                                    return $q.reject(result);
                                }

                                return result;
                            }).then(function () {
                            scope.pageOptions.pageNum = scope.pageOptions.pageNum - 1;
                            if (scope.pageOptions.pageNum > 0) {
                                scope.getCallList();
                            }

                        });
                    };

                    /**
                     * [getCallList 按任务分析 获取通话列表]
                     *
                     */
                    scope.getTaskOfCallList = function (params) {
                        var curDimension;
                        if (scope.childColumn.join(',') == '') {
                            curDimension = 'voiceId,duration,keyword,modelName';
                        }
                        else {
                            curDimension = scope.defaultTaskCallParams + ',' + scope.childColumn.join(',') + scope.defaultTaskCallParamsLast;
                        }
                        params = $.extend(params, scope.childPageOptions, {
                            id: scope.curTaskId,
                            searchDimension: curDimension
                        });
                        return topicService.getCallFilter(params)
                            .then(function (result) {
                                scope.taskCallColumns = result.value.columns;
                                scope.taskCallLists = result.value.rows;
                                scope.taskCallListsCount = result.value.total;
                                // scope.taskCallListsCount = 0;

                            });
                    };
                    // 展开闭合通话列表
                    scope.onGetTaskOfCallList = function (task, colums, e) {
                        var target = e.target;
                        var close = $(target).hasClass('triangle-right'); // 要是有这个类，说明是没有点开二级table
                        var _$childTable = $('#childTable');
                        if (close) {
                            $(target).removeClass('triangle-right').addClass('triangle-bottom');

                            /*初始化二级table当前页数*/
                            scope.childPageOptions = {
                                pageNum: 1,
                                pageSize: 10
                            };

                            /*渲染任务下通话列表数据*/
                            scope.curTaskId = task.dataMaps.id;
                            scope.getTaskOfCallList();
                        }
                        else {
                            scope.curTaskId = '';
                            $(target).removeClass('triangle-bottom').addClass('triangle-right');
                        }
                        $(target).parent().parent().parent().parent().siblings().find('.triangle').removeClass('triangle-bottom').addClass('triangle-right');

                    };

                    /**
                     * [remarkSort 排序]
                     * @param  {[type]} order     [description]
                     * @param  {[type]} orderType [description]
                     * @return {[type]}           [description]
                     */
                    scope.remarkSort = function (order, orderType) {
                        if (orderType == 'asc') {
                            scope.btnUp = order;
                            scope.btnDown = '';
                        }
                        else {
                            scope.btnUp = '';
                            scope.btnDown = order;
                        }

                        scope.sortParams = {
                            sortColumn: order,
                            sortType: orderType
                        };
                        scope.getCallList();
                    };

                    scope.getCallList();

                    // 返回漏斗分析
                    scope.backToFunnel = function () {
                        scope.$parent.showFunnels();
                    };
                    scope.markView = function (e) {
                        $(e.target).addClass('visited');
                        return true;
                    };

                }
            };
        }
    ]);

});
