/**
 * 第三方过滤
 *
 */
(function (factory) {
    if (typeof define === 'function' && !!define.amd) {
        define([
            'test'
        ], factory);
    }
    else {
        factory(window.test);
    }
})(function (test) {

    test.filter('celData', function () {
        return function (header, map) {
            return map[header];
        };
    }).filter('celDataPlay', function () {
        return function (header, map) {
            if (header === 'duration') {
                return Math.round(map[header] / 1000);
            }

            return map[header];
        };
    }).filter('findList', function () {
        return function (index, list) {
            return list[index];
        };
    }).filter('subData', function () {
        return function (content, length) {
            if (content.length > length) {
                return content.substring(0, length) + '...';
            }

            return content;
        };
    }).filter('getLength', function () {
        return function (list, length) {
            var lng = 0;
            var totalLength = 0;
            for (var item in list) {
                lng = item.length;
                totalLength = parseInt(totalLength, 10) + parseInt(lng, 10);
            }
            if (totalLength >= length) {
                return 'ell t-left';
            }

            return 'ell';
        };
    }).filter('subList', function () {
        return function (list, length) {
            if (list.length > length) {
                return list.slice(0, length);
            }

            return list;
        };
    }).filter('showKey', function () {
        return function (item) {
            var result = '';
            angular.forEach(item, function (item) {
                result = result + item.word + ' ';
            });
            return result;
        };
    }).filter('showKeyLength', function () {
        return function (list, length) {
            if (list.length > length) {
                return true;
            }

            return false;
        };
    }).filter('showModelKey', function () {
        return function (item) {
            var result = '';
            angular.forEach(item, function (item) {
                result = result + item + ' ';
            });
            return result;
        };
    }).filter('percentage', function () {
        return function (dividend, divisor) {
            var result = 0;
            if (divisor === 0) {
                result = 0;
            }
            else {
                result = Math.floor(dividend / divisor * 10000) / 100;
            }
            return result + '%';
        };
    }).filter('highlight', ['$sce', function ($sce) {
        return function (text, search, type, tag) {
            if (type === 'short') {
                var zi = 0;
                for (var i = text.length - 1; i >= 0; i--) {
                    if (/[^\x00-\xff]/igm.test(text[i])) {
                        zi++;
                    }

                }
                if (zi > 24) {
                    text = text.substring(0, 24) + '...';
                }
                else {
                    if (tag === 0) {
                        text = text.length > 36 ? text.substring(0, 36) + '...' : text;
                    }
                    else {
                        text = text.length > 30 ? text.substring(0, 30) + '...' : text;
                    }
                }
            }

            if (!search) {
                return $sce.trustAsHtml(text);
            }

            var pattern = new RegExp('["`~!@#$%^&*()=|{}\':;\',\\[\\].<>/?~！@#￥……&*（）——|{}【】‘；：”“\'。，、？\+\-]', 'g');
            // 过滤关键字中的特殊字符和连续空格
            search = search.replace(pattern, ' ').replace(/[\s　]{2,}/g, ' ');
            var searchs = search.split(' ');
            angular.forEach(searchs, function (item) {
                var htmlS = '<span class=\'redFont\'>';
                var htmlE = '</span>';
                var bLo = htmlS + item.toLowerCase() + htmlE; // 用于把字符串转换成小写
                var bUp = htmlS + item.toUpperCase() + htmlE; // 用于把字符串转换成大写
                var pLo = new RegExp(item.toLowerCase(), 'g'); // 找到所有存在，则可以使用 "g" 参数 ("global")
                var pUp = new RegExp(item.toUpperCase(), 'g');
                if (text.match(pLo) || text.match(pUp)) {
                    if (item.toLowerCase() == item.toUpperCase()) {
                        text = text.replace(pLo, bLo);
                    }
                    else {
                        text = text.replace(pLo, bLo).replace(pUp, bUp);
                    }
                }

            });
            return $sce.trustAsHtml(text);

        };
    }]).filter('bluelight', ['$sce', function ($sce) {
        return function (result, content) {
            if (!result) {
                return;
            }

            var reg = new RegExp(content.replace(/#/g, '|'), 'ig');
            result = result.replace(reg, function (letter) {
                return '<span style="color: #00f">' + letter + '</span>';
            });
            return $sce.trustAsHtml(result);
        };
    }]).filter('searchSub', ['$sce', function ($sce) {
        return function (content, keywords, size) {
            content = content.replace(/_/g, '').replace(/-/g, '');
            if (typeof size !== 'undefined' && content.length > size) {
                content = content.substring(0, size) + '……';
            }

            if (typeof keywords !== 'undefined') {
                var pattern = new RegExp('["`~!@#$^&*()=|{}\':;\',\\[\\].<>/?~！@#￥……&*（）——|{}【】‘；：”“\'。，、？\+\-]', 'g');
                // 过滤关键字中的特殊字符和连续空格
                keywords = keywords.replace(pattern, ' ').replace(/[\s　]{2,}/g, ' ');
                $($.trim(keywords).split(' ')).each(function (i, t) {
                    if (t == '') {
                        return true;
                    }

                    var htmlS = '<font color=\'#6687ff\'>';
                    var htmlE = '</font>';
                    var bLo = htmlS + t.toLowerCase() + htmlE; // 用于把字符串转换成小写
                    var bUp = htmlS + t.toUpperCase() + htmlE; // 用于把字符串转换成大写
                    var pLo = new RegExp(t.toLowerCase(), 'g'); // 找到所有存在，则可以使用 "g" 参数 ("global")
                    var pUp = new RegExp(t.toUpperCase(), 'g');
                    if (content.match(pLo) || content.match(pUp)) {
                        if (t.toLowerCase() == t.toUpperCase()) {
                            content = content.replace(pLo, bLo);
                        }
                        else {
                            content = content.replace(pLo, bLo).replace(pUp, bUp);
                        }
                    }

                });
            }

            return $sce.trustAsHtml(content);
        };
    }]);

});
