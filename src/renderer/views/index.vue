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
                @close="exportDialogVisible = false"
                ref="exportDialog">
        </ExportDialog>

        <el-container>
            <el-header>
                <el-menu :default-active="activeTabName" @select="handleMenuSelected" @open="handleMenuOpen"
                         menu-trigger="click"
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

                    <el-menu-item index="APITest" v-if="isDev"><i class="el-icon-loading"></i>API测试</el-menu-item>
                </el-menu>
            </el-header>

            <el-main style="padding: 0;" :class="{'listen1bg' : activeTabName === 'Listen1' }">
                <div v-show="activeTabName === 'Manager'" style="padding: 8px;">

                    <el-row>
                        <el-col style="width:50vw; max-width: 500px;">
                            <el-row style="margin-top: 5px;">
                                <el-select v-model="currentPlayListId" style="width:100%">
                                    <el-option
                                            v-for="playList,i in myPlayLists"
                                            :key="playList.info.id"
                                            :label="(i+1) +'. '+playList.info.title"
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
                                    <el-form-item label="提示:">
                                        实时保存歌单信息
                                    </el-form-item>
                                    <el-form-item label="ID">
                                        <el-input v-model="currentPlayList.info.id" disabled>
                                        </el-input>
                                    </el-form-item>
                                    <el-form-item label="标题">
                                        <el-input v-model="currentPlayList.info.title" @change="saveCurrentPlayList">
                                        </el-input>
                                    </el-form-item>
                                    <el-form-item label="封面">
                                        <el-input v-model="currentPlayList.info.cover_img_url" disabled>
                                        </el-input>
                                        <!--注意:无法上传-->
                                    </el-form-item>

                                    <el-form-item label="操作">

                                        <el-button type="danger" @click="handleDeletePlayList">
                                            删除歌单'{{currentPlayList.info.title}}'
                                        </el-button>
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
                                        style="width: 100%;-webkit-user-select: text;">
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
                                            <el-tag :type="cacheStatus[scope.$index].type">
                                                {{cacheStatus[scope.$index].text}}
                                            </el-tag>
                                        </template>
                                    </el-table-column>
                                    <el-table-column
                                            fixed="right"
                                            label="操作"
                                            width="300"
                                    >
                                        <template slot-scope="scope">
                                            <el-button-group>
                                                <el-button type="primary" icon="el-icon-service"
                                                           @click="playByTrack(scope.row)">
                                                </el-button>
                                                <el-button type="primary" icon="el-icon-edit"
                                                           @click="openEditDialog(scope.$index)">
                                                </el-button>

                                                <el-button type="primary" icon="el-icon-delete"
                                                           @click="handleDeleteRow(scope.$index)">
                                                </el-button>
                                            </el-button-group>


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
                    <el-button type="primary" round @click="openAddDialog">歌曲搜索<i
                            class="el-icon-search el-icon--right"></i></el-button>
                    <el-button type="primary" round @click="openImportDialog">列表导入<i
                            class="el-icon-upload el-icon--right"></i></el-button>
                    <el-button type="primary" round @click="handleExport">导出MP3<i
                            class="el-icon-document el-icon--right"></i></el-button>
                </div>
            </el-footer>
        </el-container>

    </div>
</template>

