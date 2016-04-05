var crud = require('crud');

/**
 * I use a self executing function (SEF) to wrap all code that executes on creation.
 */
(function() {

  Alloy.Collections.ride.fetch();

})();

// Filter to only show completed rides
function dataFilter(col) {
  return col.filter(function(model) {
    return !!model.get('toTime');
  }).reverse();
}

function onItemclick(e) {

  // We use a helper that we also pass on so that additional windows can be
  // opened under this tab without them needing to know of the context
  openChild(Alloy.createController('ride', {
    openChild: openChild,
    rideId: e.itemId
  }).getView());
}

function openChild(win) {
  $.tab.open(win);
}

// Event listener for iOS only delete event on the list
function confirmToDeleteRide(e) {
  crud.confirmToDeleteRide(e.itemId);
}
