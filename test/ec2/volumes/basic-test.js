var awsm = require("../../../"),
helpers  = require("../../helpers"),
outcome  = require("outcome"),
expect   = require("expect.js");

describe("ec2/volumes#", function () {

  var aws, region, volume, zone, instance;

  before(function () {
    aws = awsm(helpers.config);
  });

  before(function (next) {
    aws.ec2.regions.findOne({ name: "us-east-1" }, outcome.e(next).s(function (model) {
      region = model;
      next();
    }));
  });

  before(function (next) {
    region.zones.all(function (err, zones) {
      zone = zones.shift();
      next();
    })
  });


  before(function (next) {
    region.instances.create({ zone: zone, type: "t1.micro", imageId: helpers.images.ubuntu._id }, outcome.e(next).s(function (model) {
      instance = model;
      next();
    }))
  });

  it("can create a volume", function (next) {
    region.volumes.create({
      size: 8,
      zone: zone.get("_id")
    }, outcome.e(next).s(function (model) {
      volume = model;
      next();
    }));
  });

  it("can be attached to an instance", function (next) {
    var o = outcome.e(next);
    volume.attach(instance, o.s(function () {
      instance.getVolumes(o.s(function (volumes) {
        expect(volumes.length).to.be(2);
        next();
      }));
    }));
  });

  it("can be detached from an instance", function (next) {
    volume.detach(function () {
      instance.getVolumes(function (volumes) {
        expect(volumes.length).to.be(1);
        next();
      });
    });
  });

  it("can create a snapshot", function (next) {
    volume.createSnapshot(outcome.e(next).s(function (snapshot) {
      snapshot.getVolume(function (err, volume2) {
        expect(volume.get("_id")).to.be(volume2.get("_id"));
        next();
      })
    }));
  });

  it("can be destroyed", function (next) {
    volume.destroy(next);
  })
});