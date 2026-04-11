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
    app.directive('viewDetailSearch', ['searchService', '$rootScope', 'CONSTANT', function (searchService, $rootScope, CONSTANT) {
        return {
            restrict: 'EA',
            replace: true,
            templateUrl: 'search/result/view-detail-search-directive.htm',
            scope: {
                chanelItem: '=',
                searchKeyword: '='
            },
            link: function ($scope, element, attrs) {
                // 文本分页参数
                $scope.pageOptions = {
                    pageNum: 1,
                    pageSize: 10
                };

                // $rootScope.isTask 为0按照录音 1按照任务 
                // $rootScope.isTask = 1;

                // 监听
                $scope.$on('viewDetailResult', function (event, data) {
                    $scope.pageOptions.pageNum = 1;
                    $scope.getSearchResult();
                });

                /** 
                   去掉左边的空格
                   @author 吴彬彬 
                   params：s 传入的字符串
                */
                function trimLeft(s) {
                    if (s == null) {
                        return '';
                    }

                    var whitespace = new String(' \t\n\r');
                    var str = new String(s);
                    if (whitespace.indexOf(str.charAt(0)) != -1) {
                        var j = 0,
                            i = str.length;
                        while (j < i && whitespace.indexOf(str.charAt(j)) != -1) {
                            j++;
                        }
                        str = str.substring(j, i);
                    }

                    return str;
                }

                /** 
                   去掉右边的空格
                   @author 吴彬彬 
                   params：s 传入的字符串
                */
                function trimRight(s) {
                    if (s == null) {
                        return '';
                    }

                    var whitespace = new String(' \t\n\r');
                    var str = new String(s);
                    if (whitespace.indexOf(str.charAt(str.length - 1)) != -1) {
                        var i = str.length - 1;
                        while (i >= 0 && whitespace.indexOf(str.charAt(i)) != -1) {
                            i--;
                        }
                        str = str.substring(0, i + 1);
                    }

                    return str;
                }

                /** 
                   去掉右边的空格
                   @author 吴彬彬 
                   params：e 传入的字符串
                           d 指定的符号
                */
                function repalceMark(e, d) {
                    while (e.indexOf(d) != -1) {
                        e = e.replace(d, '');
                    }
                    e = trimLeft(e);
                    e = trimRight(e);
                    return e;
                }

                /** 
                   获取搜索结果文本
                   @author  
                */
                $scope.getSearchResult = function (params) {
                    if (CONSTANT.searchReplace.test($scope.searchKeyword)) {
                        return;
                    }

                    var preParams = $scope.$parent.$parent.preSearchResult();
                    params = $.extend(true, preParams, $scope.pageOptions);
                    var searchKeys = params.content;

                    /*石勇 新增 控制传参的时间*/
                    if (params.startTime.length > 20) {
                        params.startTime = params.startTime.substr(0, 19);
                        params.endTime = params.endTime.substr(0, 19);
                    }

                    searchService.getSearchResult(params)
                        .then(function (result) {
                            $scope.searchResult = result.value.rows || [];

                            // 按照任务查询 吴彬彬
                            if (searchKeys !== '' && $scope.searchResult.length && $scope.searchResult.length > 0 && ($rootScope.isTask == '1' || $rootScope.isTask == 1)) {
                                angular.forEach($scope.searchResult, function (im) {
                                    searchKeys = trimLeft(searchKeys);
                                    searchKeys = trimRight(searchKeys);
                                    var strs = searchKeys.split(' ');
                                    var indexArr = [];
                                    var i;
                                    var j;
                                    var k;
                                    var strArr;
                                    if (searchKeys.indexOf(' ') >= 0) { // 组合查询时 吴彬彬
                                        angular.forEach(strs, function (st) {
                                            if (st !== ' ' && st !== '') {
                                                if (st.indexOf('-') < 0) { // 组合的关键字中不存在"-"(不包含)
                                                    var st1 = st;
                                                    if (st.indexOf('"') >= 0) { // 组合关键字中存在'"'
                                                        st1 = repalceMark(st1, '"');
                                                    }

                                                    if (st.indexOf('(') >= 0) { // 去括号
                                                        st1 = repalceMark(st1, '(');
                                                    }

                                                    if (st.indexOf(')') >= 0) {
                                                        st1 = repalceMark(st1, ')');
                                                    }

                                                    if (st.indexOf('+') >= 0) { // 组合的关键字中含有"+"
                                                        st1 = repalceMark(st1, '+');
                                                    }

                                                    if (st1.indexOf('|') >= 0) {
                                                        var sts = st1.split('|');
                                                        angular.forEach(sts, function (s_t) {
                                                            i = im.content.substring(0, im.content.indexOf(s_t) + 1).lastIndexOf('客户');
                                                            j = im.content.substring(0, im.content.indexOf(s_t) + 1).lastIndexOf('坐席');
                                                            k = i > j ? i : j;
                                                            indexArr.push(k);
                                                        });
                                                    }
                                                    else {
                                                        st1 = trimLeft(st1);
                                                        st1 = trimRight(st1);
                                                        i = im.content.substring(0, im.content.indexOf(st1) + 1).lastIndexOf('客户');
                                                        j = im.content.substring(0, im.content.indexOf(st1) + 1).lastIndexOf('坐席');
                                                        k = i > j ? i : j;
                                                        indexArr.push(k);
                                                    }
                                                }
                                            }

                                        });
                                        var index = Math.max.apply(Math, indexArr);
                                        im.content = im.content.substr(index);
                                        indexArr = [];
                                    }
                                    else { // 单独查询不存在括号 吴彬彬
                                        if (searchKeys.indexOf('-') < 0) {
                                            if (searchKeys.indexOf('+') >= 0) {
                                                searchKeys = repalceMark(searchKeys, '+');
                                            }

                                            if (searchKeys.indexOf('"') >= 0) { // 关键字有双引号如"a"
                                                searchKeys = repalceMark(searchKeys, '"');
                                            }

                                            if (searchKeys.indexOf('(') >= 0) { // 左括号判断
                                                searchKeys = repalceMark(searchKeys, '(');
                                            }

                                            if (searchKeys.indexOf(')') >= 0) { // 右括号判断
                                                searchKeys = repalceMark(searchKeys, ')');
                                            }

                                            if (searchKeys.indexOf('|') < 0) { // 处理后的关键字中不存在'|'
                                                var index1 = im.content.substring(0, im.content.indexOf(searchKeys) + 1).lastIndexOf('客户');
                                                var index2 = im.content.substring(0, im.content.indexOf(searchKeys) + 1).lastIndexOf('坐席');
                                                var index3 = index1 > index2 ? index1 : index2;
                                                im.content = im.content.substr(index3);
                                            }
                                            else {
                                                strArr = searchKeys.split('|');
                                                angular.forEach(strArr, function (st_r) { // 处理后的关键字中不存在'|'

                                                    i = im.content.substring(0, im.content.indexOf(st_r) + 1).lastIndexOf('客户');
                                                    j = im.content.substring(0, im.content.indexOf(st_r) + 1).lastIndexOf('坐席');
                                                    k = i > j ? i : j;
                                                    indexArr.push(k);
                                                });
                                                var index = Math.max.apply(Math, indexArr);
                                                im.content = im.content.substr(index);
                                                indexArr = [];
                                            }
                                        }
                                    }

                                });
                            }

                            $scope.counts = result.value.total || 0;
                            $scope.$parent.$parent.allRec = Number(result.value.allRec) || 0;
                            $scope.$parent.$parent.total = result.value.total || 0;
                            $rootScope.maxExportNum = result.value.maxExportNum || [];
                        });
                };

            }
        };
    }]);

});
