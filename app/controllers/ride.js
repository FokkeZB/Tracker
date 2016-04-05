var crud = require('crud');

var openChild;

/**
 * I use a self executing function (SEF) to wrap all code that executes on creation.
 */
(function() {

  openChild = $.args.openChild;

  $.ride.fetch({
    id: $.args.rideId
  });

})();

function openView(e) {

  openChild(Alloy.createController(e.itemId, {
    rideId: $.ride.id,
    openChild: openChild
  }).getView());
}

function close() {
  $.win.close();
}

function confirmToDeleteRide(e) {
  crud.confirmToDeleteRide($.args.rideId, close);
}
