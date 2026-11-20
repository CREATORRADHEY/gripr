import crypto from 'node:crypto';
import { IEvidenceRepository, IResearchResponseRepository } from '../repositories/interfaces.js';
import { GeminiService } from './gemini.service.js';
import { ValidatedAnalysis, GeminiExtraction, AnalysisStatus, ProcessingMode } from '../schemas/extraction.schema.js';
import { ResearchSession } from '../schemas/response.schema.js';

export class EvidenceService {
  constructor(
    private evidenceRepo: IEvidenceRepository,
    private sessionRepo: IResearchResponseRepository,
    private geminiService: GeminiService
  ) {}

  /**
   * Deterministically verify verbatim source quotations against raw participant text.
   * Every quote claimed by the AI must be an exact substring in the participant text.
   */
  public verifyQuotations(sourceText: string, extraction: GeminiExtraction): { valid: boolean; errors: string[]; flags: string[] } {
    const errors: string[] = [];
    const flags: string[] = [];

    // Normalize whitespace for fair comparison
    const normalizedSource = sourceText.replace(/\s+/g, ' ').toLowerCase();

    // 1. Check all explicit supportingQuotations
    for (const quote of extraction.supportingQuotations) {
      if (!quote || quote.trim().length === 0) continue;
      const normalizedQuote = quote.replace(/\s+/g, ' ').toLowerCase();
      if (!normalizedSource.includes(normalizedQuote)) {
        errors.push(`Quotation mismatch: The claimed quote "${quote.substring(0, 50)}..." does not exist verbatim in the source response.`);
      }
    }

    // 2. Check individual fact sourceQuotes
    const factsWithQuotes = [
      extraction.operationalWorkflow,
      extraction.reportedProblem,
      extraction.triggeringEvent,
      ...extraction.consequencesReported,
      extraction.currentWorkaround,
      extraction.frequency,
      extraction.financialImpact,
      ...extraction.contextualConstraints
    ];

    for (const fact of factsWithQuotes) {
      if (fact.category === 'REPORTED') {
        if (!fact.sourceQuote || fact.sourceQuote.trim().length === 0) {
          flags.push(`Fact "${fact.content.substring(0, 40)}" is categorized as REPORTED but has no source quotation.`);
        } else {
          const normFactQuote = fact.sourceQuote.replace(/\s+/g, ' ').toLowerCase();
          if (!normalizedSource.includes(normFactQuote)) {
            errors.push(`Verbatim verification failed: Quote "${fact.sourceQuote.substring(0, 40)}..." is not in source.`);
          }
        }
      } else if (fact.category === 'UNKNOWN') {
        // UNKNOWN fact should never have a source quote or claim empirical certainty
        if (fact.sourceQuote !== null && fact.sourceQuote !== undefined) {
          flags.push(`Fact "${fact.content.substring(0, 40)}" is UNKNOWN but carries a sourceQuote.`);
        }
      }
    }

    // 3. Financial & Frequency Hallucination Guards
    if (extraction.financialImpact.category === 'REPORTED') {
      const hasCurrency = /₹|rs\.?|inr|rupee|\$|cost|loss/i.test(sourceText);
      if (!hasCurrency) {
        errors.push('Financial impact claimed as REPORTED, but source text contains no currency or monetary loss statements.');
      }
    }

    if (extraction.frequency.category === 'REPORTED') {
      const hasCadence = /daily|weekly|monthly|times|season|har baar|roj|hamesha|frequently|often/i.test(sourceText);
      if (!hasCadence) {
        flags.push('Frequency claimed as REPORTED, but source text lacks explicit cadence indicators.');
      }
    }

    return {
      valid: errors.length === 0,
      errors,
      flags
    };
  }

