var BaseModel = require("../base/model"),
_             = require("underscore"),
outcome       = require("outcome"),
Tags          = require("../tags");


function SecurityGroup () {
  BaseModel.apply(this, arguments);
  this.tags = new Tags(this);
}


BaseModel.extend(SecurityGroup, {

  /**
   */

  authorize: function (optionsOrPort, next) {
    this._runCommand("authorizeSecurityGroupIngress", optionsOrPort, next);
  },

  /**
   */

  revoke: function (optionsOrPort, next) {
    this._runCommand("revokeSecurityGroupIngress", optionsOrPort, next);
  },

  /**
   */

  _runCommand: function (command, optionsOrPort, next) {

    var options = {}, query = {
      GroupId: this.get("_id"),
      IpPermissions: []
    }, self = this;

    if (typeof optionsOrPort === "number") {
      options = {
        ports: [
          { from: optionsOrPort, to: optionsOrPort }
        ]
      };
    } else {
      options = optionsOrPort;
    }


    if (options.from) {
      options = { ports: [options] }
    }

    for (var i = options.ports.length; i--;) {
      var portInfo = options.ports[i];

      if (!portInfo.ranges) {
        portInfo.ranges = ["0.0.0.0/0"];
      }

      query.IpPermissions.push({
        IpProtocol : portInfo.protocol || "tcp",
        FromPort   : portInfo.from || portInfo.number,
        ToPort     : portInfo.to || portInfo.number,
        IpRanges   : portInfo.ranges.map(function (range) {
          return {
            CidrIp: range
          }
        })
      });
    }

    this.api[command].call(this.api, query, outcome.e(next).s(function () {
      self.reload(next);
    }));
  },

  /**
   */

  _destroy: function (next) {
    this.api.deleteSecurityGroup({ GroupName: this.get("name") }, next);
  }
});

module.exports = SecurityGroup