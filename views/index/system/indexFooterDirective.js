/**
 * 系统首页底部机构
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
    app.directive('indexFooter', ['systemIndexService', function (systemIndexService) {
        return {
            restrict: 'EA',
            replace: true,
            templateUrl: 'index/system/index-footer-directive.htm',
            link: function ($scope, element, attrs) {
                // 获取当前系统时间
                $scope.selectTime = $scope.systemDate && $scope.systemDate != '${systemDate}' ?
                    $.datepicker.formatDate('yy-mm-dd', new Date($scope.systemDate)) : $.datepicker.formatDate('yy-mm-dd', new Date());
                // 机构切换选中的值是否是全部的标识，0全部， 1中心
                $scope.centerFlag = 0;
                // 机构切换选中的值的机构名称
                $scope.selectCenter = '汇总';
                // 当前用户是否是单中心标识
                $scope.singleCenter = false;

                // 获取机构信息
                $scope.getCenters = function () {
                    systemIndexService.getCenters()
                        .then(function (result) {
                            $scope.dimValueList = result.value || [];
                            if ($scope.dimValueList.length < 2) {
                                $scope.selectCenter = $scope.dimValueList[0];
                                $scope.centerFlag = 1;
                                $scope.singleCenter = true;
                            }

                            $scope.refreshDate();
                        });
                };

                // 是否展示下拉列表
                $scope.showOpen = function () {
                    $scope.isOpenFoot = !$scope.isOpenFoot;
                };

                // 切换机构
                $scope.selectFootType = function (item) {
                    if (angular.isUndefined(item)) {
                        $scope.selectCenter = '汇总';
                        $scope.centerFlag = 0;
                    }
                    else {
                        $scope.selectCenter = item;
                        $scope.centerFlag = 1;
                    }

                    $scope.showOpen();
                    $scope.refreshDate();
                };

                // 刷新系统首页数据
                $scope.refreshDate = function () {
                    $scope.$emit('refreshIndexDate', {
                        selectTime: $scope.timesRange.defaultEnd,
                        selectCenter: $scope.selectCenter,
                        centerFlag: $scope.centerFlag,
                        singleCenter: $scope.singleCenter
                    });
                };

                // 点击页面其他地方关闭弹窗
                $(window.document).click(function (event) {
                    if (!angular.element(event.target).parents('.index-foot-div').length
                        && !angular.element(event.target).hasClass('picture-select-down')
                        && $scope.isOpenFoot) {
                        $scope.isOpenFoot = false;
                    }

                    $scope.$apply();
                });

                $scope.getCenters();
            }
        };
    }]);

});
