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

  find: function (query, waitUntil, next) {

    // return everything
    if (arguments.length === 1) {
      next  = query;
      query = function () { return true };
    }

    if (arguments.length === 2) {
      next      = waitUntil;
      waitUntil = undefined;
    }

    if (typeof query === "string") {
      query = { _id: query };
    }


    var self = this;


    function _find (next) {


      function onError (err) {

        // bust cache
        self.load.clearAll();

        next(err);
      }


      self.load({}, outcome.e(onError).s(function(models) {

        var sifter = sift(query),
        filteredModels = models.filter(function (model) {
          return sifter.test(model.context());
        });

        // no models? return an error
        if (waitUntil && !filteredModels.length) {
          return onError(comerr.notFound());
        }

        next(null, filteredModels);
      }));
    }

    if (!waitUntil) {
      _find(next);
    } else {
      hurryup(_find, { timeout: waitUntil, retry: true, retryTimeout: this._retryTimeout, number: this._retryCount }).call(null, next);
    }
  },

  /**
   */

  findOne: function (query, next) {
    this.find(query, outcome.e(next).s(function (models) {
      next(null, models);
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
      next(null, self._reset(source));
    }));
  },

  /**
   */

  _reset: function (source) {

    var emodels  = this._source,
    nmodels      = source.concat(),
    emodel,
    nmodel,
    rmodel;

    // remove items
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
      for (var j = 0, n2 = nmodels.length; j < n; j++) {
        nmodel = nmodels[j];
        if (emodel.get("_id") === nmodel._id) {
          emodel.update(nmodel); 

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
    return emodels;
  }
});

module.exports = LoadableCollection;