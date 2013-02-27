dojo.require("esri.map");
dojo.require("esri.layers.FeatureLayer");
dojo.require("esri.tasks.query");
dojo.require("esri.tasks.geometry");
dojo.require("esri.dijit.BasemapGallery");

var map, toolbar;
var routesFL;
var found = false;
var activeBasemap = "basemap_7";
var basemapGallery;
var myOnClick_connect;
var lastClickedMapPoint;
var distanceToNextPoint;
var nextWayPoint;
var lastDistance;
var queryTask;
var query;
var grahicsOffeatureLayer;
var gsvc = null;
var currentWaypoint = 0;
var options = {};
var lods = [
			{
				"level": 0,
				"resolution": 9.55462853563415,
				"scale": 36111.909643
			},
			{
				"level": 1,
				"resolution": 4.77731426794937,
				"scale": 18055.954822
			},
			{
				"level": 2,
				"resolution": 2.38865713397468,
				"scale": 9027.977411
			},
			{
				"level": 3,
				"resolution": 1.19432856685505,
				"scale": 4513.988705
			},
			{
				"level": 4,
				"resolution": 0.597164283559817,
				"scale": 2256.994353
			}
		 ];

//New Init
function init() 
{
    map = new esri.Map("map", {
    	basemap: "osm",
      	center: [7, 52],
      	zoom: 6,
      	maxZoom: 18,
      	sliderStyle:"large"
    });
	
	basemapGallery = new esri.dijit.BasemapGallery({
      showArcGISBasemaps: true,
      map: map
    });

    dojo.connect(basemapGallery, "onLoad", function(){
      dojo.forEach(basemapGallery.basemaps, function(basemap) {
      	if(basemap.id=="basemap_0"||basemap.id=="basemap_6"||basemap.id=="basemap_7")
      	{
	    	//Add a menu item for each basemap, when the menu items are selected
	    	$('.basemapMenu').append('<li><a onClick="triggerEvent(this)" id='+basemap.id+' role="button">'+basemap.title+'</a></li>');  	
      	}
      });
    });
    
    //GeometryService to buffer clicks
    gsvc = new esri.tasks.GeometryService("http://giv-learn2.uni-muenster.de/arcgis/rest/services/Utilities/Geometry/GeometryServer");
}

function triggerEvent(evt)
{
	if(activeBasemap != evt.id)
	{
		if(evt.id=="basemap_0")
		{
			map.setBasemap("osm");
		}	
		else if(evt.id=="basemap_6")
		{
			map.setBasemap("streets");
		}	
		else if(evt.id=="basemap_7")
		{
			map.setBasemap("hybrid");
			map.set
		}
		activeBasemap = evt.id;
	}
}

function loadRoute(routeID,participantNr)
{
	//Check if a route is loaded
	if(map.graphicsLayerIds.length != 0)
	{
		console.log("not empty");
		map.removeLayer(routesFL);
		currentWaypoint = 0;
		lastClickedMapPoint = null;
		distanceToNextPoint = null;
		nextWayPoint = null;
		dojo.disconnect(myOnClick_connect);
	}
	
	//Add FeatureLayer to map with selection of routeID  
    routesFL = new esri.layers.FeatureLayer("http://giv-learn2.uni-muenster.de/arcgis/rest/services/GeoSpatialLearning/route/MapServer/0",{
    	mode: esri.layers.FeatureLayer.MODE_SNAPSHOT,
        outFields: ['*']
    });
	
	routesFL.setDefinitionExpression("route_id='"+routeID+"'");
	routesFL.setSelectionSymbol(new esri.symbol.SimpleMarkerSymbol().setSize(8).setColor(new dojo.Color([160,214,238])));
	map.addLayers([routesFL]);

	dojo.connect(routesFL, "onUpdateEnd", function(error,info){
		if(map.graphicsLayerIds != null)
		{
			if(map.getLayer(map.graphicsLayerIds[0]).graphics.length==0)
			{	
				$('#notFound').css("visibility","visible");
				map.removeLayer(routesFL);
			}
			else
			{
				for(var i=0; i<map.getLayer(map.graphicsLayerIds[0]).graphics.length; i++)
			    {
					if(map.getLayer(map.graphicsLayerIds[0]).graphics[i].attributes["waypoint_id"] == "0")
					{
						$('#descript').css("display","");
						nextWayPoint = map.getLayer(map.graphicsLayerIds[0]).graphics[i];
						map.centerAndZoom(map.getLayer(map.graphicsLayerIds[0]).graphics[i].geometry,10);
					}
					else
					{
						routesFL.graphics[i].hide();
					}
				}

				//Start new Session
				$.ajax({
					type: "POST",
					url: "js/startsession.php",
					data: { routeID: routeID, participant: participantNr }
				}).done(function( msg ) {
					console.log( "Data Saved: " + msg );
				});
			
				myOnClick_connect = dojo.connect(map, "onClick", onMapClick);
				
				$('#loadRouteModal').modal('hide');	
			}		
		}	
    });
}

