var protoclass = require("protoclass"),
Decorator      = require("./decorator");

function Decorators () {
  this._decorators = [];
}

protoclass(Decorators, {
  
  /**
   */

  push: function (decorator) {
    this._decorators.push(new Decorator(decorator));
  },

  /**
   */

  decorate: function (target) {
    for (var i = this._decorators.length; i--;) {
      this._decorators[i].decorate(target);
    }
  }
});

module.exports = Decorators;