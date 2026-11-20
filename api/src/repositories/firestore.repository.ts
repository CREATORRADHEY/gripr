import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {
  IMissionInquiryRepository,
  IMissionRepository,
  IInvitationRepository,
  IResearchResponseRepository,
  IEvidenceRepository,
  IBriefRepository,
  IConsentRepository,
  IAuditLogRepository,
  IOperationsRepository,
  OperationsQueueItem
} from './interfaces.js';
import { Mission, CreateMissionInput, MissionStatus } from '../schemas/mission.schema.js';
import { MissionInquiry, CreateMissionInquiryInput, MissionInquiryStatus } from '../schemas/inquiry.schema.js';
import { ResearchSession, ResearchInvitation, SubmitResearchResponseInput } from '../schemas/response.schema.js';
import { ValidatedAnalysis, AnalysisStatus } from '../schemas/extraction.schema.js';
import { DecisionBrief, BriefStatus } from '../schemas/brief.schema.js';
import { ConsentRecord } from '../schemas/consent.schema.js';
import { AuditLogEntry, AuditAction } from '../schemas/audit.schema.js';

export class FirestoreStorageEngine {
  private baseDir: string;

  constructor(customBaseDir?: string) {
    this.baseDir = customBaseDir || path.resolve(process.cwd(), 'data/firestore');
    this.ensureDirectories();
  }

  private ensureDirectories() {
    const collections = [
      'mission_inquiries',
      'missions',
      'research_invitations',
      'research_responses',
      'evidence',
      'match_candidates',
      'briefs',
      'consents',
      'audit_logs',
      'operations_queue'
    ];

    for (const col of collections) {
      const dir = path.join(this.baseDir, col);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
    }
  }

  public writeDoc<T>(collection: string, docId: string, data: T): T {
    const dir = path.join(this.baseDir, collection);
    const filePath = path.join(dir, `${docId}.json`);
    const tempPath = path.join(dir, `${docId}.${Date.now()}.${Math.random().toString(36).substring(2, 6)}.tmp`);

    const serialized = JSON.stringify(data, null, 2);
    fs.writeFileSync(tempPath, serialized, 'utf8');
    fs.renameSync(tempPath, filePath);
    return data;
  }

  public readDoc<T>(collection: string, docId: string): T | null {
    const filePath = path.join(this.baseDir, collection, `${docId}.json`);
    if (!fs.existsSync(filePath)) return null;
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      return JSON.parse(content) as T;
    } catch {
      return null;
    }
  }

  public listDocs<T>(collection: string): T[] {
    const dir = path.join(this.baseDir, collection);
    if (!fs.existsSync(dir)) return [];
    const files = fs.readdirSync(dir).filter(f => f.endsWith('.json'));
    const results: T[] = [];
    for (const file of files) {
      try {
        const content = fs.readFileSync(path.join(dir, file), 'utf8');
        results.push(JSON.parse(content) as T);
      } catch {
        // Skip corrupted or transient temp files
      }
    }
    return results;
  }
}

// 1. MISSION INQUIRIES
export class FirestoreMissionInquiryRepository implements IMissionInquiryRepository {
  constructor(private storage: FirestoreStorageEngine) {}

