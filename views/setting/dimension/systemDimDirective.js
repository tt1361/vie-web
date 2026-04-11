/**
 * 系统维度
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

    app.directive('systemDim', ['$document', '$timeout', 'ngDialog', 'dialogService', 'dimensionService', function ($document, $timeout, ngDialog, dialogService, dimensionService) {
        return {
            restrict: 'EA',
            replace: true,
            templateUrl: 'setting/dimension/system-dim-directive.htm',
            scope: {
                saveAuth: '@'
            },
            link: function ($scope, element, attrs) {
                // 引入placeholder，解决ie8兼容问题
                $document.find('input').placeholder();

                // 系统维度搜索框按enter键搜索
                $scope.enterSystemKey = function (event) {
                    event = event || window.event;
                    if (event.keyCode === 13) {
                        $scope.getSysDim();
                    }

                };

                // 获取系统维度
                $scope.getSysDim = function (type) {
                    // 关键词验证
                    if (!$scope.$parent.validKeyWord($scope.keySystemName)) {
                        return;
                    }
                    dimensionService.getSystemDimension({
                        dimensionName: $scope.keySystemName
                    })
                        .then(function (result) {
                            $scope.systenDim = result.value || [];
                            if ($scope.systenDim.length) {
                                if (angular.isUndefined(type)) {
                                    $scope.showSysDetail($scope.systenDim[0]);
                                }
                            }
                            else {
                                $scope.systenItem = '';
                            }
                        });
                };

                // 编辑系统维度
                $scope.showSysDetail = function (item) {
                    $scope.systenItem = angular.copy(item);
                    if (item.showType === 'mulSel') {
                        $scope.systenItem.typeName = '枚举';
                    }
                    else if (item.showType === 'mulEqu' || item.showType === 'range') {
                        $scope.systenItem.typeName = '输入';
                    }

                };

                // 系统维度保存按钮
                $scope.saveOrUpdateItem = function () {
                    if (!$scope.$parent.preValidName($scope.systenItem.showName)) {
                        return;
                    }
                    dimensionService.updateSystemDimension({dimensionId: $scope.systenItem.id, dimensionName: $scope.systenItem.showName})
                        .then(function (result) {
                            $scope.getSysDim(1);
                            dialogService.success(result.message);
                            $timeout(function () {
                                ngDialog.close('successDialog');
                            }, 500);
                        });
                };

                $scope.getSysDim();
            }
        };
    }]);
});
