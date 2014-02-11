var awsm = require("../../../"),
helpers  = require("../../helpers"),
outcome  = require("outcome"),
expect   = require("expect.js");

describe("ec2/keyPairs#", function () {

  var aws, region, instance, address;

  before(function (next) {
    aws = awsm(helpers.config);
    aws.ec2.regions.findOne({ name: "us-east-1" }, function (err, model) {
      region = model;
      next();
    });
  });

  it("can create a keypair", function (next) {
    region.keyPairs.create({ name: "test-keypair" }, outcome.e(next).s(function (model) {
      keyPair = model;
      expect(keyPair.get("material")).not.to.be(undefined);
      next();
    }))
  });
});