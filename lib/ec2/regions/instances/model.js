var BaseModel = require("../base/model"),
_             = require("underscore"),
outcome       = require("outcome");

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
}


BaseModel.extend(Instance, {

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