var BaseCollection = require("./collection"),
_                  = require("underscore"),
toarray            = require("toarray"),
async              = require("async"),
outcome            = require("outcome"),
flatten            = require("flatten");


function JoinedCollection(collection, selector) {
  this.collection        = collection;
  this._selectCollection = this._getSelector(selector);
  this._selectorName     = selector;
}

BaseCollection.extend(JoinedCollection, {

  /**
   */

  _getSelector: function (selector) {

    if (typeof selector === "string") {
      return function (model) {
        return model[selector];
      }
    }

    return selector;
  },

  /**
   */

  find: function (query, next) {

    if (arguments.length == 1) {
      next = query;
      query = function () { return true };
    }

    var self = this;
    this._call("find", [query], next);
  },

  /**
   */

  findOne: function (query, next) {
    this.find(query, outcome.e(next).s(function (items) {
      next(null, items.shift());
    }))
  },


  /**
   */

  _call: function (method, args, next) {
    var self = this;
    this.collection.all(outcome.e(next).s(function (models) {
      async.mapSeries(models, function (model, next) {

        var collection = self._selectCollection(model);

        collection[method].apply(collection, args.concat(next));

      }, outcome.e(next).s(function (items) {
        next(null, flatten(items));
      }));
    }));
  },

  /**
   */

  toString: function () {
    return this.collection.toString() + "." + this._selectorName;
  }
});

module.exports = JoinedCollection;