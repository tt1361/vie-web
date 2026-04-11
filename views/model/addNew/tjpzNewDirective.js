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
     *  条件配置指令
     *  @params:
     *      $document: angular中的document
     *      $timeout: 定时器
     *      dialogService: 自定义弹窗组件
     *      modelService: 自定义接口服务
     *      timestamp: 时间戳
     *      silenceService: 规则验证与组合服务
     *          condition: 传递条件
     *          tagDimension: 传递标签
     *          update: 传递函数
     */
    app.directive('tjpzNew', [
        '$document',
        '$timeout',
        'dialogService',
        'modelService',
        'timestamp',
        'silenceService', function ($document, $timeout, dialogService, modelService, timestamp, silenceService) {
            return {
                restrict: 'EA',
                replace: true,
                templateUrl: 'model/addNew/tjpz-New-directive.htm',
                scope: {
                    condition: '=',
                    tagDimension: '=',
                    update: '&'
                },
                link: function ($scope, element, attrs) {
                    // ie8兼容placeholder
                    $document.find('input').placeholder();
                    // 初始化编号
                    var num = 1;

                    /**
                     * 添加条件
                     * @params: None
                     */
                    $scope.addCondition = function () {
                        num++;
                        var data = {
                            name: '对象' + num,
                            id: timestamp,
                            options: []
                        };
                        $scope.condition.push(data);
                        $timeout(function () {
                            var height = angular.element('.tjpz-new-content-wrap').height();
                            if (height >= 300) {
                                angular.element('.tjpz-new-content-wrap').addClass('scroll');
                            }
                            else {
                                angular.element('.tjpz-new-content-wrap').removeClass('scroll');
                            }
                        }, 500);
                    };

                    /**
                     * @details 生成条件
                     * @return [description]
                     */
                    $scope.birthScreen = function () {
                        var screening = [];
                        var fragment = '';
                        if (!$scope.condition.length) {
                            dialogService.alert('未选择对象');
                            isErroe = true;
                            return;
                        }

                        var isErroe = silenceService.combinationRule($scope.condition, 'ci');

                        if (!isErroe) {
                            // 组合展示规则与tagContent
                            $.each($scope.condition, function (sky, screen) {
                                var condition = {};
                                condition.dimensionCode = screen.dimensionCode;
                                condition.id = screen.id;
                                condition.value = [];
                                fragment += screen.name + ':' + screen.dimensionName + '(';
                                $.each(screen.options, function (key, option) {
                                    var copition = {
                                        propertyCode: option.propertyCode,
                                        relativeobject: option.isDepend === 1 ? option.relativeobject : '',
                                        operationCode: option.operationCode,
                                        value: option.flag === 0 ? option.inputValue : ''
                                    };
                                    condition.value.push(copition);
                                    fragment += option.propertyName;

                                    if (option.isDepend === 1) {
                                        fragment += ',' + option.reletionName;
                                    }

                                    if (option.flag === 1) {
                                        fragment += ',等于';
                                    }

                                    fragment += ',' + option.operationName;

                                    if (option.flag === 0) {
                                        fragment += ',' + option.inputValue;
                                    }

                                    if (key != screen.options.length - 1) {
                                        fragment += '&';
                                    }

                                });
                                fragment += ')';
                                if (sky != $scope.condition.length - 1) {
                                    fragment += '|';
                                }

                                screening.push(condition);
                            });

                            var tagText = angular.copy($scope.$parent.screenings);
                            angular.forEach(tagText.condition, function (condition) {
                                try {
                                    delete condition.isShow;
                                }
                                catch (e) {}
                                angular.forEach(condition.options, function (option) {
                                    try {
                                        delete option.isPropertyShow;
                                        delete option.isDependShow;
                                        delete option.isEquShow;
                                        delete option.isOperationShow;
                                    }
                                    catch (e) {}
                                });
                            });
                            var exitsTab = false;
                            angular.forEach($scope.$parent.model.modelFragments, function (ment) {
                                if (ment.isTag === 1) {
                                    var comment = eval('(' + ment.tagText + ')');
                                    if (comment.mentId === tagText.mentId) { // 更新对象
                                        ment.tagContent = JSON.stringify(screening);
                                        ment.fragmentContent = fragment;
                                        ment.tagText = JSON.stringify(tagText);
                                        exitsTab = true;
                                        $scope.$parent.screenings = {
                                            mentId: Math.floor(Math.random() * 1000) + 1000,
                                            condition: [{
                                                name: '对象1',
                                                id: timestamp,
                                                options: []
                                            }]
                                        };

                                        num = 1;
                                        $scope.update();
                                        return;
                                    }
                                }

                            });

                            if (!exitsTab) {
                                modelService.addFregment({
                                    previewId: $scope.$parent.model.previewId,
                                    fragmentContent: fragment,
                                    ruleType: 1,
                                    fragmentNum: $scope.$parent.sequence,
                                    channel: '2',
                                    remark: '',
                                    isTag: 1,
                                    tagContent: JSON.stringify(screening),
                                    tagText: JSON.stringify(tagText)
                                }).then(function (response) {
                                    // 保存成功的时候， 保存该模型片段
                                    var fragment = angular.copy(response.config.data);
                                    fragment.fragmentId = response.data.value;
                                    delete fragment.previewId;
                                    $scope.$parent.model.modelFragments.push(fragment);
                                    $scope.isShow = false;
                                    $scope.$parent.sequence = $scope.$parent.sequence + 1;
                                    // 清空文本框中的内容
                                    $scope.$parent.screenings = {
                                        mentId: timestamp,
                                        condition: [{
                                            name: '对象1',
                                            id: timestamp,
                                            options: []
                                        }]
                                    };
                                    num = 1;
                                    $scope.update();
                                });
                            }
                        }

                    };
                }
            };
        }
    ]);
});
