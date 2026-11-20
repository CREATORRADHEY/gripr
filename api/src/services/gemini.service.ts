import { GoogleGenAI } from '@google/genai';
import { env } from '../config/env.js';
import { GeminiExtraction, GeminiExtractionSchema } from '../schemas/extraction.schema.js';
import { CrossParticipantComparison, CrossParticipantComparisonSchema } from '../schemas/comparison.schema.js';
import { DecisionBrief, DecisionBriefSchema } from '../schemas/brief.schema.js';
import { EXTRACTION_SYSTEM_PROMPT, buildExtractionUserPrompt } from '../prompts/extraction.js';
import { COMPARISON_SYSTEM_PROMPT, buildComparisonUserPrompt } from '../prompts/comparison.js';
import { SYNTHESIS_SYSTEM_PROMPT, buildSynthesisUserPrompt } from '../prompts/synthesis.js';

export interface GeminiCallOptions {
  model?: string;
  timeoutMs?: number;
  maxRetries?: number;
}

export class GeminiService {
  private ai: GoogleGenAI | null = null;
  private modelName: string;

  constructor() {
    this.modelName = env.GEMINI_MODEL || 'gemini-2.5-flash';
    if (env.GEMINI_API_KEY) {
      try {
        this.ai = new GoogleGenAI({ apiKey: env.GEMINI_API_KEY });
      } catch (err) {
        console.warn('⚠️ Could not initialize GoogleGenAI client:', err);
      }
    }
  }

  public isAvailable(): boolean {
    return !!this.ai && !!env.GEMINI_API_KEY;
  }

