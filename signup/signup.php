<?php 
//file_put_contents("hello.txt", ‎"wowkay");
$name = $_GET['name'];
$password = $_GET['password'];

$passkey = '../passwords.json';
$pass = file_get_contents($passkey);
$passwords = json_decode($pass, true);
if (!(array_key_exists("$name", $passwords))) {
  //file_put_contents("hello.txt", ‎"okay");
  $passwords["$name"] = $password;
  $newJsonString = json_encode($passwords);
  file_put_contents($passkey, ‎$newJsonString);
  echo "good";
} else {
  //file_put_contents("hello.txt", ‎"nokay");
  echo "user";
}
?>