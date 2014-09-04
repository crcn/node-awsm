var chain = require("brasslet")();


function loadCollection (collection, next) {
  collection.all(function () {
    next(null, collection);
  })
}

function reload (model, next) {
  model.all(function() {
    next(null, model);
  })
}


function createChainedCollection (key) {
  var nameParts = key.split(":"),
  name = nameParts.shift(),
  plural = name + (nameParts.shift() || "s");


  chain.add(plural, {
    all: {
      type: name
    },
    find: {
      type: name
    },
    findOne: {
      type: name
    },
    reload: {
      type: plural,
      call: function (next) {
        reload(this, next);
      }
    },
    create: {
      type: name
    }
  });
}

chain.add("awsm", {
  ec2: {
    type: "ec2",
    call: function (next) {
      return next(null, this.ec2);
    }
  },
  route53: {
    type: "route53",
    call: function (next) {
      return next(null, this.route53);
    }
  }
});

chain.add("ec2", {
  regions: {
    type: "regions",
    call: function (next) {
      loadCollection(this.regions, next);
    }
  },
  images: {
    type: "images",
    call: function (next) {
      loadCollection(this.images, next);
    }
  },
  allImages: {
    type: "images",
    call: function (next) {
      loadCollection(this.allImages, next);
    }
  },
  instances: {
    type: "instances",
    call: function (next) {
      loadCollection(this.instances, next);
    }
  },
  volumes: {
    type: "volumes",
    call: function (next) {
      loadCollection(this.volumes, next);
    }
  },
  addresses: {
    type: "addresses",
    call: function (next) {
      loadCollection(this.addresses, next);
    }
  },
  zones: {
    type: "zones",
    call: function (next) {
      loadCollection(this.zones, next);
    }
  },
  snapshots: {
    type: "snapshots",
    call: function (next) {
      loadCollection(this.snapshots, next);
    }
  },
  keyPairs: {
    type: "keyPairs",
    call: function (next) {
      loadCollection(this.keyPairs, next);
    }
  },
  securityGroups: {
    type: "securityGroups",
    call: function (next) {
      loadCollection(this.securityGroups, next);
    }
  }
});

[
  "instance", 
  "image", 
  "keyPair", 
  "volume", 
  "securityGroup", 
  "snapshot",
  "address:es",
  "region",
  "hostedZone",
  "recordSet"
].forEach(createChainedCollection);


chain.add("zones", {
  find: {
    type: "zone"
  }
});

chain.add("region", {
  instances: {
    type: "instances",
    call: function (next) {
      loadCollection(this.instances, next);
    }
  },
  images: {
    type: "images",
    call: function (next) {
      loadCollection(this.images, next);
    }
  },
  allImages: {
    type: "images",
    call: function (next) {
      loadCollection(this.allImages, next);
    }
  },
  addresses: {
    type: "addresses",
    call: function (next) {
      loadCollection(this.addresses, next);
    }
  },
  volumes: {
    type: "volumes",
    call: function (next) {
      loadCollection(this.volumes, next);
    }
  },
  zones: {
    type: "zones",
    call: function (next) {
      loadCollection(this.zones, next);
    }
  },
  snapshots: {
    type: "snapshots",
    call: function (next) {
      loadCollection(this.snapshots, next);
    }
  },
  keyPairs: {
    type: "keyPairs",
    call: function (next) {
      loadCollection(this.keyPairs, next);
    }
  },
  securityGroups: {
    type: "securityGroups",
    call: function (next) {
      loadCollection(this.securityGroups, next);
    }
  }
});

chain.add("image", {
  createInstance  : { type: "instance" },
  tag             : { type: "image"    },
  migrate         : { type: "image"    },
  destroy         : { type: "image"    }
});


chain.add("volume", {
  attach          : { type: "volume"    },
  detach          : { type: "volume"    },
  tag             : { type: "volume"    },
  createSnapshot  : { type: "snapshot"  },
  destroy         : { type: "volume"    }
});

chain.add("instance", {
  start             : { type: "instance"      },
  stop              : { type: "instance"      },
  restart           : { type: "instance"      },
  destroy           : { type: "instance"      },
  createImage       : { type: "image"         },
  clone             : { type: "instance"      },
  tag               : { type: "tag"           },
  getAddress        : { type: "address"       },
  getImage          : { type: "image"         },
  resize            : { type: "instance"      },
  getSecurityGroups : { type: "securityGroup" },
  getKeyPair        : { type: "keyPair"       },
  update            : { type: "instance"      },
  getVolumes        : { type: "volume"        },
  getStatus         : { type: "object"        }
});

chain.add("keyPair", {
  destroy : { type: "keyPair" }
});


chain.add("securityGroup", {
  authorize : { type: "securityGroup"  },
  revoke    : { type: "securityGroup"  },
  destroy   : { type: "securityGroup"  }
});

chain.add("address", {
  attach    : { type: "address"  },
  detach    : { type: "address"  },
  destroy   : { type: "address"  }
});

chain.add("zone", {

});


chain.add("route53", {
  hostedZones: { 
    type: "hostedZones",
    call: function (next) {
      next(null, this.hostedZones);
    }
  }
});

chain.add("hostedZone", {
  recordSets: {
    type: "recordSets",
    call: function (next) {
      next(null, this.recordSets);
    }
  }
});

chain.add("recordSet", {
});

chain.all({
  pluck: {
    call: function () {
      var props = Array.prototype.slice.call(arguments, 0),
      next = props.pop();
      var data = {};


      for(var i = props.length; i--;) {
        var key = props[i];
        data[key] = this.get(key);
      }

      next(null, data);
    }
  }
});

module.exports = chain