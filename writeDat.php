<?php 
$name = $_GET['name'];
$password = $_GET['password'];
$passkey = 'passwords.json';
$pass = file_get_contents($passkey);
$passwords = json_decode($pass, true);

if (array_key_exists("$name", $passwords)) {
  if (($passwords[$name] == "$password")) {
    $msg = $_GET['text'];
    $myFile = "data.txt";
    $fh = fopen($myFile, 'a+') or die("can't open file");
    fwrite($fh, $msg);
    fclose($fh);
  }
}
?>