<template>

    <!--TODO:启动时loading-->
    <div>
        <el-dialog :visible.sync="addAndEditDialogVisible"
                   width="80%"
                   height="80%"
                   :close-on-click-modal="false"
                   :center="true">
        <span slot="title" class="el-dialog__title">
            <div v-if="isAdd">添加</div>
            <div v-if="!isAdd">正在编辑"{{currentModifyRow.title}}"</div>
        </span>
            <AddAndEditDialogContent
                    :track="currentModifyRow"
                    :isadd="isAdd"
                    @selected="handleEditComplete"
                    @added="handleAdded"
                    @play="playByTrack">
            </AddAndEditDialogContent>
            <span slot="footer" class="dialog-footer">
            <el-button @click="addAndEditDialogVisible = false">关闭窗口</el-button>
        </span>
        </el-dialog>

        <el-dialog :visible.sync="importDialogVisible" title="批量导入"
                   width="80%"
                   height="80%"
                   :close-on-click-modal="false"
                   :center="true"
        >

            <ImportDialogContent
                    @play="playByTrack"
                    @imported="handleImportedFromList">
            </ImportDialogContent>
            <span slot="footer" class="dialog-footer">
            <el-button @click="importDialogVisible = false">关闭窗口</el-button>
        </span>
        </el-dialog>

        <el-dialog :visible.sync="exportStatusDialogVisible" title="导出结果"
                   width="80%"
                   height="80%"
                   :close-on-click-modal="false"
                   :center="true"
        >
            <template>
                <el-table
                        :data="exportStatus"
                        max-height="480"
                        style="width: 100%">
                    <el-table-column
                            type="index"
                            fixed="left"
                            width="50">
                    </el-table-column>
                    <el-table-column
                            prop="title"
                            label="标题"
                            width="400">
                    </el-table-column>
                    <el-table-column
                            prop="status"
                            label="状态"
                            width="180">
                        <template slot-scope="scope">
                            <div v-if="'success' === scope.row.status">
                                <el-tag type="success">导出成功</el-tag>
                            </div>
                            <div v-if="'uncached' === scope.row.status">
                                <el-tag type="danger">请先缓存</el-tag>
                            </div>
                            <div v-if="'none' === scope.row.status">
                                <el-tag type="danger">状态未知</el-tag>
                            </div>
                            <div v-if="'exists' === scope.row.status">
                                <el-tag type="warning">文件已存在</el-tag>
                            </div>
                        </template>
                    </el-table-column>
                </el-table>
                <el-button type="primary" round @click="handleOpenExportDir">打开导出目录</el-button>
            </template>
            <!--this.exportStatusDialogVisible = true;-->
        </el-dialog>


        <el-container>
            <el-header>
                <el-menu :default-active="activeTabName" @select="handleMenuSelected" menu-trigger="click"
                         mode="horizontal">
                    <el-submenu index="Manager">
                        <template slot="title"><i class="el-icon-edit"></i> Manager</template>

                        <el-menu-item
                                v-for="playList in myPlaylists"
                                :index="playList.info.id"
                                :key="playList.info.id">
                            {{playList.info.title}}
                        </el-menu-item>

                        <el-menu-item index="add">创建歌单</el-menu-item>

                    </el-submenu>
                    <el-menu-item index="Listen1"><i class="el-icon-service"></i>Listen1</el-menu-item>
                </el-menu>
            </el-header>

            <el-main style="padding: 0;" :class="{'listen1bg' : activeTabName === 'Listen1' }">
                <div v-show="activeTabName === 'Manager'" style="padding: 8px;">


                    <el-row>
                        <el-col style="width:50vw; max-width: 500px;">
                            <el-row style="margin-top: 5px;">
                                <el-select v-model="currentPlayListId" style="width:100%">
                                    <el-option
                                            v-for="playList in myPlaylists"
                                            :key="playList.info.id"
                                            :label="playList.info.title + '(' + playList.info.id + ')'"
                                            :value="playList.info.id">
                                    </el-option>
                                </el-select>
                            </el-row>
                            <el-row style="margin-top: 5px; background: #475669;">
                                <el-carousel ref="playlistCarousel" :autoplay="false" type="card"
                                             @change="handlePlaylistCarouselChanged"
                                             height="200px"
                                >
                                    <el-carousel-item v-for="playList in myPlaylists" :key="playList.info.id"
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
                                        :data="playListTableData"
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
                                            prop="status"
                                            label="状态"
                                            width="100">
                                        <template slot-scope="scope">
                                            <div v-if="'cached' === status[scope.$index]">
                                                <el-tag type="success">已缓存</el-tag>
                                            </div>
                                            <div v-if="'uncached' === status[scope.$index]">
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

                <div class="control-buttons" v-show="activeTabName === 'Manager'">
                    <el-button type="primary" round @click="openAddDialog">音乐搜索</el-button>
                    <el-button type="primary" round @click="openImportDialog">批量导入</el-button>
                    <!--TODO:整理导出功能-->

                    <el-button type="primary" round @click="handleDownloadAll">开始下载</el-button>

                    <el-button type="primary" round @click="handleExport">导出歌单</el-button>
                </div>
            </el-footer>
        </el-container>


    </div>
