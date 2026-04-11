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
     * 本controller 实现菜单区域的相应逻辑
     *  @params:
     *      $http:  发送http 请求的service
     *      $scope: 双向绑定的媒介， 由 angular 自动实例化
     *
     *
     */
    app.controller('menuCtrl', [
        '$scope',
        'ngDialog',
        '$state',
        'menuService',
        '$rootScope', function ($scope, ngDialog, $state, menuService, $rootScope) {
            // 默认菜单展开
            $scope.open = true;
            $scope.resources = [];
            $scope.bubbleShow = false;
            // 增加判断，默认任务分析，便于免登陆调试,
            if ($rootScope.isTask === undefined) {
                $rootScope.isTask = 0; // 此处免登陆调试需修改值，按录音取 0，按任务取 1，int类型
            }
            else {
                $rootScope.isTask = $rootScope.isTask;
            }
            // 获取菜单资源
            $scope.getMenu = function () {
                menuService.getMenu().then(function (result) {
                    $scope.resources = result.value || [];
                    angular.forEach(result.value, function (resource) {
                        if (resource.link === '/index') { // 系统首页
                            if ($.inArray('messagePush', resource.optAction) > -1) {
                                $scope.isShowMessage = true;
                                $scope.getUnReadCallCount();
                            }

                            return;
                        }

                    });
                });
            };

            // 获取数据源

            /* menuService.getDataSource().then(function (data) {
                 $scope.dataSourceList = data.value;
             });*/
            // 菜单的展开收起
            $scope.changeOpen = function () {
                $scope.open = !$scope.open;
                $scope.$broadcast('childrenRefresh');
            };

            // 修改密码
            $scope.resetPwd = function () {
                ngDialog.open({
                    template: 'menu/reset-pwd-directive.htm',
                    controller: 'resetPwdCtrl',
                    scope: $scope,
                    showClose: false,
                    closeByEscape: false,
                    closeByDocument: false,
                    disableAnimation: true,
                    className: 'ngdialog-theme-default ngdialog-pwd-dialog'
                });
            };

            /**/
            menuService.getDataSource().then(function (data) {
                $scope.dataSourceListNew = data.value;
                $scope.dataSourceName = '';
                $scope.dataSourceAllName = '';
                angular.forEach($scope.dataSourceListNew, function (items) {
                    if (items.type == 1) {
                        $scope.dataSourceAllName = items.name;
                        if (items.name.length < 13) {
                            $scope.dataSourceName = items.name;
                        }
                        else {
                            $scope.dataSourceName = items.name.substring(0, 12) + '...';
                        }
                    }

                });
            });
            // 切换数据源
            $scope.changeDataSrc = function () {
                menuService.getDataSource().then(function (data) {
                    $scope.dataSourceList = data.value;
                    ngDialog.open({
                        template: 'menu/change-data-src-directive.htm',
                        scope: $scope,
                        showClose: true,
                        closeByEscape: false,
                        closeByDocument: false,
                        disableAnimation: true,
                        className: 'ngdialog-theme-default ngdialog-pwd-dialog',
                        controller: function ($scope) {
                            $scope.dataSource = '';
                            $scope.dimensionName = '';
                            $scope.action = '';
                            $scope.selectDataSrc = function (params, dimensionName) {
                                angular.forEach($scope.dataSourceList, function (item) {
                                    item.type = 0;
                                });
                                $scope.dataSource = params;
                                $scope.dimensionName = dimensionName;
                                $scope.action = params;
                                $.cookie("setDataSource", '', {expires: 7});
                                window.localStorage.removeItem("setDataSource");
                                var str = JSON.stringify($scope.dataSource);
                                $.cookie("setDataSource", str, {expires: 7});
                            };
                            $scope.recallSystem = function () {
                                angular.forEach($scope.dataSourceList, function (items) {
                                    if (items.type == 1) {
                                        $scope.dataSource = items.businessCode;
                                        $scope.dimensionName = items.dimensionName;
                                    }

                                });
                                if ($scope.dataSource) {
                                    var params = {
                                        dataSource: $scope.dataSource,
                                        dimensionName: $scope.dimensionName
                                    };
                                    menuService.setDataSource(params).then(function () {
                                        window.location.href = 'dataSource?r=' + new Date().getTime();
                                    });
                                    $scope.closeThisDialog();
                                }

                            };
                        }
                    });
                });
            };

            // 获取未读通话数量
            $scope.getUnReadCallCount = function () {
                topicService.getUnReadCallCount({
                    beginDate: $scope.systemDate,
                    endDate: $scope.systemDate
                }).then(function (result) {
                    $scope.unReadCount = result.value || 0;
                });
            };

            // 跳转到消息推送页面
            $scope.gotofocusPush = function () {
                $state.go('main.analysis.focusPush', {
                    reload: true
                });
            };

            // 监听消息数量
            $scope.$on('data-unreadcount', function (e, d) {
                $scope.unReadCount = d.unReadCount;
            });

            // 监听关键词查看更多页面弹窗
            $scope.$on('bubble-more', function (event, data) {
                $scope.bubbleShow = !$scope.bubbleShow;
                $scope.bubbleItem = data.item;
                $scope.bubbleId = data.callId;

            });

            $scope.getMenu();
            $scope.banBackSpace = function (e) {
                var ev = e || window.event;
                // 各种浏览器下获取事件对象
                var obj = ev.relatedTarget || ev.srcElement || ev.target || ev.currentTarget;
                // 按下Backspace键
                if (ev.keyCode == 8) {
                    var tagName = obj.nodeName; // 标签名称
                    // 如果标签不是input或者textarea则阻止Backspace
                    if (tagName != 'INPUT' && tagName != 'TEXTAREA' && tagName != 'DIV') {
                        return $scope.stopIt(ev);
                    }

                    /* var tagType = obj.type.toUpperCase();//标签类型
                     //input标签除了下面几种类型，全部阻止Backspace
                     if(tagName=='INPUT' && (tagType!='TEXT' && tagType!='TEXTAREA' && tagType!='PASSWORD')){
                         return $scope.stopIt(ev);
                     }*/

                    /*if(tagName =='DIV' && obj.contentEditable){
                        return $scope.stopIt(ev);
                    }*/
                    // input或者textarea输入框如果不可编辑则阻止Backspace
                    if ((tagName == 'INPUT' || tagName == 'TEXTAREA' || tagName == 'DIV') && (obj.readOnly == true || obj.disabled == true || obj.contentEditable == 'false')) {
                        return $scope.stopIt(ev);
                    }
                }

            };
            $scope.stopIt = function (ev) {
                if (ev.preventDefault) {
                    // preventDefault()方法阻止元素发生默认的行为
                    ev.preventDefault();
                }

                if (ev.returnValue) {
                    // IE浏览器下用window.event.returnValue = false;实现阻止元素发生默认的行为
                    ev.returnValue = false;
                }

                return false;
            };

            $(function () {
                // 实现对字符码的截获，keypress中屏蔽了这些功能按键
                document.onkeypress = $scope.banBackSpace;
                // 对功能按键的获取
                document.onkeydown = $scope.banBackSpace;
            });
        }
    ]);
});
