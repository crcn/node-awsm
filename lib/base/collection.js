var protoclass = require("protoclass");


function Collection (options) {
  if (!options) options = {};
}

protoclass(Collection, {

  /**
   */

  all: function (next) {
    this.find(next);
  },

  /**
   */

  find: function (query, next) {

  },

  /**
   */

  findOne: function (query, next) {

  },

  /**
   */

  _load: function () {

  }
});

module.exports = Collection;