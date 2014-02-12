var BaseCollection = require("../base/collection"),
Image              = require("./model"),
outcome            = require("outcome"),
flatten            = require("flatten"),
_                  = require("underscore"),
utils              = require("../../utils");

function ImageCollection (region, search) {
  this.search = search || { };
  BaseCollection.call(this, region);
}

BaseCollection.extend(ImageCollection, {

  /**
   */

  name: "images",

  /**
   */

  createModel: function (data) {
    return new Image(data, this);
  },

  /**
   */

  _load: function (options, next) {

    var search = _.extend({}, this.search),
    self = this;

    if (typeof options._id === "string") {
      search.ImageIds = [options._id];
      delete search.Owners;
    }

    this.api.describeImages(search, outcome.e(next).s(function (result) {

      var images = result.Images;

      next(null, images.map(function (image) {
        return {
          _id          : image.ImageId,
          name         : image.Name,
          region       : self.region.get("_id"),
          state        : image.State,
          isPublic     : image.Public,
          platform     : image.Platform,
          architecture : image.Architecture,
          tags         : utils.mapTags(image.Tags)
        };
      }));
    }));
  }

});


module.exports = ImageCollection;
