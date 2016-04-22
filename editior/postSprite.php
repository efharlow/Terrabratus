<?php 
$name = $_GET['name'];
$password = $_GET['password'];
$img = $_GET['imgBase64'];
$img = str_replace('data:image/png;base64,', '', $img);
$img = str_replace(' ', '+', $img);
$data = base64_decode($img);

$passkey = '../passwords.json';
$pass = file_get_contents($passkey);
$passwords = json_decode($pass, true);
if (array_key_exists("$name", $passwords)) {
  if ($passwords[$name] == "$password") {
    file_put_contents("../img/" . "$name" . ".png", $data);
    $jsonString = file_get_contents('../players.json');
    $datao = json_decode($jsonString, true);
    if (!(isset( $datao[0]["$name"] ))) {
      $datao[0][$name] = array();
      $datao[0][$name]["posX"] = "0";
      $datao[0][$name]["posY"] = "0";
      $datao[0][$name]["field"] = "main";
      $datao[0][$name]["status"] = "off";
      $newJsonString = json_encode($datao);
      file_put_contents('../players.json', $newJsonString);
    }
    echo "good";
  } else {
    echo "password";
  }
} else {
  echo "user";
}
?>