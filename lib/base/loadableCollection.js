var BaseCollection = require("./collection"),
BaseModel          = require("./model"),
memoize            = require("memoizee"),
_                  = require("underscore"),
outcome            = require("outcome"),
sift               = require("sift"),
hurryup            = require("hurryup"),
comerr             = require("comerr");


function LoadableCollection (options) {

  BaseCollection.call(this, options);

  // memoize load
  this.load         = memoize(_.bind(this.reload, this), { expire: false });
  this._source      = [];
}

BaseCollection.extend(LoadableCollection, {

  /**
   */

  _retryTimeout : 1000 * 5,
  _retryCount   : 2,

  /**
   */

  createModel: function (data) {
    var modelClass = this.options.modelClass || BaseModel;
    return new modelClass(data, this);
  },

  /**
   */

  wait: function (query, timeout, next) {

    if (arguments.length === 2) {
      next = timeout;
      timeout = 1000 * 60 * 20;
    }

    var self = this;


    hurryup(function (next) {

      self.logger.verbose("wait(%s)", JSON.stringify(query));

      self.reload(function () {
        self.find(query, outcome.e(next).s(function (models) {

          if (!models.length) return next(comerr.notFound());

          next(null, models);
        }));
      });
    }, {
      timeout: timeout,
      retry: true,
      retryTimeout: 1000 * 5
    }).call(null, next);
  },

  /**
   */

  waitForOne: function(query, timeout, next) {

    if (arguments.length === 2) {
      next = timeout;
      timeout = 1000 * 60 * 20;
    }

    this.wait(query, timeout, outcome.e(next).s(function (models) {
      next(null, models.shift());
    }));
  },

  /**
   */

  find: function (query, next) {

    // return everything
    if (arguments.length === 1) {
      next  = query;
      query = function () { return true };
    }

    if (typeof query === "string") {
      query = { _id: query };
    }


    var self = this;

    this.load({}, outcome.e(next).s(function(models) {

      var sifter = sift(query);

      next(null, models.filter(function (model) {
        return sifter.test(model.context());
      }));
    }));
  },

  /**
   */

  findOne: function (query, next) {
    this.find(query, outcome.e(next).s(function (models) {
      next(null, models.shift());
    }));
  },

  /**
   */


  reload: function (options, next) {

    if (arguments.length === 1) {
      next = options;
      options = {};
    }

    if (!next) next = function () { };

    var self = this;

    this._load(options, outcome.e(next).s(function (source) {
        
      // may only be loading one item - don't remove if that's the case
      next(null, self._reset(source, !Object.keys(options).length));
    }));
  },

  /**
   */

  _reset: function (source, remove) {

    var emodels  = this._source,
    nmodels      = source.concat(),
    emodel,
    nmodel,
    rmodel;

    // remove items
    if (remove)
    for (var i = emodels.length; i--;) {

      emodel = emodels[i];

      for (var j = nmodels.length; j--;) {
        nmodel = nmodels[j];
        if (emodel.get("_id") === nmodel._id) {
          break;
        }
      }

      if (!~j) {
        this.emit("remove", emodels.splice(i, 1).shift().dispose());
      }
    }


    // updating existing
    for (var i = 0, n = emodels.length; i < n; i++) {
      emodel = emodels[i];
      for (var j = 0, n2 = nmodels.length; j < n2; j++) {
        nmodel = nmodels[j];

        if (emodel.get("_id") == nmodel._id) {
          emodel.setProperties(nmodel); 

          // exists, remove from the new models collection
          nmodels.splice(j, 1);

          this.emit("update", emodel);
          break;
        }
      }
    }


    // add the new items
    for (var i = nmodels.length; i--;) {
      nmodel = nmodels[i];
      emodel = this.createModel(nmodel);
      emodels.push(emodel);
      this.emit("create", emodel);
    }


    // return the source - needed for reload()
    return emodels.concat();
  }
});

module.exports = LoadableCollection;