/**
 * Helpers to do complex SQL queries on a large number of models, bypassing Backbone.
 */

var DB = require('DB');
var db = DB('_alloy_');

// PUBLIC INTERFACE

exports.confirmToDeleteRide = confirmToDeleteRide;
exports.calculateAvarageSpeedForRide = calculateAvarageSpeedForRide;
exports.calculateTotalDistanceForRide = calculateTotalDistanceForRide;

// PRIVATE FUNCTIONS

function confirmToDeleteRide(rideId, onDelete) {

  var dialog = Ti.UI.createAlertDialog({
    title: 'You will loose all data for this ride.',
    message: 'Are you sure?',
    buttonNames: ['Yes', 'No'],
    cancel: 1
  });

  dialog.addEventListener('click', function (e) {

    if (e.index === 0) {

      // A lot more efficient than one by one via Backbone
      db.transaction(function (con) {
        con.execute('DELETE FROM `data` WHERE `ride` = ?', rideId);
        con.execute('DELETE FROM `rides` WHERE `id` = ?', rideId);
      });

      if (_.isFunction(onDelete)) {
        onDelete();
      }
    }

    // if cancelled, will add back already removed ListItems on iOS
    // if not, will flush deleted from collection
    Alloy.Collections.instance('ride').fetch();

  });

  dialog.show();
}

function calculateAvarageSpeedForRide(rideId) {
  return db.fetchOne('SELECT AVG(`speed`) FROM `data` WHERE `ride` = ?', rideId);
}

function calculateTotalDistanceForRide(rideId) {
  var points = db.fetchRows('SELECT `latitude`, `longitude` FROM `data` WHERE `ride` = ?', rideId);

  return calculateTotalDistanceForPoints(points);
}

function calculateTotalDistanceForPoints(points) {
  var total = 0;

  if (points.length >= 2) {

    for (var i = 0; i < points.length - 1; i++) {
      total += calculateDistanceBetweenPoints(points[i], points[i + 1]);
    }
  }

  return total;
}

// SOURCE: http://stackoverflow.com/a/21623206/4626813
function calculateDistanceBetweenPoints(a, b) {
  var p = 0.017453292519943295; // Math.PI / 180
  var c = Math.cos;
  var a = 0.5 - c((b.latitude - a.latitude) * p) / 2 +
    c(a.latitude * p) * c(b.latitude * p) *
    (1 - c((b.longitude - a.longitude) * p)) / 2;

  return 12799188 * Math.asin(Math.sqrt(a)); // 2 * R; R = 6399594 m
}