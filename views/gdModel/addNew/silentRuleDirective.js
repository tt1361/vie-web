/**
 * 本文件中的directive 实现模型详情页面静音规则的组件
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

    app.directive('silentRule', [
        '$timeout',
        '$document', function ($timeout, $document) {
            return {
                restrict: 'EA',
                replace: true,
                templateUrl: 'model/addNew/silent-rule-directive.htm',
                scope: {
                    condition: '=',
                    tagDimension: '=',
                    status: '@'
                },
                link: function ($scope, element, attrs) {
                    var num = 0;
                    angular.forEach($scope.condition, function (item) {
                        var itemNum = item.name.substring(2);
                        if (Number(itemNum) > num) {
                            num = Number(itemNum);
                        }

                    });
                    // 添加条件
                    $scope.addCondition = function () {
                        var num = 0;
                        angular.forEach($scope.condition, function (item) {
                            var itemNum = item.name.substring(2);
                            if (Number(itemNum) > num) {
                                num = Number(itemNum);
                            }

                        });
                        num++;
                        var data = {
                            name: '对象' + num,
                            id: new Date().getTime() + '',
                            options: []
                        };
                        $scope.condition.push(data);
                    };
                }
            };
        }]);

});
