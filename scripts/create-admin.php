#!/usr/bin/env php
<?php
/**
 * Helper script to create/update admin user password
 * Usage: php scripts/create-admin.php [username] [password]
 */

// Default values from .env or fallback
$username = $argv[1] ?? getenv('ADMIN_USERNAME') ?: 'admin';
$password = $argv[2] ?? getenv('ADMIN_PASSWORD') ?: 'admin123';
$email = getenv('ADMIN_EMAIL') ?: 'admin@slaapyhoofd.nl';

// Generate password hash
$passwordHash = password_hash($password, PASSWORD_BCRYPT);

echo "=========================================\n";
echo "Admin User Password Hash Generator\n";
echo "=========================================\n\n";
echo "Username: $username\n";
echo "Email: $email\n";
echo "Password: " . str_repeat('*', strlen($password)) . "\n";
echo "Hash: $passwordHash\n\n";

// Database connection
$dbHost = getenv('DB_HOST') ?: 'db';
$dbName = getenv('DB_NAME') ?: 'slaapyhoofd_db';
$dbUser = getenv('DB_USER') ?: 'slaapyhoofd';
$dbPass = getenv('DB_PASS') ?: 'local_dev_password_123';

try {
    $pdo = new PDO("mysql:host=$dbHost;dbname=$dbName;charset=utf8mb4", $dbUser, $dbPass);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    // Check if user exists
    $stmt = $pdo->prepare("SELECT id FROM admin_users WHERE username = ?");
    $stmt->execute([$username]);
    $exists = $stmt->fetch();
    
    if ($exists) {
        // Update existing user
        $stmt = $pdo->prepare("UPDATE admin_users SET password_hash = ?, email = ? WHERE username = ?");
        $stmt->execute([$passwordHash, $email, $username]);
        echo "✅ Admin user '$username' password updated successfully!\n";
    } else {
        // Create new user
        $stmt = $pdo->prepare("INSERT INTO admin_users (username, password_hash, email, role) VALUES (?, ?, ?, 'admin')");
        $stmt->execute([$username, $passwordHash, $email]);
        echo "✅ Admin user '$username' created successfully!\n";
    }
    
    echo "\nYou can now login with:\n";
    echo "  Username: $username\n";
    echo "  Password: [the password you provided]\n";
    echo "=========================================\n";
    
} catch (PDOException $e) {
    echo "❌ Database error: " . $e->getMessage() . "\n";
    echo "\nMake sure:\n";
    echo "1. Docker containers are running (docker-compose up -d)\n";
    echo "2. Database is initialized\n";
    echo "3. Environment variables are set correctly\n";
    exit(1);
}
