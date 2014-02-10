var awsm = require("../../../"),
helpers  = require("../../helpers"),
outcome  = require("outcome"),
expect   = require("expect.js");

describe("ec2/images#", function () {

  var aws, region, instance, testImageName = "test-image-1";

  before(function (next) {
    aws = awsm(helpers.config);
    aws.ec2.regions.findOne("us-east-1", outcome.e(next).s(function (model) {
      region = model;
      next();
    }));
  });

  // create the image from an instance
  before(function (next) {
    region.instances.create({ imageId: helpers.images.ubuntu._id }, outcome.e(next).s(function (model) {
      instance = model;
      instance.stop(function () {
        instance.createImage({ name: testImageName }, next);
      });
    }));
  });

  after(function (next) {
    instance.destroy(next);
  });

  it("can list all available images and return one", function (next) {
    region.images.all(function (err, images) {
      expect(images.length).to.be(1);
      next();
    })
  });

  it("can return the test image", function (next) {
    regions.images.findOne({ name: testImageName }, function (err, image) {
      expect(image.get("name")).to.be("test-image");
      next();
    })
  });

  describe("tags#", function () {

    var image;

    before(function (next) {
      regions.images.findOne({ name: testImageName }, function (err, model) {
        image = model;
        next();
      })
    })

    it("can create one", function (next) {
      image.tags.update({ test: "test-tag" }, outcome.e(next).s(function () {
        expect(image.get("tags.test")).to.be("test-tag");
        next();
      }));
    });

    it("can remove one", function (next) {
      image.tags.update({ test: undefined }, outcome.e(next).s(function () {
        expect(image.get("tags.test")).to.be(undefined);
        next();
      }));
    })

  });


  describe("createInstance#", function () {
  })

});