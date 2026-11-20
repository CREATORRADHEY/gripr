import crypto from 'node:crypto';
import {
  IMissionRepository,
  IMissionInquiryRepository,
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

// --- OPERATIONS REPOSITORY ---
export class MemoryOperationsRepository implements IOperationsRepository {
  private opsQueue: Map<string, OperationsQueueItem> = new Map();

  constructor() {
    this.seed();
  }

  private seed() {
    const demoOps: OperationsQueueItem = {
      id: 'OPS-1001',
      missionId: 'MSN-2026-081',
      type: 'brief_approval',
      title: 'Review Executive Brief: Jaipur Kirana Credit Tracking (MSN-2026-081)',
      status: 'reviewed',
      actionTaken: 'Approved by Lead Researcher. Brief published to client workspace.',
      createdAt: '2026-03-05T15:00:00Z'
    };
    this.opsQueue.set(demoOps.id, demoOps);
  }

  async getQueue(): Promise<OperationsQueueItem[]> {
    return Array.from(this.opsQueue.values()).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }

  async enqueue(item: Omit<OperationsQueueItem, 'id' | 'createdAt'>): Promise<OperationsQueueItem> {
    const id = `OPS-${Math.floor(1000 + Math.random() * 9000)}`;
    const fullItem: OperationsQueueItem = {
      ...item,
      id,
      createdAt: new Date().toISOString()
    };
    this.opsQueue.set(id, fullItem);
    return fullItem;
  }

  async updateItem(id: string, status: OperationsQueueItem['status'], notes?: string): Promise<OperationsQueueItem | null> {
    const item = this.opsQueue.get(id);
    if (!item) return null;
    item.status = status;
    if (notes) item.actionTaken = notes;
    item.updatedAt = new Date().toISOString();
    this.opsQueue.set(id, item);
    return item;
  }
}

// --- MISSION INQUIRY REPOSITORY ---
export class MemoryMissionInquiryRepository implements IMissionInquiryRepository {
  private inquiries: Map<string, MissionInquiry> = new Map();

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
    this.inquiries.set(id, inquiry);
    return inquiry;
  }

  async findById(id: string): Promise<MissionInquiry | null> {
    return this.inquiries.get(id) || null;
  }

  async findAll(): Promise<MissionInquiry[]> {
    return Array.from(this.inquiries.values()).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }

  async updateStatus(
    id: string,
    status: MissionInquiryStatus,
    reviewer?: string,
    notes?: string,
    convertedMissionId?: string
  ): Promise<MissionInquiry | null> {
    const inquiry = this.inquiries.get(id);
    if (!inquiry) return null;
    inquiry.status = status;
    inquiry.updatedAt = new Date().toISOString();
    if (reviewer) inquiry.reviewedBy = reviewer;
    if (notes) inquiry.reviewNotes = notes;
    if (convertedMissionId) inquiry.convertedMissionId = convertedMissionId;
    this.inquiries.set(id, inquiry);
    return inquiry;
  }
}

// --- MISSION REPOSITORY ---
export class MemoryMissionRepository implements IMissionRepository {
  private missions: Map<string, Mission> = new Map();

  constructor(private opsRepo: IOperationsRepository) {
    this.seed();
  }

