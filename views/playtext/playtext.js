var app = angular.module('playtext', ['playtextService', 'ngDialog']);
app.controller('playtextCtrl', [
    '$scope',
    '$http',
    '$location',
    '$sce',
    '$window',
    '$compile',
    '$document',
    '$timeout',
    '$q',
    'dataTaken',
    '$anchorScroll',
    '$rootScope',
    'ngDialog', function ($scope, $http, $location, $sce, $window, $compile, $document, $timeout, $q, dataTaken, $anchorScroll, $rootScope, ngDialog) {

        /*定义变量*/
        $scope.taskID = $location.search().taskId || '';
        $scope.voiceId = $location.search().voiceId || '';
        $scope.showIsByTaskId = $scope.taskID || '';
        $scope.index = 1;

        /*总时长与当前进度时长*/
        $scope.totalTime = 0;
        $scope.totalTime1 = 0;
        $scope.barTime = 0;

        /*详情是否展开*/
        $scope.detailOpen = false;

        /*用于展示的详情*/
        $scope.detailName = [];

        /*用于接受所有详情*/
        $scope.rowsName = [];

        /*是否静音*/
        $scope.muted = false;

        /*是否显示通话列表*/
        $scope.isShowList = false;

        /*完成事件被调的次数*/
        $scope.completeIndex = 1;

        /*判断是否已经播放过此条录音*/
        $scope.playedVoiceIdList = [];

        /*定义*/
        var gramControl = null;
        var ns = null;
        var servicePath = '/VIEWEB/';

        /*播放状态变化回调事件*/
        var playbackStatusChanged = function (gramControl) {
            // TO DO
            // updateToolbarPlayState();
        };

        /*获取测听语音列表*/
        $scope.getVoiceList = function () {
            if ($scope.showIsByTaskId) {
                var params = {
                    callId: $scope.taskID
                };
            }
            else {
                var params = {
                    callId: $scope.voiceId
                };
            }
            dataTaken.getVoiceList(params).then(function (result) {
                $scope.voiceList = result.value.rows || [];
                if (!$scope.showIsByTaskId) {
                    $scope.totalTime = (result.value.rows[0].duration); // 获取通话时长
                    $scope.totalTime1 = Number(($scope.totalTime / 1000).toFixed(3)); // 用于判断结束时间
                    $scope.totalTime2 = Math.round($scope.totalTime / 1000); // 用于展示时间
                }
                $scope.rowsName = result.value.rowsName || [];
                $scope.callID = $scope.voiceList.length ? $scope.voiceList[0].id : null;
            });
        };

        /*监听模型*/
        $scope.$on('afterModel', function (event, data) {
            var models = data.models;
            $scope.pContent = [];
            angular.forEach($scope.models, function (model) {
                angular.forEach(model.ruleInfo, function (item) {
                    if ($scope.pContent.indexOf(item.content) === -1) {
                        $scope.pContent.push(item.content);
                    }

                });

                /*遍历所有A标签*/
                $('.content').each(function () {
                    var contentext = $(this).text();
                    for (var i = 0; i < $scope.pContent.length; i++) {
                        if (contentext.indexOf($scope.pContent[i]) != -1) {
                            $(this).attr({
                                style: 'color:rgb(138, 43, 226)'
                            });
                        }

                    }
                });
            });
        });

        /*字滚动事件*/
        var wordRoll = function (position) {
            var playback = gramControl.playback;
            var playbackState = voiceGram.enums.PlaybackState;
            var position = playback.getState() == playbackState.stopped ? gramControl.gramCursor.getPosition() : gramControl.playbackCursor.getPosition();
            $scope.barTime = Math.round(position * 1000);
            $('#barTime').html(Math.round($scope.barTime / 1000));

            /*遍历所有A标签*/
            $('.content_' + $scope.voiceId).each(function () {
                var endtimes = $(this).attr('id');
                var n = endtimes.indexOf('_');
                var endtime = endtimes.substring(n + 1);
                // 模型关键字不变色
                if ($('#' + endtimes + '').css('color') != 'rgb(138, 43, 226)') {
                    // 搜索结果不变色
                    if ($('#' + endtimes + '').css('color') != 'rgb(7, 139, 54)') {
                        if ( (endtime < parseFloat(position) * 1000) ) {
                            $('#' + endtimes + '').attr({
                                style: 'color:red'
                            });
                            $scope.id = '#' + endtimes + '';
                            scrollTop(endtimes, HeightAuto);
                        }
                        else {
                            $('#' + endtimes + '').attr({
                                style: 'color:#000'
                            });
                        }
                    }
                }

            });
        };

        /*找到子元素在父元素中的相对位置*/
        function getElementTop(element) {
            var el = (typeof element == 'string') ? document.getElementById(element) : element;

            if (el != null) {
                if (el.parentNode === null || el.style.display == 'none') {
                    return false;
                }

                return el.offsetTop - el.parentNode.offsetTop;
            }
        }
        var HeightAuto = 360;
        function scrollTop(endtime, Height) {
            if (getElementTop(endtime) >= Height) {
                document.getElementById('play-content-text').scrollTop = document.getElementById('play-content-text').scrollTop + 30;
                HeightAuto = getElementTop(endtime) + $('#' + endtime + '').height();
            }
        }

        /*获取文本*/
        var idS = [];
        $scope.getContent = function () {
            if ($scope.showIsByTaskId) {
                var params = {
                    callId: $scope.taskID
                };
            }
            else {
                var params = {
                    callId: $scope.voiceId
                };
            }
            dataTaken.getContent(params).then(function (result) {
                var value = result.value;
                dataValue = result.value;
                angular.forEach(value, function (value) {
                    if ($scope.showIsByTaskId) {
                        var voiceId = value[0].childVoiceId;
                    }
                    else {
                        var voiceId = $scope.voiceId;
                    }
                    var tpl = '<fieldset style=\'border:1px dashed #07b2b1;margin-bottom: 15px;\' class=\'' + voiceId + '\'><legend style=\'margin: 0 40px;\'><h3>流水号：' + voiceId + '</h3></legend><div id =' + voiceId + ' class=\'play-content-text-1\'>';
                    $.each(value, function (key, value) {
                        var times = value.time.split(' ');
                        var contents = value.content.split(' ');
                        if (contents.length > 0) {
                            for (var i = 0; i < contents.length; i++) {
                                var setime = times[i].split(',');
                                var starttime = setime[0] / 1000;
                                var endtime = setime[1] / 1000;
                                idS.push(setime[0]);
                                if (contents[i].length > 1) {
                                    if (i == 0) {
                                        tpl += '<a href=\'javascript:void(0)\' style=\'color: #000\' class=\'content content_' + voiceId + '\'  id=\'' + voiceId + '_' + setime[0] + '\' ng-click = setSelection1(' + starttime + ',' + endtime + ',' + '\'' + voiceId + '\'' + ')>' + value.channel + '&nbsp;&nbsp;' + contents[i] + '&nbsp;' + '</a>';
                                    }
                                    else {
                                        tpl += '<a href=\'javascript:void(0)\' style=\'color: #000\' class=\'content content_' + voiceId + '\'  id=\'' + voiceId + '_' + setime[0] + '\' ng-click = setSelection1(' + starttime + ',' + endtime + ',' + '\'' + voiceId + '\'' + ')>' + contents[i] + '&nbsp;' + '</a>';
                                    }
                                }
                                else {
                                    if (i == 0) {
                                        tpl += '<a style=\'color: #000\' class=\'content content_' + voiceId + '\'  id=\'' + voiceId + '_' + setime[0] + '\'>' + value.channel + '&nbsp;&nbsp;' + contents[i] + '&nbsp;' + '</a>';
                                    }
                                    else {
                                        tpl += '<a style=\'color: #000\' class=\'content content_' + voiceId + '\'  id=\'' + voiceId + '_' + setime[0] + '\'>' + contents[i] + '&nbsp;' + '</a>';
                                    }
                                }
                            }
                            tpl += '<br/>';
                        }

                    });
                    tpl += '</div></fieldset>';
                    var el = $compile(tpl)($scope);
                    $('#play-content-text').append(el);
                });
            });
        };

        /*获取需要的开始时间点id*/
        $scope.getTargetId = function (starttime) { // starttime统一为s
            var idsNew = []; // 设置一个符合条件的数组
            angular.forEach(idS, function (id) {
                if (id >= starttime) {
                    idsNew.push(id);
                    return;
                }

            });
            return idsNew[0];
        };

        /*排序*/
        function sortNumber(a, b) {
            return a - b;
        }

        var round = function (v, e) {
            var t = 1;
            for (; e > 0; t *= 10, e--) {
                
            }
            for (; e < 0; t /= 10, e++) {
                
            }
            return Math.round(v * t) / t;
        };

        /*设置锚点跳转定位*/
        $scope.goto = function (id) {
            $location.hash(id);
            $anchorScroll();
            HeightAuto = 360;
        };

        $scope.$on('listenMsg', function (event, data) {
            $scope.$broadcast('showErrorMsgEvent', {
                msg: data.msg
            });
        });

        /*初始化*/
        var initFunction = function () {
            $scope.getVoiceList();
            $scope.getContent();
            // if($scope.showIsByTaskId){
            //     $scope.getDetailsOfTask();
            // }else{
            //     $scope.fetchSpeechInfo();
            // };
        };

        initFunction();

        /*获取工单模型的维度*/
        $scope.setDimension = function () {
            ngDialog.open({
                template: 'playtext/playtext-dimension-libs-directive.htm',
                controller: 'playtextDimensionLibsCtrl',
                scope: $scope,
                showClose: false,
                closeByEscape: false,
                closeByDocument: true,
                disableAnimation: true,
                className: 'ngdialog-theme-default ngdialog-theme-model-push'
            }).closePromise.then(function (dialog) {});
        };

    }]);

