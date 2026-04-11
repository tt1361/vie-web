/**
 *  本 directive 实现常用报表的单独一个报表项的相关指令
 * @params
 *      @item: Object; 报表的单独一项， 双向通信，建议不要修改该对象
 *      @updateItem: Function; 当移除事件发生的时候， 由子向父的单向通信，
 *      @status: Integer; 由父到子的单向通信
 *          0: 非编辑状态，
 *          1：编辑状态
 *
 *   本directive 实现功能如下，
 *      1、用 item 对象渲染 directive， 实现报表的展示
 *      2、由 status 决定是否显示删除标识
 *      3、当用户点击删除标识的时候，调用 updateItem 方法通知父controller 对应的 报表项
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

    app.directive('favitem', function () {
        return {
            restrict: 'EA',
            replace: true,
            templateUrl: 'report/favorite/favrItem-directive.htm',
            scope: {
                item: '=',
                update: '&',
                delAuth: '@'
            },
            link: function (scope, element, attrs) {
                scope.remove = function () {
                    scope.update(scope.item);
                };
            }
        };

    }
    );
});
