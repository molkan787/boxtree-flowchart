const { promptFile, promptSaveFile, readFile, writeFile, changeExt } = require('./helpers');
const DataExtractor = require('./dataExtractor');
const config = require('./config');
const axios = require('axios');
const path = require('path');

class PM{

    static async save(currentFile){
        const filename = (currentFile && projectFilename) ? projectFilename : await promptSaveFile();
        if(!filename) return null;
        const data = this.getData();
        await writeFile(filename, JSON.stringify(data));
        return filename;
    }

    static async open(){
        const filename = await promptFile();
        if(!filename) return null;
        const raw = await readFile(filename);
        this.setData(JSON.parse(raw));
        return filename;
    }

    static async convert(){
        const data = this.getEssentialData();
        const resp = await axios({
            method: 'post',
            url: config.API_ENDPOINT,
            data,
            responseType: 'text'
        });
        const str = typeof resp.data == 'object' ? JSON.stringify(resp.data) : resp.data;
        console.log(resp)

        const filename = changeExt(projectFilename, 'txt')
        await writeFile(filename, str);
    }

    static getData(){
        return {
            charts,
            currentChartId,
            chartIdPointer,
            idPointer: chart.idPointer,
            breadcrumb: breadcrumb.stack,
            chartTitle
        }
    }

    static setData(data){
        charts = data.charts;
        currentChartId = data.currentChartId;
        chartIdPointer = data.chartIdPointer;
        chart.idPointer = data.idPointer;
        breadcrumb.stack = data.breadcrumb;
        chartTitle = data.chartTitle;
    }

    static getEssentialData(){
        const dex = new DataExtractor();
        return dex.extract(charts);
    }

}