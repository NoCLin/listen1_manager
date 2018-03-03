<template>

    <div>
        <SearchDialog
                :track="currentModifyRow"
                :isAdd="isAdd"
                :visible="searchDialogVisible"
                @selected="handleEditComplete"
                @added="handleAdded"
                @play="playByTrack"
                @close="searchDialogVisible = false">
        </SearchDialog>

        <ImportDialog
                :visible="importDialogVisible"
                @play="playByTrack"
                @imported="handleImportedFromList"
                @close="importDialogVisible = false">
        </ImportDialog>

        <ExportDialog
                :visible="exportDialogVisible"
                :exportResult="exportResult"
                @close="exportDialogVisible = false">
        </ExportDialog>

        <el-container>
            <el-header>
                <el-menu :default-active="activeTabName" @select="handleMenuSelected" menu-trigger="click"
                         mode="horizontal">
                    <el-submenu index="Manager">
                        <template slot="title">
                            <i class="el-icon-edit"></i>Manager
                        </template>

                        <el-menu-item
                                v-for="playList in myPlayLists"
                                :index="playList.info.id"
                                :key="playList.info.id">
                            {{playList.info.title}}
                        </el-menu-item>

                        <el-menu-item index="add">创建歌单</el-menu-item>

                    </el-submenu>
                    <el-menu-item index="Listen1"><i class="el-icon-service"></i>Listen1</el-menu-item>
                    <el-menu-item index="test"><i class="el-icon-loading"></i>API测试</el-menu-item>
                </el-menu>
            </el-header>

            <el-main style="padding: 0;" :class="{'listen1bg' : activeTabName === 'Listen1' }">
                <div v-show="activeTabName === 'Manager'" style="padding: 8px;">

                    <el-row>
                        <el-col style="width:50vw; max-width: 500px;">
                            <el-row style="margin-top: 5px;">
                                <el-select v-model="currentPlayListId" style="width:100%">
                                    <el-option
                                            v-for="playList in myPlayLists"
                                            :key="playList.info.id"
                                            :label="playList.info.title + '(' + playList.info.id + ')'"
                                            :value="playList.info.id">
                                    </el-option>
                                </el-select>
                            </el-row>
                            <el-row style="margin-top: 5px; background: #475669;">
                                <el-carousel ref="playlistCarousel" :autoplay="false" type="card"
                                             trigger="click"
                                             @change="handlePlaylistCarouselChanged"
                                             height="200px"
                                >
                                    <el-carousel-item v-for="playList in myPlayLists" :key="playList.info.id"
                                                      :name="playList.info.id">
                                        <div style="color:#fff; text-align: center">
                                            {{playList.info.title}}
                                            <img :src="playList.info.cover_img_url" height="180px" width="180px">
                                        </div>

                                    </el-carousel-item>
                                </el-carousel>
                            </el-row>

                        </el-col>

                        <el-col style="width:50vw; min-width: 100px;">
                            <div v-if="currentPlayList.info">
                                <el-form ref="form" label-width="80px">
                                    <el-form-item label="ID">
                                        <el-input v-model="currentPlayList.info.id" disabled>
                                        </el-input>
                                    </el-form-item>
                                    <el-form-item label="标题">
                                        <el-input v-model="currentPlayList.info.title">
                                        </el-input>
                                    </el-form-item>
                                    <el-form-item label="封面">
                                        <el-input v-model="currentPlayList.info.cover_img_url" disabled>
                                        </el-input>
                                        <!--注意:无法上传-->
                                    </el-form-item>
                                </el-form>

                            </div>

                        </el-col>
                    </el-row>
                    <el-row style="margin-top: 5px" v-if="currentPlayListId!==''">
                        <div>
                            <template>
                                <el-table
                                        ref="playListTable"
                                        :data="currentTracks"
                                        border
                                        max-height="365"
                                        style="width: 100%">
                                    <el-table-column
                                            type="index"
                                            fixed="left"
                                            width="50">
                                    </el-table-column>
                                    <el-table-column
                                            prop="source"
                                            label="来源"
                                            width="100">
                                    </el-table-column>
                                    <el-table-column
                                            prop="title"
                                            label="歌名"
                                            width="180">
                                        <template slot-scope="scope">
                                            {{ scope.row.title }}
                                            <!--<br>-->
                                            <!--<el-popover trigger="hover" placement="top">-->
                                            <!--<div slot="reference" class="name-wrapper">-->
                                            <!--<el-tag size="medium">{{scope.row.id}}</el-tag>-->
                                            <!--</div>-->
                                            <!--<div v-html="scope.row">-->
                                            <!--</div>-->
                                            <!--</el-popover>-->
                                        </template>
                                    </el-table-column>
                                    <el-table-column
                                            prop="artist"
                                            label="歌手"
                                            width="180">
                                        <template slot-scope="scope">
                                            {{ scope.row.artist }}
                                            <!--<br>-->
                                            <!--<el-tag size="medium">{{scope.row.artist_id}}</el-tag>-->

                                        </template>
                                    </el-table-column>
                                    <el-table-column
                                            prop="album"
                                            label="专辑"
                                            width="180">
                                        <template slot-scope="scope">
                                            {{ scope.row.album }}
                                            <!--<br>-->
                                            <!--<el-tag size="medium">{{scope.row.album_id}}</el-tag>-->
                                        </template>
                                    </el-table-column>
                                    <el-table-column
                                            prop="cacheStatus"
                                            label="状态"
                                            width="100">
                                        <template slot-scope="scope">
                                            <div v-if="'cached' === cacheStatus[scope.$index]">
                                                <el-tag type="success">已缓存</el-tag>
                                            </div>
                                            <div v-if="'uncached' === cacheStatus[scope.$index]">
                                                <el-tag type="danger">未缓存</el-tag>
                                            </div>
                                            <!--{{scope.$index}}-->
                                        </template>
                                    </el-table-column>
                                    <el-table-column
                                            fixed="right"
                                            label="操作"
                                            width="300"
                                    >
                                        <template slot-scope="scope">
                                            <el-button icon="el-icon-edit" size="mini"
                                                       @click="openEditDialog(scope.$index)">编辑
                                            </el-button>
                                            <el-button type="primary" size="mini" icon="el-icon-service"
                                                       @click="playByTrack(scope.row)">试听
                                            </el-button>
                                            <el-button type="danger" size="mini" icon="el-icon-delete"
                                                       @click="handleDeleteRow(scope.$index)">删除
                                            </el-button>
                                        </template>
                                    </el-table-column>
                                </el-table>
                            </template>
                        </div>
                    </el-row>


                </div>
                <div v-show="activeTabName === 'Listen1'">
                    <iframe id="listen1_iframe" frameborder='no' src="./static/listen1_chrome_extension/listen1.html"
                            style=" left:10vw; width:90vw;height:80vh; padding: 16px"></iframe>
                </div>
            </el-main>

            <el-footer height="60px" :class="{'listen1bg' : activeTabName === 'Listen1' }">

                <div class="control-buttons" v-show="activeTabName === 'Manager'" style="margin-top: 10px;">
                    <el-button type="primary" round @click="openAddDialog">搜索<i
                            class="el-icon-search el-icon--right"></i></el-button>
                    <el-button type="primary" round @click="openImportDialog">导入<i
                            class="el-icon-upload el-icon--right"></i></el-button>
                    <el-button type="primary" round @click="handleDownloadAll">下载<i
                            class="el-icon-download el-icon--right"></i></el-button>
                    <el-button type="primary" round @click="handleExport">导出<i
                            class="el-icon-document el-icon--right"></i></el-button>
                </div>
            </el-footer>
        </el-container>

    </div>
