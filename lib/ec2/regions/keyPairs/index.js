var BaseCollection = require("../base/collection"),
KeyPair            = require("./model"),
outcome            = require("outcome"),
utils              = require("../../utils");

function KeyPairCollection (region) {
  BaseCollection.call(this, region);
}

BaseCollection.extend(KeyPairCollection, {

  /**
   */

  name: "keyPairs",

  /**
   */

  createModel: function (data) {
    return new keyPair(data, this);
  },

  /**
   */

  create: function (optionsOrName, next) {

    var options, self = this, o = outcome.e(next);

    if (typeof optionsOrName === "string") {
      options = { name: optionsOrName };
    } else {
      options = optionsOrName;
    }

    var onKey = o.s(function (result) {
      console.log(result);
      self.waitForOne({ name: options.name}, o.s(function (keyPair) {
        keyPair.set("material", result.KeyMaterial);
        next(null, keyPair);
      }));
    });

    if (options.material) {
      this.api.importKeyPair({ KeyName: options.name, PublicKeyMaterial: options.material }, onkey);
    } else {
      this.api.createKeyPair({ KeyName: options.name }, onKey);
    }
  },

  /**
   */

  _load: function (options, next) {

    var search = {};

    if (options._id) {
      search.KeyNames = [options._id];
    }

    this.api.describeKeyPairs(search, outcome.e(next).s(function (result) {
      var keyPairs = result.KeyPairs;
      next(null, keyPairs.map(function (keyPair) {
        return {
          _id         : keyPair.KeyName,
          name        : keyPair.KeyName,
          fingerprint : keyPair.KeyFingerprint
        }
      }));
    }));
  }

});


module.exports = KeyPairCollection;