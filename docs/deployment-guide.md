# GRIPR.STUDIO Phase 3 Production Deployment Guide (Google Cloud Run + Cloud Firestore)

## 1. Prerequisites

Before deploying the GRIPR.STUDIO backend to production:
- A Google Cloud Platform (GCP) project with active billing enabled.
- `gcloud` CLI installed and authenticated (`gcloud auth login`).
- Docker installed locally for container image building (or Google Cloud Build).
- A Gemini API key with access to `gemini-1.5-flash` or `gemini-1.5-pro`.
- A Firebase project configured for Authentication.

---

## 2. Environment Configuration

### Required Environment Variables

| Variable | Description | Production Example |
| :--- | :--- | :--- |
| `NODE_ENV` | Runtime environment mode | `production` |
| `PORT` | Listening HTTP port (injected by Cloud Run) | `8080` |
| `HOST` | Bind host interface | `0.0.0.0` |
| `GEMINI_API_KEY` | Google Gemini API key for evidence synthesis | `AIzaSy...` (Stored in Secret Manager) |
| `GEMINI_MODEL` | Target Gemini model name | `gemini-1.5-flash` |
| `FIREBASE_PROJECT_ID` | GCP Project ID hosting Firebase Auth | `gripr-studio-prod` |
| `GCP_PROJECT_ID` | Google Cloud project ID for Firestore | `gripr-studio-prod` |
| `FIRESTORE_DATA_DIR` | File cache storage path (optional fallback) | `/app/data/firestore` |
| `CORS_ORIGIN` | Authorized frontend origin | `https://gripr.studio` |

---

## 3. Step-by-Step Deployment to Google Cloud Run

### Step 1: Set GCP Project & Enable APIs

```bash
export PROJECT_ID="gripr-studio-prod"
export REGION="asia-south1" # Mumbai, India region for minimal latency

gcloud config set project $PROJECT_ID

# Enable required Google Cloud APIs
gcloud services enable \
  run.googleapis.com \
  artifactregistry.googleapis.com \
  cloudbuild.googleapis.com \
  secretmanager.googleapis.com \
  firestore.googleapis.com
```

### Step 2: Configure Secret Manager for Sensitive Keys

```bash
# Create secret for Gemini API Key
echo -n "YOUR_ACTUAL_GEMINI_KEY" | gcloud secrets create gemini-api-key \
  --data-file=- \
  --replication-policy="automatic"

# Grant the Cloud Run service account access to read secrets
export PROJECT_NUMBER=$(gcloud projects describe $PROJECT_ID --format='value(projectNumber)')
gcloud secrets add-iam-policy-binding gemini-api-key \
  --member="serviceAccount:${PROJECT_NUMBER}-compute@developer.gserviceaccount.com" \
  --role="roles/secretmanager.secretAccessor"
```

### Step 3: Create Artifact Registry Repository

```bash
gcloud artifacts repositories create gripr-docker-repo \
  --repository-format=docker \
  --location=$REGION \
  --description="Docker repository for GRIPR.STUDIO backend"
```

### Step 4: Build and Push Container Image via Cloud Build

From the root of the repository:

```bash
gcloud builds submit api \
  --tag ${REGION}-docker.pkg.dev/${PROJECT_ID}/gripr-docker-repo/gripr-api:latest
```

### Step 5: Deploy Service to Cloud Run

```bash
gcloud run deploy gripr-api \
  --image ${REGION}-docker.pkg.dev/${PROJECT_ID}/gripr-docker-repo/gripr-api:latest \
  --platform managed \
  --region $REGION \
  --allow-unauthenticated \
  --set-env-vars="NODE_ENV=production,HOST=0.0.0.0,FIREBASE_PROJECT_ID=${PROJECT_ID},CORS_ORIGIN=https://gripr.studio" \
  --set-secrets="GEMINI_API_KEY=gemini-api-key:latest" \
  --min-instances=1 \
  --max-instances=10 \
  --cpu=1 \
  --memory=512Mi \
  --timeout=60s \
  --concurrency=80
```

---

## 4. Cloud Firestore Configuration

1. **Database Mode**: Ensure Cloud Firestore is created in **Native Mode**.
2. **Region**: Match Cloud Run service region (`asia-south1`).
3. **Collections Required**:
   - `inquiries`: prospective client mission inquiry records.
   - `missions`: active and completed research missions.
   - `invitations`: participant invitation records with SHA-256 token hashes.
   - `responses`: qualitative participant submissions.
   - `consents`: 3-tier versioned participant consent records.
   - `evidence`: Gemini-extracted structured evidence records.
   - `briefs`: executive Decision Intelligence Briefs.
   - `audit_logs`: immutable compliance and security audit trail.
4. **Composite Indexes**:
   - `missions`: `organizationId` ASC, `createdAt` DESC.
   - `responses`: `missionId` ASC, `submittedAt` DESC.
   - `audit_logs`: `resourceId` ASC, `timestamp` DESC.

---

## 5. Post-Deployment Verification & Health Checks

Once deployed, verify the Cloud Run service URL:

```bash
export SERVICE_URL=$(gcloud run services describe gripr-api --region $REGION --format='value(status.url)')

# 1. Healthcheck probe
curl -s "${SERVICE_URL}/api/health" | jq .

# Expected Output:
# {
#   "status": "healthy",
#   "version": "1.0.0",
#   "uptime": 12.4,
#   "timestamp": "2026-11-20T...",
#   "checks": {
#     "server": "healthy",
#     "gemini": "configured",
#     "storage": "connected"
#   }
# }

# 2. Public inquiry submission
curl -s -X POST "${SERVICE_URL}/api/mission-inquiries" \
  -H "Content-Type: application/json" \
  -d '{
    "orgName": "AgriTech Solutions Ltd",
    "contactName": "Aarav Sharma",
    "contactEmail": "aarav@agritech-solutions.in",
    "role": "VP Product",
    "sector": "Agriculture & Supply Chain",
    "decisionAtStake": "Deciding whether to build an automated fertilizer pricing discovery application for retail dealers.",
    "targetParticipantProfile": "Rural agricultural retail shop owners and primary cooperative operators",
    "timeline": "4-6 weeks",
    "consentTerms": true
  }' | jq .
```

---

## 6. Rollback & Maintenance Procedures

- **Rollback to Previous Revision**:
  ```bash
  gcloud run services update-traffic gripr-api \
    --region $REGION \
    --to-revisions=PREVIOUS_REVISION_NAME=100
  ```
- **Live Logs Inspection**:
  ```bash
  gcloud logging read "resource.type=cloud_run_revision AND resource.labels.service_name=gripr-api" \
    --limit 50 \
    --format "table(timestamp,severity,textPayload)"
  ```
