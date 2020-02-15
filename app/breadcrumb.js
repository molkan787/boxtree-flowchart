const WithEvents = require('./Libs/WithEvents');

module.exports = class Breadcrumb extends WithEvents{

    constructor(){
        super();
        this.el = document.getElementById('breadcrumb');
        this.stack = [];
    }

    _itemClicked(value){
        const index = this.stack.findIndex(i => i.value === value);
        if(index === (this.stack.length - 1)) return;
        this.stack.splice(index + 1);
        this.build();
        this.$emit('itemClicked', value);
    }

    setItems(items){
        this.stack = items;
        this.build();
    }

    addItem(text, value){
        const item = {text, value};
        this.stack.push(item);
        this.createItem(item, this.stack.length === 1);
    }

    build(){
        this.el.innerHTML = '';
        this.stack.forEach((item, index) => this.createItem(item, index === 0))
    }

    createItem(data, isFirst){
        if(!isFirst){
            const img = document.createElement('img');
            img.src = 'assets/icons/BreadcrumbSeparator.png';
            this.el.appendChild(img);
        }

        const span = document.createElement('span');
        span.innerText = data.text;
        this.el.appendChild(span);
        span.onclick = () => this._itemClicked(data.value);
    }

}