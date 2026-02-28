<?php
// Utility functions for input validation

function validateRequired($value, $fieldName) {
    if (empty($value) && $value !== '0') {
        return "Field '$fieldName' is required";
    }
    return null;
}

function validateEmail($email) {
    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        return 'Invalid email address';
    }
    return null;
}

function validateMaxLength($value, $maxLength, $fieldName) {
    if (strlen($value) > $maxLength) {
        return "Field '$fieldName' must be less than $maxLength characters";
    }
    return null;
}

function sanitizeHtml($html) {
    // Strip all tags not in the allowlist
    $allowed = '<p><br><strong><em><u><h1><h2><h3><h4><h5><h6><ul><ol><li><a><code><pre><blockquote><hr>';
    $html = strip_tags($html, $allowed);

    // Remove event handler attributes (onclick, onerror, onload, etc.) from remaining tags
    $html = preg_replace('/\s+on\w+\s*=\s*(["\']).*?\1/i', '', $html);
    $html = preg_replace('/\s+on\w+\s*=\s*[^\s>]+/i', '', $html);

    // Remove javascript: in href/src attributes
    $html = preg_replace('/\b(href|src|action)\s*=\s*(["\'])\s*javascript:/i', '$1=$2#', $html);

    return $html;
}

function generateSlug($text) {
    // Convert to lowercase
    $slug = strtolower($text);
    
    // Remove special characters
    $slug = preg_replace('/[^a-z0-9\s-]/', '', $slug);
    
    // Replace spaces and multiple hyphens with single hyphen
    $slug = preg_replace('/[\s-]+/', '-', $slug);
    
    // Trim hyphens from ends
    $slug = trim($slug, '-');
    
    return $slug;
}

function ensureUniqueSlug($db, $slug, $excludeId = null) {
    $originalSlug = $slug;
    $counter = 1;
    
    while (true) {
        $stmt = $db->prepare("SELECT id FROM posts WHERE slug = :slug" . ($excludeId ? " AND id != :id" : ""));
        $params = ['slug' => $slug];
        if ($excludeId) {
            $params['id'] = $excludeId;
        }
        $stmt->execute($params);
        
        if (!$stmt->fetch()) {
            return $slug;
        }
        
        $slug = $originalSlug . '-' . $counter;
        $counter++;
    }
}
