const { app, BrowserWindow, ipcMain, dialog } = require("electron");
const path = require("path");
const URL = require("url").URL;

let mainWindow

const createWindow = () => {
    mainWindow = new BrowserWindow({
        width: 800,
        height: 600,

        webPreferences: {
            preload: path.join(__dirname, "preload.js"),
            nodeIntegration: true,
            contextIsolation: false,
            enableRemoteModule: true,
        },
    });

    mainWindow.loadFile(path.join(__dirname, "index.html"));
    mainWindow.setMenu(null);

    // Open the DevTools.
    mainWindow.webContents.openDevTools();
};

app.on("ready", () => {
    createWindow();
    ipcMain.on("open_dev_tools", () => {
        if (mainWindow) {
            console.log("opening devTools...")
            mainWindow.webContents.openDevTools();
        }
    })
});

app.setName("Негарантийный ремонт");

app.on("web-contents-created", (event, contents) => {
    contents.on("will-navigate", (event, navigationUrl) => {
        const parsedUrl = new URL(navigationUrl);

        if (parsedUrl.origin !== "https://my-own-server.com") {
            event.preventDefault();
        }
    });
});

app.on("window-all-closed", () => {
    if (process.platform !== "darwin") {
        app.quit();
    }
});

app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
    }
});

// Обработчик запроса на выбор папки
ipcMain.on("open_folder_dialog", (event, options) => {
    const { query, title } = options
    const dialogOptions = {
        title,
        properties: ['openDirectory']
    }

    dialog.showOpenDialog(dialogOptions).then((result) => {
        const directoryPath = result.filePaths[0]
        if (!result.canceled) {
            event.reply(query, directoryPath)
        }
    })
})

// Обработчик запроса на выбор файла
ipcMain.on("open_7z_archive", (event, options) => {
    const { title, query } = options
    const dialogOptions = {
        title,
        filters: [
            { name: "7z архивы", extensions: ["7z"], }
        ],
        properties: ["openFile"]
    }

    dialog.showOpenDialog(dialogOptions).then(result => {
        const { filePaths } = result
        if (!result.canceled) {
            event.reply(query, filePaths[0])
        }
    })
})