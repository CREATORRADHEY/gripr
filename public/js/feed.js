// GRIPR Signal Feed — curated problem data + filter logic
// Manually curated. Not algorithmic. Not sorted by engagement.
// Every problem here was selected for signal quality, not popularity.

const signals = [
  {
    id: "SIG-019",
    quote: "Gaon mein fertilizer rates ka koi live system nahi hai. Dealership wale apni marzi ka rate lagate hain jab demand high hoti hai.",
    category: "agriculture",
    region: "Rural MP",
    month: "May 2025",
    language: "Hinglish",
    freshness: "Added Today"
  },
  {
    id: "SIG-020",
    quote: "Hospital discharge summary WhatsApp pe bhejni padti hai. Koi central record nahi hai jo doosre doctor ko easily dikha sakein.",
    category: "healthcare",
    region: "Delhi NCR",
    month: "May 2025",
    language: "हिंदी",
    freshness: "Seen Repeatedly"
  },
  {
    id: "SIG-021",
    quote: "லோக்கல் டிரான்ஸ்போர்ட் advance payment இல்லாமல் கிடைக்காது. (Local transport isn't available without full advance payment). Trust is zero.",
    category: "logistics",
    region: "Tamil Nadu",
    month: "May 2025",
    language: "தமிழ்",
    freshness: "Added Today"
  },
  {
    id: "SIG-022",
    quote: "Small shops still track udhaar in notebooks. Jab notebook ghum jati hai, lakho ka udhaar khatam ho jata hai.",
    category: "commerce",
    region: "Pan India",
    month: "May 2025",
    language: "Hinglish",
    freshness: "Recently Submitted"
  },
  {
    id: "SIG-001",
    quote: "Small clinics still manage appointments through WhatsApp groups. Patients miss slots. Doctors lose time.",
    category: "healthcare",
    region: "Pan India",
    month: "May 2025"
  },
  {
    id: "SIG-002",
    quote: "Cold storage trucks refuse agricultural loads smaller than a certain tonnage. Individual farmers lose produce while trucks run half-empty.",
    category: "logistics",
    region: "Maharashtra",
    month: "May 2025"
  },
  {
    id: "SIG-003",
    quote: "Parents in Tier-2 cities have no reliable way to verify if a local tutor is actually qualified. Everything runs on word of mouth and trust.",
    category: "education",
    region: "Tier-2 India",
    month: "May 2025"
  },
  {
    id: "SIG-004",
    quote: "Kirana store owners have no simple way to track which supplier owes them credit and which one they still owe. It's all in a notebook.",
    category: "commerce",
    region: "Pan India",
    month: "May 2025"
  },
  {
    id: "SIG-005",
    quote: "Factory owners can't find verified welders or machinists for short-duration projects. There's no trusted labour sourcing for manufacturing work.",
    category: "logistics",
    region: "Delhi NCR",
    month: "May 2025"
  },
  {
    id: "SIG-006",
    quote: "Customs paperwork requirements change without any official notice. Small exporters lose deals because they can't track silent regulatory changes.",
    category: "compliance",
    region: "Gujarat",
    month: "May 2025"
  },
  {
    id: "SIG-007",
    quote: "Raw material suppliers regularly disappear after receiving advance payments. Small business owners have no recourse and no way to verify reliability.",
    category: "commerce",
    region: "Pan India",
    month: "May 2025"
  },
  {
    id: "SIG-008",
    quote: "Freelancers in Tier-2 cities have no way to prove their work history when approaching new clients. Portfolio sites don't carry trust in these markets.",
    category: "employment",
    region: "Tier-2 India",
    month: "May 2025"
  },
  {
    id: "SIG-009",
    quote: "Government subsidy applications for farmers require multiple physical visits to offices that are 40–60 km away. Most give up.",
    category: "compliance",
    region: "Rural India",
    month: "May 2025"
  },
  {
    id: "SIG-010",
    quote: "Street food vendors still can't accept digital payments reliably. Most UPI apps crash on low-end phones with poor connectivity.",
    category: "commerce",
    region: "Pan India",
    month: "May 2025"
  },
  {
    id: "SIG-011",
    quote: "Hospital discharge summaries are still printed on paper. Patients can't share them digitally with other doctors or specialists.",
    category: "healthcare",
    region: "Pan India",
    month: "May 2025"
  },
  {
    id: "SIG-012",
    quote: "Agricultural produce prices change daily but farmers have no real-time visibility. By the time they decide to sell, prices have shifted.",
    category: "agriculture",
    region: "Pan India",
    month: "May 2025"
  },
  {
    id: "SIG-013",
    quote: "Small school owners can't afford proper student management software. They use WhatsApp groups and paper registers simultaneously.",
    category: "education",
    region: "Tier-2 India",
    month: "May 2025"
  },
  {
    id: "SIG-014",
    quote: "There's no trustworthy platform to find verified local plumbers or electricians. Every booking is a gamble on quality and punctuality.",
    category: "commerce",
    region: "Pan India",
    month: "May 2025"
  },
  {
    id: "SIG-015",
    quote: "The language barrier makes it impossible for rural workers to use most job platforms. Every app assumes English literacy.",
    category: "employment",
    region: "Rural India",
    month: "May 2025"
  },
  {
    id: "SIG-016",
    quote: "Dairy farmers have no way to track milk quality data between collection and processing. Disputes happen with no evidence.",
    category: "agriculture",
    region: "Rajasthan",
    month: "May 2025"
  },
  {
    id: "SIG-017",
    quote: "Diagnostic labs in small cities charge wildly different prices for the same test. Patients have no way to compare or negotiate.",
    category: "healthcare",
    region: "Tier-2 India",
    month: "May 2025"
  },
  {
    id: "SIG-018",
    quote: "Construction contractors have no standard way to track material theft on site. Losses are absorbed silently and built into future quotes.",
    category: "logistics",
    region: "Pan India",
    month: "May 2025"
  }
];

