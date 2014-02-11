var BaseModel = require("../base/model"),
_             = require("underscore"),
outcome       = require("outcome"),
toarray       = require("toarray"),
Tags          = require("../tags"),
async         = require("async");


function Address () {
  BaseModel.apply(this, arguments);
}


BaseModel.extend(Address, {

  /**
   */

  name: "address",

  /**
   */

  getInstance: function (next) {
    this.region.instances.findOne({ _id: this.get("instanceId") }, next);
  },

  /**
   */

  associate: function (instanceOrInstanceId, next) {

    instanceId = typeof instanceOrInstanceId  === "object" ? instanceOrInstanceId.get("_id") : instanceOrInstanceId;

    var self = this;

    this.api.associateAddress({
      PublicIp: this.get("publicIp"),
      InstanceId: instanceId
    }, outcome.e(next).s(function () {
      self.region.instances.reload(function () {
        self.reload(next);
      })
    }));
  },

  /**
   */

  detach: function (next) {
    var self = this;
    this.api.disassociateAddress({ PublicIp: this.get("publicIp") }, outcome.e(next).s(function (result) {
      self.reload(next);
    }));
  },

  /**
   */

  _destroy: function (next) {
    this.api.releaseAddress({ PublicIp: this.get("publicIp") }, next);
  }
});

module.exports = Address;