  private seed() {
    const demoMission: Mission = {
      id: 'MSN-2026-081',
      organizationId: 'ORG-RETAILFLOW-081',
      orgName: 'RetailFlow Intelligence Labs',
      contactPerson: 'Aditi Sharma',
      contactEmail: 'aditi.sharma@retailflow.test',
      role: 'VP Product',
      sector: 'retail',
      decisionAtStake: 'Deciding whether to allocate $95,000 to engineer an automated WhatsApp UPI credit collection bot for neighborhood kirana stores, or reframe toward physical vernacular receipt-book ledger workflows.',
      hypothesis: 'We believe Jaipur neighborhood kirana store owners lose 8-12% of revenue because they forget to collect customer udhaar, and will adopt automated WhatsApp payment reminders to collect dues faster.',
      falsificationCriteria: 'If retailers deliberately avoid automated digital reminders to preserve personal community trust and social relationships with neighbors, automated collection software will encounter severe resistance and rejection.',
      problemToInvestigate: 'Customer credit tracking friction, notebook ledger page overflow, and community relationship trust dynamics among neighborhood kirana operators.',
      targetParticipantProfile: 'Independent neighborhood kirana store owners in Jaipur operating for >5 years with at least 50 regular credit customers.',
      industry: 'Neighborhood Retail & Vernacular Fintech',
      geography: 'Jaipur, Rajasthan (Raja Park, Mansarovar, Malviya Nagar, Sanganer, Vaishali Nagar)',
      urgency: 'High (Roadmapping review in 4 weeks)',
      constraints: 'Must capture actual Hindi/Hinglish verbatim accounts and document current paper ledger workarounds.',
      deliverables: ['Decision Intelligence Brief', 'Workflow Friction Map', 'Contradiction Audit'],
      status: 'Brief Ready',
      pricing: '₹49,000 (Experimental Pilot Scope)',
      pricingDisclaimer: 'Experimental pilot pricing. Unvalidated research model. #DEMO_SYNTHETIC',
      participantTargetCount: 5,
      completedSessionCount: 5,
      createdAt: '2026-03-01T08:30:00Z'
    };
    this.missions.set(demoMission.id, demoMission);
  }

  async create(input: CreateMissionInput): Promise<Mission> {
    const randomId = `MSN-2026-${Math.floor(100 + Math.random() * 900)}`;
    const organizationId = input.organizationId || `ORG-${crypto.createHash('md5').update(input.orgName.toLowerCase()).digest('hex').slice(0, 8).toUpperCase()}`;

    const mission: Mission = {
      id: randomId,
      organizationId,
      inquiryId: input.inquiryId,
      orgName: input.orgName.trim(),
      contactPerson: input.contactPerson.trim(),
      contactEmail: input.contactEmail.trim(),
      role: input.role || 'Product Lead',
      sector: input.sector || 'general',
      decisionAtStake: input.decisionAtStake.trim(),
      hypothesis: input.hypothesis ? input.hypothesis.trim() : 'Preliminary hypothesis under evaluation',
      falsificationCriteria: input.falsificationCriteria ? input.falsificationCriteria.trim() : 'To be refined during scoping alignment',
      problemToInvestigate: input.problemToInvestigate.trim(),
      targetParticipantProfile: input.targetParticipantProfile.trim(),
      industry: input.industry || 'B2B Workflow',
      geography: input.geography || 'India (Regional clusters)',
      urgency: input.urgency || 'Standard (4-6 weeks)',
      constraints: input.constraints || 'None specified',
      deliverables: input.deliverables || ['Decision Intelligence Brief', 'Workflow Friction Map'],
      status: 'Requested',
      pricing: '₹49,000 (Experimental Pilot Scope)',
      pricingDisclaimer: 'Experimental pilot pricing. Unvalidated research model.',
      participantTargetCount: 5,
      completedSessionCount: 0,
      createdAt: new Date().toISOString()
    };
    this.missions.set(mission.id, mission);

    await this.opsRepo.enqueue({
      missionId: mission.id,
      type: 'scope_review',
      title: `Scope Review: ${mission.orgName} (${mission.id})`,
      status: 'pending',
      actionTaken: 'Awaiting research team scoping alignment.'
    });

    return mission;
  }

  async findById(id: string): Promise<Mission | null> {
    return this.missions.get(id.toUpperCase()) || null;
  }

  async findAll(): Promise<Mission[]> {
    return Array.from(this.missions.values());
  }

  async findByOrganizationId(organizationId: string): Promise<Mission[]> {
    return Array.from(this.missions.values()).filter(m => m.organizationId === organizationId);
  }

  async updateStatus(id: string, status: MissionStatus): Promise<Mission | null> {
    const mission = await this.findById(id);
    if (!mission) return null;
    mission.status = status;
    mission.updatedAt = new Date().toISOString();
    this.missions.set(mission.id, mission);
    return mission;
  }

  async incrementSessionCount(id: string): Promise<void> {
    const mission = await this.findById(id);
    if (mission) {
      mission.completedSessionCount = (mission.completedSessionCount || 0) + 1;
      this.missions.set(mission.id, mission);
    }
  }
}

