<?php
	session_start(); // Session starten
	$_SESSION["routeID"] = preg_replace("/[^a-zA-Z0-9]/", "", $_POST["routeID"]);
	$_SESSION["date"] = date("Y-m-d_H-i-s"); // den Wert date setzen
	$_SESSION["participant"] = $_POST["participant"];
	
	$path = 'C:\inetpub\wwwroot\OriGami\logs\\';
	$filename = $path . $_SESSION["routeID"] ."_". $_SESSION["date"] .".csv";
	$header = "routeID,Testperson,start,time,lat,lon,zoom,found,basemap" . PHP_EOL;
	if(@file_put_contents($filename, $header, FILE_APPEND)) 
	{
		echo "OK";
	} 
	else 
	{
		echo "ERROR WRITING LOGFILE"; // check php error log
	}

	print_r($_SESSION);
?>