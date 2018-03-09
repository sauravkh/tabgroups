var View = /** @class */ (function () {
    function View() {
    }
    View.prototype.openWindow = function (name) {
        chrome.storage.sync.get(name, function (data) {
            // process data
            var urlList = Object.keys(data).map(function (key) { return data[key]; })[0];
            var objData = JSON.parse(urlList);
            // open window
            chrome.windows.create({
                url: objData.urls
            });
        });
    };
    View.prototype.addExtraUrl = function () {
        $("#inputs").append("<input  class=\"inputelement\" type=\"url\" required placeholder=\"http://....\">");
    };
    View.prototype.addButton = function (groupName) {
    };
    View.prototype.showButton = function (key) {
        $('#currentWorkplaces').append("<span id=\"" + key + "\"><button class=\"openTabset btn btn-outline-success \">" + key + "</button> <button id=\"" + key + "\" class=\"delete\">x</button></span>");
    };
    View.prototype.deleteButton = function (name) {
        $('#' + name).remove();
    };
    return View;
}());
var Store = /** @class */ (function () {
    function Store() {
        this.loadAllButtons();
        this.handleFormSubmit();
        this.handleExtraUrl();
        this.extensionView = new View();
    }
    Store.prototype.handleTabClick = function () {
        var self = this;
        var buttons = document.querySelectorAll(".openTabset");
        for (var i = 0; i < buttons.length; i++) {
            buttons[i].addEventListener('click', function o() {
                self.extensionView.openWindow(this.textContent); // sends name of workplace to open
            }, true);
        }
    };
    Store.prototype.handleExtraUrl = function () {
        var self = this;
        //handles click
        $("#createInput").click(function () {
            // add new url input element
            self.extensionView.addExtraUrl();
        });
    };
    Store.prototype.handleDeleteButton = function () {
        var self = this;
        //handles click
        console.log('in delete');
        console.log(document.querySelectorAll(".delete"));
        var buttons = document.querySelectorAll(".delete");
        for (var i = 0; i < buttons.length; i++) {
            buttons[i].addEventListener('click', function o() {
                console.log('in fewds');
                console.log(this.id);
                self.removeFromStore(this.id); // sends name of workplace to remove
            }, true);
        }
    };
    Store.prototype.removeFromStore = function (name) {
        // remove name from store
        // show all buttons
        console.log(name);
        var self = this;
        chrome.storage.sync.remove(name, function () {
            {
                console.log($('#' + name));
                self.extensionView.deleteButton(name);
            }
        });
    };
    Store.prototype.handleFormSubmit = function () {
        var self = this;
        // add listener to form submit
        $("#create").submit(function (event) {
            var urls = [];
            var name = $('#name').val();
            $('#name').val(''); // clear the input
            // adds each input element to a list
            $(".inputelement").each(function (index) {
                urls.push($(this).val());
                $(this).val('');
            });
            // sends url list and name
            self.saveTab(name, urls);
            event.preventDefault();
        });
    };
    Store.prototype.saveTab = function (name, urls) {
        // process data
        var key = name, testPrefs = JSON.stringify({
            'name': name,
            "urls": urls
        });
        var jsonfile = {};
        jsonfile[key] = testPrefs;
        // add to storage
        chrome.storage.sync.set(jsonfile, function () {
        });
        this.showButton(name);
    };
    Store.prototype.showButton = function (name) {
        var self = this;
        chrome.storage.sync.get(null, function (data) {
            for (var key in data) {
                if (key === name) {
                    self.extensionView.showButton(key);
                }
            }
            self.handleDeleteButton();
            self.handleTabClick();
        });
    };
    Store.prototype.loadAllButtons = function () {
        var self = this;
        chrome.storage.sync.get(null, function (data) {
            for (var key in data) {
                self.extensionView.showButton(key);
            }
            self.handleDeleteButton();
            self.handleTabClick();
        });
    };
    return Store;
}());
var store = new Store();