// --- INVITATION REPOSITORY ---
export class MemoryInvitationRepository implements IInvitationRepository {
  private invitations: Map<string, ResearchInvitation> = new Map();

  constructor() {
    this.seed();
  }

  private seed() {
    const rawToken = 'INV-AGRI-081';
    const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');

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
    this.invitations.set(rawToken.toUpperCase(), demoInvitation);
    this.invitations.set(tokenHash, demoInvitation);
  }

  async create(invitation: ResearchInvitation): Promise<ResearchInvitation> {
    const tokenHash = invitation.tokenHash || crypto.createHash('sha256').update(invitation.token).digest('hex');
    const secured = { ...invitation, tokenHash, failedAttempts: 0 };
    this.invitations.set(invitation.token.toUpperCase(), secured);
    this.invitations.set(tokenHash, secured);
    return secured;
  }

  async findByToken(token: string): Promise<ResearchInvitation | null> {
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
    return this.invitations.get(token.toUpperCase()) || this.invitations.get(tokenHash) || null;
  }

  async findByTokenHash(tokenHash: string): Promise<ResearchInvitation | null> {
    return this.invitations.get(tokenHash) || null;
  }

  async markCompleted(tokenOrHash: string, sessionId?: string): Promise<void> {
    const inv = await this.findByToken(tokenOrHash);
    if (inv) {
      inv.status = 'completed';
      this.invitations.set(inv.token.toUpperCase(), inv);
      if (inv.tokenHash) this.invitations.set(inv.tokenHash, inv);
    }
  }

  async recordFailedAttempt(tokenOrHash: string): Promise<number> {
    const inv = await this.findByToken(tokenOrHash);
    if (!inv) return 1;
    inv.failedAttempts = (inv.failedAttempts || 0) + 1;
    return inv.failedAttempts;
  }
}

// --- RESEARCH RESPONSE REPOSITORY ---
export class MemoryResearchResponseRepository implements IResearchResponseRepository {
  private sessions: Map<string, ResearchSession> = new Map();

  constructor(
    private missionRepo: IMissionRepository,
    private opsRepo: IOperationsRepository
  ) {
    this.seed();
  }

  private seed() {
    const seedSessions: ResearchSession[] = [
      {
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
      },
      {
        id: 'SES-402',
        missionId: 'MSN-2026-081',
        invitationToken: 'INV-AGRI-081',
        participantPseudonym: 'Participant 402 (Farmer, 7 Acres)',
        role: 'Medium Farmer (Paddy/Mustard)',
        location: 'Aligarh, Uttar Pradesh',
        language: 'Hindi',
        sessionDate: '2026-03-04',
        verbatim: 'Hamare gaon me delivery truck nahi aata. Bori khud tractor se laani padti hai. Agar online order kiya aur bori phati nikli toh return kaun karega? Dukan par bag check karke letay hain.',
        translation: 'Delivery trucks do not enter our village roads. We have to bring bags ourselves on tractors. If we order online and bags arrive torn or moisture-damaged, who will accept returns? At the local shop, we inspect bags before paying.',
        workflow: 'Physical transport logistics & quality verification',
        trigger: 'Bulk procurement of 35 bags before sowing deadline',
        impact: 'Spends 4 hours in transport; refuses contactless parcel delivery',
        workaround: 'Tractor trailer group-hauling with neighboring farmers',
        frequency: 'Seasonal bulk run (3 times/year)',
        financialImpact: 'Transport cost of ₹1,200 per haul',
        sourceHash: crypto.createHash('sha256').update('SES-402-seed-content').digest('hex'),
        divergenceNotes: 'Emphasizes physical inspection and return friction over pricing.',
        consent: {
          studyProcessing: true,
          sanitizedBriefSharing: true,
          followUpInterview: false,
          futurePilotParticipation: false
        },
        createdAt: '2026-03-04T11:30:00Z'
      }
    ];

    seedSessions.forEach(s => this.sessions.set(s.id, s));
  }

