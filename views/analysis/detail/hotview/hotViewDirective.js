/**
 * 热词分析
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

    app.directive('hotviewResult', ['$http', '$q', '$state', '$timeout', '$document', 'dialogService', 'topicService', 'CONSTANT', function ($http, $q, $state, $timeout, $document, dialogService, topicService, CONSTANT) {
        return {
            restrict: 'EA',
            replace: true,
            templateUrl: 'analysis/detail/hotview/hotview-result-directive.htm',
            transclude: true,
            scope: {
                item: '=',
                pathId: '=',
                topicId: '='
            },
            link: function (scope, element, attrs) {

                // 热词分析开始
                scope.preData = function () {
                    // 分析是否完成
                    scope.analysisingFinished = false;
                    // 分析是否失败
                    scope.analysisFailed = false;
                    // 是否开始分析
                    scope.isStartAnalysising = false;
                    scope.isWord = 4; // 默认占比降序
                    scope.isVoice = 4; // 默认占比降序
                    scope.type = 'systemKwd';
                    scope.manual = false; // 是否显示刷新时间
                    // 默认排序
                    scope.sortParams = {
                        orderType: 'percent',
                        order: 'desc'
                    };

                    scope.counts = 0;
                    // 分页参数
                    scope.pageOptions = {
                        pageNum: 1,
                        pageSize: 8
                    };
                    scope.hotList = [];

                    // 音频参数
                    scope.sortVoiceParams = {
                        orderType: 'percent',
                        order: 'desc'
                    };

                    scope.countsVoice = 0;
                    scope.pageOptionsVoice = {
                        pageNum: 1,
                        pageSize: 8
                    };
                    scope.hotListVoice = [];
                };

                scope.preData();

                var time;
                var num = 1;

                // 当离开这个页面的时候将弹窗关闭
                scope.$on('$destroy', function () {
                    clearInterval(time);
                });

                // 接受pathID
                scope.$on('hotword', function (event, data) {
                    if (!data.pathId) {
                        return;
                    }

                    scope.pathId = data.pathId;
                    scope.preData();
                    scope.hasAnalysising();
                });

                scope.$on('flushHotView', function (event, data) {
                    if (!data.pathId) {
                        return;
                    }

                    scope.pathId = data.pathId;
                    scope.preData();
                    scope.startAnalysising(true);
                });

                // 判断是否有分析操作
                scope.hasAnalysising = function () {
                    topicService.getHotWordTaskStatus({pathId: scope.pathId, topicId: scope.topicId})
                        .then(function (result) { // result.value为0表示没有热词分析任务
                            clearInterval(time);
                            scope.analysisProcessText = (result.value > 0 && result.value < 3) ? num + '%' : '0%';
                            scope.isStartAnalysising = (result.value > 0 && result.value < 3) ? true : false;
                            scope.analysisingFinished = (result.value === 3) ? true : false;
                            scope.manual = (result.value === 3) ? true : false;
                            if (result.value === 1 || result.value === 2) { // 正在热词分析
                                if (num <= 98) {
                                    num++;
                                }

                                time = setInterval(scope.hasAnalysising, 5000);
                                scope.$emit('hotViewStatus', 1);
                            }

                            if (result.value === 0) {
                                scope.$emit('hotViewStatus', 0);
                            }

                            if (result.value === 3) { // 完成热词分析
                                num = 1;
                                scope.findList();
                                scope.findListVoice();
                                $timeout(function () {
                                    scope.$broadcast('lastFlushTime', {
                                        contentType: 3
                                    });
                                    $document.find('input').placeholder();
                                }, 500);
                                scope.$emit('hotViewStatus', 3);
                            }

                            if (result.value > 3) {
                                num = 1;
                                if (Number(scope.$parent.resultType) === 3) {
                                    if (result.value === 4) {
                                        scope.analysisFailed = true;
                                        dialogService.alert('热词分析失败');
                                        scope.$emit('hotViewStatus', 4);
                                    }
                                    else if (result.value === 5) {
                                        dialogService.alert('热词分析完成，没有热词数据');
                                        scope.$emit('hotViewStatus', 5);
                                    }
                                }
                            }

                        });
                };

                // *开始分析
                scope.startAnalysising = function (flag) {
                    scope.isStartAnalysising = flag;
                    topicService.createHotWordTask({pathId: scope.pathId, topicId: scope.topicId})
                        .success(function (result) {
                            if (result.success) {
                                num = 1;
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

                // 获得词频列表
                scope.findList = function (params) {
                    if (!scope.validKWD()) {
                        return;
                    }

                    params = $.extend(true, scope.sortParams, {
                        topicId: scope.topicId,
                        pathId: scope.pathId,
                        type: scope.type,
                        kwType: 'kwd',
                        keyword: scope.hotKeyWord
                    }, scope.pageOptions);
                    scope.queryHotWord(params, 'kwd');
                };
                // 获得音频列表
                scope.findListVoice = function (params) {
                    if (!scope.validKWD()) {
                        return;
                    }

                    params = $.extend(true, {
                        topicId: scope.topicId,
                        pathId: scope.pathId,
                        type: scope.type,
                        kwType: 'voice',
                        keyword: scope.hotKeyWord
                    }, scope.pageOptionsVoice, scope.sortVoiceParams);
                    scope.queryHotWord(params, 'voice');
                };
                // 查询接口
                scope.queryHotWord = function (params, type) {
                    return topicService.queryHotWordStat(params)
                        .then(function (result) {
                            var data = result.value || [];
                            var showIncrement = result.value && result.value.length ? result.value[0].showIncrement : false;
                            var count = result.value && result.value.length ? result.value[0].totalCount : 0;
                            if (type === 'kwd') {
                                scope.hotList = data;
                                scope.showIncrement = showIncrement;
                                scope.counts = count;
                            }
                            else {
                                scope.hotListVoice = data;
                                scope.showVoiceIncrement = showIncrement;
                                scope.countsVoice = count;
                                scope.$emit('hotViewCount', scope.countsVoice);
                            }
                            scope.$emit('hotWordImportParams', {
                                hotWordImportParams: $.extend(scope.sortParams, {
                                    keyword: scope.hotKeyWord
                                })
                            });
                        });
                };

                // 搜索框监听Enter键
                scope.enterHotWordKey = function (event) {
                    event = event || window.event;
                    if (event.keyCode == 13) {
                        scope.searchHotWord();
                    }

                };

                // 搜索音频词频
                scope.searchHotWord = function () {
                    if (!scope.validKWD()) {
                        return;
                    }

                    scope.pageOptions.pageNum = 1;
                    scope.pageOptionsVoice.pageNum = 1;
                    scope.findList();
                    scope.findListVoice();
                };

                // 检验字段规范
                scope.validKWD = function () {
                    scope.hotKeyWord = $('#hotWordKeyWord').val();
                    if (scope.hotKeyWord) {
                        if (scope.hotKeyWord.replace(/[^\x00-\xff]/g, 'xx').length > 20) {
                            dialogService.alert('搜索字段不能超过20个字符');
                            return false;
                        }

                        if (CONSTANT.textReplace.test(scope.hotKeyWord)) {
                            dialogService.alert('搜索字段不能包含特殊字符');
                            return false;
                        }
                    }
                    else {
                        scope.hotKeyWord = '';
                    }
                    return true;
                };

                // 排序
                scope.remarkChange = function (order, index, orderType, type) {
                    if (type === 'kwd') {
                        scope.sortParams = {
                            order: order,
                            orderType: orderType
                        };
                        scope.isWord = index;
                        scope.findList();
                    }
                    else if (type === 'voice') {
                        scope.sortVoiceParams = {
                            order: order,
                            orderType: orderType
                        };
                        scope.isVoice = index;
                        scope.findListVoice();
                    }

                };

                // 按系统热词或关注热词切换
                scope.toggle = function (type) {
                    scope.type = type;
                    scope.pageOptions.pageNum = 1;
                    scope.pageOptionsVoice.pageNum = 1;
                    scope.sortParams = {
                        orderType: 'percent',
                        order: 'desc'
                    };
                    scope.sortVoiceParams = {
                        orderType: 'percent',
                        order: 'desc'
                    };
                    scope.isWord = 4;
                    scope.isVoice = 4;
                    scope.findList();
                    scope.findListVoice();
                    // scope.$emit('hotWordImportParams', {hotWordImportParams: $.extend(scope.sortParams, {keyword: scope.hotKeyWord})});
                };

            }
        };
    }]);

});
