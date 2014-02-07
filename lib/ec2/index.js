var protoclass = require("protoclass"),
bindable       = require("bindable");

function EC2 (awsm) {
  this.awsm = awsm;
  this.config = new bindable.Object(awsm.config.get("ec2"));
}

protoclass(EC2);


module.exports = EC2;