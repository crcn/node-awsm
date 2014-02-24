var BaseModel = require("../../../base/loadableModel");


function RecordSet (data, collection) {

  BaseModel.apply(this, arguments);

  this.api    = collection.api;
  this.awsm   = collection.awsm;
  this.logger = collection.logger.child(this.get("_id"));
}

BaseModel.extend(RecordSet, {

})

module.exports = RecordSet;