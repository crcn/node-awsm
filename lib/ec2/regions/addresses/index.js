var BaseCollection = require("../base/collection"),
Address            = require("./model"),
outcome            = require("outcome"),
flatten            = require("flatten"),
async              = require("async"),
utils              = require("../../utils");

function AddressCollection (region) {
  BaseCollection.call(this, region);
}

BaseCollection.extend(AddressCollection, {

  /**
   */

  name: "addresses",

  /**
   */

  createModel: function (data) {
    return new Address(data, this);
  },

  /**
   */

  create: function (next) {
    var self = this;
    this.api.allocateAddress(outcome.e(next).s(function (result) {
      self.waitForOne({ publicIp: result.PublicIp }, next);
    }))
  },

  /**
   */

  _load: function (options, next) {

    var search = {}, self = this;

    if (options._id) {
      search.PublicIps = [options._id];
    }

    this.api.describeAddresses(search, outcome.e(next).s(function (result) {

      var addresses = result.Addresses;

      next(null, addresses.map(function (address) {
        return {
          _id        : address.PublicIp,
          publicIp   : address.PublicIp,
          instanceId : address.InstanceId
        };
      }));
    }));
  }



});

module.exports = AddressCollection;