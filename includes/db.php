<?php
// ─────────────────────────────────────────────
//  Environment / error-display bootstrap
//  Local WAMP dev needs zero config (defaults below).
//  A real host sets APP_ENV=production (and the DB_* vars)
//  as actual environment variables — no code edits needed.
// ─────────────────────────────────────────────

define('APP_ENV', getenv('APP_ENV') ?: 'local');

if (APP_ENV === 'production') {
    ini_set('display_errors', '0');
    ini_set('log_errors', '1');
} else {
    ini_set('display_errors', '1');
}
error_reporting(E_ALL);

// ─────────────────────────────────────────────
//  Database configuration
//  Falls back to the local WAMP defaults below when no
//  DB_* environment variable is set.
// ─────────────────────────────────────────────

define('DB_HOST', getenv('DB_HOST') ?: 'localhost');
define('DB_NAME', getenv('DB_NAME') ?: 'portfolio_db');
define('DB_USER', getenv('DB_USER') ?: 'root');
define('DB_PASS', getenv('DB_PASS') ?: '');
define('DB_CHARSET', 'utf8mb4');

function getDB(): PDO {
    static $pdo = null;
    if ($pdo === null) {
        $dsn = sprintf(
            'mysql:host=%s;dbname=%s;charset=%s',
            DB_HOST, DB_NAME, DB_CHARSET
        );
        $options = [
            PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES   => false,
        ];
        try {
            $pdo = new PDO($dsn, DB_USER, DB_PASS, $options);
        } catch (PDOException $e) {
            error_log('DB connection failed: ' . $e->getMessage());
            throw new RuntimeException('Database connection failed.');
        }
    }
    return $pdo;
}
