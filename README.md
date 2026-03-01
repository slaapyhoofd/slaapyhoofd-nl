# Slaapyhoofd.nl Blog

![CI](https://github.com/slaapyhoofd/slaapyhoofd-nl/actions/workflows/ci.yml/badge.svg)
![Deploy](https://github.com/slaapyhoofd/slaapyhoofd-nl/actions/workflows/deploy.yml/badge.svg)
![Tests](https://img.shields.io/badge/tests-123%20passing-brightgreen)
![Node](https://img.shields.io/badge/node-%3E%3D20-blue)
![React](https://img.shields.io/badge/react-19.2-61dafb)
![License](https://img.shields.io/badge/license-MIT-green)

Ultra-fast, lightweight personal blog built with React 19.2, TypeScript, Vite, and PHP 8.

Topics: programming, LEGO, traveling, DIY, Home Assistant, home lab, and green energy.

## Features

- 🚀 Static HTML generation for instant page loads
- 💚 Dark forest green theme via CSS variables — easy to retheme
- 📝 Markdown-based blog posts with live preview editor
- 💬 Bot-safe commenting (honeypot + IP rate limiting)
- ♿ WCAG 2.1 AA accessible (skip link, focus rings, screen reader announcements)
- 🔒 Hardened PHP backend (CSRF, brute-force protection, MIME validation)
- 📱 Mobile-first responsive design
- 🐳 Docker for local development

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19.2, TypeScript, Vite |
| Routing | React Router v6 |
| Styling | Plain CSS + CSS custom properties |
| Testing | Vitest + React Testing Library (123 tests) |
| Backend | PHP 8+, PDO, MySQL |
| Auth | Session-based + CSRF tokens |
| Deployment | FTP to Cloud86 |

## Getting Started

### Prerequisites
- Node.js 20+
- Docker Desktop (recommended) — or PHP 8+ and MySQL 5.7+

### Installation

```bash
git clone https://github.com/slaapyhoofd/slaapyhoofd-nl.git
cd slaapyhoofd-nl
npm install
```

### Development with Docker (recommended)

```bash
# Start MySQL + PHP/Apache + phpMyAdmin
docker-compose up -d

# Start React dev server
npm run dev
```

| URL | Service |
|-----|---------|
| http://localhost:3000 | Frontend (Vite) |
| http://localhost:8080/api | PHP API |
| http://localhost:8081 | phpMyAdmin |

See [DOCKER.md](DOCKER.md) for full Docker documentation.

### Development without Docker

```bash
npm run dev              # Vite dev server
cd api && php -S localhost:8000   # PHP API server
```

### Database Setup

```bash
mysql -u your_user -p your_database < scripts/db-setup.sql
```

Then create an admin user:

```bash
# Docker
docker-compose exec api php /var/www/html/scripts/create-admin.php admin yourpassword

# Local
php scripts/create-admin.php admin yourpassword
```

> **Note**: The SQL schema does not include a default admin password. You must run `create-admin.php` before logging in.

## Testing

```bash
npm test                  # Run all 123 tests once
npm run test:watch        # Watch mode
npm run test:coverage     # Coverage report
```

## Building & Deployment

```bash
npm run build             # Production build → dist/
npm run preview           # Preview production build locally
npm run typecheck         # TypeScript type-check (no emit)
```

### CI — automatic on every push and PR

Two GitHub Actions workflows run on every push to `main` or `develop` and on all pull requests:

```
lint ──────┐
typecheck ─┼──► build   (only runs when all three pass)
test ──────┘
```

| Job | Command |
|-----|---------|
| Lint | `npm run lint` + `npm run format:check` |
| Typecheck | `npm run typecheck` |
| Test | `npx vitest run` (123 tests) |
| Build | `npm run build` |

### Deploy — triggered by a GitHub Release

The deploy workflow runs automatically when you **publish a GitHub Release**, and can also
be triggered manually from the Actions tab.

#### How to release

1. Make sure CI is green on `main`
2. Go to **GitHub → Releases → Draft a new release**
3. Create a new tag (e.g. `v1.2.0`), add release notes, click **Publish release**
4. The deploy workflow starts automatically:
   - Builds the React app (`dist/`)
   - Assembles a deploy package: `dist/` + `api/` + `.htaccess` + `robots.txt` / `sitemap.xml`
   - FTPs only changed files to Cloud86 (diff-only upload)
   - `uploads/` on the server is **never touched** — user images are safe

#### What gets deployed

```
server root
├── index.html        ← React app (Vite build)
├── assets/           ← JS/CSS bundles (Vite build)
├── .htaccess         ← Apache routing + security headers
├── api/              ← PHP backend (all endpoints)
├── robots.txt        ← if present in public/
└── sitemap.xml       ← if present in public/
```

> `uploads/` is excluded from every deploy. It contains user-uploaded images that live
> only on the server.

#### Required GitHub secrets

Add these in **Settings → Secrets and variables → Actions** before the first deploy:

| Secret | Description |
|--------|-------------|
| `FTP_HOST` | FTP hostname (Cloud86) |
| `FTP_USER` | FTP username |
| `FTP_PASSWORD` | FTP password |
| `FTP_SERVER_DIR` | Remote root path, e.g. `/slaapyhoofd.nl/` |

## Project Structure

```
slaapyhoofd-nl/
├── api/                  # PHP backend
│   ├── config/           # Database (PDO singleton) & CORS (strict allowlist)
│   ├── endpoints/        # REST API endpoints
│   ├── middleware/       # Session auth + CSRF token management
│   └── utils/            # Response helpers + input validation
├── src/                  # React frontend
│   ├── components/       # Reusable UI components
│   ├── contexts/         # State management (Auth, PostEditor, CommentModeration)
│   ├── pages/            # Page components + co-located hooks
│   ├── services/         # API communication layer (CSRF-aware fetchAPI)
│   ├── hooks/            # useMarkdown (XSS-safe), useAuth
│   ├── utils/            # markdown, validation, slugify, dateFormat
│   ├── types/            # TypeScript type definitions
│   └── styles/           # variables.css, reset.css, global.css
├── scripts/              # db-setup.sql, build-static.ts, deploy.ts
├── docker/               # PHP/Apache Docker config
└── public/               # Static assets + uploads/
```

## Color Palette

Edit `src/styles/variables.css` to retheme. All colors are WCAG AA compliant:

| Variable | Value | Contrast on white |
|----------|-------|-------------------|
| `--color-primary` | `#2d5a3d` (forest green) | 7.95:1 ✅ |
| `--color-text` | `#2a2a2a` (near black) | 14.35:1 ✅ |
| `--color-text-light` | `#666666` | 5.74:1 ✅ |
| `--color-success` | `#2e7d32` | AA ✅ |
| `--color-error` | `#c62828` | AA ✅ |
| `--color-accent` | `#d4a5a5` (soft pink) | — (decorative) |

## Database Schema

Five tables — see `scripts/db-setup.sql` for the full schema:

| Table | Purpose |
|-------|---------|
| `posts` | Blog content (stores `markdown_content` as source of truth) |
| `comments` | User comments with moderation workflow |
| `admin_users` | Admin authentication (bcrypt hashed passwords) |
| `settings` | Site configuration key/value store |
| `login_attempts` | Brute-force protection tracking |

## API Endpoints

### Public

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/posts` | Published posts (paginated) |
| GET | `/api/posts/:slug` | Single post |
| GET | `/api/comments?post_id=:id` | Approved comments (nested) |
| POST | `/api/comments` | Submit comment |

### Admin (session cookie + `X-CSRF-Token` header required)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/login` | Login (5 attempts/IP/15 min limit) |
| POST | `/api/auth/logout` | Logout |
| GET | `/api/auth/me` | Current user + CSRF token |
| GET/POST | `/api/admin/posts` | List / create posts |
| GET/PUT/DELETE | `/api/admin/posts/:id` | Read / update / delete post |
| GET | `/api/admin/comments` | List all comments |
| PUT/DELETE | `/api/admin/comments/:id` | Update status / delete comment |
| POST | `/api/upload` | Upload image |

## Security Features

| Feature | Implementation |
|---------|---------------|
| SQL injection | PDO prepared statements (`EMULATE_PREPARES = false`) |
| XSS (frontend) | `sanitizeHtml()` in `useMarkdown` strips dangerous output |
| XSS (backend) | PHP `sanitizeHtml()` strips `on*` event attrs + `javascript:` URIs |
| CSRF | Tokens issued on login, validated on all admin mutations |
| Session fixation | `session_regenerate_id(true)` on every login |
| Brute force | Max 5 login attempts per IP per 15 minutes |
| Comment spam | Honeypot field + max 3 comments per IP per 10 minutes |
| File uploads | `finfo_file()` real MIME detection + `getimagesize()` verification |
| CORS | Strict origin allowlist — no fallback for unknown origins |
| Cookies | `httponly`, `SameSite=None`, `secure` auto-detected |

## Accessibility

WCAG 2.1 AA compliant:

- Skip navigation link to `#main-content`
- SPA route change announcements via `RouteAnnouncer`
- Visible `:focus-visible` rings on all interactive elements
- All form inputs have associated labels
- Loading states announced with `role="status"`
- Filter/toggle buttons use `aria-pressed`
- Decorative SVGs marked `aria-hidden="true"`
- `prefers-reduced-motion` respected
- WCAG AA contrast ratios throughout

## Environment Variables

```env
# .env — never commit

# Deployment
FTP_HOST=hosturl
FTP_USER=username
FTP_PASS=<password>
FTP_PATH=/path

# PHP (set via server or .htaccess)
DB_HOST=localhost
DB_NAME=slaapyhoofd_db
DB_USER=slaapyhoofd
DB_PASS=<password>
```

## License

MIT

## Author

Slaapyhoofd — [slaapyhoofd.nl](https://slaapyhoofd.nl)

---

For AI agent development rules, see [.github/instructions/agent.instructions.md](.github/instructions/agent.instructions.md)
