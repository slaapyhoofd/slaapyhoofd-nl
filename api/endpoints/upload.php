<?php
require_once __DIR__ . '/../config/cors.php';
require_once __DIR__ . '/../utils/response.php';
require_once __DIR__ . '/../middleware/auth.php';

// Require authentication
requireAuth();

$method = $_SERVER['REQUEST_METHOD'];

// POST /api/upload - Upload image
if ($method === 'POST') {
    try {
        // Validate file upload
        if (!isset($_FILES['image']) || $_FILES['image']['error'] !== UPLOAD_ERR_OK) {
            errorResponse('No file uploaded or upload error', 400);
        }

        $file = $_FILES['image'];
        $fileName = $file['name'];
        $fileTmpPath = $file['tmp_name'];
        $fileSize = $file['size'];
        $fileType = $file['type'];

        // Validate file type (images only)
        $allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
        if (!in_array($fileType, $allowedTypes)) {
            errorResponse('Invalid file type. Only JPG, PNG, GIF, and WebP images are allowed', 400);
        }

        // Validate file size (max 5MB)
        $maxSize = 5 * 1024 * 1024; // 5MB
        if ($fileSize > $maxSize) {
            errorResponse('File too large. Maximum size is 5MB', 400);
        }

        // Generate unique filename using MIME-derived extension (never trust original filename)
        $mimeToExt = ['image/jpeg' => 'jpg', 'image/png' => 'png', 'image/gif' => 'gif', 'image/webp' => 'webp'];
        $fileExtension = $mimeToExt[$fileType];
        $newFileName = uniqid('img_', true) . '_' . time() . '.' . $fileExtension;

        // Create uploads directory if it doesn't exist
        $uploadDir = __DIR__ . '/../../public/uploads/';
        if (!is_dir($uploadDir)) {
            mkdir($uploadDir, 0755, true);
        }

        // Move uploaded file
        $destination = $uploadDir . $newFileName;
        if (!move_uploaded_file($fileTmpPath, $destination)) {
            errorResponse('Failed to save uploaded file', 500);
        }

        // Return URL
        $fileUrl = '/uploads/' . $newFileName;

        successResponse([
            'url' => $fileUrl,
            'filename' => $newFileName,
            'size' => $fileSize,
            'type' => $fileType
        ]);

    } catch (Exception $e) {
        errorResponse('Upload failed: ' . $e->getMessage(), 500);
    }
} else {
    errorResponse('Method not allowed', 405);
}
