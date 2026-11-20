/**
 * GRIPR.STUDIO — B2B Problem Intelligence Fixtures (Phase 1 Refactor)
 * 
 * DISCLAIMER:
 * All records herein are explicitly labelled SYNTHETIC DEMO FIXTURES (#DEMO_SYNTHETIC).
 * They represent structured B2B research missions, screened participant sessions,
 * and Decision Intelligence Briefs designed for prototype validation.
 * No real user personally identifiable information (PII) is included.
 */

window.GRIPR_FIXTURES = {
  // Master commissioned research missions (#DEMO_SYNTHETIC)
  missions: [
    {
      id: "MSN-2026-081",
      orgName: "BharatAgritech Labs",
      contactPerson: "Aditi Rao",
      contactEmail: "aditi.rao@bharatagri.test",
      role: "VP of Product",
      sector: "agriculture",
      decisionAtStake: "Deciding whether to allocate $180,000 to engineer a standalone B2C farmer fertilizer price-comparison mobile app, or reframe toward a dealer procurement credit network.",
      hypothesis: "We believe smallholder farmers overpay for fertilizer because they lack real-time digital visibility into dealer spot prices, and will download an app to find cheaper dealers.",
      falsificationCriteria: "If farmers already know dealer prices are inflated but are locked into specific retailers due to informal seasonal credit, price comparison alone will not change purchasing behavior.",
      targetParticipantProfile: "Smallholder farmers (1-5 acres) purchasing DAP and Urea in non-canal irrigated districts during peak sowing.",
      industry: "Agricultural Inputs & Rural Fintech",
      geography: "Madhya Pradesh (Sehore and Vidisha districts)",
      operationalContext: "10-day seasonal sowing window; high time-sensitivity; local dealer monopoly.",
      urgency: "Decision needed before Q3 product roadmapping (within 4 weeks).",
      constraints: "Interviews must be conducted in regional vernacular (Malwi/Hinglish); operators cannot read complex English text.",
      deliverables: ["Decision Intelligence Brief", "Workflow Friction Map", "5 Screened Operator Transcripts", "Strategy Workshop"],
      status: "Brief Ready", // Requested | Scoping | Awaiting Agreement | Researching | Evidence Review | Brief Ready | Closed
      pricing: "₹49,000 (Experimental Pilot Scope)",
      pricingDisclaimer: "Experimental pilot pricing for 5 screened participants. Not an operational contract or guaranteed SLA.",
      participantTargetCount: 5,
      completedSessionCount: 5,
      createdAt: "2026-05-02T10:00:00Z",
      briefReadyAt: "2026-05-16T15:30:00Z"
    },
    {
      id: "MSN-2026-082",
      orgName: "PulseLogistics India",
      contactPerson: "Karthik Sundaram",
      contactEmail: "karthik@pulselogistics.test",
      role: "Founder & CEO",
      sector: "logistics",
      decisionAtStake: "Deciding whether to build an on-demand Uber-style booking app for refrigerated pickup trucks, or partner with existing rural APMC mandi consolidators.",
      hypothesis: "Small horticulture growers lose produce because they cannot find refrigerated vehicles on short notice for sub-2 ton shipments.",
      falsificationCriteria: "If cold storage vehicle owners refuse sub-load bookings due to temperature loss during multi-stop loading rather than dispatch coordination friction.",
      targetParticipantProfile: "Perishable fruit & vegetable farmers (tomato, grape, strawberry) in western Maharashtra dispatching sub-load consignments.",
      industry: "Cold Chain Freight & Agrilogistics",
      geography: "Maharashtra (Nashik–Pune corridor)",
      operationalContext: "Consignments under 2 tons; ambient temperature exceeding 38°C; distance to mandi 40–120 km.",
      urgency: "Standard research cadence (6 weeks).",
      constraints: "Requires field verification at APMC loading bays during 4 AM to 8 AM dispatch hours.",
      deliverables: ["Decision Intelligence Brief", "Workflow Friction Map", "5 Screened Operator Transcripts"],
      status: "Researching",
      pricing: "₹49,000 (Experimental Pilot Scope)",
      pricingDisclaimer: "Experimental pilot pricing. Unvalidated research model.",
      participantTargetCount: 5,
      completedSessionCount: 3,
      createdAt: "2026-05-10T12:00:00Z"
    },
    {
      id: "MSN-2026-083",
      orgName: "MedSupply Diagnostics",
      contactPerson: "Dr. Vikram Seth",
      contactEmail: "vseth@medsupply.test",
      role: "Head of Commercial Strategy",
      sector: "healthcare",
      decisionAtStake: "Deciding whether to introduce a fractional micro-vial reagent subscription (10-test vials) for standalone Tier-2 pathology centers.",
      hypothesis: "Standalone labs reject specialized hormonal blood panels because standard 50-test manufacturer packs expire before break-even, resulting in lost testing revenue.",
      falsificationCriteria: "If standalone labs prefer sending patient samples to centralized metro processing chains (e.g. Lal PathLabs) on 20% commission rather than running equipment in-house.",
      targetParticipantProfile: "Pathologists and chief laboratory technicians managing independent diagnostic centers in Tier-2/3 cities.",
      industry: "In-Vitro Diagnostics & Medical Consumables",
      geography: "Uttar Pradesh (Kanpur, Lucknow periphery, Varanasi)",
      operationalContext: "Monthly test volume 200–600 samples; no automated cold chain storage on site.",
      urgency: "Urgent exploratory scoping (2 weeks).",
      constraints: "Requires NABL regulatory compliance auditing regarding reagent decanting.",
      deliverables: ["Decision Intelligence Brief", "5 Screened Operator Transcripts"],
      status: "Scoping",
      pricing: "₹49,000 (Experimental Pilot Scope)",
      pricingDisclaimer: "Experimental pilot pricing. Unvalidated research model.",
      participantTargetCount: 5,
      completedSessionCount: 0,
      createdAt: "2026-05-18T09:30:00Z"
    }
  ],

  // Invitation-based research studies for field participants (#DEMO_SYNTHETIC)
  invitations: [
    {
      token: "INV-AGRI-081",
      missionId: "MSN-2026-081",
      studyTitle: "Research Study: Rural Fertilizer Spot-Pricing & Dealer Credit Realities",
      commissioningOrgType: "Agricultural Technology Research Team",
      facilitator: "GRIPR Research Operations Desk",
      targetProfile: "Smallholder farmers (1-5 acres) who purchased DAP or Urea during recent sowing seasons in Sehore/Vidisha districts, MP.",
      estimatedDuration: "12-15 minutes structured narrative session",
      honorarium: "₹1,500 direct bank transfer honorarium upon verified research completion",
      consentNotice: "Participation is confidential and voluntary. Your personal identifiers (name, exact shop name) are redacted before research briefs are generated.",
      specificQuestions: [
        { id: "q_incident", label: "Describe your most recent experience purchasing fertilizer during sowing. What rate was demanded vs officially listed?", type: "textarea", required: true },
        { id: "q_credit", label: "Did you pay full cash or purchase on dealer credit? How did payment terms affect the price?", type: "textarea", required: true },
        { id: "q_workaround", label: "When a dealer charges above MRP or runs out of stock, what do you and your neighbors do instead?", type: "textarea", required: true },
        { id: "q_impact", label: "What was the estimated cost or delay incurred by this situation?", type: "text", required: true }
      ]
    },
    {
      token: "INV-COLD-082",
      missionId: "MSN-2026-082",
      studyTitle: "Research Study: Perishable Produce Transport & Sub-Load Transit Friction",
      commissioningOrgType: "Logistics Technology Research Group",
      facilitator: "GRIPR Research Operations Desk",
      targetProfile: "Perishable produce farmers and transport consolidators in Nashik/Pune.",
      estimatedDuration: "15 minutes structured session",
      honorarium: "₹1,500 honorarium for verified participants",
      consentNotice: "Confidential research session. Data used exclusively for logistics workflow mapping.",
      specificQuestions: [
        { id: "q_incident", label: "Describe the last time you tried to transport a produce harvest under 2 tons to the market.", type: "textarea", required: true },
        { id: "q_workaround", label: "What cooling or aggregation method did you employ when refrigerated trucks were unavailable?", type: "textarea", required: true }
      ]
    }
  ],

  // Screened firsthand participant sessions for MSN-2026-081 (#DEMO_SYNTHETIC)
  participantSessions: [
    {
      id: "SES-401",
      missionId: "MSN-2026-081",
      participantPseudonym: "Participant 01 (Farmer)",
      role: "Smallholder Farmer (3.5 Acres, Soybean & Wheat)",
      location: "Sehore District, Madhya Pradesh",
      language: "Hinglish / Malwi",
      sessionDate: "2026-05-06",
      verbatim: "Gaon mein fertilizer rates ka koi live system nahi hai. Dealership wale apni marzi ka rate lagate hain jab demand high hoti hai. Kisaan majboor hota hai kyunki sowing window sirf 10 din ki hoti hai.",
      translation: "In the village there is no live system for fertilizer rates. Dealerships charge arbitrary rates when demand peaks. Farmers have no choice because the sowing window is only 10 days.",
      workflow: "Field preparation -> Sowing window opens -> Retailer visit -> Spot rate quotation -> Credit negotiation -> Loading.",
      trigger: "Sowing window opens with seasonal rainfall; acute spot demand surge over 72 hours.",
      impact: "Paid ₹1,650 for DAP bag against official MRP of ₹1,350 (22% unbudgeted markup); total ₹4,200 extra input cost.",
      workaround: "Borrowed ₹5,000 cash from local village moneylender at 3% monthly interest to pay dealer immediate spot cash.",
      divergenceNotes: "States that price transparency alone is useless if the dealer withholds the physical bag for credit customers.",
      consent: {
        studyProcessing: true,
        sanitizedBriefSharing: true,
        followUpInterview: true,
        contactEmail: "farmer.sehore.demo@gripr.test"
      }
    },
    {
      id: "SES-402",
      missionId: "MSN-2026-081",
      participantPseudonym: "Participant 02 (Farmer & Tractor Operator)",
      role: "Smallholder Farmer (4.5 Acres)",
      location: "Vidisha District, Madhya Pradesh",
      language: "Hinglish",
      sessionDate: "2026-05-08",
      verbatim: "Hum sabko pata hota hai ki dukan wala 250 rupaye extra le raha hai. Par hum doosre gaon nahi ja sakte kyunki wahan ka dealer humein udhaar nahi dega. Purana hisab yahin chalta hai.",
      translation: "All of us already know the shopkeeper is charging 250 rupees extra. But we cannot travel to another village because that dealer will not extend credit to strangers. Our credit history is locked to this one shop.",
      workflow: "Informal ledger accounting -> Credit drawdown during sowing -> Repayment post-harvest at mandi.",
      trigger: "Lack of alternative collateral-free working capital during pre-sowing purchase.",
      impact: "Tied purchasing lock-in; forced to purchase pesticide bundles as an unneeded condition of getting Urea bags.",
      workaround: "Accepting forced bundled products (unwanted micronutrient packets) and attempting to resell them to neighbors at 50% loss.",
      divergenceNotes: "Directly refutes the hypothesis that price ignorance is the primary root cause.",
      consent: {
        studyProcessing: true,
        sanitizedBriefSharing: true,
        followUpInterview: true,
        contactEmail: "operator.vidisha.demo@gripr.test"
      }
    },
    {
      id: "SES-403",
      missionId: "MSN-2026-081",
      participantPseudonym: "Participant 03 (Cooperative Secretary)",
      role: "Primary Agricultural Credit Society (PACS) Secretary",
      location: "Bhopal Periphery, Madhya Pradesh",
      language: "Hindi",
      sessionDate: "2026-05-09",
      verbatim: "Sarkari quota time par nahi pahunchta. Rake point par consignment delay hoti hai. Jab tak sarkari fertilizer aata hai, private dealer sara stock premium par bech chuka hota hai.",
      translation: "The official government quota does not arrive on time. Consignments are delayed at rail rake points. By the time cooperative fertilizer arrives, private dealers have already sold out their stock at high premiums.",
      workflow: "District rake point allocation -> Cooperative truck movement -> Society distribution -> POS biometric verification.",
      trigger: "Rail rake scheduling bottlenecks during multi-district sowing overlap.",
      impact: "Cooperative societies receive stock after sowing is completed, forcing farmers to buy from private spot retailers.",
      workaround: "Cooperative distributes tokens in advance, but farmers abandon tokens to purchase from private stores to avoid missing rainfall.",
      divergenceNotes: "Identifies logistics timing rather than retailer greed as the primary catalyst for spot premiums.",
      consent: {
        studyProcessing: true,
        sanitizedBriefSharing: true,
        followUpInterview: false
      }
    },
    {
      id: "SES-404",
      missionId: "MSN-2026-081",
      participantPseudonym: "Participant 04 (Retail Input Dealer)",
      role: "Licensed Fertilizer & Seed Retailer",
      location: "Sehore Town, Madhya Pradesh",
      language: "Hinglish",
      sessionDate: "2026-05-11",
      verbatim: "Company humein DAP ke sath slow-moving zinc packets lene ko bolti hai. Agar hum nahi lete toh humein Urea ka allotment nahi milta. Hum woh cost kisaan pe pass karne ko majboor hain.",
      translation: "The manufacturer forces us retailers to buy slow-moving zinc packets alongside DAP. If we refuse, they withhold our Urea quota. We are forced to pass that bundled cost on to the farmer.",
      workflow: "Manufacturer wholesaler billing -> Retail dealer unloading -> Mandatory bundling absorption -> Retail sale.",
      trigger: "Wholesale upstream bundling enforced by regional distribution distributors.",
      impact: "Retail margin on regulated Urea is only ₹11/bag, which fails to cover shop rent, electricity, and unloading labour.",
      workaround: "Retailers informally bundle the inventory or add a ₹100-200 'service/handling fee' to remain solvent.",
      divergenceNotes: "Reveals manufacturer-to-dealer upstream margin distortion rather than pure retailer exploitation.",
      consent: {
        studyProcessing: true,
        sanitizedBriefSharing: true,
        followUpInterview: true,
        contactEmail: "dealer.sehore.demo@gripr.test"
      }
    },
    {
      id: "SES-405",
      missionId: "MSN-2026-081",
      participantPseudonym: "Participant 05 (Marginal Farmer)",
      role: "Marginal Farmer (1.8 Acres)",
      location: "Ashta Tehsil, Madhya Pradesh",
      language: "Malwi / Hindi",
      sessionDate: "2026-05-12",
      verbatim: "Phone mein app dekhne se kya hoga? Agar app dikhayega ki 30 km door saste mein mil raha hai, toh wahan jane ka tempo rent 800 rupaye lagega. Local dukan se hi lena padta hai.",
      translation: "What will checking an app on the phone do? Even if an app shows fertilizer is cheaper 30 km away, the tempo vehicle fare to fetch it will cost 800 rupees. We have to purchase from the local village shop regardless.",
      workflow: "Physical neighborhood walking inspection -> Local shop purchase -> Head-load transport to field.",
      trigger: "Last-mile rural transport cost negates inter-village price arbitrage.",
      impact: "Geographic mobility barrier limits purchasing radius to strictly under 5 km.",
      workaround: "Pooling purchases with 3 neighboring farmers on a single shared tractor trolley.",
      divergenceNotes: "Demonstrates that physical transport friction exceeds digital price arbitrage value.",
      consent: {
        studyProcessing: true,
        sanitizedBriefSharing: true,
        followUpInterview: false
      }
    }
  ],

  // Full Decision Intelligence Brief for MSN-2026-081 (#DEMO_SYNTHETIC)
  decisionBrief: {
    missionId: "MSN-2026-081",
    briefTitle: "Decision Intelligence Brief: Rural Fertilizer Spot-Pricing & Procurement Dynamics",
    executiveSummary: "BharatAgritech's initial hypothesis—that smallholder farmers will adopt a B2C price-comparison mobile app to avoid paying retailer markups—is FALSIFIED by firsthand field evidence. Farmers do not overpay due to lack of price awareness; they overpay because they are locked into informal seasonal credit with local retailers, face mandatory upstream product bundling, and cannot justify last-mile transportation costs to arbitrage prices across sub-districts.",
    researchQuestion: "Does lack of digital spot-price visibility drive fertilizer price overpayment, and would a B2C mobile comparison app alter smallholder procurement behavior?",
    clientDecisionAtStake: "Deciding whether to allocate $180,000 to build and launch a consumer farmer price-discovery app, or pivot toward an institutional B2B dealer credit and procurement network.",
    sampleCohort: {
      totalParticipants: 5,
      breakdown: "3 Smallholder & Marginal Farmers (1.8 to 4.5 acres), 1 Cooperative Society (PACS) Secretary, 1 Licensed Fertilizer Retailer",
      geographicCluster: "Sehore and Vidisha districts, Madhya Pradesh",
      methodology: "Permissioned in-depth qualitative sessions with verbatim vernacular transcription and cross-actor contradiction auditing"
    },
    keyObservations: [
      {
        title: "Credit Lock-in Trumps Price Awareness",
        description: "100% of interviewed farmers stated they already know retailers demand 18–25% above MRP. However, they rely on the retailer for 4-month informal harvest credit. They cannot switch to an unfamiliar cheaper dealer who demands upfront cash.",
        traceableSessionIds: ["SES-401", "SES-402"]
      },
      {
        title: "Upstream Wholesaler Bundling Forces Retailer Markups",
        description: "Retailers operate on thin legal margins (₹11/bag on regulated Urea) and are forced by upstream distributors to buy slow-moving bio-fertilizers. Retailers pass this cost on through informal markups to stay solvent.",
        traceableSessionIds: ["SES-404"]
      },
      {
        title: "Last-Mile Transport Negates Inter-Village Arbitrage",
        description: "Hiring a rural three-wheeler or tempo to haul 4 bags from a cheaper dealership 25 km away costs ₹600–₹800, wiping out any $2–$3/bag price savings identified by an app.",
        traceableSessionIds: ["SES-405"]
      },
      {
        title: "Sowing Window Creates Non-Negotiable Time Panic",
        description: "The 10-day sowing window forces immediate purchasing upon the first rainfall. Farmers prioritize immediate physical possession over price negotiation.",
        traceableSessionIds: ["SES-401", "SES-403"]
      }
    ],
    operationalWorkflowFriction: [
      { step: "1. Sowing Window Opens", friction: "Rainfall triggers synchronized demand surge across all village farms simultaneously within 72 hours." },
      { step: "2. Retailer Stock Inspection", friction: "Retailers reserve scarce DAP/Urea bags specifically for long-term credit customers or cash-premium buyers." },
      { step: "3. Forced Product Bundling", friction: "Farmer is forced to take unwanted micronutrient packets along with fertilizer bags." },
      { step: "4. Informal Ledger Logging", friction: "Farmer signs paper notebook with undefined interest rates and harvest-linked repayment commitments." }
    ],
    contradictionsAndDivergences: [
      {
        pointOfDivergence: "Retailer Exploitation vs Upstream Margin Squeeze",
        details: "Farmers view local retailers as opportunistic price-gougers during sowing (SES-401). In contrast, the retailer interview (SES-404) proved that manufacturers mandate purchase of slow-moving zinc packets with every DAP consignment, forcing retailers to recover costs or go bankrupt."
      },
      {
        pointOfDivergence: "Cooperative Supply Failure",
        details: "Farmers believe cooperative staff secretly divert subsidized fertilizer to private markets (SES-401). The cooperative secretary (SES-403) demonstrated that railway rake point scheduling delays prevent stock from arriving before the sowing window closes."
      }
    ],
    missingInformationAndGaps: [
      "Wholesale distributor invoice records were not directly audited; claims of mandatory manufacturer bundling rely on retailer testimony.",
      "The feasibility of digital Kisan Credit Card (KCC) point-of-sale integration for standalone retailers was not evaluated in this pilot.",
      "District cooperative society corruption versus pure logistical rake delays requires formal RTI administrative data validation."
    ],
    researchLimitations: [
      "Sample size of 5 participants is designed for hypothesis falsification and friction mapping, NOT statistical market sizing.",
      "Geographic focus limited to central Madhya Pradesh; states with strict digital cooperative systems (e.g., Kerala, Tamil Nadu) behave differently.",
      "Interviews conducted immediately post-Rabi sowing; seasonal Kharif supply dynamics may vary."
    ],
    aiAssistedInterpretation: {
      modelBadge: "Gemini 1.5 Pro Cross-Verification Synthesis",
      interpretationNotice: "The following synthesis represents AI-assisted qualitative clustering reviewed by a human research analyst. It is an analytical interpretation, not a reported fact.",
      synthesis: "The core commercial bottleneck is not information asymmetry (price ignorance), but working capital lock-in and physical distribution friction. A B2C consumer app will suffer high initial install drop-off because users cannot act upon price visibility. The viable commercial entry point is a B2B procurement and trade credit network that provides authorized retailers with unbundled inventory financing."
    },
    decisionRecommendation: {
      primaryRecommendation: "REJECT / REFRAME HYPOTHESIS",
      recommendedAction: "Cancel the $180,000 B2C price-comparison app roadmap immediately.",
      pivotOption: "Reframe research around a B2B Retailer Working Capital & Unbundled Procurement Network (Option C).",
      suggestedNextSteps: [
        "1. Conduct a second scoped mission (Cohort 2) focused on 6 agricultural input retailers to map wholesale manufacturer bundling terms.",
        "2. Interview rural regional rural banks (RRBs) regarding digital KCC disbursement at independent agro-dealers.",
        "3. Avoid consumer marketing spend until the credit lock-in bottleneck is structurally unbundled."
      ]
    }
  },

  // Research operations desk queue items (#DEMO_SYNTHETIC)
  opsQueue: [
    {
      id: "OPS-901",
      missionId: "MSN-2026-081",
      type: "session_review",
      title: "Review Participant Session SES-405 (Marginal Farmer, Ashta)",
      status: "reviewed",
      actionTaken: "Approved for Decision Brief inclusion; flagged transport friction as core contradiction."
    },
    {
      id: "OPS-902",
      missionId: "MSN-2026-082",
      type: "screening",
      title: "Screen Participant Candidate: Strawberry Consolidator, Mahabaleshwar",
      status: "pending",
      actionTaken: "Awaiting telephone pre-qualification on vehicle ownership."
    },
    {
      id: "OPS-903",
      missionId: "MSN-2026-083",
      type: "scope_review",
      title: "Scope Review: MedSupply Diagnostics Fractional Reagent Scoping",
      status: "pending",
      actionTaken: "Verify NABL regulatory parameters before issuing client proposal."
    }
  ]
};
