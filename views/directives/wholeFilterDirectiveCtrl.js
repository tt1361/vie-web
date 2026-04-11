/**
 * 本文件实现依赖任何一个 Angular 的module, 如果不采用本系统的框架，
 *      可以可以在  factory(window.app) app 修改你所创建的模块名称
 *  @dependece: Angular Module
 *
 * anthor：汪刚
 * time  ：2017/7/20
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
    app.directive('wholeFilter', ['$window', '$parse', 'dimensionService', '$document', 'ngDialog', 'commonFilterService', 'dialogService', '$timeout', function ($window, $parse, dimensionService, $document, ngDialog, commonFilterService, dialogService, $timeout) {
        return {
            restrict: 'EA',
            templateUrl: 'directives/whole-filter-directive.htm',
            replace: true,
            scope: {
                a: '=', // 传给父级筛选id
                b: '=', // 传给父级筛选条件
                c: '=' // 父级传给我的筛选id
            },
            link: function ($scope, element, attrs, $rootScope) {

                /***********初始化定义***********/

                /*筛选框默认显示*/
                $scope.fliterNames = '--未选择--';
                $scope.fliterRuleName = '--未选择--';
                $scope.filterRuleValue = '且';

                /*默认搜索模式规则:且*/
                $scope.filterRuleKey = '&';

                /*默认搜索模式规则:值为&*/
                $scope.isChecked = true;

                /*默认搜索模式:基础筛选*/
                $scope.fliterCategory = 1;

                /*默认搜索模式:值为1*/
                $scope.dimension = [];

                /*模型数据*/
                $scope.fliterNameSelect = [];

                /*$scope.selecteTop={};
                $scope.topValue = 0;*/
                $scope.filterName = '';

                /*初始化筛选器名称*/

                /*默认筛选数据*/
                $scope.filters = [{
                    alias: 1,
                    type: '',
                    showType: '',
                    key: '',
                    showName: '--未选择--',
                    opt: '',
                    optName: '--未选择--',
                    condition: [],
                    dimension: $scope.dimension,
                    value: [],
                    filterRule: [],
                    dimSelectShow: false,
                    ruleSelectShow: false
                }];

                /*显示或者隐藏筛选下拉框*/
                $scope.fliterSelectShow = function () {
                    $scope.selectShow = !$scope.selectShow;
                };

                /*$(".content-fliter").scroll(function(){
                    $scope.topValue= $(".content-fliter").scrollTop();
                    if($scope.topValue>0){
                        $scope.selecteTop = {
                            "top":$scope.topValue + 215 + "px"
                        };
                        console.log($scope.selecteTop.top)
                    }else{
                        $scope.topValue = 0;
                    };
                });*/

                /*编辑筛选器信息*/
                $scope.editSelectFliter = function (data) {

                    /*名称编辑及名称弹框*/
                    ngDialog.open({
                        template: 'directives/filter-name.htm',
                        showClose: true,
                        closeByEscape: true,
                        closeByDocument: true,
                        disableAnimation: true,
                        className: 'ngdialog-theme-default ngdialog-theme-model-push',
                        scope: $scope,
                        controller: function ($scope) {

                            /*确认*/
                            $scope.saveFilterName = function () {
                                if (!$scope.filterName) {
                                    $scope.noPass = true;
                                    for (var i = 1; i < 5; i++) {
                                        $('.input-filter-name').animate({
                                            top: '10px'
                                        }, 20);
                                        $('.input-filter-name').animate({
                                            top: '0px'
                                        }, 20);
                                    }
                                    return;
                                }
                                var data = {
                                    value: 1,
                                    name: $scope.filterName
                                };
                                $scope.closeThisDialog(data);
                            };

                            /*取消*/
                            $scope.closeFilterDialog = function () {
                                $('.ngdialog-content').toggle('explode');
                                $scope.closeThisDialog(0);
                            };

                            /*清空筛选名称*/
                            $scope.clearName = function () {
                                $scope.filterName = '';
                                $scope.noPass = true;
                            };

                            /*名称输入框check*/
                            $scope.filterCheck = function () {
                                if (!$scope.filterName) {
                                    $scope.noPass = true;
                                }
                                if ($scope.filterName) {
                                    $scope.noPass = false;
                                }
                            };
                        }
                    }).closePromise.then(function (dialog) {
                        if (dialog.value.value == '1') {
                            var params = {
                                filterId: data.id,
                                filter: JSON.stringify(data.filter),
                                flag: 1,
                                name: dialog.value.name
                            };
                            commonFilterService.saveEditDelete(params).then(function () {
                                $scope.queryAllFilter(data.id);
                            });
                        }

                    });
                    var event = event ? event : (window.event ? window.event : null);
                    if (window.navigator.userAgent.toLowerCase().indexOf('chrome') > 0) {
                        event.stopPropagation();
                    }
                    if (window.navigator.userAgent.toLowerCase().indexOf('msie') > 0) {
                        event.cancelBubble = true;
                    }
                };

                /*基础筛选和高级筛选的切换*/

                /*angular.element("input[name='Fliter']").bind("click",function(){
                    $scope.fliterCategory = $("input[name='Fliter']:checked").val();
                    if($scope.fliterCategory == 1){//基础查询
                        $scope.isChecked = true;
                    };
                    if($scope.fliterCategory == 2){//高级
                        $scope.isChecked = false;
                    };
                });*/

                /*基础筛选和高级筛选的切换*/
                angular.element('.fliter-Basics').bind('click', function () {
                    $scope.fliterCategory = 1;
                    $scope.isChecked = true;
                });
                angular.element('.fliter-Senior').bind('click', function () {
                    $scope.fliterCategory = 2;
                    $scope.isChecked = false;
                });

                /*显示或者隐藏筛选条件框*/
                $scope.showOrHedden = function (e) {
                    if (e == 0) {
                        $scope.showOrHeddens = true;
                        $('.fliter-sec-part').slideToggle();
                    }
                    if (e == 1) {
                        $scope.showOrHeddens = false;
                        $('.fliter-sec-part').slideToggle();
                    }
                };

                /*增加筛选条件*/
                $scope.addFliter = function () {
                    $scope.filters.push({
                        alias: 1,
                        type: '',
                        showType: '',
                        key: '',
                        durationFlag: '',
                        showName: '--未选择--',
                        opt: '',
                        optName: '--未选择--',
                        condition: [],
                        dimension: $scope.dimension,
                        value: [],
                        filterRule: [],
                        dimSelectShow: false,
                        showWhich: '',
                        ruleSelectShow: false
                    });
                };

                /*筛选条件下拉框显示或隐藏*/
                $scope.dimChangetoggle = function (indexs,event) {
                    angular.forEach($scope.filters, function (data, index) {
                        if (indexs == index) {
                            data.dimSelectShow = !data.dimSelectShow;
                            data.ruleSelectShow = false;
                            data.textRadioShow = false;
                        }
                        if (indexs != index) {
                            data.dimSelectShow = false;
                            data.ruleSelectShow = false;
                            data.textRadioShow = false;
                        }
                    });
                    var event = event ? event : (window.event ? window.event : null);
                    if (window.navigator.userAgent.toLowerCase().indexOf('chrome') > 0) {
                        event.stopPropagation();
                    }
                    if (window.navigator.userAgent.toLowerCase().indexOf('firefox') > 0) {
                        event.stopPropagation();
                    }
                    if (window.navigator.userAgent.toLowerCase().indexOf('msie') > 0) {
                        event.cancelBubble = true;
                    }
                };

                /*筛选条件下拉框显示或隐藏*/
                $scope.ruleChangetoggle = function (indexs,event) {
                    angular.forEach($scope.filters, function (data, index) {
                        if (indexs == index) {
                            data.ruleSelectShow = !data.ruleSelectShow;
                            data.dimSelectShow = false;
                            data.textRadioShow = false;
                        }
                        if (indexs != index) {
                            data.dimSelectShow = false;
                            data.ruleSelectShow = false;
                            data.textRadioShow = false;
                        }
                    });
                    var event = event ? event : (window.event ? window.event : null);
                    if (window.navigator.userAgent.toLowerCase().indexOf('chrome') > 0) {
                        event.stopPropagation();
                    }
                    if (window.navigator.userAgent.toLowerCase().indexOf('firefox') > 0) {
                        event.stopPropagation();
                    }
                    if (window.navigator.userAgent.toLowerCase().indexOf('msie') > 0) {
                        event.cancelBubble = true;
                    }
                };

                /*包含单选下拉框显示或隐藏*/
                $scope.textChangetoggle = function (indexs) {
                    angular.forEach($scope.filters, function (data, index) {
                        if (indexs == index) {
                            data.textRadioShow = !data.textRadioShow;
                            data.dimSelectShow = false;
                            data.ruleSelectShow = false;
                        }
                        if (indexs != index) {
                            data.dimSelectShow = false;
                            data.ruleSelectShow = false;
                            data.textRadioShow = false;
                        }
                    });
                    var event = event ? event : (window.event ? window.event : null);
                    if (window.navigator.userAgent.toLowerCase().indexOf('chrome') > 0) {
                        event.stopPropagation();
                    }
                    if (window.navigator.userAgent.toLowerCase().indexOf('msie') > 0) {
                        event.cancelBubble = true;
                    }
                };

                /*且或切换*/
                $scope.filterRule = function (d) {
                    if (d == 0) {
                        $scope.ruleShow = true;
                        $scope.filterRuleValue = '或';
                        $scope.filterRuleKey = '|';
                    }
                    if (d == 1) {
                        $scope.ruleShow = false;
                        $scope.filterRuleValue = '且';
                        $scope.filterRuleKey = '&';
                    }
                };

                /*查看筛选信息*/
                $scope.selectFliterName = function (data) {
                    var id = data.id;
                    var params = {
                        filterId: id
                    };
                    commonFilterService.searchFilterById(params).then(function (result) {
                        $scope.filters = [];
                        $scope.filters = JSON.parse(result.value.value.filterType).filter;
                        $scope.a = {
                            id: data.id
                        };
                        $scope.fliterCategory = data.filter.fliterCategory;
                        $scope.expression = data.filter.expression;
                        if (data.filter.rule == '|') {
                            $scope.filterRuleValue = '或';
                        }
                        else {
                            $scope.filterRuleValue = '且';
                        }

                        if ($scope.fliterCategory == 1) { // 基础查询
                            $scope.isChecked = true;
                            $scope.expression = '';
                        }
                        if ($scope.fliterCategory == 2) { // 高级
                            $scope.isChecked = false;
                        }

                        $scope.id = data.id;
                        $scope.fliterNames = data.name;
                        $scope.selectShow = !$scope.selectShow;
                        $scope.$broadcast('reload', $scope.filters);
                    });
                };

                /*删除某条筛选条件*/
                $scope.deleteFilter = function (index) {
                    $scope.filters.splice(index, 1);
                };

                /*重置*/
                $scope.clearClick = false;
                $scope.clearFilter = function () {

                    /*石勇 新增 点击重置时更换重置按钮的背景色*/
                    $scope.clearClick = true;
                    $timeout(function () {
                        $scope.clearClick = false;
                    }, 300);

                    /*新增结束*/
                    $scope.filters = [];
                    $scope.id = '';
                    $scope.c = 0;
                    $scope.fliterNames = '--未选择--';
                    // $scope.applicationFilter();
                    // 石勇 新增 清空高级筛选中的规则
                    $scope.expression = '';

                    /*石勇 新增 点击重置时不调用应用的方法*/

                    /* var params = $scope.spellParams();
                     $scope.a ={id:$scope.c};
                     $scope.b = params;*/
                };

                /*查询系统维度*/
                $scope.searchDim = function () {
                    commonFilterService.searchDimAndModel().then(function (result) {
                        $scope.fliterCulumnsSelect = result.value;
                    });
                };

                $scope.queryAllFilter = function (id) {
                    $scope.ids = id;
                    $scope.fliterNameSelect = [];
                    commonFilterService.queryAllFilter().then(function (result) {
                        angular.forEach(result.value.value, function (item) {
                            $scope.fliterNameSelect.push({
                                id: item.filterId,
                                name: item.filterName,
                                filter: JSON.parse(item.filterType)
                            });
                        });
                        var ids = $scope.ids ? $scope.ids : $scope.c;
                        angular.forEach($scope.fliterNameSelect, function (items) {
                            if (items.id == ids) {
                                // 石勇 新增 默认进入模型时获取对应的模型属于高级筛选还是基础筛选
                                $scope.fliterCategory = items.filter.fliterCategory;
                                $scope.fliterNames = items.name;
                                $scope.filters = items.filter.filter;
                                if (items.filter.fliterCategory == 1) { // 基础查询
                                    $scope.isChecked = true;
                                }
                                if (items.filter.fliterCategory == 2) { // 高级
                                    $scope.isChecked = false;
                                    $scope.expression = items.filter.expression;
                                }
                            }

                        });
                        // if(result.value.value[0]){
                        if ($scope.fliterCategory == '1') {
                            $scope.expression = '';
                        }

                        // }
                        if (id) {
                            $scope.id = id;
                        }
                        else {
                            $scope.id = $scope.c ? $scope.c : '';
                        }
                    });
                };

                /*维度下拉框选择事件*/
                $scope.dimChangedropClick = function (value, filter) {
                    filter.showName = value.name;
                    filter.key = value.key;
                    filter.type = value.dataType;
                    filter.showType = value.type;
                    filter.durationFlag = value.durationFlag;
                    filter.optName = '--未选择--';
                    filter.showWhich = '';
                    filter.value = [];
                    filter.condition = [];
                    filter.dimSelectShow = !filter.dimSelectShow;
                    $scope.dimLinkage(value.durationFlag, value.key, filter);
                };

                /*规则下拉框选择事件*/
                $scope.ruleChangedropClick = function (value, filter) {
                    filter.optName = value.text;
                    filter.opt = value.value;
                    filter.ruleSelectShow = !filter.ruleSelectShow;
                    $scope.ruleLinkage(filter);
                };

                /*规则下拉框选择事件*/
                $scope.textChangedropClick = function (value, filter) {
                    filter.value[0] = value;
                };

                /*删除*/
                $scope.deleteFilterById = function () {
                    var params = {filterId: $scope.id, flag: 0};
                    commonFilterService.saveEditDelete(params).then(function () {
                        $scope.queryAllFilter();
                        // $scope.filters=[{
                        //     alias: 1,
                        //     type: "",
                        //     showType: "",
                        //     key: "",
                        //     showName: "--未选择--",
                        //     opt: "",
                        //     optName: "--未选择--",
                        //     value: [],
                        //     dimension:[],
                        //     filterRule:[],
                        //     dimSelectShow:false,
                        //     ruleSelectShow:false
                        // }];
                        $scope.fliterNames = '--未选择--';
                        $scope.id = '';

                        $scope.c = 0;
                        $scope.filters = [];
                        // 石勇 新增 清空高级筛选中的规则
                        $scope.expression = '';

                        /*石勇 新增 点击重置时不调用应用的方法*/
                        var params = $scope.spellParams();
                        $scope.a = {
                            id: $scope.c
                        };
                        $scope.b = params;
                    });
                };

                /*保存、编辑和逻辑删除筛选条件*/
                $scope.saveFilter = function (which) {
                    var param = $scope.spellParams();
                    var index = 0;
                    angular.forEach(param.filter, function (value) {
                        if (!value.value.length) {
                            value.isNull = true;
                            index++;
                        }
                        if (value.value.length) {
                            angular.forEach(value.value, function (item) {
                                if (item == '') {
                                    value.isNull = true;
                                    index++;
                                }

                            });
                        }

                    });
                    if (index != 0) {
                        dialogService.alert('检测到有未填写项，请确认后再操作');
                        return;
                    }

                    /*校验expression是否为空*/
                    if ($scope.fliterCategory == '2' && !$scope.expression) {
                        $scope.noPassRule = true;
                        return;
                    }

                    /*名称编辑及名称弹框*/
                    ngDialog.open({
                        template: 'directives/filter-name.htm',
                        showClose: true,
                        closeByEscape: true,
                        closeByDocument: true,
                        disableAnimation: true,
                        className: 'ngdialog-theme-default ngdialog-theme-model-push',
                        scope: $scope,
                        controller: function ($scope) {
                            if (which == '1') { // 保存
                                $scope.filterName = $scope.$parent.fliterNames;
                                if ($scope.filterName == '--未选择--') {
                                    $scope.filterName = '';
                                }
                            }
                            else { // 另存为

                            }

                            /*确认*/
                            $scope.saveFilterName = function () {
                                if (!$scope.filterName) {
                                    $scope.noPass = true;
                                    for (var i = 1; i < 5; i++) {
                                        $('.input-filter-name').animate({
                                            top: '10px'
                                        }, 20);
                                        $('.input-filter-name').animate({
                                            top: '0px'
                                        }, 20);
                                    }
                                    return;
                                }
                                var data = {
                                    value: 1,
                                    name: $scope.filterName
                                };
                                $scope.closeThisDialog(data);
                            };

                            /*取消*/
                            $scope.closeFilterDialog = function () {
                                $('.ngdialog-content').toggle('explode');
                                $scope.closeThisDialog(0);
                            };

                            /*清空筛选名称*/
                            $scope.clearName = function () {
                                $scope.filterName = '';
                                $scope.noPass = true;
                            };

                            /*名称输入框check*/
                            $scope.filterCheck = function () {
                                if (!$scope.filterName) {
                                    $scope.noPass = true;
                                }
                                if ($scope.filterName) {
                                    $scope.noPass = false;
                                }
                            };
                        }
                    }).closePromise.then(function (data) {
                        if (data.value.value == '1') {
                            var params = {};

                            /*最后的参数*/
                            if (which == '0') {

                                /*保存*/
                                params = {
                                    filter: JSON.stringify(param),
                                    name: data.value.name,
                                    flag: 1
                                };
                            }
                            if (which == '1') {

                                /*编辑*/
                                params = {
                                    filter: JSON.stringify(param),
                                    name: data.value.name,
                                    flag: 1,
                                    filterId: $scope.id
                                };
                            }
                            commonFilterService.checkFilterName(params).then(function (result) {
                                if (!result.value.successful) {
                                    dialogService.alert('筛选器名称重复，请确认后再提交');
                                }
                                else {
                                    commonFilterService.saveEditDelete(params).then(function (result) {
                                        $scope.queryAllFilter($scope.id);

                                        /*筛选器保存出错的时候弹窗提示*/
                                        if (!result.value.successful) {
                                            dialogService.error(result.value.message);
                                            $timeout(function () {
                                                ngDialog.close('errorDialog');
                                            }, 5000);
                                        }

                                    });
                                }
                            });
                        }
                    });
                };

                /*运用*/
                $scope.showClick = false;
                $scope.applicationFilter = function () {

                    /*石勇 新增 点击应用时替换应用按钮的背景色*/
                    $scope.showClick = true;
                    $timeout(function () {
                        $scope.showClick = false;
                    }, 300);
                    var params = $scope.spellParams();

                    /*石勇 新增 筛选器的筛选条件存在空白项的时候点击应用进行弹窗提示*/
                    var index = 0;
                    angular.forEach(params.filter, function (value) {
                        if (!value.value.length) {
                            value.isNull = true;
                            index++;
                        }
                        if (value.value.length) {
                            angular.forEach(value.value, function (item) {
                                if (item == '') {
                                    value.isNull = true;
                                    index++;
                                }

                            });
                        }

                    });
                    if (index != 0) {
                        dialogService.alert('检测到有未填写项，请确认后再操作');
                        return;
                    }
                    var numValue = $scope.expression.replace(/[^0-9]/ig, ',');
                    var numList = numValue.split(',');
                    angular.forEach(numList, function (item) {
                        if (item) {
                            if ($scope.filters.length < item) {
                                dialogService.alert('运算规则有误，请检查后重新输入！');
                                return;
                            }
                        }

                    });

                    /**/
                    $scope.a = {
                        id: 0
                    };
                    $scope.b = params;
                };

                /*高级筛选条件匹配规则*/
                $scope.filterRuleCheck = function (value) {

                    /*输入框输入check*/
                    if (value.value != '') {
                        value.isNull = false;

                        /*输入框check*/
                        var checkRegExp = '';
                        if (value.durationFlag == '1') {
                            checkRegExp = new RegExp('^[\,\.0-9]+$');
                            if (checkRegExp.test(value.value) == false) {
                                dialogService.alert('时长类信息,只能输入数字、小数点和英文逗号');
                                if (value.opt == 'range') {
                                    value.value = [];
                                }
                                else {
                                    value.value = '';
                                }
                            }
                        }
                    }
                    else {
                        value.isNull = true;
                    }
                };

                /*高级筛选条件规则输入判断*/
                $scope.expressionCheck = function () {

                    /*expression输入check*/
                    var rule = new RegExp('^[\(\)\|\&0-9]+$');
                    var check = rule.test($scope.expression);
                    if (check == false) {
                        $scope.expression = $scope.expression.substring(0, $scope.expression.length - 1);
                        dialogService.alert('请输入支持通过序号进行简单的&,|逻辑组合，如(1|2)&3');
                    }
                    if ($scope.fliterCategory == '2' && $scope.expression) {
                        $scope.noPassRule = false;
                    }

                    if ($scope.fliterCategory == '2' && !$scope.expression) {
                        $scope.noPassRule = true;
                    }

                };

                /*拼参数*/
                $scope.spellParams = function () {
                    var arr = new Array();
                    arr = $scope.filters;
                    var index = 0,
                        params;
                    angular.forEach(arr, function (item) {
                        item.alias = ++index;
                        if (typeof item.value == 'string') {
                            item.value = item.value.split(',');
                        }
                    });

                    /*基础搜索*/
                    if ($scope.fliterCategory == 1) {
                        var expression = '';
                        for (var i = 1; i < arr.length + 1; i++) {
                            expression = expression + i + $scope.filterRuleKey;
                        }
                        expression = expression.substring(0, expression.length - 1);
                        params = {
                            rule: $scope.filterRuleKey,
                            filter: arr,
                            fliterCategory: 1,
                            expression: expression
                        };
                    }

                    /*高级搜索*/
                    if ($scope.fliterCategory == 2) {
                        params = {
                            filter: arr,
                            fliterCategory: 2,
                            expression: $scope.expression
                        };
                    }
                    angular.forEach(params.filter, function (item, index) {
                        if (item.showType == 'mulSel' && item.condition[0]) {
                            item.value = item.condition[0].value;
                        }

                    });
                    return params;
                };

                /*初始化方法*/
                $scope.initFunction = function () {
                    $scope.searchDim();
                    $scope.queryAllFilter();
                };

                /*维度选择联动*/
                $scope.dimLinkage = function (type, key, filter) {
                    angular.forEach($scope.fliterCulumnsSelect, function (item) {
                        if (key == item.key) {
                            $scope.dimension = {
                                analysis: item.analysis,
                                dataType: item.dataType,
                                durationFlag: item.durationFlag,
                                key: item.key,
                                name: item.name,
                                type: item.type,
                                value: item.value
                            };
                        }

                        filter.dimension = $scope.dimension;
                    });
                    filter.filterRule = [];
                    filter.value = [];

                    /*历史的局限性，产品设计太过简略，望后期优化*-* */
                    if (type != '0') {
                        filter.filterRule.push({text: '大于', value: 'gt'},
                            {text: '小于', value: 'lt'},
                            {text: '包含', value: 'fulltext'},
                            {text: '不包含', value: 'nofulltext'},
                            {text: '等于', value: 'in'},
                            {text: '不等于', value: 'not in'},
                            {text: '区间', value: 'range'});
                    }

                    /*时间类-以后可能会出现的情况*/

                    /*if(key == "timeFormat"){
                        filter.filterRule.push({text: '等于', value: 'rang'},
                            {text: '不等于', value: 'not rang'})
                    };*/
                    if (type == '0') {
                        if (key == 'taskId' || key == 'voiceId' || filter.showType == 'mulEqu' || filter.showType == 'mulSel') {
                            filter.filterRule.push({text: '包含', value: 'fulltext'},
                                {text: '不包含', value: 'nofulltext'},
                                {text: '等于', value: 'in'},
                                {text: '不等于', value: 'not in'});
                        }

                        if (key == 'offLineTagId') {
                            filter.filterRule.push({text: '等于', value: 'in'},
                                {text: '不等于', value: 'not in'});
                        }

                        if (filter.showType == 'range') {
                            filter.filterRule.push({text: '大于', value: 'gt'},
                                {text: '小于', value: 'lt'},
                                {text: '等于', value: 'in'},
                                {text: '不等于', value: 'not in'},
                                {text: '区间', value: 'range'});
                        }
                    }
                };

                /*规则选择联动*/
                $scope.ruleLinkage = function (filter) {
                    filter.value = [];

                    /*时长类*/
                    if (filter.durationFlag != '0' && filter.opt != 'range') {
                        filter.showWhich = 1;
                    }

                    /*时长类区间*/
                    if (filter.durationFlag != '0' && filter.opt == 'range') {
                        filter.showWhich = 2;
                    }

                    /*时间类-以后可能会出现的情况*/

                    /*if(filter.key == "timeFormat"){
                        filter.showWhich = 3;
                        $scope.timeRange = {
                            defaultTimeName: "一周内",
                            defaultTime: "",
                            timeType: "lastWeek",
                            startTime: $scope.systemDate&&$scope.systemDate!='${systemDate}'?$.datepicker.formatDate('yy-mm-dd', new Date(new Date($scope.systemDate).getTime()-6*24*3600*1000)):$.datepicker.formatDate('yy-mm-dd', new Date(new Date().getTime()-6*24*3600*1000)),
                            endTime: $scope.systemDate&&$scope.systemDate!='${systemDate}'?$scope.systemDate:$.datepicker.formatDate('yy-mm-dd', new Date())
                        };
                    };*/

                    /*文本类*/
                    if (filter.durationFlag == '0' && filter.type != 'range') {

                        /*模型*/
                        if (filter.key == 'offLineTagId') {
                            $scope.$broadcast('empty-model');
                            filter.showWhich = 5;
                            filter.dimension = $scope.dimension;
                        }

                        /*除模型外的文本*/
                        if (filter.key != 'offLineTagId') {

                            /*文本单选*/
                            if (filter.showType == 'mulEqu') {
                                filter.showWhich = 1;
                            }

                            /*等于多选*/
                            if (filter.showType == 'mulSel') {
                                filter.showWhich = 6;
                            }
                        }
                        if (filter.showType == 'range') {
                            if (filter.opt == 'range') {
                                filter.showWhich = 2;
                            }
                            else {
                                filter.showWhich = 1;
                            }
                        }

                        /*给文本类维度下拉框赋值*/
                        angular.forEach($scope.fliterCulumnsSelect, function (item) {
                            if (filter.key == item.key) {
                                filter.filterTextValue = item.value;
                            }

                        });
                    }
                };

                /*点击页面其他地方关闭下拉弹窗*/
                $document.on('click', function () {
                    angular.forEach($scope.filters, function (item) {
                        item.dimSelectShow = false;
                        item.ruleSelectShow = false;
                        item.textRadioShow = false;
                    });
                });

                /*点击页面其他地方关闭弹窗*/
                $(window.document).click(function (event) {
                    if (!angular.element(event.target).parents('.wholeFilter').length
                        && !angular.element(event.target).hasClass('picture-select-down-fliter')
                        && $scope.selectShow) {
                        $scope.selectShow = false;
                    }

                    $scope.$apply();
                });

                /*执行*/
                $scope.initFunction();

            }
        };
    }]);
});
