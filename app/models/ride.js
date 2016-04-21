var moment = require('alloy/moment');

var calc = require('calc');
var DB = require('DB');
var sql = require('sql');
var units = require('units');

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
        var model = this;
        var transformed = model.toJSON();

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
            return units.formatSpeed(model.getAvarageSpeed());
          }
        });

        Object.defineProperty(transformed, 'distanceFormatted', {
          get: function () {
            return units.formatLength(model.getDistance());
          }
        });

        Object.defineProperty(transformed, 'durationFormatted', {
          get: function () {
            return units.formatDuration(model.getDuration());
          }
        });

        return transformed;
      },

      getAvarageSpeed: function() {
        var db = DB(this.config.adapter.db_name);

        return db.fetchOne('SELECT AVG(`speed`) FROM `data` WHERE `ride` = ?', this.id);
      },

      getDistance: function() {
        var db = DB(this.config.adapter.db_name);

        var points = db.fetchRows('SELECT `latitude`, `longitude` FROM `data` WHERE `ride` = ?', this.id);

        return calc.calculateTotalDistanceForPoints(points);
      },

      getDuration: function() {
        var toTime = this.get('toTime');

        return -1 * moment(this.get('fromTime')).diff(toTime ? moment(toTime) : moment());
      }

    });

    return Model;
  }
};
