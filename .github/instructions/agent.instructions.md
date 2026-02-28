---
applyTo: '**'
---

# AI Instructions: Slaapyhoofd.nl Blog Project

## Project Context
Building an ultra-fast, lightweight blog for slaapyhoofd.nl focusing on programming, LEGO, traveling, DIY, Home Assistant, home lab, and green energy topics.

## Core Requirements
- **Performance First**: Ultra-fast loading, static generation, minimal JavaScript
- **Lightweight**: No heavy frameworks like Next.js or Tailwind
- **Bot-Safe Comments**: Honeypot + rate limiting
- **Easy Theme Updates**: Color palette via CSS variables only
- **Accessible**: WCAG 2.1 AA compliant throughout

## Technology Stack

### Frontend
- **React 19.2** with TypeScript — use React 19 patterns exclusively (see below)
- **Vite** as build tool (fast dev server, optimized production builds)
- **Plain CSS** with CSS variables (no Tailwind/Bootstrap/CSS Modules)
- **Vitest** + React Testing Library for unit tests (123 tests, 100% passing)
- **Static Site Generation**: Custom implementation generating static HTML from blog posts

### Backend
- **PHP 8+** for API endpoints (Cloud86 hosting)
- **MySQL** for data storage (posts, comments, users, login_attempts)
- **REST API** with session-based auth + CSRF tokens

### Deployment
- **Docker** for local development (MySQL + PHP/Apache + phpMyAdmin)
- **FTP deployment** to Cloud86 (credentials in .env)
- Target: `/slaapyhoofd.nl` directory

---

## React 19.2 Patterns (MANDATORY)

### Context — no `.Provider` wrapper
```tsx
// ✅ React 19
return <AuthContext value={...}>{children}</AuthContext>;
// ❌ Old pattern
return <AuthContext.Provider value={...}>{children}</AuthContext.Provider>;
```

### Forms — `useActionState` + `useFormStatus`
```tsx
// ✅ React 19 — server actions / form state
const [state, formAction, isPending] = useActionState(submitFn, initialState);
// Use useFormStatus inside a form child component for pending state
```
> **Do NOT** create `useXxxForm` custom hooks for form state — use `useActionState` directly.

### Metadata — hoisted automatically
```tsx
// ✅ React 19 — tags inside any component are hoisted to <head>
return (
  <article>
    <title>Post Title - Slaapyhoofd</title>
    <meta name="description" content="..." />
  </article>
);
```

### Imports — named only, no default React import
```tsx
// ✅
import { useState, useEffect, useMemo } from 'react';
import { StrictMode } from 'react';
// ❌
import React from 'react';
```

---

## Color Palette (CSS Variables)
All colors are WCAG AA contrast-compliant. **Never hardcode color values — use variables only.**

```css
:root {
  /* Primary Colors */
  --color-primary: #2d5a3d;        /* Dark forest green — 7.95:1 on white */
  --color-primary-light: #3a7050;  /* Lighter forest green */
  --color-primary-dark: #1f4029;   /* Darker forest green */

  /* Secondary Colors */
  --color-secondary: #f5f4f0;      /* Off-white/cream */
  --color-secondary-dark: #e8e6e0; /* Slightly darker cream */

  /* Accent Colors */
  --color-accent: #d4a5a5;         /* Soft pink/coral */
  --color-accent-hover: #c89090;   /* Darker pink on hover */

  /* Neutral Colors */
  --color-text: #2a2a2a;           /* Almost black — 14.35:1 on white */
  --color-text-light: #666666;     /* Gray text — 5.74:1 on white */
  --color-text-lighter: #767676;   /* Light gray — 4.54:1 on white (AA minimum) */
  --color-background: #ffffff;
  --color-border: #e0e0e0;

  /* UI States — all darkened for WCAG AA compliance */
  --color-success: #2e7d32;        /* Dark green */
  --color-error: #c62828;          /* Dark red */
  --color-warning: #e65100;        /* Dark orange (use with large/bold text only) */

  /* Spacing */
  --spacing-xs: 0.25rem;
  --spacing-sm: 0.5rem;
  --spacing-md: 1rem;
  --spacing-lg: 1.5rem;
  --spacing-xl: 2rem;
  --spacing-2xl: 3rem;

  /* Typography */
  --font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
  --font-mono: 'Courier New', Courier, monospace;
  --font-size-base: 16px;
  --line-height-base: 1.6;
}
```

---

## Database Schema

