var BaseModel = require("../base/model"),
Instances     = require("./instances"),
AWS           = require("aws-sdk");

function Region () {

  BaseModel.apply(this, arguments);

  this.api = new AWS.EC2({
    accessKeyId     : this.collection.awsm.config.get("key"),
    secretAccessKey : this.collection.awsm.config.get("secret"),
    region          : this.get("name"),
    maxRetries      : 15
  });

  this.instances = new Instances(this);
}

BaseModel.extend(Region, {

});

module.exports = Region;