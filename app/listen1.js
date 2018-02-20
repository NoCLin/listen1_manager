/* eslint-disable no-unused-vars,no-undef */


let fs = require("fs");
let os = require("os");
let path = require("path");
let request = require("request");

const MANAGER_ROOT = (os.platform() === "win32") ? "C:\\listen1_manager" : path.join(os.homedir(), "listen1_manager");
const CACHED_DIR = path.join(MANAGER_ROOT, "cached");


require("./listen1_chrome_extension/js/vendor/angular.min.js");

console.log("angular = ", angular);


function mkdirSync(dirname) {
    if (fs.existsSync(dirname)) return true;
    else {
        if (mkdirSync(path.dirname(dirname))) {
            fs.mkdirSync(dirname);
            return true;
        }
    }
    return false;
}

if (!fs.existsSync(CACHED_DIR)) mkdirSync(CACHED_DIR);

var listen1 = (function () {
    "use strict";

    function get_cached_path(track_id) {
        return path.join(CACHED_DIR, track_id + ".mp3");
    }


    function downloadFile(uri, filename) {
        return new Promise((resolve, reject) => {
            let stream = fs.createWriteStream(filename);
            request(uri).pipe(stream).on("close", () => {
                resolve();
            }).on("error", (err) => {
                reject(err);
            });

        });
    }


    let ngScope = null;

    return {

        get_music_and_cache_by_id: function (track_id) {

            return new Promise((resolve, reject) => {

                let filepath = get_cached_path(track_id);

                console.log("get_cached_path " + filepath);
                // TODO: 嵌入APlayer支持
                if (fs.existsSync(filepath)) {
                    resolve(filepath);
                } else {
                    // return filepath;
                    this.get_track_url(track_id).then((url) => {
                        console.log("获取url成功", url);
                        downloadFile(url, filepath).then(() => {
                            console.log(`下载完毕 ${url} -> ${filepath}`);
                            resolve(filepath);
                        });

                    }).catch((err) => {
                        console.log("下载失败", err);
                        reject(err);
                    });


                }
            });


        },

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
                                        console.log("bootstrap_track err");
                                        reject();
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
                    console.log("try to get scope", i);
                    if (tmp !== undefined) {
                        clearInterval(timer);
                        ngScope = tmp;
                        resolve(tmp);
                    } else if (i >= 10) {
                        clearInterval(timer);
                        reject();
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

        is_cached: function (track_id) {
            return fs.existsSync(get_cached_path(track_id));
        }

    };
})();
module.exports = listen1;