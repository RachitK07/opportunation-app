import { useState, useEffect } from "react";

// ── CURRENCY CONFIG ───────────────────────────────────────────────────────────

const CURRENCY_META = {
  USD: { symbol: "$", label: "USD" },
  SGD: { symbol: "S$", label: "SGD" },
  MYR: { symbol: "RM", label: "MYR" },
  IDR: { symbol: "Rp", label: "IDR" },
  THB: { symbol: "฿", label: "THB" },
};

const FALLBACK_RATES = {
  USD: 1, SGD: 1.34, MYR: 4.72, IDR: 16200, THB: 35.5,
};

const EXCHANGE_API = "https://v6.exchangerate-api.com/v6/430733d7d390f48dc6e29d46/latest/USD";

// ── TAX BRACKETS ─────────────────────────────────────────────────────────────

const TAX_BRACKETS = {
  Indonesia: {
    brackets: [
      { upTo: 500, rate: 0.05 },
      { upTo: 2500, rate: 0.15 },
      { upTo: 8333, rate: 0.25 },
      { upTo: Infinity, rate: 0.30 },
    ],
    note: "Indonesian progressive tax (PPh 21). Foreign workers taxed as residents after 183 days.",
  },
  Singapore: {
    brackets: [
      { upTo: 1667, rate: 0 },
      { upTo: 4167, rate: 0.02 },
      { upTo: 8333, rate: 0.035 },
      { upTo: 16667, rate: 0.07 },
      { upTo: Infinity, rate: 0.115 },
    ],
    note: "Singapore progressive tax. One of Southeast Asia's lowest personal income tax rates.",
  },
  Malaysia: {
    brackets: [
      { upTo: 833, rate: 0 },
      { upTo: 2500, rate: 0.01 },
      { upTo: 4167, rate: 0.03 },
      { upTo: 8333, rate: 0.08 },
      { upTo: Infinity, rate: 0.13 },
    ],
    note: "Malaysian progressive tax. Foreigners taxed at flat 28% if non-resident (staying < 182 days).",
  },
  Thailand: {
    brackets: [
      { upTo: 1389, rate: 0 },
      { upTo: 4167, rate: 0.05 },
      { upTo: 8333, rate: 0.10 },
      { upTo: 16667, rate: 0.15 },
      { upTo: Infinity, rate: 0.20 },
    ],
    note: "Thai progressive tax. Foreign-sourced income not remitted to Thailand may be exempt.",
  },
};

const calcTax = (grossUSD, country) => {
  const brackets = TAX_BRACKETS[country]?.brackets;
  if (!brackets) return { tax: 0, rate: 0, net: grossUSD };
  let tax = 0, prev = 0;
  for (const b of brackets) {
    if (grossUSD <= prev) break;
    const taxable = Math.min(grossUSD, b.upTo) - prev;
    tax += taxable * b.rate;
    prev = b.upTo;
  }
  const rate = grossUSD > 0 ? (tax / grossUSD) * 100 : 0;
  return { tax: Math.round(tax), rate: Math.round(rate), net: Math.round(grossUSD - tax) };
};

// ── DATA ──────────────────────────────────────────────────────────────────────

