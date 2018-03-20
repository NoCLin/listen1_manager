const fs = require("fs");
const os = require("os");
const path = require("path");
const request = require("request");
const listen1 = require("./listen1").default;


const MANAGER_ROOT = path.join(os.homedir(), "listen1_manager");
const CACHE_DIR = path.join(MANAGER_ROOT, "cached");
const EXPORT_DIR = path.join(MANAGER_ROOT, "export");
const DB_FILE = path.join(MANAGER_ROOT, "db.json");

export default (function () {
    mkdirsSync(CACHE_DIR);
    mkdirsSync(EXPORT_DIR);

    function to_cached_filename(track) {
        return `(${track.id})${filename_filter(track.artist)} - ${filename_filter(track.title)}.mp3`;
    }

    function to_cached_path(track) {
        return path.join(CACHE_DIR, to_cached_filename(track));
    }

    function to_export_filename(track) {
        return `${filename_filter(track.artist)} - ${filename_filter(track.title)}.mp3`;

    }

    function mkdirsSync(dirname) {
        if (fs.existsSync(dirname)) return true;
        else {
            if (mkdirsSync(path.dirname(dirname))) {
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

    function filename_filter(filename) {
        filename = filename.replace(/['"\\/\b\f\n\r\t]/g, "");
        // 去掉特殊字符
        filename = filename.replace(/[@#$%^&*{}:"<>?]/, "");
        return filename;
    }

    function getIdByURL(url) {

        String.prototype.getSubStr = function (startStr, endStr) {
            let pos_start = this.indexOf(startStr) + startStr.length;
            // 如果结束字符为空，则取从开始字符到结束字符的所有字符串
            let pos_end = (endStr === "") ? this.length : this.indexOf(endStr, pos_start);
            return this.substr(pos_start, pos_end - pos_start);
        };
        String.prototype.startWith = function (str) {
            let reg = new RegExp("^" + str);
            return reg.test(this);
        };

        // neplaylist_xxx / nealbum_xxx / neartist_xxx
        // qqplaylist_xxx / qqalbum_xxx / qqartist_xxx
        // xmplaylist_xxx / xmalbum_xxx / xmartist_xxx

        // neplaylist
        if (url.startsWith("http://music.163.com/#/playlist")) {
            let id = url.getSubStr("http://music.163.com/#/playlist?id=", "&");
            if (id === "") id = url.getSubStr("http://music.163.com/#/playlist?id=", "");
            if (id !== "") return "neplaylist_" + id;
        }

        // neartist
        if (url.startsWith("http://music.163.com/#/artist")) {
            let id = url.getSubStr("http://music.163.com/#/artist?id=", "");
            if (id !== "") return "neartist_" + id;
        }

        // nealbum
        if (url.startsWith("http://music.163.com/#/album")) {
            let id = url.getSubStr("http://music.163.com/#/album?id=", "");
            if (id !== "") return "nealbum_" + id;
        }


        // qqplaylist
        if (url.startsWith("https://y.qq.com/n/yqq/playsquare/")) {
            let id = url.getSubStr("https://y.qq.com/n/yqq/playsquare/", ".html");
            if (id !== "") return "qqplaylist_" + id;
        }

        // qqartist
        if (url.startsWith("https://y.qq.com/n/yqq/singer/")) {
            let id = url.getSubStr("https://y.qq.com/n/yqq/singer/", ".html");
            if (id !== "") return "qqartist_" + id;
        }

        // qqalbum
        if (url.startsWith("https://y.qq.com/n/yqq/album/")) {
            let id = url.getSubStr("https://y.qq.com/n/yqq/album/", ".html");
            if (id !== "") return "qqalbum_" + id;
        }

        // xmplaylist
        if (url.startsWith("http://www.xiami.com/collect/")) {
            let id = url.getSubStr("http://www.xiami.com/collect/", "?spm");// 注意不带spm的情况
            if (id === "") id = url.getSubStr("http://www.xiami.com/collect/", "");
            if (id !== "") return "xmplaylist_" + id;
        }

        // xmartist
        if (url.startsWith("http://www.xiami.com/artist/")) {
            let id = url.getSubStr("http://www.xiami.com/artist/", "?spm");// 注意不带spm的情况
            if (id === "") id = url.getSubStr("http://www.xiami.com/artist/", "");
            if (id !== "") return "xmartist_" + id;
        }

        //xmalbum
        if (url.startsWith("http://www.xiami.com/album/")) {
            let id = url.getSubStr("http://www.xiami.com/album/", "?spm");// 注意不带spm的情况
            if (id === "") id = url.getSubStr("http://www.xiami.com/album/", "");
            if (id !== "") return "xmalbum_" + id;
        }

        return null;
    }

    return {

        get_track_and_cache: function (track) {

            return new Promise((resolve, reject) => {

                let filepath = to_cached_path(track);

                console.log("get_cached_path " + filepath);
                // TODO: 嵌入APlayer支持
                if (fs.existsSync(filepath)) {
                    resolve(filepath);
                } else {
                    listen1.get_track_url(track.id).then((url) => {
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
        is_track_cached: (track) => fs.existsSync(to_cached_path(track)),
        to_cached_path: to_cached_path,
        to_export_filename: to_export_filename,
        filename_filter: filename_filter,
        mkdirsSync: mkdirsSync,
        downloadFile: downloadFile,
        getIdByURL: getIdByURL,
        MANAGER_ROOT: MANAGER_ROOT,
        CACHE_DIR: CACHE_DIR,
        EXPORT_DIR: EXPORT_DIR,
        DB_FILE: DB_FILE
    };
})();
