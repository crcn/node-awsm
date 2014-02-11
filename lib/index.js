var protoclass = require("protoclass"),
bindable       = require("bindable"),
EC2            = require("./ec2"),
Logger         = require("./utils/logger"),
Decorators     = require("./decorators");

function Awsm (options) {

  this.config     = new bindable.Object(options);
  this.logger     = new Logger("awsm", this);
  this.ec2        = new EC2(this.config.get("ec2"), this);

  this.decorators = new Decorators();
}

protoclass(Awsm, {

  /** 
   * use a plugin
   */

  use: function () {
    for (var i = arguments.length; i--;) {
      arguments[i](this);
    }
    return this;
  },

  /**
   * additional plugins that might be applied
   * to a model such as an instance, image, security group, snapshot, volume, etc.
   */

  decorator: function (decorator) {
    this.decorators.push(decorator);
  }
});

module.exports = function (options) {
  return new Awsm(options);
}