import { describe, it, expect, beforeAll } from 'vitest';
import { GeminiService } from '../src/services/gemini.service.js';
import { BriefService } from '../src/services/brief.service.js';
import {
  memoryBriefRepo,
  memoryMissionRepo,
  memorySessionRepo,
  memoryEvidenceRepo
} from '../src/repositories/memory.repository.js';

describe('Decision Intelligence Brief Synthesis', () => {
  let geminiService: GeminiService;
  let briefService: BriefService;

  beforeAll(() => {
    geminiService = new GeminiService();
    briefService = new BriefService(
      memoryBriefRepo,
      memoryMissionRepo,
      memorySessionRepo,
      memoryEvidenceRepo,
      geminiService
    );
  });

  it('generates a 15-section Decision Intelligence Brief initially marked as DRAFT', async () => {
    const brief = await briefService.generateBrief('MSN-2026-081');

    expect(brief).toBeDefined();
    expect(brief.missionId).toBe('MSN-2026-081');
    expect(brief.status).toBe('DRAFT — REQUIRES HUMAN REVIEW');
    expect(brief.approvedAt).toBeNull();
    expect(brief.approvedBy).toBeNull();

    expect(brief.researchQuestion).toBeDefined();
    expect(brief.decisionAtStake).toBeDefined();
    expect(brief.hypothesis).toBeDefined();
    expect(brief.falsificationOutcome).toBeDefined();
    expect(brief.supportingEvidence.length).toBeGreaterThan(0);
    expect(brief.contradictoryFindings.length).toBeGreaterThan(0);
    expect(brief.existingWorkarounds.length).toBeGreaterThan(0);
    expect(brief.researchLimitations.length).toBeGreaterThan(0);
    expect(brief.decisionOptions.length).toBeGreaterThan(0);

    const validOptions = ['REJECT_OR_REFRAME', 'INVESTIGATE_FURTHER', 'CONSIDER_PILOT'];
    expect(validOptions).toContain(brief.recommendation);
    for (const opt of brief.decisionOptions) {
      expect(validOptions).toContain(opt.option);
    }
  });

  it('refuses to generate a brief when a mission has 0 participant sessions', async () => {
    const emptyMission = await memoryMissionRepo.create({
      orgName: 'Empty Test Mission Inc',
      contactPerson: 'Tester',
      contactEmail: 'tester@example.in',
      decisionAtStake: 'Testing empty brief generation prevention rule.',
      problemToInvestigate: 'Testing missing participant qualitative evidence guardrail.',
      targetParticipantProfile: 'Any operator',
      consentPrivacy: true
    });

    await expect(briefService.generateBrief(emptyMission.id)).rejects.toThrow(
      /No participant research sessions recorded yet/
    );
  });

  it('approves a brief only through explicit human researcher sign-off', async () => {
    const approvedBrief = await briefService.approveBrief('MSN-2026-081', 'Dr. Radhika Sharma (Principal Researcher)');

    expect(approvedBrief.status).toBe('APPROVED');
    expect(approvedBrief.approvedBy).toBe('Dr. Radhika Sharma (Principal Researcher)');
    expect(approvedBrief.approvedAt).toBeDefined();

    const mission = await memoryMissionRepo.findById('MSN-2026-081');
    expect(mission?.status).toBe('Brief Ready');
  });
});
