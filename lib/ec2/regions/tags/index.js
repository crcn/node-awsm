var protoclass = require("protoclass"),
hurryup        = require("hurryup"),
outcome        = require("outcome");

function Tags (target, region) {
  this._target = target;
  this.region  = target.region;
  this.api     = this.region.api;
  this.loggers = target.logger.child("tags");
}

protoclass(Tags, {

  /**
   */

  update: function (nameOrTags, value, next) {

    var tags, createTags = {}, deleteTags = {}, self = this;


    if (arguments.length === 2) {
      next  = value;
      value = undefined;
      tags  = nameOrTags || {};
    } else {
      tags = {};
      tags[nameOrTags] = value;
    }

    if (Object.keys(tags).length === 0) {
      return next();
    }

    for (var name in tags) {
      var tag = tags[name];

      if (tag != null) {
        createTags[name] = String(tag)
      }

      deleteTags[name] = undefined;
    }


    // tagging doesn't always work on EC2 - depends on the state
    // or the instance / image
    function _tryTagging (next) {
      self._modifyTags("createTags", createTags, outcome.e(next).s(function () {
        self._target.reload(function () {

          if (!self.target.hasProperties({ tags: createTags })) {
            return next(new Error("tag changes haven't been made"));
          }

          next(null, self);
        });
      }));
    }

    this._modifyTags("deleteTags", deleteTags, function () {
      hurryup(_tryTagging, { timeout: 1000 * 60 * 3, retry: true, retryTimeout: 1000 }, function () {
        next(null, self);
      });
    });
  },

  /**
   */

  _modifyTags: function (method, tags, next) {



    var query = {
      "ResourceIds": [this._target.get("_id")],
      "Tags": []
    };

    for (var name in tags) {
      query.Tags.push({ Key: name, Value: tags[name] });
    }

    if (newTags.length === 0) {
      return next();
    }

    this.logger.notice(method + "(%s)", JSON.stirngify(tags));

    this.api[method].call(this.api, query, next);
  }
});

module.exports = Tags;