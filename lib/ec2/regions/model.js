var BaseModel = require("../base/model"),
Instances     = require("./instances"),
KeyPairs      = require("./keyPairs"),
Addresses     = require("./addresses"),
Images        = require("./images"),
AWS           = require("aws-sdk");

function Region () {

  BaseModel.apply(this, arguments);

  this.api = new AWS.EC2({
    accessKeyId     : this.collection.awsm.config.get("key"),
    secretAccessKey : this.collection.awsm.config.get("secret"),
    region          : this.get("name"),
    maxRetries      : 15
  });

  this.logger    = this.ec2.logger.child(this.get("_id"));

  this.instances = new Instances(this);
  this.addresses = new Addresses(this);
  this.keyPairs  = new KeyPairs(this);
  this.images    = new Images(this, { "Owners": ["self"] });
  this.allImages = new Images(this);
}

BaseModel.extend(Region, {

});

module.exports = Region;