app.controller('playtextDimensionLibsCtrl', [
    '$http',
    '$scope',
    '$document',
    '$timeout',
    '$rootScope',
    'dataTaken', function ($http, $scope, $document, $timeout, $rootScope, dataTaken) {
        $timeout(function () {
            $document.find('input').placeholder();
        }, 500);
        $scope.defaultFilter = '';
        $scope.allChecked = true; // 默认全选
        $scope.isTask = $rootScope.isTask;
        if ($scope.isTask === 1 || $scope.isTask === '1') {
            $scope.defaultFilter = 'taskId,duration';
            $scope.defaultColumn = [{
                key: 'taskId',
                name: '任务号'
            }, {
                key: 'duration',
                name: '通话时长（秒）'
            }];
        }
        else {
            $scope.defaultFilter = 'voiceId,duration';
            $scope.defaultColumn = [{
                key: 'voiceId',
                name: '录音编号'
            }, {
                key: 'duration',
                name: '通话时长（秒）'
            }];
        }
        // 需要保存的维度
        $scope.addDimensions = [];
        // 保存获取的维度传给父级
        $scope.selCallListCulumns = [];
        $scope.checkSearch = false;
        // 获取全部维度信息
        $scope.searchDim = function () {

            $http.post('gdjm/searchDim', {}).success(function (result) {
                console.log(result);
                return;
                $scope.voiceList = result.rows || [];
                $scope.rowsName = result.rowsName || [];
                $scope.callID = $scope.voiceList.length ? $scope.voiceList[0].id : null;
                $scope.spliceDetailName();
                $scope.fetchAudioKeyWord($scope.callID);
            });

            /*获取工单建模的维度*/
            dataTaken.searchDim().then(function (result) {
                //     console.log(result);
                // })

                // var params;
                // if (!baseService.validWord($scope.keyword)) return;
                // if ($scope.tim === 1) {
                //     params = {keyword: '', reportTypeFlag: 1};
                // } else {
                //     params = {keyword: ''}
                // }
                // dimensionService.searchDim(params)
                // .then(function (result) {

                $scope.allDimensions = result.value || [];
                $scope.dimensions = [];
                // 通话列表展示维度
                if ($scope.$parent.from) {
                    if ($scope.$parent.from != 'callList' && $scope.$parent.from != 'previewList') {
                        if ($scope.keyword && '关键词'.indexOf($scope.keyword) > -1) {
                            $scope.dimensions.push({
                                key: 'keyword',
                                name: '关键词',
                                checked: true,
                                isSelect: true,
                                search: true
                            });
                        }
                        else {
                            $scope.dimensions.push({
                                key: 'keyword',
                                name: '关键词',
                                checked: true,
                                isSelect: true
                            });
                        }
                    }

                    if ($scope.$parent.from === 'previewList') {
                        if ($scope.keyword && '匹配规则'.indexOf($scope.keyword) > -1) {
                            $scope.dimensions.push({
                                key: 'keyword',
                                name: '匹配规则',
                                checked: true,
                                isSelect: true,
                                search: true
                            });
                        }
                        else {
                            $scope.dimensions.push({
                                key: 'keyword',
                                name: '匹配规则',
                                checked: true,
                                isSelect: true
                            });
                        }
                    }

                    angular.forEach($scope.allDimensions, function (item) {
                        var search = false;
                        if ($scope.keyword && item.name.indexOf($scope.keyword) > -1) {
                            search = true;
                        }

                        if ((item.key === 'id' || item.key === 'voiceId' || item.key === 'duration' || item.key === 'taskId') ||
                            ($scope.$parent.from === 'searchList' && item.key === 'timeFormat')) {
                            var name = item.name;
                            if ($scope.$parent.from === 'previewList' && (item.key === 'id' || item.key === 'voiceId')) {
                                name = '录音流水号';
                            }
                            else if (($scope.$parent.from === 'previewList' || $scope.$parent.from === 'callList') && item.key === 'duration') {
                                name = '通话时长(秒)';
                            }
                            else if ($scope.$parent.from === 'callList' && (item.key === 'id' || item.key === 'voiceId')) {
                                name = '录音编号';
                            }

                            $scope.dimensions.push({
                                key: item.key,
                                name: name,
                                checked: true,
                                isSelect: true,
                                search: search
                            });
                        }
                        else {
                            var checked = false;
                            $.each($scope.$parent.columns, function (index, column) {
                                if (column.column === item.key) {
                                    checked = true;
                                    return false;
                                }

                            });
                            $scope.dimensions.push({
                                key: item.key,
                                name: item.name,
                                checked: checked,
                                search: search
                            });
                        }
                    });

                    /* if判断是否是进行搜索，搜索的时候不发送用户绑定维度的请求 */
                    if (!$scope.checkSearch) {
                        // if ($scope.$parent.tool && $scope.$parent.tool === 'basis') {
                        //     dimensionService.queryDimensions({listType: 5}).then(function (data) {
                        //         if (data.value !== null) {
                        //             var selDims = data.value.split(',');
                        //         }
                        //         angular.forEach($scope.dimensions, function (dim, index) {
                        //             angular.forEach(selDims, function (selDim, index) {
                        //                 if (dim.key === selDim) {
                        //                     dim.checked = true;
                        //                     $scope.selCallListCulumns.push({
                        //                         column: dim.key,
                        //                         columnName: dim.name
                        //                     })
                        //                 }

                        //             })
                        //         })
                        //     })

                        // }

                        // // 石勇 新增 模型模块通话列表的维度与用户绑定问题
                        // if ($scope.$parent.tool && $scope.$parent.tool === 'modelCallList') {
                        //     dimensionService.queryDimensions({listType: 6}).then(function (data) {
                        //         if (data.value !== null) {
                        //             var ModelDims = data.value.split(',');
                        //         }
                        //         angular.forEach($scope.dimensions, function (dim, index) {
                        //             angular.forEach(ModelDims, function (ModelDim, index) {
                        //                 if (dim.key === ModelDim) {
                        //                     dim.checked = true;
                        //                     $scope.selCallListCulumns.push({
                        //                         column: dim.key,
                        //                         columnName: dim.name
                        //                     })
                        //                 }

                        //             })
                        //         })
                        //     })

                        // }
                        // 
                    }
                }
                else {
                    $scope.dimensions = $scope.allDimensions;

                    // 导入维度检测是否有已经选中的维度
                    angular.forEach($scope.dimensions, function (item) {
                        angular.forEach($scope.$parent.preDimensions, function (dimension) {
                            if (item.key === dimension.key) {
                                item.checked = true;
                            }

                        });

                        if ($scope.keyword && item.name.indexOf($scope.keyword) > -1) {
                            item.search = true;
                        }

                    });

                    // 柱状图检测x是否有已经选中的维度
                    angular.forEach($scope.dimensions, function (item) {
                        angular.forEach($scope.$parent.xSelectList, function (dimension) {
                            if (item.key === dimension.key) {
                                item.checked = true;
                                // item.isSelect = true;
                            }

                        });

                        if ($scope.$parent.xSelected && item.name === $scope.$parent.xSelected) {
                            item.isSelect = true;
                        }

                        if ($scope.keyword && item.name.indexOf($scope.keyword) > -1) {
                            item.search = true;
                        }

                    });
                }

                angular.forEach($scope.dimensions, function (item) {
                    if (!item.checked) {
                        $scope.allChecked = false;
                    }

                });
            });

        };

        /**
         * @brief 选择关键词显示
         * @details [long description]
         *
         * @param  [description]
         * @return [description]
         */
        $scope.chooseKeyWord = function (name) {
            var search = false;
            if ($scope.keyword && name.indexOf($scope.keyword) > -1) {
                search = true;
                $scope.dimensions.push($scope.contItem('keyword', name, true));
            }

            $scope.dimensions.push($scope.contItem('keyword', name, search));
        };

        /**
         * @brief 组合对象
         * @details [long description]
         *
         * @param e [description]
         * @param h [description]
         *
         * @return [description]
         */
        $scope.contItem = function (key, name, isSearch) {
            var item = {
                key: key,
                name: name,
                checked: true,
                isSelect: true,
                search: isSearch
            };
            return item;
        };

        /**
         * 搜索框监听Enter键
         *
         */
        $scope.enterKey = function (event) {
            event = event || window.event;
            if (event.keyCode == 13) {
                $scope.checkSearch = true;
                $scope.searchDim();
            }

        };
        $scope.searchDimFont = function () {
            $scope.checkSearch = true;
            // angular.forEach($scope.dimensions, function(dim){
            //     dim.search = false;
            // });
            // angular.forEach($scope.dimensions, function(item){
            //     if($scope.keyword && item.name.indexOf($scope.keyword)>-1){
            //         item.search = true;
            //     }
            // });
            $scope.searchDim();
        };

        // 全选按钮
        $scope.toggleAllChecked = function () {
            $scope.allChecked = !$scope.allChecked;
            if ($scope.allChecked) {
                angular.forEach($scope.dimensions, function (item) {
                    item.checked = true;
                });
                return;
            }

            angular.forEach($scope.dimensions, function (item) {
                if ($scope.$parent.from) {
                    if ($scope.$parent.from === 'searchList') {
                        if (item.key != 'id' && item.key != 'voiceId' && item.key != 'duration' && item.key != 'keyword' && item.key != 'timeFormat') {
                            item.checked = false;
                        }
                    }
                    else {
                        if (item.key != 'id' && item.key != 'voiceId' && item.key != 'duration' && item.key != 'keyword') {
                            item.checked = false;
                        }
                    }
                }
                else {
                    item.checked = false;
                }

                // 石勇 新增 默认不可勾选的在全选的时候不会消失  previewList
                if ($scope.$parent.xSelected && item.name === $scope.$parent.xSelected) {
                    item.checked = true;
                }

                // 石勇 添加一个例外“任务号”
                // $scope.$parent.xSelected对应的是之前的输入框的值
                // 如果他的值为undefined，也就是说它的前面是不存在输入框的，这个时候默认勾选任务号
                if (item.key == 'taskId') {
                    if (angular.isUndefined($scope.$parent.xSelected)) {
                        // 对模型中增加筛选条件时再次进行判断
                        if (angular.isUndefined($scope.$parent.status)) {
                            item.checked = true;
                        }
                    }
                }

            });

        };

        // 维度保存按钮
        $scope.pushedDimension = function () {
            var result = {
                pushDim: [],
                dimeName: []
            };
            if ($scope.$parent.from) {
                if ($scope.$parent.from === 'searchList') {
                    angular.forEach($scope.dimensions, function (item) {
                        if (item.key != 'id' && item.key != 'voiceId' && item.key != 'duration' && item.key != 'keyword' && item.key != 'timeFormat'
                            && item.checked) {
                            result.pushDim.push(item);
                            result.dimeName.push(item.key);
                        }

                    });
                }
                else {
                    angular.forEach($scope.dimensions, function (item) {
                        if (item.key != 'id' && item.key != 'voiceId' && item.key != 'duration' && item.key != 'keyword' && item.key != 'taskId'
                            && item.checked) {
                            result.pushDim.push(item);
                            result.dimeName.push(item.key);
                        }

                    });
                }
            }
            else {
                angular.forEach($scope.dimensions, function (item) {
                    if (item.checked) {
                        result.pushDim.push(item);
                        result.dimeName.push(item.key);
                    }

                });
            }

            var filter;
            if (result.dimeName.length != 0) {
                filter = $scope.defaultFilter + ',' + result.dimeName.join(',');
            }
            else {
                filter = $scope.defaultFilter;
            }
            // 石勇 保存维度时判断是否是模型模块的
            // if ($scope.$parent.tool && $scope.$parent.tool === 'modelCallList') {
            //     dimensionService.saveFiltersOrDimension({
            //         //userId: $rootScope.userId,
            //         'filterType': 0,
            //         'listType': 6,
            //         "filter": filter
            //     });
            //     angular.forEach(result.pushDim, function (pushDim, index, arr) {
            //         $scope.defaultColumn.push(pushDim);
            //     });
            //     // console.log($scope.defaultColumn);
            //     result.pushDim = $scope.defaultColumn;
            // }
            // 

            $scope.closeThisDialog(result);
        };

        $scope.$on('colResizable', function (ngRepeatFinishedEvent) {
            var scrollTo = $document.find('.redFont').first();
            var container = $('.push-model-content .content-wrap');
            if (scrollTo.length) {
                container.scrollTop(
                    scrollTo.offset().top - container.offset().top + container.scrollTop()
                );
            }

        });

        $scope.searchDim();

    }
]);
