/**
 * 自定义专题-路径维度中编辑维度指令
 * @author
 * @time
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
    *  本文件中的directives  删除的功能
    *   item: Object;  待删除的对象
    *   update: 当删除确认时候， 调用父controller进行数据更新
    *
    */
    app.directive('dimensionItem', ['$rootScope', 'ngDialog', '$timeout', 'dialogService', function ($rootScope, ngDialog, $timeout, dialogService) {
        return {
            restrict: 'EA',
            replace: true,
            templateUrl: 'analysis/detail/dimension/dimension-item-directive.htm',
            scope: {
                item: '=',
                pathId: '='
            },
            link: function (scope, element, attrs) {
                // 设置维度值
                scope.setDimensionValue = function () {
                    if (!scope.$parent.path) {
                        dialogService.error('全局路径下，维度选择不可用，请切换路径！');
                        $timeout(function () {
                            ngDialog.close('errorDialog');
                        }, 3000);
                        return;
                    }

                    ngDialog.open({
                        template: 'analysis/detail/dimension/dimension-popup-directive.htm',
                        controller: 'dimensionPopupCtrl',
                        scope: scope,
                        showClose: false,
                        closeByEscape: false,
                        closeByDocument: false,
                        disableAnimation: true,
                        className: 'ngdialog-theme-default ngdialog-theme-model newDimension'
                    }).closePromise.then(function (dialog) {
                        // 当弹出层关闭后，自动更新 维度对象
                        if (angular.isUndefined(dialog.value) || dialog.value == '$document') {
                            return;
                        }

                        var $scope = scope;
                        while (angular.isUndefined($scope.newDimensions)) {
                            $scope = $scope.$parent;
                        }
                        var index = $rootScope.myInArray($scope.newDimensions, 'key', dialog.value.key);
                        if (index > -1) { // 存在
                            $scope.newDimensions[index].inputValue = dialog.value.inputValue;
                        }
                        else {
                            $scope.newDimensions.push(dialog.value);
                        }
                        // 从全部维度中删除
                        var sysIndex = $rootScope.myInArray($scope.pathDims, 'key', dialog.value.key);
                        if (sysIndex > -1) {
                            $scope.pathDims.splice(sysIndex, 1);
                        }

                        // 计算高度
                        $scope.autoDimHeight();
                    });
                };
            }
        };
    }]);

});
