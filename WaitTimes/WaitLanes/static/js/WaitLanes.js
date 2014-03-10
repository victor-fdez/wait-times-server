
var maps = new Object();
var extents = new Object();
var domain = "72.191.185.122"
/* showGeoJsonOnMap
* 
* divId - string id of div used to draw map
* fileUrl - the geojson file url
*/
function showGeoJsonOnMap(divId, fileUrl){
	//$("#"+divId).css({"min-height": 200});
	var map = new OpenLayers.Map({
		div: divId,
		allOverlays: true,
		controls: []
	});
	var osm = new OpenLayers.Layer.OSM("victorstreetmaps", "http://"+domain+"/osm_tiles/${z}/${x}/${y}.png", {tileOptions: {crossOriginKeyword: null}});
	var geoJsonFormat = new OpenLayers.Format.GeoJSON({
			/*"internalProjection": mapProj,
			"externalProjection": ourProj*/
	});
	var geoJsonGetter = new OpenLayers.Protocol.HTTP({
		"url": "http://"+domain+":8001"+fileUrl,
		"format": geoJsonFormat
	});
	var geoJsonLoadStrategy = [new OpenLayers.Strategy.Fixed()];
	var geoJsonLayer = new OpenLayers.Layer.Vector('puentes_layer', {
		"protocol": geoJsonGetter,
		"strategies": geoJsonLoadStrategy
	});

	map.addLayers([osm, geoJsonLayer]);
	map.addControl(new OpenLayers.Control.LayerSwitcher());
	map.zoomToMaxExtent();

	geoJsonLayer.events.register("featuresadded", geoJsonLayer, function(object){
		console.log("features added successfully"); //assumption
		//setup div height and width
		var id = "#"+divId;
		var width = $(id).parent().width();
		$(id).width(width);
		$(id).height(width);
		//create and array of geometries for the features
		var features = object.features;
		var geometries = new Array();
		for(i = 0; i < features.length; i++){
			geometries[i] = features[i].geometry;
		}
		var geoCollection = new OpenLayers.Geometry.Collection(geometries);
		geoCollection.calculateBounds();
		var bounds = geoCollection.getBounds();
		map.updateSize();
		map.zoomToExtent(bounds, true);
		//store maps and extents for later use
		extents[divId] = bounds;
		maps[divId] = map;
	});
	return map;
}
