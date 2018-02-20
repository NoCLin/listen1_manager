/* eslint-disable no-undef */

// 解决Electron使用Jquery
if (typeof module === "object") {
    window.jQuery = window.$ = module.exports;
}

require("./components/AddAndEditDialogContent.js");
require("./components/ImportDialogContent.js");

let listen1 = require("./listen1.js");


new Vue({
    el: "#app",
    data: {
        importDialogVisible: false,
        addAndEditDialogVisible: false,
        activeTabName: "Listen1",
        currentModifyRow: {},
        currentModifyRowIndex: -1,
        isAdd: false,
        myPlaylists: [],
        status: [],
        playListTableData: [],
        currentPlayListId: "",
        lastPlayerNotify: null
    },
    computed: {},
    watch: {
        currentPlayListId: function (newId, oldId) {
            console.log(newId + " selected from", oldId);
            for (let i = 0, len = this.myPlaylists.length; i < len; i++) {
                if (this.myPlaylists[i].info.id === newId) {
                    this.playListTableData = this.myPlaylists[i].tracks;
                    this.status = [];
                    for (let j = 0, len = this.myPlaylists[i].tracks.length; j < len; j++) {
                        let track = this.myPlaylists[i].tracks[j];

                        if (listen1.is_cached(track.id)) {
                            this.status.push("已缓存");
                        } else {
                            this.status.push("未缓存");
                        }
                    }
                    break;
                }
            }

        },
        activeTabName: function (newTab) {
            let w = document.getElementById("listen1_iframe").contentWindow;
            delete w.require;// 解决Jquery
            delete w.exports;
            delete w.module;

            if (newTab === "Listen1") {
                let doc = w.document;

                let ele_logo = doc.getElementsByClassName("logo")[0];
                ele_logo.click();

                let ele_body = w.document.getElementsByTagName("body")[0];

                let $scope = w.angular.element(ele_body).scope();
                console.log($scope);
                //
                //
                //$scope.showTag(4)调用无反应
                // console.log($scope.showTag)
                //

                // w.location = "./listen1_chrome_extension/listen1.html";
            } else if (newTab === "Manager") {
                listen1.get_my_playlist().then(data => {
                    this.myPlaylists = data.result;
                    this.currentPlayListId = "";
                });
            }

        }

    },
    methods: {
        playByTrack: function (track) {
            if (this.lastPlayerNotify !== null) {
                this.lastPlayerNotify.close();
            }

            listen1.get_music_and_cache_by_id(track.id).then(url => {
                this.lastPlayerNotify = this.$notify({
                    title: `正在播放 ${track.artist} - ${track.title}`,
                    dangerouslyUseHTMLString: true,
                    duration: 0,
                    message: `<audio src="${url}" controls="controls" autoplay></audio>`,
                    onClose: () => {
                        this.lastPlayerNotify = null;
                    }
                });
            });
        },
        openEditDialog: function (index) {
            this.currentModifyRow = JSON.parse(JSON.stringify(this.playListTableData[index]));
            this.currentModifyRowIndex = index;
            this.isAdd = false;
            this.addAndEditDialogVisible = true;
        },
        pushToPlayListTable: function (row, index) {
            // 将获取的track格式化,在此统一处理
            // let track = {
            //     "id": row.id,
            //     "title": row.title,
            //     "artist": row.artist,
            //     "artist_id":row.artist_id,
            //     "album": row.album,
            //     "album_id": row.album_id,
            //     "source": row.source,
            //     "source_url": row.source_url,
            //     "img_url": row.img_url,
            //     "url": row.url,
            //     // "lyric_url": "",// 只有虾米有lyric_url项
            //     // "$$hashKey": "object:352" // 由angular no-repeat 产生
            // };


            if (row.disabled) {
                console.error("disabled", row);
                return false;
            }

            let track = row;
            if (index === undefined) { //插入
                this.playListTableData.push(track);
            } else {//修改某一行
                
                Vue.set(this.playListTableData, index, track); // 由于JS限制Vue无法检测对象属性的添加或删除
            }
            this.handleSave();

        },
        handleEditComplete: function (row) {
            // let newVal = JSON.parse(JSON.stringify(row));

            this.pushToPlayListTable(row, this.currentModifyRowIndex);
            this.addAndEditDialogVisible = false;
            this.$message({
                message: "编辑成功!",
                type: "success"
            });
        },
        handleDownloadAll: function () {

            for (let i = 0, len = this.playListTableData.length; i < len; i++) {
                let track = this.playListTableData[i];

                Vue.set(this.status, i, "正在下载 " + track.title);

                listen1.get_music_and_cache_by_id(track.id).then(url => {
                    console.log("缓存成功！" + url);
                    Vue.set(this.status, i, "成功");
                });

            }

        },
        handleExport: function () {
            for (let track of  this.playListTableData) {
                let filename = `${track.artist} - ${track.title}.mp3`;
                console.log(filename);

            }

        },
        handleSave: function () {
            let ids = [];
            for (let i = 0; i < this.myPlaylists.length; i++) {
                let id = this.myPlaylists[i].info.id;
                ids.push(id);
                localStorage.setObject(id, this.myPlaylists[i]);
            }
            localStorage.setObject("playerlists", ids);

        },

        handleAdded: function (track) {
            console.log("added track", JSON.stringify(track));
            this.pushToPlayListTable(track);
            this.$notify({message: `"${track.title}"已经加入歌单!`, type: "success"});
        },
        handleImportedFromList: function (tracks) {
            console.log(tracks);
            for (let i = 0; i < tracks.length; i++) {
                this.playListTableData.push(tracks[i]);
            }
            this.$notify({message: "已经批量加入歌单!", type: "success"});
        },
        handleDeleteRow(index) {
            this.$confirm("此操作将永久删除, 是否继续?", "警告", {type: "danger"}).then(() => {
                this.$notify({type: "success", message: "删除成功!"});
                this.playListTableData.splice(index, 1);
                this.handleSave();
            }).catch(() => {
                this.$notify({type: "info", message: "已取消删除"});
            });

        },
        openAddDialog: function () {
            this.isAdd = true;
            this.addAndEditDialogVisible = true;
            // scrollTo(0,0); 无效
        },
        openImportDialog: function () {
            this.importDialogVisible = true;
        },
        test() {
            // shell.openExternal(link)
            listen1.search("netease", "Tank").then((data) => {
                console.log("search", data);
            });

            // listen1_get_playlist("xmalbum_4058").then((data) => {
            //     console.log("get_list", data)
            // });
            //
            // listen1_get_track_url("xmtrack_49645").then((data) => {
            //     console.log("get_url", data)
            // })


        },

    },
    mounted: function () {
        listen1.init().then(() => {
            listen1.get_my_playlist().then(data => {
                this.myPlaylists = data.result;
            });
        });
    }
});