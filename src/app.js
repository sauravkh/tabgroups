"use strict";
//import {EventEmitter} from 'events';
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
exports.__esModule = true;
var flux_1 = require("flux");
var $ = require("jquery");
var isFunction = function (obj) {
    return typeof obj == 'function' || false;
};
var isNumber = function (arg) {
    return typeof arg === 'number';
};
var isObject = function (arg) {
    return typeof arg === 'object' && arg !== null;
};
var isUndefined = function (arg) {
    return arg === void 0;
};
var EventEmitter = /** @class */ (function () {
    function EventEmitter() {
        this.defaultMaxListeners = 10;
        this._events = this._events || {};
        this._maxListeners = this._maxListeners || undefined;
        this.on = this.addListener;
    }
    EventEmitter.prototype.setMaxListeners = function (n) {
        if (!isNumber(n) || n < 0 || isNaN(n))
            throw TypeError('n must be a positive number');
        this._maxListeners = n;
        return this;
    };
    EventEmitter.prototype.once = function (type, listener) {
        if (!isFunction(listener))
            throw TypeError('listener must be a function');
        var fired = false;
        var g = function () {
            this.listener = listener;
            this.removeListener(type, g);
            if (!fired) {
                fired = true;
                listener.apply(this, arguments);
            }
        };
        //g.listener = listener;
        this.on(type, g);
        return this;
    };
    EventEmitter.prototype.removeListener = function (type, listener) {
        var list, position, length, i;
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
        }
        else if (isObject(list)) {
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
            }
            else {
                list.splice(position, 1);
            }
            if (this._events.removeListener)
                this.emit('removeListener', type, listener);
        }
        return this;
    };
    EventEmitter.prototype.removeAllListeners = function (type) {
        var key, listeners;
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
                if (key === 'removeListener')
                    continue;
                this.removeAllListeners(key);
            }
            this.removeAllListeners('removeListener');
            this._events = {};
            return this;
        }
        listeners = this._events[type];
        if (isFunction(listeners)) {
            this.removeListener(type, listeners);
        }
        else if (listeners) {
            // LIFO order
            while (listeners.length)
                this.removeListener(type, listeners[listeners.length - 1]);
        }
        delete this._events[type];
        return this;
    };
    EventEmitter.prototype.listeners = function (type) {
        var ret;
        if (!this._events || !this._events[type])
            ret = [];
        else if (isFunction(this._events[type]))
            ret = [this._events[type]];
        else
            ret = this._events[type].slice();
        return ret;
    };
    EventEmitter.prototype.listenerCount = function (type) {
        if (this._events) {
            var evlistener = this._events[type];
            if (isFunction(evlistener))
                return 1;
            else if (evlistener)
                return evlistener.length;
        }
        return 0;
    };
    EventEmitter.prototype.addListener = function (type, listener) {
        var m;
        if (!isFunction(listener))
            throw TypeError('listener must be a function');
        if (!this._events)
            this._events = {};
        // To avoid recursion in the case that type === "newListener"! Before
        // adding it to the listeners, first emit "newListener".
        if (this._events.newListener)
            this.emit('newListener', type, isFunction(listener.listener) ?
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
            }
            else {
                m = this.defaultMaxListeners;
            }
            if (m && m > 0 && this._events[type].length > m) {
                this._events[type].warned = true;
                console.error('(node) warning: possible EventEmitter memory ' +
                    'leak detected. %d listeners added. ' +
                    'Use emitter.setMaxListeners() to increase limit.', this._events[type].length);
                if (typeof console.trace === 'function') {
                    // not supported in IE 10
                    console.trace();
                }
            }
        }
        return this;
    };
    EventEmitter.prototype.emit = function (type) {
        var args = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            args[_i - 1] = arguments[_i];
        }
        var er, handler, len, i, listeners;
        if (!this._events)
            this._events = {};
        // If there is no 'error' event listener then throw.
        if (type === 'error') {
            if (!this._events.error ||
                (isObject(this._events.error) && !this._events.error.length)) {
                er = args[0];
                if (er instanceof Error) {
                    throw er; // Unhandled 'error' event
                }
                else {
                    // At least give some kind of context to the user
                    var err = new Error('Uncaught, unspecified "error" event. (' + er + ')');
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
        }
        else if (isObject(handler)) {
            args = Array.prototype.slice.call(arguments, 1);
            listeners = handler.slice();
            len = listeners.length;
            for (i = 0; i < len; i++)
                listeners[i].apply(this, args);
        }
        return true;
    };
    return EventEmitter;
}());
exports.EventEmitter = EventEmitter;
alert("hi");
//define an Action type of basic object
var Action = /** @class */ (function () {
    // readonly actionType:string;
    // readonly data:any;
    function Action(actionType, data) {
        this.actionType = actionType;
        this.data = data;
    }
    return Action;
}());
//"module" to organize Actions and Action Creators
var ToDoActions = /** @class */ (function () {
    function ToDoActions() {
    }
    //Action Creators!
    ToDoActions.addItem = function (item) {
        var action = new Action(ToDoActions.ADD_ITEM, { text: item });
        AppDispatcher.dispatch(action);
    };
    ToDoActions.checkItem = function (item) {
        var action = new Action(ToDoActions.CHECK_ITEM, { text: item });
        AppDispatcher.dispatch(action);
    };
    ToDoActions.editDraftItem = function (item) {
        var action = new Action(ToDoActions.EDIT_DRAFT_ITEM, { text: item });
        AppDispatcher.dispatch(action);
    };
    ToDoActions.addDraftItem = function () {
        var action = new Action(ToDoActions.ADD_DRAFT_ITEM);
        AppDispatcher.dispatch(action);
    };
    //type constants
    ToDoActions.ADD_ITEM = 'add_item';
    ToDoActions.CHECK_ITEM = 'check_items';
    ToDoActions.EDIT_DRAFT_ITEM = 'edit_draft';
    ToDoActions.ADD_DRAFT_ITEM = 'add_draft';
    return ToDoActions;
}());
exports.ToDoActions = ToDoActions;
//define the dispatcher
var AppDispatcher = new flux_1.Dispatcher();
//Stores
var ToDoStore = /** @class */ (function (_super) {
    __extends(ToDoStore, _super);
    function ToDoStore() {
        var _this = _super.call(this) || this;
        _this.items = [];
        _this.draft = "";
        //register callback (respond to dispatches)
        AppDispatcher.register(function (payload) {
            switch (payload.actionType) {
                //handle each kind of action
                case ToDoActions.ADD_ITEM:
                    _this.items.push(payload.data.text);
                    _this.emit('change');
                    break;
                case ToDoActions.CHECK_ITEM:
                    var itemIndex = _this.items.indexOf(payload.data.text);
                    _this.items.splice(itemIndex, 1); //remove item
                    _this.emit('change');
                    break;
                case ToDoActions.EDIT_DRAFT_ITEM:
                    _this.draft = payload.data.text;
                    _this.emit('change');
                    break;
                case ToDoActions.ADD_DRAFT_ITEM:
                    _this.items.push(_this.draft);
                    _this.draft = "";
                    _this.emit('change');
                    break;
            }
        });
        return _this;
    }
    /* state getters; should encapsulate more */
    ToDoStore.prototype.getItems = function () {
        return this.items;
    };
    ToDoStore.prototype.getDraftItem = function () {
        return this.draft;
    };
    return ToDoStore;
}(EventEmitter));
var toDoStoreSingleton = new ToDoStore(); //instantiate; doing some singleton work
//Views (mostly provided)
var TodoListView = /** @class */ (function () {
    function TodoListView() {
        var _this = this;
        toDoStoreSingleton.on('change', function (e) { _this.render(); });
    }
    TodoListView.prototype.render = function () {
        var list = $('#workplaces');
        list.empty();
        // let items = ['Finish the demo']; //get items here!;
        var items = toDoStoreSingleton.getItems();
        items.forEach(function (item) {
            list.append("<li>" + item + "</li>"); //add item for each
        });
        // list.append(`<li><em>${'a draft item...'}</em></li>`); //add draft
        list.append("<li><em>" + toDoStoreSingleton.getDraftItem() + "</em></li>"); //add draft
    };
    return TodoListView;
}());
exports.TodoListView = TodoListView;
var TodoInputView = /** @class */ (function () {
    function TodoInputView() {
        var _this = this;
        toDoStoreSingleton.on('change', function (e) { _this.render(); });
        //add input handlers
        var input = $('#newItem');
        input.on('input', function () {
            //handle input change
            ToDoActions.editDraftItem(input.val());
        });
        var button = $('#addButton');
        button.on('click', function () {
            //handle button click
            alert("sup");
            ToDoActions.addDraftItem();
        });
    }
    TodoInputView.prototype.render = function () {
        $('#newItem').val(toDoStoreSingleton.getDraftItem()); //in case need to update...
    };
    return TodoInputView;
}());
exports.TodoInputView = TodoInputView;
//main
// alert("hi")
// chrome.tabs.create({ url: "http://sauravkharb.me"});
// let listView = new TodoListView();
// let inputView = new TodoInputView();
// ToDoActions.addItem("Say hello"); //starting item (testing)
