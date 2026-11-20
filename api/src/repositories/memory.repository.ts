import crypto from 'crypto';
import {
  IMissionRepository,
  IInvitationRepository,
  IResearchResponseRepository,
  IEvidenceRepository,
  IBriefRepository,
  IOperationsRepository,
  OperationsQueueItem
} from './interfaces.js';
import { Mission, CreateMissionInput, MissionStatus } from '../schemas/mission.schema.js';
import { ResearchSession, ResearchInvitation, SubmitResearchResponseInput } from '../schemas/response.schema.js';
import { ValidatedAnalysis, AnalysisStatus } from '../schemas/extraction.schema.js';
import { DecisionBrief, BriefStatus } from '../schemas/brief.schema.js';

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
      title: 'Review Executive Brief: Rural Fertilizer Spot-Pricing (MSN-2026-081)',
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

// --- MISSION REPOSITORY ---
export class MemoryMissionRepository implements IMissionRepository {
  private missions: Map<string, Mission> = new Map();

  constructor(private opsRepo: IOperationsRepository) {
    this.seed();
  }

  private seed() {
    const demoMission: Mission = {
      id: 'MSN-2026-081',
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
    this.missions.set(demoMission.id, demoMission);
  }

  async create(input: CreateMissionInput): Promise<Mission> {
    const randomId = `MSN-2026-${Math.floor(100 + Math.random() * 900)}`;
    const mission: Mission = {
      id: randomId,
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
    const demoInvitation: ResearchInvitation = {
      token: 'INV-AGRI-081',
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
      createdAt: '2026-03-01T09:00:00Z'
    };
    this.invitations.set(demoInvitation.token, demoInvitation);
  }

  async create(invitation: ResearchInvitation): Promise<ResearchInvitation> {
    this.invitations.set(invitation.token, invitation);
    return invitation;
  }

  async findByToken(token: string): Promise<ResearchInvitation | null> {
    return this.invitations.get(token.toUpperCase()) || null;
  }

  async markCompleted(token: string): Promise<void> {
    const inv = await this.findByToken(token);
    if (inv) {
      inv.status = 'completed';
      this.invitations.set(inv.token, inv);
    }
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
          followUpInterview: false
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
      divergenceNotes: 'Awaiting Gemini structured extraction and researcher moderation.',
      consent: {
        studyProcessing: input.consentStudyProcessing,
        sanitizedBriefSharing: !!input.consentSanitizedBriefSharing,
        followUpInterview: !!input.consentFollowUpInterview,
        contactEmail: input.consentFollowUpInterview ? input.contactEmail : null
      },
      createdAt: new Date().toISOString()
    };

    this.sessions.set(session.id, session);
    await this.missionRepo.incrementSessionCount(missionId);

    await this.opsRepo.enqueue({
      missionId: session.missionId,
      type: 'session_review',
      title: `Participant Session Review: ${session.id} (${session.role})`,
      status: 'pending',
      actionTaken: 'Awaiting moderation and Gemini extraction verification.'
    });

    return session;
  }

  async findById(id: string): Promise<ResearchSession | null> {
    return this.sessions.get(id.toUpperCase()) || null;
  }

  async findByMissionId(missionId: string): Promise<ResearchSession[]> {
    return Array.from(this.sessions.values()).filter(s => s.missionId.toUpperCase() === missionId.toUpperCase());
  }

  async countByMissionId(missionId: string): Promise<number> {
    return (await this.findByMissionId(missionId)).length;
  }
}

// --- EVIDENCE REPOSITORY ---
export class MemoryEvidenceRepository implements IEvidenceRepository {
  private analyses: Map<string, ValidatedAnalysis> = new Map();

  async saveAnalysis(analysis: ValidatedAnalysis): Promise<ValidatedAnalysis> {
    this.analyses.set(analysis.sessionId, analysis);
    return analysis;
  }

  async findBySessionId(sessionId: string): Promise<ValidatedAnalysis | null> {
    return this.analyses.get(sessionId.toUpperCase()) || null;
  }

