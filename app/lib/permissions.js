/**
 * Hepers for run-time permissions.
 */

// DEPENDENCIES
var dialogs = require('alloy/dialogs');

// PUBLIC INTERFACE

exports.requestLocationPermissions = requestLocationPermissions;

// PRIVATE FUNCTIONS

function requestLocationPermissions(authorizationType, callback) {

  // FIXME: Always returns false on Android 6
  // https://jira.appcelerator.org/browse/TIMOB-23135
  if (OS_IOS && !Ti.Geolocation.locationServicesEnabled) {
    return callback({
      success: false,
      error: 'Location Services Disabled'
    });
  }

  if (Ti.Geolocation.hasLocationPermissions(authorizationType)) {
    return callback({
      success: true
    });
  }

  if (OS_IOS) {

    if (Ti.Geolocation.locationServicesAuthorization === Ti.Geolocation.AUTHORIZATION_RESTRICTED) {
      return callback({
        success: false,
        error: 'Your device policy does not allow Geolocation'
      });

    } else if (Ti.Geolocation.locationServicesAuthorization === Ti.Geolocation.AUTHORIZATION_DENIED) {

      dialogs.confirm({
        title: 'You denied permission before',
        message: 'Tap Yes to open the Settings app to restore permissions, then try again.',
        callback: function() {
          Ti.Platform.openURL(Ti.App.iOS.applicationOpenSettingsURL);
        }
      });

      // return success:false without an error since we've informed the user already
      return callback({
        success: false
      });
    }
  }

  Ti.Geolocation.requestLocationPermissions(Ti.Geolocation.AUTHORIZATION_ALWAYS, function(e) {

    if (!e.success) {
      return callback({
        success: false,
        error: e.error || 'Failed to request Location Permissions'
      });
    }

    callback({
      success: true
    });
  });
}
