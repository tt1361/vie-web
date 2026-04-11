/**
 * 本文件中的directive 实现模型详情页面结构化编辑头部的组件
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
     *  ruleEditor是新建模型左侧规则编辑指令
     *  @params:
     *      $document：angular中的document
     *      timestamp：时间戳
     *      modelService：自定义的接口服务
     *      dialogService：自定义的弹窗组件
     *      modelConstant：自定义的模块常量
     *          model：传递模型
     *          status：传递模型状态
     *          previewAuth：传递预览权限
     */
    app.directive('ruleEditor', [
        '$document',
        'timestamp',
        'modelService',
        'dialogService',
        'modelConstant', function ($document, timestamp, modelService, dialogService, modelConstant) {
            return {
                restrict: 'EA',
                replace: true,
                templateUrl: 'model/addNew/rule-editor-directive.htm',
                scope: {
                    model: '=',
                    status: '@',
                    previewAuth: '@',
                    isShowSilence: '@',
                    tagDimension: '='
                },
                link: function ($scope, element, attrs) {
                    // ie8兼容plaeholder
                    $document.find('textarea').placeholder();
                    $document.find('input').placeholder();
                    $scope.isHaveSilence = $scope.$parent.isHaveSilence;
                    // 是否显示智能助手
                    $scope.znzs = false;
                    // 是否显示查询
                    $scope.cyss = false;
                    // 是否显示条件配置
                    $scope.tjpz = false;

                    // 匹配的单词
                    $scope.pwords = '';
                    // 初始化规则编号
                    $scope.sequence = 1;
                    // 初始化规则编辑文本
                    $scope.fragmentContent = '';

                    // 初始化筛选条件
                    $scope.screenings = {
                        mentId: timestamp,
                        condition: [{
                            name: '对象1',
                            id: timestamp,
                            options: []
                        }]
                    };

                    // 处理规则编号
                    angular.forEach($scope.model.modelFragments, function (item) {
                        if ($scope.sequence <= item.fragmentNum) {
                            $scope.sequence = item.fragmentNum + 1;
                        }

                    });

                    /**
                     *  当文本框中直接输入回车
                     *  @params:
                     *      event: 事件
                     */
                    $scope.keypressAddFregment = function (event) {
                        if (event.keyCode === 13) {
                            $scope.addFregment();
                            event.preventDefault();
                        }

                    };

                    /**
                     *  保存一个片段
                     *  @params: None
                     */
                    $scope.addFregment = function () {
                        // 勾选顺序模式时，规则片段不可超过5个
                        if ($scope.model.choose && $scope.model.modelFragments.length >= 5) {
                            dialogService.alert('顺序模式下，规则片段不可超过5个');
                            return;
                        }

                        var frm = $('.edit-content-rule textarea').val();
                        if (!frm || frm === '') {
                            return;
                        }

                        if (/[^\&\|\(\)\!\（\）\#+a-z0-9\u4e00-\u9fa5]/igm.test(frm)) {
                            dialogService.alert(modelConstant.MODEL_FTAMENT_VALID);
                            return;
                        }

                        var fragmentContent = frm.replace(/\（/g, '\(').replace(/\）/g, '\)');
                        // 石勇 新增 输入规则验证限制为5个词
                        // var regex = new RegExp("#", 'g'); // 使用g表示整个字符串都要匹配
                        // var fcResult = fragmentContent.match(regex);
                        // var fcCount = !fcResult ? 0 : fcResult.length;
                        // if(fcCount>4){
                        //     dialogService.alert("#逻辑近运算最多支持5个关键词!");
                        //    return;
                        // }
                        // 
                        modelService.addFregment({
                            previewId: $scope.model.previewId,
                            fragmentContent: fragmentContent,
                            ruleType: 1,
                            fragmentNum: $scope.sequence,
                            channel: '2',
                            remark: '',
                            isTag: 0,
                            tagContent: '',
                            tagText: ''
                        }).then(function (response) {
                            if (response.status === 200 && response.data.success) {
                                // 保存成功的时候， 保存该模型片段
                                var fragment = angular.copy(response.config.data);
                                fragment.fragmentId = response.data.value;
                                delete fragment.previewId;
                                $scope.model.modelFragments.push(fragment);
                                $scope.isShow = false;
                                $scope.sequence = $scope.sequence + 1;
                                // 清空文本框中的内容
                                $scope.fragmentContent = '';
                            }
                            else {
                                dialogService.error(response.data.message);
                            }
                        });
                    };

                    /**
                     *  点击智能助手
                     *  @params: None
                     */
                    $scope.showZnzs = function () {
                        $scope.znzs = !$scope.znzs;
                        $scope.cyss = false;
                        $scope.tjpz = false;
                    };

                    /**
                     *  点击查询
                     *  @params: None
                     */
                    $scope.showCyss = function () {
                        $scope.cyss = !$scope.cyss;
                        $scope.znzs = false;
                        $scope.tjpz = false;
                    };

                    /**
                     *  点击条件配置
                     *  @params: None
                     */
                    $scope.showTjpz = function () {
                        $scope.tjpz = !$scope.tjpz;
                        $scope.znzs = false;
                        $scope.cyss = false;
                    };

                    /**
                      *  预处理静音规则
                      *  @params: None
                      */
                    $scope.preOperateSilenceContent = function () {
                        var screenings = [];
                        // 组合展示规则与tagContent
                        $.each($scope.$parent.silenceScreen.condition, function (sky, screen) {
                            var condition = {};
                            condition.dimensionCode = screen.dimensionCode;
                            condition.id = screen.id;
                            condition.value = [];
                            $.each(screen.options, function (key, option) {
                                var copition = {
                                    propertyCode: option.propertyCode,
                                    relativeobject: option.isDepend === 1 ? option.relativeobject : '',
                                    operationCode: option.flag === 0 ? option.operationCode : option.equOperationCode,
                                    value: option.flag === 0 ? option.inputValue : option.operationCode
                                };
                                condition.value.push(copition);
                            });
                            screenings.push(condition);
                        });
                        $scope.model.silenceText = '';
                        $scope.model.silenceRule = JSON.stringify(screenings);
                        if ($scope.$parent.silenceScreen.condition.length) {
                            var tagText = angular.copy($scope.$parent.silenceScreen);
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
                            $scope.model.silenceText = JSON.stringify(tagText);
                        }

                        return true;
                    };

                    /**
                     *  导出模型规则
                     *  @params: None
                     */
                    $scope.exportModelFramnet = function () {
                        if (!$scope.validFrament()) {
                            return;
                        }

                        var modelFragments = [];
                        angular.forEach($scope.model.modelFragments, function (item) {
                            var value = {};
                            value.remark = typeof item.remark === 'undefined' ? '' : item.remark;
                            value.fragmentContent = item.fragmentContent;
                            value.fragmentNum = item.fragmentNum;
                            value.channel = item.channel;
                            value.condRule = item.isTag === 0 ? '' : item.tagText;
                            modelFragments.push(value);
                        });

                        $scope.preOperateSilenceContent();
                        $('#silenceText').val($scope.model.silenceText);
                        $('#modelFragments').val(JSON.stringify(modelFragments));
                        $('#form_export_model').attr('action', modelService.exportRule()).submit();
                    };

                    /**
                     *  导出前的规则验证
                     *  @params: None
                     */
                    $scope.validFrament = function () {
                        if ($scope.$parent.silenceScreen.condition.length === 0) {
                            if ($scope.model.pageType === 0 && !$scope.model.modelFragmentRelation.fragmentContent) {
                                dialogService.alert(modelConstant.MODEL_FTAMENT_EMPTY);
                                return false;
                            }

                            if (!$scope.model.modelFragments.length) {
                                dialogService.alert(modelConstant.MODEL_EXPORT_EMPTY);
                                return false;
                            }
                        }

                        if ($scope.$parent.silenceScreen.condition.length > 0) {
                            // if($scope.model.pageType === 0 && $scope.model.modelFragmentRelation.fragmentContent === ""){
                            //     return true;
                            // }
                            if ($scope.model.pageType === 0 && !$scope.model.modelFragmentRelation.fragmentContent && $scope.model.modelFragments.length) {
                                dialogService.alert(modelConstant.MODEL_FTAMENT_EMPTY);
                                return false;
                            }

                            // if(!$scope.model.modelFragments.length){
                            //     dialogService.alert(modelConstant.MODEL_EXPORT_EMPTY);
                            //     return false;
                            // }
                            return true;
                        }

                        return true;
                    };

                    /**
                     *  初始化导入按钮
                     *  @params: None
                     */
                    $('#file_upload').uploadify({
                        height: 40,
                        width: 40,
                        buttonText: '',
                        swf: 'framework/uploadify/uploadify.swf?var='+(new Date()).getTime(),
                        uploader: '/VIEWEB/model/uploadFile',
                        auto: true,
                        multi: false,
                        removeCompleted: true,
                        fileObjName: 'uploadify',
                        cancelImg: 'images/uploadify-cancel.png',
                        fileTypeDesc: '请选择 .xlsx文件', // 允许上传的文件类型的描述，在弹出的文件选择框里会显示 fileTypeExts: '*.jpg',//允许上传的文件类型，限制弹出文件选择框里能选择的文件
                        fileTypeExts: '*.xlsx', // 允许上传的文件类型，限制弹出文件选择框里能选择的文件
                        checkExisting: false,
                        removeTimeout: 0.1,
                        // 加上此句会重写onSelectError方法【需要重写的事件】
                        overrideEvents: ['onSelectError', 'onDialogClose'],
                        onUploadSuccess: function (file, data, response) {
                            $scope.model.choose = 0;
                            data = eval('(' + data + ')');
                            if (data.success) {
                                // 导入后的操作
                                // 石勇 新增
                                var scope = $scope;
                                while (angular.isUndefined(scope.removeAllPrewViewFrag)) {
                                    scope = scope.$parent;
                                }
                                if (scope.previewFrags.length) {
                                    scope.removeAllPrewViewFrag();
                                }

                                //
                                $scope.importRule();
                            }
                            else {
                                dialogService.alert(data.message);
                            }
                        },

                        // 返回一个错误，选择文件的时候触发
                        onSelectError: function (file, errorCode, errorMsg) {
                            console.log(errorMsg);
                        },
                        onUploadStart: function(){
                            console.log('开始上传')
                        },
                        onUploadError: function(errorCode,errorMsg){
                            console.log('上传失败:'+errorCode+','+errorMsg);
                        },
                        onUploadComplete: function (file) {
                            console.log('上传完毕')
                        },
                        onFallback: function(){
                            console.log('不支持flash')
                        }


                    });

                    /**
                     *  导入文件后的操作
                     *  @params: None
                     */
                    $scope.importRule = function () {
                        modelService.importRule()
                            .then(function (result) {
                                $scope.model.modelFragments = result.value.modelFragments;
                                angular.forEach($scope.model.modelFragments, function (item) {
                                    item.isTag = item.condRule.length > 0 ? 1 : 0;
                                    item.tagText = item.condRule || '';
                                    item.ruleType = 1;
                                    if ($scope.sequence <= item.fragmentNum) {
                                        $scope.sequence = item.fragmentNum + 1;
                                    }

                                    if (!item.tagText) {
                                        item.tagContent = '';
                                        return;
                                    }

                                    var comment = eval('(' + item.tagText + ')');
                                    var screening = $scope.combileContent(comment);
                                    item.tagContent = JSON.stringify(screening);
                                });
                                $scope.model.modelFragmentRelation.fragmentContent = result.value.fragmentContent;
                                if (result.value.silenceSuccess) {
                                    $scope.silenceScreen = result.value.silenceText ? eval('(' + result.value.silenceText + ')') : $scope.$parent.silenceScreen;
                                    $scope.$emit('importRule', $scope.silenceScreen);
                                }
                                else {
                                    dialogService.alert(result.value.silenceErrorReason);
                                }
                                return;
                            });
                    };

                    /**
                     *  组合展示规则与tagContent
                     *  @params:
                     *      comment: 导入的组合规则
                     */
                    $scope.combileContent = function (comment) {
                        $scope.screenings = angular.copy(comment);
                        var screening = [];
                        // 组合展示规则与tagContent
                        $.each($scope.screenings.condition, function (sky, screen) {
                            var condition = {};
                            condition.dimensionCode = screen.dimensionCode;
                            condition.id = screen.id;
                            condition.value = [];
                            $.each(screen.options, function (key, option) {
                                var copition = {
                                    propertyCode: option.propertyCode,
                                    relativeobject: option.isDepend === 1 ? option.relativeobject : '',
                                    operationCode: option.operationCode,
                                    value: option.flag === 0 ? option.inputValue : ''
                                };
                                condition.value.push(copition);
                            });
                            screening.push(condition);
                        });

                        return screening;
                    };

                    // 点击页面其他地方关闭弹窗
                    $(window.document).click(function (event) {
                        if (!angular.element(event.target).parents('.znzs-new-wrap').length
                            && !angular.element(event.target).hasClass('picture-znzs')
                            && $scope.znzs) {
                            $scope.znzs = false;
                        }

                        if (!angular.element(event.target).parents('.cyss-new-wrap').length
                            && !angular.element(event.target).hasClass('picture-global')
                            && $scope.cyss) {
                            $scope.cyss = false;
                        }

                        if (!angular.element(event.target).parents('.tjpz-outer-wrap').length
                            && !angular.element(event.target).hasClass('picture-condition')
                            && $scope.tjpz) {
                            $scope.tjpz = false;
                        }

                        $scope.$apply();
                    });
                    $scope.preOperateSilenceContent();
                }
            };
        }]);
});
