
var path   = require("path"),
    wrench = require('wrench'),
    _      = require("underscore"),
    file   = require("./file"),
    evento = require("evento");


function Folder()
{
    this.projectRootPath = path.resolve(__dirname+'/../../../');
    evento.on("uploadFile", _.bind(this.uploadFile, this));
};

Folder.prototype = {
  
    files: null,

    key: -1,

    folderName: null,
    
    getDestination: function()
    {
        return this.folderName.replace(/^(\/|)public\//, "");
    },

    getFolderPath: function()
    {
        return path.resolve(this.projectRootPath + "/" + this.folderName);
    },

    run: function()
    {
        this.files = wrench.readdirSyncRecursive(this.getFolderPath());
        this.key = -1;

        evento.trigger("mkdir", this.getDestination());
    },

    uploadFile: function()
    {
        ++this.key;

        if(_.isUndefined(this.files[this.key])) {
            evento.trigger('uploadFolder');
            return;
        }

        file.fileName = this.folderName + "/" + this.files[this.key];
        file.run();
    }
};

module.exports = new Folder();