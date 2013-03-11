dojo.require("esri.map");
dojo.require("esri.layers.FeatureLayer");
dojo.require("esri.dijit.InfoWindowLite");
dojo.require("esri.dijit.AttributeInspector-all");
dojo.require("esri.dijit.BasemapGallery");
dojo.require("esri.dijit.editing.Editor-all");

var map;
var updateFeature;
var routesFL;
var _symbol;
var _mode;
var _type;
var _routeID;
var infoWindow;
var template;
var selectedFeature;
var checkRouteFL;
var basemapGallery;
var activeBasemap = "basemap_6";
var waypointIdStartPoint=0;
/*
var waypointIdWayPoint=0;
var waypointIdEndPoint=10;
*/
var waypointID;

function init() 
{
    map = new esri.Map("map", {
      basemap: "osm",
      center: [7, 52],
      zoom: 6,
      sliderStyle:"large"
    });
        
    dojo.connect(map, "onLayersAddResult", initSelectToolbar);
    
    map.infoWindow.resize(280,320);
    
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

function addPoint(type)
{
	_mode=1;
	if(type==0)
	{
		_type=0;
		_symbol = new esri.symbol.PictureMarkerSymbol(routesFL.renderer.infos[1].symbol.toJson());
		waypointID = waypointIdStartPoint;
		console.log(waypointID);			
	}
	else if(type==1)
	{
		_type=1;
		_symbol = new esri.symbol.SimpleMarkerSymbol(routesFL.renderer.infos[2].symbol.toJson());
		waypointID = waypointID+1;
		console.log(waypointID);
	}
	else if(type==2)
	{
		_type=2;
		_symbol = new esri.symbol.PictureMarkerSymbol(routesFL.renderer.infos[0].symbol.toJson());
		waypointID = waypointID+1;
		console.log(waypointID);
	}
}

function initSelectToolbar(results) 
{
    var petroFieldsFL = results[0].layer;
    var selectQuery = new esri.tasks.Query();

    dojo.connect(map, "onClick", function(evt) {
    	if(_mode==1)
    	{
	    	var pt = new esri.geometry.Point(evt.mapPoint.x,evt.mapPoint.y,map.spatialReference);
	    	var attr = {"route_id":_routeID,"type":_type};
	    	var graphic = new esri.Graphic(pt,_symbol,attr);
	    	routesFL.applyEdits([graphic],null,null,applyEditsSucceeded,applyEditsFailed);
	    	graphic.show();
	    	map.infoWindow.setTitle("Details");
	    	map.infoWindow.setContent(getTextContent(graphic));
	    	map.infoWindow.show(evt.screenPoint,map.getInfoWindowAnchor(evt.screenPoint));
	    	_mode=0;
    	}
    });
    
    /*
var layerInfos = [{
    	'featureLayer':routesFL
    }];
    
    var settings = {
	    map : map,
	    layerInfos: layerInfos  
    }
    
    var params = {settings: settings};
    var editorWidget = new esri.dijit.editing.Editor(params);
*/
/*     editorWidget.startup(); */

    dojo.connect(map.infoWindow, "onHide", function() {
      routesFL.clearSelection();
    });
}

function applyEditsSucceeded(addResults,updateResults,deleteResults)
{
	if(addResults != "")
	{
		if(_type==0)
		{
			$('#startpoint').addClass("disabled");
		}
		else if(_type==2)
		{
			$('#endpoint').addClass("disabled");
		}	
	}
	
	if(deleteResults != "")
	{
		if(_type==0)
		{
			$('#startpoint').removeClass("disabled");
		}
		else if(_type==2)
		{
			$('#endpoint').removeClass("disabled");
		}
	}
}

function applyEditsFailed(err)
{
	console.log(err);
}

function attrDelete()
{
	routesFL.applyEdits(null,null,[selectedFeature],applyEditsSucceeded,applyEditsFailed);
    map.infoWindow.hide();
    selectedFeature=null;
}

function attrSave()
{	
	var tempSelectedFeature=selectedFeature;
	selectedFeature.setAttributes({"waypoint_id":waypointID,"objectid":tempSelectedFeature.attributes["objectid"],"route_id":tempSelectedFeature.attributes["route_id"],"type":tempSelectedFeature.attributes["type"],"description":$('#attrDescription').val(),"help":$('#attrHelp').val()});
	routesFL.applyEdits(null,[selectedFeature],null,applyEditsSucceeded,applyEditsFailed);
	map.infoWindow.hide();
	selectedFeature=null;
}

//Create unique id for new route
function makeID()
{
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    for( var i=0; i < 5; i++ )
        text += possible.charAt(Math.floor(Math.random() * possible.length));

    return text;
}

function checkIfRouteIsAvailable(value)
{
	checkRouteFL = new esri.layers.FeatureLayer("http://giv-learn2.uni-muenster.de/arcgis/rest/services/GeoSpatialLearning/route/FeatureServer/0",{
    	mode: esri.layers.FeatureLayer.MODE_SNAPSHOT,
        outFields: ['*'],
        infoTemplate:template
    });	
    
    checkRouteFL.setDefinitionExpression("route_id='"+value+"'");
    map.addLayers([checkRouteFL]);
    
	dojo.connect(checkRouteFL, "onUpdateEnd", function(error,info){
		console.log(map.graphicsLayerIds);
		if(map.graphicsLayerIds != null)
		{
			console.log(map.graphicsLayerIds[0].graphics.length);
			if(map.getLayer(map.graphicsLayerIds[0]).graphics.length == 0)
			{	
				$('#notFound').css("visibility","visible");
				map.removeLayer(checkRouteFL);
				return false;
			}
			else
			{	
				map.removeLayer(checkRouteFL);
				$('#loadRouteModal').modal('hide');	
				return true;
			}		
		}	
    });
}  
/*
	if(value.length>0)
	{
		return true;
	}
	else
	{
		return false;
	}
*/
	
	//Add FeatureLayer to map with selection of routeID  
    /*
checkRouteFL = new esri.layers.FeatureLayer("http://giv-learn2.uni-muenster.de/arcgis/rest/services/GeoSpatialLearning/route/FeatureServer/0",{
    	mode: esri.layers.FeatureLayer.MODE_SNAPSHOT,
        outFields: ['*'],
        infoTemplate:template
    });
    
    checkRouteFL.setDefinitionExpression("route_id='"+value+"'");
    map.addLayers([checkRouteFL]);
    
    dojo.connect(checkRouteFL, "onUpdateEnd", function(error,info){
		if(map.graphicsLayerIds != null)
		{
			if(map.getLayer(map.graphicsLayerIds[0]).graphics.length == 0)
			{	
*/
/* 				console.log("0"); */
/* 				$('#notFound').css("visibility","visible"); */
/* 				map.removeLayer(checkRouteFL); */
/*
				return false;
				
			}
			else
			{
*/
/* 				$('#notFound').css("visibility","visible"); */
/* 				map.removeLayer(checkRouteFL); */
/* 				console.log(">1"); */
/*
				return true;	
			}
		}
	});
*/
	//Query only Features with new route_id
/*
	checkRouteFL.setDefinitionExpression("route_id='"+value+"'");
	console.log("---checkroute---");
	console.log(checkRouteFL);
	console.log("graphic length");
	console.log(checkRouteFL.graphics.length);
	map.addLayer(checkRouteFL);
	var length = map.getLayer(map.graphicsLayerIds[0]).graphics.length;
	console.log("---Length---");
	console.log(length);
	if(length>0)
	{
		console.log(">1");
		return true;
	}
	else
	{
		console.log("0");
		return false;
	}
*/
/* } */

/*
function cancelLoadRoute()
{
	console.log("cancel");
	console.log();
	map.removeAllLayers();
}
*/


//Creates the new route and activates the editing tools
function createRoute(status,routeName,routeID,email)
{
	if(status=="new")
	{
		$('#myModal').modal('hide');
		if(email != "")
		{
			//Start new Session
			$.ajax({
				type: "POST",
				url: "js/startsession.php",
				data: { mail: email, id: routeID, name: routeName }
			}).done(function( msg ) {
				console.log( "Data Saved: " + msg );
				$.ajax({
					type: "POST",
					url: "js/mailto.php"
				}).done(function( msg ) {
					console.log( "Data Saved: " + msg );
				});
			});
		}	
	}
	if(status=="load")
	{
		$('#loadRouteModal').modal('hide');		
	}
	
	_routeID = routeID;
	
	$('#startpoint').removeClass("disabled");
	$('#waypoint').removeClass("disabled");
	$('#endpoint').removeClass("disabled");
	
	var template = new esri.InfoTemplate();
	template.setTitle("Details");
    template.setContent(getTextContent);
	
	//Add FeatureLayer to map with selection of routeID  
    routesFL = new esri.layers.FeatureLayer("http://giv-learn2.uni-muenster.de/arcgis/rest/services/GeoSpatialLearning/route/FeatureServer/0",{
    	mode: esri.layers.FeatureLayer.MODE_SNAPSHOT,
        outFields: ['*'],
        infoTemplate:template
    });
    
    var selectionSymbol = new esri.symbol.SimpleFillSymbol().setColor(new dojo.Color([255,255,0,0.5]));
    routesFL.setSelectionSymbol(selectionSymbol);
	
	//Query only Features with new route_id
	routesFL.setDefinitionExpression("route_id='"+_routeID+"'");
	map.addLayers([routesFL]);	
}

function getTextContent(graphic) 
{
	selectedFeature = graphic;
	var description, help;
	if(graphic.attributes["description"] != null)
	{
		description = graphic.attributes["description"];
	}
	else
	{
		description = "";
	}
	if(graphic.attributes["help"] != null)
	{
		help = graphic.attributes["help"];
	}
	else
	{
		help = "";
	}
	
	return  "<div id='attrInfo'><p>Bitte geben Sie hier die Wegbeschreibung an: <textarea rows='3' id='attrDescription' maxlength='500'>"+description+"</textarea></p><hr><p>Bitte geben Sie hier die Hilf ein: <textarea rows='3' id='attrHelp' maxlength='250'>"+help+"</textarea></div class='attrBtn'><div><button id='attrDelete' class='btn btn-danger' onclick='attrDelete();'>L&oumlschen</button> <button id='attrSave' class='btn btn-primary' onclick='attrSave();'>Speichern</button></div>";
	
	/* return  "<div id='attrInfo'><p>Bitte geben Sie hier die Wegbeschreibung an: <input type='text' id='attrDescription' value='"+description+"' class='span4'></br><hr><p>Bitte geben Sie hier die Hilf ein:</br> <input type='text' id='attrHelp' value='"+help+"' class='span4'></div class='attrBtn'><div><button id='attrDelete' class='btn btn-danger' onclick='attrDelete();'>L&oumlschen</button> <button id='attrSave' class='btn btn-primary' onclick='attrSave();'>Speichern</button></div>"; */
}

dojo.ready(init);