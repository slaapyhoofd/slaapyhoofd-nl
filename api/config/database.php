<?php
// Database configuration
// Priority: real environment variables (Docker/CLI) → api/.env file (production server)

function loadEnvFile(string $path): void {
    if (!file_exists($path)) {
        return;
    }
    $lines = file($path, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
    foreach ($lines as $line) {
        $line = trim($line);
        if ($line === '' || str_starts_with($line, '#') || !str_contains($line, '=')) {
            continue;
        }
        [$key, $value] = explode('=', $line, 2);
        $key   = trim($key);
        $value = trim($value, " \t\"'");
        // Only set if not already defined (real env vars take precedence)
        if (getenv($key) === false) {
            putenv("$key=$value");
        }
    }
}

// Load .env from api/ directory (production server — never committed to git)
loadEnvFile(__DIR__ . '/../.env');

$db_config = [
    'host'    => getenv('DB_HOST') ?: 'db',
    'name'    => getenv('DB_NAME') ?: 'slaapyhoofd_db',
    'user'    => getenv('DB_USER') ?: 'slaapyhoofd',
    'pass'    => getenv('DB_PASS') ?: 'local_dev_password_123',
    'charset' => 'utf8mb4'
];

function getDBConnection() {
    global $db_config;
    static $pdo = null;

    if ($pdo !== null) {
        return $pdo;
    }

    try {
        $dsn = "mysql:host={$db_config['host']};dbname={$db_config['name']};charset={$db_config['charset']}";
        $options = [
            PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES   => false,
        ];

        $pdo = new PDO($dsn, $db_config['user'], $db_config['pass'], $options);
        return $pdo;
    } catch (PDOException $e) {
        error_log("Database connection failed: " . $e->getMessage());
        http_response_code(500);
        echo json_encode(['success' => false, 'error' => 'Database connection failed']);
        exit;
    }
}
