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
     *  znzsImple 智能助手指令，运维用
     *  @params:
     *     $timeout: 定时器
     *     $document: angular中的document
     *     baseService: 自定义基础服务
     *     modelService: 自定义接口服务
     */
    app.directive('znzsImple', ['$timeout', '$document', 'baseService', 'modelService', function ($timeout, $document, baseService, modelService) {
        return {
            restrict: 'EA',
            replace: true,
            templateUrl: 'model/addNew/znzs-imple-directive.htm',
            link: function ($scope, element, attrs) {
                // ie8兼容placeholder
                $timeout(function () {
                    $document.find('input').placeholder();
                }, 500);
                // 0表示同义词，1表示相关词，2表示词切分
                $scope.znzsTab = 1;
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
                        $scope.$parent.fragmentContent += name;
                    }
                    else {
                        $scope.$parent.fragmentContent = $scope.$parent.fragmentContent.substring(0, write_position) + name + $scope.$parent.fragmentContent.substring(write_position, $scope.$parent.fragmentContent.length);
                    }
                };

                /**
                *  切换tab
                *  @params:
                *      type: 0表示同义词，1表示相关词，2表示词切分
                */
                $scope.changeZnzsTab = function (type) {
                    $scope.znzsTab = type;
                };

                /**
                *  查询同义词
                *  @params: None
                */
                $scope.searchSynZnzs = function () {
                    if (!baseService.validWord($scope.word)) {
                        return;
                    }

                    modelService.analogy({
                        words: $scope.word
                    })
                        .then(function (result) {
                            $scope.synonymWords = result.value ? result.value.dataMap : [];
                        });
                };

                /**
                *  查询词切分
                *  @params: None
                */
                $scope.searchImpleZnzs = function () {
                    if (!baseService.validWord($scope.word)) {
                        return;
                    }

                    modelService.getSplitWord({
                        word: $scope.word
                    })
                        .then(function (result) {
                            $scope.impleSplitWords = result.value ? result.value.splitValue : [];
                            $scope.impleWordValues = result.value ? result.value.wordValue : [];
                        });
                };

                /**
                 *  查询相关词
                 *  @params: None
                 */
                $scope.searchZnzs = function () {
                    if (!baseService.validWord($scope.word)) {
                        return;
                    }

                    modelService.associationImple({
                        word: $scope.word
                    })
                        .then(function () {
                            $scope.associations = result.value ? result.value.dataMap : [];
                        });
                };

                /**
                 * 搜索框监听Enter键
                 *  @params:
                 *      event: 事件
                 */
                $scope.enterKey = function (event) {
                    event = event || window.event;
                    if (event.keyCode == 13) {
                        $scope.searchZnzsBtn();
                    }

                };

                /**
                 *  搜索按钮
                 */
                $scope.searchZnzsBtn = function () {
                    if ($scope.znzsTab === 0) { // 同义词
                        $scope.searchSynZnzs();
                    }

                    if ($scope.znzsTab === 1) { // 相近词
                        $scope.searchZnzs();
                    }

                    if ($scope.znzsTab === 2) { // 词切分
                        $scope.searchImpleZnzs();
                    }

                };
            }
        };
    }
    ]);
});
