<?php
// Central Secure Deploy Helper on jetleechannel.sg
header('Content-Type: text/plain');

$SECRET = "JetleeDeploy87649315";
if (($_POST['secret'] ?? '') !== $SECRET) {
    http_response_code(403);
    die("Forbidden");
}

$ftp_server = "127.0.0.1";
$ftp_user = $_POST['ftp_user'] ?? '';
$ftp_pass = $_POST['ftp_pass'] ?? '';
$remote_file = $_POST['remote_file'] ?? '';
$content = $_POST['content'] ?? '';

if (!$ftp_user || !$ftp_pass || !$remote_file || !$content) {
    http_response_code(400);
    die("Missing params");
}

$conn = @ftp_connect($ftp_server, 21, 10);
if (!$conn) {
    // Try public IP if localhost connection refuses
    $conn = @ftp_connect("191.101.228.66", 21, 10);
}

if (!$conn) {
    die("FTP connect failed");
}

if (!@ftp_login($conn, $ftp_user, $ftp_pass)) {
    @ftp_close($conn);
    die("FTP login failed");
}

@ftp_pasv($conn, true);

$tmp = tempnam(sys_get_temp_dir(), 'deploy_');
file_put_contents($tmp, $content);

if (@ftp_put($conn, $remote_file, $tmp, FTP_BINARY)) {
    echo "SUCCESS: $remote_file uploaded";
} else {
    echo "FAILED: ftp_put failed for $remote_file";
}

@unlink($tmp);
@ftp_close($conn);
