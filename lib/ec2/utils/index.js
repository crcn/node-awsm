var bindable = require("bindable");

module.exports = {

  /**
   */

  mapTags: function (tagsAr) {
    var tags = {};

    for (var i = tagsAr.length; i--;) {
      var tag = tagsAr[i];
      tags[tag.Key] = tag.Value;
    }

    return tags;
  },

  /**
   */

  cleanObject: function (obj) {
    
    for (var key in obj) {
      if(obj[key] == null) {
        delete obj[key]
      }
    }

    // little bit of a hack - we want to get rid of dot syntax, so 
    // use bindable.js to do it for us
    return new bindable.Object().setProperties(obj).context();
  }
}