$('#loadRouteID').keyup(function(evt){
	var value = $('#loadRouteID').val();
	if(value.length == 5) 
	{
		$('#loadRoute').removeAttr("disabled"); 
    } 
    else 
    {
		$('#loadRoute').attr("disabled","disabled");
		$('#notFound').css("visibility","hidden");
    }
})

function onMapClick(evt)
{ 	
	map.graphics.clear();
  	var params = new esri.tasks.BufferParameters();
  	params.geometries = [ evt.mapPoint ];
  	lastClickedMapPoint = evt.mapPoint;
  	
  	/*
if(map.getLevel() > 3)
  	{
  		params.distances = [ 20 ];
  	}
  	else
  	{
*/
  		params.distances = [ 30 ];
/*   	} */
  	
  	params.unit = esri.tasks.GeometryService.UNIT_METER;
  	params.outSpatialReference = map.spatialReference;

	//call geometry service
  	gsvc.buffer(params, selectedFeatures);
  	gsvc.buffer(params, showBuffer);
}

function selectedFeatures(geoms)
{      
	var query = new esri.tasks.Query();
	var attribute = "";
	query.geometry = geoms[0];
	query.outFields = ["waypoint_id,description"];

	routesFL.selectFeatures(query,esri.layers.FeatureLayer.SELECTION_NEW,function(features,selectionMethod)
	{
		
		if(features.length==0)
		{
			if(distanceToNextPoint == null)
			{
				distanceToNextPoint = esri.geometry.getLength(lastClickedMapPoint,nextWayPoint.geometry);
				console.log(distanceToNextPoint);
				drawSmileyFace(0.5);
			}
			else
			{
				var tempLength = esri.geometry.getLength(lastClickedMapPoint,nextWayPoint.geometry);
				var factor = 1-(tempLength/distanceToNextPoint);
				console.log(factor);
				drawSmileyFace(factor);	
			}
	        $('#info').removeClass("label-success").addClass("label-warning").text("Das war knapp! Versuch es noch einmal!");
	        found = false;
	        postToLog();
		}
		else
		{
			dojo.map(features,function(feature)
			{
				$('#descript').css("display","none");
				if(features.length==0)
				{
					$('#info').removeClass("label-success").addClass("label-warning").text("Das war knapp! Versuch es noch einmal!");
					found = false;
					postToLog();
				}
				else
				{
					if(feature.attributes["waypoint_id"]==currentWaypoint)
					{	
						drawSmileyFace(1);
						attribute="description";
						$('#descript2').css("display","");
						$("#descript2").val(feature.attributes[attribute]);
						$('#info').removeClass("label-warning").addClass("label-success").text("Super! Du hast den naechsten Wegpunkt gefunden.");
						currentWaypoint = currentWaypoint+1;
						for(var i=0; i<map.getLayer(map.graphicsLayerIds[0]).graphics.length; i++)
						{
							if(map.getLayer(map.graphicsLayerIds[0]).graphics[i].attributes["waypoint_id"] == currentWaypoint)
							{
								nextWayPoint = map.getLayer(map.graphicsLayerIds[0]).graphics[i];
							}
						}
						distanceToNextPoint = esri.geometry.getLength(feature.geometry,nextWayPoint.geometry);
						feature.show();
						found = true;
						postToLog();
					}
					else
					{
						var tempLength=esri.geometry.getLength(feature.geometry,nextWayPoint.geometry);
						var factor = 1-(tempLength/distanceToNextPoint);
						drawSmileyFace(factor);
						$('#info').removeClass("label-success").addClass("label-warning").text("Das war knapp! Versuch es noch einmal!");
						found = false;
						postToLog();
					}
				}
				
			});
		}
	});
}

