let projectFilename = '';
let chartTitle = 'My Chart';
let chart = null;
let charts = {};
let currentChartId = 'root';
let chartIdPointer = 1;
let quickActions;
let breadcrumb;
const Chart = require('./chart')
const QuickActions = require('./quickActions')
const Breadcrumb = require('./breadcrumb')

window.addEventListener('load', () => {
    breadcrumb = new Breadcrumb();
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
    });
    breadcrumb.addItem(chartTitle, 'root');
    breadcrumb.on('itemClicked', chartId => openChart(chartId))
    
    document.body.oncopy = () => chart.copy();
    document.body.oncut = () => chart.cut();
    document.body.onpaste = () => chart.paste();
})

function openChart(id){
    backCurrentChart();
    chart.openChart(charts[id]);
    currentChartId = id;
}

function backCurrentChart(){
    charts[currentChartId] = chart.cy.json();
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
    switch (itemName) {
        case 'save':
            backCurrentChart();
            PM.save(true).then(fn => setProjectFilename(fn));
            break;
        case 'save_as':
            backCurrentChart();
            PM.save().then(fn => setProjectFilename(fn));
            break;
        case 'open':
            openProject();
            break;
        case 'select_all':
            chart.selectAll();
            break;
        case 'copy':
            chart.copy();
            break;
        case 'cut':
            chart.cut();
            break;
        case 'paste':
            chart.paste();
            break;
        case 'convert':
            this.convert();
            break;
        default:
            break;
    }
})

async function openProject(){
    const filename = await PM.open();
    if(!filename) return;
    setProjectFilename(filename);
    chart.openChart(charts[currentChartId]);
    breadcrumb.build();
}

function setProjectFilename(str){
    if(str == null) return;
    projectFilename = str;
    document.title = `BoxTree (${str})`
}

async function convert(){
    waitPanel(true);
    backCurrentChart();
    projectFilename = await PM.save(true);
    PM.convert()
    waitPanel(false)
}