</template>

<script>
    const path = require("path");
    const fs = require("fs");

    const Vue = require("vue").default;

    const {shell} = require('electron');

    const AddAndEditDialogContent = require("./components/AddAndEditDialogContent.vue").default;
    const ImportDialogContent = require("./components/ImportDialogContent.vue").default;

    const listen1 = require("../listen1.js").default;
    const utils = require("../utils.js").default;

    export default {
        components: {AddAndEditDialogContent, ImportDialogContent},
        data: function () {
            return {
                importDialogVisible: false,
                addAndEditDialogVisible: false,
                activeIndex: "",
                activeTabName: "Listen1",
                currentModifyRow: {},
                currentModifyRowIndex: -1,
                isAdd: false,
                myPlaylists: [],
                status: [],
                playListTableData: [],
                currentPlayListId: "",
                currentPlayList: {},
                lastPlayerNotify: null,
                exportStatusDialogVisible: false,
                exportStatus: []
            };
        },
        computed: {},
        watch: {
            currentPlayListId: function (newId, oldId) {

                this.$refs.playlistCarousel.setActiveItem(newId);

                for (let i = 0, len = this.myPlaylists.length; i < len; i++) {
                    if (this.myPlaylists[i].info.id === newId) {

                        this.currentPlayList = this.myPlaylists[i];
                        this.playListTableData = this.myPlaylists[i].tracks;
                        this.status = [];
                        for (let j = 0, len = this.myPlaylists[i].tracks.length; j < len; j++) {
                            let track = this.myPlaylists[i].tracks[j];

                            if (utils.is_track_cached(track.id)) {
                                this.status.push("cached");
                            } else {
                                this.status.push("uncached");
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

                    utils.get_music_and_cache_by_id(track.id).then(url => {
                        console.log("缓存成功！" + url);
                        Vue.set(this.status, i, "成功");
                    });

                }

            },
            handleExport: function () {

                let result = new Array(this.playListTableData.length);

                for (let i in  this.playListTableData) {
                    let track = this.playListTableData[i];

                    let filename = `${track.artist} - ${track.title}.mp3`;
                    filename = filename.replace("/", "");
                    // TODO: 非法文件名检测
                    // TODO: 歌词下载

                    result[i] = {
                        "title": filename,
                        "status": "none"
                    };

                    const DES_DIR = path.join(utils.MANAGER_ROOT, "export", this.currentPlayList.info.title);
                    utils.mkdirSync(DES_DIR);

                    const DES_PATH = path.join(DES_DIR, filename);

                    const SRC_PATH = utils.to_cached_path(track.id);


                    if (fs.existsSync(SRC_PATH)) {
                        if (fs.existsSync(DES_PATH) && fs.statSync(DES_PATH).size > 0) {
                            result[i].status = "exists";
                        } else {
                            let fileReadStream = fs.createReadStream(SRC_PATH);
                            let fileWriteStream = fs.createWriteStream(DES_PATH);
                            fileReadStream.pipe(fileWriteStream);
                            fileWriteStream.on("close", function () {
                                result[i].status = "success";
                            });
                        }
                    } else {
                        result[i].status = "uncached";
                    }
                }

                this.exportStatus = result;
                this.exportStatusDialogVisible = true;

                console.log(result);
            },
            handleOpenExportDir: function () {
                shell.showItemInFolder(path.join(utils.MANAGER_ROOT, "export"))
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
            handlePlaylistCarouselChanged(newIndex, oldIndex) {
                // console.log(newIndex, oldIndex);
                this.currentPlayListId = this.myPlaylists[newIndex].info.id;
            },
            handleMenuSelected: function (index, indexPath) {
                // console.log(index, indexPath);
                if (index === "Listen1") {
                    this.activeTabName = index;
                } else {
                    this.activeTabName = indexPath[0];// Manager
                    if (index === "add") {
                        alert("add");
                    } else {
                        this.currentPlayListId = index;
                    }
                }


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
