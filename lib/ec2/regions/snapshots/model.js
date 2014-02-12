var BaseModel = require("../base/model"),
_             = require("underscore"),
outcome       = require("outcome"),
Tags          = require("../tags");


function Snapshot () {
  BaseModel.apply(this, arguments);
  this.tags = new Tags(this);
}


BaseModel.extend(Snapshot, {

  /**
   */

  name: "snapshot",

  /**
   */

  createVolume: function (options, next) {
    options.snapshotId = this.get("_id");
    this.region.volumes.create(options, next);
  },

  /**
   */

  getVolume: function (next) {
    this.region.volumes.waitForOne({ _id: this.get("volumeId") }, next);
  },
  
  /**
   */

  _destroy: function (next) {
    this.api.deleteSnapshot({
      SnapshotId: this.get("_id")
    }, next);
  }
});

module.exports = Snapshot;