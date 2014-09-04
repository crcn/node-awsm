var BaseModel = require("../base/model"),
_             = require("underscore"),
outcome       = require("outcome"),
Tags          = require("../tags"),
utils         = require("../../utils"),
bindable      = require("bindable"),
async         = require("async");

/*

Server States:

+--------+---------------+
|  Code  |     State     |
+--------+---------------+
|   0    |    pending    | 
|  16    |    running    |
|  32    | shutting-down | 
|  48    |  terminated   |
|  64    |   stopping    | 
|  80    |   stopped     |
+--------+---------------

*/

function Instance () {
  BaseModel.apply(this, arguments);
  this.tags = new Tags(this);
}


BaseModel.extend(Instance, {

  /**
   */

  name: "instance",


  /**
   */

  createImage: function (options, next) {


    if (typeof options === "string") {
      options = { name: options };
    }

    if (arguments.length === 1) {
      next    = options;
      options = {};
    }

    options = {
      "InstanceId": this.get("_id"),
      "Name": options.name || (this.get("_id") + " - " + Date.now())
    };

    this.logger.notice("createImage(%s)", options);

    var o = outcome.e(next), self = this;

    this.api.createImage(options, o.s(function (result) {
      self.region.images.waitForOne({ _id: result.ImageId }, o.s(function (image) {
        image.tags.update(self.get("tags"), function () {
          next(null, image);
        });
      }));
    }))
  },

  /**
   */

  resize: function (type, next) {
    return this.update({ type: type }, next);
  },

  /**
   */

  getStatus: function (next) {

    var self = this;

    this.api.describeInstanceStatus({
      InstanceIds: [this.get("_id")]
    }, outcome.e(next).s(function (result) {

      var status = new bindable.Object(result.InstanceStatuses.filter(function (status) {
        return status.InstanceId === self.get("_id");
      }).map(function(status) {
        return status;
      }).pop());

      return next(null, status);

    }))
  },

  /**
   */

  update: function (options, next) {

    // only for VPC instances
    /*if (options.securityGroupId) {
      options.securityGroupIds = [options.securityGroupId];
    }

    if (options.securityGroup){
      options.securityGroups = [options.securityGroup];
    }

    if (options.securityGroups) {
      options.securityGroupIds = options.securityGroups.map(function (securityGroup) {
        return securityGroup.get("_id");
      });
    }*/

    var ops = utils.cleanObject({
      "InstanceId"                        : this.get("_id"),
      "InstanceType.Value"                : options.type,
      "Kernel"                            : options.kernel,
      "Ramdisk"                           : options.user,
      "UserData"                          : options.userData,
      "DisableApiTermination"             : options.disableApiTermination,
      "InstanceInitiatedShutdownBehavior" : options.instanceInitiatedShutdownBehavior,
      "RootDeviceName"                    : options.rootDeviceName,
      "BlockDeviceMapping"                : options.blockDeviceMapping,
      "SourceDestCheck"                   : options.sourceDestCheck
      // "Groups"                            : options.securityGroupIds              
    });

    var state = this.get("state"), o = outcome.e(next), self = this;


    // cannot update active instance - need to shut it down first
    this.stop(o.s(function () {
      
      self.logger.notice("update(%s)", ops);

      self.api.modifyInstanceAttribute(ops, o.s(function () {

        self.reload(o.s(function () {

          if (state !== "running") {
            return next(null, self);
          }

          self.start(next);

        }));
      }));
    }));

    return this;
  },

  /**
   */

  clone: function (next) {
    var self = this;
    var tmpImage, retInstance;
    async.waterfall([
      function createImage (next) {
        self.createImage(next);
      },
      function createInstance (image, next) {
        tmpImage = image;
        image.createInstance({
          type: self.get("type"),
          keyName: self.get("keyName"),
          securityGroupIds: self.get("securityGroupIds")
        }, next);
      },
      function (instance, next) {
        retInstance = instance;
        tmpImage.destroy(next);
      }
    ], function (err) {
      if (err) return next(err);
      next(null, retInstance);
    });
  },

  /**
   */

  getImage: function (next) {
    this.region.images.waitForOne({ _id: this.get("imageId") }, next);
  },

  /**
   */

  getAddress: function (next) {
    this.region.addresses.waitForOne({ instanceId: this.get("_id") }, next);
  },

  /**
   */

  getSecurityGroups: function (next) {
    this.region.securityGroups.wait({ _id: { $in: this.get("securityGroupIds") }}, next);
  },

  /**
   */

  getVolumes: function (next) {
    this.region.volumes.wait({ "attachments.instanceId": this.get("_id") }, next);
  },

  /**
   */
   
  getKeyPair: function (next) {
    this.region.keyPairs.waitForOne({ "name": this.get("keyName") }, next);
  },

  /**
   */

  restart: function (next) {
    var self = this;
    this.stop(function () {
      self.start(next);
    });
  },

  /**
   */

  stop: function (next) {
    this.logger.notice("stop()");
    this._runCommand("stopped", _.bind(this._stop, this, next), next);
  },

  /**
   */

  _stop: function (next) {
    var state = this.get("state"),
    self = this;

    if (/running/.test(state)) {
      this._callAndWaitUntilState("stopInstances", "stopped", next);
    } else if(/stopping|shutting-down/.test(state)) {
      this.wait({ state: /stopped|terminated/ }, function () {
        self.stop(next);
      });
    } else if(/pending/.test(state)) {
      this.wait({ state: "running" }, function () {
        self.stop(next);
      })
    }
  },

  /**
   */

  start: function (next) {
    this.logger.notice("start()");
    this._runCommand("running", _.bind(this._start, this, next), next);
  },

  /**
   */

  _start: function (next) {

    var state = this.get("state"), self = this;

    if (/stopped/.test(state)) {
      this._callAndWaitUntilState("startInstances", "running", next);
    } else if (/shutting-down|stopping/.test(state)) {
      this.wait({ state: /stopped|terminated/ }, function () {
        self.start(next);
      })
    } else if (/pending/.test(state)) {
      this.wait({ state: "running" }, next);
    }
  },

  /**
   */

  _destroy: function (next) {
    this._runCommand("terminated", _.bind(this._terminate, this, next), next);
  },

  /**
   */

  _terminate: function (next) {
    return this._callAndWaitUntilState("terminateInstances", "terminated", next);
  },

  /**
   */

  _runCommand: function (expectedState, runCommand, next) {
    var self = this;

    this.skip({ state: expectedState }, next, function () {

      var state = self.get("state");


      if (/terminated/.test(state)) {
        next(comerr.notFound("The instance has been terminated."));
      } else if (!/stopping|stopped|shutting-down|running|pending/.test(state)) {
        next(comerr.unknownError("An unrecognized instance state was returned."));
      } else {

        runCommand();
      }
    });
  },

  /** 
   */

  _callAndWaitUntilState: function (command, state, next) {
    var fn, self = this;

    if (typeof command !== "function") {
      fn = function (next) {
        self.api[command].call(self.api, { "InstanceIds": [self.get("_id")] }, outcome.e(next).s(function () {
          next(null, self);
        }));
      };
    } else {
      fn = command;
    }

    fn(outcome.e(next).s(function () {
      self.wait({ state: state }, next);
    }));
  }
});

module.exports = Instance;