const COUNTRIES = {
  Indonesia: {
    flag: "🇮🇩", capital: "Jakarta", currency: "IDR", language: "Bahasa Indonesia",
    economicScore: 62, foreignerFriendliness: 48, permitDifficultyScore: 75,
    workPermitDifficulty: "High",
    costOfLiving: { budget: 700, comfortable: 1100, luxury: 2000 },
    overview: "Indonesia enforces strict RPTKA regulations requiring company sponsorship. Foreigners cannot hold roles locals can fill. Government tightened restrictions post-2022.",
    recentPolicy: "Companies must justify foreign hires and train local replacements. Work permits (KITAS) are tied to the sponsoring employer and expire with contract.",
    remoteWork: {
      rating: "Difficult",
      ratingScore: 30,
      visaOption: "No dedicated remote work visa. Standard tourist visa (B211A) allows 60 days, extendable to 180 days but does not permit working for foreign clients legally.",
      bestFor: "Short-term stays only. Bali's digital nomad scene is large but legally grey.",
      restrictions: "Working remotely for foreign companies without a work permit technically requires a KITAS. Enforcement is limited but risk exists.",
      internetSpeed: "Average 25 Mbps in Jakarta, 15 Mbps in Bali",
      coworkingCost: "$100–250/month in Jakarta or Bali",
    },
    permitSteps: [
      { step: "Job offer from Indonesian company", docs: "Contract, company license", time: "Varies", cost: "—" },
      { step: "RPTKA approval (Foreign Worker Plan)", docs: "RPTKA form, job description, company docs", time: "2–4 weeks", cost: "$200–500" },
      { step: "Apply for work visa (Visa TA/B)", docs: "Passport, RPTKA approval, photos", time: "1–2 weeks", cost: "$50–100" },
      { step: "Obtain KITAS (Temporary Stay Permit)", docs: "Visa, sponsor letter, health certificate", time: "1–2 weeks", cost: "$100–200" },
      { step: "Register with local immigration office", docs: "KITAS, passport", time: "3–5 days", cost: "$20–50" },
    ],
    sectors: {
      "Education & Teaching": { demand: "High", demandScore: 78, avgSalaryUSD: { entry: 1200, mid: 1800, senior: 2800 }, foreignAccess: "Moderate", notes: "International schools actively hire. English teaching roles widely available. University positions harder to access for foreigners." },
      "Hospitality & Tourism": { demand: "Moderate", demandScore: 60, avgSalaryUSD: { entry: 900, mid: 1500, senior: 2500 }, foreignAccess: "Moderate", notes: "Bali and Jakarta luxury hotels hire foreign managers. Competitive but accessible for experienced hospitality professionals." },
      "Finance & Banking": { demand: "Low", demandScore: 35, avgSalaryUSD: { entry: 1500, mid: 2500, senior: 4000 }, foreignAccess: "Difficult", notes: "Finance roles are heavily restricted. Multinationals occasionally hire foreigners for senior positions only." },
      "Business & Management": { demand: "Moderate", demandScore: 55, avgSalaryUSD: { entry: 1800, mid: 3000, senior: 5000 }, foreignAccess: "Moderate", notes: "Regional management roles in multinationals are accessible. Mid-level roles strongly favour locals." },
    },
    jobLinks: { LinkedIn: "https://www.linkedin.com/jobs/search/?location=Indonesia", JobStreet: "https://www.jobstreet.co.id", Indeed: "https://id.indeed.com" },
  },
  Singapore: {
    flag: "🇸🇬", capital: "Singapore", currency: "SGD", language: "English / Mandarin / Malay",
    economicScore: 92, foreignerFriendliness: 80, permitDifficultyScore: 45,
    workPermitDifficulty: "Moderate",
    costOfLiving: { budget: 2000, comfortable: 3200, luxury: 5500 },
    overview: "Singapore is ASEAN's most foreigner-friendly economy with a transparent EP/S-Pass system. High demand for skilled professionals, though the Fair Consideration Framework mandates local-first advertising.",
    recentPolicy: "EP salary threshold raised to SGD 5,000/month (SGD 5,500 for financial services) in 2023. Companies must post roles on MyCareersFuture for 28 days before hiring foreigners.",
    remoteWork: {
      rating: "Easy",
      ratingScore: 85,
      visaOption: "Tech.Pass — for established tech professionals. Allows freelancing and remote work for multiple companies. Also Entrepass for entrepreneurs.",
      bestFor: "High-earning tech and finance professionals. World-class infrastructure and connectivity.",
      restrictions: "Standard EP does not allow working for multiple employers. Tech.Pass is the cleanest remote/freelance option but has income requirements (SGD 22,500/month).",
      internetSpeed: "Average 200+ Mbps. One of the world's fastest internet connections.",
      coworkingCost: "$300–600/month in central Singapore",
    },
    permitSteps: [
      { step: "Receive Employment Pass (EP) eligible job offer", docs: "Job offer letter, educational certificates", time: "Varies", cost: "—" },
      { step: "Employer submits EP application via EP Online", docs: "Passport, qualifications, employment contract", time: "3 weeks", cost: "SGD 105" },
      { step: "Receive In-Principle Approval (IPA)", docs: "IPA letter", time: "1–2 weeks", cost: "—" },
      { step: "Enter Singapore and collect EP card", docs: "IPA, passport, photos", time: "1 week", cost: "SGD 225" },
      { step: "Register fingerprints at MOM", docs: "EP card, passport", time: "1 day", cost: "—" },
    ],
    sectors: {
      "Education & Teaching": { demand: "High", demandScore: 82, avgSalaryUSD: { entry: 2500, mid: 3500, senior: 5500 }, foreignAccess: "Easy", notes: "International schools, MOE, and universities actively recruit globally. Strong demand for specialist subject teachers." },
      "Hospitality & Tourism": { demand: "High", demandScore: 85, avgSalaryUSD: { entry: 1800, mid: 2800, senior: 4500 }, foreignAccess: "Easy", notes: "MBS, RWS, and major hotel chains hire internationally. Tourism recovering strongly — high demand for experienced managers." },
      "Finance & Banking": { demand: "Very High", demandScore: 95, avgSalaryUSD: { entry: 4000, mid: 6500, senior: 12000 }, foreignAccess: "Easy", notes: "Asia's financial hub. Banks, fintechs, and asset managers actively seek global talent. EP readily granted for qualified candidates." },
      "Business & Management": { demand: "Very High", demandScore: 90, avgSalaryUSD: { entry: 3500, mid: 5500, senior: 9000 }, foreignAccess: "Easy", notes: "Regional HQs of major multinationals are Singapore-based. Strong demand for regional managers, strategists, and consultants." },
    },
    jobLinks: { LinkedIn: "https://www.linkedin.com/jobs/search/?location=Singapore", JobStreet: "https://www.jobstreet.com.sg", Indeed: "https://sg.indeed.com" },
  },
  Malaysia: {
    flag: "🇲🇾", capital: "Kuala Lumpur", currency: "MYR", language: "Bahasa Malaysia / English",
    economicScore: 72, foreignerFriendliness: 65, permitDifficultyScore: 55,
    workPermitDifficulty: "Moderate",
    costOfLiving: { budget: 600, comfortable: 900, luxury: 1800 },
    overview: "Malaysia offers accessible pathways for skilled foreigners, especially in MSC-status companies and financial services. The EP system is straightforward for professionals earning above MYR 5,000/month.",
    recentPolicy: "DE Rantau digital nomad visa launched 2022. Malaysia Tech Entrepreneur Programme expanded. MSC-status companies enjoy streamlined hiring processes for foreign talent.",
    remoteWork: {
      rating: "Easy",
      ratingScore: 80,
      visaOption: "DE Rantau Digital Nomad Visa — launched 2022, valid 12 months (renewable). Requires proof of employment/income from outside Malaysia. Min income $24,000/year.",
      bestFor: "Digital nomads and remote workers. Low cost of living, English widely spoken, strong expat community in KL.",
      restrictions: "DE Rantau holders cannot work for Malaysian companies or clients. Must maintain foreign income source.",
      internetSpeed: "Average 50–100 Mbps in KL. Good connectivity in major cities.",
      coworkingCost: "$80–180/month in Kuala Lumpur",
    },
    permitSteps: [
      { step: "Secure job offer from Malaysian employer", docs: "Job offer letter", time: "Varies", cost: "—" },
      { step: "Employer obtains expatriate post approval from MDEC/TalentCorp", docs: "Company registration, job justification", time: "2–4 weeks", cost: "MYR 500–1,500" },
      { step: "Apply for Employment Pass at Immigration Dept", docs: "Passport, qualifications, medical report", time: "2–3 weeks", cost: "MYR 500" },
      { step: "Collect EP and register with LHDN (tax)", docs: "EP approval, passport", time: "1 week", cost: "—" },
      { step: "Apply for dependent passes if needed", docs: "Marriage/birth certificates", time: "2–3 weeks", cost: "MYR 360" },
    ],
    sectors: {
      "Education & Teaching": { demand: "High", demandScore: 75, avgSalaryUSD: { entry: 1000, mid: 1600, senior: 2800 }, foreignAccess: "Moderate", notes: "International schools in KL and Penang actively hire. Private universities recruit foreign faculty. English teaching widely available." },
      "Hospitality & Tourism": { demand: "Moderate", demandScore: 65, avgSalaryUSD: { entry: 800, mid: 1300, senior: 2200 }, foreignAccess: "Moderate", notes: "Luxury hotels in KL, Penang, and Langkawi hire foreign managers. Growing tourism sector creates steady opportunities." },
      "Finance & Banking": { demand: "High", demandScore: 78, avgSalaryUSD: { entry: 2000, mid: 3500, senior: 6000 }, foreignAccess: "Moderate", notes: "Labuan IBFC offshore financial center and KL fintech scene offer strong opportunities. Islamic finance is a globally competitive niche." },
      "Business & Management": { demand: "Moderate", demandScore: 68, avgSalaryUSD: { entry: 1500, mid: 2800, senior: 5000 }, foreignAccess: "Moderate", notes: "Shared service centers of multinationals create management openings. ASEAN regional roles are frequently based in KL." },
    },
    jobLinks: { LinkedIn: "https://www.linkedin.com/jobs/search/?location=Malaysia", JobStreet: "https://www.jobstreet.com.my", Indeed: "https://malaysia.indeed.com" },
  },
  Thailand: {
    flag: "🇹🇭", capital: "Bangkok", currency: "THB", language: "Thai",
    economicScore: 68, foreignerFriendliness: 60, permitDifficultyScore: 62,
    workPermitDifficulty: "Moderate-High",
    costOfLiving: { budget: 600, comfortable: 1000, luxury: 2200 },
    overview: "Thailand requires Non-Immigrant B visa + work permit via employer sponsorship. Must prove no qualified Thai can fill the role. LTR visa (2022) now offers 10-year residency for high earners.",
    recentPolicy: "LTR (Long Term Resident) visa introduced 2022 allows 10-year stay for high-income earners and skilled professionals. BOI-promoted companies have significantly streamlined work permit processes.",
    remoteWork: {
      rating: "Moderate",
      ratingScore: 65,
      visaOption: "LTR Visa (Long Term Resident) — 10-year visa for high earners ($80K+/year income). Also SMART Visa for tech professionals. Standard tourist visa used by most nomads (90 days, border runs needed).",
      bestFor: "Chiang Mai and Phuket are ASEAN's top digital nomad hubs. Very affordable, large English-speaking expat community.",
      restrictions: "Working for Thai companies without a work permit is illegal. LTR requires high income proof. Most nomads use tourist visa with periodic exits.",
      internetSpeed: "Average 50–80 Mbps in Bangkok and Chiang Mai. Good in major cities.",
      coworkingCost: "$60–150/month in Chiang Mai, $100–200/month in Bangkok",
    },
    permitSteps: [
      { step: "Obtain Non-Immigrant B visa from Thai embassy", docs: "Passport, job offer, company docs", time: "1–2 weeks", cost: "$50–80" },
      { step: "Enter Thailand and apply for work permit at Department of Employment", docs: "Visa, passport, 3 photos, health certificate", time: "1 week", cost: "THB 750–3,000" },
      { step: "Work permit issued", docs: "All prior documents", time: "1–3 days", cost: "—" },
      { step: "Extend Non-Immigrant B visa annually", docs: "Work permit, tax clearance", time: "1 week", cost: "THB 1,900" },
      { step: "Register with Revenue Department for tax ID", docs: "Work permit, passport", time: "1–2 days", cost: "—" },
    ],
    sectors: {
      "Education & Teaching": { demand: "Very High", demandScore: 90, avgSalaryUSD: { entry: 1000, mid: 1500, senior: 2500 }, foreignAccess: "Easy", notes: "Thailand has one of ASEAN's highest demands for English teachers. International schools, language centers, and government schools all hire foreigners. TEFL/TESOL strongly preferred." },
      "Hospitality & Tourism": { demand: "Very High", demandScore: 88, avgSalaryUSD: { entry: 1200, mid: 1800, senior: 3500 }, foreignAccess: "Easy", notes: "38M+ annual visitors pre-COVID. Phuket, Samui, and Chiang Mai luxury resorts actively recruit foreign hospitality professionals at all senior levels." },
      "Finance & Banking": { demand: "Moderate", demandScore: 55, avgSalaryUSD: { entry: 1800, mid: 3000, senior: 5500 }, foreignAccess: "Difficult", notes: "Finance roles are quite restricted. Multinational banks and regional offices are the best entry points. Thai language skills significantly improve prospects." },
      "Business & Management": { demand: "Moderate", demandScore: 60, avgSalaryUSD: { entry: 1500, mid: 2500, senior: 4500 }, foreignAccess: "Moderate", notes: "Eastern Economic Corridor creates new opportunities. Regional management in multinationals is accessible for experienced professionals." },
    },
    jobLinks: { LinkedIn: "https://www.linkedin.com/jobs/search/?location=Thailand", JobStreet: "https://th.jobsdb.com", Indeed: "https://th.indeed.com" },
  },
};

const SECTORS = ["Education & Teaching", "Hospitality & Tourism", "Finance & Banking", "Business & Management"];
const SECTOR_ICONS = { "Education & Teaching": "📚", "Hospitality & Tourism": "🏨", "Finance & Banking": "🏦", "Business & Management": "💼" };
const EXPERIENCE_LEVELS = ["entry", "mid", "senior"];
const EXPERIENCE_LABELS = { entry: "Entry Level (0–2 yrs)", mid: "Mid Level (3–6 yrs)", senior: "Senior Level (7+ yrs)" };

// ── HELPERS ───────────────────────────────────────────────────────────────────

