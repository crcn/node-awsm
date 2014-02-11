var BaseModel = require("../base/model"),
_             = require("underscore"),
outcome       = require("outcome");

/*

Server States:

+--------+---------------+
|  Code  |     State     |
+--------+---------------+
|   ?    |    pending    | 
|   ?    |    available  |
+--------+---------------+

*/

function KeyPair () {
  BaseModel.apply(this, arguments);
  this.tags = new Tags(this);
}


BaseModel.extend(KeyPair, {
  _destroy: function (next) {
    this.api.deleteKeyPair({ KeyName: this.get("name") }, next);
  }
});

module.exports = KeyPair;