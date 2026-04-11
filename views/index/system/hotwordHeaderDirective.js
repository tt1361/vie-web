/**
 * 系统首页热词分析表头
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
    app.directive('hotwordHeader', function () {
        return {
            restrict: 'EA',
            replace: true,
            templateUrl: 'index/system/hotword-header-directive.htm',
            transclude: true,
            scope: {
                kwType: '@',
                isSametime: '='
            },
            link: function (scope, element, attrs) {}
        };
    });

});
