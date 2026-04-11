/**
 * 功能：上次刷新时间(聚类、热词)
 * @update yancai2
 * @time 2017/7/14
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
    app.directive('manualRefresh', ['topicService', function (topicService) {
        return {
            restrict: 'EA',
            replace: true,
            templateUrl: 'analysis/detail/manual-refresh-directive.htm',
            transclude: true,
            scope: {
                pathId: '=',
                topicId: '=',
                type: '@'
            },
            link: function (scope, element, attrs) {
                // 刷新
                scope.manual = function () {
                    scope.$emit('manualData');
                };

                // 获取上次更新时间
                scope.getLastUpdateTime = function () {
                    if (Number(scope.type) === 2) { // 聚类
                        scope.getClusterLastFlushTime();
                    }
                    else if (Number(scope.type) === 3) { // 热词分析
                        scope.getHotWordLastFlushTime();
                    }

                };

                // 获取上次热词更新时间
                scope.getHotWordLastFlushTime = function () {
                    topicService.getHotWordLastFlushTime({
                        pathId: scope.pathId
                    })
                        .then(function (result) {
                            // scope.lastUpdateTime = result.value || getNowTime();
                            scope.lastUpdateTime = result.value; // 时间只选取接口返回的时间
                        });
                };

                // 获取上次聚类更新时间
                scope.getClusterLastFlushTime = function () {
                    topicService.getClusterLastFlushTime({
                        pid: scope.pathId
                    })
                        .then(function (result) {
                            // scope.lastUpdateTime = result.value || getNowTime();
                            scope.lastUpdateTime = result.value; // 时间只选取接口返回的时间
                        });
                };

                // 获取当前系统时间
                var getNowTime = function () {
                    var myDate = new Date();
                    var year = myDate.getFullYear();
                    var month = myDate.getMonth() + 1;
                    var date = myDate.getDate();
                    var hour = myDate.getHours();
                    var minute = myDate.getMinutes();
                    var second = myDate.getSeconds();
                    var clock = year + '-';
                    if (month < 10) {
                        clock += '0';
                    }

                    clock += month + '-';
                    if (date < 10) {
                        clock += '0';
                    }

                    clock += date + ' ';
                    if (hour < 10) {
                        clock += '0';
                    }

                    clock += hour + ':';
                    if (minute < 10) {
                        clock += '0';
                    }

                    clock += minute + ':';
                    if (second < 10) {
                        clock += '0';
                    }

                    clock += second;
                    return clock;
                };
                // 监听
                scope.$on('lastFlushTime', function (event, data) {
                    scope.type = data.contentType;
                    // scope.getClusterLastFlushTime(); 
                    scope.getLastUpdateTime();
                });
            }
        };
    }]);
});
