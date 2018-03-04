const os = require("os");
const path = require("path");

const MANAGER_ROOT = (os.platform() === "win32") ?
    "C:\\listen1_manager" :
    path.join(os.homedir(), "listen1_manager");

const CACHE_DIR = path.join(MANAGER_ROOT, "cached");
const EXPORT_DIR = path.join(MANAGER_ROOT, "export");
const DB_FILE = path.join(MANAGER_ROOT, "db.json");


export default {
    MANAGER_ROOT: MANAGER_ROOT,
    CACHE_DIR: CACHE_DIR,
    EXPORT_DIR: EXPORT_DIR,
    DB_FILE: DB_FILE
};