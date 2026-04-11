/**
 * 路径编辑指令
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
    app.directive('pathEdit', function () {
        return {
            restrict: 'EA',
            replace: true,
            templateUrl: 'analysis/detail/path/path-edit-directive.htm',
            scope: {
                item: '='
            },
            link: function (scope, element, attrs) {}
        };
    });

});
