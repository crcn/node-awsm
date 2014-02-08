var awsm = require("../../../"),
helpers  = require("../../helpers"),
outcome  = require("outcome"),
expect   = require("expect.js");

describe("ec2/images#", function () {

  var aws, region, instance;

  return it("", function() {})

  before(function (next) {
    aws = awsm(helpers.config);
    aws.ec2.regions.findOne("us-east-1", outcome.e(next).s(function (model) {
      region = model;
      next();
    }));
  });

  // create the image from an instance
  before(function (next) {
    region.instances.create({ imageId: helpers.images.ubuntu._id }, outcome.e(next).s(function (model) {
      instance = model;
      instance.stop(function () {
        instance.createImage(next)
      });
    }));
  });

  after(function (next) {
    instance.destroy(next);
  });

  it("can list all available images", function (next) {
    console.log("CREATE");
    region.images.all(function () {
      next();
    })
  });
});