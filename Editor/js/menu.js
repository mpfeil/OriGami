$('#about').popover({placement:'bottom'})

function checkName(routeName)
{
	if(routeName === "")
	{
		$('#createRoute').attr("disabled","disabled");
	}
	else
	{
		$('#createRoute').removeAttr("disabled");
	}
}

$('#myModal').on('hidden', function(){
   $('#routeName').val(null);
   $('#createRoute').attr("disabled","disabled");
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