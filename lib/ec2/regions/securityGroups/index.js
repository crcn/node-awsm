var BaseCollection = require("../base/collection"),
SecurityGroup      = require("./model"),
outcome            = require("outcome"),
utils              = require("../../utils");

function SecurityGroupCollection (region) {
  BaseCollection.call(this, region);
}

BaseCollection.extend(SecurityGroupCollection, {

  /**
   */

  name: "securityGroups",

  /**
   */

  createModel: function (data) {
    return new SecurityGroup(data, this);
  },

  /**
   */

  create: function (optionsOrName, next) {

    var options, self = this;

    if (typeof optionsOrName === "string") {
      options = { name: optionsOrName };
    } else {
      options = optionsOrName;
    }

    if (!options.description) {
      options.description = "Security Group";
    }

    this.api.createSecurityGroup({
      GroupName: options.name,
      Description: options.description
    }, outcome.e(next).s(function (result) {
      self.waitForOne({ _id: result.GroupId }, next);
    }));
  },

  /**
   */

  _load: function (options, next) {

    var search = {};

    if (options._id) {
      search.GroupIds = [options._id];
    }

    this.api.describeSecurityGroups(search, outcome.e(next).s(function (result) {
      var securityGroups = result.SecurityGroups;

      next(null, securityGroups.map(function (securityGroup) {
        return {
          _id         : securityGroup.GroupId,
          name        : securityGroup.GroupName,
          description : securityGroup.Description,
          ownerId     : securityGroup.OwnerId,
          tags        : utils.mapTags(securityGroup.Tags),
          permissions : securityGroup.IpPermissions.map(function (permission) {
            return {
              ipRanges : permission.IpRanges,
              protocol : permission.IpProtocol,
              fromPort : permission.FromPort,
              toPort   : permission.ToPort
            };
          })
        };
      }));

    }));
  }

});

module.exports = SecurityGroupCollection;