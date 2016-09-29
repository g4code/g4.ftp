
var folder   = require("./folder")
    JsFtp    = require("jsftp"),
    fs       = require('fs'),
    _        = require("underscore"),
    evento   = require("evento"),
    informer = require("informer");

var folders = [
   "public/bower",
   "public/css",
   "public/fonts",
   "public/img",
   "public/js",
   "public/plugins",
   "public/pretty-exceptions"
];

var files = [
    "public/favicon.png",
    "public/favicon.ico"
 ];

function Ftp()
{
    informer.title("ftp")
            .titleColor("magenta");

    evento.on("error",   _.bind(informer.error,   informer));
    evento.on("success", _.bind(informer.success, informer));
    evento.on("info",    _.bind(informer.info,    informer));
    evento.on("warning", _.bind(informer.warning, informer));
    evento.on("loading", _.bind(informer.loading, informer));

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


    getDestination: function(name)
    {
        return this.conf.destination + '/' + name;
    },

    getConfig: function()
    {
        var config = fs.readFileSync(__dirname + '/../../../' + this.configPath);
        return JSON.parse(config)[this.env];
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

    quit: function()
    {
        this.jsftp.raw.quit(_.bind(this.onQuit, this));
    },

    uploadFiles: function()
    {
        folder.files         = files;
        folder.folderName    = '';
        folder.ftpConnection = this.jsftp;

        evento.trigger("uploadFile");
    },

    uploadFolder: function()
    {
        ++this.key;

        if(_.isUndefined(folders[this.key])) {
            evento.trigger('quit');
            return;
        }

        folder.folderName    = folders[this.key];
        folder.ftpConnection = this.jsftp;
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
    }
};

module.exports = new Ftp();