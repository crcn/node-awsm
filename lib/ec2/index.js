var protoclass   = require("protoclass"),
bindable         = require("bindable"),
Regions          = require("./regions"),
JoinedCollection = require("../base/joinedCollection"),
AWS              = require("aws-sdk");

function EC2 (options, awsm) {

  this.config  = new bindable.Object(options);
  this.awsm    = awsm;
  this.logger  = awsm.logger.child("ec2");

  this.regions   = new Regions(this);

  var self = this;

  [
    "instances", 
    "images", 
    "addresses", 
    "keyPairs", 
    "zones",
    "snapshots",
    "volumes",
    "securityGroups"
  ].forEach(function (collectionName) {
    self[collectionName] = new JoinedCollection(self.regions, collectionName);
  });
}

protoclass(EC2);

module.exports = EC2;