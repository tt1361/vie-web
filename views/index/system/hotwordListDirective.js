/**
 * 系统首页热词分析列表
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
    app.directive('hotwordList', function () {
        return {
            restrict: 'EA',
            replace: true,
            templateUrl: 'index/system/hotword-list-directive.htm',
            transclude: true,
            scope: {
                item: '=',
                index: '@',
                isSametime: '='
            },
            link: function (scope, element, attrs) {
                // 获取排序历史数据
                scope.rankShow = function (keyword) {
                    scope.$emit('rankShow', {keyword: keyword, index: scope.index});
                };

                // 删除
                scope.delVocabulary = function (keyword) {
                    scope.$emit('delVocabulary', {
                        keyword: keyword
                    });
                };
            }
        };
    });

});
