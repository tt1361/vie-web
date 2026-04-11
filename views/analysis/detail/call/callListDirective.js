/*
 * 自定义专题-detail-通话列表
 * @update-author yancai2
 * @update-time 2017/07/07
 * */
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
    app.directive('callList', [
        '$q',
        '$rootScope',
        'ngDialog',
        'dialogService',
        'topicService',
        'dimensionService',
        'baseService', function ($q, $rootScope, ngDialog, dialogService, topicService, dimensionService, baseService) {
            return {
                restrict: 'EA',
                replace: true,
                templateUrl: 'analysis/detail/call/call-list-directive.htm',
                transclude: true,
                scope: {
                    pathId: '=', // 路径id,
                    topicId: '=', // 专题id
                    assignAuth: '@', // 用户权限
                    markAuth: '@'
                },
                link: function (scope, element, attrs) {

                    // 按任务分析，否则按语音分析
                    scope.isAnalysisTask = $rootScope.isTask;
                    scope.ifCallListShowFlag = false;
                    // 一句任务查询通话列表默认传参
                    scope.defaultTaskCallParams = 'voiceId,duration';
                    scope.defaultTaskCallParamsLast = ',modelName,keyword';

                    // 判断浏览器
                    scope.browser = $rootScope.getBowerserInfo();

                    // 保存的维度
                    scope.selCallListCulumns = [];
                    // 标识通话列表展示维度
                    scope.from = 'callList';
                    scope.tool = 'basis';
                    scope.columns = [];
                    scope.childColumn = [];

                    scope.curTaskId = '';

                    // 初始化数据
                    scope.initData = function () {
                        scope.dialogShow = false;
                        if (scope.isAnalysisTask == 1) {
                            scope.btnUp = 'taskId';
                            // 默认排序
                            scope.sortParams = {
                                sortColumn: 'taskId',
                                sortType: 'asc'
                            };
                        }
                        else {
                            scope.btnUp = 'voiceId';
                            // 默认排序
                            scope.sortParams = {
                                sortColumn: 'voiceId',
                                sortType: 'asc'
                            };
                        }

                        // 分页参数
                        scope.pageOptions = {
                            pageNum: 1,
                            pageSize: 10
                        };

                    };

                    scope.initData();

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
                                // if (item.key != 'taskId') {
                                scope.columns.push({
                                    column: item.key,
                                    columnName: item.name
                                });
                                scope.childColumn.push(item.key);
                                // }

                            });
                            // console.log(scope.columns);
                            scope.getCallList();
                            scope.setParams();
                        });
                    };

                    // 标记库
                    scope.markerLibShow = function () {
                        ngDialog.open({
                            template: 'analysis/detail/call/marker-lib-dia.htm',
                            controller: 'markerLibDiaCtrl',
                            scope: scope,
                            showClose: true,
                            closeByEscape: false,
                            closeByDocument: false,
                            disableAnimation: true,
                            className: 'ngdialog-theme-default ngdialog-theme-model ngdialog-theme-markerlib'
                        });
                    };

                    // 给父级菜单赋值
                    scope.setParams = function () {
                        var pscope = scope;
                        while (angular.isUndefined(pscope.tabPaths)) {
                            pscope = pscope.$parent;
                        }
                        angular.forEach(pscope.tabPaths, function (item) {
                            if (item.pathId === scope.pathId) {
                                item.callListDimensions = scope.columns;
                                return -1;
                            }

                        });
                    };
                    // 获取父级菜单的值
                    scope.getParams = function () {
                        var pscope = scope;
                        while (angular.isUndefined(pscope.tabPaths)) {
                            pscope = pscope.$parent;
                        }
                        angular.forEach(pscope.tabPaths, function (item) {
                            if (item.pathId === scope.pathId) {
                                scope.columns = item.callListDimensions || [];
                                return -1;
                            }

                        });
                    };

                    /*获取专题保存的维度*/
                    scope.searchDim = function () {
                        var deferred = $q.defer();
                        dimensionService.searchDim()
                            .then(function (result) {
                                scope.allDimensions = result.value || [];
                                dimensionService.queryDimensions({
                                    listType: 5
                                }).then(function (data) {
                                    var selDims = data.value.split(',');
                                    scope.columns = [];
                                    angular.forEach(scope.allDimensions, function (dim, index) {
                                        angular.forEach(selDims, function (selDim, index) {
                                            if (dim.key === selDim) {
                                                dim.checked = true;
                                                if (dim.key == 'voiceId') {
                                                    scope.columns.push({
                                                        column: dim.key,
                                                        columnName: '流水号'
                                                    });
                                                }
                                                else {
                                                    scope.columns.push({
                                                        column: dim.key,
                                                        columnName: dim.name
                                                    });
                                                }
                                            }

                                        });
                                    });
                                    deferred.resolve(scope.columns);
                                });
                            });
                        return deferred.promise;
                    };

                    /**
                     * [getCallList 按语音分析 获取通话列表]
                     * @param  {[type]} params [description]
                     * @return {[type]}        [description]
                     */
                    scope.getCallList = function (params) {
                        scope.curTaskId = '';
                        params = $.extend(params, scope.pageOptions, {
                            topicId: scope.topicId,
                            pathId: scope.pathId,
                            listType: 5, // 列表类型默认维度配置：1.通话列表 2.违规语音列表 3.质量管控钻取通话列表 4.业务运营里数字钻取通话列表  5.专题匹配通话 6.模型匹配通话
                            searchDimension: JSON.stringify(scope.columns)
                        }, scope.sortParams);
                        return topicService.getPathData(params)
                            .then(function (result) {

                                scope.childColumn = [];
                                angular.forEach(scope.columns, function (column, index, arr) {
                                    if (column.column != 'taskId' && column.column != 'duration') {
                                        scope.childColumn.push(column.column);
                                    }

                                });
                                scope.headColums = result.value.columns || [];
                                scope.callLists = result.value.previewList.rows || [];
                                scope.counts = result.value.totalCount;
                                scope.$emit('pathCounts', scope.counts);
                                scope.idCulumns = [];
                                scope.markCulumns = [];
                                scope.dimCulumns = [];
                                angular.forEach(scope.headColums, function (item) {
                                    if (item.column === 'voiceId') {
                                        scope.idCulumns.push(item);
                                    }

                                    if (item.column === 'mark') {
                                        scope.markCulumns.push(item);
                                    }

                                    // if (item.column != 'voiceId' && item.column != 'mark' && item.column != 'keyword') {
                                    //    scope.dimCulumns.push(item);
                                    // }
                                    if (item.column != 'voiceId' && item.column != 'mark') {
                                        scope.dimCulumns.push(item);
                                    }

                                });
                                // 向上传递导出相关数据
                                scope.$emit('baseCallImport', {
                                    searchDimension: scope.columns,
                                    sortParams: scope.sortParams,
                                    totalCount: scope.counts
                                });
                                // 向上传递导出条数限制数
                                scope.$emit('exportLimitNumber', result.value.limitNum);
                                // scope.$emit('exportLimitNumber', 20000);

                                if (scope.callLists.length) {
                                    return $q.reject(result);
                                }

                                if (scope.pageOptions.pageNum === 1 && result.value.totalRows === 0) {
                                    return $q.reject(result);
                                }

                                return result;
                            });
                    };

                    /**
                     * [getCallList 按任务分析 获取通话列表]
                     *
                     */
                    scope.getTaskOfCallList = function (params) {
                        var curDimension;
                        if (scope.childColumn.join(',') == '') {
                            curDimension = 'voiceId,duration,modelName,keyword';
                        }
                        else {
                            curDimension = scope.defaultTaskCallParams + ',' + scope.childColumn.join(',') + scope.defaultTaskCallParamsLast;
                        }
                        params = $.extend(params, scope.childPageOptions, {
                            id: scope.curTaskId,
                            // listType:5,
                            searchDimension: curDimension
                        });
                        return topicService.getCallFilter(params)
                            .then(function (result) {
                                scope.taskCallColumns = result.value.columns;
                                scope.taskCallLists = result.value.rows;
                                scope.taskCallListsCount = result.value.total;
                            });
                    };
                    // 展开闭合通话列表
                    scope.onGetTaskOfCallList = function (task, colums, e) {
                        var target = e.target;
                        var close = $(target).hasClass('triangle-right'); // 要是有这个类，说明是没有点开二级table
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

                    // 打开弹出框
                    scope.openRemark = function (item) {
                        scope.dialogShow = true;
                        scope.isAnalysisTask ? scope.remarkSerial = '任务ID' : scope.remarkSerial = '流水号';
                        scope.remarkSerialNumber = item.dataMaps.id;
                        scope.remarkContent = item.dataMaps.isHaveRemark ? item.dataMaps.remark : '';
                    };

                    // 关闭弹出框
                    scope.cancleRemark = function () {
                        scope.dialogShow = false;
                    };

                    // 确定键
                    scope.okRemark = function () {
                        if (!scope.validMark(scope.remarkContent)) {
                            return;
                        }

                        var params = {
                            topicId: scope.topicId,
                            telephonId: scope.remarkSerialNumber,
                            mark: scope.remarkContent
                        };
                        topicService.addMark(params)
                            .then(function (result) {
                                scope.dialogShow = false;
                                scope.getCallList();
                            });
                    };

                    // 校验备注是否合理
                    scope.validMark = function (mark) {
                        if (!mark) {
                            dialogService.alert('备注不能为空');
                            return false;
                        }

                        if (mark.replace(/[^\x00-\xff]/g, 'xx').length > 20) {
                            dialogService.alert('备注不能超过20个字符！');
                            return false;
                        }

                        return true;
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
                        // 向上传递导出相关数据
                        scope.$emit('baseCallImport', {searchDimension: scope.columns, sortParams: scope.sortParams});
                    };

                    // 初始化数据
                    scope.initData();

                    scope.getParams();
                    scope.searchDim().then(function (col) {
                        scope.getCallList();
                    });

                    /*获取任务列表 */

                    // 标记测听
                    scope.markListView = function (e) {
                        $(e.target).addClass('visited');
                        return true;
                    };

                    // 刷新
                    scope.$on('refreshCall', function (event, data) {
                        if (!data.pathId) {
                            return;
                        }

                        scope.pathId = data.pathId;

                        scope.initData();
                        scope.getParams();
                        scope.searchDim().then(function (col) {
                            scope.getCallList();
                        });
                    });

                }
            };
        }
    ]);
});
