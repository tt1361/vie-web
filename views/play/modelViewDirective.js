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
     *  本 directive 是右侧模型
     *
     *
     */
    app.directive('modelView', ['playItemService',
        '$document', '$timeout', function (playItemService, $document, $timeout) {
            return {
                restrict: 'EA',
                replace: true,
                templateUrl: 'play/model-view-directive.htm',
                scope: {
                    callId: '=',
                    voiceId: '=',
                    c:'=',
                    isLoad: '@',
                    type: '@'
                },
                link: function ($scope) {
                    $document.find('input').placeholder();
                    // 获取模型列表
                    $scope.fetchAudioKeyWord = function () {
                        playItemService.fetchAudioKeyWord({taskId: $scope.callId, voiceId: $scope.voiceId, isLoad: $scope.isLoad,dataSource:$scope.c})
                            .then(function (result) {
                                $scope.models = result.value.rows || [];
                                $scope.keywords = $scope.models.length ? $scope.models[0].ruleInfo : [];
                                $scope.counts = result.value.totalSize || 0;

                                $scope.defaultModels = angular.copy($scope.models); // 过滤存储
                                var selectItem;
                                if ($scope.models.length) {
                                    selectItem = $scope.models[0];
                                    $scope.chooseKeyword(selectItem);
                                }

                                $scope.spliceModelName();
                                $scope.$emit('afterModel', {
                                    models: $scope.models
                                });

                            });
                    };

                    // 截取显示模型
                    $scope.spliceModelName = function () {
                        if ($scope.models.length > 5) {
                            $scope.viewModels = $scope.models.slice(0, 5);
                        }
                        else {
                            $scope.viewModels = $scope.models;
                        }
                    };

                    // 搜索框监听Enter键
                    $scope.enterKey = function (event) {
                        event = event || window.event;
                        if (event.keyCode == 13) {
                            $scope.search();
                        }

                    };
                    // 模型是否展示
                    $scope.showModelOpen = function () {
                        $scope.modelOpen = !$scope.modelOpen;
                        if ($scope.modelOpen) {
                            $scope.viewModels = $scope.models;
                        }
                        else {
                            $scope.spliceModelName();
                        }
                        $document.find('.model-view-outer-list').css('height', Math.ceil(($scope.viewModels.length) / 5) * 50 + 'px');
                    };

                    // 搜索模型
                    $scope.search = function () {
                        if (!$scope.test($scope.keyword)) {
                            return;
                        }

                        var searchModels = [];
                        $scope.models = angular.copy($scope.defaultModels);
                        angular.forEach($scope.models, function (item) {
                            if (item.ruleName.indexOf($scope.keyword) > -1) {
                                searchModels.push(item);
                            }

                        });
                        if ($scope.keyword) {
                            $scope.models = searchModels;
                        }
                        else {
                            $scope.models = angular.copy($scope.defaultModels);
                        }

                        $scope.keywords = $scope.models.length ? $scope.models[0].ruleInfo : [];
                        if ($scope.modelOpen) {
                            $scope.viewModels = $scope.models;
                        }
                        else {
                            $scope.spliceModelName();
                        }
                        $document.find('.model-view-outer-list').css('height', Math.ceil(($scope.viewModels.length) / 5) * 50 + 'px');
                    };

                    // 检验字段规范
                    $scope.test = function (name) {
                        if (name) {
                            if (name.replace(/[^\x00-\xff]/g, 'xx').length > 100) {
                                $scope.$emit('listenMsg', {
                                    msg: '搜索字段不能超过100个字符'
                                });
                                return false;
                            }

                            if (playItemService.textReplace.test(name)) {
                                $scope.$emit('listenMsg', {
                                    msg: '搜索字段不能包含特殊字符'
                                });
                                return false;
                            }
                        }

                        return true;
                    };

                    // 区间测听
                    $scope.listen = function (item) {
                        $scope.$emit('listenPlay', {
                            item: item
                        });
                    };

                    // 获取关键词
                    $scope.chooseKeyword = function (item) {
                        $scope.keywords = item.ruleInfo;
                    };

                    $timeout(function () {
                        $scope.$watch('voiceId', function (newValue, oldValue) {
                            if (!newValue) {
                                return;
                            }
                            // if($scope.c != "vie-flynull") return; 免登陆分模型查看注释
                            $scope.fetchAudioKeyWord();
                        });
                    }, 500);
                }
            };
        }]);

});
