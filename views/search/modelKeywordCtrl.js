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
     * 本controller 模型 新增的模板
     *  @params:
     *      $http:  发送http 请求的service
     *      $scope: 双向绑定的媒介， 由 angular 自动实例化
     *
     *
     */
    app.controller('modelKeywordCtrl', [
        '$scope',
        '$rootScope',
        '$document',
        '$timeout',
        'searchService',
        'baseService', function ($scope, $rootScope, $document, $timeout, searchService, baseService) {
            $timeout(function () {
                $document.find('input').placeholder();
            }, 500);

            $scope.pageModelOptions = {
                pageNum: 1,
                pageSize: 5
            };

            // $rootScope.isTask 为0按照录音 1按照任务 
            // $rootScope.isTask = 1;

            if ($rootScope.isTask == '1' || $rootScope.isTask == 1) { // 任务查询版本
                $scope.isShowByTask = true;
                $scope.mark = true;
                if (!$scope.$parent.parentId) { // 根据任务查询模型（外层）
                    if ($scope.$parent.nowItem.id) {
                        $scope.id = $scope.$parent.nowItem.id;
                    }
                    else {
                        $scope.id = $scope.$parent.nowItem.voiceId;
                    }
                }
                else { // 根据流水号查询模型 内存
                    $scope.mark = false;
                    if ($scope.$parent.nowItem.voiceId) {
                        $scope.voiceId = $scope.$parent.nowItem.voiceId;
                        if ($scope.$parent.parentId) {
                            $scope.id = $scope.$parent.parentId;
                        }
                    }
                }
            }
            else { // 流水号查询
                $scope.isShowByTask = false;
                $scope.id = $scope.$parent.nowItem.id;
            }
            $scope.browser = $rootScope.getBowerserInfo();

            /**
             * @brief 获取模型关键词
             * @details [long description]
             * @return [description]
             */
            $scope.getModelKeyword = function (params) {
                if ($rootScope.isTask == '1' || $rootScope.isTask == 1) {
                    if ($scope.id && $scope.voiceId) {
                        var params = $.extend(params, {keyword: $scope.modelKeyword, id: $scope.id, voiceId: $scope.voiceId}, $scope.pageModelOptions);
                    }
                    else {
                        var params = $.extend(params, {keyword: $scope.modelKeyword, id: $scope.id}, $scope.pageModelOptions);
                    }
                }
                else {
                    var params = $.extend(params, {keyword: $scope.modelKeyword, id: $scope.id}, $scope.pageModelOptions);
                }

                searchService.getOnlineModelKeyWord(params)
                    .then(function (result) {
                        $scope.modelResult = result.value ? result.value.rows : [];
                        $scope.counts = result.value ? result.value.total : 0;
                    });
            };

            /**
             * @brief enter键搜索
             * @details [long description]
             *
             * @param  [description]
             * @return [description]
             */
            $scope.enterModelKey = function (event) {
                event = event || window.event;
                if (event.keyCode == 13) {
                    $scope.search();
                }

            };

            /**
             * @brief 搜索
             * @details [long description]
             * @return [description]
             */
            $scope.search = function () {
                if (!baseService.validWord($scope.modelKeyword)) {
                    return;
                }

                $scope.pageModelOptions.pageNum = 1;
                $scope.getModelKeyword();
            };

            $scope.getModelKeyword();
        }
    ]);
});
