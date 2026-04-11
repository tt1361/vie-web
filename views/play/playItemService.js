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
    app.service('playItemService', ['$http', '$q', function ($http, $q) {

        return {

            /*特殊字符正在表达式*/
            textReplace: new RegExp('[`~!@#$%^&*()=|{}\':;\',\\[\\].<>/?~！@#￥……&*（）——|{}【】‘；：”“\'。，、？]'),

            /*获取关键词模型信息*/
            fetchAudioKeyWord: function (params) {
                var token = localStorage.getItem('h5-token')
                if (token) {
                    params.token = token
                }
                return $http.post('player/queryAudioKeyWord', params)
                    .then(function (response) {
                        if (response.status === 200 && response.data.success) {
                            return response.data;
                        } else if (response.status === 200 && !response.data.success && response.data.flag == 1) {
                            window.location.href = 'logout'
                        }

                        return $q.reject(response);
                    });
            },

            /*保存维度*/
            saveSelectDimension: function (params) {
                return $http.post('dimension/saveSelectDimension', params)
                    .then(function (response) {
                        if (response.status === 200 && response.data.success) {
                            return true;
                        }

                        return false;
                    });
            },

            /*获取上次选择的自定义维度*/
            getAllZdyDim: function (params) {
                return $http.post('dimension/getTelephonDimension', params)
                    .then(function (response) {
                        if (response.status === 200 && response.data.success) {
                            return response.data;
                        }

                        return false;
                    });
            },

            /*获取全部维度信息*/
            getMulselDimension: function (params) {
                return $http.post('dimension/getMulselDimension', params)
                    .then(function (response) {
                        if (response.status === 200 && response.data.success) {
                            return response.data;
                        }

                        return $q.reject(response);
                    });
            },

            /*保存操作*/
            addSelectDimensionToES: function (params) {
                return $http.post('dimension/addSelectDimensionToEs', params)
                    .then(function (response) {
                        if (response.status === 200 && response.data.success) {
                            return true;
                        }

                        return false;
                    });
            }

        };
    }
    ]);

});
