module.exports = class DataExtractor{

    constructor(){
        this.idPtr = 1;
        this.idsMap = {};
        this.charts = null;
    }

    id(oldId){
        if(oldId) this.idsMap[oldId] = this.idPtr;
        return this.idPtr++;
    }

    extract(charts){
        this.charts = charts;
        return {
            attributes:{
                title: 'My Chart',
                step: 'step'
            },
            body: this.getChartChilds('root')
        }
    }

    getChartChilds(chartId){
        const chart = this.charts[chartId];
        if(!chart) return [];
        const { nodes, edges } = chart.elements;
        const childs = [];
        for(let n of nodes){
            const c = this.getNode(n);
            if(c) childs.push(c);
        }
        for(let e of edges){
            const c = this.getEdge(e);
            if(c) childs.push(c);
        }
        return childs;
    }

    getNode(node){
        const { which, id } = node.data;
        if(which === 'start') return null;
        if(which === 'junction'){
            return  {
                attributes: {
                    what: 'junction',
                    id: this.id(id)
                }
            }
        }else if(which === 'task'){
            const { text, decomposition, isChart } = node.data;
            const data = {
                attributes: {
                    what: 'task',
                    name: text.split("\n")[0],
                    id: this.id(id),
                    decomposition: decomposition || 'serial',
                }
            }
            if(isChart === 'yes'){
                data.body = this.getChartChilds(node.data.chartId);
            }else{
                data.body = text.split("\n").splice(1)
            }
            return data;
        }
    }

    getEdge(edge){
        const { which, id, source, target, priority, condition } = edge.data;
        const is_start = which === 'initial-transition';
        return {
            attributes: {
                what: 'edge',
                id: this.id(id),
                ori: this.idsMap[source],
                des: this.idsMap[target],
                pri: priority || 1,
                type: is_start ? 'start' : 'regular'
            },
            condition
        }
    }

}