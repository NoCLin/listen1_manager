<template>
    <div id="app">
        <router-view>
        </router-view>
    </div>
</template>

<script>
    export default {
        name: 'app'
    }
</script>

<style>
    body {
        margin: 0;
        font: caption;
        -webkit-user-select: none;
        padding: 0;
        width: 100%;
        height: 100%;
    }
    .el-input-group__prepend {
        background-color: #fff;
    }
    .el-input-group__append {
        background-color: #fff;
    }

</style>
