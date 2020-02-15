let projectFilename = '';
let chart = null;
const charts = {};
let currentChartId = 'root';
let chartIdPointer = 1;
let quickActions;
const Chart = require('./chart')
const QuickActions = require('./quickActions')
const Breadcrumb = require('./breadcrumb')

window.addEventListener('load', () => {
    const breadcrumb = new Breadcrumb();
    quickActions = new QuickActions({selector: '#quickActions'})
    chart = new Chart({ parentId: 'chart', quickActions })
    chart.on('startNode', exist => setInitTransiState(!exist))
    chart.on('subchartTap', el => {
        let chartId = el.data('chartId');
        if(!chartId){
            chartId = makeSubchart();
            el.data('chartId', chartId);
        }
        breadcrumb.addItem(el.data('text'), chartId);
        openChart(chartId);
    })
    breadcrumb.addItem('Main', 'root');
    breadcrumb.on('itemClicked', chartId => openChart(chartId))
})

function openChart(id){
    charts[currentChartId] = chart.cy.json(); // saving current chart before opening new one
    chart.openChart(charts[id]);
    currentChartId = id;
}

function makeSubchart() {
    const chartId = chartIdPointer++;
    charts[chartId] = { elements: [] };
    return chartId;
}


function setInitTransiState(state) {
    const el = document.getElementById('tb-item-initial-transition');
    state ? el.removeAttribute('disabled') : el.setAttribute('disabled', '1')
}

const electron = require('electron')
electron.ipcRenderer.on('menuItemClick', (event, itemName) => {
    console.log(itemName)
})