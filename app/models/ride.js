var moment = require('alloy/moment');
var units = require('units');
var sql = require('sql');

exports.definition = {
  config: {
    columns: {
      id: 'TEXT UNIQUE',
      fromTime: 'INTEGER',
      toTime: 'INTEGER'
    },
    adapter: {
      type: 'sql',
      collection_name: 'rides',
      idAttribute: 'id'
    }
  },
  extendModel: function (Model) {

    _.extend(Model.prototype, {

      // Since Alloy 1.8.2 we can define our transform here instead of where we do data binding
      transform: function () {
        var transformed = this.toJSON();

        // Use getters to only transform when needed

        Object.defineProperty(transformed, 'fromTimeFormatted', {
          get: function () {
            return transformed.fromTime ? moment(transformed.fromTime).format('LLLL') : null;
          }
        });

        Object.defineProperty(transformed, 'toTimeFormatted', {
          get: function () {
            return transformed.toTime ? moment(transformed.toTime).format('LLLL') : null;
          }
        });
        
        Object.defineProperty(transformed, 'avgSpeedFormatted', {
          get: function () {
            return units.formatSpeed(sql.calculateAvarageSpeedForRide(transformed.id));
          }
        });

        return transformed;
      }

    });

    return Model;
  }
};