  async create(input: CreateMissionInquiryInput): Promise<MissionInquiry> {
    const id = `INQ-${Date.now().toString(36).toUpperCase()}-${crypto.randomBytes(3).toString('hex').toUpperCase()}`;
    const inquiry: MissionInquiry = {
      ...input,
      id,
      status: 'AWAITING_SCOPE_REVIEW',
      pricingNotice: 'Experimental pilot pricing. Unvalidated research model.',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    return this.storage.writeDoc('mission_inquiries', id, inquiry);
  }

  async findById(id: string): Promise<MissionInquiry | null> {
    return this.storage.readDoc<MissionInquiry>('mission_inquiries', id);
  }

  async findAll(): Promise<MissionInquiry[]> {
    return this.storage.listDocs<MissionInquiry>('mission_inquiries').sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }

  async updateStatus(
    id: string,
    status: MissionInquiryStatus,
    reviewer?: string,
    notes?: string,
    convertedMissionId?: string
  ): Promise<MissionInquiry | null> {
    const inquiry = this.storage.readDoc<MissionInquiry>('mission_inquiries', id);
    if (!inquiry) return null;

    inquiry.status = status;
    inquiry.updatedAt = new Date().toISOString();
    if (reviewer) inquiry.reviewedBy = reviewer;
    if (notes) inquiry.reviewNotes = notes;
    if (convertedMissionId) inquiry.convertedMissionId = convertedMissionId;

    return this.storage.writeDoc('mission_inquiries', id, inquiry);
  }
}

// 2. MISSIONS
export class FirestoreMissionRepository implements IMissionRepository {
  constructor(private storage: FirestoreStorageEngine) {
    this.seedIfEmpty();
  }

  private seedIfEmpty() {
    const missions = this.storage.listDocs<Mission>('missions');
    if (missions.length === 0) {
      const kisanDirect: Mission = {
        id: 'MSN-2026-081',
        organizationId: 'ORG-KISANDIRECT-081',
        orgName: 'KisanDirect Supply Logistics',
        contactPerson: 'Arunav Sengupta',
        contactEmail: 'a.sengupta@kisandirect-example.in',
        role: 'VP Product & Rural Distribution',
        sector: 'agritech',
        decisionAtStake: 'Should we allocate $180,000 to engineer a direct-to-farmer B2C fertilizer e-commerce ordering mobile application, or will existing rural distribution channels make adoption non-viable?',
        hypothesis: 'Smallholder farmers in Uttar Pradesh will purchase fertilizer online if offered real-time spot pricing that is 10-15% cheaper than village retail stores.',
        falsificationCriteria: 'Falsified if farmers overpay at local retail shops due to harvest-linked informal credit relationships, emergency delivery lock-ins, or bag-opening inspection practices, rather than price discovery blindness.',
        problemToInvestigate: 'Rural fertilizer spot-pricing, emergency delivery friction, and informal retail credit dependencies across peri-urban smallholder farming clusters.',
        targetParticipantProfile: 'Active smallholders cultivating 2-8 acres in Western UP & Punjab, who personally purchase at least 20 fertilizer bags per season.',
        industry: 'Agricultural Logistics & Input Supply',
        geography: 'Western Uttar Pradesh (Meerut, Aligarh clusters)',
        urgency: 'High (Board pilot review in 4 weeks)',
        constraints: 'Must capture actual Hindi/Hinglish verbatim accounts and document current paper ledger workarounds.',
        deliverables: ['Decision Intelligence Brief', 'Workflow Friction Map', 'Contradiction Audit'],
        status: 'Brief Ready',
        pricing: '₹49,000 (Experimental Pilot Scope)',
        pricingDisclaimer: 'Experimental pilot pricing. Unvalidated research model. #DEMO_SYNTHETIC',
        participantTargetCount: 5,
        completedSessionCount: 5,
        createdAt: '2026-03-01T08:30:00Z'
      };
      this.storage.writeDoc('missions', kisanDirect.id, kisanDirect);
    }
  }

  async create(input: CreateMissionInput): Promise<Mission> {
    const id = `MSN-2026-${Math.floor(100 + Math.random() * 900)}`;
    const organizationId = input.organizationId || `ORG-${crypto.createHash('md5').update(input.orgName.toLowerCase()).digest('hex').slice(0, 8).toUpperCase()}`;

    const mission: Mission = {
      ...input,
      id,
      organizationId,
      status: 'Requested',
      pricing: '₹49,000 (Experimental Pilot Scope)',
      pricingDisclaimer: 'Experimental pilot pricing. Unvalidated research model.',
      participantTargetCount: 5,
      completedSessionCount: 0,
      createdAt: new Date().toISOString()
    };
    return this.storage.writeDoc('missions', id, mission);
  }

