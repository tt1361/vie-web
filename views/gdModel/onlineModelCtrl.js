/**
 * 本文件中的Controller 实现模型上线页面的 控制器逻辑
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
    app.controller('onlinegdModelCtrl', [
        '$scope',
        'ngDialog',
        '$timeout',
        '$document',
        'dialogService',
        'gdModelService',
        '$http',
        'CONSTANT',
        '$rootScope',
        'dimensionService',
        // 石勇 20170522 交行530版本需求开发
        // '$http',
        // 'CONSTANT',
        // 'dimensionService',
        // 
        function ($scope, ngDialog, $timeout, $document, dialogService, gdModelService, $http, CONSTANT, $rootScope, dimensionService) {

            $scope.isPass = 0; // 是否推送0不推送，1推送，默认不推送
            // 
            // 石勇 新增
            // 条件接收参数
            $scope.preDimensions = [];
            $scope.chooseItem = [];
            $scope.timesRange = {};
            if ($rootScope.startTime || $rootScope.endTime) {
                $scope.timesRange.defaultStart = $rootScope.startTime;
                $scope.timesRange.defaultEnd = $rootScope.endTime;
            }
            else {
                $scope.timesRange = {
                    defaultStart: $scope.systemDate && $scope.systemDate != '${systemDate}' ? $.datepicker.formatDate('yy-mm-dd', new Date(new Date($scope.systemDate).getTime() - 6 * 24 * 3600 * 1000)) : $.datepicker.formatDate('yy-mm-dd', new Date(new Date().getTime() - 6 * 24 * 3600 * 1000)),
                    defaultEnd: $scope.systemDate && $scope.systemDate != '${systemDate}' ? $scope.systemDate : $.datepicker.formatDate('yy-mm-dd', new Date()),
                    isToNow: false
                };
            }
            // 获取该模型保存的筛选器id
            $scope.a = {};
            if ($scope.onlineType === 'add') {
                $scope.showPrompt = false;
                $scope.modelOnlineId = $scope.$parent.model.modelId;
                gdModelService.getModel($scope.$parent.model.modelId).then(function (result) {
                    // 转化模型数据
                    $scope.modelFilterId = result.value.filterId;
                    $scope.a.id = $scope.modelFilterId;
                });
            }
            else {
                $scope.showPrompt = true;
                $scope.modelOnlineId = $scope.$parent.onlineModel.modelId;
                gdModelService.getModel($scope.$parent.onlineModel.modelId).then(function (result) {
                    // 转化模型数据
                    $scope.modelFilterId = result.value.filterId;
                    $scope.a.id = $scope.modelFilterId;
                });
            }
            // 
            // 
            // 
            $scope.screening = [];
            // $scope.timesRange = {
            //     defaultStart: $scope.systemDate&&$scope.systemDate!='${systemDate}'?$scope.systemDate:$.datepicker.formatDate('yy-mm-dd', new Date()),
            //     defaultEnd: 'uptonow',
            //     isToNow: true,
            //     runToNow: true
            // };
            $scope.time = angular.copy($scope.timesRange.defaultStart);
            var now = $scope.systemDate && $scope.systemDate != '${systemDate}' ? $scope.systemDate : $.datepicker.formatDate('yy-mm-dd', new Date());
            $timeout(function () {
                $document.find('input').placeholder();
                $('#online-time').datepicker({
                    dayNamesMin: ['日', '一', '二', '三', '四', '五', '六'],
                    monthNames: ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'],
                    showMonthAfterYear: true,
                    dateFormat: 'yy-mm-dd',
                    yearSuffix: '年',
                    maxDate: now,
                    onSelect: function (dateText, ins) {
                        $scope.time = dateText;
                        $scope.timesRange.defaultStart = $scope.time;
                    }
                });
            }, 5);

            // 是否推送
            $scope.setPass = function () {
                $scope.isPass = 1 - $scope.isPass;
                if ($scope.isPass === 1) {
                    $scope.timesRange.isToNow = true;
                    $scope.timesRange.runToNow = true;
                }

            };

            // 上线，只有单个上线
            // $scope.online = function() {
            //     var params = {condition: JSON.stringify($scope.screening), isPass: $scope.isPass};
            //     if($scope.onlineType === 'add'){
            //         params = $.extend(params, {modelId: $scope.$parent.model.modelId,modelName:$scope.$parent.model.modelName});
            //     }else{
            //         params = $.extend(params, {modelId: $scope.$parent.onlineModel.modelId,modelName:$scope.$parent.onlineModel.modelName});
            //     }
            //     modelService.onlineModel(params)
            //         .then(function(response){
            //             if(response.status === 200 && response.data.success){
            //                 dialogService.success("模型提交成功！");
            //                 if($scope.onlineType === 'add'){
            //                     $timeout(function(){
            //                         window.location.href="#/model/"+$scope.$parent.model.modelGroupId+"/list";
            //                     },3000);
            //                 }else{
            //                     $timeout(function(){
            //                         ngDialog.close("successDialog");
            //                     },1000);
            //                     $scope.closeThisDialog(1);
            //                 }
            //             }else{
            //                 dialogService.error("模型提交失败");
            //                 $timeout(function(){
            //                     ngDialog.close("errorDialog");
            //                 },1000);
            //                 return;
            //             }
            //     });
            // }
            // 上线，只有单个上线
            $scope.online = function () {
                // 广播获取筛选条件
                // $scope.$broadcast("get-filter",{});
                // console.log($scope.b);
                // return;
                var params = {};
                if ($scope.$parent.topicId) {
                    params = $.extend(params, {condition: JSON.stringify($scope.condition), isPass: $scope.isPass});
                }
                else {
                    params = $.extend(params, {condition: JSON.stringify($scope.condition), isPass: $scope.isPass});
                }
                // console.log(params)
                // if($scope.onlineType === 'add'){
                //     params = $.extend(params, {modelId: $scope.model.modelFragmentRelation.modelId});
                // }else{
                //     params = $.extend(params, {modelId: $scope.$parent.onlineModelId});
                // }
                if ($scope.onlineType === 'add') {
                    params = $.extend(params, {modelId: $scope.$parent.model.modelId, modelName: $scope.$parent.model.modelName});
                }
                else {
                    params = $.extend(params, {modelId: $scope.$parent.onlineModel.modelId, modelName: $scope.$parent.onlineModel.modelName});
                }
                params = $.extend(params, {
                    filterRuleId: $scope.a.id
                });
                // params = [params];
                // console.log(params);
                gdModelService.onlineModel(params)
                    .then(function (response) {
                        if (response.status === 200 && response.data.success) {
                            dialogService.alertTo('模型提交成功！').then(function () {
                                if ($scope.onlineType === 'add') {
                                    // $timeout(function(){
                                    window.location.href = '#/gdModel/-1/list';
                                // },1000);
                                }
                                else {
                                    $timeout(function () {
                                        ngDialog.close('successDialog');
                                    }, 1000);
                                    $scope.closeThisDialog(1);
                                }
                            });
                        }
                        else {
                            dialogService.error(response.data.message);
                            $timeout(function () {
                                ngDialog.close('errorDialog');
                            }, 1000);
                            return;
                        }
                    });

            };

            // //确定按钮
            // $scope.submitDimension = function() {
            //     var screening = {
            //         name: '时间',
            //         key: 'timestamp',
            //         type: 'timeRange',
            //         value: [$scope.timesRange.defaultStart, $scope.timesRange.defaultEnd],
            //         dataType: 'long',
            //         uptonow: $scope.timesRange.runToNow ? 1 : 0
            //     };

            //     if($scope.timesRange.runToNow){
            //         screening.value = [$scope.timesRange.defaultStart, ""];
            //     }
            //     $scope.screening.push(screening);
            //     $scope.online();
            // }

            // 
            // 
            // 
            // 石勇 新增
            // 获取是否禁用的值,进行是否开启遮罩层的判断
            $scope.onOpen = false;
            $('#disabledDiv').removeClass('ng-hide');
            $scope.$on('get-onOpen', function (e, d) {
                if (d == 1) {
                    $scope.onOpen = false;
                }
                else {
                    $scope.onOpen = true;
                    $('#disabledDiv').removeClass('ng-hide');
                }
            });
            // 获取维度列表
            $scope.searchDimensions = [];
            $scope.$on('get-dim', function (e, d) {
                $scope.allDimensions = d;
                angular.forEach(d, function (item) {
                    item.checked = false;
                    $scope.searchDimensions.push(item);
                });
            });

            /**
            * 搜索框监听Enter键
            *
            */
            $scope.enterKey = function (event) {
                event = event || window.event;
                if (event.keyCode == 13) {
                    $scope.searchDim();
                }

            };
            $scope.condition = [];
            // 校验搜索关键词规范
            $scope.validKeyWord = function (keyword) {
                if (keyword) {
                    if (keyword.replace(/[^\x00-\xff]/g, 'xx').length > 20) {
                        dialogService.alert('搜索字段不能超过20个字符');
                        return false;
                    }

                    if (CONSTANT.textReplace.test(keyword)) {
                        dialogService.alert('搜索字段不能包含特殊字符');
                        return false;
                    }
                }

                return true;
            };
            // 模糊查询
            $scope.searchDim = function () {
                if (!$scope.validKeyWord($scope.keyword)) {
                    return;
                }

                if ($scope.keyword) {
                    $scope.dimensions = [];
                    angular.forEach($scope.allDimensions, function (dim) {
                        if (dim.name.indexOf($scope.keyword) > -1) {
                            $scope.dimensions.push(dim);
                        }

                    });
                    $scope.searchDimensions = $scope.dimensions;
                }
                else {
                    $scope.searchDimensions = $scope.allDimensions;
                }
                // 导入维度检测是否有已经选中的维度
                angular.forEach($scope.dimensions, function (item) {
                    angular.forEach($scope.$parent.selectDim, function (dimension) {
                        if (item.dimensionId === dimension.dimensionId) {
                            item.checked = true;
                            item.dimensionValue = dimension.dimensionValue;
                        }

                    });
                });
                angular.forEach($scope.dimensions, function (item) {
                    if (!item.checked) {
                        $scope.allChecked = false;
                    }

                });
            };
            // 用于接受被选中的维度信息集合
            $scope.checkedThis = function (item) {
                if (item.isGet) {
                    $scope.chooseItem.push(item);
                }
                else {
                    $.each($scope.chooseItem, function (key, value) {
                        if (value.key === item.key) {
                            $scope.chooseItem.splice(key, 1);
                        }

                    });
                }
            };
            // 
            // 
            // 
            $scope.pushedDimension = function (dim) {
                previewIsNull = true;
                dim.checked = !(dim.checked);
                var i = 0;
                var mark = true;
                if ($scope.preDimensions.length > 0) {
                    angular.forEach($scope.preDimensions, function (item) {
                        if (item.name === dim.name) {
                            i++;
                        }

                    });
                }
                else {
                    $scope.preDimensions.push({
                        name: dim.name,
                        type: dim.type,
                        value: dim.value,
                        chooseValue: '',
                        // defaultValue:dim.defaultValue,
                        // checked:dim.checked,
                        key: dim.key,
                        dataType: dim.dataType
                        // durationFlag:dim.durationFlag,
                        // analysis:dim.analysis

                    });
                    mark = false;
                }
                if (i > 0) {
                    if (dim.checked) {
                        return;
                    }
                    else {
                        var preDim = [];
                        angular.forEach($scope.preDimensions, function (item) {
                            if (item.inputValue) {
                                if (item.name !== dim.name) {
                                    preDim.push({
                                        name: item.name,
                                        type: item.type,
                                        value: item.value,
                                        chooseValue: item.chooseValue,
                                        // defaultValue:item.defaultValue,
                                        // checked:item.checked,
                                        key: item.key,
                                        dataType: item.dataType,
                                        inputValue: item.inputValue
                                        // durationFlag:item.durationFlag,
                                        // analysis:item.analysis
                                    });
                                }
                            }
                            else {
                                if (item.name !== dim.name) {
                                    preDim.push({
                                        name: item.name,
                                        type: item.type,
                                        value: item.value,
                                        chooseValue: item.chooseValue,
                                        // defaultValue:item.defaultValue,
                                        // checked:item.checked,
                                        key: item.key,
                                        dataType: item.dataType
                                        // durationFlag:item.durationFlag,
                                        // analysis:item.analysis
                                    });
                                }
                            }
                        });
                        $scope.preDimensions = preDim;
                    }
                }
                else {
                    if (dim.checked && mark) {
                        $scope.preDimensions.push({
                            name: dim.name,
                            type: dim.type,
                            value: dim.value,
                            chooseValue: '',
                            // defaultValue:dim.defaultValue,
                            // checked:dim.checked,
                            key: dim.key,
                            dataType: dim.dataType
                            // durationFlag:dim.durationFlag,
                            // analysis:dim.analysis
                        }
                        );
                    }
                }
            };
            // 
            $scope.$on('excludeChanged', function (e, d) {
                var ex = [];
                angular.forEach($scope.preDimensions, function (item) {
                    if (item.name == d.name) {
                        item.exclude = d.exc;
                    }
                    else {
                        item.exclude = false;
                    }
                    ex.push(item);
                });
                $scope.preDimensions = ex;
            });
            // 
            var previewIsNull = false;
            $scope.$on('previewIsNull', function (e, d) {
                if ($scope.preDimensions.length > 0) {
                    angular.forEach($scope.preDimensions, function (f) {
                        if (!f.inputValue || f.inputValue === '' || f.inputValue === null) {
                            previewIsNull = true;
                            return;
                        }

                    });
                }

            });
            $scope.hideTipsNone = function () {
                $('.tips-none').css('display', 'none');
            };
            // 点击表格日期
            $scope.changeDate = function (item) {
                $scope.timesRange.defaultStart = item;
            };
            // 确定按钮
            $scope.submitDimension = function () {
                var countInputValue = 0;
                angular.forEach($scope.preDimensions, function (e) {
                    if (e.inputValue) {
                        countInputValue++;
                    }

                });
                // 判断是否每一个维度都有inputValue，如果都有 previewIsNull =false；
                if (countInputValue == $scope.preDimensions.length) {
                    previewIsNull = false;
                }

                if (previewIsNull) {
                    $('.tips-none').css('display', 'block');
                    $scope.$broadcast('tell', '');
                    return;
                }

                var uptonow = 0;
                if (!$scope.timesRange.defaultStart) {
                    dialogService.alert('开始时间不能为空');
                    return;
                }

                if (!$scope.timesRange.defaultEnd) {
                    dialogService.alert('结束时间与一直运行必须二选一');
                    return;
                }

                if ($scope.timesRange.isToNow) {
                    uptonow = 1;
                }
                else if (Number($scope.timesRange.defaultStart.replace(/-/g, '')) >
                    Number($scope.timesRange.defaultEnd.replace(/-/g, ''))) {
                    dialogService.alert('开始时间不能大于结束时间');
                    return;
                }

                if ($scope.timesRange.defaultStart > $scope.timesRange.defaultEnd) {
                    dialogService.alert('开始时间不能大于结束时间，请重新选择开始时间！');
                    return;
                }

                var isError = false;
                $.each($scope.chooseItem, function (key, item) {
                    if (!item.inputValue) {
                        dialogService.alert(item.name + '未选择');
                        isError = true;
                        return;
                    }

                    if (item.type === 'mulEqu' || item.type === 'range' || item.type === 'timeRange') {
                        angular.forEach(item.defaultValue, function (def) {
                            if (!def.data || def.data === '') {
                                dialogService.alert(item.name + '存在项未输入值');
                                isError = true;
                                return;
                            }

                        });
                    }

                    if (!isError) {
                        try {
                            if (item.value.length) {
                                delete item.defaultValue;
                                delete item.checked;
                                delete item.$$hashKey;
                                delete item.isGet;
                                $scope.item.push(JSON.stringify(item));
                            }

                        }
                        catch (e) {}
                    }

                });

                if (!isError) {
                    var condition = {
                        name: '时间',
                        key: 'timestamp',
                        type: 'timeRange',
                        value: [$scope.timesRange.defaultStart, $scope.timesRange.defaultEnd],
                        dataType: 'long',
                        uptonow: uptonow
                    };

                    if (!previewIsNull) {
                        angular.forEach($scope.preDimensions, function (e) {
                            delete e.defaultValue;
                            delete e.checked;
                            delete e.$$hashKey;
                            if (e.inputValue) {
                                delete e.inputValue;
                            }

                            if (e.chooseValue) {
                                e.value = e.chooseValue;
                                delete e.chooseValue;
                            }

                            $scope.condition.push(e);
                        });
                    }

                    previewIsNull = false;

                    if ($scope.timesRange.isToNow) {
                        condition.value = [$scope.timesRange.defaultStart, ''];
                    }

                    // $scope.condition = angular.copy($scope.chooseItem);

                    // angular.forEach($scope.condition, function(item) {
                    //     if (typeof item.inputValue != "undefined") {
                    //         if (item.inputValue) {
                    //             item.value = item.inputValue.replace(/\!\(/g, "").replace(/\)/g,"").split(",");
                    //         }
                    //         try {
                    //             delete item.inputValue;
                    //         } catch (e) {}
                    //     }
                    // });

                    if (condition.value.length) {
                        $scope.condition.push(condition);
                    }

                    $rootScope.cd = $scope.condition;
                    $scope.$emit('chooseDem', $scope.condition);
                    $scope.online();
                }

            };
            // 
            // 
            // 新增结束
            // 
            // 

        }
        // 石勇 下方directive中的所有内容全部都是新增的
    ]).directive('dimensionModel', ['$document', '$http', '$q', 'dialogService', 'CONSTANT', function ($document, $http, $q, dialogService, CONSTANT) {
        return {
            restrict: 'EA',
            replace: true,
            templateUrl: 'analysis/detail/dimension-value-directive.htm',
            scope: {
                item: '=',
                type: '@',
                index: '@'
            },
            link: function (scope, element, attrs) {
                scope.item.exclude = false;
                var excludeType = angular.copy(scope.item.exclude);
                // uncodeuid;
                scope.uid = Math.floor(Math.random() * 1000) + 1000;

                scope.defaultValue = [];
                // 默认全选为true
                scope.allchecked = true;
                if (!scope.item.defaultValue || !scope.item.defaultValue.length) {
                    if (scope.item.type === 'mulSel' || scope.item.type === 'model' || scope.item.type === 'radio') {
                        angular.forEach(scope.item.value, function (item) {
                            scope.defaultValue.push({
                                checked: false,
                                data: item,
                                type: scope.item.type,
                                isSelect: false
                            });
                        });
                    }
                    else {
                        var value = {
                            checked: false,
                            data: '',
                            type: scope.item.type,
                            isSelect: false
                        };
                        if (scope.item.type === 'range' || scope.item.type === 'timeRange') {
                            value.data = {
                                up: '',
                                low: ''
                            };
                        }

                        if (scope.item.type === 'mulEqu') {
                            value.data = '';
                        }

                        scope.defaultValue.push(value);
                    }
                    scope.item.defaultValue = scope.defaultValue;
                }

                angular.forEach(scope.item.defaultValue, function (item) {
                    if (!item.checked) {
                        scope.allchecked = false;
                        return;
                    }

                });
                var showDefaultValue = angular.copy(scope.item.defaultValue); // 中转参数接收

                // 下拉列表显示
                scope.showValues = function () {
                    var icon = element.find('.culum-value-wrap');

                    if (icon.hasClass('active')) {
                        icon.removeClass('active');
                        element.find('i.picture-select-down').removeClass('active');
                    }
                    else {
                        icon.addClass('active');
                        element.find('i.picture-select-down').addClass('active');
                    }
                    element.siblings().find('i.picture-select-down').removeClass('active');
                    element.siblings().find('.culum-value-wrap').removeClass('active');
                    // 重新赋值
                    scope.item.defaultValue = angular.copy(showDefaultValue);
                    scope.item.exclude = angular.copy(excludeType);
                };

                // if clicked outside of calendar
                $document.on('click', function (e) {
                    var icon = element.find('.culum-value-wrap');
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
                        if (angular.lowercase(ele.nodeName) === 'dimension-value' || ele.nodeType === 9) {
                            break;
                        }

                        var uid = scope.$eval(ele.getAttribute('uid'));
                        if (!!uid && uid === scope.uid) {
                            return;
                        }

                    }

                    scope.showValues();
                    scope.$apply();
                });

                // 全选/全不选
                scope.toggleAllChecked = function () {
                    scope.allchecked = !scope.allchecked;
                    angular.forEach(scope.item.defaultValue, function (item) {
                        item.checked = scope.allchecked;
                    });
                };

                // 单选检验
                scope.checkedThis = function (item) {
                    if (!item.checked) {
                        scope.allchecked = false;
                        return;
                    }

                    var allchecked = true;
                    $.each(scope.item.defaultValue, function (key, item) {
                        if (!item.checked) {
                            allchecked = false;
                            return;
                        }

                    });

                    scope.allchecked = allchecked;
                };

                // 获取搜有单选按钮的值
                scope.checkedRadio = function (item) {
                    scope.selectValue = item.data;
                    scope.radioItem = [];
                    scope.radioItem.push(item.data);
                    angular.forEach(scope.item.defaultValue, function (item) {
                        item.isSelect = item.data === scope.selectValue;
                    });
                };

                // 获取全部复选框选中的值
                scope.getAllMulSelItem = function () {
                    scope.mulSelItem = [];
                    angular.forEach(scope.item.defaultValue, function (item) {
                        if (item.checked) {
                            scope.mulSelItem.push(item.data);
                        }

                    });
                };

                // 获取所有输入框的值
                scope.getAllMulEquItem = function () {
                    scope.mulEquItem = [];
                    angular.forEach(scope.item.defaultValue, function (item) {
                        if (!item.data) {
                            scope.isNull = true;
                            return $q.reject(false);
                        }

                        if (CONSTANT.textReplace.test(item.data) && !item.data.low) {
                            scope.isValid = true;
                            return $q.reject(false);
                        }

                        scope.mulEquItem.push(item.data);
                    });
                };

                // 获取所有区间输入框的值
                scope.getAllRangeItem = function () {
                    scope.rangeItem = [];
                    angular.forEach(scope.item.defaultValue, function (item) {
                        if (!item.data || !item.data.low || !item.data.up) {
                            scope.isNull = true;
                            return $q.reject(false);
                        }

                        if (!/^(0|[1-9][0-9]*)$/.test(item.data.low) || !/^(0|[1-9][0-9]*)$/.test(item.data.up)) {
                            scope.match = false;
                            return;
                        }

                        if (Number(item.data.low) > Number(item.data.up)) {
                            scope.isBig = true;
                            return;
                        }

                        scope.rangeItem.push(item.data.low + '~' + item.data.up);
                    });
                };

                // 新增
                scope.addNew = function () {
                    var addItem = {
                        data: '',
                        type: scope.item.type
                    };
                    scope.item.defaultValue.push(addItem);
                };

                // 删除
                scope.remove = function (index, event) {
                    try {
                        event.stopPropagation();
                    }
                    catch (e) {}
                    scope.item.defaultValue.splice(index, 1);
                };

                // 清空，还原默认
                scope.removeAll = function () {
                    try {
                        event.stopPropagation();
                    }
                    catch (e) {}
                    scope.item.defaultValue = [];
                };

                // 点击每个下拉列表的确定按钮获取编辑的值
                scope.chooseDimension = function () {
                    scope.chooseItem = [];
                    scope.isBig = false;
                    scope.isNull = false;
                    scope.isValid = false;
                    scope.match = true;
                    if (scope.item.type === 'mulSel' || scope.item.type === 'model') {
                        scope.getAllMulSelItem();
                        scope.chooseItem = scope.mulSelItem;
                        if (!scope.chooseItem.length) {
                            dialogService.alert('您还未选择任何值');
                            scope.item.inputValue = '';
                            showDefaultValue = angular.copy(scope.item.defaultValue);
                            excludeType = angular.copy(scope.item.exclude);
                            return;
                        }
                    }

                    if (scope.item.type === 'mulEqu') {
                        scope.getAllMulEquItem();
                        scope.chooseItem = scope.mulEquItem;
                        if (scope.isNull) {
                            dialogService.alert('存在未输入值的项');
                            scope.item.inputValue = '';
                            showDefaultValue = angular.copy(scope.item.defaultValue);
                            excludeType = angular.copy(scope.item.exclude);
                            return;
                        }
                        if (scope.isValid) {
                            dialogService.alert('存在输入格式不正确的项，不能输入特殊字符');
                            scope.item.inputValue = '';
                            showDefaultValue = angular.copy(scope.item.defaultValue);
                            excludeType = angular.copy(scope.item.exclude);
                            return;
                        }

                        if (!scope.chooseItem.length) {
                            dialogService.alert('您还未输入任何值');
                            scope.item.inputValue = '';
                            showDefaultValue = angular.copy(scope.item.defaultValue);
                            excludeType = angular.copy(scope.item.exclude);
                            return;
                        }
                    }

                    if (scope.item.type === 'radio' || scope.item.type === 'timeRadio') {
                        scope.chooseItem = scope.radioItem || [];
                        if (!scope.chooseItem.length) {
                            dialogService.alert('您还未选择任何值');
                            scope.item.inputValue = '';
                            showDefaultValue = angular.copy(scope.item.defaultValue);
                            excludeType = angular.copy(scope.item.exclude);
                            return;
                        }
                    }

                    if (scope.item.type === 'range' || scope.item.type === 'timeRange') {
                        scope.getAllRangeItem();
                        scope.chooseItem = scope.rangeItem;

                        if (scope.isNull) {
                            dialogService.alert('存在未输入值的项');
                            scope.item.inputValue = '';
                            showDefaultValue = angular.copy(scope.item.defaultValue);
                            excludeType = angular.copy(scope.item.exclude);
                            return;
                        }

                        if (scope.isBig) {
                            dialogService.alert('存在开始值大于结束值的项');
                            scope.item.inputValue = '';
                            showDefaultValue = angular.copy(scope.item.defaultValue);
                            excludeType = angular.copy(scope.item.exclude);
                            return;
                        }

                        if (!scope.match) {
                            dialogService.alert('存在输入格式不正确的项，只能输入非负整数');
                            scope.item.inputValue = '';
                            showDefaultValue = angular.copy(scope.item.defaultValue);
                            excludeType = angular.copy(scope.item.exclude);
                            return;
                        }

                        if (!scope.chooseItem.length) {
                            dialogService.alert('您还未输入任何值');
                            scope.item.inputValue = '';
                            showDefaultValue = angular.copy(scope.item.defaultValue);
                            excludeType = angular.copy(scope.item.exclude);
                            return;
                        }
                    }

                    if (scope.chooseItem.length) {
                        if (scope.item.exclude) {
                            scope.item.inputValue = '!(' + scope.chooseItem.join(',') + ')';
                        }
                        else {
                            scope.item.inputValue = scope.chooseItem.join(',');
                        }
                        scope.item.value = scope.chooseItem;
                    }

                    showDefaultValue = angular.copy(scope.item.defaultValue);
                    excludeType = angular.copy(scope.item.exclude);
                    scope.showValues();
                };
                // 切换包含于排除
                scope.changeType = function () {
                    scope.item.exclude = !scope.item.exclude;
                };
            }
        };
    }]);
});
