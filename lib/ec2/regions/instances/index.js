var BaseCollection = require("../base/collection"),
Instance           = require("./model"),
outcome            = require("outcome"),
flatten            = require("flatten");

function InstanceCollection (region) {
  BaseCollection.call(this, region);
}

BaseCollection.extend(InstanceCollection, {

  /**
   */

  createModel: function (data) {
    return new Instance(data, this);
  },

  /**
   */

  create: function (options, next) {

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

      // console.log(JSON.stringify(instances, null, 2));

      next(null, instances.map(function (instance) {
        // console.log(instance);
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