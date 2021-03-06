/* eslint-disable no-unused-vars,no-undef */

let listen1 = (function () {

    let ngScope = null;
    // TODO: Promise timeout race
    const TIMEOUT = 5000;

    function delayPromise(ms = TIMEOUT) {
        return new Promise((resolve, reject) => {
            setTimeout(reject, ms);
        });
    }

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
                            return Promise.resolve(this.get_track_info(track_id));
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
                                        // console.log("sound", sound);
                                        // console.log("track", track);
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
                        resolve(ngScope);
                    } else if (i >= 20) {
                        clearInterval(timer);
                        reject("Listen1 API 加载失败!");
                    } else
                        console.log("获取 Angular scope 失败. 正在重试第" + i + "次");
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
                // FIXED: 虾米需带上lyric_url参数 lyric_url由获取列表时生成
                if (track_id.substring(0, 8) === "xmtrack_") {
                    ngScope.get_track_info(track_id).then(data => {
                        fetch(data.lyric_url, {
                            method: "get"
                        }).then((response) => {
                            return response.text();
                        }).then(text => {
                            resolve({
                                lyric: text,
                                lyric_url: data.lyric_url
                            });
                        });
                    });
                }
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

        create_myplaylist: function (list_title, trackOrTrackJson) {
            return Promise.resolve(ngScope.post({
                url: "/create_myplaylist",
                data: `list_title=${list_title}&track=${JSON.stringify(trackOrTrackJson)}`
            }));
        },
        edit_myplaylist: function (list_id, title, cover_img_url) {
            return Promise.resolve(ngScope.post({
                url: "/edit_myplaylist",
                data: `list_id=${list_id}&title=${title}&cover_img_url=${cover_img_url}`
            }));
        },
        remove_myplaylist: function (list_id) {
            return Promise.resolve(ngScope.post({
                url: "/remove_myplaylist",
                data: `list_id=${list_id}`
            }));
        },

        /** loweb.post **/

        // 从playlist新建
        save_myplaylist: function (playlist) {
            myplaylist.save_myplaylist(playlist);
        },
        // 更新歌单 不存在则新建
        update_myplaylist: function (playlist) {
            function guid() {
                function s4() {
                    return Math.floor((1 + Math.random()) * 0x10000)
                        .toString(16)
                        .substring(1);
                }

                return s4() + s4() + "-" + s4() + "-" + s4() + "-" +
                    s4() + "-" + s4() + s4() + s4();
            }

            let isExist = false;
            let idList = localStorage.getObject("playerlists");

            if (idList == null) idList = [];
            else if (playlist.info.id !== undefined) {
                for (let id of idList)
                    if (playlist.info.id === id) isExist = true;
            }

            if (!isExist) {
                playlist.info.id = "myplaylist_" + guid();
                playlist.is_mine = 1;
                idList.push(playlist.info.id);
                localStorage.setObject("playerlists", idList);
            }
            localStorage.setObject(playlist.info.id, playlist);
            return playlist.info.id;
        }


    };
})();

export default listen1;