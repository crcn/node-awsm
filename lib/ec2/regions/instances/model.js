var BaseModel = require("../base/model"),
_             = require("underscore"),
outcome       = require("outcome"),
Tags          = require("../tags");

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

    this.logger.notice("createImage(%s)", JSON.stringify(options));

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

  getImage: function (next) {
    this.region.images.waitForOne({ _id: this.get("imageId") }, next);
  },

  /**
   */

  getAddress: function (next) {
    this.region.addresses.findOne({ instanceId: this.get("_id") }, next);
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