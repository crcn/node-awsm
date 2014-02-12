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


    async.waterfall([

      function createInstance (next) {

        if (options.volumeSize && !options.deviceName) {
          options.deviceName = "/dev/sda1";
        }

        // one security group id
        if (options.securityGroupId) {
          options.securityGroupIds = [options.securityGroupId];
        }

        // one security group
        if (options.securityGroup) {
          options.securityGroups = [options.securityGroup];
        }

        // many security groups - need to map the IDs
        if (options.securityGroups) {
          options.securityGroupIds = options.securityGroups.map(function (securityGroup) {
            return securityGroup.get("_id");
          });
        }

        if (options.image) {
          options.imageId = options.image.get("_id");
        }

        if (options.keyPair) {
          options.keyName = options.keyPair.get("name");
        }

        if (typeof options.zone === "object") {
          options.zone = options.zone.get("_id");
        }

        var ops = utils.cleanObject({
          "ImageId"                    : options.imageId,
          "MinCount"                   : count,
          "MaxCount"                   : count,
          "KeyName"                    : options.keyName,
          "SecurityGroupIds"           : options.securityGroupIds,
          "InstanceType"               : options.flavor || options.type || "t1.micro",
          "Placement.AvailabilityZone" : options.zone,
          "EbsOptimized"               : options.ebsOptimized
        });

        self.logger.notice("create(%s)", ops);

        self.api.runInstances(ops, next);

      },

      function waitForInstances (result, next) {

        newInstanceIds = result.Instances.map(function (instance) {
          return instance.InstanceId; 
        });

        self.logger.notice("waitForAvailability(%s)", newInstanceIds.join(", "));

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

    if (typeof options._id === "string") {
      search = { "InstanceIds": [options._id] };
    }


    this.region.api.describeInstances(search, outcome.e(next).s(function (result) {

      var instances = flatten(result.Reservations.map(function (r) {
        return r.Instances;
      }));


      // don't filter if we're searching specifically for an item
      if (!options._id) {
        instances = instances.filter(function (instance) {
          return instance.State.Name !== "terminated";
        });
      }

      next(null, instances.map(function (instance) {

        return {
          // source           : instance,
          _id              : instance.InstanceId,
          state            : instance.State.Name,
          type             : instance.InstanceType,
          launchedAt       : instance.LaunchTime,
          keyName          : instance.KeyName,

          securityGroupIds : instance.SecurityGroups.map(function (securityGroup) {
            return securityGroup.GroupId;
          }),
          
          addresses   : {
            privateDNS : instance.PrivateDnsName,
            publicDNS  : instance.PublicDnsName,
            privateIp  : instance.PrivateIpAddress,
            publicIp   : instance.PublicIpAddress
          },

          region    : self.region.get("name"),
          tags      : utils.mapTags(instance.Tags),
          imageId   : instance.ImageId
        }
      }));
    }));
  }
});

module.exports = InstanceCollection;