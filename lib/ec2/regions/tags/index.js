var protoclass = require("protoclass"),
hurryup        = require("hurryup"),
outcome        = require("outcome"),
utils          = require("../../utils");

function Tags (target, region) {
  this._target = target;
  this.region  = target.region;
  this.api     = this.region.api;
  this.logger  = target.logger.child("tags");
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
      self._modifyTags("deleteTags", deleteTags, function () {
        self._modifyTags("createTags", createTags, function () {
          self._target.reload(function () {
            if (!self._target.hasAllProperties({ tags: tags })) {
              return next(new Error("tag changes haven't been made"));
            }

            next(null, self);
          });
        });
      });
    }

    hurryup(_tryTagging, { timeout: 1000 * 60 * 3, retry: true, retryTimeout: 1000 }).call(self, next);
  },

  /**
   */

  _modifyTags: function (method, tags, next) {



    var query = {
      "Resources": [this._target.get("_id")],
      "Tags": []
    };

    for (var name in tags) {
      query.Tags.push(utils.cleanObject({ Key: name, Value: tags[name] }));
    }

    if (query.Tags.length === 0) {
      return next();
    }

    this.logger.notice(method + "(%s)", JSON.stringify(query.Tags));

    this.api[method].call(this.api, query, next);
  }
});

module.exports = Tags;