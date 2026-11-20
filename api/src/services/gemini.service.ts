import { GoogleGenAI } from '@google/genai';
import { env } from '../config/env.js';
import { GeminiExtraction, GeminiExtractionSchema, ProcessingMode } from '../schemas/extraction.schema.js';
import { CrossParticipantComparison, CrossParticipantComparisonSchema } from '../schemas/comparison.schema.js';
import { DecisionBrief, DecisionBriefSchema } from '../schemas/brief.schema.js';
import { EXTRACTION_SYSTEM_PROMPT, buildExtractionUserPrompt } from '../prompts/extraction.js';
import { COMPARISON_SYSTEM_PROMPT, buildComparisonUserPrompt } from '../prompts/comparison.js';
import { SYNTHESIS_SYSTEM_PROMPT, buildSynthesisUserPrompt } from '../prompts/synthesis.js';

export interface GeminiCallOptions {
  model?: string;
  timeoutMs?: number;
  maxRetries?: number;
  allowMockFallback?: boolean;
  forceLive?: boolean;
}

export class GeminiUnavailableError extends Error {
  constructor(message = 'Google Gemini AI intelligence service is unconfigured or unreachable.') {
    super(message);
    this.name = 'GeminiUnavailableError';
  }
}

export class GeminiService {
  private ai: GoogleGenAI | null = null;
  private modelName: string;

  constructor() {
    this.modelName = env.GEMINI_MODEL || 'gemini-3.5-flash-lite';
    if (env.GEMINI_API_KEY && env.GEMINI_API_KEY.trim().length > 0) {
      try {
        this.ai = new GoogleGenAI({ apiKey: env.GEMINI_API_KEY });
      } catch (err) {
        console.warn('⚠️ Could not initialize GoogleGenAI client:', err);
      }
    }
  }

  public isAvailable(): boolean {
    return !!this.ai && !!env.GEMINI_API_KEY && env.GEMINI_API_KEY.trim().length > 0;
  }

  public getModelName(): string {
    return this.modelName;
  }

  public getProcessingMode(): ProcessingMode {
    if (env.isTest) return 'DEMO_SYNTHETIC';
    if (this.isAvailable()) return 'LIVE_GEMINI';
    if (env.DEMO_MODE) return 'DEMO_SYNTHETIC';
    return 'ERROR_UNAVAILABLE';
  }

  /**
   * Sanitizes untrusted participant narrative to neutralize prompt injection patterns.
   */
  public sanitizeNarrative(text: string): string {
    if (!text) return '';
    return text
      .replace(/<\/?(system|assistant|user|participant_account)>/gi, '')
      .replace(/(ignore\s+all\s+previous\s+instructions|system\s*:|assistant\s*:|disregard\s+prior)/gi, '[REDACTED_PROMPT_INJECTION]');
  }

  /**
   * Safe content generation with exponential backoff & timeout
   */
  private async executeWithRetry<T>(
    operation: () => Promise<T>,
    maxRetries = 3,
    initialDelayMs = 1000
  ): Promise<T> {
    let attempt = 0;
    let delay = initialDelayMs;

    while (attempt < maxRetries) {
      try {
        return await operation();
      } catch (err: any) {
        attempt++;
        const isTransient = err?.status === 429 || err?.status === 503 || err?.code === 'ETIMEDOUT' || err?.message?.includes('fetch failed');
        if (attempt >= maxRetries || !isTransient) {
          throw err;
        }
        await new Promise(resolve => setTimeout(resolve, delay));
        delay *= 2;
      }
    }
    throw new GeminiUnavailableError('Maximum Gemini API call retries exceeded');
  }

