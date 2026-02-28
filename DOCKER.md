# Docker Development Environment

This project includes Docker support for local development with PHP and MySQL.

## Quick Start

### Prerequisites
- Docker Desktop installed and running
- Docker Compose V2

### Configuration

All configuration is in the `.env` file. Key variables:

```env
# Database
DB_HOST=db
DB_NAME=slaapyhoofd_db
DB_USER=slaapyhoofd
DB_PASS=local_dev_password_123
MYSQL_ROOT_PASSWORD=root_secure_password

# Admin Credentials (for blog post creation)
ADMIN_USERNAME=admin
ADMIN_PASSWORD=admin123
ADMIN_EMAIL=admin@slaapyhoofd.nl

# Docker Ports (optional)
MYSQL_PORT=3306
API_PORT=8080
PHPMYADMIN_PORT=8081
```

### Start the Development Environment

```bash
# Start all services (MySQL, PHP/Apache, phpMyAdmin)
npm run docker:up

# Or manually:
docker-compose up -d

# View logs
npm run docker:logs

# Stop all services
npm run docker:down

# Stop and remove all data (including database)
docker-compose down -v
```

## Services

### 1. MySQL Database
- **URL**: `localhost:3306`
- **Database**: `slaapyhoofd_db`
- **User**: `slaapyhoofd`
- **Password**: `local_dev_pass`
- **Root Password**: `root_password`

The database is automatically initialized with the schema from `scripts/db-setup.sql`.

### 2. PHP API Server (Apache)
- **URL**: `http://localhost:8080`
- **API Endpoints**: `http://localhost:8080/api/posts`, etc.
- **Document Root**: `/var/www/html`

### 3. phpMyAdmin (Database Management)
- **URL**: `http://localhost:8081`
- **Server**: `db`
- **Username**: `slaapyhoofd`
- **Password**: `local_dev_pass`

### 4. React Frontend (Vite)
The frontend runs on your host machine (not in Docker):

```bash
npm run dev
```

- **URL**: `http://localhost:3000`
- **API Proxy**: Automatically proxies `/api` requests to `http://localhost:8080`

## Development Workflow

### Option 1: Full Docker Stack

```bash
# Terminal 1: Start Docker services (MySQL + PHP)
docker-compose up -d

# Terminal 2: Start Vite dev server
npm run dev
```

Then access:
- Frontend: http://localhost:3000
- API Direct: http://localhost:8080/api
- phpMyAdmin: http://localhost:8081

### Option 2: Docker Database Only

If you prefer to run PHP locally:

```bash
# Start only MySQL
docker-compose up db -d

# In another terminal, run PHP built-in server
cd api
php -S localhost:8000

# Update vite.config.ts proxy target to localhost:8000
```

## Environment Variables

All configuration is managed in `.env`:

**Database Configuration:**
```env
DB_HOST=db                          # Docker service name
DB_NAME=slaapyhoofd_db             # Database name
DB_USER=slaapyhoofd                # Database user
DB_PASS=local_dev_password_123     # Database password
MYSQL_ROOT_PASSWORD=root_secure    # MySQL root password
```

**Admin User:**
```env
ADMIN_USERNAME=admin                # Admin login username
ADMIN_PASSWORD=admin123             # Admin login password (CHANGE THIS!)
ADMIN_EMAIL=admin@slaapyhoofd.nl   # Admin email
```

**Ports (Optional):**
```env
MYSQL_PORT=3306                    # MySQL port on host
API_PORT=8080                      # API port on host
PHPMYADMIN_PORT=8081              # phpMyAdmin port on host
```

The PHP code reads these via `getenv()` in `api/config/database.php`.

## Docker Commands

```bash
# Start services
docker-compose up -d

# View running containers
docker-compose ps

# View logs
docker-compose logs -f api      # API logs
docker-compose logs -f db       # MySQL logs

# Restart a service
docker-compose restart api

# Stop services
docker-compose stop

# Remove services and volumes
docker-compose down -v

# Rebuild containers after Dockerfile changes
docker-compose build --no-cache
docker-compose up -d

# Execute commands in containers
docker-compose exec db mysql -u slaapyhoofd -plocal_dev_pass slaapyhoofd_db
docker-compose exec api bash
```

## Database Management

### Using phpMyAdmin
1. Go to http://localhost:8081 (or your configured `PHPMYADMIN_PORT`)
2. Login with credentials from `.env` (`DB_USER` / `DB_PASS`)
3. Select your database (`DB_NAME` from `.env`)

### Using MySQL CLI
```bash
# From host (if MySQL client installed)
mysql -h 127.0.0.1 -P 3306 -u slaapyhoofd -p slaapyhoofd_db
# Enter password from .env DB_PASS when prompted

# From Docker container
docker-compose exec db mysql -u slaapyhoofd -p slaapyhoofd_db
# Enter password from .env DB_PASS when prompted
```

### Reset Database
```bash
# Stop and remove all volumes
docker-compose down -v

# Start again (will re-run init.sql)
docker-compose up -d
```

## Troubleshooting

### Port Conflicts
If ports 3306, 8080, or 8081 are already in use, edit `.env`:

```env
MYSQL_PORT=3307
API_PORT=8090
PHPMYADMIN_PORT=8082
```

### Database Connection Issues
```bash
# Check if database is healthy
docker-compose ps

# View database logs
docker-compose logs db

# Test connection with credentials from .env
docker-compose exec db mysqladmin -u slaapyhoofd -p ping
```

### API Not Working
```bash
# Check API logs
docker-compose logs api

# Restart API service
docker-compose restart api

# Check Apache error log
docker-compose exec api tail -f /var/log/apache2/error.log
```

### File Permission Issues (Linux/Mac)
```bash
# Fix uploads directory permissions
docker-compose exec api chown -R www-data:www-data /var/www/html/public/uploads
```

## Production Deployment

Docker is for **local development only**. For production, use the FTP deployment:

```bash
npm run deploy
```

This will deploy to your Cloud86 server (configured in `.env`).

## File Structure

```
docker/
├── apache.conf          # Apache virtual host configuration

docker-compose.yml       # Docker services configuration (reads from .env)
.env                     # All environment variables
Dockerfile              # PHP Apache image build
```

## Volumes

- `db_data`: Persists MySQL database between restarts
- `./api`: Mounted for live code reloading
- `./public/uploads`: Shared uploads directory

## Network

All services are connected via the `slaapyhoofd-network` bridge network, allowing them to communicate using service names (e.g., `db`, `api`).

---

**Note**: Remember to update your `.env` file when deploying to production with the actual server credentials!