const scoreColor = (score) => score >= 75 ? "#00e5a0" : score >= 50 ? "#f5c842" : "#ff6b6b";
const accessColor = (a) => a === "Easy" ? "#00e5a0" : a === "Moderate" ? "#f5c842" : "#ff6b6b";

const fmt = (usd, currency, rates) => {
  const meta = CURRENCY_META[currency];
  const rate = rates[currency] || FALLBACK_RATES[currency] || 1;
  const symbol = meta.symbol;
  const val = Math.round(usd * rate);
  if (rate >= 10000) {
    const thousands = val / 1000;
    const formatted = thousands >= 1000 ? Math.round(thousands).toLocaleString() : Math.round(thousands).toString();
    return `${symbol}${formatted}K`;
  }
  return `${symbol}${val.toLocaleString()}`;
};

const ScoreBar = ({ score, color }) => (
  <div style={{ background: "rgba(255,255,255,0.07)", borderRadius: 6, height: 7, overflow: "hidden" }}>
    <div style={{ width: `${score}%`, height: "100%", background: color || scoreColor(score), borderRadius: 6, transition: "width 0.8s ease" }} />
  </div>
);

const Badge = ({ label, color }) => (
  <span style={{ display: "inline-block", padding: "3px 12px", borderRadius: 20, fontSize: 12, fontWeight: 700, background: `${color}22`, color, border: `1px solid ${color}44` }}>{label}</span>
);

// ── STYLES ────────────────────────────────────────────────────────────────────

const S = {
  app: { minHeight: "100vh", background: "#080c18", color: "#dde1ee", fontFamily: "'DM Sans', 'Segoe UI', sans-serif", backgroundImage: "radial-gradient(ellipse 60% 40% at 15% 15%, rgba(0,200,130,0.06) 0%, transparent 70%), radial-gradient(ellipse 50% 50% at 85% 85%, rgba(60,100,255,0.06) 0%, transparent 70%)" },
  header: { borderBottom: "1px solid rgba(255,255,255,0.07)", padding: "14px 24px", display: "flex", alignItems: "center", justifyContent: "space-between", background: "rgba(8,12,24,0.97)", backdropFilter: "blur(24px)", position: "sticky", top: 0, zIndex: 100, flexWrap: "wrap", gap: 10 },
  logo: { fontSize: 20, fontWeight: 900, letterSpacing: "-0.5px", color: "#fff" },
  nav: { display: "flex", gap: 6, flexWrap: "wrap", alignItems: "center" },
  navBtn: (active) => ({ background: active ? "rgba(0,229,160,0.12)" : "transparent", border: `1px solid ${active ? "rgba(0,229,160,0.35)" : "rgba(255,255,255,0.08)"}`, color: active ? "#00e5a0" : "rgba(255,255,255,0.5)", padding: "7px 14px", borderRadius: 10, cursor: "pointer", fontSize: 12, fontWeight: 600, transition: "all 0.2s" }),
  currencySelect: { background: "rgba(0,229,160,0.08)", border: "1px solid rgba(0,229,160,0.25)", color: "#00e5a0", padding: "7px 12px", borderRadius: 10, fontSize: 12, fontWeight: 700, cursor: "pointer", outline: "none", fontFamily: "inherit" },
  hero: { padding: "60px 24px 40px", maxWidth: 860, margin: "0 auto", textAlign: "center" },
  heroTitle: { fontSize: "clamp(32px, 6vw, 50px)", fontWeight: 900, lineHeight: 1.08, marginBottom: 16, letterSpacing: "-2px", background: "linear-gradient(135deg,#fff 0%,#00e5a0 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" },
  heroSub: { fontSize: 16, color: "rgba(255,255,255,0.45)", maxWidth: 560, margin: "0 auto 40px", lineHeight: 1.75 },
  statsBanner: { display: "flex", justifyContent: "center", gap: 28, flexWrap: "wrap", padding: "20px 24px", borderTop: "1px solid rgba(255,255,255,0.05)", borderBottom: "1px solid rgba(255,255,255,0.05)", background: "rgba(0,229,160,0.03)" },
  statItem: { textAlign: "center" },
  statNum: { fontSize: 26, fontWeight: 900, color: "#00e5a0", letterSpacing: "-1px" },
  statLabel: { fontSize: 11, color: "rgba(255,255,255,0.35)", textTransform: "uppercase", letterSpacing: 1.5, marginTop: 2 },
  grid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px,1fr))", gap: 14, maxWidth: 880, margin: "0 auto", padding: "40px 24px 60px" },
  card: (hov) => ({ background: hov ? "rgba(0,229,160,0.07)" : "rgba(255,255,255,0.03)", border: `1px solid ${hov ? "rgba(0,229,160,0.28)" : "rgba(255,255,255,0.07)"}`, borderRadius: 16, padding: 22, cursor: "pointer", transition: "all 0.2s", transform: hov ? "translateY(-4px)" : "none" }),
  section: { maxWidth: 980, margin: "0 auto", padding: "30px 24px 60px" },
  backBtn: { background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.09)", color: "rgba(255,255,255,0.6)", padding: "9px 18px", borderRadius: 10, cursor: "pointer", fontSize: 13, marginBottom: 24, display: "inline-flex", alignItems: "center", gap: 6 },
  infoGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))", gap: 12, marginBottom: 28 },
  infoCard: { background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 14, padding: 20 },
  label: { fontSize: 11, color: "rgba(255,255,255,0.3)", textTransform: "uppercase", letterSpacing: 1.5, marginBottom: 8 },
  overviewBox: { background: "rgba(0,229,160,0.04)", border: "1px solid rgba(0,229,160,0.13)", borderRadius: 14, padding: 20, marginBottom: 24 },
  policyBox: { background: "rgba(80,120,255,0.04)", border: "1px solid rgba(80,120,255,0.13)", borderRadius: 14, padding: 18, marginBottom: 28 },
  sectorGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))", gap: 12, marginBottom: 28 },
  sectorCard: (hov) => ({ background: hov ? "rgba(0,229,160,0.07)" : "rgba(255,255,255,0.03)", border: `1px solid ${hov ? "rgba(0,229,160,0.25)" : "rgba(255,255,255,0.06)"}`, borderRadius: 14, padding: 18, cursor: "pointer", transition: "all 0.2s", transform: hov ? "translateY(-3px)" : "none" }),
  notesBox: { background: "rgba(255,255,255,0.02)", borderLeft: "3px solid #00e5a0", padding: "14px 18px", borderRadius: "0 10px 10px 0", fontSize: 14, lineHeight: 1.7, color: "rgba(255,255,255,0.6)", marginBottom: 22 },
  jobLinkRow: { display: "flex", gap: 10, flexWrap: "wrap" },
  jobLink: { background: "rgba(0,229,160,0.1)", border: "1px solid rgba(0,229,160,0.25)", color: "#00e5a0", padding: "9px 18px", borderRadius: 10, textDecoration: "none", fontSize: 13, fontWeight: 700 },
  tabRow: { display: "flex", gap: 8, marginBottom: 24, flexWrap: "wrap" },
  tab: (active) => ({ background: active ? "rgba(0,229,160,0.12)" : "rgba(255,255,255,0.04)", border: `1px solid ${active ? "rgba(0,229,160,0.35)" : "rgba(255,255,255,0.08)"}`, color: active ? "#00e5a0" : "rgba(255,255,255,0.5)", padding: "8px 14px", borderRadius: 10, cursor: "pointer", fontSize: 13, fontWeight: 600 }),
  input: { background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", color: "#fff", padding: "12px 16px", borderRadius: 12, fontSize: 14, width: "100%", outline: "none", fontFamily: "inherit", boxSizing: "border-box" },
  select: { background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", color: "#fff", padding: "12px 16px", borderRadius: 12, fontSize: 14, width: "100%", outline: "none", fontFamily: "inherit", cursor: "pointer", boxSizing: "border-box" },
  row: { display: "flex", gap: 14, flexWrap: "wrap", marginBottom: 18 },
  col: { flex: 1, minWidth: 160 },
  sectionTitle: { fontSize: 20, fontWeight: 800, marginBottom: 18, letterSpacing: "-0.5px" },
  divider: { borderTop: "1px solid rgba(255,255,255,0.06)", margin: "32px 0" },
  footer: { borderTop: "1px solid rgba(255,255,255,0.05)", padding: "20px 24px", textAlign: "center", fontSize: 12, color: "rgba(255,255,255,0.18)" },
  remoteBox: { background: "rgba(60,100,255,0.04)", border: "1px solid rgba(60,100,255,0.15)", borderRadius: 14, padding: 22, marginBottom: 28 },
  taxBox: { background: "rgba(245,200,66,0.04)", border: "1px solid rgba(245,200,66,0.15)", borderRadius: 14, padding: 20, marginTop: 16 },
};

// ── COL TIERS DISPLAY ─────────────────────────────────────────────────────────

function ColTiers({ col, currency, rates }) {
  return (
    <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 8 }}>
      {[["Budget", col.budget, "#00e5a0"], ["Comfortable", col.comfortable, "#f5c842"], ["Luxury", col.luxury, "#ff6b6b"]].map(([label, val, color]) => (
        <div key={label} style={{ flex: 1, minWidth: 80, background: `${color}10`, border: `1px solid ${color}25`, borderRadius: 10, padding: "8px 12px", textAlign: "center" }}>
          <div style={{ fontSize: 10, color: "rgba(255,255,255,0.35)", textTransform: "uppercase", letterSpacing: 1, marginBottom: 4 }}>{label}</div>
          <div style={{ fontSize: 14, fontWeight: 800, color }}>{fmt(val, currency, rates)}/mo</div>
        </div>
      ))}
    </div>
  );
}

