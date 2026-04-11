/**
 * 自定义维度
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

    app.directive('customSelect', function () {
        return {
            restrict: 'EA',
            replace: true,
            templateUrl: 'setting/dimension/custom-select-directive.htm',
            scope: {
                item: '='
            },
            link: function ($scope, element, attrs) {
                // 枚举类型下拉列表
                $scope.showSelectValue = function () {
                    $scope.selectValueOpen = !$scope.selectValueOpen;
                };

                // 获取枚举值
                $scope.setType = function (type) {
                    $scope.item.dimensionType = type;
                    if (type === 'mulSel') {
                        $scope.item.typeName = '枚举';
                    }
                    else if (type === 'mulEqu' || type === 'range') {
                        $scope.item.typeName = '输入';
                    }
                    $scope.showSelectValue();
                };

                // 点击页面其他地方收起下拉列表
                $(window.document).click(function (event) {
                    if (!angular.element(event.target).parents('.type-select').length
                        && !angular.element(event.target).hasClass('picture-select-down')
                        && $scope.selectValueOpen) {
                        $scope.selectValueOpen = false;
                    }
                    $scope.$apply();
                });

            }
        };
    });
});
