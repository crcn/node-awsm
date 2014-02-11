var awsm = require("../../../"),
helpers  = require("../../helpers"),
outcome  = require("outcome"),
expect   = require("expect.js");

describe("ec2/instances#", function () {

  var aws, region, instance;

  before(function (next) {
    aws = awsm(helpers.config);
    aws.ec2.find("us-east-1", outcome.e(next).s(function (model) {
      region = model;
      next();
    }));
  });

  it("can create an instance", function (next) {
    region.instances.create({ flavor: "t1.micro", imageId: helpers.images.ubuntu._id }, outcome.e(next).s(function (instance) {
      instance = instance;
    }));
  });

  it("can be stopped", function (next) {
    instance.stop(next);
  });

  it("can be started", function (next) {
    instance.start(next);
  });

  it("can be restarted", function (next) {
    instance.restart(next);
  });

  it("can create an image", function (next) {
    instance.stop(function () {
      instance.createImage(function (err, image) {
        image.destroy(next);
      });
    });
  });

  it("can return the image of the instance", function (next) {
    instance.getImage(function (err, image) {
      expect(!!image).to.be(true);
      next();
    });
  })

  it("cna be destroyed", function (next) {
    instance.destroy(next);
  });
});