  async findById(id: string): Promise<Mission | null> {
    return this.storage.readDoc<Mission>('missions', id.toUpperCase());
  }

  async findAll(): Promise<Mission[]> {
    return this.storage.listDocs<Mission>('missions');
  }

  async findByOrganizationId(organizationId: string): Promise<Mission[]> {
    return this.storage.listDocs<Mission>('missions').filter(m => m.organizationId === organizationId);
  }

  async updateStatus(id: string, status: MissionStatus): Promise<Mission | null> {
    const mission = await this.findById(id);
    if (!mission) return null;
    mission.status = status;
    mission.updatedAt = new Date().toISOString();
    return this.storage.writeDoc('missions', mission.id, mission);
  }

  async incrementSessionCount(id: string): Promise<void> {
    const mission = await this.findById(id);
    if (mission) {
      mission.completedSessionCount = (mission.completedSessionCount || 0) + 1;
      this.storage.writeDoc('missions', mission.id, mission);
    }
  }
}

// 3. INVITATIONS
export class FirestoreInvitationRepository implements IInvitationRepository {
  constructor(private storage: FirestoreStorageEngine) {
    this.seedIfEmpty();
  }

  private seedIfEmpty() {
    const rawToken = 'INV-AGRI-081';
    const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');
    const existing = this.storage.readDoc<ResearchInvitation>('research_invitations', tokenHash);
    if (!existing) {
      const demoInvitation: ResearchInvitation = {
        token: rawToken,
        tokenHash,
        missionId: 'MSN-2026-081',
        studyTitle: 'Rural Input Procurement & Fertilizer Supply Research Study',
        studyDescription: 'Academic and operational study into how active farming operators manage emergency fertilizer procurement, pricing variability, and retailer relationships during peak planting season.',
        targetRole: 'Active Smallholder Farmer / Farm Operator (2-10 acres)',
        permittedQuestions: [
          'Describe your last fertilizer purchase during peak sowing season.',
          'Did you compare prices across different sources, and what determined where you bought?',
          'How did payment work, and what happened if delivery was delayed?'
        ],
        honorarium: '₹1,500 direct bank transfer upon session completion',
        expiresAt: '2026-12-31T23:59:59Z',
        status: 'active',
        failedAttempts: 0,
        createdAt: '2026-03-01T09:00:00Z'
      };
      this.storage.writeDoc('research_invitations', tokenHash, demoInvitation);
    }
  }

  async create(invitation: ResearchInvitation): Promise<ResearchInvitation> {
    const rawToken = invitation.token;
    const tokenHash = invitation.tokenHash || crypto.createHash('sha256').update(rawToken).digest('hex');

    const securedInvitation: ResearchInvitation = {
      ...invitation,
      tokenHash,
      failedAttempts: 0
    };

    return this.storage.writeDoc('research_invitations', tokenHash, securedInvitation);
  }

  async findByToken(token: string): Promise<ResearchInvitation | null> {
    const tokenHash = crypto.createHash('sha256').update(token.toUpperCase()).digest('hex');
    const byHash = await this.findByTokenHash(tokenHash);
    if (byHash) return byHash;

    // Direct hash check if input is already hash
    return this.findByTokenHash(token);
  }

  async findByTokenHash(tokenHash: string): Promise<ResearchInvitation | null> {
    const invitation = this.storage.readDoc<ResearchInvitation>('research_invitations', tokenHash);
    if (!invitation) return null;

    if (new Date(invitation.expiresAt) < new Date() && invitation.status === 'active') {
      invitation.status = 'expired';
      this.storage.writeDoc('research_invitations', tokenHash, invitation);
    }

    return invitation;
  }

