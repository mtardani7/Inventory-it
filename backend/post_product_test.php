<?php
$data = [
    'no_asset' => '13322',
    'no_serial' => '1333434',
    'no_equipment' => '1312321',
    'tipe' => 'Aliquam reprehenderi',
    'tahun_pembuatan' => '2026',
    'usage_date' => '10 bulan, 11 hari',
    'pengguna' => 'test',
    'computer_name' => 'Sigourney Waller',
    'plant' => '1',
    'status' => 'Aktif',
    'usage_record' => 'test',
    'keterangan' => 'test',
];
$options = [
    'http' => [
        'method' => 'POST',
        'header' => "Content-Type: application/json\r\nAccept: application/json\r\n",
        'content' => json_encode($data),
        'ignore_errors' => true,
    ],
];
$context = stream_context_create($options);
$url = 'http://127.0.0.1:8000/api/products';
$result = @file_get_contents($url, false, $context);
if ($result === false) {
    echo "REQUEST_FAILED\n";
    // print headers if available
    if (isset($http_response_header)) {
        foreach ($http_response_header as $h) {
            echo $h . "\n";
        }
    }
    exit(1);
}
// print response and response headers
echo $result . "\n";
if (isset($http_response_header)) {
    foreach ($http_response_header as $h) {
        echo $h . "\n";
    }
}
