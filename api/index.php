<?php
$_CONFIG = [
  'city' => 'valence', // PBSC city name (*.publicbikesystem.net)
  'timeZoneCorrect' => 'PT1H', // Timezone correction (if the PHP server isn't in the same zone as you)
];

include './mysql.php';
include './fetch.php';

header('Access-Control-Allow-Origin: *');
header('Content-Type: application/json; charset=utf-8');
ini_set('serialize_precision', 14);

if ($_SERVER['REQUEST_URI'] === '/') header('Location: https://github.com/Mathieu2301/Velib-Tracker/');

function rs($rs) {
  if ($rs) exit(json_encode($rs));
  else exit();
}

function rq($rq, $cb) {
  $uri = trim(explode('?', $_SERVER['REQUEST_URI'])[0], '/');
  if (trim($rq, '/') === $uri) rs($cb());
}

rq('/getStations', function() {
  return getStations();
});

$update = function() {
  global $_CONFIG;
  global $pdo;
  global $fTime;

  $fetchedIDs = [];

  $fStations = getBikes();

  $lastUpdate = file_get_contents('./lastUpdate');
  if ($lastUpdate >= $fStations['lastUpdate']) return [ 'success' => true, 'updated' => false ];
  file_put_contents('./lastUpdate', time());

  foreach ($fStations['stations'] as $sID => $fStation) {
    $rq = $pdo->prepare('SELECT * FROM pbsc_updates WHERE station = ? ORDER BY time DESC');
    $rq->execute([ $sID ]);
    $dbStation = $rq->fetch(PDO::FETCH_UNIQUE);

    $needUpdate = false;
    if ($dbStation) {
      foreach ($fStation as $k => $v) if ($dbStation[$k] && $v !== $dbStation[$k]) {
        $needUpdate = true;
        break;
      }
    } else $needUpdate = true;

    if ($needUpdate) {
      $pdo->prepare('INSERT INTO pbsc_updates (station, eBikes, mBikes, time) VALUES (?, ?, ?, ?)')->execute([
        $sID,
        $fStation['eBikes'],
        $fStation['mBikes'],
        $fTime,
      ]);

      array_push($fetchedIDs, $sID);
    }
  }

  return [ 'success' => true, 'fetchedIDs' => $fetchedIDs ];
};

rq('/update', $update); // Auto handling

rq('/lastFetch', function() {
  global $pdo;
  global $_CONFIG;
  $rq = $pdo->prepare('SELECT id as lastID, time as lastUpdate FROM pbsc_updates ORDER BY time DESC');
  $rq->execute();

  return $rq->fetch();
});

rq('/getRawData', function() {
  global $pdo;
  $rq = $pdo->prepare('SELECT * FROM pbsc_updates ORDER BY time DESC');
  $rq->execute();
  return $rq->fetchAll(PDO::FETCH_UNIQUE);
});

rq('/getData', function() {
  global $pdo;
  global $update;

  $rq = $pdo->prepare('SELECT * FROM pbsc_updates ORDER BY id DESC LIMIT 100');
  $rq->execute();
  $datas = $rq->fetchAll(PDO::FETCH_UNIQUE);

  $operations = [];
  foreach ($datas as $dID => $data) {
    $rqHist = $pdo->prepare('SELECT * FROM pbsc_updates WHERE station = ? AND id < ? ORDER BY id DESC');
    $rqHist->execute([ $data['station'], $dID ]);
    $histData = $rqHist->fetch();

    if (!$histData) continue;

    $eDiff = $data['eBikes'] - $histData['eBikes'];
    $mDiff = $data['mBikes'] - $histData['mBikes'];

    $data['time'] = (new DateTime($data['time']))->format('Y-m-d H:i:s');

    for ($i = 0; $i < abs($eDiff); $i++) array_push($operations, [
      'UID'   => $data['station'].'_'.strtotime($data['time']).'_E',
      'sID'   => $data['station'],
      'time'  => $data['time'],
      'type'  => 'E',
      'diff'  => $eDiff,
    ]);

    for ($i = 0; $i < abs($mDiff); $i++) array_push($operations, [
      'UID'   => $data['station'].'_'.strtotime($data['time']).'_M',
      'sID'   => $data['station'],
      'time'  => $data['time'],
      'type'  => 'M',
      'diff'  => $mDiff,
    ]);
  }

  $update();

  $stations = [];

  foreach (getBikes()['stations'] as $sID => $bikes) {
    $stations[$sID] = [ $bikes['mBikes'], $bikes['eBikes'] ];
  }

  return [
    'operations' => $operations,
    'stations' => $stations,
  ];
});

rq('/getPaths', function() {
  return json_decode(file_get_contents('./paths.json'));
});

?>