// ── TAX ESTIMATOR ─────────────────────────────────────────────────────────────

function TaxEstimator({ grossUSD, countryName, currency, rates }) {
  const { tax, rate, net } = calcTax(grossUSD, countryName);
  const note = TAX_BRACKETS[countryName]?.note;
  return (
    <div style={S.taxBox}>
      <div style={{ fontSize: 11, color: "#f5c842", textTransform: "uppercase", letterSpacing: 1.5, marginBottom: 14 }}>🧾 Estimated Tax Breakdown</div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(140px,1fr))", gap: 12, marginBottom: 14 }}>
        <div style={S.infoCard}>
          <div style={S.label}>Gross Salary</div>
          <div style={{ fontSize: 18, fontWeight: 800 }}>{fmt(grossUSD, currency, rates)}/mo</div>
        </div>
        <div style={S.infoCard}>
          <div style={S.label}>Est. Income Tax (~{rate}%)</div>
          <div style={{ fontSize: 18, fontWeight: 800, color: "#ff6b6b" }}>-{fmt(tax, currency, rates)}/mo</div>
        </div>
        <div style={{ ...S.infoCard, background: "rgba(0,229,160,0.05)", border: "1px solid rgba(0,229,160,0.15)" }}>
          <div style={S.label}>Est. Take-Home Pay</div>
          <div style={{ fontSize: 18, fontWeight: 800, color: "#00e5a0" }}>{fmt(net, currency, rates)}/mo</div>
        </div>
      </div>
      <div style={{ fontSize: 12, color: "rgba(255,255,255,0.35)", lineHeight: 1.65, marginBottom: 6 }}>{note}</div>
      <div style={{ fontSize: 11, color: "rgba(255,255,255,0.25)", fontStyle: "italic" }}>⚠️ Estimates only. Not financial or legal advice. Consult a tax professional for accurate figures.</div>
    </div>
  );
}

// ── REMOTE WORK SECTION ───────────────────────────────────────────────────────

function RemoteWorkSection({ countryName }) {
  const rw = COUNTRIES[countryName].remoteWork;
  const ratingColor = rw.rating === "Easy" ? "#00e5a0" : rw.rating === "Moderate" ? "#f5c842" : "#ff6b6b";
  return (
    <div style={S.remoteBox}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18, flexWrap: "wrap", gap: 10 }}>
        <div style={{ fontSize: 16, fontWeight: 800 }}>💻 Remote Work Friendliness</div>
        <Badge label={rw.rating} color={ratingColor} />
      </div>
      <ScoreBar score={rw.ratingScore} color={ratingColor} />
      <div style={{ marginTop: 18, display: "grid", gap: 12 }}>
        <div style={{ background: "rgba(255,255,255,0.02)", borderRadius: 10, padding: "12px 16px" }}>
          <div style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", textTransform: "uppercase", letterSpacing: 1.3, marginBottom: 6 }}>Visa Option</div>
          <div style={{ fontSize: 13, color: "rgba(255,255,255,0.7)", lineHeight: 1.65 }}>{rw.visaOption}</div>
        </div>
        <div style={{ background: "rgba(255,255,255,0.02)", borderRadius: 10, padding: "12px 16px" }}>
          <div style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", textTransform: "uppercase", letterSpacing: 1.3, marginBottom: 6 }}>Best For</div>
          <div style={{ fontSize: 13, color: "rgba(255,255,255,0.7)", lineHeight: 1.65 }}>{rw.bestFor}</div>
        </div>
        <div style={{ background: "rgba(255,107,107,0.04)", border: "1px solid rgba(255,107,107,0.12)", borderRadius: 10, padding: "12px 16px" }}>
          <div style={{ fontSize: 11, color: "rgba(255,107,107,0.7)", textTransform: "uppercase", letterSpacing: 1.3, marginBottom: 6 }}>Restrictions</div>
          <div style={{ fontSize: 13, color: "rgba(255,255,255,0.6)", lineHeight: 1.65 }}>{rw.restrictions}</div>
        </div>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <div style={{ flex: 1, minWidth: 140, background: "rgba(255,255,255,0.02)", borderRadius: 10, padding: "12px 16px" }}>
            <div style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", textTransform: "uppercase", letterSpacing: 1.3, marginBottom: 4 }}>📶 Internet Speed</div>
            <div style={{ fontSize: 13, color: "rgba(255,255,255,0.7)" }}>{rw.internetSpeed}</div>
          </div>
          <div style={{ flex: 1, minWidth: 140, background: "rgba(255,255,255,0.02)", borderRadius: 10, padding: "12px 16px" }}>
            <div style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", textTransform: "uppercase", letterSpacing: 1.3, marginBottom: 4 }}>🏢 Coworking Cost</div>
            <div style={{ fontSize: 13, color: "rgba(255,255,255,0.7)" }}>{rw.coworkingCost}</div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── SALARY CALCULATOR ─────────────────────────────────────────────────────────

function SalaryCalculator({ currency, rates }) {
  const [salary, setSalary] = useState("");
  const [country, setCountry] = useState("Singapore");
  const [result, setResult] = useState(null);

  const calculate = () => {
    const s = parseFloat(salary);
    if (!s || s <= 0) return;
    const col = COUNTRIES[country].costOfLiving.comfortable;
    const buffer = s - col;
    const ratio = ((s / col) * 100).toFixed(0);
    setResult({ col, buffer, ratio, comfortable: buffer > 500, grossUSD: s });
  };

  return (
    <div>
      <div style={S.sectionTitle}>💰 Salary Purchasing Power Calculator</div>
      <p style={{ fontSize: 14, color: "rgba(255,255,255,0.45)", marginBottom: 20, lineHeight: 1.6 }}>Enter a salary offer (in USD) to see real purchasing power after cost of living.</p>
      <div style={S.row}>
        <div style={S.col}>
          <div style={S.label}>Monthly Salary Offer (USD)</div>
          <input style={S.input} type="number" placeholder="e.g. 3000" value={salary} onChange={e => { setSalary(e.target.value); setResult(null); }} />
        </div>
        <div style={S.col}>
          <div style={S.label}>Target Country</div>
          <select style={S.select} value={country} onChange={e => { setCountry(e.target.value); setResult(null); }}>
            {Object.keys(COUNTRIES).map(c => <option key={c} value={c}>{COUNTRIES[c].flag} {c}</option>)}
          </select>
        </div>
      </div>
      <button onClick={calculate} style={{ background: "#00e5a0", color: "#080c18", border: "none", padding: "12px 28px", borderRadius: 12, fontSize: 14, fontWeight: 800, cursor: "pointer", marginBottom: 24 }}>Calculate →</button>

      {result && (
        <>
          <div style={{ marginBottom: 16 }}>
            <div style={S.label}>Cost of Living Tiers — {country}</div>
            <ColTiers col={COUNTRIES[country].costOfLiving} currency={currency} rates={rates} />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))", gap: 12, marginBottom: 16 }}>
            <div style={{ ...S.infoCard, background: "rgba(0,229,160,0.05)", border: "1px solid rgba(0,229,160,0.15)" }}>
              <div style={S.label}>Your Salary</div>
              <div style={{ fontSize: 24, fontWeight: 900, color: "#00e5a0" }}>{fmt(result.grossUSD, currency, rates)}</div>
            </div>
            <div style={S.infoCard}>
              <div style={S.label}>Comfortable COL</div>
              <div style={{ fontSize: 24, fontWeight: 900, color: "#f5c842" }}>{fmt(result.col, currency, rates)}</div>
            </div>
            <div style={{ ...S.infoCard, background: result.comfortable ? "rgba(0,229,160,0.05)" : "rgba(255,107,107,0.05)", border: `1px solid ${result.comfortable ? "rgba(0,229,160,0.2)" : "rgba(255,107,107,0.2)"}` }}>
              <div style={S.label}>Net Buffer</div>
              <div style={{ fontSize: 24, fontWeight: 900, color: result.comfortable ? "#00e5a0" : "#ff6b6b" }}>{fmt(result.buffer, currency, rates)}</div>
              <div style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", marginTop: 4 }}>{result.comfortable ? "✓ Comfortable" : "⚠ Tight"}</div>
            </div>
          </div>
          <TaxEstimator grossUSD={result.grossUSD} countryName={country} currency={currency} rates={rates} />
        </>
      )}
    </div>
  );
}

