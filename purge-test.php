<?php
// Simple Hostinger cache purge
header('Cache-Control: no-cache, no-store, must-revalidate');
if (function_exists('opcache_reset'))
    opcache_reset();
if (function_exists('litespeed_purge_url')) {
    $urls = ['/articles/article-absd-timing-trap.html', '/articles/', '/blog.html'];
    foreach ($urls as $u) {
        litespeed_purge_url($u);
        echo "Purged: $u\n";
    }
} else if (isset($_SERVER['X-LSCACHE'])) {
    header('X-LiteSpeed-Purge: *');
    echo "Purge header sent for all\n";
} else {
    echo "No LS cache functions found\n";
}
echo "PHP: ".phpversion()."\n";
echo "X-LSCACHE: ".($_SERVER['X-LSCACHE'] ?? 'not set')."\n";