  async markCompleted(tokenOrHash: string, sessionId?: string): Promise<void> {
    const inv = await this.findByToken(tokenOrHash);
    if (inv && inv.tokenHash) {
      inv.status = 'completed';
      this.storage.writeDoc('research_invitations', inv.tokenHash, inv);
    }
  }

  async recordFailedAttempt(tokenOrHash: string): Promise<number> {
    const inv = await this.findByToken(tokenOrHash);
    if (!inv || !inv.tokenHash) return 1;

    inv.failedAttempts = (inv.failedAttempts || 0) + 1;
    this.storage.writeDoc('research_invitations', inv.tokenHash, inv);
    return inv.failedAttempts;
  }
}

// 4. RESPONSES
export class FirestoreResearchResponseRepository implements IResearchResponseRepository {
  constructor(private storage: FirestoreStorageEngine) {
    this.seedIfEmpty();
  }

  private seedIfEmpty() {
    const sessions = this.storage.listDocs<ResearchSession>('research_responses');
    if (sessions.length === 0) {
      const seedSession: ResearchSession = {
        id: 'SES-401',
        missionId: 'MSN-2026-081',
        invitationToken: 'INV-AGRI-081',
        participantPseudonym: 'Participant 401 (Farmer, 4 Acres)',
        role: 'Smallholder Farmer (Sugarcane/Wheat)',
        location: 'Meerut, Uttar Pradesh',
        language: 'Hinglish / Hindi',
        sessionDate: '2026-03-03',
        verbatim: 'Sowing ke time par fertilizer nahi mila toh fasal kharab ho jayegi. Dukan wale Sharma ji se udhaar milta hai fasal katne tak. Online agar 10% sasta bhi mile, par wo udhaar nahi dega aur delivery kab aayegi koi bharosa nahi.',
        translation: 'If fertilizer does not arrive during sowing time, the entire crop will ruin. Local retailer Sharma ji provides inputs on informal credit until harvest. Even if an online app offers a 10% discount, they do not offer credit and delivery arrival is completely unpredictable.',
        workflow: 'Peak seasonal sowing procurement & informal credit financing',
        trigger: 'Critical 48-hour sowing window during early monsoon rains',
        impact: 'Pays ₹70-90 premium per urea bag to preserve retail credit line',
        workaround: 'Personal village retailer credit ledger (Khata book)',
        frequency: 'Twice per agricultural season (Kharif and Rabi cycles)',
        financialImpact: '₹70-90 per bag premium over MRP',
        sourceHash: crypto.createHash('sha256').update('SES-401-seed-content').digest('hex'),
        divergenceNotes: 'Values harvest-credit flexibility over unit pricing discounts.',
        consent: {
          studyProcessing: true,
          sanitizedBriefSharing: true,
          followUpInterview: true,
          futurePilotParticipation: false,
          contactEmail: 'farmer.401@example.in'
        },
        createdAt: '2026-03-03T10:00:00Z'
      };
      this.storage.writeDoc('research_responses', seedSession.id, seedSession);
    }
  }

  async create(missionId: string, input: SubmitResearchResponseInput, invitationToken?: string): Promise<ResearchSession> {
    const id = `SES-${Math.floor(400 + Math.random() * 599)}`;
    const sourceHash = crypto
      .createHash('sha256')
      .update(input.incidentNarrative + input.existingWorkaround)
      .digest('hex');

    const session: ResearchSession = {
      id,
      missionId,
      invitationToken: invitationToken ? 'PROTECTED_INVITATION_BOUND' : undefined,
      participantPseudonym: `Operator-${id.slice(4)}`,
      role: input.role || 'Screened Operator',
      location: input.location || 'India (Regional)',
      language: input.language || 'Vernacular / Hinglish',
      sessionDate: new Date().toISOString().split('T')[0],
      verbatim: input.incidentNarrative,
      translation: input.incidentNarrative,
      workflow: input.affectedWorkflow || 'Procurement',
      trigger: input.triggeringEvent || 'Demand Event',
      impact: input.operationalImpact || 'Operational Friction',
      workaround: input.existingWorkaround,
      frequency: input.frequency || 'UNKNOWN',
      financialImpact: input.financialImpact || 'UNKNOWN',
      sourceHash,
      consent: {
        studyProcessing: input.consentStudyProcessing,
        sanitizedBriefSharing: input.consentSanitizedBriefSharing || false,
        followUpInterview: input.consentFollowUpInterview || false,
        futurePilotParticipation: input.consentFuturePilotParticipation || false,
        contactEmail: input.contactEmail || null
      },
      createdAt: new Date().toISOString()
    };

    return this.storage.writeDoc('research_responses', id, session);
  }

