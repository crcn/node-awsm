var awsm = require("../../../"),
helpers  = require("../../helpers"),
outcome  = require("outcome"),
expect   = require("expect.js");

describe("ec2/zones#", function () {

  var aws, region;

  before(function () {
    aws = awsm(helpers.config);
  });

  before(function (next) {
    aws.ec2.regions.findOne({ name: "us-east-1" }, outcome.e(next).s(function (model) {
      region = model;
      next();
    }));
  });

  it("can list all available zones in a given region", function (next) {
    region.zones.all(function (err, zones) {
      expect(zones.length).to.be(3);
      next();
    });
  })
});