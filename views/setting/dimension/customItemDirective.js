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

    app.directive('customItem', function () {
        return {
            restrict: 'EA',
            replace: true,
            templateUrl: 'setting/dimension/custom-item-directive.htm',
            scope: {
                item: '='
            },
            link: function ($scope, element, attrs) {
                // 颜色分类
                $scope.colors = ['#0689e3', '#06c5b9', '#5add00', '#ffcd00', '#ffa700', '#ff2200', '#d71e81', '#9d3497'];
                // 新增枚举列
                $scope.addItemValue = function () {
                    var length = $scope.item.dimensionValues.length % 8;
                    $scope.item.dimensionValues.push({
                        dimensionName: '',
                        dimensionColor: $scope.colors[length],
                        showIndex: length
                    });
                };

                // 脱拽
                $scope.strop = function (obj, evt) {
                    $('.enum-item-list').each(function (index, item) {
                        var lIndex = angular.copy($scope.item.dimensionValues[index].showIndex);
                        $scope.item.dimensionValues[index] = eval('(' + $(item).find('ul').attr('drag-data') + ')');
                        $scope.item.dimensionValues[index].showIndex = lIndex;
                    });
                };

            }
        };
    });
});
