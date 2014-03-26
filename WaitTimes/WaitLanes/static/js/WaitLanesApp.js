var TilesDomain = '72.191.185.122';
var MainDomain = 'localhost:8000';
var map = null;

function updateLocation(lon, lat){
	//TODO: put functions here for now, but
	//later they should be called from a table
	//of functions that is dynamically allocated
	showLocationWithGeoJSON(lon, lat);
}

var mapProj;
var ourProj;
function ourToMapTransform(lonLat){
	return lonLat.transform(ourProj, mapProj);
}

var currentLocationLayer = null;
/**
 * showLocationWithGeoJSON
 *
 * everytime this function is called a point will be shown as
 * part of a linestring that will be redisplayed as new points
 * are added.
 */
function showLocationWithGeoJSON(lon, lat){
	//layer has not be initialized
	if(currentLocationLayer == null){
		return;
	}
	//add new point to the linestring
	var point = ourToMapTransform(new OpenLayers.Geometry.Point(lon, lat));
	//console.log(''+point);
	//console.log(currentLocationLayer.features+' ');
	if(currentLocationLayer.features.length == 0){
		//create a linestring if it does not exist
		console.log('created new linestring');
		var currentLocationFeature = new OpenLayers.Feature.Vector(point);
		currentLocationLayer.addFeatures(Array(currentLocationFeature));
		
	}else{
		//console.log('added new point '+(point instanceof OpenLayers.Geometry.LineString));
		//check weather geometry is just a point or point string.
		var geometry = currentLocationLayer.features[0].geometry;
		if(geometry instanceof OpenLayers.Geometry.Point){
			//initially only showing one point, so now
			//create a line string of 2 points
			var lastPoint = geometry;
			currentLocationLayer.removeAllFeatures();
			var currentLocationLine = new OpenLayers.Geometry.LineString(Array(lastPoint, point));
			var currentLocationFeature = new OpenLayers.Feature.Vector(currentLocationLine);
			currentLocationLayer.addFeatures(Array(currentLocationFeature));
		}else{
			//line string so just add a new point to
			//the line.
			var currentLocationLine = geometry;
			currentLocationLine.addPoint(point);
		}
	}
	//update drawing
	currentLocationLayer.redraw();	
}

function showAllWaitLaneGeoJSON(divId, waitLaneId){
	//$("#"+divId).css({"min-height": 200});
	getDomains();
	console.log("using MainDomain: "+MainDomain);
	map = new OpenLayers.Map({
		div: divId,
		allOverlays: true,
		//controls: []
	});
	map.updateSize();
	//setup background
	mapProj = new OpenLayers.Projection("EPSG:900913");
	ourProj = new OpenLayers.Projection("EPSG:4326");
	var osm = new OpenLayers.Layer.OSM("victorstreetmaps", "http://"+TilesDomain+"/osm_tiles/${z}/${x}/${y}.png", {tileOptions: {crossOriginKeyword: null}});
	map.addLayers([osm]);

	var layersLoaded = 0;
	var maxExtent = null;
	var waitLaneGeoJSONFiles = [];
	waitLaneGeoJSONFiles.push({"name": "boundary",
					'StyleMapInit': {
						'default': new OpenLayers.Style({
								'fillColor': '#888888',
								'fillOpacity': 0.4,
								'strokeColor': '#888888'
							})
						}
					});
	waitLaneGeoJSONFiles.push({"name": "model"});
	waitLaneGeoJSONFiles.push({"name": "entries",
					'StyleMapInit': {
						'default': new OpenLayers.Style({
								'fillColor': '#f3eeac',
								'fillOpacity': 0.4,
								'strokeColor': '#f3eeac'
							})
						}
					});
	waitLaneGeoJSONFiles.push({"name": "exits",
					'StyleMapInit': {
						'default': new OpenLayers.Style({
								'fillColor': '#255a2e',
								'fillOpacity': 0.4,
								'strokeColor': '#255a2e'
							})
						}
					});
	var numberLayers = waitLaneGeoJSONFiles.length;

	//var bboxLayer = new OpenLayers.Layer.Vector("bbox");
	
	//set every geojson file as a layer
	for(var i = 0; i < waitLaneGeoJSONFiles.length; i++){
		var name = waitLaneGeoJSONFiles[i].name;
		var fileName = waitLaneGeoJSONFiles[i].name+".json";
		var fileURL = "http://"+MainDomain+"/WaitLanes/file/"+waitLaneId+"/"+fileName;
		var geoJsonFormat = new OpenLayers.Format.GeoJSON({
			//"internalProjection": mapProj,
			//"externalProjection": ourProj
		});
		var geoJsonGetter = new OpenLayers.Protocol.HTTP({
			"url": fileURL,
			"format": geoJsonFormat
		});
		var geoJsonLoadStrategy = [new OpenLayers.Strategy.Fixed()];

		var geoJsonLayer = null;
		if("StyleMapInit" in waitLaneGeoJSONFiles[i]){
			console.log("styling "+fileName);
			geoJsonLayer = new OpenLayers.Layer.Vector(fileName, {
				"protocol": geoJsonGetter,
				"strategies": geoJsonLoadStrategy,
				"styleMap": new OpenLayers.StyleMap(waitLaneGeoJSONFiles[i]["StyleMapInit"]),
			});
		}else{
			geoJsonLayer = new OpenLayers.Layer.Vector(fileName, {
				"protocol": geoJsonGetter,
				"strategies": geoJsonLoadStrategy,
			});
		}

		geoJsonLayer.events.register('loadend', geoJsonLayer, function(evt){
			if(maxExtent == null){
				maxExtent = this.getDataExtent()
			}else{
				maxExtent.extend(this.getDataExtent());
			}
			layersLoaded++;
			if(layersLoaded >= numberLayers){
				map.zoomToExtent(maxExtent);
				loadingFinished();
			}
		});
		map.addLayer(geoJsonLayer);

		//create a location layer
		currentLocationLayer  = new OpenLayers.Layer.Vector("current location");
		map.addLayer(currentLocationLayer);
	}
}

function getDomains(){
	if(typeof Android !== 'undefined'){
		MainDomain = Android.getDomains();
	}
}

function loadingFinished(){
	if(typeof Android !== 'undefined'){
		Android.finishedLoadingLayers();	
	}
}

function appendMessage(message){
	if(typeof Android !== 'undefined'){
		Android.appendMessage(message);	
	}
}

function showMessage(message){
	if(typeof Android !== 'undefined'){
		Android.showMessage(message);	
	}
}
