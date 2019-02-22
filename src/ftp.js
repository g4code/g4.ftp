
var folder   = require("./folder")
var JsFtp    = require("jsftp")
var fs       = require('fs')
var _        = require("underscore")
var evento   = require("evento")
var Info     = require('info')

var path  = require('path');

function Ftp()
{
    this.info = new Info()

    evento.on("error",   info.error.bind(info));
    evento.on("success", info.success.bind(info));
    evento.on("info",    info.info.bind(info));
    evento.on("warning", info.warning.bind(info));
    evento.on("loading", info.loading.bind(info));

    evento.on("uploadFolder", _.bind(this.uploadFolder, this));
    evento.on("doUpload",     _.bind(this.doUpload,     this));
    evento.on("mkdir",        _.bind(this.mkdir,        this));
    evento.on("quit",         _.bind(this.quit,         this));
};


Ftp.prototype = {

    conf: null,

    configPath: null,

    env: null,

    key: -1,

    files:[],

    folders: [],

    getDestination: function(name)
    {
        return this.conf.destination + '/' + name;
    },

    getAbsolutePath: function(pathValue)
    {
        return path.normalize(pathValue.charAt(0) === '/' ?
            pathValue :
        process.cwd() + '/' + pathValue);
    },

    getConfig: function()
    {
        if(this.conf === null) {
            var config = fs.readFileSync(this.getAbsolutePath(this.configPath));
            this.conf = JSON.parse(config)[this.env];
        }
        return this.conf;
    },

    mkdir: function(dest)
    {
        evento.trigger("loading", "Creating folder: " + dest);
        this.jsftp.raw.mkd(this.getDestination(dest), _.bind(this.onMkdir, this));
    },

    run: function()
    {
        _.isUndefined(this.env) || _.isUndefined(this.getConfig())
            ? evento.trigger("error", "env variable not valid")
            : this.connect()
            .setFilesFolders()
            .uploadFiles();
    },

    connect: function()
    {
        this.conf = this.getConfig();

        evento.trigger("loading", this.conf.host + " connecting...");

        try {
            this.jsftp = new JsFtp(this.conf);
        } catch (err) {
            evento.trigger("error", "can not connect to ftp");
        }
        return this;
    },

    setFilesFolders: function()
    {
        this.files      = this.getConfig().source_files;
        this.folders    = this.getConfig().source_folders;
        return this;
    },

    quit: function()
    {
        this.jsftp.raw.quit(_.bind(this.onQuit, this));
    },

    uploadFiles: function()
    {
        folder.files         = this.files;
        folder.folderName    = '';
        folder.ftpConnection = this.jsftp;
        folder.config        = this.conf;

        evento.trigger("uploadFile");
    },

    uploadFolder: function()
    {
        ++this.key;

        if(_.isUndefined(this.folders[this.key])) {
            evento.trigger('quit');
            return;
        }

        folder.folderName    = this.folders[this.key];
        folder.ftpConnection = this.jsftp;
        folder.config        = this.conf;
        folder.run();
    },

    onMkdir: function(err, data)
    {
        data.code === 550
            ? evento.trigger("warning", "folder not created")
            : evento.trigger("success", "folder created")
        evento.trigger("uploadFile");
    },

    onPut: function(hadError)
    {
        hadError
            ? evento.trigger("error", "file not transferred")
            : evento.trigger("success", "file transferred")
        evento.trigger("uploadFile");
    },

    doUpload: function(data)
    {
        evento.trigger("loading", "Uploading: " + data.dest);
        this.jsftp.put(data.src, this.getDestination(data.dest), _.bind(this.onPut, this));
    },

    onQuit: function(err, data)
    {
        evento.trigger("info", "connection closed");
        this.info.display()
    }
};

module.exports = new Ftp();