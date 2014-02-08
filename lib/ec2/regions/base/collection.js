var BaseEc2Collection = require("../../base/collection"),
Instance              = require("./model");


function BaseRegionCollection (region) {
  BaseEc2Collection.call(this, region.ec2);
  this.region = region;
  this.api = region.api;
}

BaseEc2Collection.extend(BaseRegionCollection);

module.exports = BaseRegionCollection;