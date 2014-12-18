goog.require('ol.Feature');
goog.require('ol.Map');
goog.require('ol.View');
goog.require('ol.geom.Point');
goog.require('ol.layer.Vector');
goog.require('ol.source.Vector');
goog.require('ol.style.AtlasManager');
goog.require('ol.style.Circle');
goog.require('ol.style.Fill');
goog.require('ol.style.RegularShape');
goog.require('ol.style.Stroke');
goog.require('ol.style.Style');

var atlasManager = new ol.style.AtlasManager({
  // we increase the initial size so that all symbols fit into
  // a single atlas image
  initialSize: getIntParam('atlas', 512)
});

var opaque = getBoolParam('opaque', false);
var differentColors = getIntParam('colors', 24);
var symbolInfo = function() {
  var res = [];
  for (var i = 0; i < differentColors; ++i) {
    var color = [
      Math.floor((Math.random() * 255) + 1),
      Math.floor((Math.random() * 255) + 1),
      Math.floor((Math.random() * 255) + 1),
      opaque ? 1 : (Math.random() / 2 + 0.5)];
    res.push({
      opacity: 1.0,
      scale: 1.0,
      strokeColor: color,
      fillColor: color
    });
    res.push({
      opacity: 1.0,
      scale: 1.0,
      strokeColor: color
    });
  }
  return res;
}();


var symbolSize = getIntParam('size', 6);
var radiuses = [symbolSize / 2];
var symbols = [];
var i, j;
for (i = 0; i < symbolInfo.length; ++i) {
  var info = symbolInfo[i];
  for (j = 0; j < radiuses.length; ++j) {
    // circle symbol
    symbols.push(new ol.style.Circle({
      opacity: info.opacity,
      scale: info.scale,
      radius: radiuses[j],
      fill: info.fillColor ? new ol.style.Fill({
        color: info.fillColor
      }) : undefined,
      stroke: new ol.style.Stroke({
        color: info.strokeColor,
        width: 1
      }),
      // by passing the atlas manager to the symbol,
      // the symbol will be added to an atlas
      atlasManager: atlasManager
    }));

    // star symbol
    symbols.push(new ol.style.RegularShape({
      points: 8,
      opacity: info.opacity,
      scale: info.scale,
      radius: radiuses[j],
      radius2: radiuses[j] * 0.7,
      angle: 1.4,
      fill: info.fillColor ? new ol.style.Fill({
        color: info.fillColor
      }) : undefined,
      stroke: new ol.style.Stroke({
        color: info.strokeColor,
        width: 1
      }),
      atlasManager: atlasManager
    }));

    // rectangle symbol
    symbols.push(new ol.style.RegularShape({
      points: 4,
      opacity: info.opacity,
      scale: info.scale,
      radius: radiuses[j],
      radius2: radiuses[j] * 0.7,
      angle: 1.4,
      fill: info.fillColor ? new ol.style.Fill({
        color: info.fillColor
      }) : undefined,
      stroke: new ol.style.Stroke({
        color: info.strokeColor,
        width: 1
      }),
      atlasManager: atlasManager
    }));
  }
}
var symbolCount = symbolInfo.length;

var featureCount = getIntParam('features', 30000);
var features = new Array(featureCount);
var feature, geometry;
var e = 25000000;
for (i = 0; i < featureCount; ++i) {
  geometry = new ol.geom.Point(
      [2 * e * Math.random() - e, 2 * e * Math.random() - e]);
  feature = new ol.Feature(geometry);
  feature.setStyle(
      new ol.style.Style({
        image: symbols[i % symbolCount]
      })
  );
  features[i] = feature;
}

var vectorSource = new ol.source.Vector({
  features: features
});
var vector = new ol.layer.Vector({
  source: vectorSource
});
vector.setRenderOrder(null); // disable sorting in renderer for performance


// Use the "webgl" renderer by default.
var renderer = exampleNS.getRendererFromQueryString();
if (!renderer) {
  renderer = 'webgl';
}

var map = new ol.Map({
  renderer: renderer,
  layers: [vector],
  target: document.getElementById('map'),
  view: new ol.View({
    center: [0, 0],
    zoom: 4
  })
});

function getFirstStringParam(name, defaultValue) {
  var res = exampleNS.getParamFromQueryString(name);
  return res ? res[0] : defaultValue;
}

function getBoolParam(name, defaultValue) {
  var res = getFirstStringParam(name, undefined);
  if (!res) return defaultValue;
  return res.toLowerCase() == 'true' || res[0] == '1';
}

function getIntParam(name, defaultValue) {
  var res = getFirstStringParam(name, undefined);
  return res ? parseInt(res, 10) : defaultValue;
}
