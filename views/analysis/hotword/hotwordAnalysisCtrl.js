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
     * 热词分析控制器
     */
    app.controller('hotWordAnalysisCtrl', [
        '$scope',
        '$state',
        '$document',
        'baseService',
        'systemIndexService', function ($scope, $state, $document, baseService, systemIndexService) {
            $document.find('input').placeholder();
            $scope.setAuth = false; // 是否有配置权限
            // 初始化数据
            $scope.type = 'systemKwd';
            $scope.order = 'percent';
            $scope.orderVoice = 'percent';

            /*对日期减一天处理的公共方法 */
            $scope.minusOneDay = function (initDay) {
                var pretime = initDay;
                pretime.replace(/-/g, '/');
                var pre = new Date(pretime);
                var timeSecond = pre.getTime() - 24 * 3600 * 1000;
                var now = new Date(timeSecond);
                var year = now.getFullYear();
                var month = now.getMonth() + 1;
                var day = now.getDate();
                if (month < 10) {
                    month = '0' + month;
                }

                if (day < 10) {
                    day = '0' + day;
                }

                var fullDay = year + '-' + month + '-' + day;
                return fullDay;
            };

            /*对日期加一天处理的公共方法 */
            $scope.plusOneDay = function (initDay) {
                var pretime = initDay;
                pretime.replace(/-/g, '/');
                var pre = new Date(pretime);
                var timeSecond = pre.getTime() + 24 * 3600 * 1000;
                var now = new Date(timeSecond);
                var year = now.getFullYear();
                var month = now.getMonth() + 1;
                var day = now.getDate();
                if (month < 10) {
                    month = '0' + month;
                }

                if (day < 10) {
                    day = '0' + day;
                }

                var fullDay = year + '-' + month + '-' + day;
                return fullDay;
            };
            // 获取时间
            $scope.timesRange = baseService.getSystemTime();
            $scope.timesRange.defaultStart = $scope.plusOneDay($scope.timesRange.defaultStart);

            /**
             * @brief 搜索框监听Enter键
             * @details [long description]
             *
             * @param  [description]
             * @return [description]
             */
            $scope.enterKey = function (event) {
                event = event || window.event;
                if (event.keyCode == 13) {
                    $scope.search();
                }

            };

            /**
             * @brief 搜索
             * @details [long description]
             * @return [description]
             */
            $scope.search = function () {
                if (!baseService.validWord($scope.keyword)) {
                    return;
                }

                $scope.refreshHotData();
            };

            /**
             * @brief 按系统热词或关注热词切换
             * @details [long description]
             *
             * @param  type 表示是系统热词还是关注热词
             * @return [description]
             */
            $scope.toggle = function (type) {
                $scope.pageOptions.pageNum = 1;
                $scope.pageOptionsVoice.pageNum = 1;
                $scope.type = type;
                $scope.refreshHotData();
            };

            /**
             * @brief 监听排序
             * @details [long description]
             *
             * @param t 事件
             * @param a 数据参数
             *
             * @return [description]
             */
            $scope.$on('remarkRange', function (event, data) {
                if (data.kwType === 'kwd') {
                    $scope.order = data.order;
                }
                else {
                    $scope.orderVoice = data.order;
                }
                $scope.findList('', data.kwType);
            });

            /**
             * @brief 功能权限
             * @details [long description]
             *
             * @param e [description]
             * @param e [description]
             *
             * @return [description]
             */
            $scope.$watch('$parent.resources', function (newValue, oldValue) {
                if (!newValue) {
                    return;
                }

                angular.forEach(newValue, function (resource) {
                    if (resource.link === '/setting.do') { // 模型
                        $scope.setAuth = true; // 有配置权限
                        return;
                    }

                });
            });

            /**
             * @brief 返回首页
             * @details [long description]
             * @return [description]
             */
            $scope.callback = function () {
                $state.go('main.index.system', {}, {
                    reload: true
                });
            };

            /**
             * @brief 返回专题
             * @details [long description]
             * @return [description]
             */
            $scope.gotoAnalysis = function () {
                $state.go('main.analysis.manage', {}, {
                    reload: true
                });
            };

            /**
             * @brief 判断是否为同一天内
             * @details [long description]
             * @return [description]
             */
            $scope.isTheSametime = function () {
                $scope.isSametime = $scope.timesRange.defaultStart.split(' ')[0] === $scope.timesRange.defaultEnd.split(' ')[0] ? true : false;
            };

            /**
             * @brief 获取后台数据
             * @details [long description]
             *
             * @param s [description]
             * @param e [description]
             *
             * @return [description]
             */
            $scope.findList = function (params, kwType) {
                // 对不同时间格式做个判断
                var defaultStart;
                var defaultEnd;
                if ($scope.timesRange.defaultEnd.length > 10) {
                    defaultStart = $scope.minusOneDay($scope.timesRange.defaultStart.split(' ')[0]);
                    defaultEnd = $scope.minusOneDay($scope.timesRange.defaultEnd.split(' ')[0]);
                }
                else {
                    defaultStart = $scope.minusOneDay($scope.timesRange.defaultStart);
                    defaultEnd = $scope.minusOneDay($scope.timesRange.defaultEnd);
                }
                params = $.extend(params, {
                    wordType: $scope.type,
                    orderType: kwType === 'kwd' ? $scope.order : $scope.orderVoice,
                    countType: kwType,
                    keyWord: $scope.keyword,
                    startTime: defaultStart,
                    endTime: defaultEnd,
                    pageNum: kwType === 'kwd' ? $scope.pageOptions.pageNum : $scope.pageOptionsVoice.pageNum,
                    pageSize: kwType === 'kwd' ? $scope.pageOptions.pageSize : $scope.pageOptionsVoice.pageSize
                });

                if (kwType === 'kwd') {
                    params = $.extend(params, $scope.pageOptions);
                }
                else {
                    params = $.extend(params, $scope.pageOptionsVoice);
                }

                return systemIndexService.fetchHotWord(params)
                    .then(function (result) {
                        if (kwType === 'kwd') {
                            $scope.hotList = result.value || [];
                            $scope.counts = 0;
                            if ($scope.hotList.length) {
                                $scope.counts = $scope.hotList[0].totalCount || 0;
                            }
                        }
                        else {
                            $scope.hotVoiceList = result.value || [];
                            $scope.countsVoice = 0;
                            if ($scope.hotVoiceList.length) {
                                $scope.countsVoice = $scope.hotVoiceList[0].totalCount || 0;
                            }
                        }
                    });
            };

            /**
             * @brief 重置分页数据
             * @details [long description]
             * @return [description]
             */
            $scope.resetData = function () {
                $scope.pageOptions = {
                    pageNum: 1,
                    pageSize: 10
                };

                $scope.pageOptionsVoice = {
                    pageNum: 1,
                    pageSize: 10
                };
            };

            /**
             * @brief 刷新数据
             * @details [long description]
             * @return [description]
             */
            $scope.refreshHotData = function () {
                $scope.resetData();
                $scope.isTheSametime();
                $scope.findList('', 'kwd');
                $scope.findList('', 'voice');
            };

            $scope.refreshHotData();
        }
    ]);
});
