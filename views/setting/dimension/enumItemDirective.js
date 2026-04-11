/**
 * 自定义维度颜色选择
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

    app.directive('enumItem', ['$document', function ($document) {
        return {
            restrict: 'EA',
            replace: true,
            templateUrl: 'setting/dimension/enum-item-directive.htm',
            scope: {
                item: '=',
                colors: '=',
                index: '@'
            },
            link: function (scope, element, attrs) {
                // 显示颜色控件
                scope.showColorOpen = function () {
                    scope.colorOpen = !scope.colorOpen;
                };

                // 选择颜色
                scope.chooseColor = function (color) {
                    scope.item.dimensionColor = color;
                    scope.showColorOpen();
                };

                // 删除
                scope.delItemValue = function () {
                    scope.$parent.item.dimensionValues.splice(scope.index, 1);
                };

                // 点击页面其他地方收起颜色选择器
                $(window.document).click(function (event) {
                    if (!angular.element(event.target).parents('.enum-color').length
                        && !angular.element(event.target).hasClass('colors')
                        && scope.colorOpen) {
                        scope.colorOpen = false;
                    }
                    scope.$apply();
                });
            }
        };
    }]);

});
