/**
 * 自定义专题-基础分析-图表和通话列表
 * @author
 * @time
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
    app.directive('callResult', function () {

        return {
            restrict: 'EA',
            replace: true,
            templateUrl: 'analysis/detail/call/call-result-directive.htm',
            transclude: true,
            scope: {
                pathId: '=',
                topicId: '=',
                assignAuth: '@',
                markAuth: '@',
                canView: '@'
            },
            link: function (scope, element, attrs) {}
        };
    });
});