const categoryLabels = {
  healthcare: "Healthcare",
  logistics: "Logistics",
  education: "Education",
  agriculture: "Agriculture",
  finance: "Finance",
  commerce: "Local Commerce",
  compliance: "Compliance",
  employment: "Employment"
};

let activeFilter = "all";

function renderCards(filter) {
  const grid = document.getElementById("feedGrid");
  const filtered = filter === "all" ? signals : signals.filter(s => s.category === filter);

  const faced = JSON.parse(localStorage.getItem('gripr_faced') || '[]');

  grid.innerHTML = filtered.map((s, i) => {
    const isFaced = faced.includes(s.id);
    return `
    <div class="signal-card fade-in" style="animation-delay:${i * 0.05}s">
      <div class="signal-meta">
        <div style="display:flex; gap:0.5rem; align-items:center; flex-wrap:wrap;">
          <span class="signal-category">${categoryLabels[s.category] || s.category}</span>
          ${s.language ? `<span class="signal-tag-lang">${s.language}</span>` : ''}
          ${s.freshness ? `<span class="signal-tag-fresh">${s.freshness}</span>` : ''}
        </div>
        <span class="signal-region">${s.region}</span>
      </div>
      <p class="signal-quote">"${s.quote}"</p>
      <div class="signal-footer">
        <span class="signal-id">${s.id}</span>
        <div class="signal-actions">
          <button class="signal-btn face-this ${isFaced ? 'faced' : ''}" data-id="${s.id}" onclick="faceThis(this, '${s.id}')">
            <span class="face-icon">👋</span>
            <span class="face-label">I face this too</span>
            <span class="face-count">${getFaceCount(s.id)}</span>
          </button>
          <button class="signal-btn share-btn" onclick="shareSignal('${s.id}', \`${s.quote.replace(/`/g, "'")}\`)">
            <span>↗</span>
          </button>
        </div>
      </div>
    </div>
  `}).join('');

  // Re-trigger fade-in for newly rendered cards
  setTimeout(() => {
    document.querySelectorAll('.signal-card.fade-in').forEach(el => {
      el.classList.add('visible');
    });
  }, 50);
}

function getFaceCount(id) {
  const counts = JSON.parse(localStorage.getItem('gripr_face_counts') || '{}');
  // Base random counts for seed data
  const baseCounts = { "SIG-001": 24, "SIG-002": 18, "SIG-003": 56, "SIG-004": 32, "SIG-005": 11, "SIG-006": 9, "SIG-008": 42, "SIG-010": 89 };
  return (counts[id] !== undefined ? counts[id] : (baseCounts[id] || 0));
}

function faceThis(btn, id) {
  const counts = JSON.parse(localStorage.getItem('gripr_face_counts') || '{}');
  const faced = JSON.parse(localStorage.getItem('gripr_faced') || '[]');
  
  // Base random counts for seed data
  const baseCounts = { "SIG-001": 24, "SIG-002": 18, "SIG-003": 56, "SIG-004": 32, "SIG-005": 11, "SIG-006": 9, "SIG-008": 42, "SIG-010": 89 };
  
  if (counts[id] === undefined) {
    counts[id] = baseCounts[id] || 0;
  }

  if (faced.includes(id)) {
    // Undo
    counts[id] = Math.max(0, counts[id] - 1);
    const index = faced.indexOf(id);
    if (index > -1) faced.splice(index, 1);
    btn.classList.remove('faced');
  } else {
    // Upvote
    counts[id] += 1;
    faced.push(id);
    btn.classList.add('faced');
  }

  localStorage.setItem('gripr_face_counts', JSON.stringify(counts));
  localStorage.setItem('gripr_faced', JSON.stringify(faced));

  btn.querySelector('.face-count').textContent = counts[id];
}

function shareSignal(id, quote) {
  const text = `"${quote}" — Real frustration from India. Spotted on GRIPR.\nhttps://gripr.studio/feed`;
  
  const fallbackShare = () => {
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`;
    window.open(twitterUrl, '_blank');
  };

  if (navigator.share) {
    navigator.share({ text }).catch(fallbackShare);
  } else {
    fallbackShare();
  }
}

function setFilter(category) {
  activeFilter = category;

  // Update button states
  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.filter === category);
  });

  renderCards(category);

  // Update count display
  const filtered = category === "all" ? signals : signals.filter(s => s.category === category);
  document.getElementById("signalCount").textContent = filtered.length;
}

// Scroll reveal
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) entry.target.classList.add('visible');
  });
}, { threshold: 0.08, rootMargin: '0px 0px -20px 0px' });

document.addEventListener('DOMContentLoaded', () => {
  renderCards("all");
  document.querySelectorAll('.signal-card').forEach(el => observer.observe(el));
  document.getElementById("signalCount").textContent = signals.length;

  // Nav scroll
  window.addEventListener('scroll', () => {
    document.querySelector('.nav-wrapper')?.classList.toggle('scrolled', window.scrollY > 20);
  });
});
