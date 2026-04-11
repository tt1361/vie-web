/**
 *漏斗分析首页
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

    app.directive('funnelTool', ['$timeout', 'topicService', '$q', function ($timeout, topicService, $q) {
        return {
            restrict: 'EA',
            replace: true,
            templateUrl: 'analysis/detail/funnel/funnel-tool-directive.htm',
            transclude: true,
            scope: {
                pathId: '=',
                topicId: '=',
                item: '='
            },
            link: function (scope, element, attrs) {
                scope.conversionRate = '0%'; // 总体转化率默认值
                scope.allTable = true; // 分析表格是否是全部表格
                scope.showFunnel = true; // 是否展示漏斗工具

                // 图表颜色数组  循环取颜色
                var colors = ['#91c153', '#bc2625', '#e97739', '#efbe47', '#fee04e',
                    '#867318', '#b07817', '#f39d09', '#69d31a', '#ae561b', '#22ddd2'];

                // 查询总体转化率
                scope.getTotalRate = function () {
                    topicService.getTotalRate({pathId: scope.pathId, topicId: scope.topicId})
                        .then(function (result) {
                            scope.conversionRate = result.value || '0%';
                        });
                };

                // 查询漏斗分析图表
                scope.getFunnelChart = function () {
                    var deferred = $q.defer();
                    topicService.getFunnelChart({pathId: scope.pathId, topicId: scope.topicId})
                        .then(function (result) {
                            scope.funnelList = result.value || '';
                            var data = scope.funnelList ? scope.funnelList.data : [];
                            if (!data.length) {
                                return;
                            }

                            var firstData = data[0];
                            scope.dataRate = [];
                            scope.dataColor = [];
                            for (var i = 0; i <= data.length; i++) {
                                if (i) {
                                    scope.dataRate.push((data[i] / firstData).toFixed(2) * 100 + '%');
                                }
                                else {
                                    Number(firstData) ? scope.dataRate.push('100%') : scope.dataRate.push('0%');
                                }
                                scope.dataColor.push(colors[i % colors.length]);
                            }
                            deferred.resolve(scope.funnelList);
                        });
                    return deferred.promise;
                };

                // 查询列表
                scope.getFunnelTable = function (index) {
                    var params = {pathId: scope.pathId, topicId: scope.topicId};
                    scope.allTable = angular.isUndefined(index) ? true : false;
                    params = {
                        pathId: scope.pathId,
                        topicId: scope.topicId,
                        allPathFlag: angular.isUndefined(index) ? 1 : 0
                    };
                    // 若为击触发的的事件
                    if (!angular.isUndefined(index)) {
                        scope.currentName = scope.funnelList.name[index];
                        scope.condition = scope.funnelList.condition[index];
                        params.condition = scope.condition;
                        scope.$emit('curPageType', {
                            curPageType: 5
                        });
                    }

                    topicService.getFunnelTable(params)
                        .then(function (result) {
                            scope.tableList = result.value || [];
                            scope.resetTdWidth();
                        });
                    scope.$emit('funnelTableImportParams', {
                        params: params
                    });
                };

                // 查询通话列表  flag:0:全部表格    1：层级表格
                scope.getFunnelList = function (index, flag) {
                    // index传值为空直接返回
                    if (index === 2 && flag === 1) {
                        return;
                    }
                    else {
                        if (angular.isUndefined(index)) {
                            return;
                        }

                        scope.showFunnel = false;
                        scope.isNumData = 1;
                        scope.$emit('curPageType', {
                            curPageType: 6
                        });
                        if (flag) {
                            if (index) {
                                return;
                            }

                            scope.isNumData = 0;
                        }
                        else {
                            scope.condition = scope.funnelList.condition[index];
                            scope.currentName = scope.funnelList.name[index];
                        }
                    }

                };

                // 显示/隐藏漏斗分析
                scope.showFunnels = function () {
                    scope.showFunnel = !scope.showFunnel;
                    if (scope.allTable) {
                        scope.$emit('curPageType', {
                            curPageType: 4
                        });
                    }
                    else {
                        scope.$emit('curPageType', {
                            curPageType: 5
                        });
                    }
                };

                /**
                 * 接收 viewResultDirective $broadcast
                 * 更新pathId
                 */
                // 接受tab标签点击订阅广播
                scope.$on('funnelTool', function (event, data) {
                    if (!data.pathId) {
                        return;
                    }

                    scope.pathId = data.pathId;
                    scope.showFunnel = true;
                    scope.getFunnelChart().then(function () {
                        setTimeout(function () {
                            scope.divToBase64().then(function (base64) {
                                scope.$emit('funnelImportCode', {
                                    svgCode: base64
                                });
                                $('.rote-chart').attr('style', 'height:550px'); // 恢复画布高度至550px
                            });
                        }, 500);
                    });
                    scope.getTotalRate();
                    scope.getFunnelTable();
                });

                scope.$on('colResizable', function (ngRepeatFinishedEvent) {
                    scope.resetTdWidth();
                });

                scope.resetTdWidth = function () {
                    var tableWidth = $('.funnel-list-wrapper table').width();
                    if (scope.tableList.column) {
                        var length = scope.tableList.column.length + 1;
                    }

                    $('.funnel-list-wrapper table td').css('width', Math.round(tableWidth / length) + 'px');
                };

                scope.$on('resetTdWidth', function (event, data) {
                    $('.funnel-list-wrapper table td').removeAttr('style');
                    $timeout(function () {
                        scope.resetTdWidth();
                    }, 500);
                });

                /*将HTML转化为base64*/
                scope.divToBase64 = function () {
                    var deferred = $q.defer();
                    var canvasContent = document.getElementById('funnel-chart');
                    // 做导出漏斗图片判断，当展示漏斗图超过11个条件时，改变画布高度，保证导出图完全，之后恢复画布高度为550px
                    if (scope.dataRate.length > 12) {
                        var heightAdd = (scope.dataRate.length - 12) * 50 + 550;
                        $('.rote-chart').attr('style', 'height:' + heightAdd + 'px');
                    }

                    html2canvas(canvasContent, {
                        onrendered: function (canvas) {
                            // 添加属性
                            // canvas.setAttribute('id','thecanvas');
                            // console.log(canvas.toDataURL());
                            deferred.resolve(canvas.toDataURL());
                            // 读取属性值
                            // canvas.setAttribute('id','thecanvas');
                            // document.getElementById('images').appendChild(canvas);
                        }
                    });
                    return deferred.promise;
                };

            }
        };
    }]);

});
