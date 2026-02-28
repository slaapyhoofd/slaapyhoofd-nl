<?php
require_once __DIR__ . '/../config/cors.php';
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../utils/response.php';

// Get request method and endpoint
$method = $_SERVER['REQUEST_METHOD'];

// Parse the request path to get slug
$requestUri = $_SERVER['REQUEST_URI'];
$path = parse_url($requestUri, PHP_URL_PATH);
$pathParts = explode('/', trim($path, '/'));

// GET /api/posts - List all published posts
if ($method === 'GET' && count($pathParts) === 2 && $pathParts[1] === 'posts') {
    try {
        $db = getDBConnection();
        
        // Pagination
        $page = isset($_GET['page']) ? (int)$_GET['page'] : 1;
        $perPage = max(1, min((int)($_GET['per_page'] ?? 10), 100));
        $offset = ($page - 1) * $perPage;
        
        // Get total count
        $countStmt = $db->prepare("SELECT COUNT(*) as total FROM posts WHERE status = 'published'");
        $countStmt->execute();
        $total = $countStmt->fetch()['total'];
        
        // Get posts
        $stmt = $db->prepare("
            SELECT id, slug, title, excerpt, author, category, tags, 
                   featured_image, published_at, views
            FROM posts 
            WHERE status = 'published'
            ORDER BY published_at DESC
            LIMIT :limit OFFSET :offset
        ");
        $stmt->bindValue(':limit', $perPage, PDO::PARAM_INT);
        $stmt->bindValue(':offset', $offset, PDO::PARAM_INT);
        $stmt->execute();
        $posts = $stmt->fetchAll();
        
        successResponse([
            'posts' => $posts,
            'pagination' => [
                'total' => (int)$total,
                'page' => $page,
                'per_page' => $perPage,
                'total_pages' => ceil($total / $perPage)
            ]
        ]);
    } catch (Exception $e) {
        error_log("Error fetching posts: " . $e->getMessage());
        serverErrorResponse('Failed to fetch posts');
    }
}

// GET /api/posts/:slug - Get single post by slug
elseif ($method === 'GET' && count($pathParts) === 3 && $pathParts[1] === 'posts') {
    try {
        $slug = $pathParts[2];
        $db = getDBConnection();
        
        $stmt = $db->prepare("
            SELECT id, slug, title, excerpt, content, markdown_content, 
                   author, category, tags, featured_image, 
                   published_at, views, created_at, updated_at
            FROM posts 
            WHERE slug = :slug AND status = 'published'
        ");
        $stmt->execute(['slug' => $slug]);
        $post = $stmt->fetch();
        
        if (!$post) {
            notFoundResponse('Post not found');
        }
        
        // Increment view count
        $updateStmt = $db->prepare("UPDATE posts SET views = views + 1 WHERE id = :id");
        $updateStmt->execute(['id' => $post['id']]);
        
        successResponse($post);
    } catch (Exception $e) {
        error_log("Error fetching post: " . $e->getMessage());
        serverErrorResponse('Failed to fetch post');
    }
}

else {
    notFoundResponse('Endpoint not found');
}
