<?php
header('Content-Type: text/plain');
$urls = [
    '/articles/article-absd-timing-trap.html',
    '/articles/',
    '/blog.html',
    '/',
    '/elta/',
    '/elta/index.html',
    '/dunearnhouse/',
    '/dunearnhouse/index.html',
];
$results = [];
foreach ($urls as $url) {
    $results[$url] = 'not purged';
    if (function_exists('header_remove')) {
        header('X-LiteSpeed-Purge: ' . $url);
        $results[$url] = 'purge header sent';
    }
}
// LiteSpeed server-specific cache purge via header
$server_software = $_SERVER['SERVER_SOFTWARE'] ?? 'unknown';
$results['server'] = $server_software;
echo json_encode($results, JSON_PRETTY_PRINT);
