var awsm = require("../../../"),
helpers  = require("../../helpers");

describe("ec2/regions#", function () {

  var aws;

  before(function () {
    aws = awsm(helpers.config);
  })

  it("can list all available regions", function () {
    aws.ec2.regions
  })
});