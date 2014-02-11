var BaseCollection = require("../base/collection"),
Volume             = require("./model"),
outcome            = require("outcome"),
utils              = require("../../utils"),
Tags               = require("../tags");

function VolumeCollection (region) {
  BaseCollection.call(this, region);
  this.tags = new Tags(this);
}

BaseCollection.extend(VolumeCollection, {

  /**
   */

  name: "volumes",

  /**
   */

  createModel: function (data) {
    return new Volume(data, this);
  },

  /**
   */

  create: function (options, next) {

    var ops = utils.cleanObject({
      Size             : options.size,
      SnapshotId       : options.snapshotId,
      AvailabilityZone : options.zone,
      VolumeType       : options.type,
      Iops             : options.iops
    });

    var o = outcome.e(next), self = this;

    this.api.createVolume(ops, o.s(function (result) {
      self.waitForOne({ _id: result.VolumeId, state: "available" }, next);
    }));
  },

  /**
   */

  _load: function (options, next) {

    var search = {}, o = outcome.e(next), self = this;

    if (options._id) {
      search.VolumeIds = [options._id];
    }



    this.api.describeVolumes(search, o.s(function (result) {

      var volumes = result.Volumes;

      if (!options._id) {
        volumes = volumes.filter(function (volume) {
          return volume.State !== "deleting";
        })
      }


      next(null, volumes.map(function (volume) {

        return {
          _id          : volume.VolumeId,
          size         : volume.Size,
          snapshotId   : volume.SnapshotId,
          zone         : volume.AvailabilityZone,
          createdAt    : volume.createTime,
          type         : volume.volumeType,
          state        : volume.State,
          tags         : utils.mapTags(volume.Tags),
          attachements : volume.Attachments.map(function (attachement) {
            return {
              instanceId          : item.InstanceId,
              device              : item.Device,
              status              : item.Status,
              deleteOnTermination : item.DeleteOnTermination
            };
          })
        }
      }))
    }));
  }

});

module.exports = VolumeCollection;