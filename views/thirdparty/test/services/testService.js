angular.module('testService', [])
    .service('dataTaken', ['$http', '$q', function ($http, $q) {
        return {
            getVoiceList: function (params) {
                var token = localStorage.getItem('h5-token')
                if (token) {
                    params.token = token
                }
                return $http.post('../../player/getVoiceList.do', params)
                    .then(function (response) {
                        if (response.status === 200 && response.data.success) {
                            return response.data;
                        } else if (response.status === 200 && !response.data.success && response.data.flag == 1) {
                            window.location.href = 'logout'
                        }

                        return $q.reject(response);
                    });
            }
        };
    }
    ]);
