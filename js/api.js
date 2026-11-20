/**
 * GRIPR.STUDIO — B2B Problem Intelligence API Layer (Phase 1 Refactor)
 * 
 * Provides a Promise-based API abstraction mapping directly to B2B Research Missions,
 * invitation-based participant sessions, Decision Intelligence Briefs, and internal Research Operations.
 * 
 * All data in Phase 1 is stored in localStorage with synthetic fixtures, fully isolated
 * and ready for Phase 2 backend (Cloud Run + Firestore + Gemini) integration.
 */

(function () {
  const STORAGE_KEY_MISSIONS = 'gripr_b2b_missions_v2';
  const STORAGE_KEY_SESSIONS = 'gripr_b2b_sessions_v2';
  const STORAGE_KEY_INVITATIONS = 'gripr_b2b_invitations_v2';
  const STORAGE_KEY_BRIEFS = 'gripr_b2b_briefs_v2';
  const STORAGE_KEY_OPS = 'gripr_b2b_ops_v2';

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

  function delay(ms = 100) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  window.GriprAPI = {
    /**
     * Submit a B2B Mission Scoping Request from an organization
     * @param {Object} data
     */
    async createMissionRequest(data) {
      await delay(200);

      const errors = {};
      if (!data.orgName || data.orgName.trim().length < 2) {
        errors.orgName = 'Organization / Company name is required.';
      }
      if (!data.contactPerson || data.contactPerson.trim().length < 2) {
        errors.contactPerson = 'Contact person name is required.';
      }
      if (!data.contactEmail || !data.contactEmail.includes('@')) {
        errors.contactEmail = 'A valid work email address is required.';
      }
      if (!data.decisionAtStake || data.decisionAtStake.trim().length < 20) {
        errors.decisionAtStake = 'Please describe the decision at stake in at least 20 characters.';
      }
      if (!data.problemToInvestigate || data.problemToInvestigate.trim().length < 20) {
        errors.problemToInvestigate = 'Please describe the problem or workflow to investigate.';
      }
      if (!data.targetParticipantProfile || data.targetParticipantProfile.trim().length < 5) {
        errors.targetParticipantProfile = 'Target operator or participant profile is required.';
      }

      if (Object.keys(errors).length > 0) {
        return { success: false, errors };
      }

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
        pricingDisclaimer: 'Experimental pilot pricing. Unvalidated research model.',
        participantTargetCount: 5,
        completedSessionCount: 0,
        createdAt: new Date().toISOString()
      };

      const missions = getRaw(STORAGE_KEY_MISSIONS);
      missions.unshift(newMission);
      setRaw(STORAGE_KEY_MISSIONS, missions);

      // Add to ops desk
      const ops = getRaw(STORAGE_KEY_OPS);
      ops.unshift({
        id: `OPS-${Math.floor(1000 + Math.random() * 9000)}`,
        missionId: missionId,
        type: 'scope_review',
        title: `New Scope Request: ${data.orgName} (${missionId})`,
        status: 'pending',
        actionTaken: 'Awaiting research team scoping review.'
      });
      setRaw(STORAGE_KEY_OPS, ops);

      return {
        success: true,
        missionId: missionId,
        status: 'Requested',
        message: 'Demo mission request recorded locally. Our research team will review scoping parameters.'
      };
    },

    /**
     * Get a mission by ID
     * @param {string} id - e.g. 'MSN-2026-081'
     */
    async getMission(id) {
      await delay(80);
      const missions = getRaw(STORAGE_KEY_MISSIONS);
      const mission = missions.find(m => m.id.toUpperCase() === (id || '').toUpperCase());

      if (!mission) {
        return { success: false, error: `Mission ${id} not found.` };
      }

      // Check for brief availability
      const briefs = getRaw(STORAGE_KEY_BRIEFS);
      const brief = briefs.find(b => b.missionId.toUpperCase() === mission.id.toUpperCase());

      // Get completed sessions for this mission
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
     * List all missions
     */
    async getMissionList() {
      await delay(60);
      const missions = getRaw(STORAGE_KEY_MISSIONS);
      return { success: true, count: missions.length, missions };
    },

    /**
     * Get Decision Intelligence Brief for a mission
     * @param {string} missionId
     */
    async getMissionBrief(missionId = 'MSN-2026-081') {
      await delay(100);
      const briefs = getRaw(STORAGE_KEY_BRIEFS);
      const brief = briefs.find(b => b.missionId.toUpperCase() === missionId.toUpperCase()) || briefs[0];

      if (!brief) {
        return { success: false, error: 'Decision brief not yet generated for this mission.' };
      }

      // Fetch linked mission metadata
      const missions = getRaw(STORAGE_KEY_MISSIONS);
      const mission = missions.find(m => m.id.toUpperCase() === brief.missionId.toUpperCase());

      // Fetch linked participant sessions
      const sessions = getRaw(STORAGE_KEY_SESSIONS);
      const linkedSessions = sessions.filter(s => s.missionId.toUpperCase() === brief.missionId.toUpperCase());

      return {
        success: true,
        brief,
        mission,
        sessions: linkedSessions
      };
    },

    /**
     * Get research invitation details for an invited participant
     * @param {string} token - e.g. 'INV-AGRI-081'
     */
    async getResearchInvitation(token = 'INV-AGRI-081') {
      await delay(70);
      const invitations = getRaw(STORAGE_KEY_INVITATIONS);
      const invite = invitations.find(i => i.token.toUpperCase() === (token || '').toUpperCase()) || invitations[0];

      if (!invite) {
        return { success: false, error: 'Invitation token is invalid or has expired.' };
      }

      return { success: true, invitation: invite };
    },

    /**
     * Submit an invited research participant session
     * @param {Object} data
     */
    async submitResearchResponse(data) {
      await delay(200);

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

      if (Object.keys(errors).length > 0) {
        return { success: false, errors };
      }

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

      // Queue in ops
      const ops = getRaw(STORAGE_KEY_OPS);
      ops.unshift({
        id: `OPS-${Math.floor(1000 + Math.random() * 9000)}`,
        missionId: newSession.missionId,
        type: 'session_review',
        title: `Review New Participant Session: ${sessionId} (${newSession.role})`,
        status: 'pending',
        actionTaken: 'Awaiting moderation for brief synthesis.'
      });
      setRaw(STORAGE_KEY_OPS, ops);

      return {
        success: true,
        sessionId: sessionId,
        message: 'Research session response recorded locally. Thank you for contributing your firsthand operational experience.'
      };
    },

    /**
     * Get internal research operations desk queue
     */
    async getResearchOperationsQueue() {
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
     * Moderate or review an evidence session / ops task
     */
    async reviewEvidence(opsId, decision, details = {}) {
      await delay(120);
      const ops = getRaw(STORAGE_KEY_OPS);
      const item = ops.find(o => o.id === opsId);

      if (!item) {
        return { success: false, error: 'Operations record not found.' };
      }

      item.status = decision === 'approve' ? 'reviewed' : (decision === 'flag' ? 'flagged' : 'rejected');
      item.actionTaken = details.notes || `Moderated as ${decision}`;
      setRaw(STORAGE_KEY_OPS, ops);

      return {
        success: true,
        action: decision,
        message: `Task ${opsId} updated to ${item.status}.`
      };
    },

    /**
     * Toggle or update mission lifecycle state (useful for UI state switching & testing)
     * @param {string} missionId
     * @param {string} newStatus
     */
    async updateMissionStatus(missionId, newStatus) {
      await delay(100);
      const missions = getRaw(STORAGE_KEY_MISSIONS);
      const mission = missions.find(m => m.id.toUpperCase() === missionId.toUpperCase());

      if (!mission) {
        return { success: false, error: 'Mission not found.' };
      }

      mission.status = newStatus;
      setRaw(STORAGE_KEY_MISSIONS, missions);

      return {
        success: true,
        missionId,
        newStatus,
        message: `Mission ${missionId} status transitioned to "${newStatus}".`
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
