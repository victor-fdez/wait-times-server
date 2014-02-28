/* showGeoJsonOnMap
* 
* divId - string id of div used to draw map
* fileUrl - the geojson file url
*/
function showGeoJsonOnMap(divId, fileUrl){
	var map = new OpenLayers.Map({
		div: divId,
		allOverlays: true
	});
	var osm = new OpenLayers.Layer.OSM("victorstreetmaps", "http://www.cerberu.com/osm_tiles/${z}/${x}/${y}.png", {tileOptions: {crossOriginKeyword: null}});
	var geoJsonFormat = new OpenLayers.Format.GeoJSON({
			/*"internalProjection": mapProj,
			"externalProjection": ourProj*/
	});
	var geoJsonGetter = new OpenLayers.Protocol.HTTP({
		"url": 'http://www.cerberu.com:8001'+fileUrl,
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
		var features = object.features;
		//create and array of geometries for the features
		var geometries = new Array();
		for(i = 0; i < features.length; i++){
			geometries[i] = features[i].geometry;
		}
		var geoCollection = new OpenLayers.Geometry.Collection(geometries);
		geoCollection.calculateBounds();
		var bounds = geoCollection.getBounds();
		map.zoomToExtent(bounds, true);
	});
}
