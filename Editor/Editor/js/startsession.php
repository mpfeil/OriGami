<?php
	session_start(); // Session starten
	$_SESSION["mail"] = $_POST["mail"];
	$_SESSION["routeID"] = $_POST["id"];
	$_SESSION["routeName"] = $_POST["name"];
	$_SESSION["date"] = date("Y-m-d_H-i-s"); // den Wert date setzen

	print_r($_SESSION);
?>