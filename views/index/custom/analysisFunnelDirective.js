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

    app.directive('analysisFunnel', ['topicService', function (topicService) {
        return {
            restrict: 'EA',
            replace: true,
            templateUrl: 'index/custom/analysis-funnel-directive.htm',
            transclude: true,
            scope: {
                item: '=',
                index: '@'
            },
            link: function (scope, element, attrs) {
                scope.topicId = scope.$parent.item.moduleId; // 专题Id

                // 图表颜色数组  循环取颜色
                var colors = ['#91c153', '#bc2625', '#e97739', '#efbe47', '#fee04e',
                    '#867318', '#b07817', '#f39d09', '#69d31a', '#ae561b', '#22ddd2'];

                /**
                 *查询总体转化率
                 *
                 */
                scope.getTotalRate = function () {
                    topicService.getTotalRate({pathId: scope.item.pathId, topicId: scope.topicId})
                        .then(function (result) {
                            scope.conversionRate = result.value || '0%';
                        });
                };

                /**
                 *查询漏斗分析图表
                 *
                 */
                scope.getFunnelChart = function () {
                    topicService.getFunnelChart({pathId: scope.item.pathId, topicId: scope.topicId})
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
                        });
                };

                scope.$watch('item', function (newValue, oldValue) {
                    if (!newValue) {
                        return;
                    }

                    scope.getTotalRate();
                    scope.getFunnelChart();
                });
            }
        };
    }]);

});
