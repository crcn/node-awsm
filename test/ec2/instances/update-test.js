var awsm = require("../../../"),
helpers  = require("../../helpers"),
outcome  = require("outcome"),
expect   = require("expect.js");

describe("ec2/instances/update#", function () {

  var aws, region, instance, securityGroup;

  before(function (next) {
    aws = awsm(helpers.config);
    aws.ec2.regions.findOne("us-east-1", outcome.e(next).s(function (model) {
      region = model;
      next();
    }));
  });

  before(function (next) {
    region.securityGroups.create({ name: "test-sg-" + Date.now() }, outcome.e(next).s(function (model) {
      securityGroup = model;
      next();
    }));
  });

  before(function (next) {
    region.instances.create({ type: "t1.micro", securityGroup: securityGroup, imageId: helpers.images.ubuntu._id }, outcome.e(next).s(function (model) {
      instance = model;
      next();
    }));
  });

  after(function (next) {
    securityGroup.destroy(next);
  });

  after(function (next) {
    instance.destroy(next);
  });

  
  it("can resize an instance", function (next) {
    instance.resize("m3.medium", outcome.e(next).s(function () {
      expect(instance.get("type")).to.be("m3.medium");
      expect(instance.get("state")).to.be("running");
      instance.resize("t1.micro", next);
    }));
  });

});