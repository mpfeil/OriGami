$('#about').popover({placement:'bottom'})


$('#routeName').keyup(function(evt){
	var value = $('#routeName').val();
	if(value.length == "")
	{
		$('#createRoute').attr("disabled","disabled");
		$('#cgRouteName').removeClass('success').addClass('error');
	}
	else
	{
		$('#createRoute').removeAttr("disabled");
		$('#cgRouteName').removeClass('error').addClass('success');
	}
})

$('#myModal').on('hidden', function(){
   $('#routeName').val(null);
   $('#createRoute').attr("disabled","disabled");
});

$('#loadRouteID').keyup(function(evt){
	var value = $('#loadRouteID').val();
	if(value.length == 5) 
	{
		$('#createLoadRoute').removeAttr("disabled"); 
    } 
    else 
    {
		// Disable submit button
		$('#createLoadRoute').attr("disabled","disabled");
		$('#notFound').css("visibility","hidden");
    }
	/*
var value = $('#loadRouteID').val();
	console.log(value);
	if(value.length == 5) 
	{
		if(checkIfRouteIsAvailable(value))
		{
			console.log("not empty");
			// Enable submit button
			$('#createLoadRoute').removeAttr("disabled"); 
			$('#loadedRouteIDLabel').css("visibility","visible");
			$('#loadedRouteIDLabel').addClass("label-success");
			$('#loadedRouteIDLabel').text("Gültige ID");
		}
		else
		{
			console.log("empty");
			$('#loadedRouteIDLabel').css("visibility","visible");
			$('#loadedRouteIDLabel').addClass("label-important");
			$('#loadedRouteIDLabel').text('Ungültige ID');
		}
    } 
    else 
    {
         // Disable submit button
         $('#createLoadRoute').attr("disabled","disabled");
         $('#loadedRouteIDLabel').css("visibility","hidden");
    }
*/
})

$('#cancelLoadRoute').click(function(){
	cancelLoadRoute();
});

$('#startpoint').click(function(){
	addPoint(0);
});
$('#waypoint').click(function(){
	addPoint(1);
});

$('#endpoint').click(function(){
	addPoint(2);
});