
const informer = require("informer");

const Info = function() {

    informer.title("ftp").titleColor("magenta");

    this.errorsList     = []
    this.infoList       = []
    this.loadingList    = []
    this.successList    = []
    this.warningList    = []
}

Info.prototype = {

    display: function() {
        informer.loading("Number of loadings: " + this.loadingList.length)
        informer.info("Number of infos: " + this.infoList.length)
        informer.warning("Number of warnings: " + this.warningList.length)
        informer.error("Number of errors: " + this.errorsList.length)
        informer.success("Number of successes: " + this.successList.length)
    },

    error: function(message) {
        this.errorsList.push(message)
    },

    info: function(message) {
        this.infoList.push(message)
    },

    loading: function(message) {
        this.loadingList.push(message)
    },

    success: function(message) {
        this.successList.push(message)
    },

    warning: function(message) {
        this.warningList.push(message)
    }
}

module.exports = Info