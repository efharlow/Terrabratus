<?php 
	set_time_limit(0);  //prevents php from stopping the script, fsq edit
	$filename = 'data.txt';
	$last = isset($_GET['timestamp']) ? $_GET['timestamp'] : 0;
	$current = filemtime($filename);
	while( $current <= $last) {
		usleep(10000);
		clearstatcache();
		$current = filemtime($filename);
	}
	
	$response = array();
  $msg = file_get_contents($filename);
	$response['msg'] = $msg;
	$response['timestamp'] = $current;
	echo json_encode($response);	
?>