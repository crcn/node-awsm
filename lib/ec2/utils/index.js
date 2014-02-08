
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
    return obj;
  }
}