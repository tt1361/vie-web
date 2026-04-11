/**
*  本文件中的directives 表格头部重命名功能
*   item: Object;  标签头部对象
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

    app.directive('tabtitle', [
        '$timeout',
        'CONSTANT',
        'dialogService', function ($timeout, CONSTANT, dialogService) {
            return {
                restrict: 'EA',
                replace: true,
                templateUrl: 'report/detail/tabTitle.htm',
                scope: {
                    item: '='
                },
                link: function (scope, element, attrs) {

                    scope.showInput = false;
                    var title;

                    scope.altD = function (event) {
                        event.preventDefault();
                        if (element.parents('.tab').hasClass('active')) {
                            event.stopPropagation();
                        }

                    };

                    // 双击修改表名
                    scope.altName = function (event) {
                        event.preventDefault();
                        if (element.parents('.tab').hasClass('active')) {
                            event.stopPropagation();
                            scope.showInput = true;
                            title = scope.item.title;
                            $timeout(function () {
                                $('.title-input').focus();
                            }, 100);
                        }

                    };

                    // 关闭弹框
                    $(window.document).click(function (event) {
                        if (!angular.element(event.target).hasClass('title-input')
                            && !angular.element(event.target).parents('.ngdialog').length
                            && scope.showInput) {
                            if (!scope.item.title) {
                                scope.item.title = title;
                                dialogService.alert('图表名称不能为空');
                                return false;
                            }
                            else {
                                if (scope.item.title.replace(/[^\x00-\xff]/g, 'xx').length > 10) {
                                    scope.item.title = title;
                                    dialogService.alert('图表名称不能超过10个字符');
                                    return false;
                                }

                                if (CONSTANT.textReplace.test(scope.item.title)) {
                                    scope.item.title = title;
                                    dialogService.alert('图表名称不能包含特殊字符');
                                    return false;
                                }
                            }
                            scope.showInput = false;
                        }

                        scope.$apply();
                    });
                }
            };
        }
    ]);
});
