var $ = module.exports = {};

$.S4 = function() {
  return (65536 * (1 + Math.random()) | 0).toString(16).substring(1);
};

$.guid = function() {
  return $.S4() + $.S4() + "-" + $.S4() + "-" + $.S4() + "-" + $.S4() + "-" + $.S4() + $.S4() + $.S4();
};

// Helper to turn a string with Markdown-links into an Attributed String
$.mdToAs = function(str) {
  var params = {
    attributes: []
  };

  var removedChars = 0;

  params.text = str.replace(/\[([^\]]+)\]\(([^\)]+)\)/g, function(match, text, link, offset) {

    params.attributes.push({
      type: Ti.UI.ATTRIBUTE_LINK,
      value: link,
      range: [offset - removedChars, text.length]
    });

    // Override the default colors with our brand

    params.attributes.push({
      type: Ti.UI.ATTRIBUTE_FOREGROUND_COLOR,
      value: Alloy.CFG.colors.brandDark,
      range: [offset - removedChars, text.length]
    });

    params.attributes.push({
      type: Ti.UI.ATTRIBUTE_UNDERLINE_COLOR,
      value: Alloy.CFG.colors.brandDark,
      range: [offset - removedChars, text.length]
    });

    removedChars += match.length - text.length;

    return text;
  });

  return Ti.UI.createAttributedString(params);
};
