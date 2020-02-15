const cytoscape = require('cytoscape')
const WithEvents = require('./Libs/WithEvents')
const EditPanel = require('./editPanel')

module.exports = class Chart extends WithEvents {

    constructor({parentId, quickActions}){
        super();
        this.editPanel = new EditPanel();
        this.quickActions = quickActions;
        this.init(parentId)

        this.idPointer = 0;
        this.position = {
            x: 0,
            y: 0
        }
        this.picking = false;
        this.currentElement = null;
        this.currentElementPos = {x: 0, y: 0};
        this.editingElement = null;
        this.comps = {
            startNode: null,
            startEdge: null,
        }
        this.state = {
            addEdgeLock: false,
        };

        quickActions.on('itemClick', action => {
            if(action == 'delete') this.currentElement.remove();
            else if(action == 'edit') this.showEditPanel();
            else if(action == 'convert') this.convertTaskToChart(this.currentElement);
        })

        this.editPanel.on('save', data => this.saveEdits(data))
    }

    openChart(data){
        this.cy.json(data);
        for(let el of this.cy.elements().toArray()){
            this.addListeners(el)
            if(el.data('isChart') == 'yes'){
                this.onDoubleTap(el, () => this.openSubChart(el));
            }
        }
        const start = this.cy.$('[which="start"]');
        const edge = this.cy.$('[which="initial-transition"]');
        if(start && edge){
            start.off('cxttap');
            this._setStartComps(start, edge);
        }
        this.$emit('startNode', start.length > 0);
    }

    init(parentId) {
        const container = this.container = document.getElementById(parentId)
        const cy = this.cy = window.cy = cytoscape({
            container: container,
            maxZoom: 1.2,
            minZoom: 0.5,
            wheelSensitivity: 0.1,
            elements: [],
            style: [
                {
                    selector: "[which='task']",
                    style: {
                        'padding': '10px',
                        'background-color': 'white',
                        "border-width": '2',
                        "border-color": '#333',
                        "haystack-radius": '0',
                        'label': 'data(text)',
                        'width': 'label',
                        'height': 'label',
                        'text-wrap': 'wrap',
                        'text-valign': 'center',
                        'shape': 'round-rectangle',
                        'events': 'yes',
                        'text-events': 'yes',
                        'font-family': 'Expressway'
                    }
                },
                {
                    selector: "[which='juntion']",
                    style: {
                        "background-color": 'white',
                        "border-width": '2',
                        "border-color": '#333',
                    }
                },
                {
                    selector: 'edge',
                    style: {
                        'width': 2,
                        'line-color': '#888',
                        'target-arrow-color': '#888',
                        'target-arrow-shape': 'triangle',
                        'curve-style': 'taxi',
                        'text-rotation': 'autorotate',
                        'events': 'yes'
                    }
                },
                {
                    selector: 'edge[text]',
                    style: {
                        'label': 'data(text)',
                    }
                },
                {
                    selector: "[which='start']",
                    style: {
                        'label': 'Start'
                    }
                },
                {
                    selector: ':selected',
                    style: {
                        'border-color': '#0169D9',
                        'color': '#0169D9',
                        'line-color': '#0169D9',
                        'target-arrow-color': '#0169D9',
                    }
                },
                {
                    selector: '[isActive="yes"]',
                    style: {
                        // 'border-color': '#A30B49',
                        // 'color': '#A30B49',
                        "background-color": '#8ed6e8'
                    }
                },
                {
                    selector: "[isLoop='yes']",
                    style: {
                        'curve-style': 'loop'
                    }
                }
            ],
            layout: {
                name: 'grid',
                rows: 1
            }
        });

        cy.on('mousemove', e => this.position = e.position)

        container.addEventListener('dragover', e => e.preventDefault())
        container.addEventListener('drop', e => {
            const type = e.dataTransfer.getData('Text');
            setTimeout(() => this.addElement(type), 50)
            // ^^ Delaying is required to place the element in the correct position
        })
    }

    openSubChart(el){
        this.$emit('subchartTap', el)
    }

    convertTaskToChart(el){
        el.data('isChart', 'yes');
        el.data('text', el.data('text').split("\n")[0] ); // removing all lines of text except first one
        this.onDoubleTap(el, () => this.openSubChart(el));
    }

    saveEdits(data){
        const el = this.editingElement;
        const type = el.isNode() ? 'task' : 'transition';
        el.data('text', data.text);
        if(type == 'task'){
            el.data('decomposition', data.decomposition);
        }else{
            el.data('condition', data.condition);
            el.data('priority', data.priority);
        }
        this.editingElement = null;
    }

    showEditPanel(){
        const el = this.currentElement;
        const type = el.isNode() ? 'task' : 'transition';
        const data = { text: el.data('text') };
        if(type == 'task'){
            data.decomposition = el.data('decomposition');
            data.isChart = el.data('isChart') == 'yes';
        }else{
            data.condition = el.data('condition');
            data.priority = el.data('priority');
            data.maxPriority = el.source().connectedEdges().length;
        }
        this.editingElement = el;
        this.editPanel.show(this.currentElementPos, data, type);
    }

    async addEdge(type){
        if(this.state.addEdgeLock) return;
        this.state.addEdgeLock = true;

        this.container.style.cursor = 'crosshair';
        this.picking = true;
        if(type == 'initial-transition'){
            await this.startInitialEdgeCreation()
        }else{
            await this.startEdgeAttaching(type)
        }
        this.container.style.cursor = '';
        this.picking = false;

        this.state.addEdgeLock = false;
    }

    async startInitialEdgeCreation(){
        await this._promiseCoreOn('tap');
        const sourceEl = this.cy.add({
            data: {
                which: 'start'
            },
            position: this.position
        })
        const { target: targetEl } = await this.cy.nodes().promiseOn('tap');
        const edge = this.createEdge(sourceEl, targetEl, 'initial-transition')
        this._setStartComps(sourceEl, edge);
        this.$emit('startNode', true);
    }

    _setStartComps(sourceEl, edge){
        this.comps.startNode = sourceEl;
        this.comps.startEdge = edge;
        sourceEl.on('tap', () => setTimeout(() => edge.select(), 1));
        edge.on('tap', () => setTimeout(() => sourceEl.select(), 1));
        edge.on('remove', () => {
            this.comps.startNode.remove();
            this.comps.startNode = null;
            this.comps.startEdge = null;
            this.$emit('startNode', false)
        })
    }

    async startEdgeAttaching(type){
        const { target: sourceEL } = await this.cy.nodes().promiseOn('tap');
        const { target: targetEl } = await this.cy.nodes().promiseOn('tap');
        const isLoop = sourceEL === targetEl;
        this.createEdge(sourceEL, targetEl, type, isLoop)
    }

    createEdge(sourceEL, targetEl, type, isLoop, options){
        const { skipListeners } = options || {};
        const edge = { 
            data: { 
                id: 'edge_' + (this.idPointer++),
                which: type,
                source: sourceEL.data('id'),
                target: targetEl.data('id'),
                isLoop: isLoop ? 'yes' : 'no',
            }
        };
        const el = this.cy.add(edge);
        if(!skipListeners){
            this.addListeners(el);
        }
        return el;
    }

    async _promiseCoreOn(events){
        while(true){
            const event = await this.cy.promiseOn(events);
            if(event.target === this.cy){
                return event;
            }
        }
    }

    addElement(type){
        const id = 'EL' + (this.idPointer++);
        const el = this.cy.add({ 
            data: {
                id: id,
                text: 'New ' + type,
                which: type
            },
            position: this.position
        })
        this.addListeners(el);
    }

    onDoubleTap(el, callback){
        let tapped = false;
        el.on('tap', e => {
            if(tapped){
                callback(e);
                tapped = false;
            }else{
                tapped = true;
                setTimeout(() => tapped = false, 300);
            }
        })
    }

    addListeners(el){
        if(el.isNode()){
            el.on('mouseover', () => {
                if(this.picking) el.data('isActive', 'yes')
            })
            el.on('mouseout', () => {
                el.data('isActive', 'no')
            })
        }
        el.on('cxttap', e => this._elementRightClicked(e))
    }

    _elementRightClicked(e){
        const el = e.target;
        this.currentElement = el;

        const allowedActions = ['delete'];

        const wh = el.data('which');
        if(wh == 'task' || wh == 'transition')  allowedActions.push('edit');
        if(wh == 'task' && el.data('isChart') != 'yes') allowedActions.push('convert');   

        const box = el.renderedBoundingBox();
        const x = (box.x1 + box.x2) / 2;
        const y = box.y1;
        const pos = {x, y};
        this.currentElementPos = pos;
        quickActions.show(pos, allowedActions)
    }

}