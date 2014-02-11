#!/usr/bin/env node

var helpers = require("../test/helpers"),
awsm        = require("../"),
async       = require("async");

var aws = awsm(helpers.config);

async.waterfall([

  function removeInstances (next) {
    aws.ec2.instances.all(destroyAll(next, "instances"));
  },

  function removeImages (next) {
    aws.ec2.images.all(destroyAll(next, "images"));
  },

  function deallocateAddresses (next) {
    aws.ec2.addresses.all(destroyAll(next, "addresses"));
  },

  function destroyKeyPairs (next) {
    aws.ec2.keyPairs.all(destroyAll(next, "key pairs"));
  },

  function destroyAllSnapshots (next) {
    aws.ec2.snapshots.all(destroyAll(next, "snapshots"));
  },

  function destroyAllVolumes (next) {
    aws.ec2.volumes.all(destroyAll(next, "volumes"));
  },

  function destroyAllSecurityGroups (next) {
    aws.ec2.securityGroups.all(destroyAll(next, "security groups"));
  }

], function () {

});

function destroyAll(next, label) {
  return function (err, models) {
    if (err) return next(err);
    console.log("destroying %s", label);
    async.eachLimit(models, 20, function (model, next) {
      model.destroy(function () {
        next();
      });
    }, next);
  }
}