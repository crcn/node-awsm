Awsm provides a mongodb-like interface for controlling various AWS services such as `ec2`, `route53`, and `cloudfront`.


## Node API

### awsm awsm(config)

Initializes the awsm library. 

- `key` - aws key
- `secret` - aws secret
- `ec2` - the ec2 config
  - `regions` (array) - regions to use (["us-east-1", "us-west-1", ...])
- `log` - log config
  - `level` - the log level to use - `notice`, `verbose`, `warn`, `error`

### awsm.ec2.regions.find(query, callback)

Finds all regions with the given query

```javascript
// find all U.S. regions
awsm.ec2.regions.find({ name: /^us-/ }, function (err, usRegions) {
  // do stuff.
});
```

## Resource Collections

Resource collections share a common API, and are used for every object type which includes `regions`, `instances`, `images`, etc. 

### collection.find(query, callback)

Finds many resources against the target collection.

```javascript

// find all U.S. regions
awsm.ec2.regions.find({ name: /^us/ }, onUsRegions);

// find all running instances in a given region
region.instances.find({ state: "running" }, onAllRunningInstances);
```

### collection.findOne(query, callback)

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
var awsm = awsm({ key: "key", secret: "secret" });
awsm.ec2.regions.all(onAllRegions);
awsm.ec2.regions.find({ name: /^us/ }, onAllUSRegions);
awsm.ec2.instances.all(onAllInstancesFromAllRegions);
awsm.ec2.instances.find({ state: "running"}, onAllRunningInstances);
```

## EC2 Instances

### region.instances.create(options, callback)

Creates a new instance.

- `imageId` - (required) imageId to use
- `count` - (default = 1) number of instances to create
- `flavor` - (default = t1.micro) type of instance to use (t1.micro, m1.medium)

```javascript
region.instances.create({ imageId: "ami-a73264ce" }, function (err, instance) {
  console.log(instance.get("state")); // running
  console.log(instance.get("_id")); // instance id
})
```

### instance.start(callback)

starts the instance

### instance.restart(callback)

restarts the instance

### instance.stop(callback)

stops the instance

### instance.createImage(options, callback)

creates an image out of the instance



## EC2 Images 

TODO

