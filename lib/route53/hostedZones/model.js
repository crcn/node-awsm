var BaseModel = require("../../base/loadableModel"),
RecordSets    = require("./recordSets");


function HostedZone (data, collection) {
  BaseModel.apply(this, arguments);
  this.api = collection.api;
  this.awsm = collection.awsm;
  this.logger = collection.logger.child(this.get("_id"));

  this.recordSets = new RecordSets(this);
}

BaseModel.extend(HostedZone, {

  /**
   */

  _destroy: function (next) {

  },

  /**
   */

  _load: function (next) {

  }
})

module.exports = HostedZone;