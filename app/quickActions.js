const WithEvents = require('./Libs/WithEvents')

module.exports = class QuickActions extends WithEvents{

    constructor({ selector }){
        super()
        this.el = document.querySelector(selector);
        this.el.addEventListener('blur', () => this._hideEl())
        const items = this.items = this.el.querySelectorAll('.item');
        for(let item of items){
            const action = item.getAttribute('action')
            item.addEventListener('click', () => this.itemClick(action))
        }
    }

    itemClick(action){
        this._hideEl();
        this.$emit('itemClick', action)
    }

    show(pos, allowedActions){
        this._setAllowedActions(allowedActions)
        this._setPanPosition(pos);
        this._showEl();
    }

    hide(){
        this._hideEl();
    }

    // ==========================================

    _setAllowedActions(actions){
        for(let item of this.items){
            const action = item.getAttribute('action');
            if(actions.includes(action)){
                item.removeAttribute('disabled')
            }else{
                item.setAttribute('disabled', '1')
            }
        }
    }

    _setPanPosition({x, y}){
        this.el.style.top = y + 'px';
        this.el.style.left = x + 'px';
    }

    _showEl(){
        clearTimeout(this._timer)
        this.el.style.display = 'flex';
        this.el.style.opacity = 1;
        this.el.focus();
    }
    
    _hideEl(){
        clearTimeout(this._timer)
        this.el.style.opacity = 0;
        this._timer = setTimeout(() => this.el.style.display = 'none', 500)
    }
}