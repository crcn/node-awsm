var protoclass = require("protoclass");

require("colors");

var logLevels = {
  "verbose" : ["verbose", "notice", "warn", "error"],
  "notice"  : ["notice", "warn", "error"],
  "warn"    : ["warn", "error"]
}

var logColors = {
  "verbose": "grey",
  // "notice": "green",
  "warn": "yellow",
  "error": "red"
}



function Logger (name, awsm) {
  
  this.name    = name || "";
  this.awsm    = awsm;
  var levels   = logLevels[awsm.config.get("log.level")] || logLevels.verbose;
  this.colors = awsm.config.get("log.colors");

  var self = this;

  ["notice:log", "verbose:log", "warn", "error"].forEach(function (inf) {
    
    var parts = inf.split(":"),
    level     = parts.shift(),
    method    = parts.shift() || level;

    if (!~levels.indexOf(level)) {
      return self[level] = function () { };
    }

    self[level] = function () {
      self._log(method, level, Array.prototype.slice.call(arguments, 0));
    }
  })
}

protoclass(Logger, {

  /**
   */

  child: function (name) {
    if (!this.name) return new Logger(name, this.awsm);
    return new Logger(this.name + (name ? "." + name : ""), this.awsm);
  },

  /**
   */

  _log: function (method, level, args) {
    args[0] = this.name + "." + args[0];

    if (this.colors && logColors[level]) {
      args[0] = args[0][logColors[level]];
    }


    for (var i = args.length; i>=1; i--) {
      var v = args[i];
      if (typeof v === "object") {
        args[i] = JSON.stringify(args[i], null, 2);
      } else if (typeof v === "string") {
        args[i] = '"' + v + '"';
      }
    }

    console[method].apply(console, args);
  }
});

module.exports = Logger;