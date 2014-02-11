Awsm provides a mongodb-like interface for controlling various AWS services such as `ec2`, `route53`, and `cloudfront`.


## Node API

#### awsm awsm(config)

Initializes the awsm library. 

- `key` - aws key
- `secret` - aws secret
- `ec2` - the ec2 config
  - `regions` (array) - regions to use (["us-east-1", "us-west-1", ...])
- `log` - log config
  - `level` - the log level to use - `notice`, `verbose`, `warn`, `error`


## Resource Collections

Resource collections share a common API, and are used for every object type which includes `regions`, `instances`, `images`, etc. 

#### collection.find(query, callback)

Finds many resources against the target collection.

```javascript

// find all U.S. regions
awsm.ec2.regions.find({ name: /^us/ }, onUsRegions);

// find all running instances in a given region
region.instances.find({ state: "running" }, onAllRunningInstances);
```

#### collection.findOne(query, callback)

Finds one resource against a target collection.

```javascript

// find an image with the given name
region.images.findOne({ name: "some-image-name" }, onImage);
```

#### Available Collections

Below are a list of available collections to search against

- `awsm.ec2.instances` - `all` instances across `all` regions.
- `awsm.ec2.images` - `all` images across `all regions`.
- `awsm.ec2.regions` - `all` regions.
- `region.instances` - instances specific to the region.
- `region.images` - images specific to the region.


## EC2 Regions

Awsm allows you to interface against multiple EC2 regions pretty easily - all you need to do is pass which regions you want to use in the main config.

```javascript
var aws = awsm({
  key: "KEY",
  secret: "SECRET"
  ec2: {
    regions: ["us-east-1", "us-west-2"]
  }
})
```

Note that the `regions` property is completely optional - awsm will automatically default to `all` EC2 regions if the property is omitted. 

Here are a few examples of how you might interact with awsm regions:

```javascript

// init awsm
var awsm = awsm({ key: "key", secret: "secret" });

// get all regions
awsm.ec2.regions.all(onAllRegions);

// find all U.S. regions
awsm.ec2.regions.find({ name: /^us/ }, onAllUSRegions);

// find ALL instances in ALL regions
awsm.ec2.instances.all(onAllInstancesFromAllRegions);

// find ALL RUNNING instances in ALL regions
awsm.ec2.instances.find({ state: "running" }, onAllRunningInstances);
```

## EC2 Tags

Allows you to tag specific instances, images, security groups, or key pairs.

### resource.tags.update(tags, next)

Updates the tags on the specific resource

```javascript
instance.tags.update({ type: "mongodb" }, function () {
  console.log(instance.get("tags")); // { type: mongodb }
})
```

## EC2 Instances

#### region.instances.create(options, callback)

Creates a new instance in the target region.

- `imageId` - (required) imageId to use
- `count` - (default = 1) number of instances to create
- `flavor` - (default = t1.micro) type of instance to use (t1.micro, m1.medium)
- `securityGroup` - (optional) the security group object to use with the instance
- `keyPair` - (optional) the key pair object to use with the instance

```javascript
region.instances.create({ imageId: "ami-a73264ce" }, function (err, instance) {
  console.log(instance.get("state")); // running
  console.log(instance.get("_id")); // instance id
})
```

#### instance.start(callback)

starts the instance

#### instance.restart(callback)

restarts the instance

#### instance.stop(callback)

stops the instance

#### instance.createImage(options, callback)

creates an image out of the instance

#### instance.getVolumes(callback)

returns all the volumes attached to the instance

#### instance.getSecurityGroups(callback)

returns all the securityGroups attached to the instance

#### instance.getAddress(callback)

returns the allocated address assigned to the specific instance

#### instance.getImage(callback)

returns the image used to create the instance

#### instance.destroy(callback)

destroys the instance

## EC2 Images 

#### region.images.create(options, callback)

creates a new image

TODO



