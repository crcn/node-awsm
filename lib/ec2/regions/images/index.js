var BaseCollection = require("../base/collection"),
Image              = require("./model"),
outcome            = require("outcome"),
flatten            = require("flatten");

function ImageCollection (region) {
  BaseCollection.call(this, region);
}

BaseCollection.extend(ImageCollection, {

  /**
   */

  createModel: function (data) {
    return new Image(data, this);
  },

  /**
   */

  _load: function (options, next) {

  }

});

