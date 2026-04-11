/**
*  本文件中的directives  上线中的功能
*   item: Object;  待上线中的对象
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

    app.directive('onlingAction', ['$timeout', '$q', 'gdModelService', function ($timeout, $q, gdModelService) {
        return {
            restrict: 'EA',
            replace: true,
            scope: {
                item: '='
            },
            link: function (scope, element, attrs) {
                // 接受定时器返回promise
                var timer;
                // 获取上线中模型状态的接口
                scope.onling = function () {
                    gdModelService.getModelStatus({
                        modelId: scope.item.modelId
                    })
                        .then(function (result) {
                            scope.item.modelStatus = result.value && result.value.modelStatus ? result.value.modelStatus : 0;
                            scope.item.modelCount = result.value && result.value.modelCount ? result.value.modelCount : '';
                            scope.item.errorReason = result.value && result.value.errorReason ? result.value.errorReason : '上线失败';
                            if (scope.item.modelStatus != 0) { // 不是上线中状态
                                return $q.reject(false);
                            }

                            return true;
                        }).then(function () { // 上线中状态继续刷新
                        timer = $timeout(scope.onling, 10000);
                    });
                };

                // 当离开这个页面的时候将定时器清空
                scope.$on('$destroy', function () {
                    if (timer) {
                        $timeout.cancel(timer);
                    }

                });

                scope.onling();
            }
        };
    }]);

});
