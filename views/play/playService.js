angular.module('playService', [])
    .service('dataTaken', ['$http', '$q', function ($http, $q) { // 你通过这个文件 去 那个js文件里面找 相对应的方法就可以了
        return {

            /*获取录音信息*/
            getVoiceList: function (params) {
                var token = localStorage.getItem('h5-token')
                if (token) {
                    params.token = token
                }
                return $http.post('player/getVoiceList', params)
                    .then(function (response) {
                        if (response.status === 200 && response.data.success) {
                            return response.data;
                        } else if (response.status === 200 && !response.data.success && response.data.flag == 1) {
                            window.location.href = 'logout'
                        }

                        return $q.reject(response);
                    });
            },

            /*获取音频声道*/
            getWavFormat: function (params) {
                var token = localStorage.getItem('h5-token')
                if (token) {
                    params.token = token
                }
                return $http.post('player/getWavFormat', params)
                    .then(function (response) {
                        if (response.status === 200 && response.data.success) {
                            return response.data;
                        } else if (response.status === 200 && !response.data.success && response.data.flag == 1) {
                            window.location.href = 'logout'
                        }

                        return $q.reject(response);
                    });
            },

            /*获取播放参数*/
            fetchSpeechInfo: function (params) {
                var token = localStorage.getItem('h5-token')
                if (token) {
                    params.token = token
                }
                return $http.post('player/getSpeechInfo', params)
                    .then(function (response) {
                        if (response.status === 200 && response.data.success) {
                            return response.data;
                        } else if (response.status === 200 && !response.data.success && response.data.flag == 1) {
                            window.location.href = 'logout'
                        }

                        return $q.reject(response);
                    });
            },

            /*获取文本*/
            getContent: function (params) {
                var token = localStorage.getItem('h5-token')
                if (token) {
                    params.token = token
                }
                return $http.post('player/queryFullAudioInfo', params)
                    .then(function (response) {
                        if (response.status === 200 && response.data.success) {
                            return response.data;
                        } else if (response.status === 200 && !response.data.success && response.data.flag == 1) {
                            window.location.href = 'logout'
                        }

                        return $q.reject(response);
                    });
            },

            /*获取任务下面的所有通话信息*/
            getDetailsOfTask: function (params) {
                return $http.post('player/getDetailsOfTask', params)
                    .then(function (response) {
                        if (response.status === 200 && response.data.success) {
                            return response.data;
                        }

                        return $q.reject(response);
                    });
            }
        };
    }
    ]);