  /**
   * Run Gemini extraction and deterministic verification on a participant session
   */
  async analyzeSession(sessionId: string, options?: { allowMockFallback?: boolean }): Promise<ValidatedAnalysis> {
    const session = await this.sessionRepo.findById(sessionId);
    if (!session) {
      throw new Error(`Participant session ${sessionId} not found`);
    }

    // Check if analysis already exists and is reviewed
    const existing = await this.evidenceRepo.findBySessionId(sessionId);
    if (existing && existing.status === 'reviewed') {
      return existing;
    }

    const combinedSource = `${session.verbatim} ${session.workaround} ${session.impact || ''}`.trim();

    try {
      // Call Gemini Service
      const { extraction, modelUsed, processingMode } = await this.geminiService.extractEvidence(
        session.verbatim,
        session.workaround,
        session.role,
        session.workflow,
        options
      );

      // Run deterministic verification
      const verification = this.verifyQuotations(combinedSource, extraction);

      let status: AnalysisStatus = 'awaiting_review';
      if (!verification.valid) {
        status = 'flagged';
      }

      const validatedAnalysis: ValidatedAnalysis = {
        id: `ANL-${sessionId.replace('SES-', '')}`,
        sessionId: session.id,
        missionId: session.missionId,
        sourceHash: session.sourceHash,
        modelUsed,
        promptVersion: '1.0.0-evidence-first',
        processingMode,
        timestamp: new Date().toISOString(),
        status,
        validationOutcome: {
          valid: verification.valid,
          quotationVerificationErrors: verification.errors,
          missingFields: extraction.missingInformation,
          flags: verification.flags
        },
        extraction
      };

      return this.evidenceRepo.saveAnalysis(validatedAnalysis);
    } catch (err: any) {
      // Fail closed: record processing failure, DO NOT invent fake data
      const failedAnalysis: ValidatedAnalysis = {
        id: `ANL-${sessionId.replace('SES-', '')}`,
        sessionId: session.id,
        missionId: session.missionId,
        sourceHash: session.sourceHash,
        modelUsed: 'unavailable',
        promptVersion: '1.0.0-evidence-first',
        processingMode: 'ERROR_UNAVAILABLE',
        timestamp: new Date().toISOString(),
        status: 'analysis_failed',
        validationOutcome: {
          valid: false,
          quotationVerificationErrors: [],
          missingFields: [],
          flags: [err.message || 'Gemini extraction failed']
        },
        extraction: {
          affectedParticipant: { content: 'UNKNOWN', category: 'UNKNOWN', sourceQuote: null },
          industryOrDomain: { content: 'UNKNOWN', category: 'UNKNOWN', sourceQuote: null },
          operationalWorkflow: { content: 'UNKNOWN', category: 'UNKNOWN', sourceQuote: null },
          reportedProblem: { content: 'UNKNOWN', category: 'UNKNOWN', sourceQuote: null },
          triggeringEvent: { content: 'UNKNOWN', category: 'UNKNOWN', sourceQuote: null },
          consequencesReported: [],
          frequency: { content: 'UNKNOWN', category: 'UNKNOWN', sourceQuote: null },
          financialImpact: { content: 'UNKNOWN', category: 'UNKNOWN', sourceQuote: null },
          currentWorkaround: { content: 'UNKNOWN', category: 'UNKNOWN', sourceQuote: null },
          contextualConstraints: [],
          missingInformation: ['Analysis failed due to AI service unavailability'],
          potentialResearchQuestions: [],
          supportingQuotations: [],
          alternativeInterpretations: []
        },
        reviewerNotes: `AI Extraction Failed: ${err.message}`
      };

      await this.evidenceRepo.saveAnalysis(failedAnalysis);
      throw err;
    }
  }

  /**
   * Moderate or review an analysis
   */
  async reviewAnalysis(
    analysisId: string,
    decision: 'reviewed' | 'flagged' | 'rejected',
    notes?: string,
    reviewer = 'Research Lead'
  ): Promise<ValidatedAnalysis | null> {
    return this.evidenceRepo.updateStatus(analysisId, decision, notes, reviewer);
  }

  async getAnalysisBySessionId(sessionId: string): Promise<ValidatedAnalysis | null> {
    return this.evidenceRepo.findBySessionId(sessionId);
  }
}
