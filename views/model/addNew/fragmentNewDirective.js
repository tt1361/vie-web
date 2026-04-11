/**
 * 本文件中的directive 实现模型详情页面结构化编辑规则列表的组件
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

    app.directive('fragmentNew', [
        '$timeout',
        '$document',
        'ngDialog',
        'dialogService', function ($timeout, $document, ngDialog, dialogService) {
            return {
                restrict: 'EA',
                replace: true,
                templateUrl: 'model/addNew/fragment-new-directive.htm',
                scope: {
                    item: '=',
                    index: '@',
                    pwords: '=',
                    status: '@',
                    previewAuth: '@'
                },
                link: function ($scope, element, attrs) {
                    if (Number($scope.item.channel) === 0) {
                        $scope.channelName = '坐席';
                    }
                    else if (Number($scope.item.channel) === 1) {
                        $scope.channelName = '客户';
                    }
                    else {
                        $scope.channelName = '全部';
                    }

                    if ($scope.item.tagVersion) {
                        $scope.item.fragmentContent = $scope.item.tagVersion;
                    }

                    // 是否可编辑
                    $scope.isEdit = false;

                    $scope.uid = Math.floor(Math.random() * 1000) + 1000;
                    // 切换编辑
                    $scope.changeEdit = function () {
                        // event = event || window.event;
                        if ($scope.item.isTag === 0) { // 片段编辑
                            if ($scope.isEdit) {
                                var fragmentContent = $.trim(element.find('.qucickEdit-inner-wrap').text());
                                if (!$scope.validFragment()) {
                                    return;
                                }

                                $scope.item.fragmentContent = fragmentContent;
                            }

                            $scope.isEdit = !$scope.isEdit;
                        }
                        else { // 条件
                            $scope.$parent.$parent.tjpz = true;
                            $scope.$parent.$parent.screenings = eval('(' + $scope.item.tagText + ')');
                        }
                    };
                    // 验证规则
                    $scope.validFragment = function () {
                        var fragmentContent = $.trim(element.find('.qucickEdit-inner-wrap').text());
                        if (!fragmentContent) {
                            dialogService.error('模型片段规则不能为空');
                            $timeout(function () {
                                ngDialog.closeAll();
                                $('#quickEdit_' + $scope.item.fragmentId).focus();
                            }, 500);
                            return false;
                        }

                        fragmentContent = fragmentContent.replace(/\（/g, '\(').replace(/\）/g, '\)');
                        if (/[^\,\:\&\|\(\)\!\#+a-z0-9\u4e00-\u9fa5]/igm.test(fragmentContent)) {
                            dialogService.error('运算规则有误，请检查后重新输入');
                            $timeout(function () {
                                ngDialog.closeAll();
                                $('#quickEdit_' + $scope.item.fragmentId).focus();
                            }, 500);
                            return false;
                        }

                        return true;
                    };
                    // 片段预览
                    $scope.previewFragment = function () {
                        if ($scope.item.isTag === 0
                            && $scope.isEdit
                            && !$scope.validFragment()) {
                            return;
                        }

                        if (!$scope.item.fragmentContent) {
                            dialogService.alert('模型片段规则不能为空');
                            return;
                        }

                        if (/[^\,\:\&\|\(\)\!\#+a-z0-9\u4e00-\u9fa5]/igm.test($scope.item.fragmentContent)) {
                            dialogService.alert('运算规则有误，请检查后重新输入');
                            return;
                        }

                        // 模型规则输入限制为5个词
                        // var fragmentContent = $scope.item.fragmentContent.replace(/\（/g,'\(').replace(/\）/g,'\)');
                        // var regex = new RegExp("#", 'g'); // 使用g表示整个字符串都要匹配
                        // var fcResult = fragmentContent.match(regex);
                        // var fcCount = !fcResult ? 0 : fcResult.length;
                        // if(fcCount>4){
                        //     dialogService.alert("#逻辑近运算最多支持5个关键词!");
                        //    return;
                        // }
                        // 
                        var scope = $scope;
                        while (angular.isUndefined(scope.fragmentPreview)) {
                            scope = scope.$parent;
                        }
                        scope.fragmentPreview($scope.item.fragmentId);
                    };

                    // 删除一个片段
                    $scope.removeFragment = function () {
                        dialogService.confirm('是否删除该条规则？', '是', '否').then(function () {
                            $scope.$parent.$parent.model.modelFragments.splice($scope.index, 1);
                            if (!$scope.$parent.$parent.model.modelFragments.length) {
                                $scope.$parent.$parent.isShow = true;
                            }

                            var scope = $scope;
                            while (angular.isUndefined(scope.removePrewViewFrag)) {
                                scope = scope.$parent;
                            }
                            if (scope.previewFrags.length) {
                                scope.removePrewViewFrag($scope.item);
                            }

                        });
                    };

                    $scope.viewEdit = function () {
                        $scope.isEdit = !$scope.isEdit;
                    };

                    // if clicked outside of calendar
                    $document.on('click', function (e) {
                        if (!$scope.isEdit) {
                            return;
                        }

                        var i = 0,
                            ele;

                        if (!e.target) {
                            return;
                        }

                        for (ele = e.target; ele; ele = ele.parentNode) {
                            // var nodeName = angular.lowercase(element.nodeName)
                            if (angular.lowercase(ele.nodeName) === 'model-new-group' || ele.nodeType === 9) {
                                break;
                            }

                            var uid = $scope.$eval(ele.getAttribute('uid'));
                            if (!!uid && uid === $scope.uid || angular.lowercase(ele.className) === 'picture picture-del') {
                                return;
                            }

                        }

                        $scope.changeEdit();
                        $scope.$apply();
                    });

                    // 编辑备注
                    $scope.editRemark = function () {
                        ngDialog.open({
                            template: 'model/addNew/fragment-remark-directive.htm',
                            controller: 'fragmentRemarkCtrl',
                            scope: $scope,
                            showClose: false,
                            closeByDocument: true,
                            disableAnimation: true,
                            className: 'ngdialog-theme-default ngdialog-mark-dialog'
                        });

                    };

                    // 更换声道
                    $scope.changeChannel = function (channel) {
                        $scope.item.channel = channel;
                        if (Number($scope.item.channel) === 0) {
                            $scope.channelName = '坐席';
                        }
                        else if (Number($scope.item.channel) === 1) {
                            $scope.channelName = '客户';
                        }
                        else {
                            $scope.channelName = '全部';
                        }
                    };

                    $scope.$on('$destroy', function () {
                        ngDialog.closeAll();
                        $scope.isEdit = false;

                    });

                }
            };
        }]);

});
