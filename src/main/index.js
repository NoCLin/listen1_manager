/* eslint-disable no-undef */
const electron = require("electron");
const app = electron.app;
const BrowserWindow = electron.BrowserWindow;

const path = require("path");
const url = require("url");
const low = require("lowdb");
const FileSync = require("lowdb/adapters/FileSync");

const utils = require("../renderer/utils").default;

const adapter = new FileSync(utils.DB_FILE);
const db = low(adapter);

import {hack_request} from "./hack_request";

// TODO:音乐、歌手数据库
db.defaults({tracks: [], artists: []}).write();

// Keep a global reference of the window object, if you don"t, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow, appTray;

if (process.env.NODE_ENV !== "development") {
    global.__static = path.join(__dirname, "/static").replace(/\\/g, "\\\\");
}

function toggleVisible() {
    if (mainWindow.isFocused() && mainWindow.isVisible()) {
        mainWindow.hide();
    } else mainWindow.show();
}

function initialTray() {
    let trayIconPath = path.join(__static, "icons/tray.png");
    appTray = new electron.Tray(trayIconPath);

    const contextMenu = electron.Menu.buildFromTemplate([
        {
            label: "显示/隐藏", click() {
                toggleVisible();
            }
        },
        {
            label: "切换控制台",
            click: () => {
                mainWindow.webContents.toggleDevTools();
            }
        },
        {
            label: "退出", click() {
                app.quit();
            }
        },
    ]);
    appTray.setToolTip("Listen1 Manager");
    appTray.setContextMenu(contextMenu);
}

function initialMenu() {

    let template = [];
    if (process.platform === "darwin") {
        const name = electron.app.getName();
        template.push({
            label: name,
            submenu: [
                {label: `关于 ${name}`, role: "about"},
                {type: "separator"},
                {label: "服务", role: "services", submenu: []},
                {type: "separator"},
                {label: `隐藏 ${name}`, accelerator: "Command+H", role: "hide"},
                {label: "隐藏其他", accelerator: "Command+Alt+H", role: "hideothers"},
                {label: "全部显示", role: "unhide"},
                {type: "separator"},
                {
                    label: `退出 ${name}`, accelerator: "Command+Q", click() {
                        electron.app.quit();
                    }
                }
            ]
        });
        template.push({
            label: "编辑",
            submenu: [
                {label: "撤销", accelerator: "CmdOrCtrl+Z", selector: "undo:"},
                {label: "重做", accelerator: "Shift+CmdOrCtrl+Z", selector: "redo:"},
                {type: "separator"},
                {label: "剪切", accelerator: "CmdOrCtrl+X", selector: "cut:"},
                {label: "复制", accelerator: "CmdOrCtrl+C", selector: "copy:"},
                {label: "粘贴", accelerator: "CmdOrCtrl+V", selector: "paste:"},
                {label: "全选", accelerator: "CmdOrCtrl+A", selector: "selectAll:"}
            ]
        });
    }

    template.push({
        label: "显示",
        submenu: [
            // {label: "关于", selector: "orderFrontStandardAboutPanel:"},
            {type: "separator"},
            {
                label: "切换开发者工具",
                accelerator: (process.platform === "darwin") ? "Option+Command+I" : "Ctrl+Shift+I",
                click: () => {
                    mainWindow.webContents.toggleDevTools();
                }
            },
            {
                label: "刷新", accelerator: "CmdOrCtrl+R", click: function () {
                    mainWindow.webContents.reload();
                }
            },
            {
                label: "退出", accelerator: "CmdOrCtrl+Q", click: function () {
                    app.quit();
                }
            },
        ]
    });
    electron.Menu.setApplicationMenu(electron.Menu.buildFromTemplate(template));
}


function createWindow() {

    let iconPath = path.join(__static, "icons/icon.png");
    mainWindow = new BrowserWindow({
        width: 1200,
        height: 768,
        minHeight: 650,
        minWidth: 1120,
        icon: iconPath,
        show: false,
        webPreferences: {
            webSecurity: false,
            nodeIntegration: true
        }
    });

    hack_request(mainWindow);
    const winURL = (process.env.NODE_ENV === "development") ? "http://localhost:9080" : url.format({
        pathname: path.join(__dirname, "index.html"),
        protocol: "file:",
        slashes: true
    });

    mainWindow.loadURL(winURL);

    if (process.env.NODE_ENV === "development") mainWindow.webContents.openDevTools();

    mainWindow.once("ready-to-show", () => {
        mainWindow.show();
    });

    mainWindow.on("closed", function () {
        mainWindow = null;
    });

    if (process.platform === "darwin") initialMenu();
    initialTray();
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on("ready", function () {
    try {
        createWindow();
    } catch (e) {
        console.error(e);
        app.quit();
    }

});

// Quit when all windows are closed.
app.on("window-all-closed", function () {
    // On OS X it is common for applications and their menu bar
    // to stay active until the user quits explicitly with Cmd + Q
    if (process.platform !== "darwin") {
        app.quit();
    }
});

app.on("activate", function () {
    // On OS X it"s common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (mainWindow === null) {
        createWindow();
    }
});

