const electron = require('electron')
const dialog = electron.dialog
const fs = require('fs')

module.exports = {

    val(sel, value){
        const el = document.querySelector(sel);
        if(typeof value !== 'undefined')  el.value = value;
        return el.value;
    },

    async promptFile() {
        const resp = await dialog.showOpenDialog()
        if (resp.canceled) return null

        return resp.filePaths[0]
    },

    async promptSaveFile() {
        const resp = await dialog.showSaveDialog()
        if (resp.canceled) return null

        return resp.filePath
    },

    readFile(filename) {
        return new Promise((resolve, reject) => {
            fs.readFile(filename, 'utf8', (err, contents) => {
                err ? reject(err) : resolve(contents)
            })
        })
    },

    writeFile(filename, data) {
        return new Promise((resolve, reject) => {
            fs.writeFile(filename, data, err => {
                err ? reject(err) : resolve()
            })
        })
    }

}