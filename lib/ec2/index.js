var protoclass   = require("protoclass"),
bindable         = require("bindable"),
Regions          = require("./regions"),
JoinedCollection = require("../base/joinedCollection"),
AWS              = require("aws-sdk");

function EC2 (options, awsm) {

  this.config  = new bindable.Object(options);
  this.awsm    = awsm;

  this.regions   = new Regions(this);
  this.instances = new JoinedCollection(this.regions, "instances");
}

protoclass(EC2);

module.exports = EC2;