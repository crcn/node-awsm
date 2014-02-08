var BaseCollection = require("../base/collection"),
Instance           = require("./model"),
outcome            = require("outcome"),
flatten            = require("flatten"),
async              = require("async"),
utils              = require("../../utils");

function InstanceCollection (region) {
  BaseCollection.call(this, region);
}

BaseCollection.extend(InstanceCollection, {

  /**
   */

  name: "instances",

  /**
   */

  createModel: function (data) {
    return new Instance(data, this);
  },

  /**
   */

  create: function (options, next) {

    var self = this, count = options.count || 1;

    this.logger.verbose("create(%s)", JSON.stringify(options));

    async.waterfall([

      function createInstance (next) {

        if (options.volumeSize && !options.deviceName) {
          options.deviceName = "/dev/sda1";
        }

        var ops = utils.cleanObject({
          "ImageId"          : options.imageId,
          "MinCount"         : count,
          "MaxCount"         : count,
          "KeyName"          : options.KeyName,
          "SecurityGroupIds" : options.securityGroupIds,
          "InstanceType"     : options.flavor || options.type || "t1.micro"
        });

        self.api.runInstances(ops, next);

      },

      function waitForInstances (result, next) {

        newInstanceIds = result.Instances.map(function (instance) {
          return instance.InstanceId; 
        });


        self.logger.verbose("waitForAvailability(%s)", newInstanceIds.join(", "));

        async.map(newInstanceIds, function (instanceId, next) {
          self.waitForOne({ _id: String(instanceId) }, next);
        }, next);
      },

      function waitUntilState (instances, next) {
        async.map(instances, function (instance, next) {
          instance.wait({ state: "running" }, next);
        }, next);
      },

      function complete (instances, next) {

        if (count === 1) {
          return next(null, instances[0]);
        }

        next(null, instances);
      }
    ], next);
  },

  /**
   */

  _load: function (options, next) {

    var search = {}, self = this;

    if (options._id) {
      search = { "InstanceIds": [options._id] };
    }


    this.region.api.describeInstances(search, outcome.e(next).s(function (result) {

      var instances = flatten(result.Reservations.map(function (r) {
        return r.Instances;
      })).filter(function (instance) {
        return instance.State.Name !== "terminated";
      });

      next(null, instances.map(function (instance) {
        return {
          _id    : instance.InstanceId,
          state  : instance.State.Name,
          region : self.region.get("name")
        }
      }));
    }));
  }
});

module.exports = InstanceCollection;