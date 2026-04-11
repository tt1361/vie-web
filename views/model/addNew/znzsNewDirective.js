/**
 * 本文件中的directive 实现模型详情页面结构化编辑智能助手的组件
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
     *  znzsNew 智能助手指令
     *  @params:
     *     $timeout: 定时器
     *     $document: angular中的document
     *     baseService: 自定义基础服务
     *     modelService: 自定义接口服务
     */
    app.directive('znzsNew', [
        '$timeout',
        '$document',
        'baseService',
        'modelService', function ($timeout, $document, baseService, modelService) {
            return {
                restrict: 'EA',
                replace: true,
                templateUrl: 'model/addNew/znzs-new-directive.htm',
                link: function ($scope, element, attrs) {
                    // ie8兼容placeholder
                    $timeout(function () {
                        $document.find('input').placeholder();
                    }, 500);
                    // 获取光标位置
                    var _mOffset = angular.element('.textarea-inner')[0];
                    var write_position = baseService.getOffsetPointer(_mOffset);

                    /**
                     *  点击关键词插入
                     *  @params:
                     *      name: 关键词名称
                     */
                    $scope.inputSearch = function (name) {
                        write_position = baseService.getOffsetPointer(_mOffset);
                        if (write_position === -1) {
                            $scope.fragmentContent += name;
                        }
                        else {
                            $scope.fragmentContent = $scope.fragmentContent.substring(0, write_position) + name + $scope.fragmentContent.substring(write_position, $scope.fragmentContent.length);
                        }
                    };

                    /**
                     * 搜索框监听Enter键
                     * @params:
                     *    event: 事件
                     */
                    $scope.enterKey = function (event) {
                        event = event || window.event;
                        if (event.keyCode == 13) {
                            $scope.searchZnzs();
                        }

                    };

                    /**
                     * 智能助手查询
                     * @params: None
                     */
                    $scope.searchZnzs = function () {
                        modelService.association({
                            word: $scope.word
                        })
                            .then(function (result) {
                                $scope.associations = result.value || [];
                            });
                    };
                }
            };
        }
    ]);
});
