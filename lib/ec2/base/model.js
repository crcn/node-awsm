BaseModel = require("../../base/loadableModel");

function BaseEC2Model (data, collection) {
  BaseModel.call(this, data, collection);
  this.ec2 = collection.ec2;
  this.awsm = this.ec2.awsm;
}

BaseModel.extend(BaseEC2Model);

module.exports = BaseEC2Model;