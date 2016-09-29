
var path   = require("path"),
    fs     = require("fs"),
    _      = require("underscore"),
    evento = require("evento");


function File()
{
    this.projectRootPath = path.resolve(__dirname+'/../../../');
};

File.prototype = {
  
    fileName: null,
    
    getData: function()
    {
        return {
            src : this.getSourcePath(),
            dest: this.getDestinationPath()
        };
    },
    
    getDestinationPath: function()
    {
        return this.fileName.replace(/^(\/|)public\//, "");
    },
    
    getSourcePath: function()
    {
        return path.resolve(this.projectRootPath + "/" + this.fileName);
    },
    
    run: function()
    {
        fs.lstatSync(this.getSourcePath()).isFile()
            ? evento.trigger("doUpload", this.getData())
            : evento.trigger("mkdir", this.getDestinationPath());
    }
};

module.exports = new File();