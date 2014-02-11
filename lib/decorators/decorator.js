var protoclass = require("protoclass");

function Decorator (options) {
  this._options = options;
}

protoclass(Decorator, {

  /**
   */

  test: function (target) {
    return this._options.test(target);
  },

  /**
   */

  decorate: function (target) {

    if (!this.test(target)) {
      return;
    }

    
  }
});

module.exports = Decorator;