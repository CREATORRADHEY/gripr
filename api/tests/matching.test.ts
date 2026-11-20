import { describe, it, expect, beforeAll } from 'vitest';
import { GeminiService } from '../src/services/gemini.service.js';
import { MatchingService } from '../src/services/matching.service.js';
import { memorySessionRepo } from '../src/repositories/memory.repository.js';

describe('D. Cross-Participant Similarity & Contradiction Analysis', () => {
  let geminiService: GeminiService;
  let matchingService: MatchingService;

  beforeAll(() => {
    geminiService = new GeminiService();
    matchingService = new MatchingService(memorySessionRepo, geminiService);
  });

  it('classifies two operators with the same causal root as RELATED_SAME_MECHANISM', async () => {
    const sessionA = {
      id: 'SES-TEST-A',
      role: 'Farmer A (4 Acres)',
      verbatim: 'Sharma ji dukan se udhaar lete hain. Fasal katne ke baad hisab hota hai. Online koi credit nahi deta.',
      workaround: 'Sharma ji ledger book'
    };

    const sessionB = {
      id: 'SES-TEST-B',
      role: 'Farmer B (5 Acres)',
      verbatim: 'Local agro center wale Gupta ji se udhaar milta hai. Mandi payment aane tak udhaar chalta hai.',
      workaround: 'Gupta ji khata book'
    };

    const comp = await geminiService.compareSessions(sessionA, sessionB);

    expect(comp.relationship).toBe('RELATED_SAME_MECHANISM');
    expect(comp.sharedWorkflow).toBe(true);
    expect(comp.mechanismComparison).toBeDefined();
  });

  it('distinguishes two operators in the same industry with different root causes as RELATED_DIFFERENT_MECHANISM', async () => {
    const sessionA = {
      id: 'SES-PERISH-1',
      role: 'Retail Florist',
      verbatim: 'Subah market se 50 bundle gulab laye the, par shaam tak barish ho gayi aur koi customer nahi aaya. Sab phool kharab ho gaye.',
      workaround: 'Discount pricing at 8pm'
    };

    const sessionB = {
      id: 'SES-PERISH-2',
      role: 'Event Florist',
      verbatim: 'Ek shaadi ka order tha, 200kg marigold mangwaya tha. Subah client ne function cancel kar diya. Advance nahi liya tha isliye pura nuksan hamara ho gaya.',
      workaround: 'Selling at mandi scrap rate'
    };

    const comp = await geminiService.compareSessions(sessionA, sessionB);

    expect(comp.relationship).toBe('RELATED_DIFFERENT_MECHANISM');
    expect(comp.divergencePoints.length).toBeGreaterThan(0);
  });

  it('detects operational contradiction between credit-seeking and inspection-seeking operators', async () => {
    const comp = await matchingService.comparePair('SES-401', 'SES-402');

    expect(comp).toBeDefined();
    expect(comp.sessionIds).toEqual(['SES-401', 'SES-402']);
    expect(comp.contradictionDetected).toBe(true);
    expect(comp.mechanismComparison).toBeDefined();
  });

  it('analyzeMission aggregates comparisons and guarantees isRepresentative: false', async () => {
    const synthesis = await matchingService.analyzeMission('MSN-2026-081');

    expect(synthesis.missionId).toBe('MSN-2026-081');
    expect(synthesis.comparisons.length).toBeGreaterThan(0);
    expect(synthesis.identifiedContradictions.length).toBeGreaterThan(0);

    for (const cluster of synthesis.observedClusters) {
      expect(cluster.isRepresentative).toBe(false);
    }
  });
});
