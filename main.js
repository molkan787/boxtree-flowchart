const { app, BrowserWindow } = require('electron')
const menu = require('./menu')

let win

function createWindow(_menu) {
    win = new BrowserWindow({
        width: 800, height: 600, 'min-width': 1000, 'min-height': 600, webPreferences: {
            nodeIntegration: true
        }, show: false
    });
    win.setMenu(_menu);
    win.maximize();

    win.webContents.on('did-finish-load', function () {
        win.setMinimumSize(1000, 600);
        win.show();
    });

    win.loadFile(`app/index.html`)

    // win.webContents.openDevTools()

    win.on('closed', () => {
        win = null
    })

}

function handleItemClick(name){
    win.webContents.send('menuItemClick', name)
}

function init() {
    const _menu = menu(handleItemClick);
    createWindow(_menu);
}

app.on('ready', init)

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit()
    }
})

app.on('activate', () => {
    if (win === null) {
        createWindow()
    }
})