/**
 * 本文件中的directive 实现模型详情页面结构化编辑搜索的组件
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

    /**
     *  条件搜索指令
     *  @params:
     *     $document: angular中的document
     *         pwords: 传递的父级搜索关键字
     *         update: 传递的父级函数
     */
    app.directive('cyssNew', ['$document', 'dialogService', 'CONSTANT', function ($document, dialogService, CONSTANT) {
        return {
            restrict: 'EA',
            replace: true,
            templateUrl: 'model/addNew/cyss-new-directive.htm',
            scope: {
                pwords: '=',
                update: '&'
            },
            link: function ($scope, element, attrs) {
                // ie8兼容placeholder
                $document.find('input').placeholder();

                /**
                 * 搜索框监听Enter键
                 * @params:
                 *     event: 事件
                 */
                $scope.enterKey = function (event) {
                    event = event || window.event;
                    if (event.keyCode == 13) {
                        $scope.searchCyss();
                    }

                };

                /**
                 * 搜索按钮
                 * @params: None
                 */
                $scope.searchCyss = function () {
                    if (CONSTANT.textReplace.test($scope.searchWord)) {
                        dialogService.alert('搜索字段不能包含特殊字符');
                        return false;
                    }

                    $scope.pwords = $scope.searchWord;
                    $scope.update();
                };
            }
        };
    }]);
});
