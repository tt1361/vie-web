/**
 * 本文件实现依赖任何一个 Angular 的module, 如果不采用本系统的框架，
 *      可以可以在  factory(window.app) app 修改你所创建的模块名称
 *  @dependece: Angular Module
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
     * 本controller 模型薪资区域
     *  @params:
     *      $http:  发送http 请求的service
     *      $scope: 双向绑定的媒介， 由 angular 自动实例化
     *
     *
     */
    app.controller('multiDimensionalCtrl', [
        '$scope',
        '$document',
        '$timeout',
        'topicService',
        'CONSTANT', function ($scope, $document, $timeout, topicService, CONSTANT) {
            $timeout(function () {
                $document.find('input').placeholder();
            }, 500);

            $scope.msg = '';
            $scope.validName = angular.copy($scope.name);

            // 关闭弹出层，确定按钮点击
            $scope.submitDimension = function () {
                var data = {
                    name: $scope.name,
                    topicId: ''
                };
                if (!$scope.validPreSave()) {
                    return;
                }

                if ($scope.comFrom === 'detail') {
                    $scope.closeThisDialog(data);
                    return;
                }

                var screenings = [];

                /*石勇 新增 增加默认传值*/
                if ($scope.$parent.timesRange.defaultStart.length < 11) {
                    $scope.$parent.timesRange.defaultStart = $scope.$parent.timesRange.defaultStart + ' 00:00:00';
                    $scope.$parent.timesRange.defaultEnd = $scope.$parent.timesRange.defaultEnd + ' 23:59:59';
                }

                // 
                var screening = {
                    name: '起止时间',
                    key: 'timestamp',
                    type: 'timeRange',
                    value: [$scope.$parent.timesRange.defaultStart, $scope.$parent.timesRange.defaultEnd],
                    dataType: 'long',
                    uptonow: 0,
                    inputValue: $scope.$parent.timesRange.defaultStart + '~' + $scope.$parent.timesRange.defaultEnd,
                    timeType: $scope.$parent.timesRange.timeType ? $scope.$parent.timesRange.timeType : 2,
                    timeValue: $scope.$parent.timesRange.timeValue ? $scope.$parent.timesRange.timeValue : -7
                };
                screenings.push(screening);
                // 保存方法调用位置
                var params = {
                    topicCondition: JSON.stringify(screenings),
                    topicName: $scope.name,
                    dimesionName: ''
                };
                topicService.createTopic(params)
                    .then(function (response) {
                        if (response.status === 200 && response.data.success) {
                            data.pathId = response.data.value.pathId || 0;
                            data.topicId = response.data.value.topicId || 0;
                            data.name = $scope.name;
                            $scope.closeThisDialog(data);
                        }
                        else {
                            $scope.msg = response.data.message;
                        }

                    });
            };

            // 校验
            $scope.validPreSave = function () {
                // 校验专题名称
                if (!$scope.name || $scope.name === '') {
                    $scope.msg = '请填写专题名称';
                    return false;
                }

                if ($scope.name.replace(/[^\x00-\xff]/g, 'xx').length > 20) {
                    $scope.msg = '专题名称不能超过20个字符';
                    return false;
                }

                if (CONSTANT.textReplace.test($scope.name)) {
                    $scope.msg = '专题名称不能包含特殊字符';
                    return false;
                }

                return true;
            };

        }
    ]);

});
