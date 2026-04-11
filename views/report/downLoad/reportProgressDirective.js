/**
*  报表下载进度
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

    app.directive('progressAction', [
        '$timeout',
        '$q',
        'reportService', function ($timeout, $q, reportService) {

            return {
                restrict: 'EA',
                replace: true,
                scope: {
                    item: '='
                },
                link: function (scope, element, attrs) {
                    // 接受定时器返回promise
                    var timer;
                    // 当离开这个页面的时候将定时器清空
                    scope.$on('$destroy', function () {
                        if (timer) {
                            $timeout.cancel(timer);
                        }

                    });

                    // 获取上线中模型状态的接口
                    scope.getProcessBar = function () {
                        reportService.getDownloadReportStatus({
                            reportDownloadId: scope.item.id
                        })
                            .then(function (result) {
                                scope.item.progressRate = result.value || 0;
                                if (scope.item.progressRate === 100) { // 已上线或为上线
                                    scope.$parent.getDownloadReportList();
                                    return $q.reject(result);
                                }

                                return result;
                            }).then(function () {
                            timer = $timeout(scope.getProcessBar, 10000);
                        });
                    };

                    scope.getProcessBar();
                }
            };
        }
    ]);
});
