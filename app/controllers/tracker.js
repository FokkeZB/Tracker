// DEPENDENCIES

var sql = require('sql');
var track = require('track');
var units = require('units');

// PRIVATE

var durationInterval;
var lastData;

/**
 * I use a self executing function (SEF) to wrap all code that executes on creation.
 */
(function() {

  track.on('state', onState);
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
function onState(e) {

  console.log(e);

  if (e.type === 'start') {
    $.addClass($.toggleBtn, 'toggleBtnTracking');

    $.info.animate({
      opacity: 1
    });

    durationInterval = setInterval(onInterval, 1000);

  } else if (e.type === 'stop') {
    $.removeClass($.toggleBtn, 'toggleBtnTracking');

    $.speedLabel.text = '';
    $.avgSpeedLabel.text = '';

    $.distanceLabel.text = '';
    $.durationLabel.text = '';

    $.info.animate({
      opacity: 0
    });

    clearInterval(durationInterval);
  }
}

function onData(e) {
  lastData = e;

  var t = track.getCurrentRide().transform();

  $.speedLabel.text = units.formatSpeed(lastData.speed);
  $.avgSpeedLabel.text = t.avgSpeedFormatted;

  $.distanceLabel.text = t.distanceFormatted;
  $.durationLabel.text = t.durationFormatted;
}

function onInterval() {
  var t = track.getCurrentRide().transform();

  $.durationLabel.text = t.durationFormatted;

  if (Date.now() - lastData.timestamp > Alloy.CFG.msToPause) {
    $.speedLabel.text = units.formatSpeed(0);
  }
}

function onSelectionChange(e) {
  Ti.App.idleTimerDisabled = (e.type === 'selected');
}
