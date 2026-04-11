/**
 * 第三方模板页
 *
 */
(function (factory) {
    if (typeof define === 'function' && !!define.amd) {
        define([
            'test'
        ], factory);
    }
    else {
        factory(window.test);
    }
})(function (test) {

    test.directive('testDemo', [function () {
        return {
            restrict: 'EA',
            replace: true,
            templateUrl: 'directives/test-demo-directive.htm',
            scope: {
                header: '=',
                item: '='
            },
            link: function (scope, element, attrs) {}
        };
    }]);

});
