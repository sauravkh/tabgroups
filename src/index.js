//import {TodoListView, TodoInputView,ToDoActions} from "./app";
//import {Dispatcher} from 'flux';
//import * as $ from "jquery";
//import * as data from './data.json';
// define(['require', './store.json'], function (require) {
//     var namedModule = require('./store.json');
// });
// alert(data)
//alert('hi')
var UrlSet = /** @class */ (function () {
    function UrlSet(name, urls) {
        this.urls = [];
        this.name = name;
        this.urls = urls;
    }
    UrlSet.prototype.setName = function (name) {
        this.name = name;
        ;
    };
    UrlSet.prototype.addUrl = function (url) {
        this.urls.push(url);
        ;
    };
    UrlSet.prototype.getName = function () {
        return this.name;
    };
    UrlSet.prototype.getUrls = function () {
        return this.urls;
    };
    return UrlSet;
}());
var Store = /** @class */ (function () {
    function Store() {
        this.urlSets = [];
        this.showAllButtons();
        this.handleSubmit();
        this.handleInput();
    }
    Store.prototype.handleOpenTab = function () {
        var self = this;
        console.log("yup");
        var buttons = document.querySelectorAll(".openTabset");
        for (var i = 0; i < buttons.length; i++) {
            buttons[i].addEventListener('click', function () {
                console.log(this.textContent);
                self.open(this.textContent);
            });
        }
    };
    Store.prototype.open = function (name) {
        console.log(name);
        chrome.storage.sync.get(name, function (data) {
            console.log(name);
            var urlList = Object.keys(data).map(function (key) { return data[key]; })[0];
            console.log(Object.keys(data).map(function (key) { return data[key]; }));
            var objData = JSON.parse(urlList);
            console.log("behind");
            console.log(objData.urls);
            chrome.windows.create({
                url: objData.urls
            });
            console.log("after");
            // objData.urls.forEach((url)=>{
            //     chrome.tabs.create({ url: url});
            // })
        });
    };
    Store.prototype.handleInput = function () {
        $("#createInput").click(function () {
            $("#inputs").append("<input  class=\"inputelement\" type=\"url\" required placeholder=\"http://....\">");
        });
    };
    Store.prototype.handleSubmit = function () {
        var self = this;
        $("#create").submit(function (event) {
            var urls = [];
            var name = $('#name').val();
            $(".inputelement").each(function (index) {
                urls.push($(this).val());
            });
            self.addData(name, urls);
            event.preventDefault();
        });
        //this.preview();
    };
    Store.prototype.addData = function (name, urls) {
        this.urlSets.push(new UrlSet(name, urls));
        var keys = name;
        var key = name, testPrefs = JSON.stringify({
            'name': name,
            "urls": urls
        });
        var jsonfile = {};
        console.log(testPrefs);
        jsonfile[key] = testPrefs;
        console.log(jsonfile);
        chrome.storage.sync.set(jsonfile, function () {
            console.log('added');
        });
        this.addButton(name);
        console.log("lets see");
        //this.open()
        //this.checkURL.setName(name);
        //this.checkURL.addUrl(url);
    };
    Store.prototype.addButton = function (groupName) {
        var self = this;
        chrome.storage.sync.get(null, function (data) {
            if (!groupName) {
                console.log("in there");
            }
            else {
                console.log(data);
                for (var key in data) {
                    if (key === groupName) {
                        $('#currentWorkplaces').append("<br><button class=\"openTabset btn btn-outline-success \">" + key + "</button>");
                    }
                }
            }
            self.handleOpenTab();
        });
    };
    Store.prototype.showAllButtons = function () {
        var self = this;
        chrome.storage.sync.get(null, function (data) {
            console.log(data);
            for (var key in data) {
                $('#currentWorkplaces').append("<br><button class=\"openTabset btn btn-outline-success \">" + key + "</button>");
            }
            self.handleOpenTab();
        });
    };
    // checks if an object is empty
    Store.prototype.isEmptyObject = function (obj) {
        for (var prop in obj) {
            if (obj.hasOwnProperty(prop)) {
                return false;
            }
        }
        return true;
    };
    return Store;
}());
//alert("hi")
// chrome.storage.sync.clear(function(){
// })
var store = new Store();
//store.render();
//$('#createInput').prepend("<h1>babyy</h1>");
// var submitButton = document.querySelector('#submit') as HTMLElement;
// submitButton.addEventListener('click',function(){
//   var urls = document.querySelectorAll('input');
//   if(urls.length > 2) {
//     for(var i = 1 ; i < urls.length-1 ; i++){
//       chrome.tabs.create({ url: urls[i].value});
//     }
//   }
//chrome.tabs.create({ url: "http://sauravkharb.me"});
// var createInput = document.querySelector('#createInput') as HTMLElement;
// createInput.addEventListener('click', ()=> {
//     var newInput = document.createElement("input");
//     var element = document.getElementById("create");
//     var child = document.getElementById("submit");
//     element.insertBefore(newInput,child);
// //   var a = document.querySelector("form") as HTMLElement;
// //   a.appendChild(newInput);
// })
//})
// var createInput = document.querySelector('#createInput') as HTMLElement;
// createInput.addEventListener('click', ()=> {
//   alert('hi')
//   var newInput = document.createElement("input");
//   var a = document.querySelector("form") as HTMLElement;
//   a.appendChild(newInput);
// })
//alert("hi")
//chrome.tabs.create({ url: "http://sauravkharb.me"});
//let listView = new TodoListView();
//let inputView = new TodoInputView();
//ToDoActions.addItem("Say hello");
