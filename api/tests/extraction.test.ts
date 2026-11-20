import { describe, it, expect, beforeAll } from 'vitest';
import { GeminiService } from '../src/services/gemini.service.js';
import { EvidenceService } from '../src/services/evidence.service.js';
import { memoryEvidenceRepo, memorySessionRepo } from '../src/repositories/memory.repository.js';
import { GeminiExtraction } from '../src/schemas/extraction.schema.js';

describe('B. Gemini Extraction & C. Evidence Integrity Layer', () => {
  let geminiService: GeminiService;
  let evidenceService: EvidenceService;

  beforeAll(() => {
    geminiService = new GeminiService();
    evidenceService = new EvidenceService(memoryEvidenceRepo, memorySessionRepo, geminiService);
  });

  it('extracts structured facts and distinguishes REPORTED vs INFERRED vs UNKNOWN', async () => {
    const narrative = 'Sowing ke time par fertilizer nahi mila toh fasal kharab ho jayegi. Dukan wale Sharma ji se udhaar milta hai fasal katne tak. Online agar 10% sasta bhi mile, par wo udhaar nahi dega aur delivery kab aayegi koi bharosa nahi.';
    const workaround = 'Personal village retailer credit ledger (Khata book)';

    const { extraction } = await geminiService.extractEvidence(
      narrative,
      workaround,
      'Smallholder Farmer (Sugarcane/Wheat)',
      'Peak seasonal sowing procurement'
    );

    expect(extraction.operationalWorkflow).toBeDefined();
    expect(extraction.reportedProblem).toBeDefined();
    expect(extraction.reportedProblem.category).toBe('REPORTED');
    expect(extraction.currentWorkaround.category).toBe('REPORTED');

    // Untrusted inputs should never invent frequency or financial loss if not explicitly provided
    expect(['REPORTED', 'UNKNOWN']).toContain(extraction.frequency.category);
    expect(['REPORTED', 'UNKNOWN']).toContain(extraction.financialImpact.category);
  });

  it('deterministic verification flags quotation mismatches if AI hallucinates a quote', () => {
    const rawNarrative = 'Truck delivery village road par nahi aati. Tractor se bori laani padti hai.';

    const mockExtraction: GeminiExtraction = {
      affectedParticipant: { content: 'Farmer', category: 'REPORTED', sourceQuote: null },
      industryOrDomain: { content: 'Agri', category: 'INFERRED', sourceQuote: null },
      operationalWorkflow: { content: 'Logistics', category: 'REPORTED', sourceQuote: 'Truck delivery village road par nahi aati.' },
      reportedProblem: { content: 'Road access failure', category: 'REPORTED', sourceQuote: 'Truck delivery village road par nahi aati.' },
      triggeringEvent: { content: 'Sowing deadline', category: 'INFERRED', sourceQuote: null },
      consequencesReported: [],
      frequency: { content: 'Not stated', category: 'UNKNOWN', sourceQuote: null },
      financialImpact: { content: 'Not stated', category: 'UNKNOWN', sourceQuote: null },
      currentWorkaround: { content: 'Tractor', category: 'REPORTED', sourceQuote: 'Tractor se bori laani padti hai.' },
      contextualConstraints: [],
      missingInformation: [],
      potentialResearchQuestions: [],
      // HALLUCINATED QUOTE that does NOT exist in rawNarrative
      supportingQuotations: [
        'Truck delivery village road par nahi aati.',
        'This completely fabricated quotation was never spoken by the farmer.'
      ],
      alternativeInterpretations: []
    };

    const verification = evidenceService.verifyQuotations(rawNarrative, mockExtraction);

    expect(verification.valid).toBe(false);
    expect(verification.errors.length).toBeGreaterThan(0);
    expect(verification.errors[0]).toContain('Quotation mismatch');
  });

  it('flags financial impact claims when source text contains no currency or cost statements', () => {
    const sourceWithoutMoney = 'We called the distributor three times but the shipment was delayed.';

    const mockExtraction: GeminiExtraction = {
      affectedParticipant: { content: 'Manager', category: 'REPORTED', sourceQuote: null },
      industryOrDomain: { content: 'Logistics', category: 'INFERRED', sourceQuote: null },
      operationalWorkflow: { content: 'Dispatch', category: 'REPORTED', sourceQuote: null },
      reportedProblem: { content: 'Delayed shipment', category: 'REPORTED', sourceQuote: 'shipment was delayed' },
      triggeringEvent: { content: 'Order dispatch', category: 'INFERRED', sourceQuote: null },
      consequencesReported: [],
      frequency: { content: 'Not stated', category: 'UNKNOWN', sourceQuote: null },
      // FALSE REPORTED FINANCIAL CLAIM without any money in text
      financialImpact: {
        content: 'Lost ₹50,000 in cancelled revenue',
        category: 'REPORTED',
        sourceQuote: 'cancelled revenue'
      },
      currentWorkaround: { content: 'Phone calls', category: 'REPORTED', sourceQuote: 'called the distributor' },
      contextualConstraints: [],
      missingInformation: [],
      potentialResearchQuestions: [],
      supportingQuotations: ['shipment was delayed'],
      alternativeInterpretations: []
    };

    const verification = evidenceService.verifyQuotations(sourceWithoutMoney, mockExtraction);

    expect(verification.valid).toBe(false);
    expect(verification.errors.some(e => e.includes('Financial impact claimed as REPORTED'))).toBe(true);
  });

  it('end-to-end analyzeSession stores ValidatedAnalysis in repository with provenance hash', async () => {
    const analysis = await evidenceService.analyzeSession('SES-401');

    expect(analysis).toBeDefined();
    expect(analysis.sessionId).toBe('SES-401');
    expect(analysis.missionId).toBe('MSN-2026-081');
    expect(analysis.sourceHash).toBeDefined();
    expect(analysis.sourceHash.length).toBe(64); // SHA-256
    expect(analysis.extraction).toBeDefined();
    expect(analysis.validationOutcome).toBeDefined();
    expect(['awaiting_review', 'reviewed', 'flagged']).toContain(analysis.status);
  });
});
