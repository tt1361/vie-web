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

    app.directive('analysisCustom', ['topicService', function (topicService) {
        return {
            restrict: 'EA',
            replace: true,
            templateUrl: 'index/custom/analysis-custom-directive.htm',
            transclude: true,
            scope: {
                item: '=',
                index: '@'
            },
            link: function (scope, element, attrs) {

                scope.pathDimension = '';
                scope.num = 1;
                scope.hotNum = 1;

                /**
                 *根据TopicId获取参数
                 *
                 */
                scope.getParamsByTopicId = function () {
                    topicService.getDetailTopic({
                        topicId: Number(scope.item.moduleId)
                    })
                        .then(function (result) {
                            scope.screening = result.value.topicCondition || [];
                            angular.forEach(scope.screening, function (item) {
                                if (item.type === 'timeRange') {
                                    scope.timeType = item.timeType ? item.timeType : 2;
                                    scope.timeValue = item.timeValue ? item.timeValue : -7;
                                    scope.time = scope.$parent.getTimeText(scope.timeType, scope.timeValue) || {};
                                    if (scope.timeType === 3 || scope.timeType === 1) { // 自定义时间获取自然时间
                                        if (item.inputValue) {
                                            scope.time.start = item.inputValue.split('~')[0];
                                            scope.time.end = item.inputValue.split('~')[1];
                                        }
                                    }

                                    // 增加显示时间区间精确到时分秒，leichen13@20171229
                                    var range;
                                    if (scope.time.start.length < 11) {
                                        var range = scope.time.start + ' 00:00:00';
                                        if (scope.time.end && scope.timeValue != -1 && scope.timeValue != 1) {
                                            range += '至' + scope.time.end + ' 23:59:59';
                                        }
                                    }
                                    else {
                                        var range = scope.time.start;
                                        if (scope.time.end && scope.timeValue != -1 && scope.timeValue != 1) {
                                            range += '至' + scope.time.end;
                                        }
                                    }
                                    scope.time.timeRange = range;
                                }

                            });
                            scope.tabPaths = result.value.pathDimension || [];
                            angular.forEach(scope.tabPaths, function (item) {
                                if (Number(item.pathId) === Number(scope.item.moduleDetailInfo)) {
                                    scope.pathDimension = item;
                                    return;
                                }

                            });
                            scope.listenContentType();
                        });
                };

                scope.getParamsByTopicId();

                /**
                 *柱状图/折线图切换
                 *
                 */
                scope.changeChartType = function (type) {
                    scope.chartType = type;
                    scope.isColumn = scope.chartType === 'column' ? true : false;
                    scope.$broadcast('changeTypeData', {
                        chartType: scope.chartType
                    });
                };

                /**
                 *删除模块
                 *
                 */
                scope.delModel = function () {
                    scope.$emit('delPageMudle', {id: scope.item.id, index: scope.index});
                };

                scope.$on('changeContentType', function (event, data) {
                    scope.item.contentType = Number(data.contentType);
                    scope.listenContentType();
                });

                /**
                 *监听类型处理
                 *
                 */
                scope.listenContentType = function () {
                    if (scope.item.contentType === 43) {
                        scope.chartType = scope.pathDimension.isChart ? 'line' : 'column';
                        scope.isColumn = scope.chartType === 'column' ? true : false;
                        scope.chooseType = 1;
                    }
                    else if (scope.item.contentType === 41) {
                        scope.chooseType = 2;
                    }
                    else if (scope.item.contentType === 44) {
                        scope.chooseType = 3;
                    }
                    else if (scope.item.contentType === 42) {
                        scope.chooseType = 4;
                    }

                };
            }
        };
    }]);

});
