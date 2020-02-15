const tippy = require('tippy.js').default

window.addEventListener('load', () => {
    tippy('[data-tippy-content]', {
        placement: 'right'
    })
    const items = document.querySelectorAll('#toolbox > .item');
    for(let item of items){
        const type = item.getAttribute('el-type');
        if(type){
            if(item.draggable){
                item.addEventListener('dragstart', e => {
                    e.dataTransfer.setData('Text', type)
                })
            }else{
                item.addEventListener('click', () => {
                    item.style.cursor = 'crosshair';
                    chart.addEdge(type)
                })
                item.addEventListener('mouseout', () => item.style.cursor = 'pointer');
            }
        }
    }
})