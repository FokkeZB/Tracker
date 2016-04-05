// Use a SEF to protect the global scope of the app
(function() {

  // Load FontAwesome icon chars into global for use in TSS
  Alloy.Globals.icons = require('icons');

  // If country-locale of the device is set to a country that uses imperial units, make that the default
  if (_.contains(Alloy.CFG.imperialCountries, Ti.Locale.currentCountry)) {
    Alloy.CFG.settings.system.def = 'imperial';
  }

  // Set Moment.js to the locale of the device
  require('alloy/moment').locale(Ti.Locale.currentLocale);

})();