  async create(missionId: string, input: SubmitResearchResponseInput, invitationToken?: string): Promise<ResearchSession> {
    const sessionId = `SES-${Math.floor(400 + Math.random() * 500)}`;
    const textToHash = `${input.incidentNarrative.trim()}::${input.existingWorkaround.trim()}`;
    const sourceHash = crypto.createHash('sha256').update(textToHash).digest('hex');

    const session: ResearchSession = {
      id: sessionId,
      missionId: missionId.toUpperCase(),
      invitationToken: invitationToken ? invitationToken.toUpperCase() : undefined,
      participantPseudonym: `Participant (${input.role || 'Screened Operator'})`,
      role: input.role || 'Screened Operator',
      location: input.location || 'India (Regional)',
      language: input.language || 'Hinglish / Vernacular',
      sessionDate: new Date().toISOString().split('T')[0],
      verbatim: input.incidentNarrative.trim(),
      translation: input.incidentNarrative.trim(),
      workflow: input.affectedWorkflow || 'Operational workflow',
      trigger: input.triggeringEvent || 'Firsthand operational incident reported during study',
      impact: input.operationalImpact || 'Unquantified operational friction',
      workaround: input.existingWorkaround.trim(),
      frequency: input.frequency || null,
      financialImpact: input.financialImpact || null,
      sourceHash,
      divergenceNotes: 'Session submitted via invitation link.',
      consent: {
        studyProcessing: input.consentStudyProcessing,
        sanitizedBriefSharing: input.consentSanitizedBriefSharing || false,
        followUpInterview: input.consentFollowUpInterview || false,
        futurePilotParticipation: input.consentFuturePilotParticipation || false,
        contactEmail: input.contactEmail || null
      },
      createdAt: new Date().toISOString()
    };

    this.sessions.set(session.id, session);

    await this.opsRepo.enqueue({
      missionId: missionId.toUpperCase(),
      type: 'session_review',
      title: `Participant Response: ${session.participantPseudonym} (${session.id})`,
      status: 'pending',
      actionTaken: 'Firsthand response recorded. Pending Gemini evidence extraction.'
    });

    return session;
  }

  async findById(id: string): Promise<ResearchSession | null> {
    return this.sessions.get(id.toUpperCase()) || null;
  }

  async findByMissionId(missionId: string): Promise<ResearchSession[]> {
    return Array.from(this.sessions.values()).filter(
      s => s.missionId.toUpperCase() === missionId.toUpperCase()
    );
  }

  async countByMissionId(missionId: string): Promise<number> {
    const list = await this.findByMissionId(missionId);
    return list.length;
  }
}

// --- EVIDENCE REPOSITORY ---
export class MemoryEvidenceRepository implements IEvidenceRepository {
  private extractions: Map<string, ValidatedAnalysis> = new Map();

  async saveAnalysis(analysis: ValidatedAnalysis): Promise<ValidatedAnalysis> {
    this.extractions.set(analysis.id, analysis);
    return analysis;
  }

  async findBySessionId(sessionId: string): Promise<ValidatedAnalysis | null> {
    return Array.from(this.extractions.values()).find(
      e => e.sessionId.toUpperCase() === sessionId.toUpperCase()
    ) || null;
  }

  async findByMissionId(missionId: string): Promise<ValidatedAnalysis[]> {
    return Array.from(this.extractions.values()).filter(
      e => e.missionId.toUpperCase() === missionId.toUpperCase()
    );
  }

  async updateStatus(
    id: string,
    status: AnalysisStatus,
    reviewerNotes?: string,
    reviewer?: string
  ): Promise<ValidatedAnalysis | null> {
    const analysis = this.extractions.get(id);
    if (!analysis) return null;
    analysis.status = status;
    if (reviewerNotes) analysis.reviewerNotes = reviewerNotes;
    if (reviewer) analysis.reviewedBy = reviewer;
    analysis.reviewedAt = new Date().toISOString();
    this.extractions.set(id, analysis);
    return analysis;
  }
}

// --- BRIEF REPOSITORY ---
export class MemoryBriefRepository implements IBriefRepository {
  private briefs: Map<string, DecisionBrief> = new Map();

  constructor() {
    this.seed();
  }

