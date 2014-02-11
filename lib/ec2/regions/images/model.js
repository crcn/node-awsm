var BaseModel = require("../base/model"),
_             = require("underscore"),
outcome       = require("outcome"),
toarray       = require("toarray"),
Tags          = require("../tags"),
async         = require("async");

/*

Server States:

+--------+---------------+
|  Code  |     State     |
+--------+---------------+
|   ?    |    pending    | 
|   ?    |    available  |
+--------+---------------+

*/

function Image () {
  BaseModel.apply(this, arguments);
  this.tags = new Tags(this);
}


BaseModel.extend(Image, {

  /**
   */

  createInstance: function (options, next) {

    if (typeof options === "number") {
      options = { count: options };
    }

    if (arguments.length === 1) {
      next = options;
      options = {};
    }

    options.imageId = this.get("_id");
    options.tags    = this.get("tags");

    var self = this;

    this.wait({ state: "available" }, function () {
      self.region.instances.create(options, next);
    });
  },

  /**
   */

  migrate: function (regions, next) {

    // TODO - check if regions are region objects

    var regions = toarray(regions),
    self        = this;

    function _onRegions (regions) {
      async.map(regions, _.bind(self._migrateToRegion, self), next);
    }

    self.wait({ state: "available" }, outcome.e(next).s(function () {

      if (typeof regions[0] === "string") {
        self.region.collection.find({ name: { $in: regions }}, outcome.e(next).s(_onRegions));
      } else {
        _onRegions(regions);
      }

    }));
  },

  /**
   */

  _migrateToRegion: function (region, next) {

    var o = outcome.e(next), self = this;


    this.logger.notice("migrateTo(%s)", region.get("_id"));

    region.api.copyImage({
      "SourceRegion"  : this.region.get("_id"),
      "SourceImageId" : this.get("_id"),
      "Description"   : this.get("description") || this.get("_id"),
      "Name"          : this.get("name") || this.get("_id")
    }, o.s(function (image) {
      region.images.waitForOne({ _id: image.ImageId, state: "available" }, o.s(function (image) {
        image.tags.update(self.get("tags"), o.s(function () {
          next(null, image);
        }));
      }));
    }));
  },

  /**
   */

  _destroy: function (next) {
    this.api.deregisterImage({ ImageId: this.get("_id") }, next);
  }
});

module.exports = Image;