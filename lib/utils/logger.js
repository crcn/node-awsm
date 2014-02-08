var protoclass = require("protoclass");

var logLevels = {
  "verbose" : ["verbose", "notice", "warn", "error"],
  "notice"  : ["notice", "warn", "error"],
  "warn"    : ["warn", "error"]
}

function Logger (name, awsm) {
  
  this.name    = name || "";
  this.awsm    = awsm;
  var levels   = logLevels[awsm.config.get("log")] || logLevels.verbose;

  var self = this;

  ["notice:log", "verbose:log", "warn", "error"].forEach(function (inf) {
    
    var parts = inf.split(":"),
    level     = parts.shift(),
    method    = parts.shift() || level;

    if (!~levels.indexOf(level)) {
      return self[level] = function () { };
    }

    self[level] = function () {
      self._log(method, Array.prototype.slice.call(arguments, 0));
    }
  })
}

protoclass(Logger, {

  /**
   */

  child: function (name) {
    return new Logger(this.name + (name ? "." + name : ""), this.awsm);
  },

  /**
   */

  _log: function (level, args) {
    args[0] = this.name + "." + args[0];
    console[level].apply(console, args);
  }
});

module.exports = Logger;