<?php 
	set_time_limit(0);  //prevents php from stopping the script, fsq edit
	$filename = 'players.json';
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
?>