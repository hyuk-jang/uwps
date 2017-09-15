var _ = require("underscore");
var events = require('events');
var util = require('util');
var fs = require("fs");
var glob = require("glob");

// var BU = require("../util/baseUtil.js");

var HtmlView = function(){
    events.EventEmitter.call(this);
    var self = this;

    this.views = {};
    global.views = this.views;

    this.on("Start",function(){
        // options is optional
        //return;
        glob("views/**/*.html", function (er, files) {

            _.each(files,function(file){
                var fileContents = fs.readFileSync(file, 'utf8'),
                    name = "";
                if (fileContents.indexOf('\uFEFF') === 0) {
                    fileContents = fileContents.substring(1, fileContents.length);
                }
                name = file.substr(5);
                this.views[name] = fileContents;
            });
        });

        this.emit("StartEnd");
    });

    this.on("StartEnd",function(){
        global.views = this.views;
    });

    this.makeView = function(linkFileName, resObject){
        var viewFiles = _.keys(this.views),
            resObject = resObject === undefined ? {} : resObject,
            isFindFileName = "";

        isFindFileName = _.find(viewFiles, function (viewFile) {
            if (viewFile.toUpperCase() == linkFileName.toUpperCase())
                return true;
        });

        if (!isFindFileName)
            throw new Error("HtmlView.js : Does not exist.");

        return _.template(this.views[isFindFileName], resObject);
    }

}
util.inherits(HtmlView, events.EventEmitter);
exports.HtmlView = HtmlView;


