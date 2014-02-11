var BaseCollection = require("../base/collection"),
outcome            = require("outcome"),
utils              = require("../../utils");

function ZoneCollection (region) {
  BaseCollection.call(this, region);
}

BaseCollection.extend(ZoneCollection, {

  /**
   */

  _load: function (options, next) {
    this.api.describeAvailabilityZones(outcome.e(next).s(function (result) {
      next(null, result.AvailabilityZones.map(function (zone) {
        return {
          _id    : zone.ZoneName,
          state  : zone.State,
          name   : zone.ZoneName,
          region : zone.RegionName
        }
      }))
    }));
  }
});

module.exports = ZoneCollection;