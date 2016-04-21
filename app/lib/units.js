/**
 * Library to convert and localize units.
 */

// DEPENDENCIES

var properties = require('properties');

// PUBLIC INTERFACE

exports.formatFloat = formatFloat;
exports.formatSpeed = formatSpeed;
exports.formatHeading = formatHeading;
exports.formatLength = formatLength;
exports.formatDuration = formatDuration;

// PRIVATE VARIABLES

// Trick to get the decimal separator
var DECIMAL = String.formatDecimal(1.1, Ti.Locale.currentLocale, '0.0')[1];

// PRIVATE FUNCTIONS

function formatFloat(fl, dec) {

  fl = round(fl, dec);

  // We can't use String.formatDecimal() because it has a max nr of decimals
  return fl.toString().replace('.', DECIMAL);
}

function formatSpeed(ms) {
  var abbr;

  if (!_.isFinite(ms)) {
    return '';
  }

  // m/s to km/h
  var v = ms * 3.6;

  if (imperial()) {
    abbr = 'mph';
    v = v / 1.609344;

  } else {
    abbr = 'km/h';
  }

  return formatFloat(v, 1) + ' ' + abbr;
}

// source: http://jsfiddle.net/AezL3/11/
function formatHeading(degrees) {

  if (!_.isFinite(degrees)) {
    return null;
  }

  var cardinal = ['N', 'E', 'S', 'W'];
  var descs = ['1', '1b2', '1-C', 'Cb1', 'C', 'Cb2', '2-C', '2b1'];

  var i = (degrees / 11.25);
  i = i + 0.5 | 0;
  i = i % 32;

  var desc = descs[i % 8];

  i = (i / 8) | 0 % 4;

  var str1 = cardinal[i];
  var str2 = cardinal[(i + 1) % 4];
  var strC = (str1 == cardinal[0] | str1 == cardinal[2]) ? str1 + str2 : str2 + str1;

  return desc.replace(1, str1).replace(2, str2).replace('C', strC) + ' (' + round(degrees) + '°)';
}

function formatLength(m) {
  var v, abbr;

  if (!_.isFinite(m)) {
    return '';
  }

  if (imperial()) {
    v = m / 0.3048;

    if (v > 750) {
      v = v / 5280;
      abbr = 'mi';
    } else {
      abbr = 'ft';
    }

  } else {
    v = m;

    if (m > 750) {
      v = m / 1000;
      abbr = 'km';
    } else {
      abbr = 'm';
    }

  }

  return formatFloat(v, 1) + ' ' + abbr;
}

function formatDuration(ms) {
  var s = Math.round(ms / 1000);
  var m = Math.floor(s / 60);
  var h = Math.floor(m / 60);

  if (h > 0) {
    m = m % 60;
  }

  s = s % 60;

  var str = lpad(s.toString(), 2, '0');

  if (h > 0) {
    str = h.toString() + ':' + lpad(m.toString(), 2, '0') + ':' + str;
  } else {
    str = m.toString() + ':' + str;
  }

  return str;
}

function imperial() {
  return system() === 'imperial';
}

function system() {
  return properties.get('system');
}

function round(val, dec) {
  var factor = dec ? Math.pow(10, dec) : 1;

  return Math.round(val * factor) / factor;
}

function lpad(str, length, char) {
  char || (char = ' ');

  if (str.length >= length) {
    return str;
  }

  return (new Array(length - str.length + 1)).join(char) + str;
}
