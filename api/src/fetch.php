<?php
$_REQUEST = json_decode(file_get_contents('php://input'), true);

$fTime = (new DateTime())
  ->add(new DateInterval($_ENV['TIMEZONE_CORRECTION']))
  ->format('Y-m-d H:i:s');

$city = $_ENV['CITY'];
$baseUrl = "https://$city.publicbikesystem.net/ube/gbfs/v1/en";

$fStations = null;

function getStations() {
  global $baseUrl;
  global $fStations;

  if (!$fStations) $fStations = json_decode(file_get_contents("$baseUrl/station_information"), true)['data']['stations'];

  $stations = [];

  foreach ($fStations as $key => $s) {
    $stations[$s['station_id']] = [
      'name' => $s['name'],
      'lat' => $s['lat'],
      'lon' => $s['lon'],
      'cap' => $s['capacity'],
    ];
  }

  return $stations;
}

$fBikes = null;

function getBikes() {
  global $baseUrl;
  global $fBikes;

  if (!$fBikes) {
    $ch = curl_init("$baseUrl/station_status");
    if ($_REQUEST['cookie']) curl_setopt($ch, CURLOPT_COOKIE, $_REQUEST['cookie']);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
    $fBikes = json_decode(curl_exec($ch), true);
    curl_close($ch);
  }

  $stations = [];

  foreach ($fBikes['data']['stations'] as $key => $s) {
    $stations[$s['station_id']] = [
      'eBikes' => $s['num_bikes_available_types']['ebike'],
      'mBikes' => $s['num_bikes_available_types']['mechanical'],
    ];
  }

  return [
    'lastUpdate' => $fBikes['last_updated'],
    'stations' => $stations,
  ];
}
?>
