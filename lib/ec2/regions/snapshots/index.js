var BaseCollection = require("../base/collection"),
Snapshot           = require("./model"),
outcome            = require("outcome"),
utils              = require("../../utils");

function SnapshotCollection (region) {
  BaseCollection.call(this, region);
}

BaseCollection.extend(SnapshotCollection, {

  /**
   */

  name: "snapshots",

  /**
   */

  createModel: function (data) {
    return new Snapshot(data, this);
  },

  /**
   */

  create: function (volumeId, description, next) {

    if (arguments.length === 2) {
      next = description;
      description = undefined;
    }

    var o = outcome.e(next), self = this;

    this.api.createSnapshot(utils.cleanObject({
      VolumeId: volumeId,
      Descrption: description
    }), o.s(function (result) {
      self.waitForOne({ _id: result.SnapshotId }, next);
    }))

  },

  /**
   */

  _load: function (options, next) {

    var search = { "OwnerIds": ["self"] }, self = this, o = outcome.e(next);

    if (typeof options._id === "string") {
      search.SnapshotIds = [options._id];
      delete search.OwnerIds;
    }

    this.api.describeSnapshots(search, outcome.e(next).s(function(result) {

      var snapshots = result.Snapshots;


      next(null, snapshots.map(function (snapshot) {

        return {
          _id         : snapshot.SnapshotId,
          volumeId    : snapshot.VolumeId,
          startedAt   : snapshot.StartTime,
          region      : self.region.get("_id"),
          state       : snapshot.State,
          tags        : utils.mapTags(snapshot.Tags),
          progress    : snapshot.Progress ? Number(snapshot.Progress.substr(0, snapshot.Progress.length - 1)) : 0,
          ownerId     : snapshot.OwnerId,
          volumeSize  : snapshot.VolumeSize,
          description : snapshot.Description,
          instanceId  : snapshot.InstanceId,
          volumeId    : snapshot.VolumeId,
          imageId     : snapshot.ImageId
        };
      }))
    }));
  }

});

module.exports = SnapshotCollection;