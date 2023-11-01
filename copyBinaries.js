var fs = require('fs-extra');
var path = require('path');
var sourceFolder = path.resolve(__dirname, 'public', 'binding');
var targetFolder = path.resolve(__dirname, 'dist', 'server', 'node_modules', 'sqlite3', 'lib', 'binding');
var DBs = {
    NWRDB: path.resolve(__dirname, 'public', 'NWR.db'),
    authDB: path.resolve(__dirname, 'public', 'auth.db'),
    settings: path.resolve(__dirname, 'public', 'settings.json'),
    target: path.resolve(__dirname, 'dist', 'server'),
};
fs.copySync(sourceFolder, targetFolder, {
    overwrite: true,
});
fs.copyFileSync(DBs.settings, DBs.target);
fs.copyFileSync(DBs.NWRDB, DBs.target);
fs.copyFileSync(DBs.authDB, DBs.target);
