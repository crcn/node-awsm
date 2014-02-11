var awsm = require("../../../"),
helpers  = require("../../helpers"),
outcome  = require("outcome"),
expect   = require("expect.js");

describe("ec2/instances/volumes#", function () {

  var aws, region, instance, securityGroup;

  before(function (next) {
    aws = awsm(helpers.config);
    aws.ec2.regions.findOne("us-east-1", outcome.e(next).s(function (model) {
      region = model;
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
    instance.destroy(next);
  });


  it("can return the list of volumes for an instance ", function (next) {
    instance.getVolumes(outcome.e(next).s(function (volumes) {
      expect(volumes.length).to.be(1);
      expect(volumes[0].get("attachments.0.instanceId")).to.be(instance.get("_id"));
      next();
    }));
  });
});