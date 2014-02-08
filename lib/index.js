var protoclass = require("protoclass"),
bindable       = require("bindable"),
EC2            = require("./ec2"),
Logger         = require("./utils/logger");

function Awsm (options) {
  this.config = new bindable.Object(options);
  this.logger = new Logger("awsm", this);
  this.ec2    = new EC2(this.config.get("ec2"), this);
}

protoclass(Awsm, {


});

module.exports = function (options) {
  return new Awsm(options);
}