/* eslint-disable no-unused-vars,no-undef */

let listen1 = (function () {

    let ngScope = null;

    return {

        init: function () {
            return new Promise(resolve => {
                angular.module("listen1NgApi", ["loWebManager"]).controller("listen1NgApiController", ["$scope",
                    "$httpParamSerializerJQLike", "$http", "loWeb",
                    function ($scope, $httpParamSerializerJQLike, $http, loWeb) {

                        // 外部通过获取scope调用
                        $scope.get = function (url) {
                            return new Promise(function (resolve, reject) {
                                loWeb.get(url).success(data => {
                                    resolve(data);
                                });
                            });
                        };

                        $scope.post = function (request) {
                            return new Promise(function (resolve, reject) {
                                loWeb.post(request).success(data => {
                                    resolve(data);
                                });
                            });
                        };

                        $scope.get_music_url = function (track_id) {
                            let provider = getProviderByItemId(track_id);
                            let sound = {"url": ""};
                            return new Promise(function (resolve, reject) {
                                // function(sound, track, success, failure, hm, se)
                                provider.bootstrap_track(sound, {"id": track_id},
                                    () => resolve(sound.url),
                                    () => {
                                        reject("bootstrap_track error");
                                    }, $http, $httpParamSerializerJQLike);
                            });

                        };

                    }]);

                let _get = () => angular.element(document.getElementById("listen1NgApi")).scope();

                // get Scope
                let tmp = _get();
                if (tmp !== undefined) resolve(tmp);
                let i = 0;
                let timer = setInterval(() => {
                    tmp = _get();
                    i++;
                    if (tmp !== undefined) {
                        clearInterval(timer);
                        ngScope = tmp;
                        resolve(tmp);
                    } else if (i >= 10) {
                        clearInterval(timer);
                        reject();
                    }else{
                        console.log("Get Angular scope failed. ", i);
                    }

                }, 100);// 100ms

            });

        },

        search: function (source, keywords, curpage) {
            if (curpage === undefined) curpage = "1";
            return Promise.resolve(ngScope.get(`/search?source=${source}&keywords=${keywords}&curpage=${curpage}`));
        },

        get_playlist: function (list_id) {
            return Promise.resolve(ngScope.get(`/playlist?list_id=${list_id}`));
        },

        get_track_url: function (track_id) {
            return Promise.resolve(ngScope.get_music_url(track_id));
        },

        get_lyric: function (track_id) {
            return Promise.resolve(ngScope.get(`/lyric?track_id=${track_id}`));
        },

        get_my_playlist: function () {
            return Promise.resolve(ngScope.get("/show_myplaylist"));
        },

        edit_my_playlist: function (list_id, title, cover_img_url) {
            return Promise.resolve(ngScope.post(`/edit_myplaylist?list_id=${list_id}&title=${title}&cover_img_url=${cover_img_url}`));
        },

    };
})();

export default listen1;