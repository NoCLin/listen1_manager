/* eslint-disable no-unused-vars,no-undef */
Storage.prototype.setObject = function (key, value) {
    this.setItem(key, JSON.stringify(value));
};

Storage.prototype.getObject = function (key) {
    let value = this.getItem(key);
    return value && JSON.parse(value);
};

let fs = require("fs");
let os = require("os");
let path = require("path");

function initNgApi() {
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
                window.ngScope = tmp;
                resolve(tmp);
            } else if (i >= 10) {
                clearInterval(timer);
                reject();
            }
        }, 100);// 100ms

    });

}

function getNgScope() {
    return window.ngScope;
}

function listen1_search(source, keywords, curpage) {
    if (curpage === undefined) curpage = "1";
    return Promise.resolve(getNgScope().get(`/search?source=${source}&keywords=${keywords}&curpage=${curpage}`));
}

function listen1_get_playlist(list_id) {
    return Promise.resolve(getNgScope().get(`/playlist?list_id=${list_id}`));
}

function listen1_get_track_url(track_id) {
    return Promise.resolve(getNgScope().get_music_url(track_id));
}

function listen1_get_lyric(track_id) {
    return Promise.resolve(getNgScope().get(`/lyric?track_id=${track_id}`));
}

function listen1_show_myplaylist() {
    return Promise.resolve(getNgScope().get("/show_myplaylist"));
}

function listen1_edit_myplaylist(list_id, title, cover_img_url) {
    return Promise.resolve(getNgScope().post(`/edit_myplaylist?list_id=${list_id}&title=${title}&cover_img_url=${cover_img_url}`));
}

//
//
// console.log("process.execPath", process.execPath);
// console.log("__dirname", __dirname);
// console.log("process.cwd()", process.cwd());
//

/*
* url 网络文件地址
* filename 文件名
* callback 回调函数
*/
function downloadFile(uri, filename, callback) {
    let fs = require("fs");
    let request = require("request");
    let stream = fs.createWriteStream(filename);
    request(uri).pipe(stream).on("close", callback);
}

function _to_cache_path(track_id) {
    const CACHE_ROOT = path.join(os.homedir(), "/listen1_manager/");
    if (!fs.existsSync(CACHE_ROOT)) fs.mkdir(CACHE_ROOT);

    return path.join(CACHE_ROOT, track_id + ".mp3");
}

function isCached(track_id) {

    return fs.existsSync(_to_cache_path(track_id));
}

function get_music_and_cache_by_id(track_id) {

    return new Promise((resolve, reject) => {


        let filepath = _to_cache_path(track_id);

        console.log("filepath " + filepath);
        if (fs.existsSync(filepath)) {
            resolve(filepath);
        } else {
            // return filepath;
            listen1_get_track_url(track_id).then((url) => {
                console.log("url", url);
                downloadFile(url, filepath, function () {
                    console.log(filepath + "下载完毕");
                    resolve(filepath);
                });

            }).catch((err) => {
                reject(err);
            });


        }
    });


}
