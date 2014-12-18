goog.require('ol.Feature');
goog.require('ol.Map');
goog.require('ol.View');
goog.require('ol.geom.Point');
goog.require('ol.layer.Tile');
goog.require('ol.layer.Vector');
goog.require('ol.source.BingMaps');
goog.require('ol.source.Vector');
goog.require('ol.style.AtlasManager');
goog.require('ol.style.Circle');
goog.require('ol.style.Fill');
goog.require('ol.style.Stroke');
goog.require('ol.style.Style');

var timeradd; // frequency in sec to add nbpointpersec
var timerremove; // frequency in sec to remove

var atlasManager = new ol.style.AtlasManager({
  // we increase the default size so that all symbols fit into
  // a single atlas image
  size: 512,
  maxSize: ol.WEBGL_MAX_TEXTURE_SIZE
});

var symbolInfo = [{
  opacity: 1.0,
  scale: 1.0,
  fillColor: 'rgba(255, 0, 0, 1)', // rouge
  strokeColor: 'rgba(0, 0, 0, 1)'
}, {
  opacity: 1.0,
  scale: 1.0,
  fillColor: 'rgba(255, 255, 0, 1)', // jaune
  strokeColor: 'rgba(0, 0, 0, 1)'
}, {
  opacity: 1.0,
  scale: 1.0,
  fillColor: 'rgba(0, 255, 0, 1)', // vert
  strokeColor: 'rgba(0, 0, 0, 1)'
}, {
  opacity: 1.0,
  scale: 1.0,
  fillColor: 'rgba(0, 0, 255, 1)', // bleu
  strokeColor: 'rgba(0, 0, 0, 1)'
}
];

var xmin = -10000000;
var xmax = 10000000;
var deltaxy = 500000;
var ymin = -10000000;
var ymax = 10000000;
var lon = xmin, lat = ymin;
var c = 0;

var radiuses = [3];
var symbolCount = symbolInfo.length * radiuses.length * 2;
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
      fill: new ol.style.Fill({
        color: info.fillColor
      }),
      stroke: new ol.style.Stroke({
        color: info.strokeColor,
        width: 1
      }),
      // by passing the atlas manager to the symbol,
      // the symbol will be added to an atlas
      atlasManager: atlasManager
    }));
  }
}

var feature, geometry;
var e = 10000000;

var vectorSource = new ol.source.Vector({
  features: []
});
var vector = new ol.layer.Vector({
  source: vectorSource
});
vector.setRenderOrder(null); // disable sorting in renderer

// Use the "webgl" renderer by default.
var renderer = exampleNS.getRendererFromQueryString();
if (!renderer) {
  renderer = 'webgl';
}

var key = 'Ak-dzM4wZjSqTlzveKz5u0d4IQ4bRzVI309GxmkgSVr1ewS6iPSrOvOKhA-CJlm3';

var map = new ol.Map({
  renderer: renderer,
  layers: [
    new ol.layer.Tile({
      source: new ol.source.BingMaps({
        key: key,
        imagerySet: 'Aerial'
      })
           }),
    vector
  ],
  target: document.getElementById('map'),
  view: new ol.View({
    center: [3, 47],
    zoom: 1
  })
});

var counter = 0;
// add nbpointpersec every second
// random display
function initRandomFeatures(nb) {
  var features = new Array(nb);
  for (var i = 0; i < nb; ++i) {
    geometry = new ol.geom.Point(
        [2 * e * Math.random() - e, 2 * e * Math.random() - e]);
    lon = 2 * e * Math.random() - e;
    lat = 2 * e * Math.random() - e;
    feature = new ol.Feature(geometry);
    feature.setStyle(
        new ol.style.Style({
          image: symbols[i % symbolCount]
        })
    );
    counter++;
    feature.set('index', counter);
    feature.set('intensity', counter * 10);
    features[i] = feature;
  }
  vector.getSource().addFeatures(features);
  document.getElementById('nbpointsdisplayed').innerHTML = vector.getSource()
    .getFeatures().length;
  document.getElementById('currentdate').innerHTML = new Date();
}

// add nbpointpersec every second
// aligned display
function initAlignedFeatures(nb) {
  var features = new Array(nb);
  for (var i = 0; i < nb; ++i) {
    geometry = new ol.geom.Point([lon, lat]);
    //geometry.transform(ol.proj.getTransform('EPSG:4326', 'EPSG:3857'));
    feature = new ol.Feature(geometry);
    feature.setStyle(
        new ol.style.Style({
          image: symbols[c]
        })
    );
    counter++;
    feature.set('index', counter);
    feature.set('intensity', counter * 10);
    features[i] = feature;
    lat += deltaxy;
    if (lat > ymax) {
      lat = ymin;
      lon += deltaxy;
      c++;
      c = c % symbolInfo.length;
      if (lon > xmax) lon = xmin;
    } else
      lat += deltaxy;
    //lon+=deltaxy;
  }
  vector.getSource().addFeatures(features);
  document.getElementById('nbpointsdisplayed').innerHTML = vector.getSource()
    .getFeatures().length;
  document.getElementById('currentdate').innerHTML = new Date();
}

// every removefreq seconds remove all features above nbmaxpoints
function removeFeatures() {
  var listfeatures = vector.getSource().getFeatures();
  var buffersize = listfeatures.length;
  var max = document.getElementById('nbmaxpoints').value;
  if (buffersize > max) {
    document.getElementById('mess').innerHTML = 'start remove';
    var delta = buffersize - max;
    for (var k = 0; k < delta; k++) {
      vector.getSource().removeFeature(listfeatures[k]);
    }
    displayMess('end remove of ' + (buffersize - max) + ' points');
  }
}

// simulate past time request
function startPastTime() {
  clearBuffer();
  displayMess('past time');
  initRandomFeatures(document.getElementById('nbpointpasttime').value);
}
// simulate real time session including a real time request followed by real
// time
function startRealTime() {
  document.getElementById('startdate').innerHTML = new Date();
  startPastTime();
  displayMess('real time');
  timeradd = setInterval(function() {
    initRandomFeatures(document.getElementById('nbpointpersec').value);
  }, 1000);
  timerremove = setInterval(function() {
    removeFeatures();
  }, document.getElementById('removefreq').value * 1000);
}
// stop real time
function stopRealTime() {
  displayMess('stop real time');
  clearInterval(timeradd);
  clearInterval(timerremove);
}
// remove all features
function clearBuffer() {
  lon = xmin, lat = ymin;
  document.getElementById('mess').innerHTML = 'clear buffer';
  vector.getSource().clear(true);
}
// display message state and update date
function displayMess(mess) {
  document.getElementById('mess').innerHTML = mess;
}

displayMess('');
