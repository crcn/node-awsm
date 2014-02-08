var bindable = require("bindable");

function BaseModel (data, collection) {
  bindable.Object.call(this, data);
  this.collection = collection;
}

bindable.Object.extend(BaseModel, {

  /**
   */

  update: function (options) {
    this.setProperties(options);
  },

  /**
   */

  dispose: function () {
    this.emit("dispose");
    return this;
  }
});

module.exports = BaseModel;