  public getModelName(): string {
    return this.modelName;
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
    throw new Error('Maximum Gemini retries exceeded');
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
  ): Promise<{ extraction: GeminiExtraction; modelUsed: string; tokenEstimate?: number }> {
    const model = options?.model || this.modelName;

    // If live API is not configured or in mock test, provide faithful deterministic extraction
    if (!this.ai || !env.GEMINI_API_KEY) {
      return {
        extraction: this.generateDeterministicMockExtraction(narrative, workaround, role, workflow),
        modelUsed: `${model}-mock-provider`,
        tokenEstimate: Math.ceil((narrative.length + workaround.length) / 4)
      };
    }

    const prompt = buildExtractionUserPrompt(narrative, workaround, role, workflow);

    const callFn = async () => {
      const response = await this.ai!.models.generateContent({
        model,
        contents: [
          { role: 'user', parts: [{ text: `${EXTRACTION_SYSTEM_PROMPT}\n\n${prompt}` }] }
        ],
        config: {
          responseMimeType: 'application/json'
        }
      });

      const text = response.text || '';
      const parsed = JSON.parse(text);
      const validated = GeminiExtractionSchema.parse(parsed);
      return {
        extraction: validated,
        modelUsed: model,
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

    if (!this.ai || !env.GEMINI_API_KEY) {
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
          responseMimeType: 'application/json'
        }
      });

      const text = response.text || '';
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

    if (!this.ai || !env.GEMINI_API_KEY) {
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
          responseMimeType: 'application/json'
        }
      });

      const text = response.text || '';
      const parsed = JSON.parse(text);
      return DecisionBriefSchema.parse(parsed);
    };

    return this.executeWithRetry(callFn, options?.maxRetries ?? 3);
  }

  // --- DETERMINISTIC FALLBACK HELPERS FOR DEV / TEST MODE ---

  private generateDeterministicMockExtraction(
    narrative: string,
    workaround: string,
    role?: string,
    workflow?: string
  ): GeminiExtraction {
    // Extract real sentences as verbatim quotations so substring checks pass cleanly
    const sentences = narrative.split(/[.?!।]/).map(s => s.trim()).filter(s => s.length > 5);
    const firstQuote = sentences[0] || narrative.substring(0, Math.min(narrative.length, 60));
    const secondQuote = sentences[1] || (sentences.length > 0 ? sentences[0] : narrative);

    // Look for explicit numbers or currency in text; if absent, leave strictly UNKNOWN
    const hasRupees = narrative.includes('₹') || /rs\.?|inr|rupee/i.test(narrative);
    const hasFrequency = /daily|weekly|monthly|times|season|har baar|roj/i.test(narrative);

    return {
      affectedParticipant: {
        content: role || 'Screened Operator',
        category: 'REPORTED',
        sourceQuote: null
      },
      industryOrDomain: {
        content: 'Operational Field Logistics',
        category: 'INFERRED',
        sourceQuote: null
      },
      operationalWorkflow: {
        content: workflow || 'Procurement & supply workflow',
        category: 'REPORTED',
        sourceQuote: firstQuote
      },
      reportedProblem: {
        content: `Operational friction: ${narrative.substring(0, 80)}...`,
        category: 'REPORTED',
        sourceQuote: firstQuote
      },
      triggeringEvent: {
        content: 'Critical operational window or peak requirement',
        category: 'INFERRED',
        sourceQuote: null
      },
      consequencesReported: [
        {
          content: 'Delays and reliance on manual intervention',
          category: 'REPORTED',
          sourceQuote: secondQuote
        }
      ],
      frequency: {
        content: hasFrequency ? 'Reported recurring cadence' : 'Not stated',
        category: hasFrequency ? 'REPORTED' : 'UNKNOWN',
        sourceQuote: null
      },
      financialImpact: {
        content: hasRupees ? 'Reported monetary cost/overhead' : 'Not stated',
        category: hasRupees ? 'REPORTED' : 'UNKNOWN',
        sourceQuote: null
      },
      currentWorkaround: {
        content: workaround,
        category: 'REPORTED',
        sourceQuote: workaround.length > 60 ? workaround.substring(0, 60) : workaround
      },
      contextualConstraints: [
        {
          content: 'Local trust, credit, or physical inspection constraints override digital channels',
          category: 'INFERRED',
          sourceQuote: null
        }
      ],
      missingInformation: [
        'Exact seasonal volume turnover',
        'Specific contract terms with upstream suppliers'
      ],
      potentialResearchQuestions: [
        'How would operator behavior change if credit was decoupled from the local merchant?'
      ],
      supportingQuotations: [firstQuote, secondQuote].filter(Boolean),
      alternativeInterpretations: [
        'The reluctance to adopt digital tools may stem from tax visibility concerns rather than delivery friction.'
      ]
    };
  }

  private generateDeterministicMockComparison(sessionA: any, sessionB: any): CrossParticipantComparison {
    const textA = (sessionA.verbatim || '').toLowerCase();
    const textB = (sessionB.verbatim || '').toLowerCase();

    // Check if both mention credit/udhaar
    const aHasCredit = textA.includes('udhaar') || textA.includes('credit') || textA.includes('sharma');
    const bHasCredit = textB.includes('udhaar') || textB.includes('credit');

    // Check if both mention delivery/truck
    const aHasDelivery = textA.includes('delivery') || textA.includes('truck') || textA.includes('tractor');
    const bHasDelivery = textB.includes('delivery') || textB.includes('truck') || textB.includes('tractor');

    // Check for cancellation/breach vs foot-traffic/weather demand
    const aHasCancel = textA.includes('cancel') || textA.includes('shaadi') || textA.includes('order');
    const bHasCancel = textB.includes('cancel') || textB.includes('shaadi') || textB.includes('order');

    let relationship: any = 'RELATED_SAME_MECHANISM';
    let contradiction = false;
    let explanation = '';

    if (aHasCredit && bHasCredit) {
      relationship = 'RELATED_SAME_MECHANISM';
      explanation = 'Both participants experience lock-in due to informal retailer credit dependencies.';
    } else if (aHasCredit && !bHasCredit && bHasDelivery) {
      relationship = 'RELATED_DIFFERENT_MECHANISM';
      contradiction = true;
      explanation = 'Participant A prioritizes harvest credit over price, while Participant B can pay cash but refuses uninspected truck delivery.';
    } else if ((aHasCancel && !bHasCancel) || (!aHasCancel && bHasCancel)) {
      relationship = 'RELATED_DIFFERENT_MECHANISM';
      contradiction = false;
      explanation = 'Same domain but differing causal roots: one operator experiences client order cancellation, while the other experiences foot-traffic demand unpredictability.';
    } else {
      relationship = 'RELATED_SAME_MECHANISM';
      explanation = 'Both operators face severe operational friction during seasonal peaks.';
    }

    return {
      sessionIds: [sessionA.id, sessionB.id],
      relationship,
      sharedWorkflow: true,
      sharedImpact: true,
      mechanismComparison: explanation,
      divergencePoints: [
        'Differing financial liquidity and credit access',
        'Different tolerance for delivery arrival delays'
      ],
      contradictionDetected: contradiction,
      contradictionDetails: contradiction ? 'Contradictory trade-off between credit preservation and inspection requirements.' : undefined,
      similarityScore: relationship === 'RELATED_SAME_MECHANISM' ? 0.85 : 0.45
    };
  }

  private generateDeterministicMockBrief(mission: any, sessions: any[], analyses: any[]): DecisionBrief {
    return {
      id: `BRF-${mission.id.replace('MSN-', '')}`,
      missionId: mission.id,
      title: `${mission.orgName}: Problem Intelligence & Falsification Analysis`,
      status: 'DRAFT — REQUIRES HUMAN REVIEW',
      recommendation: 'REJECT_OR_REFRAME',
      recommendationRationale: 'Firsthand evidence reveals that operator resistance is driven by deeply embedded informal credit and inspection practices, falsifying the core assumption that lower spot prices alone drive adoption.',
      executiveSummary: `This qualitative research mission for ${mission.orgName} investigated ${mission.problemToInvestigate}. Across ${sessions.length} screened practitioner sessions, the hypothesis "${mission.hypothesis}" failed to hold against operational reality.`,
      researchQuestion: mission.problemToInvestigate,
      decisionAtStake: mission.decisionAtStake,
      hypothesis: mission.hypothesis,
      falsificationOutcome: 'FALSIFIED: Operators prioritize uncollateralized credit and on-site return inspection over price discounts.',
      sampleContext: {
        totalSessions: sessions.length,
        participantRoles: Array.from(new Set(sessions.map(s => s.role))),
        geographies: Array.from(new Set(sessions.map(s => s.location))),
        limitationsDisclaimer: 'Small qualitative research sample (N=5). Does not establish statistical prevalence or macro TAM.'
      },
      observedWorkflows: [
        'Informal credit extension linked to seasonal cashflow',
        'Physical pre-acceptance verification of bulky inputs'
      ],
      coreProblems: [
        'Financing lock-in: Digital solutions requiring upfront payment cannot replace harvest-cycle credit',
        'Last-mile delivery friction: Inability of commercial couriers to handle rural delivery and immediate returns'
      ],
      supportingEvidence: sessions.slice(0, 3).map(s => ({
        claim: `Operational constraint observed in ${s.role}`,
        sourceSessionId: s.id,
        verbatimQuote: s.verbatim.substring(0, Math.min(s.verbatim.length, 120)),
        operatorRole: s.role
      })),
      contradictoryFindings: [
        {
          aspect: 'Credit Lock-in vs Delivery Sensitivity',
          observationA: 'Cash-poor operators demand harvest credit even with higher bag prices.',
          observationB: 'Cash-sufficient operators demand physical inspection and refuse delivery trucks.',
          implication: 'A single consumer app cannot satisfy both segments simultaneously.'
        }
      ],
      existingWorkarounds: [
        {
          workaround: 'Local merchant credit ledger (Khata)',
          costOrFriction: 'Embedded premium paid per unit',
          whyCurrentTechFails: 'Informal ledger requires zero digital onboarding or bank underwriting.'
        }
      ],
      knownImpacts: [
        'Loss of price transparency',
        'High travel overhead for self-haulage'
      ],
      unknownInformation: [
        'Exact bad-debt write-off percentage of village merchants',
        'Regulatory barriers to digital fertilizer distribution'
      ],
      researchLimitations: [
        'Sample size (N=5) provides qualitative depth, not quantitative market validation.',
        'Regional clustering may not represent national distribution.'
      ],
      hypothesesGenerated: [
        'H2: Equipping village merchants with inventory software has higher adoption than direct-to-consumer apps.'
      ],
      followUpQuestions: [
        'What margin do local merchants earn on ancillary products?'
      ],
      decisionOptions: [
        {
          option: 'REJECT_OR_REFRAME',
          headline: 'Halt B2C Consumer Build; Reframe Toward Merchant Enablement',
          description: 'Avoid engineering spend on direct-to-consumer e-commerce. Investigate merchant software solutions.',
          tradeOffs: 'Saves initial capital; requires redesigning the core business model.'
        },
        {
          option: 'INVESTIGATE_FURTHER',
          headline: 'Conduct Rural NBFC Credit Partnership Scoping',
          description: 'Investigate if partnering with rural lenders to provide digital credit can remove the merchant lock-in.',
          tradeOffs: 'Delays timeline by 8-12 weeks; increases regulatory overhead.'
        }
      ],
      createdAt: new Date().toISOString()
    };
  }
}

export const geminiService = new GeminiService();
