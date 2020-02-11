const { Menu } = require('electron');

module.exports = function (clickHandler) {
    const template = [
        {
            label: 'File',
            submenu: [
                {
                    label: 'Save',
                    accelerator: 'Control+S',
                    click: () => clickHandler('save')
                },
                {
                    label: 'Save As',
                    accelerator: 'Control+Shift+S',
                    click: () => clickHandler('save_as')
                },
                {
                    label: 'Open',
                    accelerator: 'Control+O',
                    click: () => clickHandler('open')
                }
            ]
        },
        {
            label: 'Edit',
            submenu: [
                {
                    label: 'Select All',
                    click: () => clickHandler('select_all')
                },
                {
                    type: 'separator'
                },
                {
                    label: 'Copy',
                    accelerator: 'Control+C',
                    click: () => clickHandler('copy')
                },
                {
                    label: 'Cut',
                    accelerator: 'Control+X',
                    click: () => clickHandler('cut')
                },
                {
                    label: 'Paste',
                    accelerator: 'Control+V',
                    click: () => clickHandler('paste')
                }
            ]
        },
        {
            label: 'Tools',
            submenu: [
                {
                    label: 'Convert',
                    click: () => clickHandler('convert')
                }
            ]
        }
    ]
    return Menu.buildFromTemplate(template)
}