var openChild;

/**
 * I use a self executing function (SEF) to wrap all code that executes on creation.
 */
(function() {

  openChild = $.args.openChild;

  $.data.fetch({
    query: 'SELECT * FROM `data` WHERE `ride` = "' + $.args.rideId + '"'
  });

})();

function openDatapoint(e) {

  openChild(Alloy.createController('datapoint', {
    id: e.itemId
  }).getView());

}

function close() {
  $.win.close();
}