<script>
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
                        this.reloadCacheStatus();
                        break;
                    }
                }

            },
            currentPlayList: function (newVal, oldVal) {
                console.log("切换歌单", newVal);
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
                    console.log("iframe scope", $scope);

                    //$scope.showTag(4)调用无反应
                    // console.log($scope.showTag)

                } else if (newTab === "Manager") {


                }

            }

        },
        methods: {
            playByTrack: function (track) {
                if (this.lastPlayerNotify !== null) {
                    this.lastPlayerNotify.close();
                }

                utils.get_track_and_cache(track).then(url => {
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
            openAddDialog: function () {
                this.isAdd = true;
                this.searchDialogVisible = true;
            },
            openImportDialog: function () {
                this.importDialogVisible = true;
            },

            updateTracks: function (track, index) {

                let push = (t) => {
                    if (t.disabled) {
                        alert("disabled" + JSON.stringify(t));
                    } else {
                        this.currentTracks.push(t);
                    }
                };

                // FIXME:  加入歌单
                //
                // [Vue warn]: Error in render: "TypeError: Cannot read property 'type' of undefined"
                //
                // found in
                //
                // ---> <ElTableBody>
                // <ElTable>
                // <ElRow>
                if (index === undefined) { //插入
                    if (Array.isArray(track)) {
                        for (let t of track) {
                            push(t);
                        }
                    }
                    else {
                        push(track);
                    }
                } else {//修改某一行
                    Vue.set(this.currentTracks, index, track); // 由于JS限制Vue无法检测对象属性的添加或删除
                }
                this.saveCurrentPlayList();

            },
            saveCurrentPlayList: function () {
                console.log("saveCurrentPlayList", this.currentPlayList);
                listen1.update_myplaylist(this.currentPlayList);
            },

            handleEditComplete: function (row) {
                this.updateTracks(row, this.currentModifyRowIndex);
                this.searchDialogVisible = false;
                this.$message({
                    message: "编辑成功!",
                    type: "success"
                });
            },
            handleImportedFromList: function (tracks) {
                console.log("ImportedFromList", tracks);
                // TODO:
                this.updateTracks(tracks);
                this.$notify({message: "已经批量加入歌单!", type: "success"});
            },
            handleAdded: function (track) {
                console.log("added track", JSON.stringify(track));
                this.updateTracks(track);
                this.$notify({message: `"${track.title}"已经加入歌单!`, type: "success", duration: 1000});
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

            handleExport: function () {
                this.exportDialogVisible = true;
                this.$refs.exportDialog.doExport(this.currentPlayList.info.title, this.currentTracks);
            },
            handleDeletePlayList: function () {
                if (this.currentPlayList.info.title === "默认歌单") {
                    // TODO: 优化逻辑
                    this.$notify({type: "info", message: "默认歌单无法删除"});
                } else {
                    this.$confirm("此操作将永久该歌单删除, 是否继续?", "警告", {type: "danger"}).then(() => {
                        listen1.remove_myplaylist(this.currentPlayList.info.id);
                        this.reload().then(() => {
                            this.currentPlayListId = null;
                            this.currentPlayList = {};

                            this.$notify({type: "success", message: "删除成功!"});
                        });

                    }).catch((err) => {
                        console.log(err);
                        this.$notify({type: "info", message: "已取消删除"});
                    });
                }


            },


            handlePlaylistCarouselChanged(newIndex, oldIndex) {
                this.currentPlayListId = this.myPlayLists[newIndex].info.id;
            },
            handleMenuSelected: function (index, indexPath) {
                if (index === "Listen1") {
                    this.activeTabName = index;
                } else if (index === "APITest") {
                    this.test();
                } else if (indexPath[0] === "Manager") {
                    this.activeTabName = indexPath[0];// Manager,myplaylist_
                    if (index === "add") {
                        let title = "我的歌单" + new Date().getTime().toString();
                        let new_id = listen1.update_myplaylist({
                            is_mine: 1,
                            info: {
                                'cover_img_url': '/static/listen1_chrome_extension/images/mycover.jpg',
                                'title': title,
                                'source_url': ''
                            },
                            tracks: []
                        });

                        this.$message({showClose: true, message: "歌单(" + title + ")已新建", type: "success"});
                        this.reload();

                        this.currentPlayListId = new_id;

                    } else {
                        this.currentPlayListId = indexPath[1];
                    }
                }
            },
            handleMenuOpen: function (index, indexPath) {
                console.log(index, indexPath);
                if (indexPath[0] === "Manager") {
                    this.reload();
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
            reloadCacheStatus: function () {
                this.cacheStatus = [];
                for (let j = 0, len = this.currentPlayList.tracks.length; j < len; j++) {
                    let track = this.currentPlayList.tracks[j];
                    // TODO: cacheStatus 自动刷新
                    if (utils.is_track_cached(track)) {
                        this.cacheStatus.push({type: "success", text: "已缓存"});
                    } else {
                        this.cacheStatus.push({type: "danger", text: "未缓存"});
                    }
                }
            },
            test() {
                // TODO: 移动到unittest
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
                    if (count === 0) {

                        listen1.update_myplaylist({
                            info: {
                                'cover_img_url': '/static/listen1_chrome_extension/images/mycover.jpg',
                                'title': "默认歌单",
                                'source_url': ''
                            },
                            tracks: []
                        });
                        console.log("创建默认歌单");
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
    }

    .listen1bg {
        background-color: #333;
    }

</style>
