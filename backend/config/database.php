<?php
function getDatabaseConnection(): PDO
{
    $dataDirectory = dirname(__DIR__) . '/data';
    if (!is_dir($dataDirectory)) {
        mkdir($dataDirectory, 0775, true);
    }

    $connection = new PDO(
        'sqlite:' . $dataDirectory . '/enquiries.sqlite',
        null,
        null,
        [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES => false
        ]
    );

    $connection->exec(
        'CREATE TABLE IF NOT EXISTS enquiries (' .
        'id INTEGER PRIMARY KEY AUTOINCREMENT, ' .
        'name TEXT NOT NULL, ' .
        'phone TEXT NOT NULL, ' .
        'service TEXT NOT NULL, ' .
        'message TEXT NOT NULL, ' .
        'created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP)'
    );

    return $connection;
}