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
    }


  ], next);
});


function destroyAll(next) {
  return function (err, models) {
    if (err) return next(err);
    async.eachLimit(models, 20, function (model, next) {
      model.destroy(next)
    }, next);
  }
}