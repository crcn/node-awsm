var BaseModel = require("../base/model"),
_             = require("underscore"),
outcome       = require("outcome");


function Volume () {
  BaseModel.apply(this, arguments);
}


BaseModel.extend(Volume, {

  /**
   */

  attach: function (instanceId, device, next) {

    if (arguments.length === 1) {
      next = device;
      device = "/dv/sdh";
    }

    var self = this;

    this.api.attachVolume({
      Volume: this.get("_id"),
      InstanceId: instanceId,
      Device: device
    }, outcome.e(next).s(function () {
      self.region.instances.reload(function () {
        self.reload(next);
      });
    }));
  },

  /**
   */

  detach: function (next) {
    var self = this;
    this.api.detachVolume({
      VolumeId: this.get("_id")
    }, outcome.e(next).s(function () {
      self.region.instances.reload (function () {
        self.reload(next);
      })
    }));
  },

  /**
   */

  createSnapshot: function (description, next) {

    if (arguments.length === 1) {
      next        = description;
      description = undefined;
    }

    this.region.snapshots.create(this.get("_id"), description, next);
  },

  /**
   */

  _destroy: function (next) {
    this.api.deleteVolume({
      VolumeId: this.get("_id")
    }, next);
  }
});

module.exports = Volume;