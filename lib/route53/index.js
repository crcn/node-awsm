var bindable = require("bindable"),
protoclass   = require("protoclass"),
AWS          = require("aws-sdk"),
HostedZones  = require("./hostedZones");

// http://docs.aws.amazon.com/AWSJavaScriptSDK/latest/frames.html#!AWS/Route53.html

function Route53 (options, awsm) {
  this.config = new bindable.Object(options);
  this.awsm   = awsm;
  this.logger = awsm.logger.child("route53");

  this.api    = new AWS.Route53({
    accessKeyId     : awsm.config.get("key"),
    secretAccessKey : awsm.config.get("secret"),
    maxRetries      : 15
  });

  this.hostedZones = new HostedZones(this);
}


protoclass(Route53, {

  /**
   */

  toString: function () {
    return this.logger.name;
  }
});

module.exports = Route53;