  async findByMissionId(missionId: string): Promise<ValidatedAnalysis[]> {
    return Array.from(this.analyses.values()).filter(a => a.missionId.toUpperCase() === missionId.toUpperCase());
  }

  async updateStatus(id: string, status: AnalysisStatus, reviewerNotes?: string, reviewer?: string): Promise<ValidatedAnalysis | null> {
    const analysis = await this.findBySessionId(id) || Array.from(this.analyses.values()).find(a => a.id === id);
    if (!analysis) return null;
    analysis.status = status;
    if (reviewerNotes) analysis.reviewerNotes = reviewerNotes;
    if (reviewer) analysis.reviewedBy = reviewer;
    analysis.reviewedAt = new Date().toISOString();
    this.analyses.set(analysis.sessionId, analysis);
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
    const demoBrief: DecisionBrief = {
      id: 'BRF-2026-081',
      missionId: 'MSN-2026-081',
      title: 'Rural Fertilizer Spot-Pricing & Procurement Dynamics: Falsification Analysis',
      status: 'APPROVED',
      recommendation: 'REJECT_OR_REFRAME',
      recommendationRationale: 'Primary business hypothesis falsified. Farmers do not pay retail price premiums out of spot-price ignorance; they overpay intentionally to secure un-collateralized harvest credit lines and immediate physical delivery guarantees.',
      executiveSummary: 'This scoped 5-participant research mission investigated whether smallholder farmers in Western UP would adopt a B2C spot-pricing fertilizer procurement app. Across all 5 screened operators, price was secondary to harvest-credit lock-in and same-day physical inspection. An e-commerce app requiring advance digital payments would face near-total resistance.',
      researchQuestion: 'Why do smallholders pay above-MRP premiums at village retail stores instead of seeking lower wholesale prices?',
      decisionAtStake: 'Allocation of $180,000 engineering and customer acquisition budget for B2C rural e-commerce app.',
      hypothesis: 'Farmers overpay due to lack of transparent real-time spot pricing.',
      falsificationOutcome: 'FALSIFIED: Informal retail credit (Sharma ji khata) and tractor return guarantees completely override price discounts.',
      sampleContext: {
        totalSessions: 5,
        participantRoles: ['Smallholder Farmer (Sugarcane)', 'Medium Farmer (Paddy)', 'Agri Retailer / Farm Owner'],
        geographies: ['Meerut, UP', 'Aligarh, UP', 'Bulandshahr, UP'],
        limitationsDisclaimer: 'Small qualitative research sample (N=5). Does not establish statistical prevalence or macro TAM.'
      },
      observedWorkflows: [
        'Seasonal bulk procurement during 48-hour sowing window',
        'Harvest-linked informal retailer credit extension (Khata ledger)',
        'Physical bag inspection and moisture verification before acceptance'
      ],
      coreProblems: [
        'Credit dependency: Fertilizer must be financed until post-harvest mandi payment',
        'Logistical last-mile failure: Commercial parcel services cannot navigate rural lanes with 50kg bags',
        'Counterfeit risk: Farmers demand immediate bag-level inspection'
      ],
      supportingEvidence: [
        {
          claim: 'Farmers intentionally overpay to preserve informal retailer credit line',
          sourceSessionId: 'SES-401',
          verbatimQuote: 'Dukan wale Sharma ji se udhaar milta hai fasal katne tak. Online agar 10% sasta bhi mile, par wo udhaar nahi dega...',
          operatorRole: 'Smallholder Farmer (4 Acres)'
        },
        {
          claim: 'Return logistics prevent adoption of contactless deliveries',
          sourceSessionId: 'SES-402',
          verbatimQuote: 'Hamare gaon me delivery truck nahi aata. Bori khud tractor se laani padti hai. Agar online order kiya aur bori phati nikli toh return kaun karega?',
          operatorRole: 'Medium Farmer (7 Acres)'
        }
      ],
      contradictoryFindings: [
        {
          aspect: 'Delivery Sensitivity vs Cost',
          observationA: 'Participant 401 prioritizes retailer credit above all factors.',
          observationB: 'Participant 402 can self-finance in cash but strictly refuses deliveries that cannot be inspected on-site.',
          implication: 'A fintech credit-only solution would solve 401 but fail to satisfy 402 quality inspection demand.'
        }
      ],
      existingWorkarounds: [
        {
          workaround: 'Village retail khata ledger with 2-3% monthly embedded credit interest',
          costOrFriction: '₹70-90 premium per bag over official MRP',
          whyCurrentTechFails: 'Requires zero paperwork and flexible payback timed to irregular harvest sales.'
        }
      ],
      knownImpacts: [
        'Annual input financing overhead of ₹4,000-8,000 per smallholder',
        'Tractor fuel and haulage time (4-6 hours per sowing cycle)'
      ],
      unknownInformation: [
        'Exact default rates experienced by village retailers during bad monsoon years',
        'Regulatory licensing requirements for digitizing fertilizer subsidy distributions'
      ],
      researchLimitations: [
        'Conducted exclusively in Western UP; credit customs in South India differ markedly.',
        'Sample size N=5 is qualitative discovery, not quantitative validation.'
      ],
      hypothesesGenerated: [
        'H2: B2B SaaS for village agro-retailers (Khata digitization + distributor inventory) has higher willingness to adopt than farmer-facing B2C apps.'
      ],
      followUpQuestions: [
        'What gross margin does a village retailer capture on fertilizer vs agrochemical pesticides?'
      ],
      decisionOptions: [
        {
          option: 'REJECT_OR_REFRAME',
          headline: 'Cancel B2C Farmer App; Pivot to B2B Agro-Retailer SaaS',
          description: 'Halt all consumer app development immediately. Re-frame research toward enabling existing village retailers with distributor inventory visibility.',
          tradeOffs: 'Saves $180,000 in unviable consumer acquisition; requires pivoting product roadmap.'
        },
        {
          option: 'INVESTIGATE_FURTHER',
          headline: 'Study Agro-Dealer Working Capital Financing',
          description: 'Investigate if partnering with rural NBFCs to provide credit directly through retail stores can unlock supply efficiency.',
          tradeOffs: 'Delays product launch by 8-12 weeks; involves fintech compliance complexity.'
        }
      ],
      createdAt: '2026-03-05T14:00:00Z',
      approvedAt: '2026-03-05T16:30:00Z',
      approvedBy: 'Lead Problem Intelligence Researcher'
    };
    this.briefs.set(demoBrief.missionId, demoBrief);
  }

