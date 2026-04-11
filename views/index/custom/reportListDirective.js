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
    app.directive('reportList', ['reportService', '$rootScope', function (reportService, $rootScope) {

        return {
            restrict: 'EA',
            replace: true,
            templateUrl: 'index/custom/report-list-directive.htm',
            scope: {
                item: '=',
                index: '@'
            },
            link: function (scope, element, attrs) {
                // 分页参数
                scope.pageOptions = {
                    pageNum: 1,
                    pageSize: 6
                };
                // 获取浏览器信息
                // 浏览器为谷歌浏览器采用H5播放器
                // if(window.navigator.userAgent.toLowerCase().indexOf("chrome")>=0){
                //   scope.browser = 'chrome';
                // }else{
                //   scope.browser = 'msie';
                // }
                // scope.showIsByTaskIdParams = $rootScope.isTask;
                scope.isShowByTask = false;
                scope.browser = $rootScope.getBowerserInfo();
                // 获取参数信息
                scope.contentParam = scope.item.contentParam ? eval('(' + scope.item.contentParam + ')') : {};
                // 获取时间类型
                scope.timeType = scope.contentParam.timeType ? scope.contentParam.timeType : 2;
                // 获取时间值
                scope.timeValue = scope.contentParam.timeValue ? scope.contentParam.timeValue : -7;
                // 获取时间区间
                scope.time = scope.$parent.getTimeText(scope.timeType, scope.timeValue) || {};
                // 判斷是否根據任務
                if ($rootScope.isTask == '1' || $rootScope.isTask == 1) {
                    scope.isShowByTask = true;
                }
                else {
                    scope.isShowByTask = false;
                }

                // 自定义时间获取自然时间
                if (scope.timeType === 3 || scope.timeType === 1) {
                    // 开始时间
                    scope.time.start = scope.contentParam.startTime;
                    // 结束时间
                    scope.time.end = scope.contentParam.endTime;
                }

                // 石勇 修改 组合时间区间格式 例如 2017-01-01至2017-01-06
                var range = scope.contentParam.startTime;
                if (scope.time.end && scope.timeValue != -1 && scope.timeValue != 1) {
                    range += '至' + scope.contentParam.endTime;
                }

                // 组合时间区间格式 例如 01-01至01-06
                // var range = scope.time.start.substring(5);
                // if(scope.time.end && scope.timeValue != -1 && scope.timeValue != 1){
                //     range += "至"+scope.time.end.substring(5);
                // }
                scope.time.timeRange = range;

                // 是否显示统计周期
                scope.hasTimeDim = false;

                // 设置维度是否选中
                angular.forEach(scope.contentParam.tableParams.column, function (dim) {
                    if (dim.expression === 'timeDim') {
                        scope.hasTimeDim = true;
                        scope.timeKey = dim.filed;
                        return;
                    }

                });

                /**
                 *删除模块
                */
                scope.delModel = function () {
                    scope.$emit('delPageMudle', {id: scope.item.id, index: scope.index});
                };

                /**
                 *时间排序切换
                */
                scope.$on('repostTableData', function (event, data) {
                    scope.contentParam.tableParams.timeDimKey = data.timeDimKey;
                    scope.contentParam.tableParams.timeDimText = data.timeDimText;
                    angular.forEach(scope.contentParam.tableParams.column, function (dim) {
                        if (dim.expression === 'timeDim') {
                            dim.filed = data.timeDimKey;
                            return;
                        }

                    });
                    scope.pageOptions.pageNum = 1;
                    scope.getTableData();
                });

                var timeDimValue = ['dimHour', 'dimMonth', 'dimDay', 'dimYear'];
                scope.tableParams = scope.contentParam.tableParams;

                /**
                 *获取首页自定义表格
                */
                scope.getTableData = function () {
                    var params = {};
                    for (var i = 0; i < scope.contentParam.tableParams.column.length; i++) {
                        if (scope.contentParam.tableParams.column[i].filed === 'timeDim') {
                            scope.contentParam.tableParams.column[i].filed = scope.contentParam.tableParams.timeDimKey;
                        }

                        if ($.inArray(scope.contentParam.tableParams.order, timeDimValue) > -1
                            && scope.contentParam.tableParams.order != scope.contentParam.tableParams.column[i].filed
                            && $.inArray(scope.contentParam.tableParams.column[i].filed, timeDimValue) > -1) {
                            scope.contentParam.tableParams.order = scope.contentParam.tableParams.column[i].filed;
                        }

                    }

                    params = $.extend(params, {
                        timeType: scope.timeType,
                        timeValue: scope.timeValue,
                        startTime: scope.time.start,
                        endTime: scope.time.end,
                        tableParams: JSON.stringify(scope.contentParam.tableParams)
                    }, scope.pageOptions);

                    /*石勇 新增 增加默认传值*/
                    if (params.startTime.length < 11) {
                        params.startTime = params.startTime + ' 00:00:00';
                        params.endTime = params.endTime + ' 23:59:59';
                    }

                    // 
                    return reportService.getTableData(params)
                        .then(function (result) {
                            scope.result = result;
                            scope.rows = [];
                            if (scope.result.value && scope.result.value.rows) {
                                for (var i = 0; i < scope.result.value.rows.length; i++) {
                                    var row = [];
                                    var c = scope.tableParams.column;
                                    for (var j = 0; j < c.length; j++) {
                                        var filed = c[j].filed;
                                        if ($rootScope.isTask == '1' || $rootScope.isTask == 1) {
                                            row.push({
                                                value: scope.result.value.rows[i][filed],
                                                column: c[j],
                                                id: scope.result.value.rows[i].id
                                            });
                                        }
                                        else {
                                            row.push({
                                                value: scope.result.value.rows[i][filed],
                                                column: c[j]
                                            });
                                        }

                                    }
                                    scope.rows.push(row);

                                }
                                scope.counts = result.value.totalRows;
                            }

                        });
                };

                scope.getTableData();

                /**
                 *排序
                */
                scope.sortByOrder = function (order, orderType) {
                    if (order === scope.tableParams.order && orderType === scope.tableParams.orderType) {
                        return;
                    }
                    else {
                        scope.tableParams.order = order;
                        scope.tableParams.orderType = orderType;
                    }
                    scope.getTableData();
                };

            }

        };
    }]);
});
