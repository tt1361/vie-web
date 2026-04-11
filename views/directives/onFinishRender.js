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
    app.directive('onFinishRender', ['$timeout', function ($timeout) {
        return {
            restrict: 'A',
            link: function (scope, element, attrs) {
                if (scope.$last) {
                    $timeout(function () {
                        scope.$emit(attrs.broadcasteventname ? attrs.broadcasteventname : 'ngRepeatFinished');
                    });
                }

            }
        };
    }]);
});
