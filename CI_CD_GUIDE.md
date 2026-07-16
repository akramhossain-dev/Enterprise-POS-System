# CI/CD Guide — Enterprise POS System

Complete reference for the CI/CD pipeline.

---

## Pipeline Overview

```
Push / PR
    │
    ▼
┌─────────────────────────────────┐
│  ci.yml — Quality Gate           │  Runs on ALL branches
│  ┌──────┐ ┌────────────┐ ┌────┐ │
│  │ Lint │ │ Type Check │ │QA  │ │  ← Run in parallel
│  └──────┘ └────────────┘ └────┘ │
│  ┌─────────────────────────────┐ │
│  │ Tests (API + Web in matrix) │ │
│  └─────────────────────────────┘ │
│  ┌─────────────────────────────┐ │
│  │ Build (API + Web in matrix) │ │  ← Waits for all above
│  └─────────────────────────────┘ │
└─────────────────────────────────┘
    │ (main branch CI passes)
    ▼
┌─────────────────────────────────┐
│  docker.yml — Build & Push       │  Runs on main only
│  ┌────────────┐ ┌──────────────┐ │
│  │ Build API  │ │  Build Web   │ │  ← Parallel Docker builds
│  └────────────┘ └──────────────┘ │
│  ┌────────────────────────────┐  │
│  │ Trivy Security Scan        │  │
│  └────────────────────────────┘  │
└─────────────────────────────────┘
    │ (images pushed to GHCR)
    ▼
┌─────────────────────────────────┐
│  deploy.yml — Deploy             │
│  1. SSH to server                │
│  2. Record rollback tag          │
│  3. Pull new images              │
│  4. Run DB migrations            │
│  5. Replace containers           │
│  6. Health check (10 retries)    │
│  7a. ✅ Success → Notify         │
│  7b. ❌ Failure → Auto Rollback  │
└─────────────────────────────────┘
```

---

## Workflows

| File                           | Trigger                         | Purpose                                                |
| ------------------------------ | ------------------------------- | ------------------------------------------------------ |
| `.github/workflows/ci.yml`     | Push / PR to any branch         | Quality gate: lint, type-check, security, tests, build |
| `.github/workflows/docker.yml` | CI passes on `main`             | Build + push API and Web images to GHCR                |
| `.github/workflows/deploy.yml` | Docker build succeeds on `main` | Deploy to staging then production with rollback        |

---

## Required GitHub Secrets

Configure these in **Settings → Secrets and Variables → Actions**:

### Secrets (encrypted)

| Secret               | Required For | Description                              |
| -------------------- | ------------ | ---------------------------------------- |
| `STAGING_HOST`       | deploy.yml   | IP or hostname of staging server         |
| `STAGING_USER`       | deploy.yml   | SSH username on staging server           |
| `STAGING_SSH_KEY`    | deploy.yml   | Private SSH key (Ed25519 recommended)    |
| `PRODUCTION_HOST`    | deploy.yml   | IP or hostname of production server      |
| `PRODUCTION_USER`    | deploy.yml   | SSH username on production server        |
| `PRODUCTION_SSH_KEY` | deploy.yml   | Private SSH key for production           |
| `GITLEAKS_LICENSE`   | ci.yml       | Optional — for Gitleaks on private repos |

### Variables (plain text)

| Variable              | Example                                | Description                            |
| --------------------- | -------------------------------------- | -------------------------------------- |
| `STAGING_URL`         | `https://staging.your-domain.com`      | Staging environment URL                |
| `PRODUCTION_URL`      | `https://your-domain.com`              | Production URL                         |
| `NEXT_PUBLIC_API_URL` | `https://api.your-domain.com`          | API URL injected at Next.js build time |
| `DISCORD_WEBHOOK_URL` | `https://discord.com/api/webhooks/...` | Optional Discord notifications         |

---

## GitHub Environments

Configure two environments in **Settings → Environments**:

### `staging`

- **No protection rules** — deploys automatically after Docker build
- URL: `${{ vars.STAGING_URL }}`

### `production`

- **Required reviewers**: add at least one maintainer
- **Wait timer**: optional (e.g., 5 minutes for staging soak)
- URL: `${{ vars.PRODUCTION_URL }}`

> This means every production deploy requires a human approval click in GitHub Actions.

---

## Docker Images

Both images are published to **GitHub Container Registry (GHCR)**:

| Image | Registry Path                                        |
| ----- | ---------------------------------------------------- |
| API   | `ghcr.io/akramhossain-dev/enterprise-pos-system/api` |
| Web   | `ghcr.io/akramhossain-dev/enterprise-pos-system/web` |

### Image Tags

| Tag            | When applied                  |
| -------------- | ----------------------------- |
| `latest`       | Every push to `main`          |
| `sha-<7chars>` | Every push (commit SHA)       |
| `v1.2.3`       | When a `v*` git tag is pushed |

---

## Manual Deployment

You can trigger any workflow manually from **Actions → workflow → Run workflow**:

```bash
# Trigger Docker build manually (e.g., hot-patch)
gh workflow run docker.yml --ref main

# Deploy a specific image tag to staging
gh workflow run deploy.yml --ref main \
  -f environment=staging \
  -f image_tag=sha-abc1234

# Rollback: deploy a previous image tag
gh workflow run deploy.yml --ref main \
  -f environment=production \
  -f image_tag=sha-previousgoodsha
```

---

## Rollback Procedure

Automatic rollback fires if health checks fail after deployment.

Manual rollback:

```bash
# 1. Find the last good image tag from GHCR or the Actions run logs
# 2. Trigger deploy workflow with the old tag:
gh workflow run deploy.yml --ref main \
  -f environment=production \
  -f image_tag=sha-lastgoodsha

# Or directly on the server:
cd /opt/enterprise-pos
API_IMAGE=ghcr.io/.../api:sha-lastgoodsha \
WEB_IMAGE=ghcr.io/.../web:sha-lastgoodsha \
docker compose -f docker-compose.prod.yml up -d --no-deps api web
```

---

## Branch Protection (Configure Manually in GitHub)

Go to **Settings → Branches → Add rule** for `main`:

- ✅ Require a pull request before merging
- ✅ Require status checks to pass: `Lint`, `Type Check`, `Tests (api)`, `Tests (web)`, `Build (api)`, `Build (web)`
- ✅ Require branches to be up to date before merging
- ✅ Do not allow bypassing the above settings
