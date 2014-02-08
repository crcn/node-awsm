var awsm = require("../../../"),
helpers  = require("../../helpers"),
outcome  = require("outcome"),
expect   = require("expect.js");

describe("ec2/regions#", function () {

  var aws;

  before(function () {
    aws = awsm(helpers.config);
  });

  it("can list all available regions", function (next) {
    aws.ec2.regions.all(outcome.e(next).s(function (regions) {
      expect(regions.length).to.be(8);
      next();
    }));
  });

  it("can filter all us regions", function (next) {
    aws.ec2.regions.find({ name: /us-*/ }, outcome.e(next).s(function (regions) {
      expect(regions.length).to.be(3);
      next();
    }));
  });
});