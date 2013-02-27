<?php
	session_start(); // Session starten
	$routeID = $_SESSION["routeID"]; // den vorher gespeicherten Wert aus der Session auslesen
	$date = $_SESSION["date"];
	$participant = $_SESSION["participant"];

	$zoom = $_POST["zoom"];
	$location = $_POST["location"];
	$found = $_POST["point"];
	$activemap = $_POST["activeMap"];

	$path = 'C:\inetpub\wwwroot\OriGami\logs\\';
	$filename = $path . $routeID ."_". $date .".csv";
	$text = $routeID .",". $participant .",". $date .",". date("H:i:s") .",". $location .",". $zoom . "," . $found . "," . $activemap . PHP_EOL;
	if(@file_put_contents($filename, $text, FILE_APPEND)) 
	{
		echo "OK";
	} 
	else 
	{
		echo "ERROR WRITING LOGFILE"; // check php error log
	}
?>