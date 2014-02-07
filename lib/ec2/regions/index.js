var BaseEc2Collection = require("../base/collection");

function RegionsCollection (ec2) {
  BaseEc2Collection.call(this, ec2);
}

RegionsCollection.SUPPORTED_REGIONS = [
  "us-west-1", 
  "us-west-2", 
  "us-east-1", 
  "eu-west-1", 
  "sa-east-1", 
  "ap-southeast-1", 
  "ap-southeast-2", 
  "ap-northeast-1"
];

BaseEc2Collection.extend(RegionsCollection, {

  /**
   */

  _load: function (next) {

    var regions = this.ec2.config.get("regions") || RegionsCollection.SUPPORTED_REGIONS;

    next(null, regions.map(function (name) {
      return {
        name: name;
      }
    }));
  }
});

module.exports = RegionsCollection;