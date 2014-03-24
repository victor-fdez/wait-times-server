var TilesDomain = '72.191.185.122';
var MainDomain = 'localhost:8000';
//var MainDomain = 'localhost:8000';
function showAllWaitLaneGeoJSON(divId, waitLaneId){
	//$("#"+divId).css({"min-height": 200});
	getDomains();
	console.log("using MainDomain: "+MainDomain);
	var map = new OpenLayers.Map({
		div: divId,
		allOverlays: true,
		controls: []
	});
	map.updateSize();
	//setup background
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

	var bboxLayer = new OpenLayers.Layer.Vector("bbox");
	
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
