var awsm = require("../../../"),
helpers  = require("../../helpers"),
outcome  = require("outcome"),
expect   = require("expect.js");

describe("ec2/images#", function () {

  var aws, region;

  before(function (next) {
    aws = awsm(helpers.config);
    aws.ec2.find("us-east-1", outcome.e(next).s(function (model) {
      region = model;
      next();
    }));
  });

  it("can list all available images", function (next) {
    // region.instances.create({ flavor: "t1.micro" })
  });
});