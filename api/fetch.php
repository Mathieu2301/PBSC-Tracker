<?php
$zone = $_CONFIG['zone'];
$fetchedData = json_decode(file_get_contents("https://prod.instant-system.com/InstantCore/v3/networks/$zone/bikeSharingStations"), true)['bikeSharingStations'];

$fTime = (new DateTime($fetchedData[0]['lastUpdate']))
  ->add(new DateInterval($_CONFIG['timeZoneCorrect']))
  ->format('Y-m-d H:i:s');
$fTimestamp = strtotime($fTime);

function getStations() {
  global $fetchedData;

  $stations = [];

  foreach ($fetchedData as $key => $s) {
    $stations[$s['id']] = [
      'name' => $s['name'],
      'lat' => $s['lat'],
      'lon' => $s['lon'],
    ];
  }

  return $stations;
}

function getBikes() {
  global $fetchedData;

  $stations = [];

  foreach ($fetchedData as $key => $s) {
    $stations[$s['id']] = [
      'status' => $s['status'],
      'bikeStands' => $s['bikeStands'],
      'bikes' => $s['bikes'],
      'eBikes' => $s['eBikes'],
      'mechanichalBikes' => $s['mechanichalBikes'],
      'stands' => $s['stands'],
    ];
  }

  return $stations;
}

?>
