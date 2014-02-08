var awsm = require("../../../"),
helpers  = require("../../helpers"),
expect   = require("expect.js");

describe("ec2/regions#", function () {

  var aws;

  before(function () {
    aws = awsm(helpers.config);
  })

  it("has ec2 instance", function () {
    expect(aws.ec2).not.to.be(undefined);
  });
});