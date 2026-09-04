# FieldHQ Backend — Production Deployment

This document covers Docker + Docker Compose deployment of the NestJS API on an Ubuntu 24.04 LTS VPS, with Nginx as a separate reverse proxy on the host.

## Architecture

| Component | Details |
|-----------|---------|
| API container | `fieldhq-api` — NestJS on port 3000, bound only to `127.0.0.1:3000` |
| MySQL container | `fieldhq-mysql` — MySQL 8.4, **not** published to the host |
| DB volume | Docker named volume `fieldhq_mysql_data` |
| Uploads | Host bind mount `./uploads` → `/app/uploads` |
| Reverse proxy | Host Nginx → `http://127.0.0.1:3000` |
| App path on VPS | `/opt/fieldhq` |

---

## 1. Required VPS packages

```bash
sudo apt update
sudo apt install -y ca-certificates curl git nginx

# Docker Engine + Compose plugin (official install)
curl -fsSL https://get.docker.com | sudo sh
sudo usermod -aG docker "$USER"
# Log out and back in (or newgrp docker) so docker works without sudo
```

Verify:

```bash
docker --version
docker compose version
git --version
nginx -v
```

---

## 2. Required directory

```bash
sudo mkdir -p /opt/fieldhq
sudo chown "$USER":"$USER" /opt/fieldhq
```

---

## 3. Clone the repository on the VPS

```bash
git clone https://github.com/000Ahsan/cwt-backend.git /opt/fieldhq
cd /opt/fieldhq
git checkout main
```

> **Note:** This repository’s default remote branch has historically been `master`. CI deploys from `main`. Create/push a `main` branch (or rename `master` → `main`) before relying on GitHub Actions.

---

## 4. Required production `.env`

Create `/opt/fieldhq/.env` from the example (**do not commit this file**):

```bash
cd /opt/fieldhq
cp .env.example .env
nano .env   # or vim
```

Set strong secrets. Critical values:

```env
NODE_ENV=production
PORT=3000

MYSQL_ROOT_PASSWORD=<strong-root-password>
MYSQL_PASSWORD=<strong-app-password>

# Hostname must be `mysql` inside Docker Compose
DATABASE_URL=mysql://fieldhq:<strong-app-password>@mysql:3306/fieldhq

JWT_ACCESS_SECRET=<long-random-string>
JWT_REFRESH_SECRET=<long-random-string>

ALLOWED_ORIGINS=https://app.fieldhqapp.com

UPLOAD_DIR=/app/uploads

CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
```

Notes:

- `MYSQL_PASSWORD` in `.env` must match the password embedded in `DATABASE_URL`.
- Avoid `@`, `:`, `/`, `?`, `#` in DB passwords (or URL-encode them in `DATABASE_URL`).
- GitHub Actions **never** overwrites `/opt/fieldhq/.env`.

Also create the uploads directory (API container runs as the `node` user, typically UID/GID 1000):

```bash
mkdir -p /opt/fieldhq/uploads
sudo chown -R 1000:1000 /opt/fieldhq/uploads
```

---

## 5. Required GitHub repository secrets

In the GitHub repo → **Settings → Secrets and variables → Actions**, create:

| Secret | Purpose |
|--------|---------|
| `SERVER_HOST` | VPS hostname or IP |
| `SERVER_USER` | SSH user (e.g. `deploy` or `ubuntu`) |
| `SERVER_SSH_KEY` | Private SSH key for that user (full PEM) |
| `SERVER_PORT` | Optional; SSH port (defaults to `22` if unset) |

Do **not** store database passwords, JWT secrets, or Cloudinary keys in GitHub Actions. Those live only in `/opt/fieldhq/.env`.

SSH key setup example on the VPS:

```bash
# On your laptop: generate a deploy key (no passphrase for Actions, or use an agent-compatible setup)
ssh-keygen -t ed25519 -f fieldhq_deploy -C "fieldhq-github-actions"

# On VPS: install the public key
mkdir -p ~/.ssh
chmod 700 ~/.ssh
echo "<contents of fieldhq_deploy.pub>" >> ~/.ssh/authorized_keys
chmod 600 ~/.ssh/authorized_keys

# In GitHub: set SERVER_SSH_KEY to the private key contents (fieldhq_deploy)
```

