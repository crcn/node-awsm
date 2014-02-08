var BaseEc2Model   = require("../../base/model"),
Instance           = require("./model");


function BaseRegionModel (data, collection) {
  BaseEc2Model.call(this, data, collection);
  this.region = collection.region;
  this.api    = this.region.api;
  this.logger = collection.logger.child(this.get("_id"));
}

BaseEc2Model.extend(BaseRegionModel);

module.exports = BaseRegionModel;