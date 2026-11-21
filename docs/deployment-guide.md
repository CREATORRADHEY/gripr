# GRIPR.STUDIO — Production Deployment Guide

## 1. Executive Summary & Live Endpoints

GRIPR.STUDIO is deployed in a high-availability, zero-maintenance split-hosting architecture:

| Component | Target Platform | Live Production URL | Region / Zone |
| :--- | :--- | :--- | :--- |
| **Public Frontend** | Cloudflare Pages | [https://gripr-studio.pages.dev](https://gripr-studio.pages.dev) | Global Edge CDN |
| **API Backend & Direct Serving** | Google Cloud Run | [https://gripr-backend-611571278421.asia-south1.run.app](https://gripr-backend-611571278421.asia-south1.run.app) | `asia-south1` (Mumbai, India) |
| **AI Intelligence Service** | Google GenAI SDK | `models/gemini-3.5-flash-lite` | Google Cloud API |
| **Persistence Engine** | Cloud Firestore / Memory | `DEMO_ONLY` Safe Mode (Active) | GCP Project `people-priorities-ai-1a433` |
| **Repository** | GitHub | [https://github.com/CREATORRADHEY/gripr](https://github.com/CREATORRADHEY/gripr) | Branch `main` |

---

## 2. Environment Configuration

### Required Environment Variables & Secrets

| Variable | Source | Production Setting | Description |
| :--- | :--- | :--- | :--- |
| `NODE_ENV` | Service Env | `production` | Strict production mode. Enforces security guards. |
| `PORT` | Cloud Run | `10000` (injected) | HTTP listening port. Container binds to `0.0.0.0`. |
| `HOST` | Service Env | `0.0.0.0` | Binds to all interfaces inside container. |
| `SERVE_STATIC` | Service Env | `true` | Allows Cloud Run to serve frontend assets directly. |
| `PERSISTENCE_MODE` | Service Env | `demo_only` | Safe container mode. Rejects real data intake with 503 to avoid data loss. |
| `DEMO_MODE` | Service Env | `true` | Enables canonical synthetic walkthroughs. |
| `GEMINI_MODEL` | Service Env | `gemini-3.5-flash-lite` | Official Google GenAI SDK extraction model. |
| `GEMINI_API_KEY` | Secret Manager | `secretKeyRef: GEMINI_API_KEY:latest` | Google Gemini API secret. Never exposed to browser. |
| `INTERNAL_AUTH_SECRET` | Secret Manager | `secretKeyRef: INTERNAL_AUTH_SECRET:latest` | Cryptographic secret for signing demo presenter session tokens. |
| `FIREBASE_PROJECT_ID` | Service Env | `people-priorities-ai-1a433` | Target GCP project identifier. |

---

## 3. Step-by-Step Google Cloud Run Deployment

### Step 1: GCP Authentication & Project Setup
```bash
gcloud auth login
gcloud config set project people-priorities-ai-1a433
```

### Step 2: Configure Secret Manager Keys
```bash
# Store Gemini API Key
echo -n "YOUR_GEMINI_API_KEY" | gcloud secrets create GEMINI_API_KEY \
  --project=people-priorities-ai-1a433 \
  --data-file=- \
  --replication-policy="automatic"

# Store Server-Side Internal Auth Secret
echo -n "YOUR_INTERNAL_SECRET" | gcloud secrets create INTERNAL_AUTH_SECRET \
  --project=people-priorities-ai-1a433 \
  --data-file=- \
  --replication-policy="automatic"
```

### Step 3: Deploy Backend Container to Cloud Run
From the root directory:
```bash
gcloud run deploy gripr-backend \
  --source . \
  --project people-priorities-ai-1a433 \
  --region asia-south1 \
  --platform managed \
  --allow-unauthenticated \
  --min-instances 0 \
  --max-instances 1 \
  --set-env-vars NODE_ENV=production,HOST=0.0.0.0,SERVE_STATIC=true,PERSISTENCE_MODE=demo_only,DEMO_MODE=true,GEMINI_MODEL=gemini-3.5-flash-lite,FIREBASE_PROJECT_ID=people-priorities-ai-1a433 \
  --set-secrets GEMINI_API_KEY=GEMINI_API_KEY:latest,INTERNAL_AUTH_SECRET=INTERNAL_AUTH_SECRET:latest \
  --quiet
```

---

## 4. Cloudflare Pages Frontend Deployment

### Step 1: Build Static Directory
```bash
node scripts/build-pages.js
```
This prepares a pristine `public/` directory containing only HTML, CSS, JS, and approved assets, rigorously excluding all backend code, credentials, or `.env` files.

### Step 2: Push to GitHub for Automated Build
```bash
git add .
git commit -m "feat(deploy): update production release"
git push origin main
```
Cloudflare Pages automatically synchronizes and deploys builds from `origin/main`.

---

## 5. Production Health & Security Verification Runbook

Run these automated curl commands to verify complete production health:

### 1. Healthcheck Verification
```bash
curl -s https://gripr-backend-611571278421.asia-south1.run.app/api/health
```
*Expected:* Status 200 with envelope:
```json
{
  "status": "ok",
  "service": "gripr-problem-intelligence-api",
  "persistence": { "engine": "DEMO_ONLY" },
  "gemini": { "configured": true, "model": "gemini-3.5-flash-lite" }
}
```

### 2. Live Demo Presenter Session Token
```bash
curl -s -X POST https://gripr-backend-611571278421.asia-south1.run.app/api/demo/session \
  -H "Content-Type: application/json" \
  -d '{}'
```
*Expected:* Status 200 with `{ "success": true, "token": "...", "role": "RESEARCHER" }`.

### 3. Live Gemini Extraction via Google GenAI SDK
```bash
# Capture session token
TOKEN=$(curl -s https://gripr-backend-611571278421.asia-south1.run.app/api/demo/session | grep -o '"token":"[^"]*' | cut -d'"' -f4)

# Execute Live Gemini inference
curl -s -X POST https://gripr-backend-611571278421.asia-south1.run.app/api/demo/live-gemini-analysis \
  -H "Content-Type: application/json" \
  -H "Origin: https://gripr-studio.pages.dev" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"packetId":"PKT-401"}'
```
*Expected:* Status 200 with `{ "success": true, "mode": "LIVE_GEMINI", "modelUsed": "gemini-3.5-flash-lite", ... }`.

### 4. Security Regression Gate Check (Unauthenticated Abuse Block)
```bash
curl -s -i -X POST https://gripr-backend-611571278421.asia-south1.run.app/api/demo/live-gemini-analysis \
  -H "Content-Type: application/json" \
  -d '{"packetId":"PKT-401"}'
```
*Expected:* `HTTP/2 401 UNAUTHORIZED`. Confirms that requests without token or trusted origin remain strictly blocked.

### 5. Safe Persistence Check (Real Mutation Guard)
```bash
curl -s -i -X POST https://gripr-backend-611571278421.asia-south1.run.app/api/mission-inquiries \
  -H "Content-Type: application/json" \
  -d '{"orgName":"Test Org","contactPerson":"Jane Doe","contactEmail":"jane@test.org","decisionAtStake":"Validating safety gate."}'
```
*Expected:* `HTTP/2 503 SERVICE UNAVAILABLE` with code `DEMO_ONLY_MODE`. Confirms that personal/commercial data is never stored in volatile local storage.
