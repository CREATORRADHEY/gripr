/**
 * GRIPR.STUDIO — B2B Problem Intelligence API Layer (Phase 3 Integration)
 * 
 * Provides a unified Promise-based API abstraction mapping to:
 * - Public B2B Mission Inquiries (POST /api/mission-inquiries)
 * - Authenticated B2B Research Missions & Tenant-scoped retrieval
 * - Cryptographically hashed participant invitations & 3-tier consent logging
 * - Gemini AI evidence extraction & verification
 * - Cross-participant causal comparison & contradiction detection
 * - Decision Intelligence Brief synthesis (Human reviewed)
 * - Internal Research Operations Desk (RBAC: Researcher / Admin)
 * 
 * Security & Auth:
 * - Bearer JWT Token authentication (Firebase Auth standard)
 * - Strict tenant isolation: organizations can only retrieve their own research
 * - Replay attack prevention on qualitative participant invitations
 */

(function () {
  // Configurable backend URL resolution (Cloudflare Pages, Railway, Local)
  const DEFAULT_RAILWAY_URL = 'https://gripr-backend-production.up.railway.app/api';

  function resolveBackendUrl() {
    // 1. Explicit global override in window (e.g. from config script or presenter injection)
    if (typeof window !== 'undefined' && window.__GRIPR_API_URL__) {
      return String(window.__GRIPR_API_URL__).replace(/\/+$/, '');
    }
    // 2. LocalStorage override (configured by presenter or user)
    try {
      if (typeof localStorage !== 'undefined') {
        const stored = localStorage.getItem('gripr_api_base_url');
        if (stored && stored.trim()) {
          return stored.trim().replace(/\/+$/, '');
        }
      }
    } catch (_) {}

    // 3. Document meta tag (<meta name="gripr-api-url" content="...">)
    if (typeof document !== 'undefined') {
      const meta = document.querySelector('meta[name="gripr-api-url"]');
      if (meta && meta.content && meta.content.trim()) {
        return meta.content.trim().replace(/\/+$/, '');
      }
    }

    // 4. If hosted on Cloudflare Pages or static domain without local /api
    if (typeof window !== 'undefined' && window.location) {
      const host = window.location.hostname;
      if (host.endsWith('.pages.dev') || host.endsWith('.cloudflarepages.com')) {
        return DEFAULT_RAILWAY_URL;
      }
    }

    // 5. Default relative path for same-origin / unified deployment
    return '/api';
  }

  let BACKEND_URL = resolveBackendUrl();

  const STORAGE_KEY_MISSIONS = 'gripr_b2b_missions_v2';
  const STORAGE_KEY_SESSIONS = 'gripr_b2b_sessions_v2';
  const STORAGE_KEY_INVITATIONS = 'gripr_b2b_invitations_v2';
  const STORAGE_KEY_BRIEFS = 'gripr_b2b_briefs_v2';
  const STORAGE_KEY_OPS = 'gripr_b2b_ops_v2';
  const STORAGE_KEY_MODE = 'gripr_api_mode'; // 'live' | 'demo'
  const STORAGE_KEY_AUTH_TOKEN = 'gripr_auth_token';

  // Initialize demo fixtures in localStorage
  function initStore() {
    if (!localStorage.getItem(STORAGE_KEY_MISSIONS)) {
      const initial = window.GRIPR_FIXTURES ? window.GRIPR_FIXTURES.missions : [];
      localStorage.setItem(STORAGE_KEY_MISSIONS, JSON.stringify(initial));
    }
    if (!localStorage.getItem(STORAGE_KEY_SESSIONS)) {
      const initial = window.GRIPR_FIXTURES ? window.GRIPR_FIXTURES.participantSessions : [];
      localStorage.setItem(STORAGE_KEY_SESSIONS, JSON.stringify(initial));
    }
    if (!localStorage.getItem(STORAGE_KEY_INVITATIONS)) {
      const initial = window.GRIPR_FIXTURES ? window.GRIPR_FIXTURES.invitations : [];
      localStorage.setItem(STORAGE_KEY_INVITATIONS, JSON.stringify(initial));
    }
    if (!localStorage.getItem(STORAGE_KEY_BRIEFS)) {
      const initial = window.GRIPR_FIXTURES ? [window.GRIPR_FIXTURES.decisionBrief] : [];
      localStorage.setItem(STORAGE_KEY_BRIEFS, JSON.stringify(initial));
    }
    if (!localStorage.getItem(STORAGE_KEY_OPS)) {
      const initial = window.GRIPR_FIXTURES ? window.GRIPR_FIXTURES.opsQueue : [];
      localStorage.setItem(STORAGE_KEY_OPS, JSON.stringify(initial));
    }
  }

  initStore();

  function getRaw(key, fallback = []) {
    try {
      return JSON.parse(localStorage.getItem(key)) || fallback;
    } catch (e) {
      return fallback;
    }
  }

  function setRaw(key, val) {
    localStorage.setItem(key, JSON.stringify(val));
  }

  function delay(ms = 80) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  let currentMode = localStorage.getItem(STORAGE_KEY_MODE) || 'auto';
  let backendHealthy = false;
  let backendPersistenceEngine = 'UNKNOWN';
  let backendIsCloudFirestore = false;

  // Auto-detect backend health
  async function probeBackendHealth() {
    BACKEND_URL = resolveBackendUrl();
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 2000);
      const res = await fetch(`${BACKEND_URL}/health`, { signal: controller.signal });
      clearTimeout(timeoutId);
      if (res.ok) {
        const json = await res.json().catch(() => ({}));
        backendHealthy = true;
        backendPersistenceEngine = (json && json.persistence && json.persistence.engine) ? json.persistence.engine : 'UNKNOWN';
        backendIsCloudFirestore = (json && json.persistence && json.persistence.isCloudFirestore === true);
        if (currentMode === 'auto') {
          currentMode = 'live';
        }
      } else {
        backendHealthy = false;
        backendPersistenceEngine = 'DEMO_ONLY';
        backendIsCloudFirestore = false;
        if (currentMode === 'auto') {
          currentMode = 'demo';
        }
      }
    } catch (err) {
      backendHealthy = false;
      backendPersistenceEngine = 'DEMO_ONLY';
      backendIsCloudFirestore = false;
      if (currentMode === 'auto') {
        currentMode = 'demo';
      }
    }
    updateModePillUI();
    if (typeof window !== 'undefined' && typeof window.onGriprBackendStatusUpdated === 'function') {
      try {
        window.onGriprBackendStatusUpdated({
          healthy: backendHealthy,
          persistenceEngine: backendPersistenceEngine,
          isCloudFirestore: backendIsCloudFirestore
        });
      } catch (_) {}
    }
  }

  // Create UI indicator for live vs demo mode
  function updateModePillUI() {
    let pill = document.getElementById('griprApiStatusPill');
    if (!pill) {
      pill = document.createElement('div');
      pill.id = 'griprApiStatusPill';
      pill.style.position = 'fixed';
      pill.style.bottom = '12px';
      pill.style.right = '12px';
      pill.style.zIndex = '9999';
      pill.style.fontFamily = "'Space Grotesk', sans-serif";
      pill.style.fontSize = '0.72rem';
      pill.style.padding = '0.35rem 0.75rem';
      pill.style.borderRadius = '999px';
      pill.style.display = 'flex';
      pill.style.alignItems = 'center';
      pill.style.gap = '0.45rem';
      pill.style.cursor = 'pointer';
      pill.style.boxShadow = '0 2px 10px rgba(0,0,0,0.15)';
      pill.style.transition = 'all 0.2s ease';
      pill.onclick = () => {
        const next = GriprAPI.getMode() === 'live' ? 'demo' : 'live';
        GriprAPI.setMode(next);
        location.reload();
      };
      pill.ondblclick = (e) => {
        e.stopPropagation();
        const current = localStorage.getItem('gripr_api_base_url') || resolveBackendUrl();
        const newUrl = prompt('Enter Railway / Fastify Backend API base URL (e.g. https://gripr-production.up.railway.app/api):', current);
        if (newUrl !== null) {
          GriprAPI.setApiBaseUrl(newUrl);
        }
      };
      document.body.appendChild(pill);
    }

    const isLive = GriprAPI.getMode() === 'live';
    const hasToken = !!localStorage.getItem(STORAGE_KEY_AUTH_TOKEN);
    const activeUrl = resolveBackendUrl();
    pill.title = `GRIPR API: ${activeUrl} (${isLive ? 'Connected' : 'Offline / Demo Fixtures'})\nClick to toggle mode. Double-click to configure API URL.`;
    if (isLive) {
      pill.style.background = '#064E3B';
      pill.style.color = '#ECFDF5';
      pill.style.border = '1px solid #059669';
      pill.innerHTML = `<span style="width:7px; height:7px; border-radius:50%; background:#10B981; display:inline-block;"></span> LIVE API (${activeUrl})${hasToken ? ' 🔑' : ''}`;
    } else {
      pill.style.background = '#1E1E1E';
      pill.style.color = '#FEF3C7';
      pill.style.border = '1px solid #D97706';
      pill.innerHTML = `<span style="width:7px; height:7px; border-radius:50%; background:#F59E0B; display:inline-block;"></span> DEMO FIXTURES (Local)`;
    }
  }

  window.addEventListener('DOMContentLoaded', probeBackendHealth);

  window.GriprAPI = {
    /**
     * Get configured backend URL
     */
    getApiBaseUrl() {
      return resolveBackendUrl();
    },

    /**
     * Set configured backend URL (e.g. Railway HTTPS service domain)
     */
    setApiBaseUrl(url) {
      if (url && typeof url === 'string' && url.trim()) {
        localStorage.setItem('gripr_api_base_url', url.trim());
      } else {
        localStorage.removeItem('gripr_api_base_url');
      }
      BACKEND_URL = resolveBackendUrl();
      probeBackendHealth();
    },

    /**
     * Reset backend URL to automatic default
     */
    resetApiBaseUrl() {
      localStorage.removeItem('gripr_api_base_url');
      BACKEND_URL = resolveBackendUrl();
      probeBackendHealth();
    },

    /**
     * Get active persistence engine reported by backend
     */
    getPersistenceEngine() {
      return backendPersistenceEngine;
    },

    /**
     * Real inquiries require a verified production Cloud Firestore database
     */
    isRealInquirySupported() {
      return backendIsCloudFirestore === true;
    },

    /**
     * Get active mode: 'live' or 'demo'
     */
    getMode() {
      if (currentMode === 'auto') {
        return backendHealthy ? 'live' : 'demo';
      }
      return currentMode;
    },

    /**
     * Set mode explicitly: 'live' | 'demo'
     */
    setMode(mode) {
      if (mode !== 'live' && mode !== 'demo') mode = 'demo';
      currentMode = mode;
      localStorage.setItem(STORAGE_KEY_MODE, mode);
      updateModePillUI();
    },

    /**
     * Auth Token Management (Bearer JWT)
     */
    getAuthToken() {
      return localStorage.getItem(STORAGE_KEY_AUTH_TOKEN) || '';
    },

    setAuthToken(token) {
      if (token) {
        localStorage.setItem(STORAGE_KEY_AUTH_TOKEN, token.trim());
      } else {
        localStorage.removeItem(STORAGE_KEY_AUTH_TOKEN);
      }
      updateModePillUI();
    },

    clearAuthToken() {
      localStorage.removeItem(STORAGE_KEY_AUTH_TOKEN);
      updateModePillUI();
    },

    /**
     * Helper to build standard request headers
     */
    getHeaders(extra = {}) {
      const headers = { 'Content-Type': 'application/json', ...extra };
      const token = this.getAuthToken();
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      return headers;
    },

    /**
     * Check backend health
     */
    async checkHealth() {
      try {
        const res = await fetch(`${BACKEND_URL}/health`);
        const json = await res.json();
        return { ok: res.ok, status: res.status, data: json };
      } catch (err) {
        return { ok: false, error: (err && err.message) || 'Network error' };
      }
    },

    /**
     * 1. Submit a Public B2B Mission Inquiry from an organization
     * Calls POST /api/mission-inquiries
     * @param {Object} data
     */
    async submitMissionInquiry(data = {}) {
      const isExplicitDemo = data.isDemo === true;

      // Real Inquiry: Always dispatch to live backend API, never silent demo fallback (Requirement B & E)
      if (!isExplicitDemo) {
        try {
          const res = await fetch(`${BACKEND_URL}/mission-inquiries`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              orgName: (data.orgName || '').trim(),
              contactPerson: (data.contactPerson || data.contactName || '').trim(),
              contactEmail: (data.contactEmail || '').trim(),
              role: (data.role || 'Product Leader').trim(),
              sector: (data.sector || 'general').trim(),
              decisionAtStake: (data.decisionAtStake || '').trim(),
              hypothesis: (data.hypothesis && data.hypothesis.trim().length >= 15)
                ? data.hypothesis.trim()
                : 'Hypothesis under qualitative field evaluation and falsification testing',
              falsificationCriteria: (data.falsificationCriteria && data.falsificationCriteria.trim().length >= 15)
                ? data.falsificationCriteria.trim()
                : 'Evidence demonstrating that current assumptions fail in field operation',
              targetParticipantProfile: (data.targetParticipantProfile || data.problemToInvestigate || '').trim(),
              industry: (data.industry || (data.sector === 'logistics' ? 'Logistics & Freight' : 'B2B Workflow')).trim(),
              geography: (data.geography || 'India (Regional clusters)').trim(),
              constraints: (data.constraints || 'None specified').trim(),
              consentContact: data.consentContact === true,
              consentPrivacy: data.consentPrivacy === true
            })
          });

          const json = await res.json().catch(() => ({}));
          if (!res.ok) {
            const errMap = {};
            if (json.error && Array.isArray(json.error.details)) {
              json.error.details.forEach(d => { errMap[d.field] = d.message; });
            } else {
              errMap.general = json.error ? (json.error.message || json.error) : `Server rejected mission scoping submission (Status ${res.status}).`;
            }
            return { success: false, status: res.status, errors: errMap };
          }

          return {
            success: true,
            inquiryId: json.inquiryId,
            status: json.status || 'AWAITING_SCOPE_REVIEW',
            message: json.message || 'Scoping inquiry received. A research lead will review scope parameters within 1 business day.',
            pricingNotice: json.pricingNotice,
            disclaimer: json.disclaimer
          };
        } catch (err) {
          return {
            success: false,
            networkError: true,
            status: 0,
            errors: {
              general: `Backend connection error: ${err.message}. Ensure Fastify API is reachable at ${BACKEND_URL}. Real inquiries require a live connection.`
            }
          };
        }
      }

      // EXPLICIT DEMO INQUIRY SIMULATION (Only if data.isDemo === true)
      await delay(180);
      const errors = {};
      if (!data.orgName || data.orgName.trim().length < 2) errors.orgName = 'Organization / Company name is required.';
      if ((!data.contactName && !data.contactPerson) || ((data.contactName || data.contactPerson).trim().length < 2)) {
        errors.contactPerson = 'Contact person name is required.';
      }
      if (!data.contactEmail || !data.contactEmail.includes('@')) errors.contactEmail = 'A valid work email address is required.';
      if (!data.decisionAtStake || data.decisionAtStake.trim().length < 20) errors.decisionAtStake = 'Please describe the decision at stake in at least 20 characters.';
      if (!data.targetParticipantProfile && !data.problemToInvestigate) errors.problemToInvestigate = 'Please describe the problem or workflow to investigate.';

      if (Object.keys(errors).length > 0) return { success: false, errors };

      const randomNum = Math.floor(100 + Math.random() * 900);
      const inquiryId = `INQ-2026-${randomNum}`;

      return {
        success: true,
        inquiryId: inquiryId,
        status: 'AWAITING_SCOPE_REVIEW',
        message: 'Demo inquiry recorded locally. Our research team will review scoping parameters.'
      };
    },

    /**
     * Backward-compatible alias for createMissionRequest
     */
    async createMissionRequest(data) {
      return this.submitMissionInquiry(data);
    },

    /**
     * 2. Get a mission by ID (Authenticated, Tenant-scoped)
     * @param {string} id
     */
    async getMission(id) {
      if (this.getMode() === 'live') {
        try {
          const res = await fetch(`${BACKEND_URL}/missions/${encodeURIComponent(id)}`, {
            headers: this.getHeaders()
          });
          const json = await res.json();
          if (res.status === 401) {
            return { success: false, error: 'Authentication required. Please sign in to view this mission.', authRequired: true };
          }
          if (res.status === 403) {
            return { success: false, error: 'Access forbidden. Your organization is not authorized to access this research mission.', forbidden: true };
          }
          if (!res.ok) return { success: false, error: json.error?.message || `Mission ${id} not found.` };
          return json;
        } catch (err) {
          return { success: false, error: `Live API call failed: ${err.message}` };
        }
      }

      await delay(70);
      const missions = getRaw(STORAGE_KEY_MISSIONS);
      const mission = missions.find(m => m.id.toUpperCase() === (id || '').toUpperCase());
      if (!mission) return { success: false, error: `Mission ${id} not found.` };

      const briefs = getRaw(STORAGE_KEY_BRIEFS);
      const brief = briefs.find(b => b.missionId.toUpperCase() === mission.id.toUpperCase());
      const sessions = getRaw(STORAGE_KEY_SESSIONS);
      const missionSessions = sessions.filter(s => s.missionId.toUpperCase() === mission.id.toUpperCase());

      return {
        success: true,
        mission,
        briefAvailable: !!brief,
        sessions: missionSessions
      };
    },

    /**
     * 3. List missions (Authenticated, Tenant-scoped)
     */
    async getMissionList() {
      if (this.getMode() === 'live') {
        try {
          const res = await fetch(`${BACKEND_URL}/missions`, {
            headers: this.getHeaders()
          });
          const json = await res.json();
          if (res.status === 401) {
            return { success: false, error: 'Authentication required to list missions.', authRequired: true };
          }
          if (!res.ok) return { success: false, error: json.error?.message || 'Failed to list missions' };
          return json;
        } catch (err) {
          return { success: false, error: `Live API call failed: ${err.message}` };
        }
      }

      await delay(60);
      const missions = getRaw(STORAGE_KEY_MISSIONS);
      return { success: true, count: missions.length, missions };
    },

    /**
     * 4. Get Decision Intelligence Brief for a mission
     * In Live Mode:
     * - Returns real live data on 200 OK.
     * - Returns exact errors on 401, 403, 404, 500 without falling back to synthetic fixtures.
     * - Synthetic briefs are returned when in explicit demo mode (e.g. options.demo === true, ?demo=true, mode === 'demo', or for the canonical demo mission MSN-2026-081).
     * @param {string} missionId
     * @param {object} options
     */
    async getMissionBrief(missionId = 'MSN-2026-081', options = {}) {
      const isExplicitDemo = options.demo === true || (typeof window !== 'undefined' && (window.location.search.includes('demo=true') || (missionId || '').toUpperCase() === 'MSN-2026-081'));
      if (isExplicitDemo || this.getMode() === 'demo') {
        return this.getDemoBrief(missionId);
      }

      if (this.getMode() === 'live') {
        try {
          const res = await fetch(`${BACKEND_URL}/missions/${encodeURIComponent(missionId)}/brief`, {
            headers: this.getHeaders()
          });
          const json = await res.json().catch(() => ({}));

          if (res.ok && json.success) {
            return json;
          }

          // Strictly handle HTTP error states without silent synthetic fallback (Task 2)
          if (res.status === 401) {
            return {
              success: false,
              status: 401,
              authRequired: true,
              error: 'Authentication required. A valid Firebase ID token with organization access is required to inspect live research briefs.',
              message: 'Authentication required (401)'
            };
          }
          if (res.status === 403) {
            return {
              success: false,
              status: 403,
              forbidden: true,
              error: json.error?.message || 'Access denied. Cross-organization tenant boundary enforced or brief is still awaiting human review.',
              message: 'Access denied (403)'
            };
          }
          if (res.status === 404) {
            return {
              success: false,
              status: 404,
              notFound: true,
              error: json.error?.message || `Decision Intelligence Brief not found for mission reference "${missionId}".`,
              message: 'Brief not found (404)'
            };
          }
          if (res.status >= 500) {
            return {
              success: false,
              status: 500,
              serverError: true,
              error: json.error?.message || 'Backend server error encountered while retrieving the research brief.',
              message: 'Backend error (500)'
            };
          }

          return {
            success: false,
            status: res.status,
            error: json.error?.message || 'Brief not available'
          };
        } catch (err) {
          return {
            success: false,
            status: 0,
            networkError: true,
            error: `API connection failed: unable to reach live backend at ${BACKEND_URL}. Check if the server is running.`
          };
        }
      }

      return this.getDemoBrief(missionId);
    },

    getDemoBrief(missionId = 'MSN-2026-081') {
      const briefs = getRaw(STORAGE_KEY_BRIEFS);
      const brief = briefs.find(b => (b.missionId || '').toUpperCase() === (missionId || '').toUpperCase()) || (window.GRIPR_FIXTURES ? window.GRIPR_FIXTURES.decisionBrief : null);
      if (!brief) return { success: false, error: `No brief found for mission ${missionId}` };

      const sessions = getRaw(STORAGE_KEY_SESSIONS);
      const missionSessions = sessions.filter(s => (s.missionId || '').toUpperCase() === (missionId || '').toUpperCase());

      return {
        success: true,
        brief,
        sessions: missionSessions.length > 0 ? missionSessions : (window.GRIPR_FIXTURES ? window.GRIPR_FIXTURES.participantSessions : []),
        mode: 'DEMO_SYNTHETIC'
      };
    },

    /**
     * 5. Get Research Invitation details by secure token
     * @param {string} token
     */
    async getInvitation(token) {
      if (this.getMode() === 'live') {
        try {
          const res = await fetch(`${BACKEND_URL}/research/invitations/${encodeURIComponent(token)}`);
          const json = await res.json();
          if (!res.ok) return { success: false, error: json.error?.message || 'Invitation invalid or expired' };
          return json;
        } catch (err) {
          return { success: false, error: `Live API call failed: ${err.message}` };
        }
      }

      await delay(70);
      const invitations = getRaw(STORAGE_KEY_INVITATIONS);
      const inv = invitations.find(i => i.token === token || i.id === token);
      if (!inv) return { success: false, error: 'Invitation not found or expired.' };
      return { success: true, invitation: inv };
    },

    /**
     * 6. Submit qualitative participant session with 3-tier consent
     * @param {string} token
     * @param {Object} data
     */
    async submitParticipantSession(token, data) {
      if (this.getMode() === 'live') {
        try {
          const res = await fetch(`${BACKEND_URL}/research/invitations/${encodeURIComponent(token)}/responses`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
          });
          const json = await res.json();
          if (res.status === 409) {
            return { success: false, error: 'This research invitation has already been completed and cannot be resubmitted.' };
          }
          if (!res.ok) {
            const errMap = {};
            if (json.error && Array.isArray(json.error.details)) {
              json.error.details.forEach(d => { errMap[d.field] = d.message; });
            } else {
              errMap.general = json.error ? json.error.message : 'Submission rejected by server.';
            }
            return { success: false, errors: errMap };
          }
          return json;
        } catch (err) {
          return {
            success: false,
            errors: { general: `Backend connection error: ${err.message}` }
          };
        }
      }

      // DEMO MODE
      await delay(220);
      const errors = {};
      if (!data.narrativeVerbatim || data.narrativeVerbatim.trim().length < 30) {
        errors.narrativeVerbatim = 'Please share the detailed operational story (minimum 30 characters).';
      }
      if (!data.recentIncident || data.recentIncident.trim().length < 15) {
        errors.recentIncident = 'Please describe a specific recent incident (minimum 15 characters).';
      }
      if (!data.existingWorkaround || data.existingWorkaround.trim().length < 5) {
        errors.existingWorkaround = 'Please tell us how you currently handle this situation.';
      }
      if (!data.consent || !data.consent.internalResearch) {
        errors.consent = 'Internal research consent is required to participate.';
      }

      if (Object.keys(errors).length > 0) return { success: false, errors };

      const invitations = getRaw(STORAGE_KEY_INVITATIONS);
      const invIndex = invitations.findIndex(i => i.token === token || i.id === token);
      const missionId = invIndex >= 0 ? invitations[invIndex].missionId : 'MSN-2026-081';

      const randomNum = Math.floor(100 + Math.random() * 900);
      const sessionId = `SES-2026-${randomNum}`;

      const newSession = {
        id: sessionId,
        missionId: missionId,
        participantRole: data.participantRole || 'Fertilizer Retailer',
        yearsExperience: data.yearsExperience || '8 years',
        location: data.location || 'Rural Hub, MP',
        language: data.language || 'Hinglish',
        narrativeVerbatim: data.narrativeVerbatim.trim(),
        recentIncident: data.recentIncident.trim(),
        frequency: data.frequency || 'Weekly during sowing cycle',
        financialImpact: data.financialImpact || '₹8,000 - ₹15,000 per delayed consignment',
        existingWorkaround: data.existingWorkaround.trim(),
        consent: data.consent,
        submittedAt: new Date().toISOString()
      };

      const sessions = getRaw(STORAGE_KEY_SESSIONS);
      sessions.unshift(newSession);
      setRaw(STORAGE_KEY_SESSIONS, sessions);

      if (invIndex >= 0) {
        invitations[invIndex].status = 'completed';
        invitations[invIndex].completedAt = new Date().toISOString();
        setRaw(STORAGE_KEY_INVITATIONS, invitations);
      }

      return {
        success: true,
        sessionId: sessionId,
        status: 'awaiting_review',
        message: 'Research session recorded. Thank you for contributing authentic operational evidence.'
      };
    },

    /**
     * 7. Get internal research operations desk queue (Researcher / Admin only)
     */
    async getResearchOperationsQueue() {
      if (this.getMode() === 'live') {
        try {
          const res = await fetch(`${BACKEND_URL}/operations/queue`, {
            headers: this.getHeaders()
          });
          const json = await res.json();
          if (res.status === 401 || res.status === 403) {
            return { success: false, error: 'Researcher or Admin authorization required for operations desk.', authRequired: true };
          }
          if (!res.ok) return { success: false, error: json.error?.message || 'Operations desk error' };
          return json;
        } catch (err) {
          return { success: false, error: `Live API call failed: ${err.message}` };
        }
      }

      await delay(80);
      const ops = getRaw(STORAGE_KEY_OPS);
      const missions = getRaw(STORAGE_KEY_MISSIONS);
      const sessions = getRaw(STORAGE_KEY_SESSIONS);

      return {
        success: true,
        opsQueue: ops,
        missions,
        sessions,
        metrics: {
          activeMissions: missions.filter(m => m.status !== 'Closed').length,
          pendingReviews: ops.filter(o => o.status === 'pending').length,
          completedBriefs: missions.filter(m => m.status === 'Brief Ready').length,
          totalParticipantsScreened: sessions.length
        }
      };
    },

    /**
     * 8. Moderate or review an evidence session / ops task (Researcher / Admin only)
     */
    async reviewEvidence(opsId, decision, details = {}) {
      if (this.getMode() === 'live') {
        try {
          const res = await fetch(`${BACKEND_URL}/operations/evidence/${encodeURIComponent(opsId)}/review`, {
            method: 'POST',
            headers: this.getHeaders(),
            body: JSON.stringify({ decision, notes: details?.notes })
          });
          const json = await res.json();
          if (!res.ok) return { success: false, error: json.error?.message || 'Review action failed.' };
          return json;
        } catch (err) {
          return { success: false, error: `Live API call failed: ${err.message}` };
        }
      }

      await delay(120);
      const ops = getRaw(STORAGE_KEY_OPS);
      const item = ops.find(o => o.id === opsId);
      if (!item) return { success: false, error: 'Operations record not found.' };

      item.status = decision === 'approve' ? 'reviewed' : (decision === 'flag' ? 'flagged' : 'rejected');
      item.actionTaken = details.notes || `Moderated as ${decision}`;
      setRaw(STORAGE_KEY_OPS, ops);

      return { success: true, action: decision, message: `Task ${opsId} updated to ${item.status}.` };
    },

    /**
     * 9. Update mission lifecycle state (Researcher / Admin only)
     */
    async updateMissionStatus(missionId, newStatus) {
      if (this.getMode() === 'live') {
        try {
          const res = await fetch(`${BACKEND_URL}/missions/${encodeURIComponent(missionId)}/status`, {
            method: 'PATCH',
            headers: this.getHeaders(),
            body: JSON.stringify({ status: newStatus })
          });
          const json = await res.json();
          if (!res.ok) return { success: false, error: json.error?.message || 'Status update failed.' };
          return json;
        } catch (err) {
          return { success: false, error: `Live API call failed: ${err.message}` };
        }
      }

      await delay(90);
      const missions = getRaw(STORAGE_KEY_MISSIONS);
      const mission = missions.find(m => m.id.toUpperCase() === missionId.toUpperCase());
      if (!mission) return { success: false, error: 'Mission not found.' };

      mission.status = newStatus;
      setRaw(STORAGE_KEY_MISSIONS, missions);

      return { success: true, missionId, newStatus, message: `Mission ${missionId} status transitioned to "${newStatus}".` };
    },

    /**
     * 10. AI Trigger: Run Gemini evidence extraction on a session
     */
    async analyzeSession(sessionId) {
      if (this.getMode() === 'live') {
        try {
          const res = await fetch(`${BACKEND_URL}/research/responses/${encodeURIComponent(sessionId)}/analyze`, {
            method: 'POST',
            headers: this.getHeaders()
          });
          const json = await res.json();
          if (!res.ok) return { success: false, error: json.error?.message || 'Analysis failed.' };
          return json;
        } catch (err) {
          return { success: false, error: `Live API extraction call failed: ${err.message}` };
        }
      }

      await delay(400);
      return {
        success: true,
        sessionId,
        status: 'awaiting_review',
        message: 'Demo mode: Simulated Gemini extraction created.'
      };
    },

    /**
     * 11. AI Trigger: Generate draft Decision Intelligence Brief
     */
    async generateBrief(missionId) {
      if (this.getMode() === 'live') {
        try {
          const res = await fetch(`${BACKEND_URL}/missions/${encodeURIComponent(missionId)}/brief/generate`, {
            method: 'POST',
            headers: this.getHeaders()
          });
          const json = await res.json();
          if (!res.ok) return { success: false, error: json.error?.message || 'Brief generation failed.' };
          return json;
        } catch (err) {
          return { success: false, error: `Live API brief generation failed: ${err.message}` };
        }
      }

      await delay(500);
      return {
        success: true,
        missionId,
        status: 'DRAFT — REQUIRES HUMAN REVIEW',
        message: 'Demo mode: Draft brief generated from synthetic evidence.'
      };
    },

    /**
     * 12. Run Safe Live Gemini Analysis on Canonical Synthetic Demo Packet
     * Communicates with dedicated server-side demo endpoint without exposing API keys.
     */
    async analyzeDemoLive(packetId = 'PKT-401') {
      try {
        const res = await fetch(`${BACKEND_URL}/demo/live-gemini-analysis`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ packetId })
        });
        const json = await res.json().catch(() => ({}));
        if (!res.ok || !json.success) {
          return {
            success: false,
            error: json.error || 'Live Gemini request could not be completed on server.',
            suggestion: 'Use Precomputed Demo Analysis (Mode A) for full guided walkthrough.'
          };
        }
        return json;
      } catch (err) {
        return {
          success: false,
          error: `Live Gemini endpoint unreachable (${err.message}).`,
          suggestion: 'Ensure Fastify backend is reachable at /api, or use Precomputed Demo Analysis.'
        };
      }
    },

    /**
     * Re-seed synthetic fixtures
     */
    resetFixtures() {
      if (window.GRIPR_FIXTURES) {
        setRaw(STORAGE_KEY_MISSIONS, window.GRIPR_FIXTURES.missions);
        setRaw(STORAGE_KEY_SESSIONS, window.GRIPR_FIXTURES.participantSessions);
        setRaw(STORAGE_KEY_INVITATIONS, window.GRIPR_FIXTURES.invitations);
        setRaw(STORAGE_KEY_BRIEFS, [window.GRIPR_FIXTURES.decisionBrief]);
        setRaw(STORAGE_KEY_OPS, window.GRIPR_FIXTURES.opsQueue);
      }
      return { success: true, message: 'B2B Synthetic demo fixtures re-initialized.' };
    }
  };
})();
