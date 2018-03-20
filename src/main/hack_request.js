// code from https://github.com/listen1/listen1_desktop/blob/master/app/main.js

function hack_referer_header(details) {
    var refererValue = '';
    if (details.url.indexOf("://music.163.com/") != -1) {
        refererValue = "http://music.163.com/";
    }

    if (details.url.indexOf(".xiami.com/") != -1) {
        refererValue = "http://m.xiami.com/";
    }

    if ((details.url.indexOf("y.qq.com/") != -1) ||
        (details.url.indexOf("qqmusic.qq.com/") != -1) ||
        (details.url.indexOf("music.qq.com/") != -1) ||
        (details.url.indexOf("imgcache.qq.com/") != -1)) {
        refererValue = "http://y.qq.com/";
    }

    var isRefererSet = false;
    var headers = details.requestHeaders;

    for (var i = 0, l = headers.length; i < l; ++i) {
        if ((headers[i].name == 'Referer') && (refererValue != '')) {
            headers[i].value = refererValue;
            isRefererSet = true;
            break;
        }
    }

    if ((!isRefererSet) && (refererValue != '')) {
        headers["Origin"] = refererValue;
        headers["Referer"] = refererValue;
    }
    details.requestHeaders = headers;
}

function hack_request(mainWindow) {
    const session = require("electron").session;

    const filter = {
        urls: ["*://music.163.com/*", "*://*.xiami.com/*", "*://*.qq.com/*",
            "https://listen1.github.io/listen1/callback.html?code=*"]
    };

    session.defaultSession.webRequest.onBeforeSendHeaders(filter, function (details, callback) {
        if (details.url.startsWith("https://listen1.github.io/listen1/callback.html?code=")) {
            const url = details.url;
            const code = url.split('=')[1];
            mainWindow.webContents.executeJavaScript('Github.handleCallback("' + code + '");');
        }
        else {
            hack_referer_header(details);
            details.requestHeaders["User-Agent"] = "Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/50.0.2661.87 Safari/537.36";
            details.requestHeaders["X-DevTools-Request-Id"] = null;
        }
        callback({cancel: false, requestHeaders: details.requestHeaders});
    });
}

export {hack_request};