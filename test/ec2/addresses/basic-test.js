var awsm = require("../../../"),
helpers  = require("../../helpers"),
outcome  = require("outcome"),
expect   = require("expect.js");

describe("ec2/addresses#", function () {

  var aws, region, instance, address;

  before(function (next) {
    aws = awsm(helpers.config);
    aws.ec2.regions.findOne({ name: "us-east-1" }, function (err, model) {
      region = model;
      next();
    });
  });

  before(function (next) {
    region.instances.create({ imageId: helpers.images.ubuntu._id }, function (err, model) {
      instance = model;
      next();
    });
  });

  after(function (next) {
    instance.destroy(next);
  });

  it("can be allocated", function (next) {
    region.addresses.create(outcome.e(next).s(function (model) {
      address = model;
      next();
    }));
  });

  it("can be associated with an instance", function (next) {
    address.attach(instance, outcome.e(next).s(function (address) {
      instance.getAddress(function (err, address2) {
        expect(address.get("_id")).to.be(address2.get("_id"));
        address.getInstance(function (err, instance2) {
          expect(instance.get("_id")).to.be(instance2.get("_id"));
          expect(instance.get("addresses.publicIp")).to.equal(address.get("publicIp"));
          next();
        })
      });
    }));
  });

  it("can be detached from an instance", function (next) {
    address.detach(outcome.e(next).s(function () {
      address.getInstance(function (err, instance) {
        expect(!!instance).to.be(false);
        next();
      });
    }));
  });

  it("can be destroyed", function (next) {
    address.destroy(next);
  })
});