</template>

<script>
    const path = require("path");
    const fs = require("fs");

    const Vue = require("vue").default;

    const SearchDialog = require("./components/SearchDialog").default;
    const ImportDialog = require("./components/ImportDialog").default;
    const ExportDialog = require("./components/ExportDialog").default;

    const listen1 = require("../listen1.js").default;
    const utils = require("../utils.js").default;

    export default {
        components: {SearchDialog, ImportDialog, ExportDialog},
        data: function () {
            return {
                importDialogVisible: false,
                searchDialogVisible: false,
                exportDialogVisible: false,
                activeIndex: "",
                activeTabName: "Listen1",
                currentModifyRow: {},
                currentModifyRowIndex: -1,
                isAdd: false,
                myPlayLists: [],
                cacheStatus: [],

                currentPlayListId: "",
                currentPlayList: {},
                lastPlayerNotify: null,

                exportResult: [],
                isDev: process.env.NODE_ENV === 'development'
            };
        },
        computed: {
            currentTracks: function () {
                return (this.currentPlayList.tracks !== undefined) ? this.currentPlayList.tracks : [];
            }
        },
        watch: {
            currentPlayListId: function (newId, oldId) {

                this.$refs.playlistCarousel.setActiveItem(newId);

                for (let i = 0, len = this.myPlayLists.length; i < len; i++) {
                    if (this.myPlayLists[i].info.id === newId) {

                        this.currentPlayList = this.myPlayLists[i];
                        console.log("切换列表", JSON.stringify(this.currentPlayList.info))
                        // this.currentTracks = this.myPlaylists[i].tracks;
                        this.cacheStatus = [];
                        for (let j = 0, len = this.myPlayLists[i].tracks.length; j < len; j++) {
                            let track = this.myPlayLists[i].tracks[j];

                            if (utils.is_track_cached(track.id)) {
                                this.cacheStatus.push("cached");
                            } else {
                                this.cacheStatus.push("uncached");
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


                }

            }

        },
        methods: {
            playByTrack: function (track) {

                if (this.lastPlayerNotify !== null) {
                    this.lastPlayerNotify.close();
                }

                utils.get_music_and_cache_by_id(track.id).then(url => {
                    this.lastPlayerNotify = this.$notify({
                        title: `正在播放 ${track.artist} - ${track.title}`,
                        dangerouslyUseHTMLString: true,
                        duration: 0,
                        message: `<audio src="file://${url}" controls="controls" autoplay></audio>`,
                        onClose: () => {
                            this.lastPlayerNotify = null;
                        }
                    });
                });
            },
            openEditDialog: function (index) {
                this.currentModifyRow = JSON.parse(JSON.stringify(this.currentTracks[index]));
                this.currentModifyRowIndex = index;
                this.isAdd = false;
                this.searchDialogVisible = true;
            },
            updateTracks: function (row, index) {
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
                    this.currentTracks.push(track);
                } else {//修改某一行
                    Vue.set(this.currentTracks, index, track); // 由于JS限制Vue无法检测对象属性的添加或删除
                }
                this.saveCurrentPlayList();

            },
            handleEditComplete: function (row) {
                // let newVal = JSON.parse(JSON.stringify(row));

                this.updateTracks(row, this.currentModifyRowIndex);
                this.searchDialogVisible = false;
                this.$message({
                    message: "编辑成功!",
                    type: "success"
                });
            },
            handleDownloadAll: function () {

                for (let i = 0, len = this.currentTracks.length; i < len; i++) {
                    let track = this.currentTracks[i];

                    Vue.set(this.cacheStatus, i, "正在下载 " + track.title);

                    utils.get_music_and_cache_by_id(track.id).then(url => {
                        console.log("缓存成功！" + url);
                        Vue.set(this.cacheStatus, i, "缓存成功");
                    });

                }

            },
            handleExport: function () {

                let result = new Array(this.currentTracks.length);

                for (let i in  this.currentTracks) {
                    let track = this.currentTracks[i];

                    let filename = `${track.artist} - ${track.title}.mp3`;
                    filename = filename.replace("/", "");
                    // TODO: 非法文件名检测
                    // TODO: 歌词下载

                    result[i] = {
                        "title": filename,
                        "exportStatus": "none"
                    };

                    const DES_DIR = path.join(utils.EXPORT_DIR, this.currentPlayList.info.title);
                    utils.mkdirSync(DES_DIR);

                    const DES_PATH = path.join(DES_DIR, filename);

                    const SRC_PATH = utils.to_cached_path(track.id);


                    if (fs.existsSync(SRC_PATH)) {
                        if (fs.existsSync(DES_PATH) && fs.statSync(DES_PATH).size > 0) {
                            result[i].exportStatus = "exists";
                        } else {
                            let fileReadStream = fs.createReadStream(SRC_PATH);
                            let fileWriteStream = fs.createWriteStream(DES_PATH);
                            fileReadStream.pipe(fileWriteStream);
                            fileWriteStream.on("close", function () {
                                result[i].exportStatus = "success";
                            });
                        }
                    } else {
                        result[i].exportStatus = "uncached";
                    }
                }

                this.exportResult = result;
                this.exportDialogVisible = true;

                console.log(result);
            },
            saveCurrentPlayList: function () {
                // listen1.save_myplaylist(this.currentPlayList);

                // save All
                // let ids = [];
                for (let i = 0; i < this.myPlayLists.length; i++) {
                    let id = this.myPlayLists[i].info.id;
                    if (id === this.currentPlayList.info.id) {
                        localStorage.setObject(id, this.myPlayLists[i]);
                    }
                    // ids.push(id);

                }
                // localStorage.setObject("playerlists", ids);
                // save All
            },

            handleAdded: function (track) {
                console.log("added track", JSON.stringify(track));
                this.updateTracks(track);
                this.$notify({message: `"${track.title}"已经加入歌单!`, type: "success", duration: 1000});
            },
            handleImportedFromList: function (tracks) {
                console.log(tracks);
                for (let i = 0; i < tracks.length; i++) {
                    this.currentTracks.push(tracks[i]);
                }
                this.$notify({message: "已经批量加入歌单!", type: "success"});
            },
            handleDeleteRow(index) {
                this.$confirm("此操作将永久删除, 是否继续?", "警告", {type: "danger"}).then(() => {
                    this.$notify({type: "success", message: "删除成功!"});
                    this.currentTracks.splice(index, 1);
                    this.saveCurrentPlayList();
                }).catch(() => {
                    this.$notify({type: "info", message: "已取消删除"});
                });

            },
            openAddDialog: function () {
                this.isAdd = true;
                this.searchDialogVisible = true;
                // scrollTo(0,0); 无效
            },
            openImportDialog: function () {
                this.importDialogVisible = true;
            },
            handlePlaylistCarouselChanged(newIndex, oldIndex) {
                this.currentPlayListId = this.myPlayLists[newIndex].info.id;
            },
            handleMenuSelected: function (index, indexPath) {
                if (index === "Listen1") {
                    this.activeTabName = index;
                } else if (index === "test") {
                    this.test();
                } else if (indexPath[0] === "Manager") {
                    this.activeTabName = indexPath[0];// Manager,myplaylist_
                    if (index === "add") {
                        alert("add");
                    } else {
                        this.currentPlayListId = indexPath[0];
                    }
                }


            },
            reload: function () {
                return new Promise((resolve) => {
                    listen1.get_my_playlist().then(data => {
                        this.myPlayLists = data.result;
                        resolve(data.result.length)
                    });
                })

            },
            test() {

                async function listen1_test() {
                    const PROVIDERS = ["netease", "qq", "xiami"];
                    const SEARCH_TITLE = "Tank";

                    const PLAYLIST_ID_LIST = [
                        "neplaylist_311126880",
                        "neartist_5195",
                        "nealbum_2709152",
                        "qqplaylist_3746278836",
                        "qqartist_003hyJQg0Mc80t",
                        "qqalbum_000R5FAB2o8TR12",
                        "xmplaylist_352786137",
                        "xmartist_6in9397a",
                        "xmalbum_b1CmS5l3fd68",
                    ];

                    const TRACK_ID_LIST = [
                        "netrack_247940",
                        "qqtrack_0032gzUn1AUkbT",
                        "xmtrack_bcW7aeccf"
                    ];

                    console.log("开始测试搜索");
                    for (let provider of PROVIDERS) {
                        await listen1.search(provider, SEARCH_TITLE).then((data) => {
                            console.log(`搜索 ${provider} ${SEARCH_TITLE} : ${data.result.length}`);
                        });
                    }

                    console.log("开始测试热门歌单");
                    for (let provider of PROVIDERS) {
                        await listen1.get_hot_list(provider).then((data) => {
                            console.log(`获取${provider}热门歌单 : 歌单数${data.result.length}`);
                        });
                    }

                    console.log("开始测试列表");
                    for (let id of PLAYLIST_ID_LIST) {
                        await listen1.get_playlist(id).then((data) => {
                            console.log(`获取列表 ${id} : 歌曲数${data.tracks.length}`);
                        });
                    }

                    console.log("开始测试获取获取歌曲信息");
                    for (let id of TRACK_ID_LIST) {
                        await listen1.get_track_info(id).then((data) => {
                            console.log(`获取歌曲信息 ${id} : ${JSON.stringify(data)}`);
                        });
                        await listen1.get_lyric(id).then((data) => {

                            console.log(`获取歌词 ${id} : ${data.lyric.substring(0, 100)}`);
                        });

                    }

                }

                listen1_test().then(() => {
                    alert("PASS")
                }).catch(err => {
                    alert("Test error " + err)
                });


            },

        },
        mounted: function () {
            listen1.init().then(() => {
                this.reload().then(count => {
                    console.log("歌单数", count);
                    if (count === 0) {
                        listen1.save_myplaylist({
                            is_mine: 1,
                            info: {
                                'cover_img_url': '/static/listen1_chrome_extension/images/mycover.jpg',
                                'title': "默认歌单",
                                'id': '',
                                'source_url': ''
                            },
                            tracks: []
                        });
                        console.log("创建默认歌单")
                        this.reload();
                    }
                })

            }).catch((err) => {
                alert("初始化Listen1组件失败!错误信息:" + err)
            });
        }
    }
</script>

<style scoped>

    .el-header {
        /*background-color: red;*/
        width: 100%;
        position: absolute;
        top: 0;
        font-size: 16px;
        color: #fff;
        line-height: 60px;
    }

    .el-main {
        width: 100%;
        overflow: auto;
        position: absolute;
        top: 60px;
        bottom: 60px;
    }

    .el-footer {
        width: 100%;
        /*height: 60px;*/
        position: absolute;
        bottom: 0;
        /*background-color: #e1e1e1;*/
        /*color: #000000;*/
    }

    .listen1bg {
        background-color: #333;
    }

</style>
