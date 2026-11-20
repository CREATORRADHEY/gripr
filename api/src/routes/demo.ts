import { FastifyInstance } from 'fastify';
import { GeminiService } from '../services/gemini.service.js';

interface DemoPacket {
  packetId: string;
  sourceOperator: string;
  role: string;
  locality: string;
  narrative: string;
  workaround: string;
  workflow: string;
}

const CANONICAL_DEMO_PACKETS: Record<string, DemoPacket> = {
  'PKT-401': {
    packetId: 'PKT-401',
    sourceOperator: 'Ramesh Kumar (#SYNTHETIC_DEMO)',
    role: 'Kirana Store Owner (18 Years in Business)',
    locality: 'Raja Park, Jaipur, Rajasthan',
    narrative: 'Main Jaipur mein ek kirana store chalata hoon. Har hafte mujhe customer udhaar track karne mein problem hoti hai. Main notebook use karta hoon. Kabhi-kabhi payment records miss ho jaate hain. Exact financial loss mujhe nahi pata.',
    workaround: 'Main notebook use karta hoon.',
    workflow: 'Customer credit tracking & cash drawer ledger'
  },
  'PKT-402': {
    packetId: 'PKT-402',
    sourceOperator: 'Suresh Sharma (#SYNTHETIC_DEMO)',
    role: 'Provision Store Owner (12 Years in Business)',
    locality: 'Mansarovar, Jaipur, Rajasthan',
    narrative: 'Agar main software se automated WhatsApp reminder bhejunga, toh mohalle wale naraz ho jayenge aur samne wali dukan pe chale jayenge. Udhaar vishwas pe chalta hai, machine pe nahi.',
    workaround: 'Only mentions overdue balance verbally when the customer visits the shop for small cash items.',
    workflow: 'Payment reminder behavior & relationship trust'
  },
  'PKT-403': {
    packetId: 'PKT-403',
    sourceOperator: 'Dinesh Meena (#SYNTHETIC_DEMO)',
    role: 'Daily Grocery & Dairy Vendor (8 Years in Business)',
    locality: 'Sanganer, Jaipur, Rajasthan',
    narrative: 'Diary mein page bhar jaate hain toh pichla hisaab naye page pe transfer karne mein galti hoti hai. Par customer ke samne phone nikal ke entry karna apmaan samjha jata hai.',
    workaround: 'Maintains two parallel diaries: one for active balances and one archive ledger.',
    workflow: 'Ledger overflow & billing counter phone etiquette'
  },
  'PKT-404': {
    packetId: 'PKT-404',
    sourceOperator: 'Anita Agarwal (#SYNTHETIC_DEMO)',
    role: 'Family Kirana Co-owner (15 Years in Business)',
    locality: 'Malviya Nagar, Jaipur, Rajasthan',
    narrative: 'Ghar ki auratein aksar bachhon ko bhejti hain saman lene bina paise ke. Bachhe batate nahi ki kitna udhaar likhwaya. Mahine ke aakhiri hafte mein hisaab milane par behes hoti hai.',
    workaround: 'Started writing itemized carbon-copy physical slips; one copy given to child, one retained in shop.',
    workflow: 'Domestic errand runners & carbon-copy paper slips'
  },
  'PKT-405': {
    packetId: 'PKT-405',
    sourceOperator: 'Mukesh Choudhary (#SYNTHETIC_DEMO)',
    role: 'Corner General Store Owner (22 Years in Business)',
    locality: 'Vaishali Nagar, Jaipur, Rajasthan',
    narrative: 'Digital khata app try kiya tha do saal pehle. Problem app mein nahi hai, problem ye hai ki customer UPI se turant paise nahi deta. Bolta hai \'agley hafte salary aane par denge\'. App se cash thodi nikalta hai.',
    workaround: 'Uninstalled digital collection app; returned to physical Khata ledger with cordial verbal check-ins.',
    workflow: 'Customer salary liquidity cycles & app churn'
  }
};

export async function demoRoutes(
  fastify: FastifyInstance,
  options: { geminiService: GeminiService }
) {
  const { geminiService } = options;

  fastify.post('/demo/live-gemini-analysis', {
    schema: {
      body: {
        type: 'object',
        properties: {
          packetId: { type: 'string', maxLength: 32 }
        },
        additionalProperties: false
      }
    },
    config: {
      rateLimit: {
        max: 10,
        timeWindow: '1 minute'
      }
    }
  }, async (request, reply) => {
    const body = (request.body as { packetId?: string }) || {};
    const requestedId = body.packetId && CANONICAL_DEMO_PACKETS[body.packetId] ? body.packetId : 'PKT-401';
    const packet = CANONICAL_DEMO_PACKETS[requestedId];

    const startTime = Date.now();

    try {
      // Force live Gemini execution if service is available
      const result = await geminiService.extractEvidence(
        packet.narrative,
        packet.workaround,
        packet.role,
        packet.workflow,
        { forceLive: true, allowMockFallback: true }
      );

      const latencyMs = Date.now() - startTime;
      const ext = result.extraction;

      // Verbatim source quotation verification
      const verifyQuote = (quote: string | null | undefined): boolean => {
        if (!quote) return true;
        const normNarrative = packet.narrative.toLowerCase().replace(/\s+/g, ' ');
        const parts = quote.toLowerCase().split('...').map(p => p.trim()).filter(Boolean);
        return parts.every(part => normNarrative.includes(part));
      };

      const quotationChecks = {
        reportedProblem: {
          quote: ext.reportedProblem.sourceQuote,
          valid: verifyQuote(ext.reportedProblem.sourceQuote)
        },
        frequency: {
          quote: ext.frequency.sourceQuote,
          valid: verifyQuote(ext.frequency.sourceQuote)
        },
        financialImpact: {
          quote: ext.financialImpact.sourceQuote,
          valid: verifyQuote(ext.financialImpact.sourceQuote),
          isUnknown: ext.financialImpact.category === 'UNKNOWN'
        },
        workaround: {
          quote: ext.currentWorkaround.sourceQuote,
          valid: verifyQuote(ext.currentWorkaround.sourceQuote)
        }
      };

      return reply.status(200).send({
        success: true,
        mode: result.processingMode,
        packetId: packet.packetId,
        sourceOperator: packet.sourceOperator,
        locality: packet.locality,
        modelUsed: result.modelUsed,
        latencyMs,
        tokenEstimate: result.tokenEstimate || null,
        extraction: ext,
        quotationValidation: quotationChecks,
        disclaimer: 'SYNTHETIC DEMONSTRATION INTELLIGENCE · PROCESSED VIA GEMINI AI'
      });
    } catch (err: any) {
      const latencyMs = Date.now() - startTime;
      return reply.status(200).send({
        success: false,
        mode: 'ERROR_OR_FALLBACK',
        packetId: packet.packetId,
        latencyMs,
        error: err.message || 'Live Gemini request could not be completed.',
        suggestion: 'Switch to Precomputed Demo Analysis (Mode A) for guaranteed offline walkthrough.'
      });
    }
  });
}
