/* eslint-disable no-undef */
const electron = require("electron");
// Module to control application life.
const app = electron.app;
// Module to create native browser window.
const BrowserWindow = electron.BrowserWindow;

const path = require("path");
const url = require("url");

// Keep a global reference of the window object, if you don"t, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow;

function initialTray(mainWindow) {
    const {app, Menu, Tray} = require("electron");

    let trayIconPath = path.join(__dirname, "assets/icons/tray.png");
    let appTray = new Tray(trayIconPath);

    function toggleVisible() {
        if (mainWindow.isVisible()) mainWindow.hide();
        else mainWindow.show();
    }

    const contextMenu = Menu.buildFromTemplate([
        {
            label: "Show/Hide Window", click() {
                toggleVisible();
            }
        },
        {
            label: "Quit", click() {
                app.quit();
            }
        },
    ]);
    appTray.setToolTip("Listen Manager");
    appTray.setContextMenu(contextMenu);
}

function createWindow() {

    // Form Listen1 Desktop
    const session = require("electron").session;
    const filter = {
        urls: ["*://music.163.com/*", "*://*.xiami.com/*", "*://*.qq.com/*"]
    };

    function hack_referer_header(details) {
        let referer_value = "";
        if (details.url.indexOf("://music.163.com/") !== -1) {
            referer_value = "http://music.163.com/";
        }

        if (details.url.indexOf(".xiami.com/") !== -1) {
            referer_value = "http://m.xiami.com/";
        }

        if ((details.url.indexOf("y.qq.com/") !== -1) ||
            (details.url.indexOf("qqmusic.qq.com/") !== -1) ||
            (details.url.indexOf("music.qq.com/") !== -1) ||
            (details.url.indexOf("imgcache.qq.com/") !== -1)) {
            referer_value = "http://y.qq.com/";
        }

        let isRefererSet = false;
        let isOriginSet = false;
        let headers = details.requestHeaders;

        for (let i = 0, l = headers.length; i < l; ++i) {
            if ((headers[i].name === "Referer") && (referer_value !== "")) {
                headers[i].value = referer_value;
                isRefererSet = true;
            }
            if ((headers[i].name === "Origin") && (referer_value !== "")) {
                headers[i].value = referer_value;
                isOriginSet = true;
            }
        }

        if ((!isRefererSet) && (referer_value !== "")) {
            headers["Referer"] = referer_value;
        }


        if ((!isOriginSet) && (referer_value !== "")) {
            headers["Origin"] = referer_value;
        }

        details.requestHeaders = headers;
    }

    session.defaultSession.webRequest.onBeforeSendHeaders(filter, function (details, callback) {
        hack_referer_header(details);
        details.requestHeaders["User-Agent"] = "Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/50.0.2661.87 Safari/537.36";
        callback({cancel: false, requestHeaders: details.requestHeaders});
    });


    let iconPath = path.join(__dirname, "assets/icons/icon.png");
    // Create the browser window.
    mainWindow = new BrowserWindow({
        width: 1200,
        height: 768,
        icon: iconPath
    });

    // and load the index.html of the app.
    mainWindow.loadURL(url.format({
        pathname: path.join(__dirname, "index.html"),
        protocol: "file:",
        slashes: true
    }));


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

    initialTray(mainWindow);


    // Open the DevTools.
    // mainWindow.webContents.openDevTools()

    // Emitted when the window is closed.
    mainWindow.on("closed", function () {
        // Dereference the window object, usually you would store windows
        // in an array if your app supports multi windows, this is the time
        // when you should delete the corresponding element.
        mainWindow = null;
    });
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on("ready", createWindow);

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

