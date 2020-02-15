const WithEvents = require('./Libs/WithEvents');
const { val } = require('./helpers');

module.exports = class EditPanel extends WithEvents{

    constructor(){
        super();
        this.el = document.getElementById('editPanel');
        this.taskFormEl = document.getElementById('editPanelTask');
        this.transitionFormEl = document.getElementById('editPanelTransition');
        document.getElementById('edit_okBtn').addEventListener('click', () => this._okBtnClick())

        document.getElementById('edit_Priority').addEventListener('input',function () {
            const val = parseInt(this.value);
            if(val < 1) this.value = 1;
            else if(val > this.max) this.value = this.max;
        })

        document.getElementById('edit_Label').onkeydown = this._textareaChange;
        document.getElementById('edit_Label2').onkeydown = this._textareaChange;
    }

    show(pos, data, type){
        this.type = type;
        this._setData(data, type);
        this._setPosition(pos, type);
        this._showEl(document.getElementById(type === 'task' ? 'edit_Label' : 'edit_Label2'));
    }

    // ====================================

    _textareaChange(e){
        if(e.keyCode == 13 && this.getAttribute('singleline') == '1'){
            e.preventDefault()
        }
    }

    _okBtnClick(){
        this._hideEl();
        const data = this._getData();
        this.$emit('save', data);
    }

    _getData(){
        if(this.type == 'task'){
            return {
                text: val('#edit_Label'),
                decomposition: val('#edit_Decomposition')
            }
        }else{
            return {
                text: val('#edit_Label2'),
                condition: val('#edit_Condition'),
                priority: val('#edit_Priority'),
            }
        }
    }

    _setData(data, type){
        const visible = type == 'task';
        this.taskFormEl.style.display = visible ? 'block' : 'none';
        this.transitionFormEl.style.display = !visible ? 'block' : 'none';
        if(type == 'task'){
            val('#edit_Label', data.text || '');
            val('#edit_Decomposition', data.decomposition || 'serial');
            document.getElementById('edit_Label').setAttribute('singleline', data.isChart ? '1': '0');
        }else{
            val('#edit_Label2', data.text || '');
            val('#edit_Condition', data.condition || '');
            val('#edit_Priority', data.priority || 1);
            document.getElementById('edit_Priority').max = data.maxPriority;
        }
    }

    _setPosition(desired, type){
        const height = type == 'task' ? 219 : 296;
        let { x, y } = desired;
        x -= 200;
        y -= height / 2;
        if(x < 50) x = 50;
        if(y < 35) y = 35;
        else if((y + height + 5) > window.innerHeight) y = window.innerHeight - height - 5;
        this.el.style.top = y + 'px';
        this.el.style.left = x + 'px';
    }

    _showEl(el2Focus){
        this.el.style.display = 'block';
        setTimeout(() => {
            this.el.style.opacity = 1;
            if(el2Focus) el2Focus.focus();
        }, 1);
    }

    _hideEl(){
        this.el.style.opacity = 0;
        setTimeout(() => this.el.style.display = 'none', 400);
    }
}