  async findById(id: string): Promise<ResearchSession | null> {
    return this.storage.readDoc<ResearchSession>('research_responses', id);
  }

  async findByMissionId(missionId: string): Promise<ResearchSession[]> {
    return this.storage.listDocs<ResearchSession>('research_responses').filter(s => s.missionId === missionId);
  }

  async countByMissionId(missionId: string): Promise<number> {
    const list = await this.findByMissionId(missionId);
    return list.length;
  }
}

// 5. EVIDENCE
export class FirestoreEvidenceRepository implements IEvidenceRepository {
  constructor(private storage: FirestoreStorageEngine) {}

  async saveAnalysis(analysis: ValidatedAnalysis): Promise<ValidatedAnalysis> {
    return this.storage.writeDoc('evidence', analysis.id, analysis);
  }

  async findBySessionId(sessionId: string): Promise<ValidatedAnalysis | null> {
    const all = this.storage.listDocs<ValidatedAnalysis>('evidence');
    return all.find(e => e.sessionId === sessionId) || null;
  }

  async findByMissionId(missionId: string): Promise<ValidatedAnalysis[]> {
    return this.storage.listDocs<ValidatedAnalysis>('evidence').filter(e => e.missionId === missionId);
  }

  async updateStatus(
    id: string,
    status: AnalysisStatus,
    reviewerNotes?: string,
    reviewer?: string
  ): Promise<ValidatedAnalysis | null> {
    const analysis = this.storage.readDoc<ValidatedAnalysis>('evidence', id);
    if (!analysis) return null;

    analysis.status = status;
    if (reviewerNotes) analysis.reviewerNotes = reviewerNotes;
    if (reviewer) analysis.reviewedBy = reviewer;
    analysis.reviewedAt = new Date().toISOString();

    return this.storage.writeDoc('evidence', id, analysis);
  }
}

// 6. BRIEFS
export class FirestoreBriefRepository implements IBriefRepository {
  constructor(private storage: FirestoreStorageEngine) {
    this.seedIfEmpty();
  }

