<?php
require_once __DIR__ . '/../config/cors.php';
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../utils/response.php';
require_once __DIR__ . '/../middleware/auth.php';

// Require authentication for all admin comment endpoints
requireAuth();

$method = $_SERVER['REQUEST_METHOD'];
$db = getDBConnection();

// Validate CSRF token for all mutating requests
if (in_array($method, ['PUT', 'DELETE'])) {
    $csrfToken = $_SERVER['HTTP_X_CSRF_TOKEN'] ?? '';
    if (!validateCSRFToken($csrfToken)) {
        errorResponse('Invalid or missing CSRF token', 403);
    }
}

// GET /api/admin/comments - List all comments with filtering
if ($method === 'GET' && !isset($_GET['id'])) {
    try {
        $status = $_GET['status'] ?? null;
        $page = isset($_GET['page']) ? (int)$_GET['page'] : 1;
        $perPage = isset($_GET['per_page']) ? (int)$_GET['per_page'] : 20;
        $offset = ($page - 1) * $perPage;
        
        $sql = "
            SELECT 
                c.id,
                c.post_id,
                c.parent_id,
                c.author_name,
                c.author_email,
                c.content,
                c.status,
                c.ip_address,
                c.created_at,
                p.title as post_title,
                p.slug as post_slug
            FROM comments c
            LEFT JOIN posts p ON c.post_id = p.id
        ";
        
        $params = [];
        if ($status) {
            $sql .= " WHERE c.status = :status";
            $params['status'] = $status;
        }
        
        $sql .= " ORDER BY c.created_at DESC LIMIT :limit OFFSET :offset";
        $params['limit'] = $perPage;
        $params['offset'] = $offset;
        
        $stmt = $db->prepare($sql);
        foreach ($params as $key => $value) {
            $stmt->bindValue(":$key", $value, is_int($value) ? PDO::PARAM_INT : PDO::PARAM_STR);
        }
        $stmt->execute();
        $comments = $stmt->fetchAll();
        
        // Get total count
        $countSql = "SELECT COUNT(*) as total FROM comments";
        if ($status) {
            $countSql .= " WHERE status = :status";
        }
        $countStmt = $db->prepare($countSql);
        if ($status) {
            $countStmt->execute(['status' => $status]);
        } else {
            $countStmt->execute();
        }
        $total = $countStmt->fetch()['total'];
        
        successResponse([
            'comments' => $comments,
            'pagination' => [
                'page' => $page,
                'per_page' => $perPage,
                'total' => $total,
                'total_pages' => ceil($total / $perPage)
            ]
        ]);
        
    } catch (PDOException $e) {
        errorResponse('Database error: ' . $e->getMessage(), 500);
    }
}

// PUT /api/admin/comments/:id - Update comment status
elseif ($method === 'PUT') {
    try {
        $id = $_GET['id'] ?? null;
        if (!$id) {
            errorResponse('Comment ID is required', 400);
        }
        
        $input = json_decode(file_get_contents('php://input'), true);
        $status = $input['status'] ?? null;
        
        if (!in_array($status, ['pending', 'approved', 'spam', 'rejected'])) {
            errorResponse('Invalid status. Must be: pending, approved, spam, or rejected', 400);
        }
        
        $stmt = $db->prepare("UPDATE comments SET status = :status WHERE id = :id");
        $stmt->execute([
            'status' => $status,
            'id' => $id
        ]);
        
        if ($stmt->rowCount() === 0) {
            errorResponse('Comment not found', 404);
        }
        
        successResponse(['message' => 'Comment status updated']);
        
    } catch (PDOException $e) {
        errorResponse('Database error: ' . $e->getMessage(), 500);
    }
}

// DELETE /api/admin/comments/:id - Delete comment
elseif ($method === 'DELETE') {
    try {
        $id = $_GET['id'] ?? null;
        if (!$id) {
            errorResponse('Comment ID is required', 400);
        }
        
        $stmt = $db->prepare("DELETE FROM comments WHERE id = :id");
        $stmt->execute(['id' => $id]);
        
        if ($stmt->rowCount() === 0) {
            errorResponse('Comment not found', 404);
        }
        
        successResponse(['message' => 'Comment deleted']);

    } catch (PDOException $e) {
        errorResponse('Database error: ' . $e->getMessage(), 500);
    }
} else {
    errorResponse('Method not allowed', 405);
}
