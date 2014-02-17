Awsm gives you a mongodb-like interface for controlling AWS. Here's how:

```javascript
var aws = require("awsm")(require("./awsConfig")).chain();

// let's go ahead and provision a few ubuntu instances around the globe.
aws.regions().all().createInstance({ type: "m3.medium", imageId: "ami-a73264ce" }).start().then(function (err, instances) {
  console.log(instances);
});

```

How about migrating a pre-existing image? Easy:

```javascript
aws.regions().all(function (err, regions) {
  aws.images().find({ "tags.type": "my-awesome-application" }).migrate(regions).then(function (err, images) {
  
    // should be roughly ~ 7 images that have been migrated to every
    // AWS region. 
    console.log(images);
  });
});
```

Awsm is also extendable. Want to add SSH? No problem:

```javascript
var aws = require("awsm")(require("./awsConfig"));
aws.use(require("awsm-ssh");
var awsc = aws.chain();

awsc.
  instances().
  
  // find all servers in the staging environment
  find({ "tags.env": "staging", "tags.type": "my-mega-awesome-application" }).
  
  // let's copy some local files to all mega awesome applications.
  rsync("~/Developer/applications/my-mega-awesome-application", "/remote/app/directory").
  
  parallel().
  
  // let's start this sucker.
  exec("node /remote/app/directory").
  
  // after the process closes - this will never happen since exec (above) won't close. Have
  // you taken a look at node-awsm-cli? 
  then(function (err, instances) {
    // donezo.
  });
```

Want a command line interface? This is not the repository you're looking for. Check out [awsm-cli](/crcn/node-awsm-cli).


## Plugins

- [awsm-keypair-save](/crcn/node-awsm-keypair-save) - allows you to save keypairs locally immediately after creating them.
- [awsm-ssh](/crcn/node-awsm-ssh) - super nice utility that allows you to ssh, execute scripts, and rsync files on your EC2 instances. 



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

Resource collections share a common API, and are used for every object type which includes `regions`, `instances`, `images`, `securityGroups`, and `keyPairs`. 

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

#### instance.getKeyPair(callback)

returns the keypair assigned to the instance

#### tags instance.tags

instance tags collection

#### instance.destroy(callback)

destroys the instance

## EC2 Images 

#### region.images.create(options, callback)

creates a new image

#### image.createInstance(options, next)

creates a new instance from the image

#### image.migrate(regions, next)

migrates the image to another region

#### image.destroy(callback)

destroys the image

## EC2 Addresses

#### region.addresses.create(options, callback)

allocates a new address

#### address.attach(instance, callback)

associates an address with an instance

#### address.detach(instance, callback)

detaches from an instance

#### address.getInstance(callback)

returns the instance associated with the address

#### tags address.tags

address tags collection

#### address.destroy(callback)

releases the address

## EC2 Volumes

#### region.volumes.create(options, callback)

creates a new volume

#### volume.attach(instance, callback)

attaches to an instance

#### volume.detach(callback)

detaches from an instance

#### volume.getInstances(instance, callback)

returns all the instances this volume is attached to

#### volume.createSnapshot([description, ]callback)

creates a new snapshot of the volume

#### volume.destroy(callback)

destroys the volume

## EC2 Snapshots

#### region.snapshots.create(options, callback)

creates a snapshot

#### snapshot.createVolume(options, callback)

creates a volume out of the snapshot

#### snapshot.getVolume(callback)

returns the snapshot associated with the given volume

#### snapshot.destroy(callback)

destroys the snapshot

## EC2 Key Pairs

#### region.keyPairs.create(options, callback)

creates a new keypair

#### keyPair.destroy(callback)

destroys the keypair

## EC2 Security Groups

#### region.securityGroups.create(options, callback)

creates a security group

#### securityGroup.authorize(port, callback)

authorizes a port in the security group

#### securityGroup.revoke(port, callback)

revokes port 

#### securityGroup.destroy(callback)

destroys the security group.





