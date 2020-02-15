const electron = require('electron')
const dialog = electron.remote.dialog
const fs = require('fs')

const options = {
    filters: [{
      name: 'JSON File',
      extensions: ['json']
    }]
};

module.exports = {

    val(sel, value){
        const el = document.querySelector(sel);
        if(typeof value !== 'undefined')  el.value = value;
        return el.value;
    },

    changeExt(path, newExt){
        let parts = path.split('.');
        parts.pop();
        parts = parts.join('.');
        return parts + '.' + newExt;
    },

    async promptFile() {
        const resp = await dialog.showOpenDialog(options)
        if (resp.canceled) return null

        return resp.filePaths[0]
    },

    async promptSaveFile() {
        const resp = await dialog.showSaveDialog(options)
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