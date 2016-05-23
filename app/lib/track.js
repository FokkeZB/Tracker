/**
 * Library to do the actual tracking.
 */

// DEPENDENCIES

var dialogs = require('alloy/dialogs');
var permissions = require('permissions');
var utils = require('utils');

// PUBLIC INTERFACE

var $ = module.exports = _.extend({

  getCurrentRide: getCurrentRide,
  isTracking: isTracking,
  toggleTracking: toggleTracking,
  startTracking: startTracking,
  stopTracking: stopTracking

}, Backbone.Events);

// PRIVATE VARIABLES

var currentRide;
var configuredMonitoring = false;

// PRIVATE FUNCTIONS

function getCurrentRide() {
  return currentRide;
}

function isTracking() {
  return !!getCurrentRide();
}

function toggleTracking(cb) {

  if (isTracking()) {
    stopTracking(cb);
  } else {
    startTracking(cb);
  }

}

function startTracking(cb) {

  if (isTracking()) {
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

    if (OS_IOS) {
      Ti.Geolocation.addEventListener('locationupdatepaused', onLocationupdate);
      Ti.Geolocation.addEventListener('locationupdateresumed', onLocationupdate);
    }

    cb({
      success: true
    });

    $.trigger('state state:start', {
      type: 'start'
    });
  });
}

function stopTracking(cb) {

  if (!isTracking()) {
    return cb({
      success: false,
      error: 'Not tracking'
    });
  }

  Ti.Geolocation.removeEventListener('location', onLocation);

  if (OS_IOS) {
    Ti.Geolocation.removeEventListener('locationupdatepaused', onLocationupdate);
    Ti.Geolocation.removeEventListener('locationupdateresumed', onLocationupdate);
  }

  currentRide.save({
    toTime: Date.now()
  });

  currentRide = null;

  cb({
    success: true
  });

  $.trigger('state state:stop', {
    type: 'stop'
  });
}

function initMonitoring(cb) {

  permissions.requestLocationPermissions(Ti.Geolocation.AUTHORIZATION_ALWAYS, function(e) {

    if (e.success && !configuredMonitoring) {

      if (OS_IOS) {
        Ti.Geolocation.accuracy = Ti.Geolocation.ACCURACY_BEST;
        Ti.Geolocation.distanceFilter = Alloy.CFG.minUpdateDistance;
        Ti.Geolocation.preferredProvider = Ti.Geolocation.PROVIDER_GPS;
        Ti.Geolocation.pauseLocationUpdateAutomatically = true;
        Ti.Geolocation.activityType = Ti.Geolocation.ACTIVITYTYPE_FITNESS;
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

function onLocationupdate(e) {
  var state = (e.type === 'locationupdatepaused' ? 'pause' : 'resume');

  $.trigger('state state:' + state, {
    type: state
  });
}