  async saveBrief(brief: DecisionBrief): Promise<DecisionBrief> {
    this.briefs.set(brief.missionId.toUpperCase(), brief);
    return brief;
  }

  async findByMissionId(missionId: string): Promise<DecisionBrief | null> {
    return this.briefs.get(missionId.toUpperCase()) || null;
  }

  async findById(id: string): Promise<DecisionBrief | null> {
    return Array.from(this.briefs.values()).find(b => b.id.toUpperCase() === id.toUpperCase()) || null;
  }

  async updateStatus(missionId: string, status: BriefStatus, approvedBy?: string): Promise<DecisionBrief | null> {
    const brief = await this.findByMissionId(missionId);
    if (!brief) return null;
    brief.status = status;
    if (approvedBy) {
      brief.approvedBy = approvedBy;
      brief.approvedAt = new Date().toISOString();
    }
    this.briefs.set(brief.missionId.toUpperCase(), brief);
    return brief;
  }
}

// Instantiate and export standard instances
export const memoryOpsRepo = new MemoryOperationsRepository();
export const memoryMissionRepo = new MemoryMissionRepository(memoryOpsRepo);
export const memoryInvitationRepo = new MemoryInvitationRepository();
export const memorySessionRepo = new MemoryResearchResponseRepository(memoryMissionRepo, memoryOpsRepo);
export const memoryEvidenceRepo = new MemoryEvidenceRepository();
export const memoryBriefRepo = new MemoryBriefRepository();