function postToLog()
{
	var activeMap;
	if(activeBasemap=="basemap_0")
	{
		activeMap="OSM";
	}
	else if(activeBasemap=="basemap_6")
	{
		activeMap="Streets";
	}
	else if(activeBasemap=="basemap_7")
	{
		activeMap="Aerial";
	}
	
	//Save clicked location to csv
  	$.ajax({
		type: "POST",
		url: "js/log.php",
		data: { location: lastClickedMapPoint.getLatitude()+","+lastClickedMapPoint.getLongitude() , zoom:map.getLevel(), point:found, activeMap:activeMap}
	}).done(function( msg ) {
		console.log( "Data Saved: " + msg );
	});
}

function showBuffer(geometries) 
{
	var symbol = new esri.symbol.SimpleFillSymbol(esri.symbol.SimpleFillSymbol.STYLE_NULL,new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_SOLID,new dojo.Color([0,0,255,0.65]), 2),new dojo.Color([0,0,255,0.35]));
	dojo.forEach(geometries, function(geometry) {
		var graphic = new esri.Graphic(geometry,symbol);
		map.graphics.add(graphic);
	});
}

function drawSmileyFace(factor) 
{
	var realFactor;
	if(factor <= 0)
	{
		realFactor = 0;
	}
	else if(factor >= 1)
	{
		realFactor = 1;
	}
	else
	{
		realFactor = factor;
	}

	var canvas = document.getElementById("smiley");
	var _half = canvas.width / 2;
	var _quarter = canvas.width / 4;
	var _eighth = canvas.width / 8;
	var _tenth = canvas.width / 10; 
	var context = canvas.getContext("2d");

	var default_start_y = _half + _eighth;
	var default_end_y = _half + _quarter;
	
	var difference = default_end_y - default_start_y;
	
	var mouthStartY = default_end_y - (difference * realFactor);
	var mouthEndY = default_start_y + (difference * realFactor);

	var eyeWidth = _tenth / 2;
	var eyeHeight = _tenth * 2;
	
	// face
	context.beginPath();
	context.arc(64, 					// x   x,y is at the center
				64, 					// y
				64, 					// arc radius
				0, 						// starting angle
				degreesToRadians(360),	// ending angle
				false);					// counter-clockwise
	//set background color
	var hue = realFactor * 120;
	context.fillStyle = "hsl("+hue+", 100%, 50%)";
	context.fill();
	context.stroke();
	
	//left eye
	context.save();
	context.translate(eyeWidth, eyeHeight);
	context.scale(1, 2);
	context.beginPath();
	context.arc(_half-_eighth-eyeWidth, 5, eyeWidth, eyeHeight, 2 * Math.PI, true);
	context.restore();
	context.fillStyle = 'black';
	context.fill();
	context.lineWidth = 1;
	context.strokeStyle = 'black';
	context.stroke();
	
	//right eye
	context.save();
	context.translate(eyeWidth, eyeHeight);
	context.scale(1, 2);
	context.beginPath();
	context.arc(_half+_eighth, 5, eyeWidth, eyeHeight, 2 * Math.PI, false);
	context.restore();
	context.fillStyle = 'black';
	context.fill();
	context.lineWidth = 1;
	context.strokeStyle = 'black';
	context.stroke();

	//mouth drawing
	context.beginPath();
	context.lineWidth=2;
	context.moveTo(_quarter, mouthStartY);
	context.bezierCurveTo(_half, mouthEndY, _half + _quarter, mouthStartY, _half + _quarter, mouthStartY);
	context.stroke();
}

function degreesToRadians(degrees) {
	radians = (degrees * Math.PI)/180;
	return radians;
}

dojo.addOnLoad(init);