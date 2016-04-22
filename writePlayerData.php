<?php 
$name = $_GET['name'];
$posX = $_GET['posX'];
$posY = $_GET['posY'];
$field = $_GET['field'];
$status = $_GET['status'];
$password = $_GET['password'];
$passkey = 'passwords.json';
$pass = file_get_contents($passkey);
$passwords = json_decode($pass, true);

if (array_key_exists("$name", $passwords)) {
  if (($passwords[$name] == "$password")) {
    $jsonString = file_get_contents('players.json');
    $data = json_decode($jsonString, true);
    $data[0][$name]["posX"] = "$posX";
    $data[0][$name]["posY"] = "$posY";
    $data[0][$name]["field"] = "$field";
    $data[0][$name]["status"] = "$status";
    $newJsonString = json_encode($data);
    file_put_contents('players.json', $newJsonString);
  }
}
?>