  /**
   * Extract structured problem evidence from a participant submission
   */
  async extractEvidence(
    narrative: string,
    workaround: string,
    role?: string,
    workflow?: string,
    options?: GeminiCallOptions
  ): Promise<{ extraction: GeminiExtraction; modelUsed: string; processingMode: ProcessingMode; tokenEstimate?: number }> {
    const model = options?.model || this.modelName;
    const sanitizedNarrative = this.sanitizeNarrative(narrative);
    const sanitizedWorkaround = this.sanitizeNarrative(workaround);

    // Deterministic fallback for automated tests (or when Gemini unconfigured in dev)
    if (!this.isAvailable() || (env.isTest && !options?.forceLive)) {
      if (env.isProd || (!options?.allowMockFallback && !env.isTest && !env.DEMO_MODE)) {
        throw new GeminiUnavailableError(
          'Gemini extraction failed: Live Gemini API key is missing or unconfigured. Production fail-closed rule prevents silent synthetic generation.'
        );
      }

      // Explicit DEMO_SYNTHETIC mode only permitted in test / explicit dev demo environments
      return {
        extraction: this.generateDeterministicMockExtraction(sanitizedNarrative, sanitizedWorkaround, role, workflow),
        modelUsed: `${model}-mock-provider`,
        processingMode: 'DEMO_SYNTHETIC',
        tokenEstimate: Math.ceil((sanitizedNarrative.length + sanitizedWorkaround.length) / 4)
      };
    }

    const prompt = buildExtractionUserPrompt(sanitizedNarrative, sanitizedWorkaround, role, workflow);

    const callFn = async () => {
      const response = await this.ai!.models.generateContent({
        model,
        contents: [
          { role: 'user', parts: [{ text: `${EXTRACTION_SYSTEM_PROMPT}\n\n${prompt}` }] }
        ],
        config: {
          responseMimeType: 'application/json',
          maxOutputTokens: 8192
        }
      });

      let text = response.text || '';
      text = text.replace(/^```json\s*/i, '').replace(/```\s*$/i, '').trim();
      const parsed = JSON.parse(text);
      const validated = GeminiExtractionSchema.parse(parsed);
      return {
        extraction: validated,
        modelUsed: model,
        processingMode: 'LIVE_GEMINI' as ProcessingMode,
        tokenEstimate: response.usageMetadata?.totalTokenCount
      };
    };

    return this.executeWithRetry(callFn, options?.maxRetries ?? 3);
  }

  /**
   * Compare two participant sessions for causal mechanism alignment
   */
  async compareSessions(
    sessionA: any,
    sessionB: any,
    options?: GeminiCallOptions
  ): Promise<CrossParticipantComparison> {
    const model = options?.model || this.modelName;

    if (!this.isAvailable() || (env.isTest && !options?.forceLive)) {
      if (env.isProd || (!options?.allowMockFallback && !env.isTest && !env.DEMO_MODE)) {
        throw new GeminiUnavailableError('Gemini cross-participant comparison failed: live AI unavailable.');
      }
      return this.generateDeterministicMockComparison(sessionA, sessionB);
    }

    const prompt = buildComparisonUserPrompt(sessionA, sessionB);

    const callFn = async () => {
      const response = await this.ai!.models.generateContent({
        model,
        contents: [
          { role: 'user', parts: [{ text: `${COMPARISON_SYSTEM_PROMPT}\n\n${prompt}` }] }
        ],
        config: {
          responseMimeType: 'application/json',
          maxOutputTokens: 8192
        }
      });

      let text = response.text || '';
      text = text.replace(/^```json\s*/i, '').replace(/```\s*$/i, '').trim();
      const parsed = JSON.parse(text);
      return CrossParticipantComparisonSchema.parse(parsed);
    };

    return this.executeWithRetry(callFn, options?.maxRetries ?? 3);
  }

  /**
   * Synthesize a Decision Intelligence Brief across all verified evidence
   */
  async synthesizeBrief(
    mission: any,
    sessions: any[],
    analyses: any[],
    options?: GeminiCallOptions
  ): Promise<DecisionBrief> {
    const model = options?.model || this.modelName;

    if (!this.isAvailable() || (env.isTest && !options?.forceLive)) {
      if (env.isProd || (!options?.allowMockFallback && !env.isTest && !env.DEMO_MODE)) {
        throw new GeminiUnavailableError('Gemini brief synthesis failed: live AI unavailable.');
      }
      return this.generateDeterministicMockBrief(mission, sessions, analyses);
    }

    const prompt = buildSynthesisUserPrompt(mission, sessions, analyses);

    const callFn = async () => {
      const response = await this.ai!.models.generateContent({
        model,
        contents: [
          { role: 'user', parts: [{ text: `${SYNTHESIS_SYSTEM_PROMPT}\n\n${prompt}` }] }
        ],
        config: {
          responseMimeType: 'application/json',
          maxOutputTokens: 8192
        }
      });

      let text = response.text || '';
      text = text.replace(/^```json\s*/i, '').replace(/```\s*$/i, '').trim();
      const parsed = JSON.parse(text);
      if (!parsed.createdAt) {
        parsed.createdAt = new Date().toISOString();
      }
      if (!parsed.id) {
        parsed.id = `BRF-${mission.id.slice(4)}-${Date.now().toString(36).toUpperCase()}`;
      }
      if (!parsed.missionId) {
        parsed.missionId = mission.id;
      }
      if (!parsed.organizationId) {
        parsed.organizationId = mission.organizationId || 'ORG-DEFAULT';
      }
      if (!parsed.status) {
        parsed.status = 'DRAFT — REQUIRES HUMAN REVIEW';
      }
      return DecisionBriefSchema.parse(parsed);
    };

    return this.executeWithRetry(callFn, options?.maxRetries ?? 3);
  }

  // --- DETERMINISTIC HEURISTIC FALLBACKS (TEST & DEMO ONLY) ---