  private seed() {
    const sampleBrief: DecisionBrief = {
      id: 'BRF-2026-081',
      missionId: 'MSN-2026-081',
      organizationId: 'ORG-RETAILFLOW-081',
      title: 'Decision Intelligence Brief: Why Jaipur Kirana Retailers Struggle to Track Customer Credit',
      status: 'APPROVED',
      recommendation: 'REJECT_OR_REFRAME',
      recommendationRationale: 'All 5 screened retailers demonstrated that customer credit (udhaar) is a customer retention mechanism rooted in neighborhood trust, not an accounting or debt-collection bottleneck. Automated WhatsApp collection reminders alienate customers and drive them to competing neighborhood stores. RetailFlow must halt planned development of automated collection bots and reframe toward physical vernacular duplicate ledger tools.',
      executiveSummary: 'RetailFlow Intelligence Labs\' initial hypothesis—that neighborhood kirana store owners lose revenue from forgotten credit and will eagerly adopt an automated WhatsApp UPI collection bot—is FALSIFIED by firsthand field evidence across 5 Jaipur retail operators. Kirana owners deliberately avoid automated collection messages because debt badgering threatens their core competitive moat: personal relationship trust. Retailers prefer manual notebooks despite transcription errors because paper ledgers are socially non-intrusive.',
      researchQuestion: 'Why do Jaipur kirana retailers struggle to track customer credit, and would an automated WhatsApp collection bot reduce credit default without customer churn?',
      decisionAtStake: 'Deciding whether to allocate $95,000 to engineer an automated WhatsApp UPI credit collection bot, or reframe toward physical vernacular receipt-book ledger workflows.',
      hypothesis: 'Kirana store owners lose 8-12% of revenue because they forget to collect customer udhaar, and will adopt automated WhatsApp payment reminders to collect dues faster.',
      falsificationOutcome: 'FALSIFIED: 5 of 5 participants demonstrated that automated debt collection damages neighborhood trust and drives customer defection. The bottleneck is customer cash-flow timing, not retailer memory.',
      sampleContext: {
        totalSessions: 5,
        participantRoles: ['Kirana Store Owner (18 yrs)', 'Provision Store Owner (12 yrs)', 'Daily Grocery Vendor (8 yrs)', 'Family Kirana Co-owner (15 yrs)', 'General Store Owner (22 yrs)'],
        geographies: ['Jaipur, Rajasthan (Raja Park, Mansarovar, Sanganer, Malviya Nagar, Vaishali Nagar)'],
        limitationsDisclaimer: 'Small qualitative research sample (N=5). Does not establish statistical prevalence or national market size. #DEMO_SYNTHETIC'
      },
      observedWorkflows: [
        'Counter packing during peak evening rush (6 PM - 9 PM)',
        'Manual handwriting of credit in single ruled paper notebook',
        'Cordial in-person verbal balance mentions during morning milk visits'
      ],
      coreProblems: [
        'Notebook page overflow and human transcription errors across balance transfers',
        'Third-party pickups (children/helpers) causing disputed totals at month-end',
        'Acute social friction when digital collection apps send automated WhatsApp reminders'
      ],
      supportingEvidence: [
        {
          claim: 'Automated digital reminders insult customers and destroy neighborhood credit trust',
          sourceSessionId: 'SES-402',
          verbatimQuote: 'Agar main software se automated WhatsApp reminder bhejunga, toh mohalle wale naraz ho jayenge aur samne wali dukan pe chale jayenge. Udhaar vishwas pe chalta hai, machine pe nahi.',
          operatorRole: 'Provision Store Owner (12 Years in Business)'
        }
      ],
      contradictoryFindings: [
        {
          aspect: 'Information Tracking vs Social Relationship',
          observationA: 'Developers assume retailers forget to collect because notebooks lack automated notification triggers.',
          observationB: 'Retailers know exact balances but deliberately avoid messaging customers to protect community harmony and loyalty.',
          implication: 'The limitation is not operational amnesia, but social penalty avoidance.'
        }
      ],
      existingWorkarounds: [
        {
          workaround: 'Carbon-copy duplicate receipt slips',
          costOrFriction: 'Retailers write items on physical slips; one copy given to child, one kept in cash box.',
          whyCurrentTechFails: 'Digital apps demand immediate UPI or card payment, which customers lack prior to monthly wage payout'
        }
      ],
      knownImpacts: [
        'Operators willingly accept delayed payments to preserve long-term family customer loyalty'
      ],
      unknownInformation: [
        'Default rates on informal kirana credit ledgers across Rajasthan'
      ],
      researchLimitations: [
        'Study conducted exclusively in urban Jaipur; credit customs in rural villages may differ'
      ],
      hypothesesGenerated: [
        'A physical carbon-copy receipt book would achieve higher adoption than a standalone mobile debt app'
      ],
      followUpQuestions: [
        'What percentage of customer credit is settled in cash vs UPI at month-end?'
      ],
      decisionOptions: [
        {
          option: 'REJECT_OR_REFRAME',
          headline: 'Cancel WhatsApp Collection Bot — Reframe Around Vernacular Duplicate Billbooks',
          description: 'Halt the $95,000 automated WhatsApp debt collection bot build immediately. Explore physical vernacular duplicate ledger tools.',
          tradeOffs: 'Avoids costly product rejection by operators; requires building physical-digital hybrid workflows.'
        }
      ],
      createdAt: '2026-03-05T14:00:00Z',
      approvedAt: '2026-03-06T10:00:00Z',
      approvedBy: 'Lead Problem Intelligence Researcher'
    };
    this.briefs.set(sampleBrief.id, sampleBrief);
    this.briefs.set(sampleBrief.missionId, sampleBrief);
  }

