var awsm = require("../../../"),
helpers  = require("../../helpers"),
outcome  = require("outcome"),
expect   = require("expect.js");

describe("ec2/instances#", function () {

  var aws, region, instance, securityGroup;

  before(function (next) {
    aws = awsm(helpers.config);
    aws.ec2.regions.findOne("us-east-1", outcome.e(next).s(function (model) {
      region = model;
      next();
    }));
  });

  before(function (next) {
    region.securityGroups.create({ name: "test-sg-1" }, outcome.e(next).s(function (model) {
      securityGroup = model;
      next();
    }));
  });

  after(function (next) {
    securityGroup.destroy(next);
  })

  it("can create an instance", function (next) {
    region.instances.create({ type: "t1.micro", imageId: helpers.images.ubuntu._id }, outcome.e(next).s(function (instance) {
      instance = instance;
      console.log(instance.context())
      expect(instance.get("type")).to.be("t1.micro");
    }));
  });

  it("can create an instance with one security group", function (next) {
    region.instances.create({ flavor: "t1.micro", imageId: helpers.images.ubuntu._id, securityGroup: securityGroup }, outcome.e(next).s(function (instance) {
      instance.destroy(next)
    }));
  });

  it("can create an instance with many security groups", function (next) {
    region.instances.create({ flavor: "t1.micro", imageId: helpers.images.ubuntu._id, securityGroups: [securityGroup] }, outcome.e(next).s(function (instance) {
      instance.destroy(next)
    }));
  });

  it("can create an instance with one security group id", function (next) {
    region.instances.create({ flavor: "t1.micro", imageId: helpers.images.ubuntu._id, securityGroupId: securityGroup.get("_id") }, outcome.e(next).s(function (instance) {
      instance.destroy(next)
    }));
  });


  it("can create an instance with many security group ids", function (next) {
    region.instances.create({ flavor: "t1.micro", imageId: helpers.images.ubuntu._id, securityGroupIds: [securityGroup.get("_id")] }, outcome.e(next).s(function (instance) {
      instance.destroy(next)
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

  it("can be destroyed", function (next) {
    instance.destroy(next);
  });
});