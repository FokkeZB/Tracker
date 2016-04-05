var map = require('ti.map');

/**
 * I use a self executing function (SEF) to wrap all code that executes on creation.
 */
(function() {

  $.map.applyProperties($.args);

})();

function renderRide(rideId) {

  // Move this heavy stuff to the end of the callstack
  _.defer(function() {

    $.data.fetch({
      query: 'SELECT * FROM data WHERE `ride` = "' + rideId + '"',
      success: function() {

        var latitudeNorth, latitudeSouth, longitudeEast, longitudeWest;

        var points = [];

        $.data.each(function(point) {

          if (!point.has('latitude') || !point.has('longitude')) {
            return;
          }

          point = {
            latitude: point.get('latitude'),
            longitude: point.get('longitude')
          };

          // Updates the bounds of our points

          if (latitudeNorth === undefined || point.latitude > latitudeNorth) {
            latitudeNorth = point.latitude;
          }

          if (latitudeSouth === undefined || point.latitude < latitudeSouth) {
            latitudeSouth = point.latitude;
          }

          if (longitudeEast === undefined || point.longitude > longitudeEast) {
            longitudeEast = point.longitude;
          }

          if (longitudeWest === undefined || point.longitude < longitudeWest) {
            longitudeWest = point.longitude;
          }

          points.push(point);

        });

        var latitudeDelta = (latitudeNorth - latitudeSouth);
        var longitudeDelta = (longitudeEast - longitudeWest);

        $.map.region = {

          // The center of our bounds
          latitude: latitudeNorth - (latitudeDelta / 2),
          longitude: longitudeEast - (longitudeDelta / 2),

          // Add a margin
          latitudeDelta: latitudeDelta + Alloy.CFG.trackDelta,
          longitudeDelta: longitudeDelta + Alloy.CFG.trackDelta
        };

        // Add annotations for start and finish
        if (points[0]) {
          $.map.addAnnotation(map.createAnnotation(points[0]));

          if (points.length > 2) {
            $.map.addAnnotation(map.createAnnotation(_.defaults({
              pincolor: map.ANNOTATION_GREEN
            }, points[points.length - 1])));

            $.map.addRoute(map.createRoute({
              color: Alloy.CFG.colors.brand,
              points: points
            }));
          }
        }
      }
    });

  });
}

Object.defineProperty($, 'rideId', {
  set: _.once(renderRide)
});
