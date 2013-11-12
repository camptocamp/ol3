// NOCOMPILE
goog.require('ol.Map');
goog.require('ol.RendererHint');
goog.require('ol.View2D');
goog.require('ol.format.GeoJSON');
goog.require('ol.layer.Tile');
goog.require('ol.layer.Vector');
goog.require('ol.proj');
goog.require('ol.source.MapQuestOpenAerial');
goog.require('ol.source.Vector');

var map = new ol.Map({
  layers: [
    new ol.layer.Tile({
      source: new ol.source.MapQuestOpenAerial()
    })
  ],
  renderer: ol.RendererHint.CANVAS,
  target: 'map',
  view: new ol.View2D({
    center: [0, 0],
    zoom: 2
  })
});

var vectorSource = new ol.source.Vector();
var style = {
  fill: {
    color: 'rgba(255, 255, 255, 0.6)'
  },
  stroke: {
    color: '#319FD3',
    width: 1
  }
};

$.get('data/countries.geojson', function(data) {
  var format = new ol.format.GeoJSON();
  var transformFn = ol.proj.getTransform('EPSG:4326', 'EPSG:3857');
  format.readString(data, function(feature) {
    var geometry = feature.getGeometry();
    geometry.transform(transformFn);
    feature.setGeometry(geometry);
    vectorSource.addFeature(feature);
  });
  map.getLayers().push(new ol.layer.Vector({
    source: vectorSource,
    styleFunction: function(feature) {
      return style;
    }
  }));
});

var displayFeatureInfo = function(pixel) {
  var coordinate = map.getCoordinateFromPixel(pixel);
  var features = vectorSource.getAllFeaturesAtCoordinate(coordinate);
  var innerHTML = features.length ?
      features[0].getId() + ': ' + features[0].get('name') :
      '&nbsp;';
  document.getElementById('info').innerHTML = innerHTML;
};

$(map.getViewport()).on('mousemove', function(evt) {
  var pixel = map.getEventPixel(evt.originalEvent);
  displayFeatureInfo(pixel);
});

map.on('singleclick', function(evt) {
  var pixel = evt.getPixel();
  displayFeatureInfo(pixel);
});
