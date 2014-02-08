var BaseLoadableCollection = require("../../base/loadableCollection");

function BaseEC2Collection (ec2) {
  BaseLoadableCollection.call(this, { });
  this.ec2  = ec2;
  this.awsm = ec2.awsm;
}

BaseLoadableCollection.extend(BaseEC2Collection);

module.exports = BaseEC2Collection;