// ── SUITABILITY SCORE ─────────────────────────────────────────────────────────

function SuitabilityScore({ currency, rates }) {
  const [sector, setSector] = useState("");
  const [experience, setExperience] = useState("");
  const [country, setCountry] = useState("");
  const [result, setResult] = useState(null);

  const calculate = () => {
    if (!sector || !experience || !country) return;
    const c = COUNTRIES[country];
    const s = c.sectors[sector];
    const expMultiplier = { entry: 0.75, mid: 1.0, senior: 1.2 }[experience];
    const baseScore = (s.demandScore * 0.4 + c.foreignerFriendliness * 0.35 + (100 - c.permitDifficultyScore) * 0.25) * expMultiplier;
    const score = Math.min(100, Math.round(baseScore));
    const salary = s.avgSalaryUSD[experience];
    const buffer = salary - c.costOfLiving.comfortable;
    setResult({ score, salary, buffer, access: s.foreignAccess, demand: s.demand, notes: s.notes });
  };

  const getVerdict = (score) => {
    if (score >= 75) return { label: "Strong Match", color: "#00e5a0", desc: "Your profile aligns well with this market. Good prospects for foreign workers." };
    if (score >= 50) return { label: "Moderate Match", color: "#f5c842", desc: "Possible but competitive. Differentiate yourself with specialized skills or certifications." };
    return { label: "Challenging", color: "#ff6b6b", desc: "This market is tough for foreign workers in this sector. Consider alternative countries or sectors." };
  };

  return (
    <div>
      <div style={S.sectionTitle}>🎯 Foreigner Suitability Score</div>
      <p style={{ fontSize: 14, color: "rgba(255,255,255,0.45)", marginBottom: 20, lineHeight: 1.6 }}>Get a personalized score based on your sector, experience level, and target country.</p>
      <div style={S.row}>
        <div style={S.col}>
          <div style={S.label}>Your Sector</div>
          <select style={S.select} value={sector} onChange={e => { setSector(e.target.value); setResult(null); }}>
            <option value="">Select sector...</option>
            {SECTORS.map(s => <option key={s} value={s}>{SECTOR_ICONS[s]} {s}</option>)}
          </select>
        </div>
        <div style={S.col}>
          <div style={S.label}>Experience Level</div>
          <select style={S.select} value={experience} onChange={e => { setExperience(e.target.value); setResult(null); }}>
            <option value="">Select level...</option>
            {EXPERIENCE_LEVELS.map(l => <option key={l} value={l}>{EXPERIENCE_LABELS[l]}</option>)}
          </select>
        </div>
        <div style={S.col}>
          <div style={S.label}>Target Country</div>
          <select style={S.select} value={country} onChange={e => { setCountry(e.target.value); setResult(null); }}>
            <option value="">Select country...</option>
            {Object.keys(COUNTRIES).map(c => <option key={c} value={c}>{COUNTRIES[c].flag} {c}</option>)}
          </select>
        </div>
      </div>
      <button onClick={calculate} style={{ background: "#00e5a0", color: "#080c18", border: "none", padding: "12px 28px", borderRadius: 12, fontSize: 14, fontWeight: 800, cursor: "pointer", marginBottom: 24 }}>Get My Score →</button>

      {result && (() => {
        const verdict = getVerdict(result.score);
        return (
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 24, background: `${verdict.color}10`, border: `1px solid ${verdict.color}25`, borderRadius: 16, padding: 22, marginBottom: 18, flexWrap: "wrap" }}>
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: 48, fontWeight: 900, color: verdict.color, lineHeight: 1 }}>{result.score}</div>
                <div style={{ fontSize: 12, color: "rgba(255,255,255,0.35)", marginTop: 4 }}>/ 100</div>
              </div>
              <div>
                <div style={{ fontSize: 18, fontWeight: 800, color: verdict.color, marginBottom: 6 }}>{verdict.label}</div>
                <div style={{ fontSize: 14, color: "rgba(255,255,255,0.55)", lineHeight: 1.6, maxWidth: 480 }}>{verdict.desc}</div>
              </div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(160px,1fr))", gap: 12, marginBottom: 14 }}>
              <div style={S.infoCard}><div style={S.label}>Avg Salary</div><div style={{ fontSize: 20, fontWeight: 800, color: "#00e5a0" }}>{fmt(result.salary, currency, rates)}/mo</div></div>
              <div style={S.infoCard}><div style={S.label}>Net Buffer (vs Comfortable COL)</div><div style={{ fontSize: 20, fontWeight: 800, color: result.buffer > 0 ? "#00e5a0" : "#ff6b6b" }}>{fmt(result.buffer, currency, rates)}/mo</div></div>
              <div style={S.infoCard}><div style={S.label}>Foreign Access</div><Badge label={result.access} color={accessColor(result.access)} /></div>
              <div style={S.infoCard}><div style={S.label}>Market Demand</div><Badge label={result.demand} color={scoreColor(result.demand === "Very High" ? 90 : result.demand === "High" ? 78 : result.demand === "Moderate" ? 55 : 30)} /></div>
            </div>
            <div style={S.notesBox}>{result.notes}</div>
            {country && <TaxEstimator grossUSD={result.salary} countryName={country} currency={currency} rates={rates} />}
          </div>
        );
      })()}
    </div>
  );
}

// ── COUNTRY COMPARISON ────────────────────────────────────────────────────────

