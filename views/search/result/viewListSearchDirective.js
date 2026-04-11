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
    *  reportGroupCtrl 实现报表管理  分组区域的逻辑
    *   @params:
    *       $http:  http请求服务Service
    *       $scope: $scope, 作用域Service
    *
    */
    app.directive('viewListSearch', ['ngDialog', 'searchService', '$rootScope','CONSTANT','$rootScope','$http', function(ngDialog, searchService, $rootScope,CONSTANT,$rootScope,$http){
        return {
            restrict: 'EA',
            replace: true,
            templateUrl: 'search/result/view-list-search-directive.htm',
            scope: {
                columns: '='
            },
            link: function($scope, element, attrs){
                //获取浏览器信息
                $scope.browser = $rootScope.getBowerserInfo();
                //$rootScope.isTask 为0按照录音 1按照任务 
                //$rootScope.isTask = '0';
                //$rootScope.isTask = 1;
                //$scope.showIsByTaskIdParams = $rootScope.isTask;
                //列表分页参数
                $scope.pageOptions = {
                    pageNum: 1,
                    pageSize: 15
                }

                //初始化展开也参数
                $scope.pageOptionsOfVoiceList = {
                     pageNum: 1,
                    pageSize: 10
                }
                //初始化排序参数类型
                if($rootScope.isTask && ($rootScope.isTask == '1'|| $rootScope.isTask == 1)){
                    $scope.btnUp = 'voiceId';
                    $scope.showIsByTaskId = true;
                }else{
                    $scope.btnUp = 'id';
                    $scope.showIsByTaskId = false;
                }
                
                $rootScope.pageNum = $scope.pageOptions.pageNum;
                $rootScope.num = $scope.pageOptions.pageNum
                
                //初始化排序参数
                // if($rootScope.isTask && $rootScope.isTask == '1'){
                //     $scope.sortParams = {
                //         sortColumn: 'id',
                //         sortType: 'asc'
                //     }
                // }else{
                    $scope.sortParams = {
                        sortColumn: 'id',
                        sortType: 'asc'
                    }
                // }
                
                /**
                    根据任务分析初始化，默认不展开
                    @author 吴彬彬

                */
                $scope.init = function(){
                    $scope.showDetail = false;
                    $scope.mark = true;
                    $scope.mark1 = false;
                }

                $scope.init();
                
                //排序
                $scope.remarkSort = function(order, orderType) {
                    if (orderType == 'asc') {
                        $scope.btnUp = order;
                        $scope.btnDown = '';
                    } else {
                        $scope.btnUp = '';
                        $scope.btnDown = order;
                    }

                    $scope.sortParams = {
                        sortColumn: order,
                        sortType: orderType
                    }
                    $scope.pageOptions.pageNum = 1;
                    $scope.getSearchListResult();
                };

                //监听
                $scope.$on('viewListResult', function(event, data){
                    $scope.pageOptions.pageNum = 1;
                    $scope.getSearchListResult();
                });

                //搜索列表
                $scope.getSearchListResult = function(params){
                    var preParams =  $scope.$parent.preSearchResult();
                    if(preParams === false) return;
                    params = $.extend(true, {searchDimension: JSON.stringify($scope.columns)}, preParams, $scope.pageOptions, $scope.sortParams);
                    searchService.getTableSearchResult(params)
                        .then(function(result){
                            $scope.searchListResult = result.value.rows || [];
                            $scope.counts = result.value.total || 0;
                            $scope.$parent.$parent.allRec = Number(result.value.allRec) || 0;
                            $scope.$parent.$parent.total = result.value.total || 0;
                            $scope.searchListHead = result.value.columns || [];
                            $rootScope.maxExportNum = result.value.maxExportNum || [];
                    });
                    $rootScope.importDimension = JSON.stringify($scope.columns)|| [];
                    if($rootScope.pageNum !== $rootScope.num){
                        $scope.mark = true;
                        $scope.voi = $rootScope.voi;
                    }
                }

            
                $scope.voi = ''; //初始化要查询的任务号为''
                
                /**
                    根据任务id匹配录音
                    @author wubinbin
                    params  e任务id
                */
               $scope.showDetailsByTaskId = function(e){
                    $scope.mark1 = false;
                    if($scope.voi !== e){
                        $scope.findVoicesById(e);
                        $scope.voi = e;
                        $scope.mark1 = true;
                    }else{
                        $scope.voi = '';
                        $scope.mark1 = false;
                    }   
               }

               
               $scope.voiceCallListBody = []; //body内容
               $scope.voiceCallListHead = []; // 头部内容

               /**
                  根据任务id匹配录音方法请求
                  @author wubinbin  
                  params e 任务id
                         d 分页参数
               */
               $scope.findVoicesById = function(e,d){
                    //获取展示的参数
                    $scope.searchDim = '';
                    var i = 0;
                    if($scope.searchListHead){
                        angular.forEach($scope.searchListHead,function(e,d){
                            if(e.column === 'id'){
                                $scope.searchDim += 'voiceId';
                            }else{
                                $scope.searchDim = $scope.searchDim + e.column;
                            }  
                            if(i!=$scope.searchListHead.length-1){
                                $scope.searchDim+=',';
                            }
                            i++;
                        })
                    }
                    if(d){
                       $scope.pageOptionsOfVoiceList = d; 
                    }
                    //合并单元格数量
                    $scope.colSpanNum = $scope.searchListHead.length+1+'';
                    var params = {id:e,
                                  searchDimension:$scope.searchDim,
                                  pageNum:$scope.pageOptionsOfVoiceList.pageNum,
                                  pageSize:$scope.pageOptionsOfVoiceList.pageSize
                                 // sortColumn:'voiceId',
                                  //sortType:'asc'};
                               };
                    $scope.paramsOfDimChanged = params; //作用于维度改变时
                    $http.post('callFilter/queryVoiceCallList',$scope.paramsOfDimChanged).success(function(e){
                        if(e && e.value){
                            if(e.value.columns){
                                $scope.voiceCallListHead = e.value.columns;
                            }
                            if(e.value.rows){
                                $scope.voiceCallListBody = e.value.rows;
                            }
                            if(e.value.total){
                                 $scope.voiceCallListTotal = e.value.total;
                            }
                        }
                    })
               }

                //维度选择
                $scope.setDimension = function(){
                    $scope.from = "searchList";
                    ngDialog.open({
                        template: 'analysis/detail/dimension-libs-directive.htm',
                        controller: 'dimensionLibsCtrl',
                        scope: $scope,
                        showClose: false,
                        closeByEscape: false,
                        closeByDocument: false,
                        disableAnimation: true,
                        className: 'ngdialog-theme-default ngdialog-theme-model-push'
                    }).closePromise.then(function(dialog){
                        // 当弹出层关闭后，自动更新 维度对象
                        if(angular.isUndefined(dialog.value) || dialog.value == '$document') return;
                        $scope.columns = [];
                        angular.forEach(dialog.value.pushDim, function(item){
                            if(item.key != 'taskId'){
                                $scope.columns.push({
                                column: item.key,
                                columnName: item.name
                             });
                            }
                        });
                        $scope.pageOptions.pageNum = 1;
                        $scope.getSearchListResult();

                    });
                    //维度选择时流水号信息收起
                    $scope.voi = '';
                    $scope.mark1 = false;
                    
                }

                //测听标记
                $scope.markListView = function(item){
                    $("#search-item-id_"+item.voiceId).addClass("visited");
                    return true;
                }

                //点击模型查询
                $scope.showModelDialog = function(item,e){
                    $scope.parentId = null;
                    $scope.nowItem = item;
                    if(e){
                        $scope.parentId = e;
                    }
                    
                    ngDialog.open({
                        template: 'search/model-keyword-directive.htm',
                        controller: 'modelKeywordCtrl',
                        scope: $scope,
                        showClose: true,
                        closeByEscape: false,
                        closeByDocument: false,
                        disableAnimation: true,
                        className: 'ngdialog-theme-default ngdialog-theme-model-keyword'
                    });
                }

            }
        }
    }]);

});