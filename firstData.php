<?php 
	set_time_limit(0);  //prevents php from stopping the script, fsq edit
	$filename = 'players.json';
  $jsoni = file_get_contents($filename);
  $jasond = json_decode($jsoni, true);
  $name = $_GET['name'];
  $password = $_GET['password'];
  $passkey = 'passwords.json';
  $pass = file_get_contents($passkey);
  $passwords = json_decode($pass, true);
  if (array_key_exists("$name", $passwords) AND ($passwords["$name"] == "$password") AND isset( $jasond[0]["$name"] )) {
    file_put_contents('error.txt', "in");
	  $last = isset($_GET['timestamp']) ? $_GET['timestamp'] : 0;
	  $current = filemtime($filename);
	  while( $current <= $last) {
	  	usleep(10000);
	  	clearstatcache();
	  	$current = filemtime($filename);
	  }
	
	  $response = array();
    $json = file_get_contents($filename);
	  $response['msg'] = json_decode($json, true);
	  $response['timestamp'] = $current;
	  echo json_encode($response);	
  } else {
    //$string = "";
    //if (array_key_exists("$name", $passwords))
    //  $string = $string . "1st";
    //if (($passwords["$name"] == "$password"))
    //  $string = $string . "2st";
    //if (isset( $jasond[0]["$name"] ))
    //  $string = $string . "3st";
    //file_put_contents('error.txt', "$string");
    echo "error";
  }
?>