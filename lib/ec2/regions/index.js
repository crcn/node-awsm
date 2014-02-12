var BaseEc2Collection = require("../base/collection"),
Region                = require("./model");

function RegionsCollection (ec2) {
  BaseEc2Collection.call(this, ec2);
  this.logger = ec2.logger.child("regions");
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

  name: "regions",

  /**
   */

  createModel: function (data) {
    return new Region(data, this);
  },

  /**
   */

  _load: function (options, next) {

    var regions = this.ec2.config.get("regions") || RegionsCollection.SUPPORTED_REGIONS;

    next(null, regions.map(function (name) {
      return {
        name: name,
        _id: name
      };
    }));
  }
});

module.exports = RegionsCollection;