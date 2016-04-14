var properties = require('properties');
var utils = require('utils');

/**
 * I use a self executing function (SEF) to wrap all code that executes on creation.
 */
(function() {

  // check current system
  var system = properties.get('system');
  setIdHasCheck(system, true);

  $.aboutBody.attributedString = utils.mdToAs(OS_ANDROID ? L('About_Body_Android') : L('About_Body'));

})();

function setSystem(e) {
  var existing = properties.get('system');
  var selected = e.row.id;

  if (existing === selected) {
    return;
  }

  setIdHasCheck(existing, false);
  setIdHasCheck(selected, true);

  properties.set('system', selected);
}

// Event listener for links in our about-attributedString
function onLink(e) {

  if (OS_IOS) {
    var dialog = require('ti.safaridialog');

    if (dialog.isSupported()) {
      return dialog.open({
        url: e.url,
        tintColor: Alloy.CFG.colors.brand
      });
    }
  }

  Ti.Platform.openURL(e.url);
}

function openDonate() {

  // Not allowed to use Safari Dialog by Apple
  Ti.Platform.openURL(OS_ANDROID ? 'https://github.com/fokkezb/tracker' : 'http://fokkezb.nl/rwanda');
}

// Helper to toggle the checkmark
function setIdHasCheck(id, hasCheck) {
  if (OS_ANDROID) {
    $[id + 'Check'].visible = hasCheck;
  } else {
    $[id].hasCheck = hasCheck;
  }
}