  public generateDeterministicMockExtraction(
    narrative: string,
    workaround: string,
    role = 'Screened Operator',
    workflow = 'Operational procurement workflow'
  ): GeminiExtraction {
    const quotes: string[] = [];
    const sentences = narrative.split(/(?<=[.?!])\s+/).filter(s => s.trim().length > 15);
    const primaryQuote = sentences[0] || narrative.substring(0, Math.min(narrative.length, 60));
    quotes.push(primaryQuote);

    const workaroundSentences = workaround.split(/(?<=[.?!])\s+/).filter(s => s.trim().length > 10);
    const workaroundQuote = workaroundSentences[0] || workaround.substring(0, Math.min(workaround.length, 50));
    if (workaroundQuote) quotes.push(workaroundQuote);

    const hasCurrency = /₹|rs\.?|inr|rupee|\$|cost|loss/i.test(narrative);
    const hasCadence = /daily|weekly|monthly|times|season|har baar|roj|hamesha|frequently|often/i.test(narrative);

    return {
      affectedParticipant: {
        content: role,
        category: 'REPORTED',
        sourceQuote: null,
        confidenceNotes: 'Derived from participant profile'
      },
      industryOrDomain: {
        content: 'Agricultural Logistics & Input Supply',
        category: 'INFERRED',
        sourceQuote: null,
        confidenceNotes: 'Heuristic domain inference'
      },
      operationalWorkflow: {
        content: workflow,
        category: 'REPORTED',
        sourceQuote: primaryQuote,
        confidenceNotes: 'Verbatim extracted from narrative'
      },
      reportedProblem: {
        content: primaryQuote,
        category: 'REPORTED',
        sourceQuote: primaryQuote,
        confidenceNotes: 'Primary obstacle reported by participant'
      },
      triggeringEvent: {
        content: 'Peak operational cycle demand surge',
        category: 'INFERRED',
        sourceQuote: null,
        confidenceNotes: 'Inferred contextual trigger'
      },
      consequencesReported: [
        {
          content: 'Operational disruption and reliance on non-standard informal channels',
          category: 'INFERRED',
          sourceQuote: null,
          confidenceNotes: 'Inferred consequence'
        }
      ],
      frequency: hasCadence ? {
        content: 'Reported during operational peak cycles',
        category: 'REPORTED',
        sourceQuote: primaryQuote,
        confidenceNotes: 'Cadence mentioned in narrative'
      } : {
        content: 'UNKNOWN',
        category: 'UNKNOWN',
        sourceQuote: null,
        confidenceNotes: 'Participant did not state an explicit frequency'
      },
      financialImpact: hasCurrency ? {
        content: 'Quantified monetary friction reported',
        category: 'REPORTED',
        sourceQuote: primaryQuote,
        confidenceNotes: 'Monetary reference found in source'
      } : {
        content: 'UNKNOWN',
        category: 'UNKNOWN',
        sourceQuote: null,
        confidenceNotes: 'No explicit currency or monetary loss specified'
      },
      currentWorkaround: {
        content: workaroundQuote || workaround,
        category: 'REPORTED',
        sourceQuote: workaroundQuote || workaround,
        confidenceNotes: 'Direct quote of current manual workaround'
      },
      contextualConstraints: [
        {
          content: 'Entrenched informal practices and cash flow synchronization',
          category: 'INFERRED',
          sourceQuote: null,
          confidenceNotes: 'Structural ecosystem dependency'
        }
      ],
      missingInformation: [
        'Precise annual volume impact',
        'Alternative regional supplier availability'
      ],
      potentialResearchQuestions: [
        'How would terms change if settlement occurred within 7 days?',
        'What formal guarantees would replace the informal trust relationship?'
      ],
      supportingQuotations: quotes,
      alternativeInterpretations: [
        'Behavior may be driven by seasonal liquidity shortages rather than product disloyalty'
      ]
    };
  }

  public generateDeterministicMockComparison(sessionA: any, sessionB: any): CrossParticipantComparison {
    const textA = ((sessionA.verbatim || '') + ' ' + (sessionA.workaround || '')).toLowerCase();
    const textB = ((sessionB.verbatim || '') + ' ' + (sessionB.workaround || '')).toLowerCase();

    const isCreditA = textA.includes('udhaar') || textA.includes('credit');
    const isCreditB = textB.includes('udhaar') || textB.includes('credit');

    const isPerishA = textA.includes('barish') || textA.includes('gulab') || textA.includes('customer');
    const isPerishB = textB.includes('shaadi') || textB.includes('cancel');

    let relationshipType: any = 'RELATED_SAME_MECHANISM';
    if (isCreditA && isCreditB) {
      relationshipType = 'RELATED_SAME_MECHANISM';
    } else if (isPerishA && isPerishB) {
      relationshipType = 'RELATED_DIFFERENT_MECHANISM';
    } else if (isCreditA !== isCreditB) {
      relationshipType = 'RELATED_DIFFERENT_MECHANISM';
    }

    const isContradiction = (isCreditA && (textB.includes('check') || textB.includes('inspect') || textB.includes('tractor') || textB.includes('return'))) ||
      (textA.includes('cash') && textB.includes('credit'));

    return {
      sessionIds: [sessionA.id, sessionB.id],
      relationship: relationshipType,
      sharedWorkflow: true,
      sharedImpact: true,
      mechanismComparison: `Participant ${sessionA.id} and ${sessionB.id} experience friction during seasonal supply procurement, but operate under distinct operational trade-offs.`,
      divergencePoints: ['Varying degrees of working capital availability vs physical inspection requirement'],
      contradictionDetected: isContradiction,
      contradictionDetails: isContradiction ? 'Operator A accepts credit lock-in while Operator B prioritizes physical pre-purchase inspection' : undefined,
      similarityScore: 0.85
    };
  }

