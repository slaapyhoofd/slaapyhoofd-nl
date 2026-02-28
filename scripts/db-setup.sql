-- Database setup for Slaapyhoofd.nl Blog
-- Run this file on your MySQL server to create the required tables

-- Create database (if needed)
-- CREATE DATABASE IF NOT EXISTS slaapyhoofd_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
-- USE slaapyhoofd_db;

-- Table: posts
CREATE TABLE IF NOT EXISTS posts (
  id INT AUTO_INCREMENT PRIMARY KEY,
  slug VARCHAR(255) UNIQUE NOT NULL,
  title VARCHAR(255) NOT NULL,
  excerpt TEXT,
  content LONGTEXT NOT NULL,
  markdown_content LONGTEXT NOT NULL,
  author VARCHAR(100) DEFAULT 'Admin',
  category VARCHAR(100),
  tags TEXT,
  featured_image VARCHAR(500),
  status ENUM('draft', 'published', 'archived') DEFAULT 'draft',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  published_at TIMESTAMP NULL,
  views INT DEFAULT 0,
  INDEX idx_slug (slug),
  INDEX idx_status (status),
  INDEX idx_published (published_at),
  INDEX idx_category (category)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table: comments
CREATE TABLE IF NOT EXISTS comments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  post_id INT NOT NULL,
  parent_id INT NULL,
  author_name VARCHAR(100) NOT NULL,
  author_email VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  status ENUM('pending', 'approved', 'spam', 'rejected') DEFAULT 'pending',
  ip_address VARCHAR(45),
  user_agent VARCHAR(500),
  honeypot_field VARCHAR(255) DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
  FOREIGN KEY (parent_id) REFERENCES comments(id) ON DELETE CASCADE,
  INDEX idx_post (post_id),
  INDEX idx_status (status),
  INDEX idx_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table: admin_users
CREATE TABLE IF NOT EXISTS admin_users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  role ENUM('admin', 'editor') DEFAULT 'editor',
  last_login TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_username (username)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table: settings
CREATE TABLE IF NOT EXISTS settings (
  id INT AUTO_INCREMENT PRIMARY KEY,
  setting_key VARCHAR(100) UNIQUE NOT NULL,
  setting_value TEXT,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_key (setting_key)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert default admin user
-- IMPORTANT: The hash below is a placeholder. Run scripts/create-admin.php to set a real password.
-- Do NOT use this default in production.
-- INSERT INTO admin_users ... (disabled intentionally — run create-admin.php)

-- Table: login_attempts (brute-force protection)
CREATE TABLE IF NOT EXISTS login_attempts (
  id INT AUTO_INCREMENT PRIMARY KEY,
  ip_address VARCHAR(45) NOT NULL,
  attempted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_ip_time (ip_address, attempted_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert default settings
INSERT INTO settings (setting_key, setting_value) VALUES
('site_title', 'Slaapyhoofd'),
('site_description', 'Blog about programming, LEGO, traveling, DIY, Home Assistant, home lab, and green energy'),
('posts_per_page', '10'),
('comments_enabled', '1'),
('comments_require_moderation', '1')
ON DUPLICATE KEY UPDATE setting_key=setting_key;

-- Create some sample data (optional, for testing)
-- INSERT INTO posts (slug, title, excerpt, content, markdown_content, category, tags, status, published_at) VALUES
-- ('welcome-to-my-blog', 'Welcome to My Blog', 'This is the first post on my new blog!', '<p>This is the first post on my new blog!</p>', '# Welcome\n\nThis is the first post on my new blog!', 'General', 'welcome,first-post', 'published', NOW());
