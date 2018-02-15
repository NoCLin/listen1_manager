# listen1-manager


基于[listen1/listen1_chrome_extension](https://github.com/listen1/listen1_chrome_extension)开发的更全面的歌单管理工具。


使用 Electron + Vue + ElementUI 开发，通过原生JS调用Angular接口获取实现音乐平台信息，同时保留了原listen1_desktop的所有功能。


## Features

- Listen1歌单管理(CRUD)
- 更方便的搜索功能
    - 搜索结果整合  
    
- 批量导入
    - 按列表导入
    - 按歌单导入
    - 按专辑导入
    - 按歌手导入
    
- 整合Listen1 Desktop

## Development

```bash

git submodule update --init --recursive

yarn install

yarn run start

yarn run packager:mac
yarn run packager:win
yarn run packager:linux

```

## Changelog


**2018-2-14**

基本功能实现



## TODOs

- Vue-Webpack重构
- 组件结构调整
- 友好错误提示

- 搜索整合
    - 剔除大量翻唱结果
- 搜索结果链接搜索
- 歌单、歌手、专辑URL匹配
- 搜索翻页
- 试听显示歌词



## License

[MIT](LICENSE)




