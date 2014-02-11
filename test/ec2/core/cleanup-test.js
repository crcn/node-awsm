var helpers = require("../../helpers"),
awsm        = require("../../../"),
async       = require("async");

after(function (next) {
  var aws = awsm(helpers.config);

  async.waterfall([

    function removeInstances (next) {
      aws.ec2.instances.all(destroyAll(next));
    },

    function removeImages (next) {
      aws.ec2.images.all(destroyAll(next));
    },

    function deallocateAddresses (next) {
      aws.ec2.addresses.all(destroyAll(next));
    },

    function destroyKeyPairs (next) {
      aws.ec2.keyPairs.all(destroyAll(next));
    },

    function destroyAllSnapshots (next) {
      aws.ec2.snapshots.all(destroyAll(next));
    },

    function destroyAllVolumes (next) {
      aws.ec2.volumes.all(destroyAll(next));
    },

    function destroyAllSecurityGroups (next) {
      aws.ec2.securityGroups.all(destroyAll(next));
    }

  ], next);
});

// use for mocha grepping
it("cleanup", function () { });

function destroyAll(next) {
  return function (err, models) {
    if (err) return next(err);
    async.eachLimit(models, 20, function (model, next) {
      model.destroy(function () {
        next();
      });
    }, next);
  }
}