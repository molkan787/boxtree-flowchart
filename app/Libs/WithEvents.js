module.exports = class WithEvents{

    constructor(){
        this.$eventsHandlers = {};
    }

    on(eventName, handler){
        if(typeof this.$eventsHandlers[eventName] == 'undefined'){
            this.$eventsHandlers[eventName] = [];
        }
        this.$eventsHandlers[eventName].push(handler);
    }

    $emit(eventName){
        const args = (new Array(...arguments)).slice(1);
        const handlers = this.$eventsHandlers[eventName];
        if(handlers instanceof Array && handlers.length){
            this.$dispatchEventsHandlers(handlers, args);
        }
    }

    $dispatchEventsHandlers(handlers, args){
        for(let i = 0; i < handlers.length; i++){
            handlers[i](...args);
        }
    }

}