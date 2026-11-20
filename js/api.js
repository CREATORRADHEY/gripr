/**
 * GRIPR.STUDIO — B2B Problem Intelligence API Layer (Phase 2 Integration)
 * 
 * Provides a unified Promise-based API abstraction mapping to:
 * - B2B Research Missions
 * - Invitation-based qualitative participant sessions
 * - Gemini AI evidence extraction & verification
 * - Cross-participant causal comparison & contradiction detection
 * - Decision Intelligence Brief synthesis
 * - Internal Research Operations Desk
 * 
 * Supports two distinct operational modes:
 * - LIVE API MODE: Real HTTP requests to the Fastify backend (http://127.0.0.1:3000/api).
 *   Real errors are NEVER silently swallowed or faked.
 * - DEMO MODE: Local storage with synthetic fixtures explicitly tagged #DEMO_SYNTHETIC.
 */

(function () {
  const BACKEND_URL = 'http://127.0.0.1:3000/api';
  const DEV_AUTH_HEADER = 'gripr_dev_ops_secret_2026';

  const STORAGE_KEY_MISSIONS = 'gripr_b2b_missions_v2';
  const STORAGE_KEY_SESSIONS = 'gripr_b2b_sessions_v2';
  const STORAGE_KEY_INVITATIONS = 'gripr_b2b_invitations_v2';
  const STORAGE_KEY_BRIEFS = 'gripr_b2b_briefs_v2';
  const STORAGE_KEY_OPS = 'gripr_b2b_ops_v2';
  const STORAGE_KEY_MODE = 'gripr_api_mode'; // 'live' | 'demo'

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

  // Auto-detect backend health
  async function probeBackendHealth() {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 1200);
      const res = await fetch(`${BACKEND_URL}/health`, { signal: controller.signal });
      clearTimeout(timeoutId);
      if (res.ok) {
        backendHealthy = true;
        if (currentMode === 'auto') {
          currentMode = 'live';
        }
      } else {
        backendHealthy = false;
        if (currentMode === 'auto') {
          currentMode = 'demo';
        }
      }
    } catch (err) {
      backendHealthy = false;
      if (currentMode === 'auto') {
        currentMode = 'demo';
      }
    }
    updateModePillUI();
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
      pill.title = 'Click to toggle between Live API and Demo Fixtures';
      pill.onclick = () => {
        const next = GriprAPI.getMode() === 'live' ? 'demo' : 'live';
        GriprAPI.setMode(next);
        location.reload();
      };
      document.body.appendChild(pill);
    }

    const isLive = GriprAPI.getMode() === 'live';
    if (isLive) {
      pill.style.background = '#064E3B';
      pill.style.color = '#ECFDF5';
      pill.style.border = '1px solid #059669';
      pill.innerHTML = `<span style="width:7px; height:7px; border-radius:50%; background:#10B981; display:inline-block;"></span> LIVE API (Fastify:3000)`;
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
     * 1. Submit a B2B Mission Scoping Request from an organization
     * @param {Object} data
     */
    async createMissionRequest(data) {
      if (this.getMode() === 'live') {
        try {
          const res = await fetch(`${BACKEND_URL}/missions`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              orgName: data.orgName,
              contactPerson: data.contactPerson,
              contactEmail: data.contactEmail,
              role: data.role || 'Product Lead',
              sector: data.sector || 'general',
              decisionAtStake: data.decisionAtStake,
              hypothesis: data.hypothesis,
              falsificationCriteria: data.falsificationCriteria,
              problemToInvestigate: data.problemToInvestigate,
              targetParticipantProfile: data.targetParticipantProfile,
              industry: data.industry,
              geography: data.geography,
              urgency: data.urgency,
              constraints: data.constraints,
              deliverables: data.deliverables,
              consentPrivacy: true
            })
          });

          const json = await res.json();
          if (!res.ok) {
            const errMap = {};
            if (json.error && Array.isArray(json.error.details)) {
              json.error.details.forEach(d => { errMap[d.field] = d.message; });
            } else {
              errMap.general = json.error ? json.error.message : 'Server rejected mission scoping submission.';
            }
            return { success: false, errors: errMap };
          }

          return json;
        } catch (err) {
          // Never silently fake in live mode
          return {
            success: false,
            errors: { general: `Backend connection error: ${err.message}. Ensure Fastify API is running on ${BACKEND_URL}.` }
          };
        }
      }

      // DEMO MODE FALLBACK
      await delay(180);
      const errors = {};
      if (!data.orgName || data.orgName.trim().length < 2) errors.orgName = 'Organization / Company name is required.';
      if (!data.contactPerson || data.contactPerson.trim().length < 2) errors.contactPerson = 'Contact person name is required.';
      if (!data.contactEmail || !data.contactEmail.includes('@')) errors.contactEmail = 'A valid work email address is required.';
      if (!data.decisionAtStake || data.decisionAtStake.trim().length < 20) errors.decisionAtStake = 'Please describe the decision at stake in at least 20 characters.';
      if (!data.problemToInvestigate || data.problemToInvestigate.trim().length < 20) errors.problemToInvestigate = 'Please describe the problem or workflow to investigate.';
      if (!data.targetParticipantProfile || data.targetParticipantProfile.trim().length < 5) errors.targetParticipantProfile = 'Target operator or participant profile is required.';

      if (Object.keys(errors).length > 0) return { success: false, errors };

      const randomNum = Math.floor(100 + Math.random() * 900);
      const missionId = `MSN-2026-${randomNum}`;

      const newMission = {
        id: missionId,
        orgName: data.orgName.trim(),
        contactPerson: data.contactPerson.trim(),
        contactEmail: data.contactEmail.trim(),
        role: data.role || 'Product Lead',
        sector: data.sector || 'general',
        decisionAtStake: data.decisionAtStake.trim(),
        hypothesis: data.hypothesis ? data.hypothesis.trim() : 'Preliminary hypothesis under evaluation',
        falsificationCriteria: data.falsificationCriteria ? data.falsificationCriteria.trim() : 'To be refined during scoping alignment',
        problemToInvestigate: data.problemToInvestigate.trim(),
        targetParticipantProfile: data.targetParticipantProfile.trim(),
        industry: data.industry || 'B2B Workflow',
        geography: data.geography || 'India (Regional clusters)',
        urgency: data.urgency || 'Standard (4-6 weeks)',
        constraints: data.constraints || 'None specified',
        deliverables: data.deliverables || ['Decision Intelligence Brief', 'Workflow Friction Map'],
        status: 'Requested',
        pricing: '₹49,000 (Experimental Pilot Scope)',
        pricingDisclaimer: 'Experimental pilot pricing. Unvalidated research model. #DEMO_SYNTHETIC',
        participantTargetCount: 5,
        completedSessionCount: 0,
        createdAt: new Date().toISOString()
      };

      const missions = getRaw(STORAGE_KEY_MISSIONS);
      missions.unshift(newMission);
      setRaw(STORAGE_KEY_MISSIONS, missions);

      return {
        success: true,
        missionId: missionId,
        status: 'Requested',
        message: 'Demo mission request recorded locally. Our research team will review scoping parameters.'
      };
    },

    /**
     * 2. Get a mission by ID
     * @param {string} id
     */
    async getMission(id) {
      if (this.getMode() === 'live') {
        try {
          const res = await fetch(`${BACKEND_URL}/missions/${encodeURIComponent(id)}`, {
            headers: { 'x-gripr-auth': DEV_AUTH_HEADER }
          });
          const json = await res.json();
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
     * 3. List all missions
     */
    async getMissionList() {
      if (this.getMode() === 'live') {
        try {
          const res = await fetch(`${BACKEND_URL}/missions`, {
            headers: { 'x-gripr-auth': DEV_AUTH_HEADER }
          });
          const json = await res.json();
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
     * @param {string} missionId
     */
    async getMissionBrief(missionId = 'MSN-2026-081') {
      if (this.getMode() === 'live') {
        try {
          const res = await fetch(`${BACKEND_URL}/missions/${encodeURIComponent(missionId)}/brief`, {
            headers: { 'x-gripr-auth': DEV_AUTH_HEADER }
          });
          const json = await res.json();
          if (!res.ok) return { success: false, error: json.error?.message || 'Brief not available' };
          return json;
        } catch (err) {
          return { success: false, error: `Live API call failed: ${err.message}` };
        }
      }

      await delay(100);
      const briefs = getRaw(STORAGE_KEY_BRIEFS);
      const brief = briefs.find(b => b.missionId.toUpperCase() === missionId.toUpperCase()) || briefs[0];
      if (!brief) return { success: false, error: 'Decision brief not yet generated for this mission.' };

      const missions = getRaw(STORAGE_KEY_MISSIONS);
      const mission = missions.find(m => m.id.toUpperCase() === brief.missionId.toUpperCase());
      const sessions = getRaw(STORAGE_KEY_SESSIONS);
      const linkedSessions = sessions.filter(s => s.missionId.toUpperCase() === brief.missionId.toUpperCase());

      return { success: true, brief, mission, sessions: linkedSessions };
    },

    /**
     * 5. Get research invitation details for an invited participant
     * @param {string} token
     */
    async getResearchInvitation(token = 'INV-AGRI-081') {
      if (this.getMode() === 'live') {
        try {
          const res = await fetch(`${BACKEND_URL}/research/invitations/${encodeURIComponent(token)}`);
          const json = await res.json();
          if (!res.ok) return { success: false, error: json.error?.message || 'Invalid or expired invitation token.' };
          return json;
        } catch (err) {
          return { success: false, error: `Live API call failed: ${err.message}` };
        }
      }

      await delay(70);
      const invitations = getRaw(STORAGE_KEY_INVITATIONS);
      const invite = invitations.find(i => i.token.toUpperCase() === (token || '').toUpperCase()) || invitations[0];
      if (!invite) return { success: false, error: 'Invitation token is invalid or has expired.' };
      return { success: true, invitation: invite };
    },

    /**
     * 6. Submit an invited research participant session
     * @param {Object} data
     */
    async submitResearchResponse(data) {
      if (this.getMode() === 'live') {
        try {
          const token = data.invitationToken || 'INV-AGRI-081';
          const res = await fetch(`${BACKEND_URL}/research/invitations/${encodeURIComponent(token)}/responses`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              incidentNarrative: data.incidentNarrative,
              affectedWorkflow: data.affectedWorkflow,
              triggeringEvent: data.triggeringEvent,
              operationalImpact: data.operationalImpact,
              existingWorkaround: data.existingWorkaround,
              frequency: data.frequency || null,
              financialImpact: data.financialImpact || null,
              role: data.role,
              location: data.location,
              language: data.language,
              consentStudyProcessing: !!data.consentStudyProcessing,
              consentSanitizedBriefSharing: !!data.consentSanitizedBriefSharing,
              consentFollowUpInterview: !!data.consentFollowUpInterview,
              contactEmail: data.contactEmail || null
            })
          });

          const json = await res.json();
          if (!res.ok) {
            const errMap = {};
            if (json.error && Array.isArray(json.error.details)) {
              json.error.details.forEach(d => { errMap[d.field] = d.message; });
            } else {
              errMap.general = json.error ? json.error.message : 'Submission failed.';
            }
            return { success: false, errors: errMap };
          }

          return json;
        } catch (err) {
          return { success: false, errors: { general: `Live API submission failed: ${err.message}` } };
        }
      }

      await delay(180);
      const errors = {};
      if (!data.incidentNarrative || data.incidentNarrative.trim().length < 20) {
        errors.incidentNarrative = 'Please provide details of your recent experience (minimum 20 characters).';
      }
      if (!data.existingWorkaround || data.existingWorkaround.trim().length < 5) {
        errors.existingWorkaround = 'Please describe what workaround you used instead.';
      }
      if (!data.consentStudyProcessing) {
        errors.consentStudyProcessing = 'Research study processing consent is required to participate.';
      }

      if (Object.keys(errors).length > 0) return { success: false, errors };

      const sessionId = `SES-${Math.floor(400 + Math.random() * 500)}`;
      const newSession = {
        id: sessionId,
        missionId: data.missionId || 'MSN-2026-081',
        participantPseudonym: `Participant (${data.role || 'Operator'})`,
        role: data.role || 'Screened Operator',
        location: data.location || 'India (Regional)',
        language: data.language || 'Hinglish / Vernacular',
        sessionDate: new Date().toISOString().split('T')[0],
        verbatim: data.incidentNarrative.trim(),
        translation: data.incidentNarrative.trim(),
        workflow: data.affectedWorkflow || 'Operational procurement workflow',
        trigger: 'Firsthand incident reported during study session',
        impact: data.operationalImpact || 'Unquantified friction',
        workaround: data.existingWorkaround.trim(),
        divergenceNotes: 'Fresh participant session awaiting research desk moderation.',
        consent: {
          studyProcessing: !!data.consentStudyProcessing,
          sanitizedBriefSharing: !!data.consentSanitizedBriefSharing,
          followUpInterview: !!data.consentFollowUpInterview,
          contactEmail: data.consentFollowUpInterview ? (data.contactEmail || null) : null
        }
      };

      const sessions = getRaw(STORAGE_KEY_SESSIONS);
      sessions.unshift(newSession);
      setRaw(STORAGE_KEY_SESSIONS, sessions);

      return {
        success: true,
        sessionId: sessionId,
        message: 'Research session response recorded locally. Thank you for contributing your firsthand operational experience.'
      };
    },

    /**
     * 7. Get internal research operations desk queue
     */
    async getResearchOperationsQueue() {
      if (this.getMode() === 'live') {
        try {
          const res = await fetch(`${BACKEND_URL}/operations/queue`, {
            headers: { 'x-gripr-auth': DEV_AUTH_HEADER }
          });
          const json = await res.json();
          if (!res.ok) return { success: false, error: json.error?.message || 'Operations desk unauthorized' };
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
     * 8. Moderate or review an evidence session / ops task
     */
    async reviewEvidence(opsId, decision, details = {}) {
      if (this.getMode() === 'live') {
        try {
          const res = await fetch(`${BACKEND_URL}/operations/evidence/${encodeURIComponent(opsId)}/review`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'x-gripr-auth': DEV_AUTH_HEADER
            },
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
     * 9. Update mission lifecycle state
     */
    async updateMissionStatus(missionId, newStatus) {
      if (this.getMode() === 'live') {
        try {
          const res = await fetch(`${BACKEND_URL}/missions/${encodeURIComponent(missionId)}/status`, {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json',
              'x-gripr-auth': DEV_AUTH_HEADER
            },
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
            headers: { 'x-gripr-auth': DEV_AUTH_HEADER }
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
            headers: { 'x-gripr-auth': DEV_AUTH_HEADER }
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
