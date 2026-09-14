<?php
header('Content-Type: text/plain');

$ftp_server = "127.0.0.1";
$ftp_user = "u851958941.thomson-reserve-direct-developer.com";
$ftp_pass = "Thomson12345&";

echo "Starting local FTP deployment for Thomson Reserve...\n";

$conn_id = @ftp_connect($ftp_server);
if (!$conn_id) {
    echo "Connecting to localhost failed, trying 191.101.228.66...\n";
    $conn_id = @ftp_connect("191.101.228.66");
}

if (!$conn_id) {
    die("FTP connection failed.");
}

if (!@ftp_login($conn_id, $ftp_user, $ftp_pass)) {
    echo "First password failed, trying alternate...\n";
    $ftp_pass = "Thomson87649315$";
    if (!@ftp_login($conn_id, $ftp_user, $ftp_pass)) {
        die("FTP Login failed for $ftp_user");
    }
}

echo "✅ FTP Logged in successfully!\n";
ftp_pasv($conn_id, true);

$files = [
    'floor-plans.html' => '/floor-plans.html',
    'floorplans.html' => '/floorplans.html',
    'site-thomsonreserve.html' => '/index.html',
];

foreach ($files as $local_name => $remote_path) {
    $local_path = __DIR__ . '/' . $local_name;
    if (file_exists($local_path)) {
        if (ftp_put($conn_id, $remote_path, $local_path, FTP_BINARY)) {
            echo "✅ Uploaded $local_name -> $remote_path\n";
        } else {
            echo "❌ Failed to upload $local_name -> $remote_path\n";
        }
    } else {
        echo "⚠️ Local file not found: $local_path\n";
    }
}

@ftp_mkdir($conn_id, "/images");
@ftp_mkdir($conn_id, "/images/thomson-floorplans");

$img_dir = __DIR__ . '/images/thomson-floorplans';
if (is_dir($img_dir)) {
    foreach (scandir($img_dir) as $img) {
        if ($img !== '.' && $img !== '..') {
            $local_img = $img_dir . '/' . $img;
            $remote_img = '/images/thomson-floorplans/' . $img;
            if (ftp_put($conn_id, $remote_img, $local_img, FTP_BINARY)) {
                echo "✅ Uploaded image $img -> $remote_img\n";
            } else {
                echo "❌ Failed to upload image $img\n";
            }
        }
    }
}

ftp_close($conn_id);
echo "🎉 DEPLOYMENT COMPLETE!\n";
