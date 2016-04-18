var moment = require('alloy/moment');
var units = require('units');

exports.definition = {
  config: {
    columns: {
      id: 'TEXT UNIQUE',
      ride: 'TEXT',
      timestamp: 'INTEGER',
      latitude: 'REAL',
      longitude: 'REAL',
      accuracy: 'INTEGER',
      altitude: 'REAL',
      altitudeAccuracy: 'REAL',
      heading: 'REAL',
      speed: 'REAL'
    },
    adapter: {
      type: 'sql',
      collection_name: 'data',
      idAttribute: 'id'
    }
  },
  extendModel: function (Model) {

    _.extend(Model.prototype, {

      // Since Alloy 1.8.2 we can define our transform here instead of where we do data binding
      transform: function () {
        var transformed = this.toJSON();

        // Use getters to only transform when needed

        Object.defineProperty(transformed, 'timestampFormatted', {
          get: function () {
            return transformed.timestamp ? moment(transformed.timestamp).format('LTS SSS[ms]') : '';
          }
        });

        Object.defineProperty(transformed, 'latitudeFormatted', {
          get: function () {
            return _.isFinite(transformed.latitude) ? units.formatFloat(transformed.latitude, 7) : L('Unavailable');
          }
        });

        Object.defineProperty(transformed, 'longitudeFormatted', {
          get: function () {
            return _.isFinite(transformed.longitude) ? units.formatFloat(transformed.longitude, 7) : L('Unavailable');
          }
        });

        Object.defineProperty(transformed, 'accuracyFormatted', {
          get: function () {
            return _.isFinite(transformed.accuracy) ? units.formatLength(transformed.accuracy) : L('Unavailable');
          }
        });

        Object.defineProperty(transformed, 'altitudeFormatted', {
          get: function () {
            return _.isFinite(transformed.altitudeAccuracy) ? units.formatLength(transformed.altitude) : L('Unavailable');
          }
        });

        Object.defineProperty(transformed, 'altitudeAccuracyFormatted', {
          get: function () {
            return _.isFinite(transformed.altitudeAccuracy) ? units.formatLength(transformed.altitudeAccuracy) : L('Unavailable');
          }
        });

        Object.defineProperty(transformed, 'headingFormatted', {
          get: function () {
            return units.formatHeading(transformed.heading);
          }
        });

        Object.defineProperty(transformed, 'speedFormatted', {
          get: function () {
            return units.formatSpeed(transformed.speed);
          }
        });

        return transformed;
      }
    });

    return Model;
  }
};
