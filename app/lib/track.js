/**
 * Library to do the actual tracking.
 */

var dialogs = require('alloy/dialogs');
var permissions = require('permissions');
var utils = require('utils');

var $ = module.exports = _.clone(Backbone.Events);

var currentRide;
var configuredMonitoring = false;

$.isTracking = function() {
  return !!currentRide;
};

$.toggleTracking = function(cb) {

  if ($.isTracking()) {
    $.stopTracking(cb);
  } else {
    $.startTracking(cb);
  }

};

$.startTracking = function(cb) {

  if ($.isTracking()) {
    return cb({
      success: false,
      error: 'Already tracking'
    });
  }

  initMonitoring(function(e) {

    if (!e.success) {
      return cb(e);
    }

    currentRide = Alloy.Collections.instance('ride').create({
      id: utils.guid(),
      fromTime: Date.now()
    });

    Ti.Geolocation.addEventListener('location', onLocation);

    cb({
      success: true
    });

    $.trigger('start', {
      type: 'start'
    });
  });
};

$.stopTracking = function(cb) {

  if (!$.isTracking()) {
    return cb({
      success: false,
      error: 'Not tracking'
    });
  }

  Ti.Geolocation.removeEventListener('location', onLocation);

  currentRide.save({
    toTime: Date.now()
  });

  currentRide = null;

  cb({
    success: true
  });

  $.trigger('stop', {
    type: 'stop'
  });
};

function initMonitoring(cb) {

  permissions.requestLocationPermissions(Ti.Geolocation.AUTHORIZATION_ALWAYS, function(e) {

    if (e.success && !configuredMonitoring) {

      if (OS_IOS) {
        Ti.Geolocation.accuracy = Ti.Geolocation.ACCURACY_BEST;
        Ti.Geolocation.distanceFilter = Alloy.CFG.minUpdateDistance;
        Ti.Geolocation.preferredProvider = Ti.Geolocation.PROVIDER_GPS;
      }

      if (OS_ANDROID) {
        Ti.Geolocation.Android.addLocationProvider(Ti.Geolocation.Android.createLocationProvider({
          name: Ti.Geolocation.PROVIDER_GPS,
          minUpdateDistance: Alloy.CFG.minUpdateDistance,
          minUpdateTime: (Alloy.CFG.minAge / 1000)
        }));
        Ti.Geolocation.Android.addLocationRule(Ti.Geolocation.Android.createLocationRule({
          provider: Ti.Geolocation.PROVIDER_GPS,
          accuracy: Alloy.CFG.accuracy,
          maxAge: Alloy.CFG.maxAge,
          minAge: Alloy.CFG.minAge
        }));
        Ti.Geolocation.Android.manualMode = true;
      }

      configuredMonitoring = true;
    }

    return cb(e);
  });
}

function onLocation(e) {

  if (!e.error) {
    var coords = e.coords;

    var data = {
      id: utils.guid(),
      ride: currentRide.id
    };

    // iOS: -1, Android: null
    if (coords.altitudeAccuracy !== -1 && coords.altitudeAccuracy !== null) {
      data.altitudeAccuracy = coords.altitudeAccuracy;
      data.altitude = coords.altitude;
    }

    ['heading', 'speed'].forEach(function(key) {

      if (coords[key] !== -1) {
        data[key] = coords[key];
      }

    });

    ['altitude', 'latitude', 'longitude', 'timestamp'].forEach(function(key) {
      data[key] = coords[key];
    });

    Alloy.Collections.instance('data').create(data);

    data.type = 'location';

    $.trigger('data', data);
  }
}
