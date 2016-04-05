var properties = require('properties');

/**
 * I use a self executing function (SEF) to wrap all code that executes on creation.
 */
(function() {

  $.datapoint.on('fetch', setAnnotation);

  // Fetch the data for the passed id into the empty model instance
  $.datapoint.fetch({
    id: $.args.id
  });

  // When the user changes the unit system
  properties.on('change:system', onSystemChange);

})();

// Clean up global listeners on close
function onClose(e) {
  properties.off('change:system', onSystemChange);
}

// Fires when the datapoint has been fetched
function setAnnotation() {

  // Remove the map (if still there) when we have no location
  if (!_.isFinite($.datapoint.get('latitude'))) {

    if ($.map) {
      $.map.parent.remove($.map);
      $.map = null;
    }
  }

  var point = {
    latitude: parseFloat($.datapoint.get('latitude')),
    longitude: parseFloat($.datapoint.get('longitude'))
  };

  $.map.applyProperties({
    annotations: [
      require('ti.map').createAnnotation(point)
    ],
    region: _.defaults({
      latitudeDelta: Alloy.CFG.pointDelta,
      longitudeDelta: Alloy.CFG.pointDelta,
    }, point)
  });
}

function onSystemChange(e) {

  // trigger change on model so that the UI rerenders
  $.datapoint.trigger('change');
}

function close() {
  $.win.close();
}
