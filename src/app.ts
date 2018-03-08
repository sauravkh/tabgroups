//import {EventEmitter} from 'events';

import {Dispatcher} from 'flux';
import * as $ from "jquery";

let isFunction = function(obj) {
    return typeof obj == 'function' || false;
  };
  let isNumber=(arg)=> {
    return typeof arg === 'number';
  };
  let isObject=(arg)=> {
    return typeof arg === 'object' && arg !== null;
  };
  let isUndefined=(arg)=>{
    return arg === void 0;
  };
  
  export class EventEmitter {
    _events :any;
    _maxListeners :any;
    on:any;
    defaultMaxListeners:number=10;
    constructor() {
      this._events = this._events || {};
      this._maxListeners = this._maxListeners || undefined;
      this.on=this.addListener;
    }
    setMaxListeners(n) {
      if (!isNumber(n) || n < 0 || isNaN(n))
        throw TypeError('n must be a positive number');
      this._maxListeners = n;
      return this;
    }
  
    once(type, listener) {
      if (!isFunction(listener))
        throw TypeError('listener must be a function');
  
      let fired = false;
      let g= function () {
        this.listener=listener;
        this.removeListener(type, g);
  
        if (!fired) {
          fired = true;
          listener.apply(this, arguments);
        }
      };
  
      //g.listener = listener;
      this.on(type, g);
  
      return this;
    }
    removeListener(type, listener) {
      let list, position, length, i;
  
      if (!isFunction(listener))
        throw TypeError('listener must be a function');
  
      if (!this._events || !this._events[type])
        return this;
  
      list = this._events[type];
      length = list.length;
      position = -1;
  
      if (list === listener ||
        (isFunction(list.listener) && list.listener === listener)) {
        delete this._events[type];
        if (this._events.removeListener) {
          this.emit('removeListener', type, listener);
        }
  
      } else if (isObject(list)) {
        for (i = length; i-- > 0;) {
          if (list[i] === listener ||
            (list[i].listener && list[i].listener === listener)) {
            position = i;
            break;
          }
        }
  
        if (position < 0)
          return this;
  
        if (list.length === 1) {
          list.length = 0;
          delete this._events[type];
        } else {
          list.splice(position, 1);
        }
  
        if (this._events.removeListener)
          this.emit('removeListener', type, listener);
      }
  
      return this;
    }
  
    removeAllListeners(type) {
      let key, listeners;
  
      if (!this._events)
        return this;
  
      // not listening for removeListener, no need to emit
      if (!this._events.removeListener) {
        if (arguments.length === 0)
          this._events = {};
        else if (this._events[type])
          delete this._events[type];
        return this;
      }
  
      // emit removeListener for all listeners on all events
      if (arguments.length === 0) {
        for (key in this._events) {
          if (key === 'removeListener') continue;
          this.removeAllListeners(key);
        }
        this.removeAllListeners('removeListener');
        this._events = {};
        return this;
      }
  
      listeners = this._events[type];
  
      if (isFunction(listeners)) {
        this.removeListener(type, listeners);
      } else if (listeners) {
        // LIFO order
        while (listeners.length)
          this.removeListener(type, listeners[listeners.length - 1]);
      }
      delete this._events[type];
  
      return this;
    }
  
    listeners(type) {
      let ret;
      if (!this._events || !this._events[type])
        ret = [];
      else if (isFunction(this._events[type]))
        ret = [this._events[type]];
      else
        ret = this._events[type].slice();
      return ret;
    }
  
    listenerCount(type) {
      if (this._events) {
        let evlistener = this._events[type];
  
        if (isFunction(evlistener))
          return 1;
        else if (evlistener)
          return evlistener.length;
      }
      return 0;
    }
  
    addListener(type, listener) {
      let m;
  
      if (!isFunction(listener))
        throw TypeError('listener must be a function');
  
      if (!this._events)
        this._events = {};
  
      // To avoid recursion in the case that type === "newListener"! Before
      // adding it to the listeners, first emit "newListener".
      if (this._events.newListener)
        this.emit('newListener', type,
          isFunction(listener.listener) ?
            listener.listener : listener);
  
      if (!this._events[type])
      // Optimize the case of one listener. Don't need the extra array object.
        this._events[type] = listener;
      else if (isObject(this._events[type]))
      // If we've already got an array, just append.
        this._events[type].push(listener);
      else
      // Adding the second element, need to change to array.
        this._events[type] = [this._events[type], listener];
  
      // Check for listener leak
      if (isObject(this._events[type]) && !this._events[type].warned) {
        if (!isUndefined(this._maxListeners)) {
          m = this._maxListeners;
        } else {
          m = this.defaultMaxListeners;
        }
  
        if (m && m > 0 && this._events[type].length > m) {
          this._events[type].warned = true;
          console.error('(node) warning: possible EventEmitter memory ' +
            'leak detected. %d listeners added. ' +
            'Use emitter.setMaxListeners() to increase limit.',
            this._events[type].length);
          if (typeof console.trace === 'function') {
            // not supported in IE 10
            console.trace();
          }
        }
      }
  
      return this;
    }
    emit(type, ...args) {
      let er, handler, len, i, listeners;
  
      if (!this._events)
        this._events = {};
  
      // If there is no 'error' event listener then throw.
      if (type === 'error') {
        if (!this._events.error ||
          (isObject(this._events.error) && !this._events.error.length)) {
          er = args[0];
          if (er instanceof Error) {
            throw er; // Unhandled 'error' event
          } else {
            // At least give some kind of context to the user
            let err = new Error('Uncaught, unspecified "error" event. (' + er + ')');
            //err.context = er;
            throw err;
          }
        }
      }
  
      handler = this._events[type];
  
      if (isUndefined(handler))
        return false;
  
      if (isFunction(handler)) {
        switch (arguments.length) {
          // fast cases
          case 1:
            handler.call(this);
            break;
          case 2:
            handler.call(this, arguments[1]);
            break;
          case 3:
            handler.call(this, arguments[1], arguments[2]);
            break;
          // slower
          default:
            args = Array.prototype.slice.call(arguments, 1);
            handler.apply(this, args);
        }
      } else if (isObject(handler)) {
        args = Array.prototype.slice.call(arguments, 1);
        listeners = handler.slice();
        len = listeners.length;
        for (i = 0; i < len; i++)
          listeners[i].apply(this, args);
      }
  
      return true;
    }
  }
