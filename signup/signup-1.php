<?php 
$name = $_GET['name'];
$password = $_GET['password'];

$passkey = '../passwords.json';
$pass = file_get_contents($passkey);
$passwords = json_decode($pass, true);
if (array_key_exists("$name", $passwords)) { 
  echo "user";
} else {
  $passwords[$name] = $password;
  $newJsonString = json_encode($passwords);
  file_put_contents('../passwords.json', $newJsonString);
  echo "good";
}
?>