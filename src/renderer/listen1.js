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

                        $scope.get_track_url = function (track_id) {
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

                        // 仅支持虾米
                        $scope.get_track_info = function (track_id) {
                            let provider = getProviderByItemId(track_id);
                            let sound = {"url": ""};
                            let track = {"id": track_id};
                            return new Promise(function (resolve, reject) {
                                // function(sound, track, success, failure, hm, se)
                                provider.bootstrap_track(sound, track,
                                    () => {
                                        console.log("sound", sound);
                                        console.log("track", track);

                                        resolve(Object.assign(sound, track));
                                    },
                                    () => {
                                        reject("bootstrap_track error");
                                    }, $http, $httpParamSerializerJQLike);
                            });

                        };


                    }]);

                let _get = () => angular.element(document.getElementById("listen1NgApi")).scope();

                let tmp_scope;
                let i = 0;
                let timer = setInterval(() => {
                    tmp_scope = _get();
                    i++;
                    if (tmp_scope !== undefined) {
                        clearInterval(timer);
                        ngScope = tmp_scope;
                        console.log("Init Listen1 API Successfully.");
                        resolve(ngScope);
                    } else if (i >= 10) {
                        clearInterval(timer);
                        reject("Init Timeout.");
                    } else {
                        console.log("Get Angular scope failed. Retry ", i);
                    }

                }, 100);// 100ms

            });

        },

        /** loweb.get **/

        // 获取热门歌单
        get_hot_list: function (source) {
            return Promise.resolve(ngScope.get(`/show_playlist?source=${source}`));
        },

        // 获取歌单
        get_playlist: function (list_id) {
            return Promise.resolve(ngScope.get(`/playlist?list_id=${list_id}`));
        },

        // 搜索
        search: function (source, keywords, curpage) {
            if (curpage === undefined) curpage = "1";
            return Promise.resolve(ngScope.get(`/search?source=${source}&keywords=${keywords}&curpage=${curpage}`));
        },

        // 获取歌词
        get_lyric: function (track_id) {
            return new Promise((resolve, reject) => {
                // FIXME: 虾米需带上lyric_url参数 lyric_url由获取列表时生成
                if (track_id.substring(0, 8) === "xmtrack_")
                    return ngScope.get_track_info(track_id).then(data => {
                        // TODO: 返回文本
                        resolve({
                            lyric: data.lyric_url,
                            lyric_url: data.lyric_url
                        });
                    });
                else resolve(ngScope.get(`/lyric?track_id=${track_id}`));
            });
        },

        // 获取本地歌单
        get_my_playlist: function () {
            return Promise.resolve(ngScope.get("/show_myplaylist"));
        },

        /** loweb.get **/

        /** loweb.bootstrapTrack **/

        // 获取歌曲url
        get_track_url: function (track_id) {
            return Promise.resolve(ngScope.get_track_url(track_id));
        },
        get_track_info: function (track_id) {
            return Promise.resolve(ngScope.get_track_info(track_id));
        },
        /** loweb.bootstrapTrack **/

        /** loweb.post **/

        // clone_playlist
        // remove_myplaylist
        // add_myplaylist
        // remove_track_from_myplaylist
        // create_myplaylist
        // edit_myplaylist
        // parse_url
        // merge_playlist

        edit_my_playlist: function (list_id, title, cover_img_url) {
            return Promise.resolve(ngScope.post(`/edit_myplaylist?list_id=${list_id}&title=${title}&cover_img_url=${cover_img_url}`));
        },

        /** loweb.post **/

    };
})();

export default listen1;