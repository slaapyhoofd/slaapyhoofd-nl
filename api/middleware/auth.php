<?php
// Authentication middleware
// Use this to protect admin endpoints

// Configure session cookie security based on protocol
$isSecure = (isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') ||
            (isset($_SERVER['HTTP_X_FORWARDED_PROTO']) && $_SERVER['HTTP_X_FORWARDED_PROTO'] === 'https');
// SameSite=None requires Secure; use Lax on HTTP (local dev via Vite proxy)
ini_set('session.cookie_samesite', $isSecure ? 'None' : 'Lax');
ini_set('session.cookie_secure', $isSecure ? '1' : '0');
ini_set('session.cookie_httponly', '1');
ini_set('session.cookie_lifetime', '86400'); // 24 hours

session_start();

function requireAuth() {
    if (!isAuthenticated()) {
        http_response_code(401);
        echo json_encode([
            'success' => false,
            'error' => 'Unauthorized. Please login.'
        ]);
        exit;
    }
}

function isAuthenticated() {
    return isset($_SESSION['admin_user_id']) && isset($_SESSION['admin_username']);
}

function getCurrentUser() {
    if (!isAuthenticated()) {
        return null;
    }
    
    return [
        'id' => $_SESSION['admin_user_id'],
        'username' => $_SESSION['admin_username'],
        'email' => $_SESSION['admin_email'] ?? null,
        'role' => $_SESSION['admin_role'] ?? 'editor'
    ];
}

function setAuthSession($user) {
    // Regenerate session ID to prevent session fixation attacks
    session_regenerate_id(true);

    $_SESSION['admin_user_id'] = $user['id'];
    $_SESSION['admin_username'] = $user['username'];
    $_SESSION['admin_email'] = $user['email'];
    $_SESSION['admin_role'] = $user['role'];
    
    // Update last login
    require_once __DIR__ . '/../config/database.php';
    $db = getDBConnection();
    $stmt = $db->prepare("UPDATE admin_users SET last_login = NOW() WHERE id = :id");
    $stmt->execute(['id' => $user['id']]);
}

function clearAuthSession() {
    session_unset();
    session_destroy();
}

// CSRF Token generation and validation
function generateCSRFToken() {
    if (!isset($_SESSION['csrf_token'])) {
        $_SESSION['csrf_token'] = bin2hex(random_bytes(32));
    }
    return $_SESSION['csrf_token'];
}

function validateCSRFToken($token) {
    return isset($_SESSION['csrf_token']) && hash_equals($_SESSION['csrf_token'], $token);
}
