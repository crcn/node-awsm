var protoclass = require("protoclass"),
bindable       = require("bindable");


function Collection (options) {
  this.options = options || {};
  bindable.Object.call(this, this);
}

bindable.Object.extend(Collection, {

  /**
   */

  isCollection: true,

  /**
   */

  length: 0,

  /**
   */

  empty: true,

  /**
   */

  all: function (next) {
    this.find(next);
  },

  /**
   */

  find: function (query, next) {
    // override me
  },

  /**
   */

  findOne: function (query, next) {
    // override me
  },
  
  /**
   */

  toString: function () {
    return this.logger.name;
  }
});

module.exports = Collection;