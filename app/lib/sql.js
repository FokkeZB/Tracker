/**
 * Helpers to do complex SQL queries on a large number of models, bypassing Backbone.
 */

var DB = require('DB');
var db = DB('_alloy_');

// PUBLIC INTERFACE

exports.confirmToDeleteRide = confirmToDeleteRide;
exports.calculateAvarageSpeedForRide = calculateAvarageSpeedForRide;

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
      db.transaction(function(con) {
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