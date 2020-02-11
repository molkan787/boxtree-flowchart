const electron = require('electron')
 
electron.ipcRenderer.on('menuItemClick', (event, itemName) => {
    console.log(itemName)
})