function CountryComparison({ currency, rates }) {
  const [c1, setC1] = useState("Singapore");
  const [c2, setC2] = useState("Malaysia");
  const [sector, setSector] = useState("Finance & Banking");
  const [exp, setExp] = useState("mid");

  const d1 = COUNTRIES[c1], d2 = COUNTRIES[c2];
  const s1 = d1.sectors[sector], s2 = d2.sectors[sector];

  const Row = ({ label, v1, v2, higher, format }) => {
    const win1 = higher ? v1 > v2 : v1 < v2;
    const win2 = higher ? v2 > v1 : v2 < v1;
    return (
      <div style={{ display: "grid", gridTemplateColumns: "1fr auto 1fr", gap: 10, alignItems: "center", padding: "11px 0", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
        <div style={{ textAlign: "right", fontWeight: win1 ? 700 : 400, color: win1 ? "#00e5a0" : "rgba(255,255,255,0.6)", fontSize: 13 }}>{format ? format(v1) : v1}{win1 ? " ✓" : ""}</div>
        <div style={{ fontSize: 10, color: "rgba(255,255,255,0.3)", textTransform: "uppercase", letterSpacing: 1, textAlign: "center", whiteSpace: "nowrap" }}>{label}</div>
        <div style={{ fontWeight: win2 ? 700 : 400, color: win2 ? "#00e5a0" : "rgba(255,255,255,0.6)", fontSize: 13 }}>{win2 ? "✓ " : ""}{format ? format(v2) : v2}</div>
      </div>
    );
  };

  return (
    <div>
      <div style={S.sectionTitle}>⚖️ Country Comparison</div>
      <div style={S.row}>
        <div style={S.col}><div style={S.label}>Country A</div><select style={S.select} value={c1} onChange={e => setC1(e.target.value)}>{Object.keys(COUNTRIES).map(c => <option key={c} value={c}>{COUNTRIES[c].flag} {c}</option>)}</select></div>
        <div style={S.col}><div style={S.label}>Country B</div><select style={S.select} value={c2} onChange={e => setC2(e.target.value)}>{Object.keys(COUNTRIES).map(c => <option key={c} value={c}>{COUNTRIES[c].flag} {c}</option>)}</select></div>
        <div style={S.col}><div style={S.label}>Sector</div><select style={S.select} value={sector} onChange={e => setSector(e.target.value)}>{SECTORS.map(s => <option key={s} value={s}>{s}</option>)}</select></div>
        <div style={S.col}><div style={S.label}>Experience</div><select style={S.select} value={exp} onChange={e => setExp(e.target.value)}>{EXPERIENCE_LEVELS.map(l => <option key={l} value={l}>{EXPERIENCE_LABELS[l]}</option>)}</select></div>
      </div>
      <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 16, padding: 24 }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr auto 1fr", gap: 12, marginBottom: 18 }}>
          <div style={{ textAlign: "right" }}><div style={{ fontSize: 32 }}>{d1.flag}</div><div style={{ fontSize: 16, fontWeight: 800 }}>{c1}</div></div>
          <div style={{ display: "flex", alignItems: "center", color: "rgba(255,255,255,0.2)", fontSize: 18 }}>vs</div>
          <div><div style={{ fontSize: 32 }}>{d2.flag}</div><div style={{ fontSize: 16, fontWeight: 800 }}>{c2}</div></div>
        </div>
        <Row label="Foreigner Friendliness" v1={d1.foreignerFriendliness} v2={d2.foreignerFriendliness} higher format={v => `${v}/100`} />
        <Row label="Economic Score" v1={d1.economicScore} v2={d2.economicScore} higher format={v => `${v}/100`} />
        <Row label="Permit Difficulty" v1={d1.permitDifficultyScore} v2={d2.permitDifficultyScore} format={() => `${d1.workPermitDifficulty} vs ${d2.workPermitDifficulty}`} />
        <Row label="COL (Comfortable)" v1={d1.costOfLiving.comfortable} v2={d2.costOfLiving.comfortable} format={v => `${fmt(v, currency, rates)}/mo`} />
        <Row label={`${sector} Salary (${exp})`} v1={s1.avgSalaryUSD[exp]} v2={s2.avgSalaryUSD[exp]} higher format={v => `${fmt(v, currency, rates)}/mo`} />
        <Row label="Net Buffer" v1={s1.avgSalaryUSD[exp] - d1.costOfLiving.comfortable} v2={s2.avgSalaryUSD[exp] - d2.costOfLiving.comfortable} higher format={v => `${fmt(v, currency, rates)}/mo`} />
        <Row label="Demand Score" v1={s1.demandScore} v2={s2.demandScore} higher format={v => `${v}/100`} />
        <Row label="Remote Work" v1={COUNTRIES[c1].remoteWork.ratingScore} v2={COUNTRIES[c2].remoteWork.ratingScore} higher format={(v) => v === COUNTRIES[c1].remoteWork.ratingScore ? COUNTRIES[c1].remoteWork.rating : COUNTRIES[c2].remoteWork.rating} />
      </div>
    </div>
  );
}

// ── PERMIT GUIDE ──────────────────────────────────────────────────────────────

function PermitGuide({ country }) {
  const c = COUNTRIES[country];
  const [checked, setChecked] = useState({});
  const toggle = (i) => setChecked(p => ({ ...p, [i]: !p[i] }));
  const done = Object.values(checked).filter(Boolean).length;
  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18, flexWrap: "wrap", gap: 10 }}>
        <div style={S.sectionTitle}>📋 Work Permit Checklist — {c.flag} {country}</div>
        <div style={{ fontSize: 13, color: "rgba(255,255,255,0.4)" }}>{done}/{c.permitSteps.length} completed</div>
      </div>
      <div style={{ background: "rgba(0,229,160,0.04)", border: "1px solid rgba(0,229,160,0.1)", borderRadius: 12, padding: "6px 16px", marginBottom: 20 }}>
        <ScoreBar score={(done / c.permitSteps.length) * 100} color="#00e5a0" />
      </div>
      {c.permitSteps.map((step, i) => (
        <div key={i} onClick={() => toggle(i)} style={{ display: "flex", gap: 14, padding: "14px 18px", background: checked[i] ? "rgba(0,229,160,0.04)" : "rgba(255,255,255,0.02)", border: `1px solid ${checked[i] ? "rgba(0,229,160,0.2)" : "rgba(255,255,255,0.06)"}`, borderRadius: 12, marginBottom: 8, cursor: "pointer", transition: "all 0.2s" }}>
          <div style={{ minWidth: 26, height: 26, borderRadius: "50%", background: checked[i] ? "#00e5a0" : "rgba(255,255,255,0.07)", border: `1px solid ${checked[i] ? "#00e5a0" : "rgba(255,255,255,0.12)"}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 800, color: checked[i] ? "#080c18" : "rgba(255,255,255,0.4)", marginTop: 1, flexShrink: 0 }}>
            {checked[i] ? "✓" : i + 1}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 14, fontWeight: 600, color: checked[i] ? "rgba(255,255,255,0.4)" : "#fff", textDecoration: checked[i] ? "line-through" : "none", marginBottom: 5 }}>{step.step}</div>
            <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
              <span style={{ fontSize: 12, color: "rgba(255,255,255,0.35)" }}>📄 {step.docs}</span>
              <span style={{ fontSize: 12, color: "rgba(255,255,255,0.35)" }}>⏱ {step.time}</span>
              <span style={{ fontSize: 12, color: "rgba(255,255,255,0.35)" }}>💵 {step.cost}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// ── METHODOLOGY PAGE ──────────────────────────────────────────────────────────

const METRICS = [
  { icon: "🌏", name: "Foreigner Friendliness Score", score_range: "0–100", description: "A composite index measuring how accessible a country's labor market is to foreign workers.", formula: [{ factor: "World Bank Ease of Doing Business Index", weight: "40%", why: "Countries easier to do business in have more streamlined foreign hiring." }, { factor: "ILO Foreign Labor Participation Rate", weight: "35%", why: "Direct signal of real-world foreigner access." }, { factor: "Work Permit Transparency (official sources)", weight: "25%", why: "Clarity of requirements and predictability of approval." }], sources: [{ name: "World Bank Business Environment", url: "https://www.worldbank.org/en/programs/business-enabling-environment" }, { name: "ILOSTAT", url: "https://ilostat.ilo.org" }, { name: "Singapore MOM", url: "https://www.mom.gov.sg" }, { name: "Indonesia DGCE", url: "https://www.imigrasi.go.id" }, { name: "Malaysia Immigration", url: "https://www.imi.gov.my" }, { name: "Thailand DOE", url: "https://www.doe.go.th" }], caveat: "Scores reflect policy environments as of 2024. Immigration policies change frequently — verify with official sources." },
  { icon: "📈", name: "Economic Health Score", score_range: "0–100", description: "Measures overall economic strength affecting job availability and salary levels.", formula: [{ factor: "GDP Growth Rate (3-year avg)", weight: "40%", why: "Sustained growth signals expanding job markets." }, { factor: "Unemployment Rate (inverted)", weight: "35%", why: "Lower unemployment = better conditions for skilled hires." }, { factor: "FDI Inflow", weight: "25%", why: "High FDI indicates multinational activity — primary employers of foreign professionals." }], sources: [{ name: "World Bank Open Data", url: "https://data.worldbank.org" }, { name: "ASEAN Stats", url: "https://www.aseanstats.org" }, { name: "IMF World Economic Outlook", url: "https://www.imf.org/en/Publications/WEO" }], caveat: "Figures reflect 2022–2024 averages. Economic conditions are dynamic." },
  { icon: "💵", name: "Cost of Living (3 Tiers)", score_range: "USD / month", description: "Monthly living cost estimates across Budget, Comfortable, and Luxury lifestyle tiers for a single professional in the country's capital city.", formula: [{ factor: "Numbeo Cost of Living Index", weight: "50%", why: "Largest crowd-sourced COL database globally." }, { factor: "Expatistan Expat Cost Data", weight: "30%", why: "Focuses on expat spending patterns specifically." }, { factor: "Local CPI Data", weight: "20%", why: "Official baseline from national statistics agencies." }], sources: [{ name: "Numbeo", url: "https://www.numbeo.com/cost-of-living/" }, { name: "Expatistan", url: "https://www.expatistan.com" }, { name: "Indonesia BPS", url: "https://www.bps.go.id" }, { name: "Singapore DOS", url: "https://www.singstat.gov.sg" }, { name: "Malaysia DOSM", url: "https://www.dosm.gov.my" }, { name: "Thailand NESDC", url: "https://www.nesdc.go.th" }], caveat: "Budget = frugal expat lifestyle. Comfortable = mid-range. Luxury = premium housing + dining. Bali and Chiang Mai can be 30–40% cheaper than respective capitals." },
  { icon: "🧾", name: "Tax Estimator", score_range: "Estimate only", description: "Simplified progressive tax calculation showing estimated take-home pay. Uses official tax bracket structures for each country.", formula: [{ factor: "Official tax bracket structures", weight: "100%", why: "Sourced directly from each country's tax authority." }], sources: [{ name: "Indonesia DJP Tax Authority", url: "https://www.pajak.go.id" }, { name: "Singapore IRAS", url: "https://www.iras.gov.sg" }, { name: "Malaysia LHDN", url: "https://www.hasil.gov.my" }, { name: "Thailand Revenue Department", url: "https://www.rd.go.th" }], caveat: "Estimates only. Does not account for deductions, allowances, double taxation treaties, or non-resident rates. Always consult a licensed tax professional." },
  { icon: "💻", name: "Remote Work Friendliness", score_range: "Easy / Moderate / Difficult", description: "Rates how viable each country is for remote workers and digital nomads based on visa availability, legal clarity, infrastructure, and cost.", formula: [{ factor: "Dedicated remote/nomad visa availability", weight: "40%", why: "Legal pathway is the most critical factor." }, { factor: "Internet infrastructure quality", weight: "30%", why: "Reliable fast internet is non-negotiable for remote work." }, { factor: "Cost of coworking and accommodation", weight: "30%", why: "Affordability determines long-term viability." }], sources: [{ name: "Malaysia DE Rantau", url: "https://www.mdec.my/digital-malaysia/de-rantau" }, { name: "Thailand LTR Visa", url: "https://ltr.boi.go.th" }, { name: "Singapore Tech.Pass", url: "https://www.edb.gov.sg/en/how-we-help/incentives-and-schemes/tech-pass.html" }, { name: "Speedtest Global Index", url: "https://www.speedtest.net/global-index" }], caveat: "Remote work legality is nuanced — working for foreign clients on a tourist visa is technically illegal in most ASEAN countries but enforcement varies. Always verify current regulations." },
];

function MethodologyPage() {
  const [expanded, setExpanded] = useState(null);
  return (
    <div style={S.section}>
      <div style={{ marginBottom: 36 }}>
        <div style={{ fontSize: 30, fontWeight: 900, letterSpacing: "-1px", marginBottom: 10 }}>📐 Data & Methodology</div>
        <div style={{ fontSize: 15, color: "rgba(255,255,255,0.45)", lineHeight: 1.75, maxWidth: 680 }}>Every score and figure on OpportuNation is derived from publicly available data. This page explains exactly what each metric means, how it is calculated, and where the data comes from.</div>
      </div>
      <div style={{ background: "rgba(245,200,66,0.06)", border: "1px solid rgba(245,200,66,0.2)", borderRadius: 14, padding: 18, marginBottom: 36, display: "flex", gap: 12, alignItems: "flex-start" }}>
        <div style={{ fontSize: 18 }}>⚠️</div>
        <div style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", lineHeight: 1.7 }}>All scores are research-based approximations for informational purposes only — not legal or financial advice. Immigration policies and market conditions change frequently. Always verify with official sources before making decisions.</div>
      </div>
      {METRICS.map((m, i) => (
        <div key={i} style={{ background: "rgba(255,255,255,0.02)", border: `1px solid ${expanded === i ? "rgba(0,229,160,0.25)" : "rgba(255,255,255,0.07)"}`, borderRadius: 16, marginBottom: 12, overflow: "hidden" }}>
          <div onClick={() => setExpanded(expanded === i ? null : i)} style={{ padding: "20px 24px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 14 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
              <div style={{ fontSize: 26 }}>{m.icon}</div>
              <div>
                <div style={{ fontSize: 15, fontWeight: 800 }}>{m.name}</div>
                <div style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", marginTop: 2 }}>Range: {m.score_range}</div>
              </div>
            </div>
            <div style={{ fontSize: 16, color: "rgba(255,255,255,0.3)", transition: "transform 0.2s", transform: expanded === i ? "rotate(180deg)" : "none" }}>▾</div>
          </div>
          {expanded === i && (
            <div style={{ padding: "0 24px 24px", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
              <p style={{ fontSize: 14, color: "rgba(255,255,255,0.55)", lineHeight: 1.75, marginTop: 18, marginBottom: 20 }}>{m.description}</p>
              <div style={S.label}>How It's Calculated</div>
              <div style={{ marginBottom: 24 }}>
                {m.formula.map((f, fi) => (
                  <div key={fi} style={{ display: "grid", gridTemplateColumns: "1fr 60px 2fr", gap: 12, padding: "10px 14px", background: "rgba(255,255,255,0.02)", borderRadius: 10, marginBottom: 6, alignItems: "start" }}>
                    <div style={{ fontSize: 13, fontWeight: 600 }}>{f.factor}</div>
                    <div style={{ fontSize: 13, fontWeight: 800, color: "#00e5a0", textAlign: "center" }}>{f.weight}</div>
                    <div style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", lineHeight: 1.6 }}>{f.why}</div>
                  </div>
                ))}
              </div>
              <div style={S.label}>Data Sources</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 20 }}>
                {m.sources.map((src, si) => (
                  <a key={si} href={src.url} target="_blank" rel="noopener noreferrer" style={{ fontSize: 12, color: "#00e5a0", background: "rgba(0,229,160,0.06)", padding: "6px 12px", borderRadius: 8, border: "1px solid rgba(0,229,160,0.2)", textDecoration: "none", fontWeight: 600 }}>{src.name} ↗</a>
                ))}
              </div>
              <div style={{ background: "rgba(245,200,66,0.05)", border: "1px solid rgba(245,200,66,0.15)", borderRadius: 10, padding: "12px 16px", fontSize: 13, color: "rgba(255,255,255,0.45)", lineHeight: 1.65 }}>⚠️ {m.caveat}</div>
            </div>
          )}
        </div>
      ))}
      <div style={{ marginTop: 36, padding: "18px 22px", background: "rgba(255,255,255,0.02)", borderRadius: 12, display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 10 }}>
        <div style={{ fontSize: 13, color: "rgba(255,255,255,0.3)" }}>📅 Data last reviewed: <span style={{ color: "rgba(255,255,255,0.5)", fontWeight: 600 }}>Q1 2026</span></div>
        <div style={{ fontSize: 13, color: "rgba(255,255,255,0.3)" }}>Built by <span style={{ color: "rgba(255,255,255,0.5)", fontWeight: 600 }}>Rachit K.</span> · Applied Statistics</div>
      </div>
    </div>
  );
}

// ── MAIN APP ──────────────────────────────────────────────────────────────────

export default function App() {
  const [page, setPage] = useState("home");
  const [selectedCountry, setSelectedCountry] = useState(null);
  const [selectedSector, setSelectedSector] = useState(null);
  const [sectorView, setSectorView] = useState("overview");
  const [toolTab, setToolTab] = useState("calculator");
  const [hovC, setHovC] = useState(null);
  const [hovS, setHovS] = useState(null);
  const [currency, setCurrency] = useState("USD");
  const [rates, setRates] = useState(FALLBACK_RATES);
  const [ratesLive, setRatesLive] = useState(false);
  const [ratesLoading, setRatesLoading] = useState(true);

  useEffect(() => {
    fetch(EXCHANGE_API)
      .then(r => r.json())
      .then(data => {
        if (data.result === "success") {
          const r = data.conversion_rates;
          setRates({ USD: 1, SGD: r.SGD, MYR: r.MYR, IDR: r.IDR, THB: r.THB });
          setRatesLive(true);
        }
      })
      .catch(() => {})
      .finally(() => setRatesLoading(false));
  }, []);

  const country = selectedCountry ? COUNTRIES[selectedCountry] : null;
  const sectorData = country && selectedSector ? country.sectors[selectedSector] : null;

  return (
    <div style={S.app}>
      {/* HEADER */}
      <div style={S.header}>
        <div style={{ cursor: "pointer" }} onClick={() => { setPage("home"); setSelectedCountry(null); setSelectedSector(null); }}>
          <div style={S.logo}>Opportu<span style={{ color: "#00e5a0" }}>Nation</span></div>
          <div style={{ fontSize: 10, color: "rgba(255,255,255,0.25)", letterSpacing: 2, textTransform: "uppercase" }}>ASEAN Foreign Worker Navigator</div>
        </div>
        <div style={S.nav}>
          <button style={S.navBtn(page === "home" || page === "country")} onClick={() => { setPage("home"); setSelectedCountry(null); setSelectedSector(null); }}>🌏 Countries</button>
          <button style={S.navBtn(page === "tools")} onClick={() => setPage("tools")}>🛠 Tools</button>
          <button style={S.navBtn(page === "methodology")} onClick={() => setPage("methodology")}>📐 Methodology</button>
          <select style={S.currencySelect} value={currency} onChange={e => setCurrency(e.target.value)}>
            {Object.keys(CURRENCIES).map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
      </div>

      {/* CURRENCY NOTE */}
      {currency !== "USD" && (
        <div style={{ background: ratesLive ? "rgba(0,229,160,0.04)" : "rgba(245,200,66,0.04)", borderBottom: `1px solid ${ratesLive ? "rgba(0,229,160,0.1)" : "rgba(245,200,66,0.1)"}`, padding: "8px 24px", fontSize: 11, color: ratesLive ? "rgba(0,229,160,0.7)" : "rgba(245,200,66,0.7)", textAlign: "center" }}>
          {ratesLoading ? "⏳ Fetching live rates..." : ratesLive ? `✓ Live rates · 1 USD = ${rates[currency].toLocaleString(undefined, {maximumFractionDigits: 2})} ${currency} · Updated today` : "⚠ Using fallback rates · Live rates unavailable · All salary data sourced in USD"}
        </div>
      )}

      {/* STATS BANNER */}
      <div style={S.statsBanner}>
        {[["4", "Countries"], ["4", "Sectors"], ["3", "COL Tiers"], ["5", "Currencies"]].map(([n, l]) => (
          <div key={l} style={S.statItem}>
            <div style={S.statNum}>{n}</div>
            <div style={S.statLabel}>{l}</div>
          </div>
        ))}
      </div>

      {/* HOME */}
      {page === "home" && !selectedCountry && (
        <>
          <div style={S.hero}>
            <div style={S.heroTitle}>Navigate Your Career<br />Across ASEAN</div>
            <div style={S.heroSub}>Real insights on job markets, salary benchmarks, tax estimates, remote work options, and work permit guides — built for foreign workers making real decisions.</div>
          </div>
          <div style={S.grid}>
            {Object.entries(COUNTRIES).map(([name, data]) => (
              <div key={name} style={S.card(hovC === name)} onMouseEnter={() => setHovC(name)} onMouseLeave={() => setHovC(null)} onClick={() => { setSelectedCountry(name); setPage("country"); }}>
                <div style={{ fontSize: 36, marginBottom: 10 }}>{data.flag}</div>
                <div style={{ fontSize: 16, fontWeight: 800, marginBottom: 2 }}>{name}</div>
                <div style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", marginBottom: 14 }}>{data.capital}</div>
                <div style={S.label}>Foreigner Friendliness</div>
                <ScoreBar score={data.foreignerFriendliness} />
                <div style={{ fontSize: 12, color: scoreColor(data.foreignerFriendliness), fontWeight: 700, marginTop: 5 }}>{data.foreignerFriendliness}/100</div>
                <div style={{ marginTop: 12 }}>
                  <div style={S.label}>Remote Work</div>
                  <Badge label={data.remoteWork.rating} color={accessColor(data.remoteWork.rating)} />
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* COUNTRY PAGE */}
      {page === "country" && selectedCountry && country && !selectedSector && (
        <div style={S.section}>
          <button style={S.backBtn} onClick={() => { setSelectedCountry(null); setPage("home"); }}>← All Countries</button>
          <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 32, flexWrap: "wrap" }}>
            <div style={{ fontSize: 52 }}>{country.flag}</div>
            <div>
              <div style={{ fontSize: 32, fontWeight: 900, letterSpacing: "-1px" }}>{selectedCountry}</div>
              <div style={{ fontSize: 12, color: "rgba(255,255,255,0.35)" }}>{country.currency} · {country.language}</div>
            </div>
          </div>

          <div style={S.infoGrid}>
            {[["Economic Score", country.economicScore, `${country.economicScore}/100`], ["Foreigner Friendliness", country.foreignerFriendliness, `${country.foreignerFriendliness}/100`], ["Permit Difficulty", 100 - country.permitDifficultyScore, country.workPermitDifficulty]].map(([label, score, val]) => (
              <div key={label} style={S.infoCard}>
                <div style={S.label}>{label}</div>
                <div style={{ fontSize: 20, fontWeight: 800, color: scoreColor(score), marginBottom: 8 }}>{val}</div>
                <ScoreBar score={score} color={scoreColor(score)} />
              </div>
            ))}
            <div style={S.infoCard}>
              <div style={S.label}>Cost of Living — {country.capital}</div>
              <ColTiers col={country.costOfLiving} currency={currency} rates={rates} />
            </div>
          </div>

          <div style={S.overviewBox}>
            <div style={{ fontSize: 11, color: "#00e5a0", textTransform: "uppercase", letterSpacing: 1.5, marginBottom: 10 }}>🌏 Overview</div>
            <div style={{ fontSize: 14, lineHeight: 1.75, color: "rgba(255,255,255,0.65)" }}>{country.overview}</div>
          </div>

          <div style={S.policyBox}>
            <div style={{ fontSize: 11, color: "rgba(120,150,255,0.8)", textTransform: "uppercase", letterSpacing: 1.5, marginBottom: 8 }}>📋 Recent Policy</div>
            <div style={{ fontSize: 14, lineHeight: 1.65, color: "rgba(255,255,255,0.55)" }}>{country.recentPolicy}</div>
          </div>

          <RemoteWorkSection countryName={selectedCountry} />

          <div style={{ ...S.sectionTitle, marginBottom: 14 }}>Select a Sector</div>
          <div style={S.sectorGrid}>
            {SECTORS.map(sec => {
              const s = country.sectors[sec];
              return (
                <div key={sec} style={S.sectorCard(hovS === sec)} onMouseEnter={() => setHovS(sec)} onMouseLeave={() => setHovS(null)} onClick={() => { setSelectedSector(sec); setSectorView("overview"); }}>
                  <div style={{ fontSize: 24, marginBottom: 8 }}>{SECTOR_ICONS[sec]}</div>
                  <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 10 }}>{sec}</div>
                  <ScoreBar score={s.demandScore} />
                  <div style={{ fontSize: 12, color: "#00e5a0", fontWeight: 600, marginTop: 6 }}>{fmt(s.avgSalaryUSD.mid, currency, rates)}/mo avg</div>
                </div>
              );
            })}
          </div>

          <div style={S.divider} />
          <PermitGuide country={selectedCountry} />
        </div>
      )}

      {/* SECTOR DETAIL */}
      {page === "country" && selectedCountry && selectedSector && sectorData && (
        <div style={S.section}>
          <button style={S.backBtn} onClick={() => setSelectedSector(null)}>← Back to {selectedCountry}</button>
          <div style={{ marginBottom: 24 }}>
            <div style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", marginBottom: 4 }}>{country.flag} {selectedCountry}</div>
            <div style={{ fontSize: 30, fontWeight: 900, letterSpacing: "-1px" }}>{SECTOR_ICONS[selectedSector]} {selectedSector}</div>
          </div>

          <div style={S.label}>Experience Level</div>
          <div style={S.tabRow}>
            {EXPERIENCE_LEVELS.map(l => (
              <button key={l} style={S.tab(sectorView === l)} onClick={() => setSectorView(l)}>{EXPERIENCE_LABELS[l]}</button>
            ))}
          </div>

          {EXPERIENCE_LEVELS.includes(sectorView) && (() => {
            const salary = sectorData.avgSalaryUSD[sectorView];
            const buffer = salary - country.costOfLiving.comfortable;
            return (
              <>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))", gap: 12, marginBottom: 20 }}>
                  <div style={{ ...S.infoCard, background: "rgba(0,229,160,0.05)", border: "1px solid rgba(0,229,160,0.15)" }}>
                    <div style={S.label}>Avg Salary</div>
                    <div style={{ fontSize: 26, fontWeight: 900, color: "#00e5a0" }}>{fmt(salary, currency, rates)}<span style={{ fontSize: 13, color: "rgba(255,255,255,0.3)" }}>/mo</span></div>
                  </div>
                  <div style={S.infoCard}>
                    <div style={S.label}>Buffer vs Comfortable COL</div>
                    <div style={{ fontSize: 26, fontWeight: 900, color: buffer > 0 ? "#00e5a0" : "#ff6b6b" }}>{fmt(buffer, currency, rates)}/mo</div>
                    <div style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", marginTop: 3 }}>{buffer > 500 ? "✓ Comfortable" : buffer > 0 ? "⚠ Tight" : "✗ Deficit"}</div>
                  </div>
                  <div style={S.infoCard}>
                    <div style={S.label}>Foreign Access</div>
                    <Badge label={sectorData.foreignAccess} color={accessColor(sectorData.foreignAccess)} />
                  </div>
                  <div style={S.infoCard}>
                    <div style={S.label}>Market Demand</div>
                    <Badge label={sectorData.demand} color={scoreColor(sectorData.demandScore)} />
                    <div style={{ marginTop: 8 }}><ScoreBar score={sectorData.demandScore} /></div>
                  </div>
                </div>
                <TaxEstimator grossUSD={salary} countryName={selectedCountry} currency={currency} rates={rates} />
              </>
            );
          })()}

          <div style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", textTransform: "uppercase", letterSpacing: 1.5, marginBottom: 10, marginTop: 20 }}>Market Insights</div>
          <div style={S.notesBox}>{sectorData.notes}</div>

          <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 12 }}>🔍 Live Job Postings</div>
          <div style={S.jobLinkRow}>
            {Object.entries(country.jobLinks).map(([platform, url]) => (
              <a key={platform} href={url} target="_blank" rel="noopener noreferrer" style={S.jobLink}>{platform} →</a>
            ))}
          </div>
        </div>
      )}

      {/* TOOLS PAGE */}
      {page === "tools" && (
        <div style={S.section}>
          <div style={{ fontSize: 28, fontWeight: 900, letterSpacing: "-1px", marginBottom: 6 }}>🛠 Analytics Tools</div>
          <div style={{ fontSize: 14, color: "rgba(255,255,255,0.4)", marginBottom: 28 }}>Personalized tools to help you make smarter career decisions across ASEAN.</div>
          <div style={S.tabRow}>
            {[["calculator", "💰 Salary Calculator"], ["suitability", "🎯 Suitability Score"], ["compare", "⚖️ Comparison"]].map(([id, label]) => (
              <button key={id} style={S.tab(toolTab === id)} onClick={() => setToolTab(id)}>{label}</button>
            ))}
          </div>
          {toolTab === "calculator" && <SalaryCalculator currency={currency} rates={rates} />}
          {toolTab === "suitability" && <SuitabilityScore currency={currency} rates={rates} />}
          {toolTab === "compare" && <CountryComparison currency={currency} rates={rates} />}
        </div>
      )}

      {/* METHODOLOGY */}
      {page === "methodology" && <MethodologyPage />}

      {/* FOOTER */}
      <div style={S.footer}>
        OpportuNation · ASEAN Foreign Worker Navigator · Data: ILO, World Bank, Numbeo, national statistics agencies · Q1 2026
      </div>
    </div>
  );
}