  private seedIfEmpty() {
    const existing = this.storage.readDoc<DecisionBrief>('briefs', 'BRF-2026-081');
    if (!existing) {
      const sampleBrief: DecisionBrief = {
        id: 'BRF-2026-081',
        missionId: 'MSN-2026-081',
        organizationId: 'ORG-KISANDIRECT-081',
        title: 'Decision Intelligence Brief: Rural Fertilizer Procurement Workflows',
        status: 'APPROVED',
        recommendation: 'REJECT_OR_REFRAME',
        recommendationRationale: 'All 5 participants revealed that local retail purchase decisions are governed by harvest-linked credit (Khatabook) and physical bag-inspection trust rather than spot-pricing. An unbundled e-commerce app without localized credit underwriting will suffer acute adoption failure.',
        executiveSummary: 'This research mission evaluated whether building a direct-to-farmer B2C fertilizer ordering app is commercially viable. Evidence indicates that price discounts of 10-15% are insufficient to overcome zero-interest seasonal credit extended by village retailers.',
        researchQuestion: 'Do peri-urban smallholders prioritize upfront digital price discovery over entrenched village credit relationships?',
        decisionAtStake: 'Should KisanDirect allocate $180,000 to engineer a direct-to-farmer fertilizer app?',
        hypothesis: 'Smallholders will adopt online buying for 10-15% discounts.',
        falsificationOutcome: 'FALSIFIED: 5 of 5 participants demonstrated that seasonal credit dependencies and immediate emergency replacement override price sensitivity.',
        sampleContext: {
          totalSessions: 5,
          participantRoles: ['Smallholder Cultivator (3 acres)', 'Medium Grower (7 acres)', 'Sharecropper (4 acres)', 'Farm Operator (6 acres)', 'Peri-urban Grower (5 acres)'],
          geographies: ['Western Uttar Pradesh (Meerut, Aligarh, Bulandshahr)'],
          limitationsDisclaimer: 'Small qualitative research sample (N=5). Does not establish statistical prevalence or national market size.'
        },
        observedWorkflows: [
          'Village retail shop visit during sowing window',
          'Informal Khatabook ledger credit ledger entry',
          'Physical bag-opening inspection for moisture clumping'
        ],
        coreProblems: [
          'Cash-flow timing mismatch between sowing expense and harvest income',
          'High risk of counterfeit or sub-standard fertilizer bag delivery',
          'Inability of digital delivery trucks to navigate village interior paths during monsoon'
        ],
        supportingEvidence: [
          {
            claim: 'Local dealers provide 90-day interest-free harvest credit',
            sourceSessionId: 'SES-401',
            verbatimQuote: 'Hamare paas sowing ke time cash nahi hota. Sharmaji khata pe 3 mahine baad fasal bikne par payment lete hain.',
            operatorRole: 'Smallholder Cultivator (3 acres)'
          }
        ],
        contradictoryFindings: [
          {
            aspect: 'Emergency Delivery vs Transport Delay',
            observationA: 'Participant 1 requires delivery within 2 hours of rain or crop risks yellowing.',
            observationB: 'Participant 3 stores 10 bags in home shed and only replenishes monthly.',
            implication: 'Delivery speed criticality varies drastically between rain-fed and canal-irrigated plots.'
          }
        ],
        existingWorkarounds: [
          {
            workaround: 'Khatabook ledger credit with village shopkeeper',
            costOrFriction: 'Dealers charge 5-8% implicit markup on fertilizer price in exchange for credit',
            whyCurrentTechFails: 'Digital apps demand immediate UPI or card payment, which smallholders lack prior to mandi payout'
          }
        ],
        knownImpacts: [
          'Operators willingly pay premium retail prices to preserve dealer credit lines'
        ],
        unknownInformation: [
          'Default rates on informal dealer credit ledgers across UP'
        ],
        researchLimitations: [
          'Study conducted exclusively in Western UP; credit customs in South India may differ'
        ],
        hypothesesGenerated: [
          'A dealer-enablement credit platform would achieve higher adoption than a B2C direct app'
        ],
        followUpQuestions: [
          'What percentage of retail dealer margin is derived from interest charges vs manufacturer incentives?'
        ],
        decisionOptions: [
          {
            option: 'REJECT_OR_REFRAME',
            headline: 'Cancel B2C App Build — Reframe Around Dealer Credit Underwriting',
            description: 'De-allocate the $180,000 B2C mobile app budget. Explore partnership with existing rural input retailers by providing digital inventory financing instead.',
            tradeOffs: 'Avoids multi-million dollar customer acquisition failure; requires negotiating with fragmented retail distributors.'
          }
        ],
        createdAt: '2026-03-05T14:00:00Z',
        approvedAt: '2026-03-06T10:00:00Z',
        approvedBy: 'Lead Problem Intelligence Researcher'
      };
      this.storage.writeDoc('briefs', sampleBrief.id, sampleBrief);
    }
  }

  async saveBrief(brief: DecisionBrief): Promise<DecisionBrief> {
    return this.storage.writeDoc('briefs', brief.id, brief);
  }

