<?php
require_once __DIR__ . '/../config/cors.php';
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../utils/response.php';

$method = $_SERVER['REQUEST_METHOD'];

// Parse request path
$requestUri = $_SERVER['REQUEST_URI'];
$path = parse_url($requestUri, PHP_URL_PATH);
$pathParts = explode('/', trim($path, '/'));

// GET /api/comments?post_id=:id - Get approved comments for a post
if ($method === 'GET') {
    try {
        $postId = isset($_GET['post_id']) ? (int)$_GET['post_id'] : 0;
        
        if (!$postId) {
            errorResponse('Missing post_id parameter');
        }
        
        $db = getDBConnection();
        
        $stmt = $db->prepare("
            SELECT id, post_id, parent_id, author_name, content, created_at
            FROM comments 
            WHERE post_id = :post_id AND status = 'approved'
            ORDER BY created_at ASC
        ");
        $stmt->execute(['post_id' => $postId]);
        $comments = $stmt->fetchAll();
        
        // Build nested structure
        $commentTree = buildCommentTree($comments);
        
        successResponse($commentTree);
    } catch (Exception $e) {
        error_log("Error fetching comments: " . $e->getMessage());
        serverErrorResponse('Failed to fetch comments');
    }
}

// POST /api/comments - Submit a new comment
elseif ($method === 'POST') {
    try {
        $input = json_decode(file_get_contents('php://input'), true);

        if (!is_array($input)) {
            errorResponse('Invalid JSON body', 400);
        }

        // Honeypot check
        if (!empty($input['website'])) {
            error_log("Honeypot triggered for comment submission");
            successResponse(['message' => 'Comment submitted for moderation']);
            exit;
        }
        
        // Validation
        $required = ['post_id', 'author_name', 'author_email', 'content'];
        foreach ($required as $field) {
            if (empty($input[$field])) {
                errorResponse("Missing required field: $field");
            }
        }
        
        // Sanitize inputs
        $postId = (int)$input['post_id'];
        $parentId = !empty($input['parent_id']) ? (int)$input['parent_id'] : null;
        $authorName = htmlspecialchars(trim($input['author_name']), ENT_QUOTES, 'UTF-8');
        $authorEmail = filter_var($input['author_email'], FILTER_VALIDATE_EMAIL);
        $content = htmlspecialchars(trim($input['content']), ENT_QUOTES, 'UTF-8');
        
        if (!$authorEmail) {
            errorResponse('Invalid email address');
        }
        
        // Rate limiting - check if user has submitted more than 3 comments in last 10 minutes
        $ipAddress = $_SERVER['REMOTE_ADDR'] ?? '';
        $db = getDBConnection();
        
        $rateLimitStmt = $db->prepare("
            SELECT COUNT(*) as count 
            FROM comments 
            WHERE ip_address = :ip AND created_at > DATE_SUB(NOW(), INTERVAL 10 MINUTE)
        ");
        $rateLimitStmt->execute(['ip' => $ipAddress]);
        $recentComments = $rateLimitStmt->fetch()['count'];
        
        if ($recentComments >= 3) {
            errorResponse('Too many comments. Please wait a few minutes.', 429);
        }
        
        // Insert comment
        $userAgent = $_SERVER['HTTP_USER_AGENT'] ?? '';
        
        $stmt = $db->prepare("
            INSERT INTO comments (post_id, parent_id, author_name, author_email, content, ip_address, user_agent, status)
            VALUES (:post_id, :parent_id, :author_name, :author_email, :content, :ip_address, :user_agent, 'pending')
        ");
        
        $stmt->execute([
            'post_id' => $postId,
            'parent_id' => $parentId,
            'author_name' => $authorName,
            'author_email' => $authorEmail,
            'content' => $content,
            'ip_address' => $ipAddress,
            'user_agent' => $userAgent
        ]);
        
        successResponse([
            'message' => 'Comment submitted for moderation',
            'id' => $db->lastInsertId()
        ], 201);
    } catch (Exception $e) {
        error_log("Error submitting comment: " . $e->getMessage());
        serverErrorResponse('Failed to submit comment');
    }
}

else {
    errorResponse('Method not allowed', 405);
}

// Helper function to build comment tree
function buildCommentTree($comments, $parentId = null) {
    $tree = [];
    foreach ($comments as $comment) {
        if ($comment['parent_id'] == $parentId) {
            $comment['replies'] = buildCommentTree($comments, $comment['id']);
            $tree[] = $comment;
        }
    }
    return $tree;
}
