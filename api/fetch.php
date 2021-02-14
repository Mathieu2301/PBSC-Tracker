<?php
$fTime = (new DateTime())
  ->add(new DateInterval($_CONFIG['timeZoneCorrect']))
  ->format('Y-m-d H:i:s');

$city = $_CONFIG['city'];
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

  if (!$fBikes) $fBikes = json_decode(file_get_contents("$baseUrl/station_status"), true)['data']['stations'];

  $stations = [];

  foreach ($fBikes as $key => $s) {
    $stations[$s['station_id']] = [
      'eBikes' => $s['num_bikes_available_types']['ebike'],
      'mBikes' => $s['num_bikes_available_types']['mechanical'],
    ];
  }

  return $stations;
}

?>
