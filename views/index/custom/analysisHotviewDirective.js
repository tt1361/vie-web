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

    app.directive('analysisHotview', ['$document', 'dialogService', 'topicService', function ($document, dialogService, topicService) {
        return {
            restrict: 'EA',
            replace: true,
            templateUrl: 'index/custom/analysis-hotview-directive.htm',
            transclude: true,
            scope: {
                item: '=',
                index: '@'
            },
            link: function (scope, element, attrs) {
                scope.analysisingFinished = false; // 分析是否失败
                scope.analysisFailed = false; // 是否开始分析
                scope.isStartAnalysising = false;
                scope.topicId = scope.$parent.item.moduleId; // 自定义专题Id
                scope.isWord = 4;
                scope.hotTypeName = '系统热词';
                scope.isChoosedVoice = 2; // 默认选中音频
                scope.isOpenChart = false; // 热词类型下拉列表展开状态
                scope.type = 'systemKwd';
                scope.sortParams = {
                    orderType: 'percent',
                    order: 'desc'
                };
                scope.kwType = 'voice'; // 首次默认展示音频
                scope.counts = 0; // 热词总数
                scope.isSametime = false; // 默认不展示趋势变化;
                scope.pageOptions = {
                    pageNum: 1,
                    pageSize: 5
                };
                scope.hotList = [];
                var time;

                /**
                 *判断是否有分析操作
                 *
                 */
                scope.hasAnalysising = function () {
                    topicService.getHotWordTaskStatus({pathId: scope.item.pathId, topicId: scope.topicId})
                        .then(function (result) { // result.value为0表示没有热词分析任务
                            clearInterval(time);
                            scope.analysisProcessText = (result.value > 0 && result.value < 3) ? scope.$parent.$parent.hotNum + '%' : '0%';
                            scope.isStartAnalysising = (result.value > 0 && result.value < 3) ? true : false;
                            scope.analysisingFinished = (result.value === 3) ? true : false;
                            scope.manual = (result.value === 3) ? true : false;
                            if (result.value === 1 || result.value === 2) { // 正在热词分析
                                if (scope.$parent.$parent.hotNum <= 98) {
                                    scope.$parent.$parent.hotNum++;
                                }

                                time = setInterval(scope.hasAnalysising, 5000);
                            }

                            if (result.value === 3) { // 完成热词分析
                                scope.$parent.$parent.hotNum = 1;
                                scope.findList();
                            }

                            if (result.value > 3) {
                                scope.$parent.$parent.hotNum = 1;
                                if (Number(scope.$parent.resultType) === 3) {
                                    if (result.value === 4) {
                                        scope.analysisFailed = true;
                                        dialogService.alert('热词分析失败');
                                    }
                                    else if (result.value === 5) {
                                        dialogService.alert('热词分析完成，没有热词数据');
                                    }
                                }
                            }

                        });
                };

                /**
                 *开始分析
                 *
                 */
                scope.startAnalysising = function (flag) {
                    scope.isStartAnalysising = flag;
                    topicService.createHotWordTask({pathId: scope.item.pathId, topicId: scope.topicId})
                        .success(function (result) {
                            if (result.success) {
                                scope.$parent.$parent.hotNum = 1;
                                scope.hasAnalysising();
                            }
                            else {
                                dialogService.alert('无法分析');
                                scope.analysisProcessText = '0%';
                                scope.analysisingFinished = false;
                                scope.isStartAnalysising = false;
                                scope.manual = false;
                            }
                        });
                };

                /**
                 *获得词频列表
                 *
                 */
                scope.findList = function (params) {
                    params = $.extend(params, {pathId: scope.item.pathId, topicId: scope.topicId, type: scope.type, kwType: scope.kwType, keyword: ''}, scope.pageOptions, scope.sortParams);
                    return topicService.queryHotWordStat(params)
                        .then(function (result) {
                            scope.hotList = result.value || [];
                            scope.isSametime = result.value && result.value.length ? result.value[0].showIncrement : false;
                            scope.counts = result.value && result.value.length ? result.value[0].totalCount : 0;
                        });
                };

                /**
                 *是否展示下拉列表
                 */
                scope.showChartOpen = function () {
                    scope.isOpenChart = !scope.isOpenChart;
                };

                /**
                 *点击任意位置让弹出的下拉框收起
                 */
                scope.uid = Math.floor(Math.random() * 1000) + 1000;
                $document.on('click', function (e) {
                    if (!scope.isOpenChart) {
                        return;
                    }

                    var i = 0,
                        ele;
                    if (!e.target) {
                        return;
                    }

                    for (ele = e.target; ele; ele = ele.parentNode) {
                        if (angular.lowercase(ele.className) === 'hot-word-tab-index'
                            || ele.nodeType === 9) {
                            break;
                        }

                        var uid = scope.$eval(ele.getAttribute('uid'));
                        if (!!uid && uid === scope.uid) {
                            return;
                        }

                    }
                    scope.showChartOpen();
                    scope.$apply();
                });

                /**
                 *排序
                 */
                scope.remarkChange = function (order, value, index) {
                    scope.isWord = index;
                    scope.sortParams = {
                        order: order,
                        orderType: value
                    };
                    scope.findList();
                };

                /** 
                 *按系统热词或关注热词切换
                 */
                scope.toggle = function (type, value) {
                    scope.hotTypeName = value;

                    scope.pageOptions = {
                        pageNum: 1,
                        pageSize: 5
                    };
                    scope.type = type;

                    scope.sortParams = {
                        order: 'desc',
                        orderType: 'percent'
                    };
                    scope.isWord = 4;
                    scope.findList();
                    scope.showChartOpen();
                };

                /**
                 * 按词频或音频进行排行
                 */
                scope.toggle_voice = function (value, index) {
                    scope.isChoosedVoice = index;

                    scope.sortParams = {
                        order: 'desc',
                        orderType: 'percent'
                    };

                    scope.isWord = 4;

                    scope.pageOptions = {
                        pageNum: 1,
                        pageSize: 5
                    };
                    scope.kwType = value;
                    scope.findList();
                };

                /**
                 *判断是否已分析
                 */
                scope.$watch('item', function (newValue, oldValue) {
                    if (!newValue) {
                        return;
                    }

                    scope.hasAnalysising();
                });
            }
        };

    }]);

});
