var BaseCollection = require("../../base/collection");

function BaseEC2Collection (ec2) {
  this.ec2 = ec2;
}

BaseCollection.extend(BaseEC2Collection);

module.exports = BaseEC2Collection;