var awsm = require("../../../"),
helpers  = require("../../helpers"),
outcome  = require("outcome"),
expect   = require("expect.js");

describe("ec2/securityGroups#", function () {

  var aws, region, volume, zone, securityGroup;

  before(function () {
    aws = awsm(helpers.config);
  });

  before(function (next) {
    aws.ec2.regions.findOne({ name: "us-east-1" }, outcome.e(next).s(function (model) {
      region = model;
      next();
    }));
  });


  it("can be created", function (next) {
    region.securityGroups.create("test-group" + Date.now(), outcome.e(next).s(function (model) {
      securityGroup = model;
      next();
    }))
  });

  it("can authorize a port", function (next) {
    securityGroup.authorize(80, outcome.e(next).s(function () {
      expect(securityGroup.get("permissions.0.fromPort")).to.be(80);
      expect(securityGroup.get("permissions.0.toPort")).to.be(80);
      next();
    }));
  });

  it("can de-authorize a port", function (next) {
    securityGroup.revoke(80, outcome.e(next).s(function () {
      expect(securityGroup.get("permissions").length).to.be(0);
      next();
    }));
  });

  it("can authorize a port range", function (next) {
    securityGroup.authorize({ from: 91, to: 100 }, outcome.e(next).s(function () {
      expect(securityGroup.get("permissions.0.fromPort")).to.be(91);
      expect(securityGroup.get("permissions.0.toPort")).to.be(100);
      securityGroup.revoke({ from: 90, to: 100 }, next);
    }));
  });

  it("can authorize an array of port ranges", function (next) {
    securityGroup.authorize({ ports: [{ from: 80, to: 90 }]}, outcome.e(next).s(function () {
      expect(securityGroup.get("permissions.0.fromPort")).to.be(80);
      expect(securityGroup.get("permissions.0.toPort")).to.be(90);
      next();
    }));
  });

  it("can be destroyed", function (next) {
    securityGroup.destroy(next);
  });
});