alert("hi")

//define an Action type of basic object
class Action {
  // readonly actionType:string;
  // readonly data:any;
  constructor(readonly actionType:string, readonly data?:any){}
}

//"module" to organize Actions and Action Creators
export class ToDoActions {
  //type constants
  static readonly ADD_ITEM = 'add_item';
  static readonly CHECK_ITEM = 'check_items';
  static readonly EDIT_DRAFT_ITEM = 'edit_draft';
  static readonly ADD_DRAFT_ITEM = 'add_draft';

  //Action Creators!
  static addItem(item:string){
    let action = new Action(ToDoActions.ADD_ITEM, {text:item});
    AppDispatcher.dispatch(action);
  }

  static checkItem(item:string){
    let action = new Action(ToDoActions.CHECK_ITEM, {text:item});
    AppDispatcher.dispatch(action);
  }

  static editDraftItem(item:any){
    let action = new Action(ToDoActions.EDIT_DRAFT_ITEM, {text:item});
    AppDispatcher.dispatch(action);
  }

  static addDraftItem(){
    let action = new Action(ToDoActions.ADD_DRAFT_ITEM);
    AppDispatcher.dispatch(action);
  }
}

//define the dispatcher
const AppDispatcher = new Dispatcher();

//Stores
class ToDoStore extends EventEmitter {
  private items:string[] = [];
  private draft:string = "";

  constructor() {
    super();
    //register callback (respond to dispatches)
    AppDispatcher.register((payload:any) => {
      switch(payload.actionType){ //switch instead of if/else block
        //handle each kind of action
        case ToDoActions.ADD_ITEM:
          this.items.push(payload.data.text);
          this.emit('change');
          break;

        case ToDoActions.CHECK_ITEM:
          let itemIndex = this.items.indexOf(payload.data.text);
          this.items.splice(itemIndex, 1); //remove item
          this.emit('change');
          break;        

        case ToDoActions.EDIT_DRAFT_ITEM:
          this.draft = payload.data.text;
          this.emit('change');
          break;

        case ToDoActions.ADD_DRAFT_ITEM:
          this.items.push(this.draft);
          this.draft = "";
          this.emit('change');        
          break;
      }
    })
  }

  /* state getters; should encapsulate more */
  getItems(){
    return this.items;
  }

  getDraftItem() {
    return this.draft;
  }
}

const toDoStoreSingleton = new ToDoStore(); //instantiate; doing some singleton work

//Views (mostly provided)
export class TodoListView {
  constructor() {
    toDoStoreSingleton.on('change', (e) => { this.render(); });
  }

  render(){
    let list = $('#workplaces');
    list.empty();
    // let items = ['Finish the demo']; //get items here!;
    let items = toDoStoreSingleton.getItems();
    items.forEach((item) => {
      list.append(`<li>${item}</li>`); //add item for each
    })
    // list.append(`<li><em>${'a draft item...'}</em></li>`); //add draft
    list.append(`<li><em>${toDoStoreSingleton.getDraftItem()}</em></li>`); //add draft
  }
}

export class TodoInputView {
  constructor() {
    toDoStoreSingleton.on('change', (e) => { this.render(); });

    //add input handlers
    let input = $('#newItem');
    input.on('input', () => {
      //handle input change
      ToDoActions.editDraftItem(input.val());
    })

    let button = $('#addButton');
    button.on('click', () => {
      //handle button click
      alert("sup");
      ToDoActions.addDraftItem();
    })
  }

  render() {
    $('#newItem').val(toDoStoreSingleton.getDraftItem()); //in case need to update...
  }
}


//main
// alert("hi")
// chrome.tabs.create({ url: "http://sauravkharb.me"});
// let listView = new TodoListView();
// let inputView = new TodoInputView();
// ToDoActions.addItem("Say hello"); //starting item (testing)