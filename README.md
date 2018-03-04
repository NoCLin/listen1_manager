# listen1_manager

[![Mac/Linux Build Status](https://img.shields.io/travis/NoCLin/listen1_manager.svg?label=Mac%20OSX%20%26%20Linux)](https://travis-ci.org/NoCLin/listen1_manager)[![Windows Build status](https://img.shields.io/appveyor/ci/NoCLin/listen1-manager.svg?label=Windows)](https://ci.appveyor.com/project/NoCLin/listen1-manager)


*listen1_manager是一个跨平台的音乐管理解决方案，旨在提供更好的音乐体验。*

它基于 [listen1_chrome_extension](https://github.com/listen1/listen1_chrome_extension)和**Electron**开发，支持MacOS、Linux和Windows*

你可以使用多个音乐平台(目前已包含网易云音乐，QQ音乐，虾米音乐接口)的资源，并制作自己的跨平台歌单。


## Preview

**主界面**
 
![main](./screenshots/main.png)

## Features

- Listen1 歌单管理(CRUD)

- ~~本地缓存~~
  
- 搜索结果整合

- 批量导入
    - 由歌单
    - 由专辑
    - 由歌手
    - 由歌名列表
  
- Listen1 Desktop整合

## Development

*技术栈: Electron + Vue + vue-electron + ElementUI*

```bash
git clone https://github.com/NoCLin/listen1_manager.git

cd listen1_manager

git submodule update --init --recursive

yarn && yarn run dev
```

## Changelog

**2018-03-04**

- 添加新建歌单、删除歌单功能

**2018-03-03** 

- 修复虾米歌词接口bug
- 组件结构调整

**2018-02-26** 

- 接口简单测试、整理bugs

**2018-2-25**

- 使用Vue-Electron重构

**2018-2-14**

- 基本功能实现

[TODOs](TODOs.md)

## License

[MIT](LICENSE)




