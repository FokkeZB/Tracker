exports.calculateTotalDistanceForPoints = calculateTotalDistanceForPoints;

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
function calculateDistanceBetweenPoints(pointA, pointB) {
  var p = 0.017453292519943295; // Math.PI / 180
  var c = Math.cos;
  var a = 0.5 - c((pointB.latitude - pointA.latitude) * p) / 2 +
    c(pointA.latitude * p) * c(pointB.latitude * p) *
    (1 - c((pointB.longitude - pointA.longitude) * p)) / 2;

  return 12799188 * Math.asin(Math.sqrt(a)); // 2 * R; R = 6399594 m
}
