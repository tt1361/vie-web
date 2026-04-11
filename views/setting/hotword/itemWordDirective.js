/**
 * 热词删除
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

    app.directive('itemWord', ['dialogService', function (dialogService) {
        return {
            restrict: 'EA',
            replace: true,
            templateUrl: 'setting/hotword/item-word-directive.htm',
            scope: {
                item: '=',
                index: '@',
                isBlack: '@'
            },
            link: function (scope, element, attrs) {
                // 删除热词
                scope.delItemWord = function () {
                    dialogService.confirm('是否删除该词？').then(function () {
                        var black = false;
                        if (scope.isBlack === 'true') {
                            black = true;
                            scope.$parent.blackList.splice(scope.index, 1);
                        }
                        else {
                            scope.$parent.whiteList.splice(scope.index, 1);
                        }
                        scope.$parent.deleWord(scope.item, black);
                    });
                };
            }
        };
    }]);

});
