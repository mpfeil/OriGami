<?php
	session_start(); // Session starten
	$email = $_SESSION["mail"]; // den vorher gespeicherten Wert aus der Session auslesen
	$name = $_SESSION["routeName"];
	$id = $_SESSION["routeID"];
	
	if(!filter_var($email, FILTER_VALIDATE_EMAIL))
	{
		echo("Mail nicht versendet! Keine gültige Mailadresse");
	}
	else
	{
		$subject = "Ihre OriGami Route";
		$message = "Hallo, Sie haben eine die Route ".$name." mit der ID ".$id." angelegt. Mit der ID können Sie nachträglich die Route bearbeiten oder die Kinder die Route laden lassen.";
		$from = "info@gi-at-school.de";
		$headers = "From:" . $from;
		if(mail($email,$subject,$message,$headers))
		{
			echo "Mail Sent.";			
		}
		else
		{
			echo "Not sent,";	
		}
	}
?>