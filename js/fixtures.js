/**
 * GRIPR.STUDIO — Synthetic Problem Intelligence Fixtures
 * 
 * DISCLAIMER:
 * All records herein are explicitly labelled DEMO FIXTURES (#DEMO_SYNTHETIC).
 * They represent structured firsthand operator observations designed for prototype
 * validation and testing. No real user personally identifiable information (PII) is included.
 */

window.GRIPR_FIXTURES = {
  // Master problem intelligence database
  signals: [
    {
      id: "SIG-019",
      title: "Fertilizer Dealer Spot Price Manipulation in Peak Sowing Seasons",
      quote: "Gaon mein fertilizer rates ka koi live system nahi hai. Dealership wale apni marzi ka rate lagate hain jab demand high hoti hai. Kisaan majboor hota hai.",
      translation: "In the village there is no live tracking system for fertilizer rates. Dealerships charge whatever rate they wish when demand peaks. Farmers are forced to pay.",
      category: "agriculture",
      region: "Rural MP (Sehore & Vidisha)",
      month: "May 2026",
      language: "Hinglish",
      evidenceStatus: "Triangulated", // Verified Firsthand | Triangulated | Emerging
      actor: "Smallholder farmers (1–5 acres) purchasing DAP & Urea during sowing windows",
      incident: "Retailers demand 18–30% above MRP during 10-day sowing windows, citing sudden spot shortage without verification",
      impact: "Increased input cost of ₹4,200/hectare; delayed application leading to 12% yield loss",
      workaround: "Farmers physically motor to 3–4 neighboring sub-districts or borrow at 3%/month from local moneylenders to pay dealer cash upfront",
      researchGaps: [
        "Prevalence across non-canal irrigated districts remains unmeasured",
        "Dealer-side wholesale margin constraints and credit hold-ups have not been independently audited",
        "Willingness to prepay for guaranteed digital allotment is unvalidated"
      ],
      limitations: "Evidence collected from 8 village clusters in central MP; does not reflect states with strict cooperative society rationing (e.g., Kerala).",
      relatedSignalIds: ["SIG-012", "SIG-016"]
    },
    {
      id: "SIG-020",
      title: "Fragmented WhatsApp Discharge Summaries Across Non-Network Hospitals",
      quote: "Hospital discharge summary WhatsApp pe bhejni padti hai. Koi central record nahi hai jo doosre doctor ko easily dikha sakein. Aadhe test dobara karane padte hain.",
      translation: "Hospital discharge summaries have to be sent over WhatsApp. There is no central record to easily show another doctor. Half the diagnostic tests end up repeated.",
      category: "healthcare",
      region: "Delhi NCR & Western UP",
      month: "May 2026",
      language: "हिंदी",
      evidenceStatus: "Verified Firsthand",
      actor: "Caregivers of chronic patients shifting between private nursing homes and secondary hospitals",
      incident: "Discharge notes issued as multi-page photocopies; lab values captured as unsearchable low-res photos",
      impact: "Average ₹6,500 wasted per patient on duplicated blood panels; clinical history gaps during ICU readmission",
      workaround: "Relatives maintain dedicated WhatsApp groups named 'Papa Medical Docs' and manually forward PDFs or photos on request",
      researchGaps: [
        "ABDM (Ayushman Bharat Digital Mission) adoption rate in Tier-2 standalone clinics is unknown",
        "Doctor willingness to read structured digital summaries vs original scans during emergency intake"
      ],
      limitations: "Sample focused on urban tertiary transfers; rural primary health center records are entirely paper-dependent.",
      relatedSignalIds: ["SIG-001", "SIG-011", "SIG-017"]
    },
    {
      id: "SIG-021",
      title: "Mandatory 100% Advance Payment Lockouts in Inter-District Freight",
      quote: "லோக்கல் டிரான்ஸ்போர்ட் advance payment இல்லாமல் கிடைக்காது. (Local transport isn't available without full advance payment). Trust is zero. சரக்கு உடைஞ்சா டிரைவர் போன் எடுக்க மாட்டார்.",
      translation: "Local transport isn't available without full advance payment. Trust is zero. If goods arrive damaged, the driver simply blocks the phone.",
      category: "logistics",
      region: "Tamil Nadu (Coimbatore–Madurai corridor)",
      month: "May 2026",
      language: "தமிழ்",
      evidenceStatus: "Verified Firsthand",
      actor: "Small pump and textile component manufacturers dispatching sub-load consignments",
      incident: "Unregistered single-truck owners refuse loading without 90-100% freight advance; zero liability taken for transit damage",
      impact: "₹15,000–₹45,000 working capital held hostage per trip; no dispute mediation mechanism exists",
      workaround: "Manufacturers hire private escort passengers to travel in the truck cabin with the cargo",
      researchGaps: [
        "True cargo damage frequency across unorganized operators",
        "Insurer willingness to write single-trip micro-transit policies under ₹50,000 cargo value"
      ],
      limitations: "Concentrated on light engineering corridors; does not reflect FMCG corporate contracts.",
      relatedSignalIds: ["SIG-002", "SIG-005", "SIG-018"]
    },
    {
      id: "SIG-022",
      title: "Physical Udhaar Register Loss and Silent Bad-Debt Write-Offs",
      quote: "Small shops still track udhaar in notebooks. Jab notebook ghum jati hai ya baarish mein bheegti hai, lakho ka udhaar khatam ho jata hai. Grahak dene se mana kar deta hai.",
      translation: "Small shops still track customer credit in notebooks. When a notebook is lost or soaked in rain, lakhs in outstanding credit vanish. Customers refuse to pay.",
      category: "commerce",
      region: "Pan India (Tier-2 & Tier-3 Towns)",
      month: "May 2026",
      language: "Hinglish",
      evidenceStatus: "Verified Firsthand",
      actor: "Independent Kirana and hardware store owners offering weekly credit to neighborhood households",
      incident: "Physical paper damage or misplacement leads to untraceable balances; disputed ledger entries",
      impact: "Estimated 4–8% annual revenue loss directly written off due to unprovable ledger disputes",
      workaround: "Cross-marking tallies in pocket diaries and asking customers to countersign individual paper slips",
      researchGaps: [
        "Why digital khata mobile apps were abandoned by this specific cohort (friction audit needed)",
        "Impact of vernacular voice ledger vs typing barrier"
      ],
      limitations: "Self-reported estimates by shop owners; credit ledger audits not independently reviewed.",
      relatedSignalIds: ["SIG-004", "SIG-007", "SIG-010"]
    },
    {
      id: "SIG-001",
      title: "Uncoordinated Walk-in Overload in Standalone Urban Clinics",
      quote: "Small clinics still manage appointments through WhatsApp groups. Patients miss slots. Doctors lose time. Subah 8 baje se line lagti hai par koi token system nahi chalta.",
      translation: "Small clinics still manage appointments through WhatsApp groups. Patients miss slots. Doctors lose time. Crowds queue from 8 AM but no token system works.",
      category: "healthcare",
      region: "Pan India (Metros & Tier-1 suburbs)",
      month: "May 2026",
      language: "English / Hinglish",
      evidenceStatus: "Triangulated",
      actor: "Single-physician general practices and consulting pediatricians",
      incident: "Compounders manually reply to 80+ WhatsApp chats while managing physical walk-in queues simultaneously",
      impact: "2.5 hours doctor downtime daily; patient wait times regularly exceed 90 minutes",
      workaround: "Physical paper token cards handed out strictly to whoever arrives in person at dawn",
      researchGaps: [
        "Clinic receptionist tech literacy and turnover frequency",
        "Willingness of elderly patients to adopt digital queuing without staff assistance"
      ],
      limitations: "Does not apply to corporate clinic chains (e.g., Apollo Clinics) with proprietary PMS.",
      relatedSignalIds: ["SIG-020", "SIG-011"]
    },
    {
      id: "SIG-002",
      title: "Agricultural Cold-Chain Sub-Load Refusal for Perishable Horticulture",
      quote: "Cold storage trucks refuse agricultural loads smaller than a certain tonnage. Individual farmers lose produce while trucks run half-empty.",
      translation: "Cold storage trucks refuse agricultural loads smaller than a certain tonnage. Individual farmers lose produce while trucks run half-empty.",
      category: "logistics",
      region: "Maharashtra (Nashik–Pune belt)",
      month: "May 2026",
      language: "English",
      evidenceStatus: "Verified Firsthand",
      actor: "Small tomato, grape, and strawberry farmers with sub-2 ton harvests",
      incident: "Refrigerated vehicles only accept full 10-16 ton bookings; smallholders cannot aggregate independently",
      impact: "25–35% spoilage of premium produce during summer transport; distress selling at local mandis",
      workaround: "Packing crates with ice blocks inside open-air non-refrigerated pickup trucks",
      researchGaps: [
        "Route matching density along common state highway consolidation nodes",
        "Temperature compliance auditing during multi-drop stops"
      ],
      limitations: "Observed in high-value horticulture zones; staple grain transport behaves differently.",
      relatedSignalIds: ["SIG-021", "SIG-018"]
    },
    {
      id: "SIG-004",
      title: "B2B Supplier Credit Notebook Mismatches for Neighborhood Retailers",
      quote: "Kirana store owners have no simple way to track which supplier owes them credit and which one they still owe. It's all in a notebook. Supplier invoice bolta hai 40,000, notebook bolti hai 34,000.",
      translation: "Kirana store owners have no simple way to track which supplier owes them credit and which they still owe. It is all in a notebook. The supplier invoice says 40,000, the notebook says 34,000.",
      category: "commerce",
      region: "Pan India (Tier-2 & Tier-3)",
      month: "May 2026",
      language: "Hinglish",
      evidenceStatus: "Verified Firsthand",
      actor: "Independent grocery store proprietors managing 15-20 distinct FMCG distributors",
      incident: "Delivery boys drop goods and handwrite altered invoices when items are missing; retailer updates notebook late",
      impact: "₹8,000–₹12,000 monthly reconciliation disputes per store; blocked distributor supplies",
      workaround: "Stapling carbon copies of handwritten delivery challans into thick physical cardboard folders",
      researchGaps: [
        "Level of distributor ERP openness to reconcile with informal merchant apps",
        "Dispute frequency between store owner and field delivery agents"
      ],
      limitations: "Focuses on fragmented retail; modern trade and franchisee stores use standardized POS.",
      relatedSignalIds: ["SIG-022", "SIG-007"]
    },
    {
      id: "SIG-009",
      title: "Repetitive In-Person Administrative Overhead for Farmer Subsidy Grants",
      quote: "Government subsidy applications require multiple physical visits to offices 40–60 km away. Har dafa ek naya document maangte hain. Most farmers give up.",
      translation: "Government subsidy applications require multiple physical visits to offices 40–60 km away. Every time they ask for a new document. Most farmers simply give up.",
      category: "compliance",
      region: "Rural India (UP & Bihar)",
      month: "May 2026",
      language: "Hinglish",
      evidenceStatus: "Triangulated",
      actor: "Marginal farmers applying for solar water pump and drip irrigation capital subsidies",
      incident: "Application portals show 'under review' indefinitely; field verification dates unnotified",
      impact: "Farmers lose 3-5 working days traveling; 40% abandon genuine subsidy claims after 2 failed visits",
      workaround: "Paying ₹1,500–₹3,000 commissions to unauthorized cyber-cafe operators to track files",
      researchGaps: [
        "State-specific grievance redressal API accessibility",
        "SMS notification deliverability on feature phones with DND active"
      ],
      limitations: "Varies substantially between states with unified farmer registries (e.g., Karnataka FRUITS) and those without.",
      relatedSignalIds: ["SIG-006", "SIG-015"]
    },
    {
      id: "SIG-010",
      title: "High UPI Transaction Failure Rates on Low-Spec Merchant Hardware",
      quote: "Street food vendors can't accept digital payments reliably. Most UPI apps crash on low-end phones with poor connectivity, aur soundbox 5 minute late bolta hai.",
      translation: "Street food vendors cannot accept digital payments reliably. Most UPI apps crash on low-end phones with poor connectivity, and the soundbox announces payments 5 minutes late.",
      category: "commerce",
      region: "Pan India (Urban & Semi-Urban)",
      month: "May 2026",
      language: "Hinglish",
      evidenceStatus: "Verified Firsthand",
      actor: "High-volume micro-vendors (tea stalls, chaat vendors, fruit carts) handling 200+ micro-tx/day",
      incident: "2G/3G network congestion at evening peaks stalls audio soundbox confirmations; customer walks away",
      impact: "Unrecovered lost revenue of ₹300–₹800/day during peak dinner hours; merchant distrust of pure QR",
      workaround: "Asking customers to show their screen screenshot or insisting on physical cash after 7 PM",
      researchGaps: [
        "Offline NFC token feasibility for sub-₹50 transactions on basic Indian devices",
        "Telco cell-tower throttle patterns around crowded bazaars"
      ],
      limitations: "Limited to congested street clusters; fixed brick-and-mortar stores usually possess fiber Wi-Fi.",
      relatedSignalIds: ["SIG-022", "SIG-014"]
    },
    {
      id: "SIG-006",
      title: "Unnotified Customs Tariff Code Reclassifications for Small Exporters",
      quote: "Customs paperwork requirements change without any official notice. Small exporters lose deals because they can't track silent regulatory changes until containers get held at port.",
      translation: "Customs paperwork requirements change without any official notice. Small exporters lose deals because they cannot track silent regulatory changes until containers get held at port.",
      category: "compliance",
      region: "Gujarat (Surat & Morbi export clusters)",
      month: "May 2026",
      language: "English",
      evidenceStatus: "Triangulated",
      actor: "Ceramics and textile MSME exporters shipping CIF consignments to Middle East & Africa",
      incident: "Customs circulars issued without structured RSS or developer feeds; port officers interpret codes arbitrarily",
      impact: "Demurrage charges of ₹18,000/day per 40ft container; delayed delivery penalties from international buyers",
      workaround: "Retaining high-cost customs clearing agents (CHAs) on monthly retainers regardless of shipment volume",
      researchGaps: [
        "Latency between DGFT public notice publication and ICEGATE system rule updates",
        "Standard deviation of detention times across Mundra vs Nhava Sheva ports"
      ],
      limitations: "Interviews conducted with export houses under ₹50 Cr turnover; large multinationals employ dedicated compliance departments.",
      relatedSignalIds: ["SIG-009", "SIG-018"]
    },
    {
      id: "SIG-008",
      title: "Lack of Verifiable Local Reputation for Tier-2 Freelance Technical Talent",
      quote: "Freelancers in Tier-2 cities have no way to prove their work history when approaching new clients. International portfolio sites don't carry trust in these local industrial markets.",
      translation: "Freelancers in Tier-2 cities have no way to prove their work history when approaching new clients. International portfolio sites don't carry trust in these local industrial markets.",
      category: "employment",
      region: "Tier-2 India (Indore, Coimbatore, Jaipur)",
      month: "May 2026",
      language: "English",
      evidenceStatus: "Emerging",
      actor: "Industrial CAD designers, embedded firmware engineers, and local software implementers",
      incident: "Local industrial buyers refuse to trust Upwork/GitHub profiles and require local peer introductions",
      impact: "3-6 month sales cycles for basic contract engineering; 40% discount on market rates accepted to win initial trust",
      workaround: "Executing initial prototype stages for free or working through established local consulting frontmen",
      researchGaps: [
        "Buyer verification criteria for technical competencies in non-IT hubs",
        "Escrow contract willingness among regional SME manufacturers"
      ],
      limitations: "Focused on technical and engineering services; creative graphic design behaves slightly differently.",
      relatedSignalIds: ["SIG-005", "SIG-015"]
    },
    {
      id: "SIG-016",
      title: "Uncalibrated Milk Fat Testing Disputes at Village Collection Centers",
      quote: "Dairy farmers have no way to track milk quality data between collection and processing. Machine fat percentage 0.5% kam dikhati hai aur daily ₹150 ka nuksaan hota hai.",
      translation: "Dairy farmers have no way to track milk quality data between collection and processing. The machine displays fat percentage 0.5% lower, causing a daily loss of ₹150.",
      category: "agriculture",
      region: "Rajasthan (Alwar & Jaipur rural)",
      month: "May 2026",
      language: "Hinglish",
      evidenceStatus: "Verified Firsthand",
      actor: "Small dairy farmers delivering 10–30 liters of cow/buffalo milk twice daily to collection booths",
      incident: "Ultrasonic analyzer sensors degrade without calibration; operators manually tweak calibration screws to widen cooperative margins",
      impact: "Direct 8–14% haircut on daily farmer milk payout; frequent shouting matches and milk dumping protests",
      workaround: "Farmers split identical batch samples across two competing village dairy collection centers",
      researchGaps: [
        "IoT telemetry feasibility on existing legacy milk testers",
        "Cooperative management willingness to permit tamper-evident data logging"
      ],
      limitations: "Applies to decentralized booth collection; private automated chillers show fewer calibration discrepancies.",
      relatedSignalIds: ["SIG-019", "SIG-012"]
    }
  ],

  // Inbound queue fixtures for the Admin review workspace (#DEMO_SYNTHETIC)
  adminQueue: [
    {
      id: "REV-104",
      submittedAt: "2026-05-18T14:22:00Z",
      contributorMeta: "Diagnostic Technician, Standalone Pathology Center, Kanpur (UP)",
      category: "healthcare",
      region: "Kanpur, Uttar Pradesh",
      language: "Hinglish",
      verbatim: "Reagents for rare hormone tests expire before small clinics can finish a 50-test pack. Distributor single vial ya 10-test pack nahi deta. Ham har mahine 12,000 ka reagent fek dete hain ya patient ko mana karte hain.",
      consent: {
        publicAnonymized: true,
        allowBuilderContact: true,
        contactEmail: "lab.kanpur.demo@gripr.test"
      },
      extracted: {
        actor: "Standalone diagnostic pathology lab operators in Tier-2/3 cities",
        trigger: "Distributor minimum packaging units (50-100 tests) exceed small-city monthly patient volume",
        impact: "₹10,000–₹15,000 monthly chemical wastage per lab or patient turnaround delayed by sending samples to metro labs",
        workaround: "Informal WhatsApp bartering with neighboring diagnostic centers to split test vials within 4 hours of opening",
        flaggedUnknowns: "Actual regulatory viability of split reagent decanting under NABL quality rules"
      },
      candidateMatches: [
        { id: "SIG-017", title: "Diagnostic labs in small cities charge wildly different prices for same test", similarity: "High (Domain & Actor overlap)" },
        { id: "SIG-020", title: "Fragmented WhatsApp Discharge Summaries Across Non-Network Hospitals", similarity: "Moderate (Healthcare workflow)" }
      ],
      reviewStatus: "pending" // pending | approved | rejected | needs_info
    },
    {
      id: "REV-105",
      submittedAt: "2026-05-19T09:15:00Z",
      contributorMeta: "Cold Storage Dock Supervisor, Pune District (MH)",
      category: "logistics",
      region: "Pune & Satara, Maharashtra",
      language: "Marathi / Hinglish",
      verbatim: "Chilled vegetable crates get kept on open sunlit loading docks for 3 hours during driver shift changes. Refrigeration sirf highway pe chalu hoti hai, loading yard pe nahi.",
      consent: {
        publicAnonymized: true,
        allowBuilderContact: false,
        contactEmail: null
      },
      extracted: {
        actor: "Refrigerated transport yard loading supervisors and small farmers",
        trigger: "Loading yards lack secondary standby electrical plugs (reefer plugs); truck engine turned off to save diesel during loading",
        impact: "Internal core produce temperature spikes by 8°C before transit even begins, halving retail shelf life",
        workaround: "Throwing wet jute sacks over top crates on the open loading dock",
        flaggedUnknowns: "Cost-benefit of yard solar power installations vs diesel generator backup"
      },
      candidateMatches: [
        { id: "SIG-002", title: "Agricultural Cold-Chain Sub-Load Refusal for Perishable Horticulture", similarity: "High (Corridor and temperature break overlap)" },
        { id: "SIG-021", title: "Mandatory 100% Advance Payment Lockouts in Inter-District Freight", similarity: "Low (General logistics)" }
      ],
      reviewStatus: "pending"
    },
    {
      id: "REV-106",
      submittedAt: "2026-05-19T16:45:00Z",
      contributorMeta: "Private Tuition Center Teacher, Patna (Bihar)",
      category: "education",
      region: "Patna, Bihar",
      language: "Hinglish",
      verbatim: "Parents commit to monthly fee of ₹800 per student. 3 mahine padhane ke baad bina bataye bache ko nikal lete hain. There is no enrollment contract or legal way for small tutors to collect overdue fees.",
      consent: {
        publicAnonymized: true,
        allowBuilderContact: true,
        contactEmail: "tutor.patna.demo@gripr.test"
      },
      extracted: {
        actor: "Independent coaching tutors and home educators",
        trigger: "Informal verbal fee agreements with post-facto default after exam season",
        impact: "20-30% unpaid bad debts at end of academic term; educator salary delays",
        workaround: "Demanding 3 months advance fee in cash or holding physical school report cards as collateral",
        flaggedUnknowns: "Legality of student record retention by private unaccredited tutors"
      },
      candidateMatches: [
        { id: "SIG-003", title: "Parents in Tier-2 cities have no reliable way to verify if local tutor is qualified", similarity: "Moderate (Education tuition market)" },
        { id: "SIG-022", title: "Physical Udhaar Register Loss and Silent Bad-Debt Write-Offs", similarity: "Moderate (Informal credit default)" }
      ],
      reviewStatus: "pending"
    },
    {
      id: "REV-107",
      submittedAt: "2026-05-20T06:10:00Z",
      contributorMeta: "Weaver Cooperative Manager, Varanasi (UP)",
      category: "commerce",
      region: "Varanasi, Uttar Pradesh",
      language: "Hindi / Hinglish",
      verbatim: "Raw silk yarn prices change 4 times a day based on Bangalore trading desks. Bunkar ko subah ka rate pata hota hai, dopahar ko jab maal lene jata hai toh 200 rupaye kilo badh jata hai. Handloom ka budget fail ho jata hai.",
      consent: {
        publicAnonymized: true,
        allowBuilderContact: true,
        contactEmail: "varanasi.weaver.demo@gripr.test"
      },
      extracted: {
        actor: "Traditional handloom silk saree weavers and artisan master-craftsmen",
        trigger: "Intraday commodity raw yarn price swings without digital forward pricing",
        impact: "Unhedged artisans absorb 100% price volatility; negative production margins on fixed buyer orders",
        workaround: "Halting loom production until yarn prices soften or substituting with synthetic polyester mix",
        flaggedUnknowns: "Hedging instruments availability for micro-weavers via commodity exchanges"
      },
      candidateMatches: [
        { id: "SIG-019", title: "Fertilizer Dealer Spot Price Manipulation in Peak Sowing Seasons", similarity: "High (Unannounced input spot-price spike)" },
        { id: "SIG-004", title: "B2B Supplier Credit Notebook Mismatches for Neighborhood Retailers", similarity: "Moderate (Supplier trust)" }
      ],
      reviewStatus: "pending"
    }
  ],

  // Synthetic Research Mission templates (#DEMO_SYNTHETIC)
  sampleMissions: [
    {
      id: "MSN-2026-081",
      orgName: "BharatAgritech Labs",
      contactEmail: "product@bharatagri.demo",
      role: "VP of Product",
      sector: "agriculture",
      problemToInvestigate: "Investigating the feasibility of a cooperative fertilizer spot-price registry and collective buying group in Central MP.",
      targetAudience: "Smallholder farmers (1-5 acres) and licensed fertilizer cooperative society secretaries",
      primaryDecision: "Deciding whether to build a vernacular WhatsApp bot for price reporting or a dealer B2B procurement network.",
      deliverables: ["Decision Brief", "Workflow Friction Map", "5 Screened Operator Transcripts"],
      status: "Scoping Confirmed",
      price: "₹49,000 (Pilot Scope)"
    }
  ]
};
