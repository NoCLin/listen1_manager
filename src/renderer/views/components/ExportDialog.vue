<template>
    <div>

        <el-dialog :visible.sync="visible" title="导出结果"
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
                        width="400">
                </el-table-column>
                <el-table-column
                        prop="status"
                        label="状态"
                        width="180">
                    <template slot-scope="scope">
                        <div v-if="'success' === scope.row.exportStatus">
                            <el-tag type="success">导出成功</el-tag>
                        </div>
                        <div v-if="'uncached' === scope.row.exportStatus">
                            <el-tag type="danger">请先缓存</el-tag>
                        </div>
                        <div v-if="'none' === scope.row.exportStatus">
                            <el-tag type="danger">状态未知</el-tag>
                        </div>
                        <div v-if="'exists' === scope.row.exportStatus">
                            <el-tag type="warning">文件已存在</el-tag>
                        </div>
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
    const settings = require("../../../main/settings").default;
    const {shell} = require('electron');
    export default {
        data: function () {
            return {};
        },
        computed: {},
        watch: {},
        props: ["visible", "exportResult"],
        methods: {
            emitClose: function () {
                this.$emit("close");
            },
            handleOpenExportDir: function () {
                shell.showItemInFolder(settings.EXPORT_DIR)
            },
        }
    }
</script>

<style scoped>

</style>