/**
 * 本文件中的Controller 实现添加模型页面的 控制器逻辑
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
    app.controller('gdModelDetailCtrl', [
        '$scope',
        '$http',
        '$document',
        '$state',
        '$timeout',
        'dialogService',
        'gdModelService',
        'CONSTANT', function ($scope, $http, $document, $state, $timeout, dialogService, gdModelService, CONSTANT) {
            $timeout(function () {
                $document.find('input').placeholder();
            }, 500);

            // 用于接收所有模型组
            $scope.modelGroup = [];

            $scope.msg = '';
            $scope.groupMsg = '';

            $scope.modelFragments = [];

            $scope.uid = Math.floor(Math.random() * 1000) + 1000;

            // 模型对象
            $scope.model = {
                modelId: -1,
                pageType: 0,
                modelFragmentRelation: '',
                modelTextFragment: '',
                modelGroupId: -1,
                // modelGroupId: $scope.$parent.model && $scope.$parent.model.modelGroupId ? $scope.$parent.model.modelGroupId:0,
                modelAccuracy: 0,
                channel: 2,
                previewId: -1,
                modelName: $scope.$parent.model && $scope.$parent.model.modelName ? $scope.$parent.model.modelName : '',
                modelComment: $scope.$parent.model && $scope.$parent.model.modelComment && $scope.$parent.model.modelComment != 'undefined' ? $scope.$parent.model.modelComment : ''
            };

            // 获取所有模型组
            // gdModelService.allModelGroups().then(function(result){
            //     $scope.modelGroup = result.data.value || [];
            //     if(!$scope.modelGroup.length) return;
            //     if($scope.$parent.modelGroupId){
            //         $scope.model.modelGroupId = $scope.$parent.modelGroupId;
            //         $scope.groupName = $scope.$parent.groupListName;
            //     }else{
            //         $scope.model.modelGroupId = $scope.model.modelGroupId?$scope.model.modelGroupId:$scope.modelGroup[0].groupId;
            //     }
            //     if($scope.groupListName === '全部'){
            //         $scope.groupName = $scope.modelGroup[0].groupName;
            //     }
            //     $scope.groupName = $scope.groupName?$scope.groupName:$scope.modelGroup[0].groupName;
            //     gdModelService.searchModelGroup({
            //         modelGroupName: ''
            //     }).then(function(result){
            //         $scope.modelGroup  = result.value ? result.value[0].children : [];
            //         if($scope.groupListName === '全部'){
            //             $scope.groupName = $scope.modelGroup.length ? $scope.modelGroup[0].text : "";
            //             $scope.model.modelGroupId = $scope.modelGroup.length ? $scope.modelGroup[0].id : -1;
            //         }
            //     });
            // });

            $scope.open = false;
            // 点击展开与收起
            $scope.showOpen = function () {
                $scope.open = !$scope.open;
            };

            $scope.selectType = function (item) {
                $scope.model.modelGroupId = item.id;
                $scope.groupName = item.text;
                $scope.showOpen();
            };

            // 确定
            $scope.addModel = function () {
                if (!$scope.validModel()) {
                    return;
                }

                // 调用是否重名接口
                gdModelService.checkModelName({
                    modelName: $scope.model.modelName,
                    modelGroupId: -1,
                    modelId: $scope.modelType ? -1 : $scope.$parent.model.modelId
                }).then(function (response) {
                    if (response.status === 200 && response.data.success) { // 新模型
                        if (!$scope.modelType) {
                            var result = {
                                name: $scope.model.modelName,
                                group: -1,
                                remark: $scope.model.modelComment,
                                groupName: $scope.groupName
                            };
                            $scope.closeThisDialog(result);
                            return;
                        }

                        $state.go('main.gdModel.add', {group: -1, name: $scope.model.modelName, remark: $scope.model.modelComment, id: -1}, {
                            reload: true
                        });
                    }
                    else {
                        $scope.msg = response.data.message;
                        $('#modelName').focus();
                        return;
                    }
                });
            };

            // 预处理
            $scope.validModel = function () {
                $scope.msg = '';
                $scope.groupMsg = '';
                if (!$scope.model.modelName) {
                    $scope.msg = '模型名称为空';
                    $('#modelName').focus();
                    return false;
                }

                if ($scope.model.modelName.replace(/[^\x00-\xff]/g, 'xx').length > 100) {
                    $scope.msg = '模型名称超过100个字符';
                    $('#modelName').focus();
                    return false;
                }

                if (CONSTANT.textReplace.test($scope.model.modelName)) {
                    $scope.msg = '模型名称包含特殊字符';
                    $('#modelName').focus();
                    return false;
                }

                // if(!$scope.model.modelGroupId){
                //     $scope.groupMsg = "请选择所属模型组";
                //     return false;
                // }

                return true;
            };

            // if clicked outside of calendar
            $document.on('click', function (e) {
                var icon = angular.element('.model-call');
                if (!icon.hasClass('active')) {
                    return;
                }

                var i = 0;
                var ele;

                if (!e.target) {
                    return;
                }

                for (ele = e.target; ele; ele = ele.parentNode) {
                    // var nodeName = angular.lowercase(element.nodeName)
                    if (angular.lowercase(ele.nodeName) === 'new-group' || ele.nodeType === 9) {
                        break;
                    }

                    var uid = $scope.$eval(ele.getAttribute('uid'));
                    if (!!uid && uid === $scope.uid) {
                        return;
                    }

                }

                $scope.showOpen();
                $scope.$apply();
            });

        }
    ]);
});
