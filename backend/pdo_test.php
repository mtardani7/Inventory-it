<?php
try {
    $pdo = new PDO('mysql:host=192.168.0.21;port=3309;dbname=inventory', 'admin', 'Firew411+');
    echo "PDO: OK\n";
} catch (Throwable $e) {
    echo "PDO ERROR: " . $e->getMessage() . "\n";
}
