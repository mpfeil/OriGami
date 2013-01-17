dojo.require("esri.map");
dojo.require("esri.layers.FeatureLayer");
dojo.require("esri.dijit.InfoWindowLite");
dojo.require("esri.dijit.AttributeInspector-all");

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
/*
var countOfStartingPoints=0;
var countOfWaypoints=0;
var countOfEndPoints=0;
*/

function init() 
{
    map = new esri.Map("map", {
      basemap: "streets",
      center: [7, 52],
      zoom: 6
    });
        
    dojo.connect(map, "onLayersAddResult", initSelectToolbar);
}

function addPoint(type)
{
	_mode=1;
	if(type==0)
	{
		_type=0;
		_symbol = new esri.symbol.PictureMarkerSymbol(routesFL.renderer.infos[1].symbol.toJson());			
	}
	else if(type==1)
	{
		_type=1;
		_symbol = new esri.symbol.SimpleMarkerSymbol(routesFL.renderer.infos[2].symbol.toJson());
	}
	else if(type==2)
	{
		_type=2;
		_symbol = new esri.symbol.PictureMarkerSymbol(routesFL.renderer.infos[0].symbol.toJson());
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
selectedFeature.setAttributes({"objectid":tempSelectedFeature.attributes["objectid"],"route_id":tempSelectedFeature.attributes["route_id"],"type":tempSelectedFeature.attributes["type"],"description":$('#attrDescription').val(),"help":$('#attrHelp').val()});
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

//Creates the new route and activates the editing tools
function createRoute(routeName,routeID)
{
	console.log(routeID);
	_routeID = routeID;
	$('#myModal').modal('hide');
	$('#loadRouteModal').modal('hide');
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
	return  "<div id='attrInfo'><p>Bitte geben Sie hier die Wegbeschreibung an: <input type='text' required id='attrDescription' value='"+description+"' class='span4'></				br><hr><p>Bitte geben Sie hier die Hilf ein:</br> <input type='text' id='attrHelp' value='"+help+"' class='span4'></div class='attrBtn'><div><button 						id='attrDelete' class='btn btn-danger' onclick='attrDelete();'>L&oumlschen</button> <button id='attrSave' class='btn btn-primary' onclick='attrSave();'>Speichern</			button></div>";
}

dojo.ready(init);