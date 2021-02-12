<?php
$_CONFIG = [
  'zone' => 46, // InstantSystem zone ID (46 is Valence)
  'interval' => 3, // Minimum interval (in seconds) between two autofetches
  'timeZoneCorrect' => 'PT1H', // Timezone correction (if the PHP server isn't in the same zone as you)
];

include './mysql.php';
include './fetch.php';

header('Access-Control-Allow-Origin: *');
header('Content-Type: application/json; charset=utf-8');
ini_set('serialize_precision', 14);

function rs($rs) {
  if ($rs) exit(json_encode($rs));
  else exit();
}

function rq($rq, $cb) {
  $uri = trim(explode('?', $_SERVER['REQUEST_URI'])[0], '/');
  if (trim($rq, '/') === $uri) rs($cb());
}

// -------- Auto fetch --------

$lastFetch = file_get_contents('./lastFetch');
$fetchedIDs = [];

if (!$lastFetch || $fTimestamp - $lastFetch > $_CONFIG['interval']) {
  $fStations = getBikes();

  foreach ($fStations as $sID => $fStation) {
    $rq = $pdo->prepare('SELECT * FROM libelo_updates WHERE station = ? ORDER BY time DESC');
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
      $rq = $pdo->prepare('INSERT INTO libelo_updates (station, bikes, eBikes, mBikes, stands, status, time) VALUES (?, ?, ?, ?, ?, ?, ?)');
      $rq->execute([
        $sID,
        $fStation['bikes'],
        $fStation['eBikes'],
        $fStation['mBikes'],
        $fStation['stands'],
        $fStation['status'],
        $fTime,
      ]);

      array_push($fetchedIDs, $sID);
    }
  }

  file_put_contents('./lastFetch', $fTimestamp);
}

// -----------

rq('/getStations', function() {
  return getStations();
});

rq('/autoFetch', function() {
  global $fetchedIDs;
  return [ 'fetchedIDs' => $fetchedIDs ];
});

rq('/lastFetch', function() {
  global $lastFetch;
  exit($lastFetch);
});

function getLogs() {
  global $pdo;

  $stationsNames = getStations();

  $rq = $pdo->prepare('SELECT * FROM libelo_updates ORDER BY time DESC');
  $rq->execute();
  $datas = $rq->fetchAll(PDO::FETCH_UNIQUE);

  $logs = [];
  foreach ($datas as $dID => $data) {
    $rqHist = $pdo->prepare('SELECT * FROM libelo_updates WHERE station = ? AND id != ? ORDER BY time DESC');
    $rqHist->execute([ $data['station'], $dID ]);
    $histData = $rqHist->fetch();

    if (!$histData) continue;

    $sName = $stationsNames[$data['station']]['name'];

    $eDiff = $data['eBikes'] - $histData['eBikes'];
    $mDiff = $data['mBikes'] - $histData['mBikes'];

    if ($eDiff !== 0) array_push($logs, [
      'sID'   => $data['station'],
      'sName' => $sName,
      'time'  => $data['time'],
      'type'  => 'E',
      'diff'  => $eDiff,
      'fDiff' => ($eDiff > 0 ? "+$eDiff" : $eDiff),
    ]);

    if ($mDiff !== 0) array_push($logs, [
      'sID'   => $data['station'],
      'sName' => $sName,
      'time'  => $data['time'],
      'type'  => 'M',
      'diff'  => $mDiff,
      'fDiff' => ($mDiff > 0 ? "+$mDiff" : $mDiff),
    ]);
  }

  return $logs;
}

rq('getLogs', function() {
  return getLogs();
});

rq('getLogs/text', function() {
  foreach (getLogs() as $log) {
    echo '['.$log['time']."]: ".$log['fDiff']." [".$log['type']."] at ".$log['sName']." (".$log['sID'].")\n";
  }
});

?>
