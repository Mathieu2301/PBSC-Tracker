<?
$host = $_ENV['MYSQL_HOST'];
$user = $_ENV['MYSQL_USER'];
$pass = $_ENV['MYSQL_PASS'];
$db = $_ENV['MYSQL_DB'];

$pdo = new PDO("mysql:host=$host;dbname=$db;charset=utf8mb4", $user, $pass, [
  PDO::ATTR_EMULATE_PREPARES => false,
  PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
  PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
]);
?>
