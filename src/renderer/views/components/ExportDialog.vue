<template>
    <div>

        <el-dialog :visible.sync="visible" title="导出结果"
                   width="60%"
                   height="80%"
                   :center="true"
                   :close-on-click-modal="false"
                   :show-close="false">
            <el-table
                    :data="exportResult"
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
                        width="280">
                </el-table-column>
                <el-table-column
                        label="状态"
                        width="180">
                    <template slot-scope="scope">

                        <el-tag v-if="scope.row.status" :type="scope.row.type">
                            <i v-if="scope.row.type!=='success' && scope.row.type!=='danger'"
                               class="el-icon-loading"> </i>
                            {{scope.row.status}}
                        </el-tag>
                    </template>
                </el-table-column>
            </el-table>
            <span slot="footer" class="dialog-footer">
                <el-button type="primary" round @click="handleOpenExportDir">打开导出目录</el-button>
                <el-button round @click="emitClose">关闭窗口</el-button>
            </span>
        </el-dialog>

    </div>

</template>
<script>
    const {shell} = require('electron');
    const path = require("path");
    const fs = require("fs");
    const Vue = require("vue").default;


    const utils = require("../../utils.js").default;

    export default {
        data: function () {
            return {
                exportResult: []
            };
        },
        computed: {},
        watch: {},
        props: ["visible"],
        methods: {
            emitClose: function () {
                this.$emit("close");
            },
            handleOpenExportDir: function () {
                shell.showItemInFolder(utils.EXPORT_DIR)
            },
            doExport: async function (title, tracks) {
                console.log(title, tracks);


                this.exportResult = [];

                const DES_DIR = path.join(utils.EXPORT_DIR, utils.filename_filter(title));
                utils.mkdirsSync(DES_DIR);

                for (let i = 0; i < tracks.length; i++) {

                    let track = tracks[i];

                    let filename = utils.to_export_filename(track);
                    const DES_PATH = path.join(DES_DIR, filename);
                    const SRC_PATH = utils.to_cached_path(track);

                    this.exportResult.push({});

                    if (fs.existsSync(DES_PATH) && fs.statSync(DES_PATH).size > 0) {
                        Vue.set(this.exportResult, i, {title: filename, type: "success", status: "目标文件已存在"});
                        console.log("文件已存在", DES_PATH);
                    } else {


                        let copy_file = (src, des) => {
                            console.log("复制到", des);
                            Vue.set(this.exportResult, i, {title: filename, type: "warning", status: "复制文件中"});

                            let readStream = fs.createReadStream(src);
                            let writeStream = fs.createWriteStream(des);
                            readStream.pipe(writeStream);

                            readStream.on('end', () => {
                                Vue.set(this.exportResult, i, {title: filename, type: "success", status: "导出成功"});
                                // TODO: MP3解析
                            });
                            readStream.on('error', () => {
                                Vue.set(this.exportResult, i, {title: filename, type: "danger", status: "复制失败"});
                                console.log('copy error');
                            });

                        };
                        if (!fs.existsSync(SRC_PATH)) {
                            console.log("正在缓存", SRC_PATH);
                            Vue.set(this.exportResult, i, {title: filename, type: "warning", status: "正在缓存"});
                            // TODO: 下载进度
                            utils.get_track_and_cache(track).then(url => {
                                Vue.set(this.exportResult, i, {
                                    title: filename,
                                    type: "success",
                                    status: "下载成功"
                                });
                                copy_file(SRC_PATH, DES_PATH);
                            }).catch(err => {
                                console.log("下载失败", err);
                                Vue.set(this.exportResult, i, {
                                    title: filename,
                                    type: "danger",
                                    status: "下载失败"
                                });
                            })
                        } else {
                            copy_file(SRC_PATH, DES_PATH);
                        }


                    }


                }
            }
        }
    }
</script>

<style scoped>

</style>