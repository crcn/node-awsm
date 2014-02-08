var protoclass = require("protoclass"),
bindable       = require("bindable"),
EC2            = require("./ec2");

function Awsm (options) {
  this.config = new bindable.Object(options);
  this.ec2    = new EC2(this.config.get("ec2"), this);
}

protoclass(Awsm, {


});

module.exports = function (options) {
  return new Awsm(options);
}