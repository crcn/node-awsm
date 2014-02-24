var Collection = require("../../../base/loadableCollection"),
RecordSet     = require("./model"),
outcome        = require("outcome"),
toarray        = require("toarray");

function RecordSets (hostedZone) {

  this.hostedZone = hostedZone;
  this.api        = hostedZone.api;
  this.awsm       = hostedZone.awsm;
  this.logger     = hostedZone.logger.child("recordSets");

  Collection.call(this, {});
}

Collection.extend(RecordSets, {

  /**
   */

  createModel: function (data) {
    return new RecordSet(data, this);
  },

  /**
   */

  create: function (options, next) {

    var ops = {
      Name            : options.name,
      Type            : options.type,
      Weight          : options.weight,
      Region          : options.region,
      Faolover        : options.failover,
      ttl             : options.ttl,
      ResourceRecords : toarray(options.records).map(function (record) {
        return { Value: record }
      })
    };

    this.api.changeResourceRecordSets({
      Action            : "CREATE",
      ResourceRecordSet : ops
    })
  },

  /**
   */

  _load: function (options, next) {

    var ops = {
      HostedZoneId: this.hostedZone.get("_id")
    };

    this.api.listResourceRecordSets(ops, outcome.e(next).s(function (response) {
      next(null, response.ResourceRecordSets.map(function (recordSet) {

        return {
          _id      : recordSet.Name + ":" + recordSet.Type,
          name     : recordSet.Name,
          type     : recordSet.Type,
          ttl      : recordSet.TTL,
          weight   : recordSet.Weight,
          region   : recordSet.Region,
          Failover : recordSet.Failover,
          records  : recordSet.ResourceRecords.map(function (record) {
            return record.Value
          })
        }
      }));
    }));
  }
});

module.exports = RecordSets;