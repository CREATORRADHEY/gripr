/**
 * GRIPR.STUDIO — Frontend API Service Abstraction (Phase 1)
 * 
 * Provides a clean Promise-based API layer decoupling UI components from data storage.
 * In Phase 1, it reads and updates synthetic fixtures (seeded from js/fixtures.js and
 * persisted in localStorage). In Phase 2, these methods will point to Cloud Run / Firestore / Gemini API
 * without modifying UI templates or interaction code.
 */

(function () {
  const STORAGE_KEY_SIGNALS = 'gripr_signals_store_v1';
  const STORAGE_KEY_QUEUE = 'gripr_admin_queue_v1';
  const STORAGE_KEY_MISSIONS = 'gripr_missions_store_v1';

  // Seed storage if empty
  function initStore() {
    if (!localStorage.getItem(STORAGE_KEY_SIGNALS)) {
      const initialSignals = window.GRIPR_FIXTURES ? window.GRIPR_FIXTURES.signals : [];
      localStorage.setItem(STORAGE_KEY_SIGNALS, JSON.stringify(initialSignals));
    }
    if (!localStorage.getItem(STORAGE_KEY_QUEUE)) {
      const initialQueue = window.GRIPR_FIXTURES ? window.GRIPR_FIXTURES.adminQueue : [];
      localStorage.setItem(STORAGE_KEY_QUEUE, JSON.stringify(initialQueue));
    }
    if (!localStorage.getItem(STORAGE_KEY_MISSIONS)) {
      const initialMissions = window.GRIPR_FIXTURES ? window.GRIPR_FIXTURES.sampleMissions : [];
      localStorage.setItem(STORAGE_KEY_MISSIONS, JSON.stringify(initialMissions));
    }
  }

  initStore();

  function getRawSignals() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY_SIGNALS)) || [];
    } catch (e) {
      return window.GRIPR_FIXTURES ? window.GRIPR_FIXTURES.signals : [];
    }
  }

  function getRawQueue() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY_QUEUE)) || [];
    } catch (e) {
      return window.GRIPR_FIXTURES ? window.GRIPR_FIXTURES.adminQueue : [];
    }
  }

  function getRawMissions() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY_MISSIONS)) || [];
    } catch (e) {
      return window.GRIPR_FIXTURES ? window.GRIPR_FIXTURES.sampleMissions : [];
    }
  }

  // Simulated async latency for realistic skeleton and transition validation
  function delay(ms = 120) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  window.GriprAPI = {
    /**
     * Fetch list of verified signals with optional filters
     * @param {Object} options
     * @param {string} options.category - e.g. 'all', 'agriculture', 'healthcare'
     * @param {string} options.search - search keyword
     * @param {string} options.evidenceStatus - 'all', 'Verified Firsthand', 'Triangulated', 'Emerging'
     */
    async getSignals({ category = 'all', search = '', evidenceStatus = 'all' } = {}) {
      await delay(100);
      let list = getRawSignals();

      if (category && category !== 'all') {
        const catLower = category.toLowerCase();
        list = list.filter(s => (s.category || '').toLowerCase() === catLower);
      }

      if (evidenceStatus && evidenceStatus !== 'all') {
        list = list.filter(s => s.evidenceStatus === evidenceStatus);
      }

      if (search && search.trim() !== '') {
        const query = search.toLowerCase().trim();
        list = list.filter(s => {
          const matchTitle = (s.title || '').toLowerCase().includes(query);
          const matchQuote = (s.quote || '').toLowerCase().includes(query);
          const matchTrans = (s.translation || '').toLowerCase().includes(query);
          const matchRegion = (s.region || '').toLowerCase().includes(query);
          const matchWorkaround = (s.workaround || '').toLowerCase().includes(query);
          const matchId = (s.id || '').toLowerCase().includes(query);
          return matchTitle || matchQuote || matchTrans || matchRegion || matchWorkaround || matchId;
        });
      }

      return {
        success: true,
        count: list.length,
        totalInStore: getRawSignals().length,
        signals: list
      };
    },

    /**
     * Fetch full case file for a single signal
     * @param {string} id - e.g. 'SIG-019'
     */
    async getSignalById(id) {
      await delay(80);
      if (!id) return { success: false, error: 'No signal ID provided' };

      const list = getRawSignals();
      const signal = list.find(s => s.id.toUpperCase() === id.toUpperCase());

      if (!signal) {
        return { success: false, error: `Signal ${id} not found in intelligence registry.` };
      }

      // Populate related signals
      let related = [];
      if (signal.relatedSignalIds && signal.relatedSignalIds.length > 0) {
        related = list.filter(s => signal.relatedSignalIds.includes(s.id));
      }

      return {
        success: true,
        signal,
        related
      };
    },

    /**
     * Submit a firsthand problem report from a contributor
     * @param {Object} data
     */
    async submitSignal(data) {
      await delay(250);

      // Validate required fields
      if (!data.frustration || data.frustration.trim().length < 20) {
        return {
          success: false,
          errors: { frustration: 'Please describe the frustration in at least 20 characters.' }
        };
      }

      if (!data.workaround || data.workaround.trim().length < 5) {
        return {
          success: false,
          errors: { workaround: 'Please describe how people currently deal with this problem.' }
        };
      }

      if (!data.consentPublic) {
        return {
          success: false,
          errors: { consentPublic: 'Publication consent is required to log this problem.' }
        };
      }

      if (data.consentContact && (!data.email || !data.email.includes('@'))) {
        return {
          success: false,
          errors: { email: 'Please provide a valid email if you choose to allow builder contact.' }
        };
      }

      // Generate a synthetic intake ID
      const timestamp = new Date().toISOString();
      const randomSuffix = Math.floor(1000 + Math.random() * 9000);
      const trackingId = `SIG-INTAKE-${randomSuffix}`;

      // Create new intake record for the admin review queue
      const newQueueItem = {
        id: `REV-${randomSuffix}`,
        trackingId: trackingId,
        submittedAt: timestamp,
        contributorMeta: `${data.role || 'Unspecified Operator'}, ${data.region || 'India'}`,
        category: data.category || 'other',
        region: data.region || 'Unspecified Region',
        language: data.language || 'Vernacular / Mixed',
        verbatim: data.frustration.trim(),
        workaround: data.workaround.trim(),
        consent: {
          publicAnonymized: true,
          allowBuilderContact: !!data.consentContact,
          contactEmail: data.consentContact ? data.email.trim() : null
        },
        extracted: {
          actor: data.role || 'Observed Operator',
          trigger: 'Reported workflow friction',
          impact: 'Awaiting human review & extraction verification',
          workaround: data.workaround.trim(),
          flaggedUnknowns: 'Preliminary intake — verification pending'
        },
        candidateMatches: [],
        reviewStatus: 'pending'
      };

      const queue = getRawQueue();
      queue.unshift(newQueueItem);
      localStorage.setItem(STORAGE_KEY_QUEUE, JSON.stringify(queue));

      return {
        success: true,
        trackingId: trackingId,
        status: 'queued_for_review',
        message: 'Your report has been queued for human verification and extraction.'
      };
    },

    /**
     * Submit an organization research mission scoping request
     * @param {Object} missionData
     */
    async createMission(missionData) {
      await delay(250);

      const errors = {};
      if (!missionData.orgName || missionData.orgName.trim().length < 2) {
        errors.orgName = 'Organization / Team name is required.';
      }
      if (!missionData.contactEmail || !missionData.contactEmail.includes('@')) {
        errors.contactEmail = 'Valid work email is required.';
      }
      if (!missionData.problemToInvestigate || missionData.problemToInvestigate.trim().length < 20) {
        errors.problemToInvestigate = 'Please describe the problem or sector to investigate in at least 20 characters.';
      }
      if (!missionData.targetAudience || missionData.targetAudience.trim().length < 5) {
        errors.targetAudience = 'Please specify the target operator or audience profile.';
      }

      if (Object.keys(errors).length > 0) {
        return { success: false, errors };
      }

      const randomCode = Math.floor(100 + Math.random() * 900);
      const missionRef = `MSN-2026-${randomCode}`;

      const newMission = {
        id: missionRef,
        createdAt: new Date().toISOString(),
        orgName: missionData.orgName.trim(),
        contactEmail: missionData.contactEmail.trim(),
        role: missionData.role || 'Product Lead',
        sector: missionData.sector || 'General Workflow',
        problemToInvestigate: missionData.problemToInvestigate.trim(),
        targetAudience: missionData.targetAudience.trim(),
        primaryDecision: missionData.primaryDecision ? missionData.primaryDecision.trim() : 'Unspecified',
        deliverables: missionData.deliverables || ['Decision Brief', 'Workflow Friction Map'],
        status: 'Scoping Submitted',
        price: '₹49,000 (Pilot Scope)'
      };

      const missions = getRawMissions();
      missions.unshift(newMission);
      localStorage.setItem(STORAGE_KEY_MISSIONS, JSON.stringify(missions));

      return {
        success: true,
        missionRef: missionRef,
        status: 'Scoping Confirmed',
        sla: '24 business hours for researcher review and mutual NDA dispatch.'
      };
    },

    /**
     * Fetch intake queue for Admin review desk
     */
    async getAdminQueue() {
      await delay(80);
      const queue = getRawQueue();
      const signals = getRawSignals();
      return {
        success: true,
        pendingCount: queue.filter(q => q.reviewStatus === 'pending').length,
        approvedCount: signals.length,
        flaggedCount: queue.filter(q => q.reviewStatus === 'needs_info').length,
        queue: queue
      };
    },

    /**
     * Process an admin moderation decision on an intake item
     * @param {string} id - e.g. 'REV-104'
     * @param {'approve'|'reject'|'flag'} decision
     * @param {Object} [details]
     */
    async reviewSignal(id, decision, details = {}) {
      await delay(150);
      const queue = getRawQueue();
      const itemIndex = queue.findIndex(q => q.id === id);

      if (itemIndex === -1) {
        return { success: false, error: 'Queue item not found.' };
      }

      const item = queue[itemIndex];

      if (decision === 'approve') {
        item.reviewStatus = 'approved';

        // Add to public verified signals
        const signals = getRawSignals();
        const nextIdNumber = signals.length + 1;
        const newSigId = `SIG-${String(nextIdNumber).padStart(3, '0')}`;

        const newSignal = {
          id: newSigId,
          title: details.title || `Operational Inefficiency in ${item.category.toUpperCase()}`,
          quote: item.verbatim,
          translation: item.verbatim,
          category: item.category,
          region: item.region,
          month: 'May 2026',
          language: item.language,
          evidenceStatus: 'Verified Firsthand',
          actor: item.extracted.actor || item.contributorMeta,
          incident: item.extracted.trigger || 'Firsthand reported operational friction',
          impact: item.extracted.impact || 'Verified firsthand operational friction',
          workaround: item.workaround || 'Manual workaround documented',
          researchGaps: [
            'Newly approved firsthand signal; corroborating independent reports requested',
            'Pilot market willingness-to-pay unverified'
          ],
          limitations: 'Newly accepted firsthand report from field intake desk.',
          relatedSignalIds: []
        };

        signals.unshift(newSignal);
        localStorage.setItem(STORAGE_KEY_SIGNALS, JSON.stringify(signals));
        localStorage.setItem(STORAGE_KEY_QUEUE, JSON.stringify(queue));

        return {
          success: true,
          action: 'approved',
          assignedSignalId: newSigId,
          message: `Submission ${id} approved and published as ${newSigId} to Problem Explorer.`
        };
      } else if (decision === 'reject') {
        item.reviewStatus = 'rejected';
        item.rejectReason = details.reason || 'Insufficient verifiable firsthand detail';
        localStorage.setItem(STORAGE_KEY_QUEUE, JSON.stringify(queue));
        return {
          success: true,
          action: 'rejected',
          message: `Submission ${id} marked out of scope.`
        };
      } else if (decision === 'flag') {
        item.reviewStatus = 'needs_info';
        item.flagNote = details.note || 'Requires corroborating operator evidence';
        localStorage.setItem(STORAGE_KEY_QUEUE, JSON.stringify(queue));
        return {
          success: true,
          action: 'flagged',
          message: `Submission ${id} flagged for evidence follow-up.`
        };
      }

      return { success: false, error: 'Invalid decision action.' };
    },

    /**
     * Reset store back to clean initial fixtures (useful for testing)
     */
    resetFixtures() {
      if (window.GRIPR_FIXTURES) {
        localStorage.setItem(STORAGE_KEY_SIGNALS, JSON.stringify(window.GRIPR_FIXTURES.signals));
        localStorage.setItem(STORAGE_KEY_QUEUE, JSON.stringify(window.GRIPR_FIXTURES.adminQueue));
        localStorage.setItem(STORAGE_KEY_MISSIONS, JSON.stringify(window.GRIPR_FIXTURES.sampleMissions));
      }
      return { success: true, message: 'Synthetic fixtures re-initialized.' };
    }
  };
})();
