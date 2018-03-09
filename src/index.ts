class View {
    constructor(){
    }

    openWindow(name:string){
        chrome.storage.sync.get(name, function(data){
            // process data
            var urlList = Object.keys(data).map(key=>data[key])[0];
            let objData =  JSON.parse(urlList);
            // open window
            chrome.windows.create({
                url: objData.urls
            });
        }) 
    }

    addExtraUrl(){
        $("#inputs").append("<input  class=\"inputelement\" type=\"url\" required placeholder=\"http://....\">");
    }


    addButton(groupName?:string){

    }

    showButton(key:string){
        $('#currentWorkplaces').append("<span id=\"" + key + "\"><button class=\"openTabset btn btn-outline-success \">" + key + "</button> <button id=\"" + key + "\" class=\"delete\">x</button></span>");
    }

    deleteButton(name:string){
        $('#'+name).remove();
    }



}

class Store {
    private extensionView:View;
    constructor( ){
        this.loadAllButtons();
        this.handleFormSubmit();
        this.handleExtraUrl();
        this.extensionView = new View();
    }

    handleTabClick(){
        var self = this;
        var buttons = document.querySelectorAll(".openTabset");
        for(let i = 0 ; i < buttons.length; i++) {
            buttons[i].addEventListener('click', function o(){
                self.extensionView.openWindow(this.textContent); // sends name of workplace to open
            }, true)
        }
    }



 
    handleExtraUrl(){
        var self = this;
        //handles click
        $("#createInput").click(function(){
            // add new url input element
            self.extensionView.addExtraUrl();
        });
    }

    handleDeleteButton(){
        var self = this;
        //handles click
        console.log('in delete')
        console.log(document.querySelectorAll(".delete"));
        var buttons = document.querySelectorAll(".delete");
        for(let i = 0 ; i < buttons.length; i++) {
            buttons[i].addEventListener('click', function o(){
                console.log('in fewds')
                console.log(this.id)
                self.removeFromStore(this.id); // sends name of workplace to remove
            }, true)
        }
    }

    removeFromStore(name:string){
        // remove name from store
        // show all buttons
        console.log(name)
        var self = this;
        chrome.storage.sync.remove(name, function(){{
            console.log($('#'+name));
            self.extensionView.deleteButton(name);
        }})
        
    }
    
    handleFormSubmit() {
        var self = this;
        // add listener to form submit
        $( "#create" ).submit(function( event ) {
            let urls:string[] = [];
            let name = $('#name').val();
            $('#name').val(''); // clear the input
            // adds each input element to a list
            $( ".inputelement" ).each(function( index ) {
                urls.push($(this).val());
                $(this).val(''); 
            }); 
            // sends url list and name
            self.saveTab(name,urls);
            event.preventDefault();
        });
    }

    saveTab(name:string,urls:string[]) {
        // process data
        var key = name,
        testPrefs = JSON.stringify({
            'name': name,
            "urls":urls
        });
        var jsonfile = {};
        jsonfile[key] = testPrefs;
        // add to storage
        chrome.storage.sync.set(jsonfile ,function(){
        })
        this.showButton(name);
    }

    showButton(name:string){
        var self = this;
        chrome.storage.sync.get(null, function(data){
            for(let key in data) {
                    if(key === name){
                        self.extensionView.showButton(key)
                    }
            }
            self.handleDeleteButton();
            self.handleTabClick();
        })
    }

    loadAllButtons() {
        var self = this;
        chrome.storage.sync.get(null, function(data){
            for(let key in data) {
                self.extensionView.showButton(key)
            }
            self.handleDeleteButton();
            self.handleTabClick();
        })

    }
        
}



let store:Store = new Store();