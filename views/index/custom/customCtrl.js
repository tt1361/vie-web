/**
 * 本文件实现依赖任何一个 Angular 的module, 如果不采用本系统的框架，
 *      可以可以在  factory(window.app) app 修改你所创建的模块名称
 *  @dependece: Angular Module
 *
 */
(function (factory) {
    if (typeof define === 'function' && !!define.amd) {
        define([
            'app',
            'echarts'
        ], factory);
    }
    else {
        factory(window.app);
    }
})(function (app) {

    /**
     * 本controller 实现首页的逻辑
     *  @params:
     *      $http:  发送http 请求的service
     *      $scope: 双向绑定的媒介， 由 angular 自动实例化
     */
    app.controller('customCtrl', [
        '$scope',
        '$stateParams',
        'winHeightService',
        'dialogService',
        'customIndexService', function ($scope, $stateParams, winHeightService, dialogService, customIndexService) {

            $scope.indexId = $stateParams.id;
            $scope.customs = [];
            $scope.pageInfo = {};
            $scope.isOpen = false;
            $scope.allShow = false;

            /**
             *获取自定义首页依赖模块
             *
             */
            $scope.getCustom = function () {
                customIndexService.queryPageRelateModuleList({
                    pageId: $scope.indexId
                })
                    .then(function (result) {
                        $scope.customs = result.value ? result.value.moduleList || [] : [];
                        $scope.pageInfo = result.value ? result.value.pageInfo || '' : '';
                        if ($scope.customs && $scope.customs.length > 0) {
                            $scope.allShow = true;
                        }

                    });
            };

            /**
             *获取时间文本
             *
             */
            $scope.getTimeText = function (type, value) {
                var time = {};
                if (type === 1) { // 自己选择的时间
                    time.timeText = '';
                }
                else if (type === 2) { // 相对时间
                    time.timeText = '过去' + (-value) + '天';
                    time.start = $scope.systemDate && $scope.systemDate != '${systemDate}' ? $.datepicker.formatDate('yy-mm-dd', new Date(new Date($scope.systemDate).getTime() + (value + 1) * 24 * 3600 * 1000)) : $.datepicker.formatDate('yy-mm-dd', new Date(new Date().getTime() + (value + 1) * 24 * 3600 * 1000));
                    time.end = $scope.systemDate && $scope.systemDate != '${systemDate}' ? $scope.systemDate : $.datepicker.formatDate('yy-mm-dd', new Date());
                }
                else { // 绝对时间
                    time.timeText = '自定义时间';
                }

                return time;
            };

            /**
             *编辑菜单是否展示
            */
            $scope.editMenu = function () {
                $scope.isOpen = !$scope.isOpen;
            };

            $scope.winHeight = function () {
                // 初始化调用
                winHeightService.calculate();
                // 浏览器窗口大小改变
                angular.element(window).resize(function () {
                    winHeightService.calculate();
                });
            };

            /**
             *判断数组中是否存在某个维度/指标/计算项
            */
            $scope.myInArray = function (array, key1, key, type) {
                var index = -1;
                for (var i = 0; i < array.length; i++) {
                    var item = array[i];
                    if (type) {
                        if (item[key1] === key && item.type === type) {
                            index = i;
                            break;
                        }
                    }
                    else {
                        if (item[key1] === key) {
                            index = i;
                            break;
                        }
                    }

                }
                return index;
            };

            /**
             *删除模块
            */
            $scope.$on('delPageMudle', function (event, data) {
                dialogService.confirm('确认要从该概览中删除该模块吗？').then(function () {
                    customIndexService.deletePageRelateModule({
                        id: data.id
                    })
                        .then(function (result) {
                            $scope.customs.splice(data.index, 1);
                            if (!$scope.customs.length) {
                                $scope.allShow = false;
                            }

                        });
                });

            });

            /**
             *点击其他地方关闭
            */
            $(window.document).click(function (event) {
                if (!angular.element(event.target).parents('.menu-dialog-position').length
                    && !angular.element(event.target).hasClass('picture-custom-edit')
                    && $scope.isOpen) {
                    $scope.isOpen = false;
                }

                $scope.$apply();
            });

            $scope.$on('colResizable', function (ngRepeatFinishedEvent) {
                $scope.winHeight();
            });

            $scope.getCustom();
            $scope.winHeight();
        }
    ]);
});
