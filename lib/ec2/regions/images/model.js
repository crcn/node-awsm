var BaseModel = require("../base/model"),
_             = require("underscore"),
outcome       = require("outcome");


function Image () {
  BaseModel.apply(this, arguments);
}


BaseModel.extend(Image, {

});

module.exports = Image;