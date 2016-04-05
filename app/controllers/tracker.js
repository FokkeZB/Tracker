var track = require('track');
var units = require('units');

/**
 * I use a self executing function (SEF) to wrap all code that executes on creation.
 */
(function() {

  track.on('start stop', onStartStop);
  track.on('data', onData);

  // On Android we simply set keepScreenOn per Window
  // For iOS we need to set it for the full app when this tab is active
  if (OS_IOS) {
    $.tab.addEventListener('selected', onSelectionChange);
    $.tab.addEventListener('unselected', onSelectionChange);
  }

})();

function toggleTracking() {

  track.toggleTracking(function(e) {

    if (e.error) {
      alert(e.error);
    }

  });
}

// Uses Alloy dynamic styling to change the button icon
function onStartStop(e) {

  if (e.type === 'start') {
    $.addClass($.toggleTracking, 'stopTracking');
  } else {
    $.removeClass($.toggleTracking, 'stopTracking');

    $.speedLabel.text = '';
  }
}

function onData(e) {
  $.speedLabel.text = units.formatSpeed(e.speed);
}

function onSelectionChange(e) {
  Ti.App.idleTimerDisabled = (e.type === 'selected');
}
