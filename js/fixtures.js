/**
 * GRIPR.STUDIO — B2B Problem Intelligence Fixtures (Phase 1 Refactor)
 * 
 * DISCLAIMER & SYNTHETIC DATA NOTICE:
 * All records herein are explicitly labelled SYNTHETIC DEMO FIXTURES (#DEMO_SYNTHETIC).
 * They represent structured B2B research missions, screened fictional participant sessions,
 * and Decision Intelligence Briefs designed exclusively for Buildathon demonstration and prototype testing.
 * No real user personally identifiable information (PII) is included, and no verified customer traction is claimed.
 */

window.GRIPR_FIXTURES = {
  // Master commissioned research missions (#DEMO_SYNTHETIC)
  missions: [
    {
      id: "MSN-2026-081",
      orgName: "RetailFlow Intelligence Labs",
      contactPerson: "Aditi Sharma",
      contactEmail: "aditi.sharma@retailflow.test",
      role: "VP of Product",
      sector: "retail",
      decisionAtStake: "Deciding whether to allocate $95,000 to engineer an automated WhatsApp UPI credit collection bot for neighborhood kirana stores, or reframe toward physical vernacular receipt-book ledger workflows.",
      hypothesis: "We believe Jaipur neighborhood kirana store owners lose 8-12% of revenue because they forget to collect customer udhaar (credit), and will adopt an automated digital payment reminder system to replace physical notebooks.",
      falsificationCriteria: "If retailers deliberately avoid automated digital reminders to preserve personal community trust and social relationships with neighbors, automated collection software will encounter severe resistance and rejection.",
      targetParticipantProfile: "Independent neighborhood kirana store owners in Jaipur operating for >5 years with at least 50 regular credit customers.",
      industry: "Neighborhood Retail & Vernacular Fintech",
      geography: "Jaipur, Rajasthan (Raja Park, Mansarovar, Malviya Nagar, Sanganer, Vaishali Nagar)",
      operationalContext: "High-density residential colonies; daily manual footfall; informal revolving credit extended to known resident families.",
      urgency: "Decision needed before Q3 product roadmapping (within 4 weeks).",
      constraints: "Interviews must be conducted in regional vernacular (Hindi / Hinglish); operators manage stores 14 hours daily and have minimal time for phone interaction.",
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
      token: "INV-KIRANA-081",
      missionId: "MSN-2026-081",
      studyTitle: "Research Study: Jaipur Kirana Customer Credit & Khata Operations",
      commissioningOrgType: "Retail Technology Product Team",
      facilitator: "GRIPR Research Operations Desk",
      targetProfile: "Neighborhood kirana store owners in Jaipur operating for >5 years with at least 50 regular credit customers.",
      estimatedDuration: "12-15 minutes structured narrative session",
      honorarium: "₹1,500 direct bank transfer honorarium upon verified research completion",
      consentNotice: "Participation is confidential and voluntary. Your personal identifiers (name, exact shop address) are redacted before research briefs are generated.",
      specificQuestions: [
        { id: "q_incident", label: "Describe your weekly process for tracking customer credit (udhaar). How do you record and reconcile dues?", type: "textarea", required: true },
        { id: "q_credit", label: "How do customers react when reminded about outstanding balances? Have you tried digital reminders?", type: "textarea", required: true },
        { id: "q_workaround", label: "When payment records are missed or contested, what workaround or ledger method do you use?", type: "textarea", required: true },
        { id: "q_impact", label: "What is your estimated unrecovered financial loss per month?", type: "text", required: true }
      ]
    }
  ],

  // Screened firsthand participant sessions for MSN-2026-081 (#DEMO_SYNTHETIC)
  participantSessions: [
    {
      id: "SES-401",
      missionId: "MSN-2026-081",
      participantPseudonym: "Participant 01 (Ramesh Kumar, #SYNTHETIC_DEMO)",
      role: "Kirana Store Owner (18 Years in Business)",
      location: "Raja Park, Jaipur, Rajasthan",
      language: "Hinglish / Hindi",
      sessionDate: "2026-05-06",
      verbatim: "Main Jaipur mein ek kirana store chalata hoon. Har hafte mujhe customer udhaar track karne mein problem hoti hai. Main notebook use karta hoon. Kabhi-kabhi payment records miss ho jaate hain. Exact financial loss mujhe nahi pata.",
      translation: "I run a kirana store in Jaipur. Every week I face problems tracking customer credit. I use a physical notebook. Sometimes payment records get missed. I don't know the exact financial loss.",
      workflow: "Customer visits counter -> Items packed -> Customer requests 'Khate mein likh lo' -> Retailer opens notebook -> Handwrites total -> End of week tally.",
      trigger: "Peak evening rush (6 PM - 9 PM); multiple credit customers simultaneously demanding quick packing.",
      impact: "Unknown exact financial loss. Missed tally entries cause unrecoverable disputes at month-end.",
      workaround: "Single physical ruled notebook kept beside the cash drawer; crossed out upon payment.",
      divergenceNotes: "Explicitly refuses to speculate on revenue loss figures: 'Exact financial loss mujhe nahi pata'.",
      consent: {
        studyProcessing: true,
        sanitizedBriefSharing: true,
        followUpInterview: true,
        contactEmail: "ramesh.rajapark.demo@gripr.test"
      }
    },
    {
      id: "SES-402",
      missionId: "MSN-2026-081",
      participantPseudonym: "Participant 02 (Suresh Sharma, #SYNTHETIC_DEMO)",
      role: "Provision Store Owner (12 Years in Business)",
      location: "Mansarovar, Jaipur, Rajasthan",
      language: "Hinglish",
      sessionDate: "2026-05-08",
      verbatim: "Agar main software se automated WhatsApp reminder bhejunga, toh mohalle wale naraz ho jayenge aur samne wali dukan pe chale jayenge. Udhaar vishwas pe chalta hai, machine pe nahi.",
      translation: "If I send automated WhatsApp reminders through software, neighborhood customers will feel insulted and switch to the competitor across the street. Customer credit runs on personal trust, not machines.",
      workflow: "Neighborhood trust accounting -> Informal credit ledger -> Gentle in-person inquiry when customer visits shop for daily milk.",
      trigger: "Fear of customer churn and social confrontation with resident families.",
      impact: "Delay of 45-60 days in recovering working capital; accepts delay to protect customer retention.",
      workaround: "Only mentions overdue balance verbally when the customer visits the shop for small cash items.",
      divergenceNotes: "Proves that automated digital reminders actively harm the retailer's primary competitive advantage: community trust.",
      consent: {
        studyProcessing: true,
        sanitizedBriefSharing: true,
        followUpInterview: true,
        contactEmail: "sharma.mansarovar.demo@gripr.test"
      }
    },
    {
      id: "SES-403",
      missionId: "MSN-2026-081",
      participantPseudonym: "Participant 03 (Dinesh Meena, #SYNTHETIC_DEMO)",
      role: "Daily Grocery & Dairy Vendor (8 Years in Business)",
      location: "Sanganer, Jaipur, Rajasthan",
      language: "Hinglish / Hindi",
      sessionDate: "2026-05-10",
      verbatim: "Diary mein page bhar jaate hain toh pichla hisaab naye page pe transfer karne mein galti hoti hai. Par customer ke samne phone nikal ke entry karna apmaan samjha jata hai.",
      translation: "When diary pages fill up, transferring old balances to a new page creates errors. But taking out a smartphone in front of a respected elder or regular customer to log credit is seen as disrespectful.",
      workflow: "Quick paper pencil entry on loose slips -> Evening transfer to thick Khata book -> Balance carry-over.",
      trigger: "Ledger book page overflow and human transcription errors between daily slip and master diary.",
      impact: "Estimated 2-3 hours wasted every Sunday evening reconciling ledger totals.",
      workaround: "Maintains two parallel diaries: one for active balances and one archive ledger.",
      divergenceNotes: "Highlight: Smartphone usage at the billing counter is culturally coded as transactional skepticism.",
      consent: {
        studyProcessing: true,
        sanitizedBriefSharing: true,
        followUpInterview: false
      }
    },
    {
      id: "SES-404",
      missionId: "MSN-2026-081",
      participantPseudonym: "Participant 04 (Anita Agarwal, #SYNTHETIC_DEMO)",
      role: "Family Kirana Co-owner (15 Years in Business)",
      location: "Malviya Nagar, Jaipur, Rajasthan",
      language: "Hindi",
      sessionDate: "2026-05-11",
      verbatim: "Ghar ki auratein aksar bachhon ko bhejti hain saman lene bina paise ke. Bachhe batate nahi ki kitna udhaar likhwaya. Mahine ke aakhiri hafte mein hisaab milane par behes hoti hai.",
      translation: "Homemakers frequently send small children to fetch groceries on credit without cash. The children don't remember what was written. At month-end, reconciling accounts leads to arguments with families.",
      workflow: "Child arrives with grocery list -> Items provided on credit -> Verbal entry in register -> Month-end family settlement.",
      trigger: "Third-party errand runners (children/domestic helpers) creating verbal miscommunication on quantities.",
      impact: "Frequent reconciliations, 5-10% disputed items at billing settlement.",
      workaround: "Started writing itemized carbon-copy physical slips; one copy given to child, one retained in shop.",
      divergenceNotes: "Carbon-copy paper slips work 10x better than mobile apps because the paper slip physically enters the customer's household kitchen.",
      consent: {
        studyProcessing: true,
        sanitizedBriefSharing: true,
        followUpInterview: true
      }
    },
    {
      id: "SES-405",
      missionId: "MSN-2026-081",
      participantPseudonym: "Participant 05 (Mukesh Choudhary, #SYNTHETIC_DEMO)",
      role: "Corner General Store Owner (22 Years in Business)",
      location: "Vaishali Nagar, Jaipur, Rajasthan",
      language: "Hinglish / Rajasthani",
      sessionDate: "2026-05-12",
      verbatim: "Digital khata app try kiya tha do saal pehle. Problem app mein nahi hai, problem ye hai ki customer UPI se turant paise nahi deta. Bolta hai 'agley hafte salary aane par denge'. App se cash thodi nikalta hai.",
      translation: "I tried a digital ledger app two years ago. The issue isn't the app; it's that customers don't have immediate liquidity. They say 'I'll pay when salary arrives next week'. An app doesn't create cash where there is none.",
      workflow: "Customer salary cycle alignment -> Credit extension 1st-25th -> Settlement between 1st-5th of next month.",
      trigger: "Household liquidity mismatch with grocery consumption timing.",
      impact: "App notification spam caused 3 affluent customers to close accounts and shop elsewhere.",
      workaround: "Uninstalled digital collection app; returned to physical Khata ledger with cordial verbal check-ins.",
      divergenceNotes: "Critical insight: Digital debt badgering ignores customer monthly wage payout schedules.",
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
    title: "Decision Intelligence Brief: Why Jaipur Kirana Retailers Struggle to Track Customer Credit",
    briefTitle: "Why Jaipur Kirana Retailers Struggle to Track Customer Credit",
    status: "APPROVED",
    recommendation: "REJECT_OR_REFRAME",
    recommendationRationale: "All 5 screened retailers demonstrated that customer credit (udhaar) is a customer retention mechanism rooted in neighborhood trust, not an accounting or debt-collection bottleneck. Automated WhatsApp collection reminders alienate customers and drive them to competing neighborhood stores. RetailFlow must halt planned development of automated collection bots and reframe toward physical vernacular duplicate ledger tools.",
    executiveSummary: "RetailFlow Intelligence Labs' initial hypothesis—that neighborhood kirana store owners lose revenue from forgotten credit and will eagerly adopt an automated WhatsApp UPI collection bot—is FALSIFIED by firsthand field evidence across 5 Jaipur retail operators. Kirana owners deliberately avoid automated collection messages because debt badgering threatens their core competitive moat: personal relationship trust. Retailers prefer manual notebooks despite transcription errors because paper ledgers are socially non-intrusive.",
    researchQuestion: "Why do Jaipur kirana retailers struggle to track customer credit, and would an automated WhatsApp collection bot reduce credit default without customer churn?",
    decisionAtStake: "Deciding whether to allocate $95,000 to engineer an automated WhatsApp UPI credit collection bot, or reframe toward physical vernacular receipt-book ledger workflows.",
    hypothesis: "Kirana store owners lose 8-12% of revenue because they forget to collect customer udhaar, and will adopt automated WhatsApp payment reminders to collect dues faster.",
    falsificationOutcome: "FALSIFIED: 5 of 5 participants demonstrated that automated debt collection damages neighborhood trust and drives customer defection. The bottleneck is customer cash-flow timing, not retailer memory.",
    sampleCohort: {
      totalParticipants: 5,
      breakdown: "5 Screened Independent Kirana & Provision Store Owners (8 to 22 years in business)",
      geographicCluster: "Jaipur, Rajasthan (Raja Park, Mansarovar, Sanganer, Malviya Nagar, Vaishali Nagar)",
      methodology: "Permissioned in-depth qualitative sessions with verbatim vernacular transcription and cross-actor contradiction auditing (#DEMO_SYNTHETIC)"
    },
    keyObservations: [
      {
        title: "Credit is a Relationship Lock-in Mechanism, Not Pure Debt",
        description: "100% of interviewed retailers stated that offering credit is the primary reason families do not switch to modern supermarkets (Blinkit, DMart). Threatening this relationship with robotic reminders causes instant customer defection.",
        traceableSessionIds: ["SES-401", "SES-402"]
      },
      {
        title: "Liquidity Timing Trumps Notification Frequency",
        description: "Customers delay payment because household salaries are paid on the 1st-5th of each month. Sending reminders on the 15th or 22nd creates frustration without generating cash.",
        traceableSessionIds: ["SES-405"]
      },
      {
        title: "Smartphones at the Billing Counter Signal Social Disrespect",
        description: "Taking out a smartphone to record credit in front of respected neighborhood elders is culturally coded as transactional distrust. Notebook entries are accepted as traditional and dignified.",
        traceableSessionIds: ["SES-403"]
      },
      {
        title: "Paper Slips Bridge the Household Kitchen Gap",
        description: "Children and domestic helpers frequently fetch groceries. A physical carbon-copy paper slip reaches the homemaker's kitchen, whereas SMS/WhatsApp messages are ignored or overlooked.",
        traceableSessionIds: ["SES-404"]
      }
    ],
    operationalWorkflowFriction: [
      { step: "1. Peak Evening Rush", friction: "Multiple customers demand quick item packing; manual notebook entries are postponed and forgotten." },
      { step: "2. Third-Party Pickups", friction: "Children sent without cash cannot verify prices, causing disputed balance totals at month-end." },
      { step: "3. Page Transfer Errors", friction: "Transferring unpaid balances across notebook pages introduces transcription mistakes." },
      { step: "4. Month-End Settlement", friction: "Retailer must politely navigate cordial verbal reminders without alienating long-term families." }
    ],
    contradictionsAndDivergences: [
      {
        pointOfDivergence: "Information Asymmetry vs Social Capital",
        details: "Software developers assume credit tracking fails due to forgotten records (SES-401). Field operators reveal that even when records are accurate, collection cannot be automated because credit is governed by community social norms (SES-402, SES-405)."
      },
      {
        pointOfDivergence: "Digital App Convenience vs Physical Household Touchpoint",
        details: "Product teams assume digital notifications provide superior reach. Retailers proved that physical carbon-copy paper slips (SES-404) are far more effective because they physically sit inside the family kitchen."
      }
    ],
    missingInformationAndGaps: [
      "Exact unrecoverable default percentages across seasonal migrant workers versus permanent property-owning residents were not quantified in this pilot.",
      "The feasibility of integrated vernacular mini-thermal receipt printers was not tested in this initial cohort.",
      "Interviews were restricted to Jaipur municipal areas; rural peri-urban kirana stores in Rajasthan may exhibit differing credit dynamics."
    ],
    researchLimitations: [
      "Sample size of 5 participants is designed strictly for hypothesis falsification and friction mapping, NOT statistical market sizing.",
      "All participants are male or co-owner operators; consumer household viewpoints were inferred through retailer operational accounts.",
      "Interviews conducted in urban Jaipur; behavior in tier-1 metros with heavy quick-commerce penetration will differ."
    ],
    aiAssistedInterpretation: {
      modelBadge: "Google Gemini AI Qualitative Clustering",
      interpretationNotice: "The following synthesis represents AI-assisted qualitative clustering reviewed and approved by a human research analyst. It is an analytical interpretation, not a reported fact.",
      synthesis: "The core commercial error is framing neighborhood credit as a collections problem. For kirana stores, credit is customer acquisition and retention capital. An automated collection bot attacks the retailer's core competitive advantage against quick-commerce. The high-leverage product opportunity is not debt badgering, but error-free physical-digital hybrid vernacular duplicate receipts that provide physical transparency to the household."
    },
    decisionRecommendation: {
      primaryRecommendation: "REJECT / REFRAME HYPOTHESIS",
      recommendedAction: "Halt planned $95,000 automated WhatsApp debt collection bot build immediately.",
      pivotOption: "Reframe research around a Vernacular Duplicate Slip Ledger with zero customer-facing collection badgering.",
      suggestedNextSteps: [
        "1. Conduct a second scoped mission (Cohort 2) focused on 5 Jaipur kirana stores testing physical carbon-copy vernacular receipt books.",
        "2. Interview homemakers to understand how kitchen grocery bills are audited and scheduled for monthly payout.",
        "3. Avoid all consumer-facing automated collection features that threaten community trust."
      ]
    }
  },

  // Research operations desk queue items (#DEMO_SYNTHETIC)
  opsQueue: [
    {
      id: "OPS-901",
      missionId: "MSN-2026-081",
      type: "session_review",
      title: "Review Participant Session SES-401 (Ramesh Kumar, Raja Park)",
      status: "reviewed",
      actionTaken: "Approved for Decision Brief inclusion; verified source quotation integrity and unknown financial loss."
    },
    {
      id: "OPS-902",
      missionId: "MSN-2026-081",
      type: "session_review",
      title: "Review Participant Session SES-402 (Suresh Sharma, Mansarovar)",
      status: "reviewed",
      actionTaken: "Approved for Decision Brief inclusion; identified relationship trust as primary falsification factor."
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
