/* eslint-disable no-undef */

let listen1 = require("../listen1.js");

Vue.component("add-edit-dialog-content", {
    //使li显示隐藏
    data: function () {
        return {
            temp_search_title: "",
            temp_search_result: [],
            tableLoading: false
        };
    },
    watch: {},
    props: ["track", "isadd"],
    methods: {
        emitSelected: function (row) {
            this.$emit("selected", row);
        },
        emitAdded: function (row) {
            this.$emit("added", row);
        },
        emitPlay: function (row) {
            this.$emit("play", row);
        },

        handleSearch: function () {
            let keywords = this.temp_search_title;

            let r_ne = [], r_qq = [], r_xm = [];

            if (keywords.trim(" ") !== "") {
                this.tableLoading = true;
                this.temp_search_result = [];
                listen1.search("netease", keywords).then(data => {

                    for (let v of data.result)
                        r_ne.push(v);

                    listen1.search("qq", keywords).then(data => {

                        for (let v of data.result)
                            r_qq.push(v);

                        listen1.search("xiami", keywords).then(data => {

                            for (let v of data.result)
                                r_xm.push(v);

                            let max_len = r_ne.length;
                            if (max_len < r_qq.length) max_len = r_qq.length;
                            if (max_len < r_xm.length) max_len = r_xm.length;

                            for (let i = 0; i < max_len; i++) {
                                if (i < r_ne.length) this.temp_search_result.push(r_ne[i]);
                                if (i < r_qq.length) this.temp_search_result.push(r_qq[i]);
                                if (i < r_xm.length) this.temp_search_result.push(r_xm[i]);
                            }


                            this.tableLoading = false;
                        }).catch(err => {
                            this.tableLoading = false;
                            alert("xiami_error" + err);
                        });

                    }).catch(err => {
                        this.tableLoading = false;
                        alert("qq_error" + err);
                    });

                }).catch(err => {
                    this.tableLoading = false;
                    alert("netease_error" + err);
                });

            }
        }
    },
    template: `<div>
    <div v-if="!isadd">
        <p>{{ track.title }} ({{ track.id }})来源: {{ track.source }} </p>
        <p>歌手: {{ track.artist }} ({{ track.artist_id }}) 专辑: {{ track.album }} ({{ track.album_id }})</p>

    </div>

    <div style="margin-top: 15px;">
        <el-input placeholder="请输入歌曲名，歌手或专辑" v-model="temp_search_title" clearable @keyup.enter.native="handleSearch"
                  class="select-source">
            <!--<el-select v-model="temp_source" slot="prepend">-->
            <!--<el-option label="网易云音乐" value="netease"></el-option>-->
            <!--<el-option label="QQ音乐" value="qq"></el-option>-->
            <!--<el-option label="虾米音乐" value="xiami"></el-option>-->
            <!--</el-select>-->
            <el-button slot="append" icon="el-icon-search" @click="handleSearch"></el-button>
        </el-input>
    </div>


    <el-table ref="singleTable"
              :data="temp_search_result"
              v-loading="tableLoading"
              style="width: 100%">
        <el-table-column type="index" width="50">
        </el-table-column>
        <el-table-column prop="source" label="来源" width="100">
        </el-table-column>
        <el-table-column prop="title" label="歌名" width="180">
            <template slot-scope="scope">
                <el-tooltip class="item" effect="dark" :content="scope.row.id" placement="top">
                    <el-tag size="medium">{{scope.row.title}}</el-tag>
                </el-tooltip>
            </template>
        </el-table-column>
        <el-table-column prop="artist" label="歌手" width="180">
            <template slot-scope="scope">
                <el-tooltip class="item" effect="dark" :content="scope.row.artist_id" placement="top">
                    <el-tag size="medium">{{scope.row.artist}}</el-tag>
                </el-tooltip>
            </template>
        </el-table-column>
        <el-table-column prop="album" label="专辑" width="300">
            <template slot-scope="scope">
                <el-tooltip class="item" effect="dark" :content="scope.row.album_id" placement="top">
                    <el-tag size="medium">{{scope.row.album}}</el-tag>
                </el-tooltip>
            </template>
        </el-table-column>

        <el-table-column fixed="right" label="操作">
            <template slot-scope="scope">
                <el-button type="primary" size="mini" icon="el-icon-service" @click="emitPlay(scope.row)">试听</el-button>
                <el-button type="primary" size="mini" v-if="isadd" icon="el-icon-success" @click="emitAdded(scope.row)">
                    加入歌单
                </el-button>
                <el-button type="primary" size="mini" v-if="!isadd" icon="el-icon-circle-plus-outline"
                           @click="emitSelected(scope.row)">选择
                </el-button>

            </template>
        </el-table-column>
    </el-table>

    <el-pagination small layout="prev, pager, next" :total="50">
    </el-pagination>


</div>`
});