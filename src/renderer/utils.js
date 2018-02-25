const fs = require("fs");
const os = require("os");
const path = require("path");
const request = require("request");
const listen1 = require("./listen1").default;

export default (function () {
    const MANAGER_ROOT = (os.platform() === "win32") ?
        "C:\\listen1_manager" :
        path.join(os.homedir(), "listen1_manager");

    const CACHED_DIR = path.join(MANAGER_ROOT, "cached");

    function to_cached_path(track_id) {
        return path.join(CACHED_DIR, track_id + ".mp3");
    }

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

    if (!fs.existsSync(CACHED_DIR)) mkdirSync(CACHED_DIR);


    return {

        get_music_and_cache_by_id: function (track_id) {

            return new Promise((resolve, reject) => {

                let filepath = to_cached_path(track_id);

                console.log("get_cached_path " + filepath);
                // TODO: 嵌入APlayer支持
                if (fs.existsSync(filepath)) {
                    resolve(filepath);
                } else {
                    listen1.get_track_url(track_id).then((url) => {
                        console.log("获取url成功", url);
                        downloadFile(url, filepath).then(() => {
                            console.log(`下载完毕 ${url} -> ${filepath}`);
                            resolve(filepath);
                        });
                        // TODO:处理下载失败
                    }).catch((err) => {
                        console.log("下载失败", err);
                        reject(err);
                    });


                }
            });


        },
        is_track_cached: function (track_id) {
            return fs.existsSync(to_cached_path(track_id));
        },
        to_cached_path: to_cached_path,
        mkdirSync: mkdirSync,
        downloadFile: downloadFile,
        MANAGER_ROOT:MANAGER_ROOT,
        CACHED_DIR:CACHED_DIR
    };
})();
