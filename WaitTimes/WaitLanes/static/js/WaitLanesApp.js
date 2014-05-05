var TilesDomain = '72.191.185.122';
var MainDomain = 'localhost:8000';
var map = null;
/**
 * initMap
 */
function initMap(divID){
	getDomains();
	console.log("using MainDomain: "+MainDomain);
	map = new OpenLayers.Map({
		div: divID,
		allOverlays: true,
		controls: []
	});
	map.updateSize();
	//setup background
	mapProj = new OpenLayers.Projection("EPSG:900913");
	ourProj = new OpenLayers.Projection("EPSG:4326");
	var osm = new OpenLayers.Layer.OSM("victorstreetmaps", "http://"+TilesDomain+"/osm_tiles/${z}/${x}/${y}.png", {tileOptions: {crossOriginKeyword: null}});
	map.addLayers([osm]);
	loadingFinished(divID);
}

var waitLanes = Array();
/**
 * loadWaitLane
 *
 * loads each wait lane's layers, and stores an array with
 * the id of each layer
 */
function loadWaitLane(waitLaneID){
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
		var fileURL = "http://"+MainDomain+"/WaitLanes/file/"+waitLaneID+"/"+fileName;
		var geoJsonFormat = new OpenLayers.Format.GeoJSON({
			//"internalProjection": mapProj,
			//"externalProjection": ourProj
		});
		var geoJsonGetter = new OpenLayers.Protocol.HTTP({
			"url": fileURL,
			"format": geoJsonFormat
		});
		var geoJsonLoadStrategy = [new OpenLayers.Strategy.Fixed()];
		var layerName = fileName+"_"+waitLaneID
		var geoJsonLayer = null;
		if("StyleMapInit" in waitLaneGeoJSONFiles[i]){
			console.log("styling "+layerName);
			geoJsonLayer = new OpenLayers.Layer.Vector(layerName, {
				"protocol": geoJsonGetter,
				"strategies": geoJsonLoadStrategy,
				"styleMap": new OpenLayers.StyleMap(waitLaneGeoJSONFiles[i]["StyleMapInit"]),
			});
		}else{
			geoJsonLayer = new OpenLayers.Layer.Vector(layerName, {
				"protocol": geoJsonGetter,
				"strategies": geoJsonLoadStrategy,
			});
		}
		console.log("loaded layer with name: "+layerName);
		geoJsonLayer.events.register('loadend', geoJsonLayer, function(evt){
			if(maxExtent == null){
				showMessage("");
				maxExtent = this.getDataExtent()
			}else{
				maxExtent.extend(this.getDataExtent());
			}
			layersLoaded++;
			appendMessage("loaded layer["+this.name+"]\n");
			console.log("layer index: "+map.getLayerIndex(this));
			if(layersLoaded >= numberLayers){
				var idStartIndex = this.name.search("_")+1;
				var idEndIndex = this.name.length;
				var id = this.name.substring(idStartIndex, idEndIndex);
				map.zoomToExtent(maxExtent);
				appendMessage("loaded layer with id["+id+"]\n");
				loadingFinished(id);
				loadGeoFence(id);
			}
			waitLanes.push(id);
		});
		map.addLayer(geoJsonLayer);
		//TODO: find how to move this layers around, map.raiseLayer(geoJsonLayer, 4);
	}
	//create a location layer
	currentLocationLayer  = new OpenLayers.Layer.Vector("current location");
	map.addLayer(currentLocationLayer);
}

function updateLocation(lon, lat){
	//TODO: put functions here for now, but
	//later they should be called from a table
	//of functions that is dynamically allocated
	//showLocationWithGeoJSON(lon, lat);
	var point = OpenLayers.Geometry.Point(lon, lat);
	sendUpdatesToGeoFences(point);
}
/**
 *
 */
function sendUpdatesToGeoFences(point){
	for(var i = 0; i < waitLanes.length; i++){
		var geoFence = getGeoFenceGeometry(waitLanes[i]);
	}
}
/**
 * loadGeoFences
 *
 * will generate geo fences for loaded wait lanes, geo fences will
 * be generated around the boundary of a wait lane.
 *
 */
function loadGeoFences(){			
	for(var i = 0; i < waitLanes.length; i++){
		loadGeoFence(waitLanes[i]);
	}
}

function loadGeoFence(waitLaneID){		
	//get background geometry for wait lane, this
	//features should only have one feature
	var features = getFeaturesForLayer("boundary", waitLaneID);	
	var geometry = features[0].geometry;
	//make a circle that covers the whole area of the boundary
	//by getting a bounding polygon and determining the distance
	//between
	var boundsPolygon = geometry.getBounds().toGeometry();
	var centroidPoint = boundsPolygon.getCentroid();
	var outerPoint = boundsPolygon.components[0].components[0];
	var radius = centroidPoint.distanceTo(outerPoint);
	var circle = OpenLayers.Geometry.Polygon.createRegularPolygon(
		centroidPoint,
		radius,
		20,
		0);
	//add circle to layers by creatings new vector feature
	var feature = new OpenLayers.Feature.Vector(circle);		
	//var polyFeature = new OpenLayers.Feature.Vector(outerPoint);
	var geoFenceLayer = new OpenLayers.Layer.Vector("geofence_"+waitLaneID);
	geoFenceLayer.addFeatures(Array(feature));
	//add layer to map
	map.addLayer(geoFenceLayer);
	map.setLayerIndex(geoFenceLayer, 1);
	console.log(map.getLayerIndex(geoFenceLayer));
}

function getFeaturesForLayer(layerName, waitLaneID){
	var layer = getLayer(layerName, waitLaneID);
	if(layer != null){
		return layer.features;
	}
	return null;
}

function getLayer(layerName, waitLaneID){
	var layers = map.getLayersByName(layerName+".json_"+waitLaneID);
	console.log("got layers "+layers);
	if(layers.length == 1){
		return layers[0];
	}else{
		return null;
	}
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

function getDomains(){
	if(typeof Android !== 'undefined'){
		MainDomain = Android.getDomains();
	}
}

function loadingFinished(ID){
	if(typeof Android !== 'undefined'){
		Android.finishedLoadingLayers(ID);	
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

var mapProj;
var ourProj;
function ourToMapTransform(lonLat){
	return lonLat.transform(ourProj, mapProj);
}