### Table: `posts`
```sql
CREATE TABLE posts (
  id INT AUTO_INCREMENT PRIMARY KEY,
  slug VARCHAR(255) UNIQUE NOT NULL,
  title VARCHAR(255) NOT NULL,
  excerpt TEXT,
  content LONGTEXT NOT NULL,         -- stores escaped markdown (client renders markdown_content)
  markdown_content LONGTEXT NOT NULL, -- source of truth for rendering
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
```

> **Important**: `markdown_content` is the source of truth. The frontend always renders via `useMarkdown(post.markdown_content)`. The `content` field stores sanitized escaped markdown as a plain-text fallback only.

### Table: `comments`
```sql
CREATE TABLE comments (
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
```

### Table: `admin_users`
```sql
CREATE TABLE admin_users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  role ENUM('admin', 'editor') DEFAULT 'editor',
  last_login TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_username (username)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

### Table: `settings`
```sql
CREATE TABLE settings (
  id INT AUTO_INCREMENT PRIMARY KEY,
  setting_key VARCHAR(100) UNIQUE NOT NULL,
  setting_value TEXT,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_key (setting_key)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

### Table: `login_attempts` *(brute-force protection)*
```sql
CREATE TABLE login_attempts (
  id INT AUTO_INCREMENT PRIMARY KEY,
  ip_address VARCHAR(45) NOT NULL,
  attempted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_ip_time (ip_address, attempted_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

---

## Project Structure

```
slaapyhoofd-nl/
├── .env                          # Environment config (not in git)
├── .github/instructions/         # AI agent instructions (this file)
├── docker-compose.yml
├── Dockerfile
├── package.json
├── vite.config.ts
├── tsconfig.json
├── vitest.config.ts
├── index.html
│
├── src/
│   ├── main.tsx                  # React entry point (StrictMode)
│   ├── App.tsx                   # Routing, RouteAnnouncer, skip link target
│   ├── config.ts
│   │
│   ├── components/
│   │   ├── Header/               # Header.tsx + Header.css + Header.test.tsx
│   │   ├── Footer/
│   │   ├── PostCard/             # PostCard.tsx — "Read more" has aria-label
│   │   ├── CommentSection/       # Renders approved nested comments
│   │   ├── CommentForm/          # useActionState + useFormStatus (React 19)
│   │   └── ProtectedRoute/       # Auth guard with lang="en" wrapper
│   │
│   ├── contexts/
│   │   ├── AuthContext.tsx        # login/logout/checkAuth + setCsrfToken()
│   │   ├── PostEditorContext.tsx  # All editor state; auto-generates excerpt
│   │   └── CommentModerationContext.tsx
│   │
│   ├── pages/
│   │   ├── Home/                 # Home.tsx + useHome.ts
│   │   ├── BlogPost/             # BlogPost.tsx + useBlogPost.ts
│   │   ├── Admin/
│   │   │   ├── Login/
│   │   │   ├── Dashboard/
│   │   │   ├── PostsList/
│   │   │   ├── PostEditor/       # EditorContent + EditorSidebar + ImageUploader
│   │   │   └── CommentModeration/
│   │   └── NotFound/
│   │
│   ├── hooks/
│   │   ├── useAuth.ts            # Consumes AuthContext
│   │   └── useMarkdown.ts        # renderMarkdown → sanitizeHtml (XSS safe)
│   │
│   ├── services/
│   │   ├── api.ts                # fetchAPI + CSRF token management (setCsrfToken)
│   │   ├── posts.ts
│   │   ├── comments.ts
│   │   └── auth.ts
│   │
│   ├── utils/
│   │   ├── markdown.ts           # renderMarkdown, sanitizeHtml, generateExcerpt, markdownToPlainText
│   │   ├── validation.ts         # validateRequired, validateEmail, validateMinLength, validateMaxLength
│   │   ├── dateFormat.ts
│   │   └── slugify.ts
│   │
│   ├── types/
│   │   ├── post.ts
│   │   ├── comment.ts
│   │   ├── user.ts
│   │   └── api.ts                # ApiResponse<T>
│   │
│   └── styles/
│       ├── variables.css         # All CSS custom properties (single source of truth)
│       ├── reset.css
│       └── global.css            # Focus rings (:focus-visible), skip link, reduced motion
│
├── api/
│   ├── config/
│   │   ├── database.php          # PDO singleton, utf8mb4
│   │   └── cors.php              # Strict allowlist — no fallback for unknown origins
│   │
│   ├── endpoints/
│   │   ├── posts.php             # Public: GET /api/posts, /api/posts/:slug
│   │   ├── comments.php          # Public: GET/POST /api/comments
│   │   ├── admin-posts.php       # Admin: full CRUD — CSRF validated
│   │   ├── admin-comments.php    # Admin: PUT/DELETE — CSRF validated
│   │   ├── auth.php              # POST /api/auth/login (rate limited), /logout, /me
│   │   └── upload.php            # POST /api/upload — finfo MIME validation
│   │
│   ├── middleware/
│   │   └── auth.php              # Session auth + CSRF generation + session_regenerate_id
│   │
│   └── utils/
│       ├── response.php          # jsonResponse, successResponse, errorResponse helpers
│       └── validation.php        # validateRequired, validateEmail, sanitizeHtml (strips on* attrs)
│
├── public/
│   └── uploads/                  # Blog images (served at /uploads/)
│
├── scripts/
│   ├── build-static.ts
│   ├── deploy.ts
│   └── db-setup.sql              # All 5 tables — no default admin password (run create-admin.php)
│
└── docker/
    └── php/                      # PHP/Apache Docker config
```

---

## Development Guidelines

### React Component Patterns
1. **Functional components only** with hooks
2. **TypeScript** for all components with proper prop types
3. **Plain CSS** per component folder (no CSS Modules, no Tailwind)
4. **Minimal re-renders**: use `useMemo`, `useCallback` wisely
5. **React 19 patterns**: `useActionState` for forms, context without `.Provider`, named imports

### Component Architecture Rules
1. **Folder Structure**: Each component in its own folder
   ```
   components/Header/
   ├── Header.tsx
   ├── Header.css
   └── Header.test.tsx
   ```

2. **Complexity Threshold**:
   - Simple (<100 lines, <3 state vars): No context needed
   - Medium (100–200 lines, 3–5 state vars): Consider custom hook
   - Complex (>200 lines, >5 state vars): Mandatory context extraction

3. **Separation of Concerns**:
   - Components → UI rendering only
   - Contexts → state management and business logic
   - Services → API communication
   - Utils → pure helper functions (no side effects)
   - Hooks → reusable stateful logic

### Accessibility Rules (WCAG 2.1 AA — enforced)
- All interactive elements must have visible `:focus-visible` ring (`3px solid var(--color-primary)`)
- All form inputs must have associated `<label htmlFor>` / `id`
- All icon-only buttons must have `aria-label`
- Decorative SVGs must have `aria-hidden="true" focusable="false"`
- Loading states must use `role="status"` wrapper + `aria-hidden="true"` on spinner
- Filter/toggle buttons must have `aria-pressed`
- Skip link (`#main-content`) must be present in every page shell
- SPA route changes must be announced via `RouteAnnouncer` in `App.tsx`
- `autoComplete` required on all name/email/username/password inputs
- No `outline: none` without a replacement focus indicator
- Color alone must never convey meaning — pair with icon or text label

### API / CSRF Flow
All admin mutations (POST, PUT, DELETE) require an `X-CSRF-Token` header:

1. On login or page load → `/api/auth/me` returns `csrf_token`
2. `AuthContext` calls `setCsrfToken(token)` from `src/services/api.ts`
3. `fetchAPI()` automatically attaches `X-CSRF-Token` header for mutating methods
4. PHP validates via `validateCSRFToken($_SERVER['HTTP_X_CSRF_TOKEN'])`

### PHP Backend Rules
- All queries use PDO prepared statements — no string interpolation in SQL
- `per_page` parameter must be capped: `max(1, min((int)$_GET['per_page'], 100))`
- All JSON input: check `is_array($input)` after `json_decode()` before accessing fields
- File uploads: validate MIME via `finfo_file()` + `getimagesize()`, derive extension from MIME
- Login endpoint: max 5 attempts per IP per 15 min (tracked in `login_attempts` table)
- CSRF: validate on all admin POST/PUT/DELETE; skip for GET and `/auth/logout`
- Session: `session_regenerate_id(true)` called in `setAuthSession()` (session fixation prevention)
- `session.cookie_secure` auto-detected from `$_SERVER['HTTPS']`

### Bot Protection for Comments
1. Hidden honeypot field `website` (CSS: `display: none`) — server rejects if filled
2. Rate limiting: max 3 comments per IP per 10 minutes
3. Server-side validation: required fields, email format, min 10 chars content

### Utility Functions in Use
| Function | Location | Used in |
|----------|----------|---------|
| `renderMarkdown` | `utils/markdown.ts` | `useMarkdown` hook |
| `sanitizeHtml` | `utils/markdown.ts` | `useMarkdown` hook (XSS protection) |
| `generateExcerpt` | `utils/markdown.ts` | `PostEditorContext` (auto-fill when empty) |
| `markdownToPlainText` | `utils/markdown.ts` | `generateExcerpt` internally |
| `validateRequired` | `utils/validation.ts` | `CommentForm`, `PostEditorContext` |
| `validateEmail` | `utils/validation.ts` | `CommentForm` |
| `validateMinLength` | `utils/validation.ts` | `CommentForm` (min 10 chars) |
| `validateMaxLength` | `utils/validation.ts` | `CommentForm` |
| `slugify` | `utils/slugify.ts` | `PostEditorContext` |
| `formatDate` | `utils/dateFormat.ts` | `PostCard`, `BlogPost` |

### Security Checklist
- ✅ SQL injection prevention (PDO prepared statements, `EMULATE_PREPARES = false`)
- ✅ XSS: `sanitizeHtml()` in `useMarkdown` (JS) + strips `on*` attrs + `javascript:` URIs (PHP)
- ✅ CSRF tokens: issued on login/checkAuth, validated on all admin mutations
- ✅ Password hashing: `password_hash()` / `password_verify()` (bcrypt)
- ✅ Session fixation prevention: `session_regenerate_id(true)` on login
- ✅ Brute-force protection: max 5 login attempts/IP/15 min
- ✅ Rate limiting: max 3 comments/IP/10 min
- ✅ Honeypot: bot detection on comment form
- ✅ File upload: `finfo_file()` MIME validation + `getimagesize()` + MIME-derived extension
- ✅ CORS: strict allowlist, no fallback for unknown origins
- ✅ `httponly`, `SameSite=None`, `secure` auto-detected cookies
- ✅ Input validation: frontend (React) + backend (PHP)

---

## Build & Deployment Process

### Development (Docker — recommended)
```bash
docker-compose up -d   # MySQL + PHP/Apache + phpMyAdmin
npm run dev            # Vite dev server at http://localhost:3000
```

### Development (local PHP)
```bash
npm run dev            # Vite dev server
cd api && php -S localhost:8000
```

### Testing
```bash
npm test               # Run all tests once (123 tests)
npm run test:watch     # Watch mode
npm run test:coverage  # Coverage report
```

### Production Build & Deploy
```bash
npm run build          # Build React app
npm run deploy         # Build + FTP upload to Cloud86
```

---

## Environment Variables
```env
# .env — never commit this file

# FTP (deployment)
FTP_HOST=hosturl
FTP_USER=username
FTP_PASS=<password>
FTP_PATH=/path

# PHP (server-side via Apache SetEnv or .htaccess)
DB_HOST=localhost
DB_NAME=slaapyhoofd_db
DB_USER=slaapyhoofd
DB_PASS=<password>
```

---

## API Endpoints Reference

### Public (no auth)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/posts` | Published posts (paginated, max 100/page) |
| GET | `/api/posts/:slug` | Single post + increments view count |
| GET | `/api/comments?post_id=:id` | Approved comments (nested tree) |
| POST | `/api/comments` | Submit comment (honeypot + rate limit) |

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/login` | Login (rate limited: 5/IP/15 min) |
| POST | `/api/auth/logout` | Logout |
| GET | `/api/auth/me` | Current user + refresh CSRF token |

### Admin (session + CSRF required)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/admin/posts` | All posts incl. drafts |
| GET | `/api/admin/posts?id=:id` | Single post |
| POST | `/api/admin/posts` | Create post |
| PUT | `/api/admin/posts/:id` | Update post |
| DELETE | `/api/admin/posts/:id` | Delete post |
| GET | `/api/admin/comments` | All comments |
| PUT | `/api/admin/comments/:id` | Update comment status |
| DELETE | `/api/admin/comments/:id` | Delete comment |
| POST | `/api/upload` | Upload image (finfo MIME validated) |

---

## Code Style & Conventions
- **Indentation**: 2 spaces
- **Quotes**: Single quotes in TS/TSX, double for HTML attributes
- **Naming**: PascalCase components, camelCase functions/variables, UPPER_SNAKE_CASE constants, kebab-case CSS classes
- **File naming**: PascalCase for components, camelCase for utilities/hooks
- **Comments**: Only where logic needs clarification — no decorative comments

---

## Performance Targets
- Bundle size: <300KB gzipped
- Time to Interactive: <3s on 3G
- WCAG 2.1 AA: fully compliant
- Mobile-first responsive design

---

**Last Updated**: February 27, 2026
**React Version**: 19.2
**Test Suite**: 123/123 passing
