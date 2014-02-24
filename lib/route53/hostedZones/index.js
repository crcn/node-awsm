var Collection = require("../../base/loadableCollection"),
HostedZone     = require("./model"),
outcome        = require("outcome");

function HostedZones (route53) {
  
  this.route53 = route53;
  this.api     = route53.api;
  this.awsm    = route53.awsm;
  this.logger  = this.awsm.logger.child("hostedZones");

  Collection.call(this, {});
}

Collection.extend(HostedZones, {

  /**
   */

  createModel: function (data) {
    return new HostedZone(data, this);
  },

  /**
   */

  _load: function (options, next) {

    var ops = {};

    this.api.listHostedZones(ops, outcome.e(next).s(function (response) {
      next(null, response.HostedZones.map(function (hostedZone) {
        return {
          _id    : hostedZone.Id,
          name   : hostedZone.Name,
          config : hostedZone.Config
        }
      }));
    }));
  }
});

module.exports = HostedZones;