  async findByMissionId(missionId: string): Promise<DecisionBrief | null> {
    const all = this.storage.listDocs<DecisionBrief>('briefs');
    return all.find(b => b.missionId === missionId) || null;
  }

  async findById(id: string): Promise<DecisionBrief | null> {
    return this.storage.readDoc<DecisionBrief>('briefs', id);
  }

  async updateStatus(id: string, status: BriefStatus, approvedBy?: string): Promise<DecisionBrief | null> {
    let brief = this.storage.readDoc<DecisionBrief>('briefs', id);
    if (!brief) {
      brief = await this.findByMissionId(id);
    }
    if (!brief) return null;

    brief.status = status;
    if (approvedBy) brief.approvedBy = approvedBy;
    if (status === 'APPROVED') brief.approvedAt = new Date().toISOString();

    return this.storage.writeDoc('briefs', brief.id, brief);
  }
}

// 7. CONSENTS
export class FirestoreConsentRepository implements IConsentRepository {
  constructor(private storage: FirestoreStorageEngine) {}

  async recordConsent(record: Omit<ConsentRecord, 'id'>): Promise<ConsentRecord> {
    const id = `CNS-${Date.now().toString(36).toUpperCase()}-${crypto.randomBytes(3).toString('hex').toUpperCase()}`;
    const consent: ConsentRecord = { ...record, id };
    return this.storage.writeDoc('consents', id, consent);
  }

  async findByParticipantRef(participantRef: string): Promise<ConsentRecord | null> {
    const all = this.storage.listDocs<ConsentRecord>('consents');
    return all.find(c => c.participantRef === participantRef) || null;
  }

  async findAll(): Promise<ConsentRecord[]> {
    return this.storage.listDocs<ConsentRecord>('consents');
  }
}

// 8. AUDIT LOGS
export class FirestoreAuditLogRepository implements IAuditLogRepository {
  constructor(private storage: FirestoreStorageEngine) {}

  async log(
    action: AuditAction,
    actorId: string,
    actorRole: string,
    targetId: string,
    targetType: string,
    details?: Record<string, unknown>,
    ipAddress?: string
  ): Promise<AuditLogEntry> {
    const id = `AUD-${Date.now().toString(36)}-${crypto.randomBytes(2).toString('hex')}`;
    const entry: AuditLogEntry = {
      id,
      action,
      actorId,
      actorRole,
      targetId,
      targetType,
      details,
      ipAddress,
      timestamp: new Date().toISOString()
    };
    return this.storage.writeDoc('audit_logs', id, entry);
  }

  async getLogs(limit = 100): Promise<AuditLogEntry[]> {
    return this.storage.listDocs<AuditLogEntry>('audit_logs')
      .sort((a, b) => b.timestamp.localeCompare(a.timestamp))
      .slice(0, limit);
  }
}

// 9. OPERATIONS QUEUE
export class FirestoreOperationsRepository implements IOperationsRepository {
  constructor(private storage: FirestoreStorageEngine) {}

  async getQueue(): Promise<OperationsQueueItem[]> {
    return this.storage.listDocs<OperationsQueueItem>('operations_queue')
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }

  async enqueue(item: Omit<OperationsQueueItem, 'id' | 'createdAt'>): Promise<OperationsQueueItem> {
    const id = `OPS-${Date.now().toString(36)}-${crypto.randomBytes(2).toString('hex')}`;
    const queueItem: OperationsQueueItem = {
      ...item,
      id,
      createdAt: new Date().toISOString()
    };
    return this.storage.writeDoc('operations_queue', id, queueItem);
  }

  async updateItem(id: string, status: OperationsQueueItem['status'], notes?: string): Promise<OperationsQueueItem | null> {
    const item = this.storage.readDoc<OperationsQueueItem>('operations_queue', id);
    if (!item) return null;

    item.status = status;
    item.updatedAt = new Date().toISOString();
    if (notes) item.actionTaken = notes;

    return this.storage.writeDoc('operations_queue', id, item);
  }
}
