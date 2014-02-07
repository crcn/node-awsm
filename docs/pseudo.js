var awsm = require("awsm");

var aws = awsm({
  key: "AWS_KEY",
  secret: "AWS_SECRET"
  ec2: {
    regions: ["us-east-1"]
  }
});


aws.regions.findOne({ name: "us-east-1" })