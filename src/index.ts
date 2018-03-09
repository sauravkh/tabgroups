//import {TodoListView, TodoInputView,ToDoActions} from "./app";
//import {Dispatcher} from 'flux';

//import * as $ from "jquery";
//import * as data from './data.json';
// define(['require', './store.json'], function (require) {
//     var namedModule = require('./store.json');
// });



// alert(data)
//alert('hi')

class UrlSet {
    private name:string;
    private urls:string[]= [];

    constructor(name,urls){
        this.name = name;
        this.urls = urls;
    }

    setName(name:string){
        this.name = name;;
    } 

    addUrl(url:string){
        this.urls.push(url);;
    } 

    public getName():string{
        return this.name;
    }
    public getUrls():string[]{
        return this.urls;
    }
}

class Store {
    private urlSets:UrlSet[];
    constructor( ){
        this.urlSets = [];
        this.showAllButtons();
        this.handleSubmit();
        this.handleInput();
        
    
    }

    handleOpenTab(){
        var self = this;
        console.log("yup")
        var buttons = document.querySelectorAll(".openTabset");
        for(let i = 0 ; i < buttons.length; i++) {
            buttons[i].addEventListener('click', function(){
                console.log(this.textContent)
                self.open(this.textContent);

            })
        }
    }


    open(name:string){
        console.log(name)
        chrome.storage.sync.get(name, function(data){
            console.log(name)
            var urlList = Object.keys(data).map(key=>data[key])[0];
            console.log(Object.keys(data).map(key=>data[key]))
            let objData =  JSON.parse(urlList);
            chrome.windows.create({
                url: objData.urls
            });
            // objData.urls.forEach((url)=>{
            //     chrome.tabs.create({ url: url});
            // })
        })

      
    }
 
    handleInput(){
        $("#createInput").click(function(){
            $("#inputs").append("<input  class=\"inputelement\" type=\"url\" required placeholder=\"http://....\">");
        });
    }


    
    handleSubmit() {
        var self = this;
        $( "#create" ).submit(function( event ) {
            let urls:string[] = [];
            let name = $('#name').val()
            $( ".inputelement" ).each(function( index ) {
                urls.push($(this).val());
            }); 
            self.addData(name,urls);
            event.preventDefault();
        });
        //this.preview();
    }

    addData (name:string,urls:string[]) {
        this.urlSets.push(new UrlSet(name,urls));
        let keys:string = name;
        var key = name,
        testPrefs = JSON.stringify({
            'name': name,
            "urls":urls
        });
        var jsonfile = {};
        console.log(testPrefs)
        jsonfile[key] = testPrefs;
        console.log(jsonfile);

        chrome.storage.sync.set(jsonfile ,function(){
            console.log('added');
        })
        this.addButton(name);
        console.log("lets see")
        
       
        //this.open()
        //this.checkURL.setName(name);
        //this.checkURL.addUrl(url);

    }
   

    addButton(groupName?:string){
        var self = this;
        chrome.storage.sync.get(null, function(data){
            if(!groupName){
                console.log("in there")
            }else {
                console.log(data)
                for(let key in data) {
                    if(key === groupName){
                        $('#currentWorkplaces').append("<br><button class=\"openTabset btn btn-outline-success \">" + key + "</button>");
                    }
                }

            }
            self.handleOpenTab();

        })
    }

    showAllButtons() {
        var self = this;
        chrome.storage.sync.get(null, function(data){
                console.log(data);
                for(let key in data) {
                    $('#currentWorkplaces').append("<br><button class=\"openTabset btn btn-outline-success \">" + key + "</button>");
                }
                self.handleOpenTab();
        })

    }

    // checks if an object is empty
    isEmptyObject(obj) {
        for(var prop in obj) {
           if (obj.hasOwnProperty(prop)) {
              return false;
           }
        }
    
        return true;
    }
       
        
    
}
//alert("hi")
// chrome.storage.sync.clear(function(){

// })
let store:Store = new Store();

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