var BaseModel = require("../base/model"),
_             = require("underscore"),
outcome       = require("outcome");


function Volume () {
  BaseModel.apply(this, arguments);
}


BaseModel.extend(Volume, {

  /**
   */

  name: "volume",

  /**
   */

  attach: function (instanceId, device, next) {

    if (typeof instanceId === "object") {
      instanceId = instanceId.get("_id");
    }

    if (arguments.length === 2) {
      next = device;
      device = "/dev/sdh"; // or xvdh
    }

    var self = this;

    var ops = {
      VolumeId   : this.get("_id"),
      InstanceId : instanceId,
      Device     : device
    };

    this.logger.notice("attach(%s)", ops);

    this.api.attachVolume(ops, outcome.e(next).s(function () {
      self.region.instances.reload(function () {
        self.reload(next);
      });
    }));
  },

  /**
   */

  getInstances: function (next) {

    var instanceIds = this.get("attachments").map(function (attachment) {
      return attachment.instanceId;
    });

    this.region.instances.wait({ _id: {$all: instanceIds }}, next);
  },

  /**
   */

  detach: function (next) {
    var self = this;

    this.logger.notice("detach()");

    this.api.detachVolume({
      VolumeId: this.get("_id")
    }, outcome.e(next).s(function () {
      self.region.instances.reload(function () {
        self.reload(next);
      });
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