  async saveBrief(brief: DecisionBrief): Promise<DecisionBrief> {
    this.briefs.set(brief.id, brief);
    this.briefs.set(brief.missionId, brief);
    return brief;
  }

  async findByMissionId(missionId: string): Promise<DecisionBrief | null> {
    return this.briefs.get(missionId) || null;
  }

  async findById(id: string): Promise<DecisionBrief | null> {
    return this.briefs.get(id) || null;
  }

  async updateStatus(id: string, status: BriefStatus, approvedBy?: string): Promise<DecisionBrief | null> {
    const brief = this.briefs.get(id);
    if (!brief) return null;
    brief.status = status;
    if (approvedBy) brief.approvedBy = approvedBy;
    if (status === 'APPROVED') brief.approvedAt = new Date().toISOString();
    this.briefs.set(brief.id, brief);
    this.briefs.set(brief.missionId, brief);
    return brief;
  }
}

// --- CONSENT REPOSITORY ---
export class MemoryConsentRepository implements IConsentRepository {
  private consents: Map<string, ConsentRecord> = new Map();

  async recordConsent(record: Omit<ConsentRecord, 'id'>): Promise<ConsentRecord> {
    const id = `CNS-${Date.now().toString(36).toUpperCase()}-${crypto.randomBytes(3).toString('hex').toUpperCase()}`;
    const consent: ConsentRecord = { ...record, id };
    this.consents.set(id, consent);
    return consent;
  }

  async findByParticipantRef(participantRef: string): Promise<ConsentRecord | null> {
    return Array.from(this.consents.values()).find(c => c.participantRef === participantRef) || null;
  }

  async findAll(): Promise<ConsentRecord[]> {
    return Array.from(this.consents.values());
  }
}

// --- AUDIT LOG REPOSITORY ---
export class MemoryAuditLogRepository implements IAuditLogRepository {
  private logs: AuditLogEntry[] = [];

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
    this.logs.push(entry);
    return entry;
  }

  async getLogs(limit = 100): Promise<AuditLogEntry[]> {
    return [...this.logs].sort((a, b) => b.timestamp.localeCompare(a.timestamp)).slice(0, limit);
  }
}

// Global in-memory singleton instances for transient test execution
export const memoryOpsRepo = new MemoryOperationsRepository();
export const memoryMissionRepo = new MemoryMissionRepository(memoryOpsRepo);
export const memoryInvitationRepo = new MemoryInvitationRepository();
export const memorySessionRepo = new MemoryResearchResponseRepository(memoryMissionRepo, memoryOpsRepo);
export const memoryEvidenceRepo = new MemoryEvidenceRepository();
export const memoryBriefRepo = new MemoryBriefRepository();
