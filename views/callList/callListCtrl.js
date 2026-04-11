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
    app.controller('callListCtrl', function ($scope, $http, $location, $stateParams, $timeout, $q, $document,
        dialogService, $rootScope, dimensionService, ngDialog, callListService) {

        // 初始化分页参数
        $scope.pagging = {
            totalSize: 0,
            pageNow: 1,
            totalPage: 0,
            pageNum: 1,
            pageSize: 15
        };
        // 初始化
        $scope.data = [];
        $scope.callCulumns = [];
        $scope.sortField = 'voiceId';
        $scope.sortType = 'asc';
        $scope.timesRange = {};
        $scope.$value = '';
        $scope.params = [];
        $scope.keys = [];

        /*$scope.timeKeys=[];
        $scope.otherKeys=[];*/
        $scope.oldkeys = [];
        $scope.index = '';
        $scope.callParamSearch = [];
        $scope.optionVlaue = '?';
        $scope.filterData = [];
        $scope.showNewpaging = false;
        $scope.yucunKey = [];
        $scope.keyss = [];
        $scope.openOrColseByTaskId = '';
        $scope.oldTaskID = '';
        // //默认现网数据,可选其他数据
        // if($rootScope.swtichData){
        //     $scope.batchId = $rootScope.swtichData.batchId;
        //     $scope.ifLone =  $rootScope.swtichData.ifLone;
        //     $scope.dataType = $rootScope.swtichData.dataType;
        // }else{ 
        //     $scope.batchId = "";
        //     $scope.ifLone = 0;
        //     $scope.dataType = 2; 
        // }

        // $scope.$on("switch-data-import",function(e,d){  //接收首页的数据来源参数
        //   $scope.batchId = d.batchId;
        //   $scope.ifLone = d.ifLone;
        //   $scope.dataType = d.dataType;
        //   $scope.initFunction();
        // });
        // 浏览器为谷歌浏览器采用H5播放器
        if (window.navigator.userAgent.toLowerCase().indexOf('chrome') > 0) {
            $scope.hre = 'playH5.html#';
        }
        // 浏览器为ie浏览器采用sliver浏览器
        if (window.navigator.userAgent.toLowerCase().indexOf('irefox') > 0) {
            $scope.hre = 'play.html#';
        }
        // 浏览器为ie浏览器采用sliver浏览器
        if (window.navigator.userAgent.toLowerCase().indexOf('msie') > 0) {
            $scope.hre = 'play.html#';
        }
        // 初始化排序参数类型
        if ($rootScope.isTask) {
            $scope.showIsByTaskId = true;
        }
        else {
            $scope.showIsByTaskId = false;
        }
        // 时间控件
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
        $scope.$watch('timesRange.defaultStart', function (newValue, oldValue, $scope) {
            $scope.pagging.pageNum = 1;
        });
        // 初始化执行方法
        $scope.initFunction = function () {
            $scope.searchDimCon();
            $scope.searchFilterCondition();
        };
        // 分页查询
        $scope.getCallList = function (params) {
            $scope.pagging.pageNow = params.pageNum;
            $scope.timeRefresh();
            $scope.pagging.pageNow = 1;
        };
        // 分页查询
        $scope.getCallListVoice = function (params, id) {
            $scope.voicePagging.pageNow = params.pageNum;
            $scope.queryVoiceCallList(id);
            $scope.pagging.pageNow = 1;
        };
        // 即时搜索
        immediatelySearch = function (id) {
            $scope.$id = id;
            var $id = '#' + id;
            $($id).on('input propertychange', function () {
                var $value = $(this).val();
                $scope.checkSpace($value);
                if ($scope.k != 0) {
                    dialogService.alert('您刚刚输入的筛选信息开头为空格,不合法！系统将自动清空该值！');
                    $($id).blur(); // 失去焦点
                    $($id).val('');
                    return false;
                }

                $scope.$valueInput = $value;
                if ($value != '') {
                    angular.forEach($scope.callListCulumns, function (itemDim) {
                        if (itemDim.durationFlag != '1' && id === itemDim.key && id === 'ifLone') {
                            var number = new RegExp('^\\d+$');
                            if (!number.test($value)) {
                                dialogService.alert('数据类型应输入非负整数！');
                                $($id).val('');
                                $($id).blur(); // 失去焦点
                                return;
                            }

                            if ($value > 2147483647) {
                                dialogService.alert('数据类型不应输入过长！系统将自动清空该值！');
                                $($id).val('');
                                $($id).blur(); // 失去焦点
                                return;
                            }
                        }

                        if (itemDim.durationFlag != '0' && id === itemDim.key) {
                            $value = parseInt($value * 1000, 10);
                            if ($value > 2147483647) {
                                dialogService.alert('时长类筛选信息不应输入过长！系统将自动清空该值！');
                                $($id).val('');
                                $($id).blur(); // 失去焦点
                                return;
                            }
                        }

                    });
                }

            });
        };
        // $scope.$value =$value +"*";
        // //$scope.keys[id]=$scope.$value;                    
        // $scope.keys.push({
        //   key:id,
        //   value:$scope.$value
        // })
        // console.log($scope.keys)
        // $scope.keyss=[];
        // for(item in $scope.keys){
        //     if($scope.keys[item] !="*"){
        //         $scope.keyss.push({
        //           key :item,
        //           value:$scope.keys[item]
        //         })
        //     }
        // }
        // 
        $scope.enterKey = function (event) {
            var k = 1;
            console.log(2)
            event = event ? event : (window.event ? window.event : null);
            if (event.keyCode == 13 || event.which == 13) {
                $scope.pagging.pageNow = 1;
                $scope.keys = [];
                angular.forEach($rootScope.getData, function (item) {
                    if (item.inputFilterValue != '' && item.inputFilterValue != null) {
                        $scope.keys.push({
                            key: item.key,
                            value: item.inputFilterValue
                        });
                    }

                });
                angular.forEach($scope.keys, function (item) {
                    angular.forEach($scope.callListCulumns, function (itemDim) {
                        if (itemDim.durationFlag != '0' && item.key === itemDim.key && item.key != 'ifLone') { // 此时的ifLone比较特殊
                            var kongge1 = new RegExp('\\s');
                            if (kongge1.test(item.value)) {
                                k = 0;
                                dialogService.alert(itemDim.name + ' 筛选信息不能含有\'空格\'哦！');
                                $('#' + item.key).blur(); // 失去焦点
                            }

                            var number = new RegExp('^(([0-9]+)|([0-9]+\.[0-9]{1,3}))$');
                            if (!number.test(item.value)) {
                                k = 0;
                                dialogService.alert(itemDim.name + ' 筛选信息应输入\'非负数\'且最多\'3位小数\'！');
                                $('#' + item.key).blur(); // 失去焦点
                            }

                            item.value = parseInt((item.value) * 1000, 10) + '*';
                        }

                        if (itemDim.durationFlag == '0' && item.key === itemDim.key && item.key != 'ifLone') {
                            item.value = item.value.replace(/:/g, '\\\\:');
                            item.value = item.value.replace(/ /g, '\\\\ ');
                            item.value = item.value.replace(/\//g, '\\\\/');
                            item.value = '*' + item.value + '*';
                        }

                        if (itemDim.durationFlag == '0' && item.key === itemDim.key && item.key === 'ifLone') {
                            item.value = item.value + '*';
                        }

                    });
                });

                /*需求变化*/

                /*$scope.timeKeys=[];
                $scope.otherKeys=[];
                angular.forEach($scope.keys,function(item,index){
                  angular.forEach($scope.callListCulumns,function(itemDim){
                    if(item.key===itemDim.key&&itemDim.durationFlag =="1"){
                      $scope.timeKeys.push({
                        key:item.key,
                        value:item.value
                      });
                    } else if(item.key===itemDim.key&&itemDim.durationFlag =="0"){
                      $scope.otherKeys.push({
                        key:item.key,
                        value:item.value
                      });
                    };
                  });
                });*/
                if (k != 0 && k != null) {
                    $scope.timeRefresh();
                }
            }

        };
        $scope.checkSpace = function (str) {
            str = str.substr(0, 1);
            var length1 = str.length;
            str = str.replace(' ', '');
            var length2 = str.length;
            if (length1 == length2) {
                $scope.k = 0;
            }
            else {
                $scope.k = 1;
            }
        };
        // 查询所有维度(包括系统维度和自定义维度)
        $scope.searchDimCon = function () {
            var params = [{
                userId: $rootScope.userId,
                listType: 1 // 列表类型默认维度配置：1.通话列表 2.违规语音列表 3.质量管控钻取通话列表 4.业务运营里数字钻取通话列表  5.专题匹配通话 6.模型匹配通话
            }];
            dimensionService.searchDim().then(function (result) {
                $scope.callListCulumns = result.value || [];
                $scope.searchDimension = '';
                // dubboService.req("callFilterService", "getDimensionByUserId", params).then(function(response){
                callListService.queryDimensions({
                    listType: 1
                }).then(function (response) {
                    $scope.data = response.value.split(',');
                    $scope.colspanValue = $scope.data.length + 1;
                    angular.forEach($scope.data, function (items, index) {
                        if (items === 'voiceId' || items === 'taskId') {
                            $scope.data.splice(index, 1);
                        }
                    });
                    if ($rootScope.isTask) {
                        var id = 'taskId';
                    }
                    else {
                        var id = 'voiceId';
                    }
                    $scope.data.unshift(id);
                    angular.forEach($scope.data, function (items, index) {
                        angular.forEach($scope.callListCulumns, function (item) {
                            if (items === item.key) {
                                $scope.callCulumns.push({
                                    key: item.key,
                                    name: item.name,
                                    inputFilterValue: ''
                                });
                                if (item.key != 'taskId') {
                                    $scope.searchDimension = $scope.searchDimension + item.key;
                                    $scope.searchDimension += ',';
                                }
                            }

                            $rootScope.getData = $scope.callCulumns;
                        });
                    });
                    $scope.timeRefresh();
                });
            });
        };
        // 查询该用户过滤条件集合
        $scope.searchFilterCondition = function () {
            var params = [{
                userId: $rootScope.userId,
                listType: 1 // 列表类型默认维度配置：1.通话列表 2.违规语音列表 3.质量管控钻取通话列表 4.业务运营里数字钻取通话列表  5.专题匹配通话 6.模型匹配通话
            }];
            // dubboService.req('callFilterService', 'getFilterListByUserId', params).then(function(response){
            callListService.queryAllFilters({
                listType: 1
            }).then(function (response) {
                $scope.filterSelectList = response.value;
            });
        };
        // 筛选条件下拉框的值改变时
        $scope.$id = '?';
        changeFilterVlaue = function () {
            $scope.filterOptionAndOr = '';
            var $id = $('#selectId').val();
            $scope.$id = $id;
            $scope.pagging.pageNum = 1;
            $scope.searchShaixuanTiaoJiaoById($id);
        };
        $scope.fiterData1000 = function (key, map) {
            return map[key] = map[key] / 1000 + 's';
            // return map[key] = a.toFixed(0)"s";
            // 需求变化，先注释
        };
        $scope.fiterData2 = function (key, map) {
            return map[key] = (map[key] / 1000).toFixed(2) + ' 字/秒';
        };
        // 查询通话列表数据
        $scope.timeRefresh = function () {
            var params = $scope.parseParam()[0];
            // dubboService.req('illegalcallService', 'getIllegalCallList', params).then(function(response){
            callListService.queryCallList({
                filterParams: JSON.stringify(params).toString()
            }).then(function (response) {
                $scope.callLists = response.value.values;
                if ($scope.callLists == null) {
                    return;
                }

                if ($scope.callLists.length) {
                    $scope.showNewpaging = true;
                }
                else {
                    $scope.showNewpaging = false;
                }
                angular.forEach($scope.callListCulumns, function (itemDim) {
                    if (itemDim.durationFlag == '1') {
                        angular.forEach($scope.callLists, function (items) {
                            $scope.fiterData1000(itemDim.key, items);
                        });
                    }

                    if (itemDim.durationFlag == '2') {
                        angular.forEach($scope.callLists, function (items) {
                            $scope.fiterData2(itemDim.key, items);
                        });
                    }

                });
                $scope.pagging.pageNum = response.value.pageNow;
                $scope.counts = response.value.totalSize;
            });
            // $scope.filterData = [];//清空后，不能连续查询了
        };
        // 查询一条筛选条件
        $scope.searchShaixuanTiaoJiaoById = function ($id) {
            $scope.pagging.pageNow = 1;
            var params = [parseInt($id, 10)];
            if ($id != '?' && $id != '') {
                // dubboService.req('callFilterService', 'getSingleFilterById', params).then(function(response){
                callListService.querySingleFilter({id: $id, listType: 1}).then(function (response) {
                    $scope.filterData = JSON.parse(response.value.filter);
                    $scope.filterOptionAndOr = $scope.filterData.type;
                    $scope.timeRefresh();
                });
            }
            else {
                $scope.filterData = [];
                $scope.timeRefresh();
            }

        };
        // 弹出编辑筛选条件框
        $scope.edit = function () {
            // 进入编辑筛选条件框是让外面的下拉框恢复到默认值
            // changeFilterVlaue();//ie调用会报错
            var $id = $('#selectId').val();
            $scope.$id = $id;
            // 弹出编辑筛选条件框
            ngDialog.open({
                template: 'callList/filter.htm',
                showClose: false,
                closeByEscape: true,
                closeByDocument: false,
                disableAnimation: true,
                scope: $scope,
                controller: function ($scope, $timeout) {
                    $scope.filterSelectList = $scope.$parent.filterSelectList;
                    // 参数
                    $scope.callCulumnsSelect = [];
                    $scope.andOr = '&';
                    $scope.editShow = false;
                    $scope.saveFilterParams = [];
                    $scope.changeFilterOptionsAndOr = '&';
                    $scope.b = 0; // 筛选条件保存后check ng-mouseover事件启动
                    $scope.filterRules = [
                        {text: '等于', value: 'eq'},
                        {text: '不等于', value: 'ne'},
                        {text: '大于', value: 'gt'},
                        {text: '大于等于', value: 'ge'},
                        {text: '小于', value: 'lt'},
                        {text: '小于等于', value: 'le'}
                    ];
                    $timeout(function () {
                        if ($rootScope.editId && $scope.f != null) {
                            var $id = '#' + $rootScope.editId;
                            $($id).css('background-color', '#def4f4'); // 无法加载样式DOM对象未加载完成
                            $($id).css('box-shadow', '0 0 10px #0CC');
                            $scope.editShow = true;
                            var a = $($id).offset().top - 205;
                            $('.bodyFilter').animate({
                                scrollTop: a
                            }, 1000);
                            var params = [$rootScope.editId];
                            // dubboService.req('callFilterService', 'getSingleFilterById', params).then(function(response){
                            callListService.querySingleFilter({id: $rootScope.editId, listType: 1}).then(function (response) {
                                $scope.filterRuleName = response.value.filterName;
                                $scope.filters = [];
                                var Data = JSON.parse(response.value.filter);
                                $scope.andOr = Data[0].type;
                                angular.forEach(Data[0].filterContent, function (item) {
                                    $scope.filters.push({
                                        key: item.dimensionName,
                                        rule: item.condition,
                                        inputValue: item.value
                                    });
                                });
                            });
                        }
                    }, 200);
                    $timeout(function () {
                        $('.divCSS').css('background-color', '#fff');
                        $('.divCSS').css('box-shadow', 'none');
                        if ($scope.$parent.$id != '?' && $scope.$parent.$id != '') {
                            $rootScope.editId = $scope.$parent.$id;
                            var $id = '#' + $rootScope.editId;
                            $($id).css('background-color', '#def4f4'); // 无法加载样式DOM对象未加载完成
                            $($id).css('box-shadow', '0 0 10px #0CC');
                            var a = $($id).offset().top - 205;
                            $('.bodyFilter').animate({
                                scrollTop: a
                            }, 1000);
                            $scope.editShow = true;
                            var params = [parseInt($rootScope.editId, 10)];
                            // dubboService.req('callFilterService', 'getSingleFilterById', params).then(function(response){
                            callListService.querySingleFilter({id: $rootScope.editId, listType: 1}).then(function (response) {
                                $scope.filterRuleName = response.value.filterName;
                                $scope.filters = [];
                                var Data = JSON.parse(response.value.filter);
                                $scope.andOr = Data.type;
                                angular.forEach(Data.filterContent, function (item) {
                                    $scope.filters.push({
                                        key: item.dimensionName,
                                        rule: item.condition,
                                        inputValue: item.value
                                    });
                                });
                            });
                        }
                    }, 200);

                    // 获取维度下拉框的值(这里是全部2017/2/22)
                    angular.forEach($scope.$parent.callListCulumns, function (items) {
                        if ($scope.showIsByTaskId) {
                            if (items.key != 'voiceId') {
                                $scope.callCulumnsSelect.push({
                                    key: items.key,
                                    name: items.name,
                                    filter: $scope.filterRules
                                });
                            }
                        }
                        else {
                            if (items.key != 'taskId') {
                                $scope.callCulumnsSelect.push({
                                    key: items.key,
                                    name: items.name,
                                    filter: $scope.filterRules
                                });
                            }
                        }
                    });
                    // 初始化筛选参数
                    var firstFilterDim = $scope.callCulumnsSelect[0];
                    $scope.defaultFilter = {
                        key: firstFilterDim.key,
                        rule: firstFilterDim.filter[0].value,
                        inputValue: '',
                        ngIf: false
                    };
                    if ($scope.c === 1 && $scope.c != null) {
                        $scope.filters = $scope.filterBak;
                        $scope.id = '';
                    }
                    else {
                        $scope.filters = [];
                        $scope.id = '';
                        $scope.filters.push($scope.defaultFilter);
                    }
                    if ($scope.f != 1 && $scope.f != null && $scope.$parent.$id === '?' && $scope.$parent.$id === '') {
                        $scope.filters = [];
                        $scope.id = '';
                        $scope.filters.push($scope.defaultFilter);
                    }

                    // 筛选窗口 - 添加规则
                    $scope.addFilter = function () {
                        $scope.defaultFilter.ngIf = false;
                        // cope.filters.push(angular.copy($scope.defaultFilter));  
                        $scope.filters.push({
                            key: firstFilterDim.key,
                            rule: firstFilterDim.filter[0].value,
                            inputValue: '',
                            ngIf: false
                        });
                        $timeout(function () {
                            $('.threeSlectArea').animate({
                                scrollTop: Number.POSITIVE_INFINITY
                            });
                        }, 100);
                    };
                    // 筛选窗口 - 删除规则
                    $scope.deleteFilter = function (index) {
                        $scope.filters.splice(index, 1);
                    };
                    // 筛选窗口 - 清除规则
                    $scope.clearFilter = function (index) {
                        // 初始化筛选参数
                        $scope.id = '';
                        $scope.$parent.$id = '';
                        $scope.g = 1;
                        $scope.editShow = false;
                        $scope.filters = [];
                        $scope.filterRuleName = '';
                        $scope.defaultFilter.inputValue = '';
                        $scope.ngDisabled = false;
                        $scope.filters.push(angular.copy($scope.defaultFilter));
                        $('.divCSS').css('background-color', '#fff');
                        $('.divCSS').css('box-shadow', 'none');
                        $timeout(function () {
                            $('.bodyFilter').animate({
                                scrollTop: 0
                            }, 1000);
                        }, 100);
                    };
                    // 筛选按钮点击事件
                    $scope.actionFilter = function () {
                        $scope.$parent.optionVlaue = '';
                        if ($scope.g === 1 && $scope.g != null) {
                            $scope.$parent.optionVlaue = '';
                        }

                        if ($scope.id != '?' && $scope.id != null && $scope.id != '') {
                            $scope.$parent.optionVlaue = $scope.id;
                        }
                        if ($scope.$parent.$id != '?' && $scope.$parent.$id != '') {
                            $scope.$parent.optionVlaue = $scope.$parent.$id;
                        }

                        $scope.$parent.filterOptionAndOr = $scope.andOr;
                        $scope.$parent.filterData = $scope.filters;
                        $scope.$parent.pagging.pageNum = 1;
                        $scope.$parent.timeRefresh();
                        $scope.$parent.e = true;
                        $scope.filterBak = $scope.filters;
                        $scope.f = 1;
                        ngDialog.close();
                    };
                    // 与和或切换andOr
                    changeFilterOptionsAndOr = function () {
                        $scope.changeFilterOptionsAndOr = $('#changeFilterOptionsAndOr').val();
                    };
                    // ng-mouseover事件
                    $scope.ngMouseover = function (index) {
                        if ($scope.b > 0) {
                            $scope.filters[index].ngIf = false;
                        }
                    };
                    // ng-mouseleave事件
                    $scope.ngMouseleave = function (index) {
                        if ($scope.b > 0) {
                            var $id = '#' + index;
                            var $value = $($id).val();
                            if ($value === '') {
                                $scope.filters[index].ngIf = true;
                            }
                        }
                    };
                    // 筛选名称input获取焦点事情
                    $scope.ngChangeValue = function () {
                        var $value = $('#inputId').val();
                        if ($value === '') {
                            $scope.filterRuleNames = true;
                            $scope.filterRuleNamess = false;
                        }
                        else {
                            $scope.filterRuleNames = false;
                        }
                    };
                    // 筛选input获取焦点事情
                    immediatelyChange = function (id) {
                        $scope.$id = id;
                        var $id = '#' + id;
                        $($id).on('input propertychange', function () {
                            var $value = $($id).val();
                            if ($value === '') {
                                $scope.filters[id].ngIf = true;
                            }
                            else {
                                $scope.filters[id].ngIf = false;
                            }
                        });
                    };
                    // 筛选名称input获取焦点事情
                    // immediatelyInputChange = function(id){
                    //       $scope.$id = id;
                    //       var $id = "#" + id;
                    //       $($id).on("input propertychange", function() {
                    //           var $value = $($id).val();
                    //           if($value===""){
                    //                $scope.filterRuleNames = true;
                    //                $scope.filterRuleNamess = false;
                    //            }else{
                    //                $scope.filterRuleNames = false;
                    //            };
                    //       }); 
                    // };
                    // 保存筛选条件事件
                    $scope.saveFilter = function () {
                        $scope.pagging.pageNow = 1;
                        var params = [];
                        var index = 0;
                        var a = 0;
                        $scope.b = 1;
                        if (!$scope.filterRuleName) { // check筛选条件名称是否为空 
                            $scope.filterRuleNames = true;
                            $scope.filterRuleNamess = false;
                            return;
                        }
                        else { // check筛选条件名称重名  
                            if ($scope.$parent.$id != '?' && $scope.$parent.$id != '') {
                                $scope.id = parseInt($scope.$parent.$id, 10);
                            }

                            angular.forEach($scope.filterSelectList, function (item) {
                                if ($scope.id != '' && $scope.id != null && $scope.id === item.id) {
                                    return;
                                }

                                if (item.filterName === $scope.filterRuleName) {
                                    $scope.filterRuleNamess = true;
                                    $scope.filterRuleNames = false;
                                    a = 1;
                                }
                            });
                            if (a > 0) {
                                return;
                            }
                        }
                        // 是否显示“请给这个组合起个名字吧！”
                        $scope.filterRuleNamess = false;
                        // 是否显示“重名！无法保存”
                        $scope.filterRuleNames = false;
                        angular.forEach($scope.filters, function (item) {
                            if (item.inputValue) {
                                item.ngIf = false;
                                $scope.saveFilterParams.push({
                                    dimensionName: item.key,
                                    condition: item.rule,
                                    value: item.inputValue
                                });
                            }
                            else {
                                index = index + 1;
                                item.ngIf = true;
                            }
                        });
                        if (index > 0) {
                            $scope.saveFilterParams = [];
                            return;
                        }
                        if ($scope.$parent.$id != '?') {
                            $scope.id = $scope.$parent.$id;
                        }

                        if ($scope.id != '' && $scope.id != null) { // 编辑事件
                            params = {
                                id: $scope.id,
                                // userId:$rootScope.userId,
                                filterType: 1,
                                listType: 1, // 列表类型默认维度配置：1.通话列表 2.违规语音列表 3.质量管控钻取通话列表 4.业务运营里数字钻取通话列表  5.专题匹配通话 6.模型匹配通话
                                filterName: $scope.filterRuleName,
                                filter: JSON.stringify({type: $scope.andOr, filterContent: $scope.saveFilterParams}).toString()
                            };
                        }
                        else { // 新增事件
                            params = {
                                // type:$scope.changeFilterOptionsAndOr,
                                // userId:$rootScope.userId,
                                filterType: 1,
                                listType: 1, // 列表类型默认维度配置：1.通话列表 2.违规语音列表 3.质量管控钻取通话列表 4.业务运营里数字钻取通话列表  5.专题匹配通话 6.模型匹配通话
                                filterName: $scope.filterRuleName,
                                filter: JSON.stringify({type: $scope.andOr, filterContent: $scope.saveFilterParams}).toString()
                            };
                        }
                        // dubboService.req('callFilterService', 'saveFilters', params).then(function(response){
                        callListService.saveFiltersOrDimension(params).then(function (response) {
                            $scope.b = 0;
                            $timeout(function () {
                                $('.bodyFilter').animate({
                                    scrollTop: 0
                                }, 1000);
                            }, 100); // 增加完成滚动条回到顶部
                            var params = [{
                                listType: 1, // 列表类型默认维度配置：1.通话列表 2.违规语音列表 3.质量管控钻取通话列表 4.业务运营里数字钻取通话列表  5.专题匹配通话 6.模型匹配通话
                                userId: $rootScope.userId
                            }];
                            // dubboService.req('callFilterService', 'getFilterListByUserId', params).then(function(response){
                            callListService.queryAllFilters({
                                listType: 1
                            }).then(function (response) {
                                $scope.filterSelectList = response.value;
                                $scope.$parent.filterSelectList = $scope.filterSelectList;
                                $scope.$parent.optionVlaue = '?';
                                $scope.$parent.$id = '';
                                $scope.id = '';
                                $scope.$parent.searchShaixuanTiaoJiaoById($scope.$parent.optionVlaue);
                            });
                            $scope.filters = [];
                            $scope.saveFilterParams = [];
                            $scope.filterRuleName = '';
                            params = [];
                            // 初始化筛选参数
                            $scope.editShow = false;
                            var firstFilterDim = $scope.callCulumnsSelect[0];
                            $scope.defaultFilter = {
                                key: firstFilterDim.key,
                                rule: firstFilterDim.filter[0].value,
                                inputValue: ''
                            };
                            $scope.filters.push(angular.copy($scope.defaultFilter));
                            $scope.$parent.filterOptionAndOr = '';
                        });
                    };
                    // 查看筛选条件事件
                    $scope.watchInfomation = function (id) {
                        $scope.ngDisabled = true;
                        $scope.filterRuleNames = false;
                        $scope.filterRuleNamess = false;
                        $scope.id = id;
                        var params = [id];
                        // dubboService.req('callFilterService', 'getSingleFilterById', params).then(function(response){
                        callListService.querySingleFilter({id: id, listType: 1}).then(function (response) {
                            $scope.filterRuleName = response.value.filterName;
                            $scope.filters = [];
                            var Data = JSON.parse(response.value.filter);
                            $scope.andOr = Data[0].type;
                            angular.forEach(Data[0].filterContent, function (item) {
                                $scope.filters.push({
                                    key: item.dimensionName,
                                    rule: item.condition,
                                    inputValue: item.value
                                });
                            });
                        });
                    };
                    // 编辑筛选条件事件
                    $scope.editFliter = function (id) {
                        $scope.b = 1;
                        $scope.$parent.$id = id;
                        $scope.ngDisabled = false;
                        $scope.filterRuleNamess = false;
                        $scope.filterRuleNames = false;
                        $scope.c = 1;
                        $scope.editShow = true;
                        $scope.id = id;
                        $scope.idbak = id;
                        var $id = '#' + id;
                        if ($rootScope.editId != id && $rootScope.editId != null) {
                            $oldid = '#' + $rootScope.editId;
                            $($oldid).css('background-color', '#fff');
                            $($oldid).css('box-shadow', 'none');
                            $($id).css('background-color', '#def4f4');
                            $($id).css('box-shadow', '0 0 10px #0CC');
                            $rootScope.editId = id;
                        }
                        else {
                            $($id).css('background-color', '#def4f4');
                            $($id).css('box-shadow', '0 0 10px #0CC');
                            $rootScope.editId = id;
                        }

                        var params = [id];
                        // dubboService.req('callFilterService', 'getSingleFilterById', params).then(function(response){
                        callListService.querySingleFilter({id: id, listType: 1}).then(function (response) {
                            $scope.filterRuleName = response.value.filterName;
                            $scope.filters = [];
                            var Data = JSON.parse(response.value.filter);
                            $scope.andOr = Data.type;
                            angular.forEach(Data.filterContent, function (item) {
                                $scope.filters.push({
                                    key: item.dimensionName,
                                    rule: item.condition,
                                    inputValue: item.value
                                });
                                if (item.key != 'taskId') {
                                    $scope.searchDimension = $scope.searchDimension + item.key;
                                    $scope.searchDimension += ',';
                                }

                            });
                        });
                    };
                    // 删除筛选条件事件
                    $scope.deleFliter = function (id) {
                        $scope.clearFilter();
                        var params = [id];
                        // dubboService.req('callFilterService', 'deleteFilters', params).then(function(response){
                        callListService.deleteSingleFilter({
                            id: id
                        }).then(function (response) {
                            var params = [{
                                listType: 1, // 列表类型默认维度配置：1.通话列表 2.违规语音列表 3.质量管控钻取通话列表 4.业务运营里数字钻取通话列表  5.专题匹配通话 6.模型匹配通话
                                userId: $rootScope.userId
                            }];
                            // dubboService.req('callFilterService', 'getFilterListByUserId', params).then(function(response){
                            callListService.queryAllFilters({
                                listType: 1
                            }).then(function (response) {
                                $scope.filterSelectList = response.value;
                                $scope.$parent.filterSelectList = $scope.filterSelectList;
                                $scope.$parent.optionVlaue = '?';
                                $scope.$parent.searchShaixuanTiaoJiaoById($scope.$parent.optionVlaue);
                            });
                        });
                    };
                }
            }).closePromise.then(function (dialog) {
                $scope.b = 0;
            });
        };
        // 查询通话列表信息参数
        $scope.parseParam = function () {
            var params = {
                fetchFrom: $scope.pagging.pageNow,
                fetchSize: $scope.pagging.pageSize,
                // userId: $rootScope.userId,
                // systemId: $rootScope.systemId,
                orderField: $scope.sortField,
                orderType: $scope.sortType,
                // dataSource: $rootScope.dataSource,
                columns: $scope.data
            };
            params.filter = {};
            var filterExpressions = [];
            var filterOption = $scope.filterOptionAndOr;
            var index = 1;
            // 时间筛选条件
            // if ($scope.timesRange.defaultStart || $scope.timesRange.defaultEnd) {
            //   params.filter.filterFields = params.filter.filterFields || {};
            //   params.filter.filterFields['a'+index] = {
            //     fieldName: 'time',
            //     filterRule:'bothrange',
            //     params:[
            //     $scope.timesRange.defaultStart + ($location.search().dateType?'':' 00:00:00'),
            //     $scope.timesRange.defaultEnd + ($location.search().dateType?'':' 23:59:59')
            //     ]
            //   };
            //   filterExpressions.push('a'+index);
            //   index ++;
            // }

            // if($rootScope.swtichData){
            //    params.filter.filterFields = params.filter.filterFields || {};
            //    params.filter.filterFields['a'+index] = {
            //     fieldName: 'batchId',
            //     filterRule:'eq',
            //     params:[$scope.batchId]
            //   };
            //   filterExpressions.push('a'+index);
            //   index ++;
            // };

            // if($rootScope.swtichData){
            //    params.filter.filterFields = params.filter.filterFields || {};
            //    params.filter.filterFields['a'+index] = {
            //     fieldName: 'ifLone',
            //     filterRule:'eq',
            //     params:[$scope.ifLone]
            //   };
            //   filterExpressions.push('a'+index);
            //   index ++;
            // };

            // if($rootScope.swtichData){
            //    params.filter.filterFields = params.filter.filterFields || {};
            //    params.filter.filterFields['a'+index] = {
            //     fieldName: 'dataType',
            //     filterRule:'eq',
            //     params:[$scope.dataType]
            //   };
            //   filterExpressions.push('a'+index);
            //   index ++;
            // };

            if ($scope.timesRange.defaultStart || $scope.timesRange.defaultEnd) {
                params.filter.filterFields = params.filter.filterFields || {};

                /*石勇 新增 增加默认传值*/
                if ($scope.timesRange.defaultStart.length < 11) {
                    $scope.timesRange.defaultStart = $scope.timesRange.defaultStart + ' 00:00:00';
                    $scope.timesRange.defaultEnd = $scope.timesRange.defaultEnd + ' 23:59:59';
                }

                // 
                params.filter.filterFields['_a_' + index] = {
                    fieldName: 'time',
                    filterRule: 'bothrange',
                    params: [
                        $scope.timesRange.defaultStart,
                        $scope.timesRange.defaultEnd
                    ]
                };
                filterExpressions.push('_a_' + index);
                index++;
            }

            /*时长类区间搜索 需求变化 注释掉 */

            /*if ($scope.timeKeys.length) {
                angular.forEach($scope.timeKeys,function(item){
                  params.filter.filterFields = params.filter.filterFields || {};
                  params.filter.filterFields['a'+index] = {
                      fieldName: item.key ,
                      filterRule:'rightrange',
                      params:[
                        ((item.value)/1000).toString(),
                        ((item.value)/1000).toString()
                      ]
                    };
                    filterExpressions.push('a'+index);
                    index ++;
                });
            }*/
            // 即时搜索
            if ($scope.keys.length) {
                angular.forEach($scope.keys, function (item) {
                    params.filter = params.filter || {};
                    params.filter.filterFields = params.filter.filterFields || {};
                    params.filter.filterFields['_a_' + index] = {
                        fieldName: item.key,
                        filterRule: 'fulltext',
                        params: [
                            item.value]
                    };
                    filterExpressions.push('_a_' + index);
                    index++;
                });
            }

            var fixedIndex = index;
            // 筛选框搜索
            if ($scope.filterData != '') {
                $scope.listData = [];
                if (!!$scope.filterData.filterContent) {
                    $scope.flag = 1;
                    angular.forEach($scope.filterData.filterContent, function (items) {
                        $scope.listData.push(items);
                    });
                }
                else {
                    $scope.flag = 2;
                    angular.forEach($scope.filterData, function (item) {
                        $scope.listData.push(item);
                    });
                }
                angular.forEach($scope.listData, function (item) {
                    params.filter = params.filter || {};
                    params.filter.filterFields = params.filter.filterFields || {};
                    if ($scope.flag === 2) {
                        params.filter.filterFields['_a_' + index] = {
                            fieldName: item.key,
                            filterRule: item.rule,
                            params: [item.inputValue]
                        };
                    }
                    if ($scope.flag === 1) {
                        params.filter.filterFields['_a_' + index] = {
                            fieldName: item.dimensionName,
                            filterRule: item.condition,
                            params: [item.value]
                        };
                    }

                    filterExpressions.push('_a_' + index);
                    index++;
                });
            }
            if (filterOption == '|') {
                if (filterExpressions.length < 2) {
                    params.filter.expression = filterExpressions.join(filterOption);
                }
                else {
                    params.filter.expression = params.filter.expression || '';
                    for (var fn = 0; fn < fixedIndex - 1; fn++) {
                        params.filter.expression = params.filter.expression + filterExpressions[fn] + '&';
                    }

                    if (filterExpressions.length > fixedIndex) {
                        params.filter.expression = params.filter.expression + '(';
                        params.filter.expression = params.filter.expression + filterExpressions.splice(fixedIndex - 1, filterExpressions.length - fixedIndex + 1).join(filterOption);
                        params.filter.expression = params.filter.expression + ')';
                    }
                    else {
                        params.filter.expression = params.filter.expression + filterExpressions[fixedIndex - 1];
                    }
                }
            }
            else {
                filterOption = '&';
                params.filter.expression = filterExpressions.join(filterOption);
            }
            return [params];
        };

        /**
         * [setDimension 打开维度弹出框]
         */
        $scope.setDimension = function () {
            ngDialog.open({
                template: 'callList/call-list-directive.htm',
                controller: 'dimensionCtrl',
                $scope: $scope,
                showClose: false,
                closeByEscape: false,
                closeByDocument: true,
                disableAnimation: true,
                className: 'ngdialog-theme-default ngdialog-theme-model-push'
            }).closePromise.then(function (dialog) {
                $scope.colspanValue = dialog.value.dimeName.length + 1;
                // 当弹出层关闭后，自动更新 维度对象
                if (angular.isUndefined(dialog.value) || dialog.value === '$document') {
                    return;
                }

                $scope.data = [];
                $scope.callCulumns = [];
                $scope.searchDimension = '';
                angular.forEach(dialog.value.pushDim, function (item) {
                    $scope.data.push(item.key);
                    $scope.callCulumns.push({
                        name: item.name,
                        key: item.key
                    });
                    if (item.key != 'taskId') {
                        $scope.searchDimension = $scope.searchDimension + item.key;
                        $scope.searchDimension += ',';
                    }

                });
                $rootScope.getData = $scope.callCulumns;
                $rootScope.getData11 = dialog.value.pushDim;

                var params = {
                    // userId: $rootScope.userId,
                    filterType: 0,
                    listType: 1, // 列表类型默认维度配置：1.通话列表 2.违规语音列表 3.质量管控钻取通话列表 4.业务运营里数字钻取通话列表  5.专题匹配通话 6.模型匹配通话
                    filter: $scope.data.toString()
                };
                // dubboService.req("callFilterService", "saveFilters", params).then(function(response){
                callListService.saveFiltersOrDimension(params).then(function (response) {});
                $scope.openOrColseByTaskId = '';
                $scope.keys = [];
                $scope.timeRefresh();
            });
        };
        // 初始化分页参数
        $scope.voicePagging = {
            totalSize: 0,
            pageNow: 1,
            totalPage: 0,
            pageNum: 1,
            pageSize: 1
        };

        /*根据任务id匹配录音方法请求*/
        $scope.queryVoiceCallList = function (id) {
            var params = {
                id: id,
                searchDimension: $scope.searchDimension + 'voiceId',
                pageNum: $scope.voicePagging.pageNow,
                pageSize: $scope.voicePagging.pageSize,
                sortColumn: 'timeFormat',
                sortType: 'asc'
            };
            callListService.queryVoiceCallList(params).then(function (response) {
                $scope.columns = response.value.columns;
                $scope.rows = response.value.rows;
                $scope.voiceCounts = response.value.total;
            });
        };
        $scope.openOrColseByTaskId = '';
        $scope.showDetailsByTaskId = function (id) {
            $scope.voicePagging = {
                totalSize: 0,
                pageNow: 1,
                totalPage: 0,
                pageNum: 1,
                pageSize: 10
            };
            if ($scope.openOrColseByTaskId !== id) {
                $scope.queryVoiceCallList(id);
                $scope.openOrColseByTaskId = id;
            }
            else {
                $scope.openOrColseByTaskId = '';
            }
        };

        // $scope.paging = function () {
        //       $scope.findList();
        //     };

        /**
         * [remarkSort 排序]
         * @param  {[type]} order     [description]
         * @param  {[type]} orderType [description]
         * @return {[type]}           [description]
         */
        $scope.remarkSort = function (order, orderType) {
            if (orderType === 'asc') {
                $scope.btnUp = order;
                $scope.btnDown = '';
            }
            else {
                $scope.btnUp = '';
                $scope.btnDown = order;
            }
            $scope.sortField = order;
            $scope.sortType = orderType;
            $scope.pagging.pageNum = 1;
            $scope.timeRefresh();
        };
        $scope.initFunction();
    }
    );
});
