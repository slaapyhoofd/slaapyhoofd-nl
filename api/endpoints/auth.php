<?php
require_once __DIR__ . '/../config/cors.php';
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../utils/response.php';
require_once __DIR__ . '/../middleware/auth.php';

$method = $_SERVER['REQUEST_METHOD'];

// POST /api/auth/login - Admin login
if ($method === 'POST' && strpos($_SERVER['REQUEST_URI'], '/login') !== false) {
    try {
        $input = json_decode(file_get_contents('php://input'), true);

        if (!is_array($input)) {
            errorResponse('Invalid JSON body', 400);
        }

        // Validation
        if (empty($input['username']) || empty($input['password'])) {
            errorResponse('Username and password are required', 400);
        }

        $username = trim($input['username']);
        $password = $input['password'];

        // Rate limiting — max 5 login attempts per IP per 15 minutes
        $ipAddress = $_SERVER['REMOTE_ADDR'] ?? '';
        $db = getDBConnection();
        $rateLimitStmt = $db->prepare("
            SELECT COUNT(*) as count FROM login_attempts
            WHERE ip_address = :ip AND attempted_at > DATE_SUB(NOW(), INTERVAL 15 MINUTE)
        ");
        $rateLimitStmt->execute(['ip' => $ipAddress]);
        $attempts = $rateLimitStmt->fetch()['count'];

        if ($attempts >= 5) {
            errorResponse('Too many login attempts. Please try again later.', 429);
        }

        // Get user from database
        $stmt = $db->prepare("SELECT id, username, password_hash, email, role FROM admin_users WHERE username = :username");
        $stmt->execute(['username' => $username]);
        $user = $stmt->fetch();

        if (!$user || !password_verify($password, $user['password_hash'])) {
            // Record failed attempt
            $db->prepare("INSERT INTO login_attempts (ip_address) VALUES (:ip)")
               ->execute(['ip' => $ipAddress]);
            errorResponse('Invalid username or password', 401);
        }

        // Clear attempts on successful login
        $db->prepare("DELETE FROM login_attempts WHERE ip_address = :ip")
           ->execute(['ip' => $ipAddress]);

        // Set session
        setAuthSession($user);
        
        // Generate CSRF token
        $csrfToken = generateCSRFToken();
        
        successResponse([
            'user' => [
                'id' => $user['id'],
                'username' => $user['username'],
                'email' => $user['email'],
                'role' => $user['role']
            ],
            'csrf_token' => $csrfToken
        ]);
    } catch (Exception $e) {
        error_log("Login error: " . $e->getMessage());
        serverErrorResponse('Login failed');
    }
}

// POST /api/auth/logout - Admin logout
elseif ($method === 'POST' && strpos($_SERVER['REQUEST_URI'], '/logout') !== false) {
    clearAuthSession();
    successResponse(['message' => 'Logged out successfully']);
}

// GET /api/auth/me - Get current user
elseif ($method === 'GET' && strpos($_SERVER['REQUEST_URI'], '/me') !== false) {
    $user = getCurrentUser();
    
    if (!$user) {
        unauthorizedResponse('Not authenticated');
    }
    
    successResponse([
        'user' => $user,
        'csrf_token' => generateCSRFToken()
    ]);
}

// OPTIONS request (CORS preflight)
elseif ($method === 'OPTIONS') {
    http_response_code(200);
    exit;
}

else {
    notFoundResponse('Auth endpoint not found');
}
