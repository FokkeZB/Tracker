/**
 * Helpers to do CRUD operations on a large number of models, bypassing BB.
 */

exports.confirmToDeleteRide = confirmToDeleteRide;

function confirmToDeleteRide(rideId, onDelete) {

  var dialog = Ti.UI.createAlertDialog({
    title: 'You will loose all data for this ride.',
    message: 'Are you sure?',
    buttonNames: ['Yes', 'No'],
    cancel: 1
  });

  dialog.addEventListener('click', function(e) {

    if (e.index === 0) {

      // A lot more efficient than one by one via Backbone
      var db = Ti.Database.open('_alloy_');
      db.execute('DELETE FROM `data` WHERE `ride` = ?', rideId);
      db.execute('DELETE FROM `rides` WHERE `id` = ?', rideId);
      db.close();

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
