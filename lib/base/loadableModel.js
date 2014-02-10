var BaseModel = require("./model"),
outcome       = require("outcome"),
sift          = require("sift"),
hurryup       = require("hurryup");

function LoadableModel () {
  BaseModel.apply(this, arguments);
}

BaseModel.extend(LoadableModel, {

  /**
   */

  reload: function (next) {
    this._load(next);
  },

  /**
   */

  skip: function (properties, skip, load) {

    if (this.hasAllProperties(properties)) {
      return skip(null, this);
    }

    load();
  },

  /**
   */

  hasAllProperties: function (properties) {
    return sift(properties).test(this.context());
  },

  /**
   */

  wait: function (properties, next) {

    var self = this;

    function load (next) {

      self.logger.verbose("wait(%s)", JSON.stringify(properties));

      self.reload(outcome.e(next).s(function () {

        if (!self.hasAllProperties(properties)) {
          return next(new Error("unable to sync properties"));
        }

        next(null, self);

      }));
    }

    hurryup(load, {
      retry        : true,
      timeout      : 1000 * 60 * 20,
      retryTimeout : 1000 * 3
    }).call(this, next);
  },

  /**
   */

  destroy: function (next) {

    this.logger.notice("destroy()");

    if (!next) next = function () {}
    var self = this;
    this._destroy(outcome.e(next).s(function() {
      self.collection.reload(function () {
        next(null, self);
      })
    }));
  },

  /**
   */

  _load: function (next) {

    if (!next) {
      next = function () {};
    }

    this.collection.reload({ _id: this.get("_id") }, outcome.e(next).s(function (models) {
      next(null, models.shift());
    }));
  },

  /**
   */

  _destroy: function (next) {
    next(); // OVERRIDE ME
  }
});

module.exports = LoadableModel;