var bindable = require("bindable");

function BaseModel (data, collection) {
  bindable.Object.call(this, data);
  this.collection = collection;
  this.awsm       = collection.awsm;

  // plugin additional, third-party features
  this.awsm.decorators.decorate(this);
}

bindable.Object.extend(BaseModel, {

  /**
   */

  isModel: true,

  /**
   */

  dispose: function () {
    this._disposed = true;
    this.emit("dispose");
    return this;
  },

  /**
   */

  toString: function () {
    return this.logger.name;
  }
});

module.exports = BaseModel;