var BaseEc2Model   = require("../../base/model"),
Instance           = require("./model");


function BaseRegionModel (data, collection) {
  BaseEc2Model.call(this, data, collection);
  this.region = collection.region;
  this.api    = this.region.api;
}

BaseEc2Model.extend(BaseRegionModel);

module.exports = BaseRegionModel;