<?php
require_once __DIR__ . '/../config/cors.php';
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../utils/response.php';
require_once __DIR__ . '/../utils/validation.php';
require_once __DIR__ . '/../middleware/auth.php';

// Require authentication for all admin endpoints
requireAuth();

$method = $_SERVER['REQUEST_METHOD'];
$db = getDBConnection();

// Validate CSRF token for all mutating requests
if (in_array($method, ['POST', 'PUT', 'DELETE'])) {
    $csrfToken = $_SERVER['HTTP_X_CSRF_TOKEN'] ?? '';
    if (!validateCSRFToken($csrfToken)) {
        errorResponse('Invalid or missing CSRF token', 403);
    }
}

// Helper: store markdown as-is; frontend handles rendering via marked.js
function markdownToHtml($markdown) {
    // Content is rendered client-side. Store sanitized markdown as the HTML field too
    // so any plain-text fallback or server-side rendering still has safe content.
    return htmlspecialchars($markdown, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8');
}

// GET /api/admin/posts - List all posts (including drafts)
if ($method === 'GET' && !isset($_GET['id'])) {
    try {
        $page = isset($_GET['page']) ? (int)$_GET['page'] : 1;
        $perPage = max(1, min((int)($_GET['per_page'] ?? 10), 100));
        $offset = ($page - 1) * $perPage;
        $status = $_GET['status'] ?? null;
        $where = [];
        $params = [];
        
        if ($status && in_array($status, ['draft', 'published', 'archived'])) {
            $where[] = "status = :status";
            $params['status'] = $status;
        }
        
        $whereClause = count($where) > 0 ? 'WHERE ' . implode(' AND ', $where) : '';
        
        // Get total count
        $countStmt = $db->prepare("SELECT COUNT(*) as total FROM posts $whereClause");
        $countStmt->execute($params);
        $total = $countStmt->fetch()['total'];
        
        // Get posts
        $stmt = $db->prepare("
            SELECT id, slug, title, excerpt, author, category, tags, 
                   featured_image, status, published_at, views, created_at, updated_at
            FROM posts 
            $whereClause
            ORDER BY created_at DESC
            LIMIT :limit OFFSET :offset
        ");
        
        foreach ($params as $key => $value) {
            $stmt->bindValue(":$key", $value);
        }
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

// GET /api/admin/posts/:id - Get single post
elseif ($method === 'GET' && isset($_GET['id'])) {
    try {
        $id = (int)$_GET['id'];
        
        $stmt = $db->prepare("
            SELECT id, slug, title, excerpt, content, markdown_content, 
                   author, category, tags, featured_image, status,
                   published_at, views, created_at, updated_at
            FROM posts 
            WHERE id = :id
        ");
        $stmt->execute(['id' => $id]);
        $post = $stmt->fetch();
        
        if (!$post) {
            notFoundResponse('Post not found');
        }
        
        successResponse($post);
    } catch (Exception $e) {
        error_log("Error fetching post: " . $e->getMessage());
        serverErrorResponse('Failed to fetch post');
    }
}

// POST /api/admin/posts - Create new post
elseif ($method === 'POST') {
    try {
        $input = json_decode(file_get_contents('php://input'), true);

        if (!is_array($input)) {
            errorResponse('Invalid JSON body', 400);
        }

        // Validation
        $errors = [];
        if ($error = validateRequired($input['title'] ?? '', 'title')) $errors[] = $error;
        if ($error = validateRequired($input['markdown_content'] ?? '', 'content')) $errors[] = $error;
        
        if (count($errors) > 0) {
            errorResponse(implode(', ', $errors), 400);
        }
        
        $title = trim($input['title']);
        $markdownContent = $input['markdown_content'];
        $excerpt = $input['excerpt'] ?? '';
        $category = $input['category'] ?? null;
        $tags = $input['tags'] ?? null;
        $featuredImage = $input['featured_image'] ?? null;
        $status = in_array($input['status'] ?? 'draft', ['draft', 'published']) ? $input['status'] : 'draft';
        $author = $input['author'] ?? getCurrentUser()['username'];
        
        // Generate slug
        $slug = !empty($input['slug']) ? generateSlug($input['slug']) : generateSlug($title);
        $slug = ensureUniqueSlug($db, $slug);
        
        // Convert markdown to HTML
        $htmlContent = markdownToHtml($markdownContent);
        
        // Set published_at if publishing
        $publishedAt = $status === 'published' ? date('Y-m-d H:i:s') : null;
        
        // Insert post
        $stmt = $db->prepare("
            INSERT INTO posts (slug, title, excerpt, content, markdown_content, author, 
                             category, tags, featured_image, status, published_at)
            VALUES (:slug, :title, :excerpt, :content, :markdown_content, :author,
                    :category, :tags, :featured_image, :status, :published_at)
        ");
        
        $stmt->execute([
            'slug' => $slug,
            'title' => $title,
            'excerpt' => $excerpt,
            'content' => $htmlContent,
            'markdown_content' => $markdownContent,
            'author' => $author,
            'category' => $category,
            'tags' => $tags,
            'featured_image' => $featuredImage,
            'status' => $status,
            'published_at' => $publishedAt
        ]);
        
        $postId = $db->lastInsertId();
        
        // Fetch the created post
        $stmt = $db->prepare("SELECT * FROM posts WHERE id = :id");
        $stmt->execute(['id' => $postId]);
        $post = $stmt->fetch();
        
        successResponse($post, 201);
    } catch (Exception $e) {
        error_log("Error creating post: " . $e->getMessage());
        serverErrorResponse('Failed to create post');
    }
}

// PUT /api/admin/posts/:id - Update post
elseif ($method === 'PUT') {
    try {
        // Get ID from URL path
        $path = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
        preg_match('/\/admin\/posts\/(\d+)/', $path, $matches);
        $id = $matches[1] ?? null;
        
        if (!$id) {
            errorResponse('Post ID is required', 400);
        }
        
        $input = json_decode(file_get_contents('php://input'), true);

        if (!is_array($input)) {
            errorResponse('Invalid JSON body', 400);
        }

        // Check if post exists
        $stmt = $db->prepare("SELECT id, status FROM posts WHERE id = :id");
        $stmt->execute(['id' => $id]);
        $existingPost = $stmt->fetch();
        
        if (!$existingPost) {
            notFoundResponse('Post not found');
        }
        
        // Build update query dynamically
        $updates = [];
        $params = ['id' => $id];
        
        if (isset($input['title'])) {
            $updates[] = "title = :title";
            $params['title'] = trim($input['title']);
        }
        
        if (isset($input['markdown_content'])) {
            $updates[] = "markdown_content = :markdown_content";
            $updates[] = "content = :content";
            $params['markdown_content'] = $input['markdown_content'];
            $params['content'] = markdownToHtml($input['markdown_content']);
        }
        
        if (isset($input['excerpt'])) {
            $updates[] = "excerpt = :excerpt";
            $params['excerpt'] = $input['excerpt'];
        }
        
        if (isset($input['slug'])) {
            $slug = generateSlug($input['slug']);
            $slug = ensureUniqueSlug($db, $slug, $id);
            $updates[] = "slug = :slug";
            $params['slug'] = $slug;
        }
        
        if (isset($input['category'])) {
            $updates[] = "category = :category";
            $params['category'] = $input['category'];
        }
        
        if (isset($input['tags'])) {
            $updates[] = "tags = :tags";
            $params['tags'] = $input['tags'];
        }
        
        if (isset($input['featured_image'])) {
            $updates[] = "featured_image = :featured_image";
            $params['featured_image'] = $input['featured_image'];
        }
        
        if (isset($input['status']) && in_array($input['status'], ['draft', 'published', 'archived'])) {
            $updates[] = "status = :status";
            $params['status'] = $input['status'];
            
            // Set published_at when changing to published
            if ($input['status'] === 'published' && $existingPost['status'] !== 'published') {
                $updates[] = "published_at = NOW()";
            }
        }
        
        if (count($updates) === 0) {
            errorResponse('No fields to update', 400);
        }
        
        $sql = "UPDATE posts SET " . implode(', ', $updates) . " WHERE id = :id";
        $stmt = $db->prepare($sql);
        $stmt->execute($params);
        
        // Fetch updated post
        $stmt = $db->prepare("SELECT * FROM posts WHERE id = :id");
        $stmt->execute(['id' => $id]);
        $post = $stmt->fetch();
        
        successResponse($post);
    } catch (Exception $e) {
        error_log("Error updating post: " . $e->getMessage());
        serverErrorResponse('Failed to update post');
    }
}

// DELETE /api/admin/posts/:id - Delete post
elseif ($method === 'DELETE') {
    try {
        // Get ID from URL path
        $path = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
        preg_match('/\/admin\/posts\/(\d+)/', $path, $matches);
        $id = $matches[1] ?? null;
        
        if (!$id) {
            errorResponse('Post ID is required', 400);
        }
        
        // Check if post exists
        $stmt = $db->prepare("SELECT id FROM posts WHERE id = :id");
        $stmt->execute(['id' => $id]);
        
        if (!$stmt->fetch()) {
            notFoundResponse('Post not found');
        }
        
        // Delete post (will cascade delete comments)
        $stmt = $db->prepare("DELETE FROM posts WHERE id = :id");
        $stmt->execute(['id' => $id]);
        
        successResponse(['message' => 'Post deleted successfully']);
    } catch (Exception $e) {
        error_log("Error deleting post: " . $e->getMessage());
        serverErrorResponse('Failed to delete post');
    }
}

else {
    errorResponse('Method not allowed', 405);
}