  public generateDeterministicMockBrief(mission: any, sessions: any[], analyses: any[]): DecisionBrief {
    return {
      id: `BRF-${mission.id.replace('MSN-', '')}`,
      missionId: mission.id,
      organizationId: mission.organizationId || 'ORG-DEFAULT',
      title: `Decision Intelligence Brief: ${mission.problemToInvestigate.substring(0, 50)}`,
      status: 'DRAFT — REQUIRES HUMAN REVIEW',
      recommendation: 'REJECT_OR_REFRAME',
      recommendationRationale: 'Firsthand evidence reveals that structural working-capital barriers and informal dealer relationships make a standalone direct digital platform unviable without credit underwriting.',
      executiveSummary: `Across ${sessions.length} qualitative interviews, participants demonstrated that existing workarounds are deeply tied to informal credit lines and emergency turnaround guarantees.`,
      researchQuestion: mission.decisionAtStake,
      decisionAtStake: mission.decisionAtStake,
      hypothesis: mission.hypothesis || 'Original hypothesis',
      falsificationOutcome: 'FALSIFIED: Participants prioritize credit synchronization and inspection trust over digital price discovery.',
      sampleContext: {
        totalSessions: sessions.length,
        participantRoles: sessions.map(s => s.role || 'Screened Operator'),
        geographies: Array.from(new Set(sessions.map(s => s.location || 'India (Regional)'))),
        limitationsDisclaimer: 'Small qualitative research cohort (N=5). Qualitative indicators do not establish statistical prevalence or market size.'
      },
      observedWorkflows: [
        'Emergency seasonal input procurement',
        'Informal ledger credit recording',
        'Manual inspection and trust-based collection'
      ],
      coreProblems: [
        'Working capital depletion during peak operational windows',
        'Informal vendor lock-in preventing adoption of digital procurement tools'
      ],
      supportingEvidence: sessions.slice(0, 3).map(s => ({
        claim: s.impact || 'Severe operational friction',
        sourceSessionId: s.id,
        verbatimQuote: s.verbatim ? s.verbatim.substring(0, 60) : 'Firsthand participant account',
        operatorRole: s.role || 'Screened Operator'
      })),
      contradictoryFindings: [
        {
          aspect: 'Delivery Speed vs Inventory Buffering',
          observationA: 'Participant 1 requires delivery within 2 hours of rainfall.',
          observationB: 'Participant 2 maintains personal inventory buffer in home shed.',
          implication: 'Delivery time urgency varies by irrigation infrastructure.'
        }
      ],
      existingWorkarounds: [
        {
          workaround: 'Informal ledger credit line with local village retailer',
          costOrFriction: 'Implicit premium paid on materials in exchange for delayed payment terms',
          whyCurrentTechFails: 'Standard e-commerce platforms mandate instant online payment'
        }
      ],
      knownImpacts: [
        'Operators pay up to 8% implicit markup to preserve seasonal payment flexibility'
      ],
      unknownInformation: [
        'Annual default rate across unwritten rural retail ledgers'
      ],
      researchLimitations: [
        'Evidence collected from regional smallholders; enterprise agribusiness may behave differently'
      ],
      hypothesesGenerated: [
        'A merchant credit facilitation API would achieve 4x higher adoption than a B2C direct app'
      ],
      followUpQuestions: [
        'What interest rate would operators accept for formal digital working-capital credit?'
      ],
      decisionOptions: [
        {
          option: 'REJECT_OR_REFRAME',
          headline: 'Halt Direct B2C App Build — Pivot to Dealer Credit Enablement',
          description: 'Reallocate capital from consumer acquisition to dealer workflow and financing integration.',
          tradeOffs: 'Preserves engineering capital; requires B2B distribution partnership model.'
        }
      ],
      createdAt: new Date().toISOString(),
      approvedAt: null,
      approvedBy: null
    };
  }
}

export const geminiService = new GeminiService();
