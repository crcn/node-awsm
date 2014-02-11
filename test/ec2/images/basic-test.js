var awsm = require("../../../"),
helpers  = require("../../helpers"),
outcome  = require("outcome"),
expect   = require("expect.js");

describe("ec2/images#", function () {

  var aws, region, instance, image, testImageName = "test-image" + Date.now();

  before(function (next) {
    aws = awsm(helpers.config);
    aws.ec2.regions.findOne("us-east-1", outcome.e(next).s(function (model) {
      region = model;
      next();
    }));
  });

  // create the image from an instance
  before(function (next) {
    region.instances.create({ imageId: helpers.images.ubuntu._id, flavor: "t1.micro" }, outcome.e(next).s(function (model) {
      instance = model;
      instance.stop(function () {
        instance.createImage({ name: testImageName }, outcome.e(next).s(function (model) {
          image = model;
          next();
        }));
      });
    }));
  });

  after(function (next) {
    instance.destroy(next);
  });

  it("can list all available images", function (next) {
    region.images.all(function (err, images) {
      expect(images.length).to.greaterThan(0);
      next();
    })
  });

  it("can create a tag", function (next) {
    image.tags.update({ test: "test-tag" }, outcome.e(next).s(function () {
      expect(image.get("tags.test")).to.be("test-tag");
      next();
    }));
  });

  it("can remove a tag", function (next) {
    image.tags.update({ test: undefined }, outcome.e(next).s(function () {
      expect(image.get("tags.test")).to.be(undefined);
      next();
    }));
  });

  it("can create an instance", function (next) {
    image.createInstance({}, outcome.e(next).s(function (instance) {
      instance.destroy(next);
    }));
  });

  it("can migrate to another region with just a string", function (next) {
    image.migrate(["us-west-1"], outcome.e(next).s(function (images) {
      var copiedImage = images.shift();
      expect(copiedImage.get("region")).to.be("us-west-1");
      expect(copiedImage.get("tags.test")).to.be("test-tag");
      next();
    }));
  });

  it("can migrate to another region with a region instance", function (next) {
    aws.ec2.regions.find({ name: {$ne: region.get("name") }}, outcome.e(next).s(function (regions) {
      var n = regions.length;
      expect(n).to.be(7);
      image.migrate(regions, outcome.e(next).s(function (images) {
        expect(images.length).to.be(n);
        next();
      }));
    }));
  });

  it("can be destroyed", function (next) {
    image.destroy(next);
  });
});