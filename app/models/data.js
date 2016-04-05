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
  extendModel: function(Model) {

    _.extend(Model.prototype, {

      // Since Alloy 1.8.2 we can define our transform here instead of where we do data binding
      transform: function() {
        var attributes = this.toJSON();

        attributes.timestampFormatted = attributes.timestamp ? moment(attributes.timestamp).format('LTS SSS[ms]') : '';

        if (_.isFinite(attributes.latitude)) {
          attributes.latitudeFormatted = units.formatFloat(attributes.latitude, 7);
          attributes.longitudeFormatted = units.formatFloat(attributes.longitude, 7);
        } else {
          attributes.latitudeFormatted = L('Unavailable');
          attributes.longitudeFormatted = L('Unavailable');
        }

        if (_.isFinite(attributes.accuracy)) {
          attributes.accuracyFormatted = units.formatLength(attributes.accuracy);
        } else {
          attributes.accuracyFormatted = L('Unavailable');
        }

        if (_.isFinite(attributes.altitudeAccuracy)) {
          attributes.altitudeFormatted = units.formatLength(attributes.altitude);
          attributes.altitudeAccuracyFormatted = units.formatLength(attributes.altitudeAccuracy);
        } else {
          attributes.altitudeFormatted = L('Unavailable');
          attributes.altitudeAccuracyFormatted = L('Unavailable');
        }

        attributes.headingFormatted = units.formatHeading(attributes.heading);
        attributes.speedFormatted = units.formatSpeed(attributes.speed);

        return attributes;
      }
    });

    return Model;
  }
};
