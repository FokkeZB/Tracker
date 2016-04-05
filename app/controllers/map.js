/**
 * I use a self executing function (SEF) to wrap all code that executes on creation.
 */
(function() {

  $.map.rideId = $.args.rideId;

})();

function close() {
  $.win.close();
}