---

## 6. First manual deployment

```bash
cd /opt/fieldhq

# Confirm .env exists and uploads dir exists
test -f .env && test -d uploads

# Build API image
docker compose build api

# Start MySQL and wait until healthy
docker compose up -d mysql
docker compose ps

# Apply production migrations (fails the deploy if this fails)
docker compose run --rm api npx prisma migrate deploy

# Start API
docker compose up -d api

# Status
docker compose ps
```

---

## 7. How GitHub Actions deploys afterward

On every push to `main`, `.github/workflows/deploy.yml`:

1. SSHs into the VPS  
2. `cd /opt/fieldhq` and `git pull --ff-only origin main`  
3. `docker compose build api`  
4. Ensures MySQL is running/healthy  
5. `docker compose run --rm api npx prisma migrate deploy`  
6. `docker compose up -d --force-recreate --no-deps api`  
7. Prunes unused images (**not** volumes)  
8. Verifies `http://127.0.0.1:3000/` responds  

The workflow does **not** touch `.env` and never runs `docker compose down -v` or volume prune.

---

## 8. Inspect logs

```bash
cd /opt/fieldhq
docker compose logs -f api
docker compose logs -f mysql
docker compose logs --tail=200 api
```

---

## 9. Restart API

```bash
cd /opt/fieldhq
docker compose restart api
# or recreate:
docker compose up -d --force-recreate --no-deps api
```

---

## 10. Check MySQL

```bash
cd /opt/fieldhq
docker compose ps mysql
docker inspect --format='{{.State.Health.Status}}' fieldhq-mysql

# Open a MySQL shell inside the network (not exposed on the host)
docker compose exec mysql mysql -ufieldhq -p fieldhq
```

---

## 11. How Prisma migrations are deployed

Production uses:

```bash
docker compose run --rm api npx prisma migrate deploy
```

Never use `prisma migrate dev` or `prisma db push` on production.

Migrations live under `prisma/migrations/` and are baked into the API image.

---

## 12. How uploads are persisted

```yaml
# docker-compose.yml
volumes:
  - ./uploads:/app/uploads
```

Files under `/opt/fieldhq/uploads` on the host survive API container rebuilds and recreations. They are **not** stored in the image (see `.dockerignore`).

Most new photo uploads go to Cloudinary; the app also serves `/uploads` statically from this directory for legacy/local files.

---

## 13. Rollback an application deployment

Database volumes are never removed. To roll back the **application** only:

```bash
cd /opt/fieldhq

# Option A — redeploy a previous git revision
git fetch origin
git checkout <previous-commit-sha>
docker compose build api
docker compose run --rm api npx prisma migrate deploy   # only if that revision’s migrations are compatible
docker compose up -d --force-recreate --no-deps api
git checkout main   # return branch pointer when ready

# Option B — run a previously built image tag (if you tagged builds)
# docker images | grep fieldhq
# docker tag <old-image-id> fieldhq-api:rollback
# then adjust compose temporarily or retag and up -d
```

**Warning:** Do not roll forward/back across incompatible migrations without a DB backup. Never delete `fieldhq_mysql_data`.

Backup MySQL before risky changes:

```bash
docker compose exec mysql mysqldump -uroot -p"$MYSQL_ROOT_PASSWORD" fieldhq > backup-$(date +%F).sql
```

---

## Nginx reverse proxy (host)

Example site config (API only; TLS via Certbot as you prefer):

```nginx
server {
    listen 80;
    server_name api.fieldhqapp.com;

    client_max_body_size 50M;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

---

## Verify the API

From the VPS:

```bash
curl -sS http://127.0.0.1:3000/
# Expected: Hello World!

docker compose ps
# fieldhq-api and fieldhq-mysql should be Up; mysql healthy
```

Swagger (if exposed through Nginx): `/api-docs`

There is **no** dedicated `/health` endpoint in this codebase; verification uses `GET /`.
