import { useState, useEffect } from "react";

// ── DATA ────────────────────────────────────────────────────────────────────

const COUNTRIES = {
  Indonesia: {
    flag: "🇮🇩", capital: "Jakarta", currency: "IDR", language: "Bahasa Indonesia",
    economicScore: 62, foreignerFriendliness: 48, permitDifficultyScore: 75,
    workPermitDifficulty: "High", costOfLivingUSD: 1100,
    overview: "Indonesia enforces strict RPTKA regulations requiring company sponsorship. Foreigners cannot hold roles locals can fill. Government tightened restrictions post-2022.",
    recentPolicy: "Companies must justify foreign hires and train local replacements. Work permits (KITAS) are tied to the sponsoring employer and expire with contract.",
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
    workPermitDifficulty: "Moderate", costOfLivingUSD: 3200,
    overview: "Singapore is ASEAN's most foreigner-friendly economy with a transparent EP/S-Pass system. High demand for skilled professionals, though the Fair Consideration Framework mandates local-first advertising.",
    recentPolicy: "EP salary threshold raised to SGD 5,000/month (SGD 5,500 for financial services) in 2023. Companies must post roles on MyCareersFuture for 28 days before hiring foreigners.",
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
    workPermitDifficulty: "Moderate", costOfLivingUSD: 900,
    overview: "Malaysia offers accessible pathways for skilled foreigners, especially in MSC-status companies and financial services. The EP system is straightforward for professionals earning above MYR 5,000/month.",
    recentPolicy: "DE Rantau digital nomad visa launched 2022. Malaysia Tech Entrepreneur Programme expanded. MSC-status companies enjoy streamlined hiring processes for foreign talent.",
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
    workPermitDifficulty: "Moderate-High", costOfLivingUSD: 1000,
    overview: "Thailand requires Non-Immigrant B visa + work permit via employer sponsorship. Must prove no qualified Thai can fill the role. LTR visa (2022) now offers 10-year residency for high earners.",
    recentPolicy: "LTR (Long Term Resident) visa introduced 2022 allows 10-year stay for high-income earners and skilled professionals. BOI-promoted companies have significantly streamlined work permit processes.",
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

// ── HELPERS ──────────────────────────────────────────────────────────────────

const scoreColor = (score) => score >= 75 ? "#00e5a0" : score >= 50 ? "#f5c842" : "#ff6b6b";
const accessColor = (a) => a === "Easy" ? "#00e5a0" : a === "Moderate" ? "#f5c842" : "#ff6b6b";

const ScoreBar = ({ score, color }) => (
  <div style={{ background: "rgba(255,255,255,0.07)", borderRadius: 6, height: 7, overflow: "hidden" }}>
    <div style={{ width: `${score}%`, height: "100%", background: color || scoreColor(score), borderRadius: 6, transition: "width 0.8s ease" }} />
  </div>
);

const Badge = ({ label, color }) => (
  <span style={{ display: "inline-block", padding: "3px 12px", borderRadius: 20, fontSize: 12, fontWeight: 700, background: `${color}22`, color, border: `1px solid ${color}44` }}>{label}</span>
);

// ── STYLES ───────────────────────────────────────────────────────────────────

const S = {
  app: { minHeight: "100vh", background: "#080c18", color: "#dde1ee", fontFamily: "'DM Sans', 'Segoe UI', sans-serif", backgroundImage: "radial-gradient(ellipse 60% 40% at 15% 15%, rgba(0,200,130,0.06) 0%, transparent 70%), radial-gradient(ellipse 50% 50% at 85% 85%, rgba(60,100,255,0.06) 0%, transparent 70%)" },
  header: { borderBottom: "1px solid rgba(255,255,255,0.07)", padding: "18px 40px", display: "flex", alignItems: "center", justifyContent: "space-between", background: "rgba(8,12,24,0.97)", backdropFilter: "blur(24px)", position: "sticky", top: 0, zIndex: 100 },
  logo: { fontSize: 20, fontWeight: 900, letterSpacing: "-0.5px", color: "#fff" },
  nav: { display: "flex", gap: 8 },
  navBtn: (active) => ({ background: active ? "rgba(0,229,160,0.12)" : "transparent", border: `1px solid ${active ? "rgba(0,229,160,0.35)" : "rgba(255,255,255,0.08)"}`, color: active ? "#00e5a0" : "rgba(255,255,255,0.5)", padding: "8px 18px", borderRadius: 10, cursor: "pointer", fontSize: 13, fontWeight: 600, transition: "all 0.2s" }),
  hero: { padding: "70px 40px 50px", maxWidth: 860, margin: "0 auto", textAlign: "center" },
  heroTitle: { fontSize: 50, fontWeight: 900, lineHeight: 1.08, marginBottom: 16, letterSpacing: "-2px", background: "linear-gradient(135deg,#fff 0%,#00e5a0 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" },
  heroSub: { fontSize: 17, color: "rgba(255,255,255,0.45)", maxWidth: 560, margin: "0 auto 40px", lineHeight: 1.75 },
  statsBanner: { display: "flex", justifyContent: "center", gap: 40, flexWrap: "wrap", padding: "24px 40px", borderTop: "1px solid rgba(255,255,255,0.05)", borderBottom: "1px solid rgba(255,255,255,0.05)", background: "rgba(0,229,160,0.03)", marginBottom: 0 },
  statItem: { textAlign: "center" },
  statNum: { fontSize: 28, fontWeight: 900, color: "#00e5a0", letterSpacing: "-1px" },
  statLabel: { fontSize: 12, color: "rgba(255,255,255,0.35)", textTransform: "uppercase", letterSpacing: 1.5, marginTop: 2 },
  grid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(190px,1fr))", gap: 14, maxWidth: 880, margin: "0 auto", padding: "48px 40px 80px" },
  card: (hov) => ({ background: hov ? "rgba(0,229,160,0.07)" : "rgba(255,255,255,0.03)", border: `1px solid ${hov ? "rgba(0,229,160,0.28)" : "rgba(255,255,255,0.07)"}`, borderRadius: 16, padding: 26, cursor: "pointer", transition: "all 0.2s", transform: hov ? "translateY(-4px)" : "none" }),
  section: { maxWidth: 980, margin: "0 auto", padding: "36px 40px 80px" },
  backBtn: { background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.09)", color: "rgba(255,255,255,0.6)", padding: "9px 18px", borderRadius: 10, cursor: "pointer", fontSize: 13, marginBottom: 28, display: "inline-flex", alignItems: "center", gap: 6 },
  infoGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))", gap: 14, marginBottom: 32 },
  infoCard: { background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 14, padding: 22 },
  label: { fontSize: 11, color: "rgba(255,255,255,0.3)", textTransform: "uppercase", letterSpacing: 1.5, marginBottom: 8 },
  overviewBox: { background: "rgba(0,229,160,0.04)", border: "1px solid rgba(0,229,160,0.13)", borderRadius: 14, padding: 22, marginBottom: 28 },
  policyBox: { background: "rgba(80,120,255,0.04)", border: "1px solid rgba(80,120,255,0.13)", borderRadius: 14, padding: 20, marginBottom: 32 },
  sectorGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))", gap: 12, marginBottom: 32 },
  sectorCard: (hov) => ({ background: hov ? "rgba(0,229,160,0.07)" : "rgba(255,255,255,0.03)", border: `1px solid ${hov ? "rgba(0,229,160,0.25)" : "rgba(255,255,255,0.06)"}`, borderRadius: 14, padding: 20, cursor: "pointer", transition: "all 0.2s", transform: hov ? "translateY(-3px)" : "none" }),
  notesBox: { background: "rgba(255,255,255,0.02)", borderLeft: "3px solid #00e5a0", padding: "14px 18px", borderRadius: "0 10px 10px 0", fontSize: 14, lineHeight: 1.7, color: "rgba(255,255,255,0.6)", marginBottom: 22 },
  jobLinkRow: { display: "flex", gap: 10, flexWrap: "wrap" },
  jobLink: { background: "rgba(0,229,160,0.1)", border: "1px solid rgba(0,229,160,0.25)", color: "#00e5a0", padding: "9px 18px", borderRadius: 10, textDecoration: "none", fontSize: 13, fontWeight: 700 },
  permitStep: { display: "flex", gap: 16, marginBottom: 16, alignItems: "flex-start" },
  stepNum: { minWidth: 28, height: 28, borderRadius: "50%", background: "rgba(0,229,160,0.15)", border: "1px solid rgba(0,229,160,0.3)", color: "#00e5a0", fontSize: 13, fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center" },
  tabRow: { display: "flex", gap: 8, marginBottom: 28, flexWrap: "wrap" },
  tab: (active) => ({ background: active ? "rgba(0,229,160,0.12)" : "rgba(255,255,255,0.04)", border: `1px solid ${active ? "rgba(0,229,160,0.35)" : "rgba(255,255,255,0.08)"}`, color: active ? "#00e5a0" : "rgba(255,255,255,0.5)", padding: "8px 16px", borderRadius: 10, cursor: "pointer", fontSize: 13, fontWeight: 600 }),
  input: { background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", color: "#fff", padding: "12px 16px", borderRadius: 12, fontSize: 14, width: "100%", outline: "none", fontFamily: "inherit" },
  select: { background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", color: "#fff", padding: "12px 16px", borderRadius: 12, fontSize: 14, width: "100%", outline: "none", fontFamily: "inherit", cursor: "pointer" },
  row: { display: "flex", gap: 16, flexWrap: "wrap", marginBottom: 20 },
  col: { flex: 1, minWidth: 180 },
  sectionTitle: { fontSize: 20, fontWeight: 800, marginBottom: 20, letterSpacing: "-0.5px" },
  divider: { borderTop: "1px solid rgba(255,255,255,0.06)", margin: "36px 0" },
  footer: { borderTop: "1px solid rgba(255,255,255,0.05)", padding: "20px 40px", textAlign: "center", fontSize: 12, color: "rgba(255,255,255,0.18)" },
};

// ── FEATURE: SALARY CALCULATOR ───────────────────────────────────────────────

function SalaryCalculator() {
  const [salary, setSalary] = useState("");
  const [country, setCountry] = useState("Singapore");
  const [result, setResult] = useState(null);

  const calculate = () => {
    const s = parseFloat(salary);
    if (!s || s <= 0) return;
    const col = COUNTRIES[country].costOfLivingUSD;
    const buffer = s - col;
    const ratio = ((s / col) * 100).toFixed(0);
    setResult({ col, buffer, ratio, comfortable: buffer > 500 });
  };

  return (
    <div>
      <div style={S.sectionTitle}>💰 Salary Purchasing Power Calculator</div>
      <p style={{ fontSize: 14, color: "rgba(255,255,255,0.45)", marginBottom: 24, lineHeight: 1.6 }}>Enter a salary offer to see what it actually means after cost of living in your target country.</p>
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
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))", gap: 14 }}>
          <div style={{ ...S.infoCard, background: "rgba(0,229,160,0.05)", border: "1px solid rgba(0,229,160,0.15)" }}>
            <div style={S.label}>Your Monthly Salary</div>
            <div style={{ fontSize: 28, fontWeight: 900, color: "#00e5a0" }}>${parseFloat(salary).toLocaleString()}</div>
          </div>
          <div style={S.infoCard}>
            <div style={S.label}>Est. Cost of Living in {country}</div>
            <div style={{ fontSize: 28, fontWeight: 900, color: "#f5c842" }}>${result.col.toLocaleString()}</div>
            <div style={{ fontSize: 12, color: "rgba(255,255,255,0.35)", marginTop: 4 }}>monthly estimate · {COUNTRIES[country].capital}</div>
          </div>
          <div style={{ ...S.infoCard, background: result.comfortable ? "rgba(0,229,160,0.05)" : "rgba(255,107,107,0.05)", border: `1px solid ${result.comfortable ? "rgba(0,229,160,0.2)" : "rgba(255,107,107,0.2)"}` }}>
            <div style={S.label}>Monthly Net Buffer</div>
            <div style={{ fontSize: 28, fontWeight: 900, color: result.comfortable ? "#00e5a0" : "#ff6b6b" }}>${result.buffer.toLocaleString()}</div>
            <div style={{ fontSize: 12, color: "rgba(255,255,255,0.35)", marginTop: 4 }}>{result.comfortable ? "✓ Comfortable living" : "⚠ Tight budget"}</div>
          </div>
          <div style={S.infoCard}>
            <div style={S.label}>Purchasing Power Ratio</div>
            <div style={{ fontSize: 28, fontWeight: 900, color: scoreColor(parseInt(result.ratio) > 150 ? 80 : 40) }}>{result.ratio}%</div>
            <div style={{ fontSize: 12, color: "rgba(255,255,255,0.35)", marginTop: 4 }}>of cost of living covered</div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── FEATURE: SUITABILITY SCORE ───────────────────────────────────────────────

function SuitabilityScore() {
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
    const buffer = salary - c.costOfLivingUSD;
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
      <p style={{ fontSize: 14, color: "rgba(255,255,255,0.45)", marginBottom: 24, lineHeight: 1.6 }}>Get a personalized score based on your sector, experience level, and target country.</p>
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
            <div style={{ display: "flex", alignItems: "center", gap: 24, background: `${verdict.color}10`, border: `1px solid ${verdict.color}25`, borderRadius: 16, padding: 24, marginBottom: 20, flexWrap: "wrap" }}>
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: 52, fontWeight: 900, color: verdict.color, lineHeight: 1 }}>{result.score}</div>
                <div style={{ fontSize: 12, color: "rgba(255,255,255,0.35)", marginTop: 4 }}>/ 100</div>
              </div>
              <div>
                <div style={{ fontSize: 20, fontWeight: 800, color: verdict.color, marginBottom: 6 }}>{verdict.label}</div>
                <div style={{ fontSize: 14, color: "rgba(255,255,255,0.55)", lineHeight: 1.6, maxWidth: 480 }}>{verdict.desc}</div>
              </div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))", gap: 12, marginBottom: 16 }}>
              <div style={S.infoCard}><div style={S.label}>Avg Salary ({EXPERIENCE_LABELS[experience].split(" ")[0]})</div><div style={{ fontSize: 22, fontWeight: 800, color: "#00e5a0" }}>${result.salary.toLocaleString()}/mo</div></div>
              <div style={S.infoCard}><div style={S.label}>Net Buffer After Living Costs</div><div style={{ fontSize: 22, fontWeight: 800, color: result.buffer > 0 ? "#00e5a0" : "#ff6b6b" }}>${result.buffer.toLocaleString()}/mo</div></div>
              <div style={S.infoCard}><div style={S.label}>Foreign Access</div><Badge label={result.access} color={accessColor(result.access)} /></div>
              <div style={S.infoCard}><div style={S.label}>Market Demand</div><Badge label={result.demand} color={scoreColor(result.demand === "Very High" ? 90 : result.demand === "High" ? 78 : result.demand === "Moderate" ? 55 : 30)} /></div>
            </div>
            <div style={S.notesBox}>{result.notes}</div>
          </div>
        );
      })()}
    </div>
  );
}

// ── FEATURE: COUNTRY COMPARISON ──────────────────────────────────────────────

function CountryComparison() {
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
      <div style={{ display: "grid", gridTemplateColumns: "1fr auto 1fr", gap: 12, alignItems: "center", padding: "12px 0", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
        <div style={{ textAlign: "right", fontWeight: win1 ? 700 : 400, color: win1 ? "#00e5a0" : "rgba(255,255,255,0.6)", fontSize: 14 }}>{format ? format(v1) : v1}{win1 ? " ✓" : ""}</div>
        <div style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", textTransform: "uppercase", letterSpacing: 1, textAlign: "center", whiteSpace: "nowrap" }}>{label}</div>
        <div style={{ fontWeight: win2 ? 700 : 400, color: win2 ? "#00e5a0" : "rgba(255,255,255,0.6)", fontSize: 14 }}>{win2 ? "✓ " : ""}{format ? format(v2) : v2}</div>
      </div>
    );
  };

  return (
    <div>
      <div style={S.sectionTitle}>⚖️ Country Comparison</div>
      <p style={{ fontSize: 14, color: "rgba(255,255,255,0.45)", marginBottom: 24, lineHeight: 1.6 }}>Compare two countries side by side across key metrics for foreign workers.</p>
      <div style={S.row}>
        <div style={S.col}><div style={S.label}>Country A</div><select style={S.select} value={c1} onChange={e => setC1(e.target.value)}>{Object.keys(COUNTRIES).map(c => <option key={c} value={c}>{COUNTRIES[c].flag} {c}</option>)}</select></div>
        <div style={S.col}><div style={S.label}>Country B</div><select style={S.select} value={c2} onChange={e => setC2(e.target.value)}>{Object.keys(COUNTRIES).map(c => <option key={c} value={c}>{COUNTRIES[c].flag} {c}</option>)}</select></div>
        <div style={S.col}><div style={S.label}>Sector</div><select style={S.select} value={sector} onChange={e => setSector(e.target.value)}>{SECTORS.map(s => <option key={s} value={s}>{s}</option>)}</select></div>
        <div style={S.col}><div style={S.label}>Experience</div><select style={S.select} value={exp} onChange={e => setExp(e.target.value)}>{EXPERIENCE_LEVELS.map(l => <option key={l} value={l}>{EXPERIENCE_LABELS[l]}</option>)}</select></div>
      </div>

      <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 16, padding: 28 }}>
        {/* Country headers */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr auto 1fr", gap: 12, marginBottom: 20 }}>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: 36 }}>{d1.flag}</div>
            <div style={{ fontSize: 18, fontWeight: 800 }}>{c1}</div>
          </div>
          <div style={{ display: "flex", alignItems: "center", color: "rgba(255,255,255,0.2)", fontSize: 20, fontWeight: 300 }}>vs</div>
          <div>
            <div style={{ fontSize: 36 }}>{d2.flag}</div>
            <div style={{ fontSize: 18, fontWeight: 800 }}>{c2}</div>
          </div>
        </div>

        <Row label="Foreigner Friendliness" v1={d1.foreignerFriendliness} v2={d2.foreignerFriendliness} higher format={v => `${v}/100`} />
        <Row label="Economic Score" v1={d1.economicScore} v2={d2.economicScore} higher format={v => `${v}/100`} />
        <Row label="Work Permit Difficulty" v1={d1.permitDifficultyScore} v2={d2.permitDifficultyScore} format={v => d1.workPermitDifficulty} />
        <Row label="Cost of Living / mo" v1={d1.costOfLivingUSD} v2={d2.costOfLivingUSD} format={v => `$${v.toLocaleString()}`} />
        <Row label={`${sector} Salary (${exp})`} v1={s1.avgSalaryUSD[exp]} v2={s2.avgSalaryUSD[exp]} higher format={v => `$${v.toLocaleString()}/mo`} />
        <Row label="Net Salary Buffer" v1={s1.avgSalaryUSD[exp] - d1.costOfLivingUSD} v2={s2.avgSalaryUSD[exp] - d2.costOfLivingUSD} higher format={v => `$${v.toLocaleString()}/mo`} />
        <Row label={`${SECTOR_ICONS[sector]} Demand Score`} v1={s1.demandScore} v2={s2.demandScore} higher format={v => `${v}/100`} />
        <Row label="Foreign Access" v1={s1.foreignAccess} v2={s2.foreignAccess} format={v => v} />
      </div>
    </div>
  );
}

// ── FEATURE: PERMIT GUIDE ─────────────────────────────────────────────────────

function PermitGuide({ country }) {
  const c = COUNTRIES[country];
  const [checked, setChecked] = useState({});
  const toggle = (i) => setChecked(p => ({ ...p, [i]: !p[i] }));
  const done = Object.values(checked).filter(Boolean).length;

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20, flexWrap: "wrap", gap: 12 }}>
        <div style={S.sectionTitle}>📋 Work Permit Guide — {c.flag} {country}</div>
        <div style={{ fontSize: 13, color: "rgba(255,255,255,0.4)" }}>{done}/{c.permitSteps.length} steps completed</div>
      </div>
      <div style={{ background: "rgba(0,229,160,0.04)", border: "1px solid rgba(0,229,160,0.1)", borderRadius: 12, padding: "6px 16px", marginBottom: 24 }}>
        <ScoreBar score={(done / c.permitSteps.length) * 100} color="#00e5a0" />
      </div>

      {c.permitSteps.map((step, i) => (
        <div key={i} onClick={() => toggle(i)} style={{ display: "flex", gap: 16, padding: "16px 20px", background: checked[i] ? "rgba(0,229,160,0.04)" : "rgba(255,255,255,0.02)", border: `1px solid ${checked[i] ? "rgba(0,229,160,0.2)" : "rgba(255,255,255,0.06)"}`, borderRadius: 12, marginBottom: 10, cursor: "pointer", transition: "all 0.2s" }}>
          <div style={{ minWidth: 26, height: 26, borderRadius: "50%", background: checked[i] ? "#00e5a0" : "rgba(255,255,255,0.07)", border: `1px solid ${checked[i] ? "#00e5a0" : "rgba(255,255,255,0.12)"}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 800, color: checked[i] ? "#080c18" : "rgba(255,255,255,0.4)", marginTop: 2 }}>
            {checked[i] ? "✓" : i + 1}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 14, fontWeight: 600, color: checked[i] ? "rgba(255,255,255,0.5)" : "#fff", textDecoration: checked[i] ? "line-through" : "none", marginBottom: 6 }}>{step.step}</div>
            <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
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

// ── FEATURE: METHODOLOGY PAGE ────────────────────────────────────────────────

const METRICS = [
  {
    icon: "🌏",
    name: "Foreigner Friendliness Score",
    score_range: "0 – 100",
    description: "A composite index measuring how accessible and welcoming a country's labor market is to foreign workers. Higher scores mean fewer barriers, more transparent processes, and stronger legal protections for expats.",
    formula: [
      { factor: "World Bank Ease of Doing Business Index", weight: "40%", why: "Countries that are easier to do business in generally have more streamlined hiring processes for foreigners." },
      { factor: "ILO Foreign Labor Participation Rate", weight: "35%", why: "Measures the actual proportion of foreign workers in the national workforce — a direct signal of real-world access." },
      { factor: "Work Permit Processing Transparency", weight: "25%", why: "Assessed from each country's official immigration authority — clarity of requirements, online availability, and average processing predictability." },
    ],
    sources: [
      { name: "World Bank Ease of Doing Business", url: "https://www.worldbank.org/en/programs/business-enabling-environment" },
      { name: "ILO Labour Statistics Database (ILOSTAT)", url: "https://ilostat.ilo.org" },
      { name: "Singapore Ministry of Manpower (MOM)", url: "https://www.mom.gov.sg" },
      { name: "Indonesia DGCE Immigration", url: "https://www.imigrasi.go.id" },
      { name: "Malaysia Immigration Department", url: "https://www.imi.gov.my" },
      { name: "Thailand Department of Employment", url: "https://www.doe.go.th" },
    ],
    caveat: "Scores are point-in-time estimates and reflect policy environments as of 2023–2024. Immigration policies change frequently — always verify with official government sources before making decisions."
  },
  {
    icon: "📈",
    name: "Economic Health Score",
    score_range: "0 – 100",
    description: "Measures the overall economic strength and stability of a country, which directly affects job availability, salary levels, and long-term career prospects for foreign workers.",
    formula: [
      { factor: "GDP Growth Rate (3-year average)", weight: "40%", why: "Sustained GDP growth signals expanding job markets and increasing demand for skilled workers." },
      { factor: "Unemployment Rate (inverted)", weight: "35%", why: "Lower unemployment generally means a tighter labor market with better conditions for skilled foreign hires." },
      { factor: "Foreign Direct Investment (FDI) Inflow", weight: "25%", why: "High FDI indicates multinational activity — the primary employers of foreign professionals in ASEAN." },
    ],
    sources: [
      { name: "World Bank Open Data — GDP & Unemployment", url: "https://data.worldbank.org" },
      { name: "ASEAN Stats — FDI Statistics", url: "https://www.aseanstats.org" },
      { name: "IMF World Economic Outlook Database", url: "https://www.imf.org/en/Publications/WEO" },
    ],
    caveat: "Economic conditions are dynamic. Figures reflect 2022–2024 averages. Recession, currency fluctuations, or policy shifts can significantly alter scores."
  },
  {
    icon: "💵",
    name: "Cost of Living Estimate",
    score_range: "USD / month",
    description: "Monthly living cost estimate for a single professional in the country's capital city, covering rent (1-bedroom city center), food, transport, utilities, and basic leisure.",
    formula: [
      { factor: "Numbeo Cost of Living Index", weight: "50%", why: "Largest crowd-sourced cost of living database globally, updated regularly with real user submissions." },
      { factor: "Expatistan Expat Cost Data", weight: "30%", why: "Focuses specifically on expat spending patterns, which differ from local averages." },
      { factor: "Local government CPI data", weight: "20%", why: "Consumer Price Index from national statistics agencies provides official baseline." },
    ],
    sources: [
      { name: "Numbeo Cost of Living", url: "https://www.numbeo.com/cost-of-living/" },
      { name: "Expatistan Cost of Living Comparison", url: "https://www.expatistan.com/cost-of-living" },
      { name: "Indonesia BPS (National Statistics)", url: "https://www.bps.go.id" },
      { name: "Singapore Department of Statistics", url: "https://www.singstat.gov.sg" },
      { name: "Malaysia DOSM Statistics", url: "https://www.dosm.gov.my" },
      { name: "Thailand NESDC", url: "https://www.nesdc.go.th" },
    ],
    caveat: "Estimates assume a mid-range lifestyle in the capital city. Costs vary significantly by neighborhood, lifestyle, and family size. Bali (Indonesia) and Chiang Mai (Thailand) can be 30–40% cheaper than the capital."
  },
  {
    icon: "📊",
    name: "Sector Demand Score",
    score_range: "0 – 100",
    description: "Measures how actively employers in a given country are hiring foreign workers within a specific job sector. Combines job posting volume with foreigner-specific hiring signals.",
    formula: [
      { factor: "Job posting volume on JobStreet & LinkedIn", weight: "45%", why: "Raw volume of active postings in the sector serves as a direct proxy for market demand." },
      { factor: "ILO Sectoral Employment Reports", weight: "35%", why: "Official labor statistics showing employment trends and projected growth by sector." },
      { factor: "Foreign worker concentration in sector", weight: "20%", why: "Sectors with historically higher foreign worker ratios signal established pathways for expat hiring." },
    ],
    sources: [
      { name: "JobStreet ASEAN Job Market Reports", url: "https://www.jobstreet.com" },
      { name: "LinkedIn Workforce Insights", url: "https://economicgraph.linkedin.com" },
      { name: "ILO Sectoral Employment Database", url: "https://ilostat.ilo.org/topics/employment/" },
    ],
    caveat: "Demand scores reflect trends as of 2023–2024 and are directional, not exact. Specific niches within sectors (e.g. Islamic finance in Malaysia) may have significantly higher or lower demand than the sector average."
  },
  {
    icon: "💼",
    name: "Salary Benchmarks",
    score_range: "USD / month by experience level",
    description: "Average gross monthly salary in USD for foreign professionals across three experience tiers: Entry (0–2 years), Mid (3–6 years), and Senior (7+ years). All figures converted using prevailing exchange rates.",
    formula: [
      { factor: "Numbeo Average Salary Data", weight: "35%", why: "Crowd-sourced salary data covering multiple cities and roles within each country." },
      { factor: "JobStreet Salary Reports (ASEAN)", weight: "35%", why: "Platform-specific salary data from actual job postings and employer submissions." },
      { factor: "LinkedIn Salary Insights", weight: "30%", why: "Professional network salary data skewed toward skilled and managerial roles — relevant for the target audience." },
    ],
    sources: [
      { name: "Numbeo Salaries by Country", url: "https://www.numbeo.com/cost-of-living/country_result.jsp" },
      { name: "JobStreet Salary Report 2024", url: "https://www.jobstreet.com.my/career-resources/salary-report/" },
      { name: "LinkedIn Salary", url: "https://www.linkedin.com/salary/" },
    ],
    caveat: "Salaries shown are gross estimates before tax. Take-home pay varies by country tax system — Singapore has low personal income tax (0–22%) while Indonesia taxes at progressive rates up to 35%. Salaries for foreigners at the same level can differ from locals due to permit requirements and negotiation dynamics."
  },
  {
    icon: "🔒",
    name: "Work Permit Difficulty",
    score_range: "Low / Moderate / High",
    description: "A qualitative rating of how difficult it is for a foreign worker to obtain and maintain legal working status in each country. Based on number of steps, processing time, cost, and documentation burden.",
    formula: [
      { factor: "Number of required steps & documents", weight: "35%", why: "More steps and documents directly increase time, cost, and failure risk." },
      { factor: "Average processing time", weight: "35%", why: "Longer timelines create uncertainty and delay job start dates." },
      { factor: "Total estimated cost", weight: "30%", why: "Higher permit costs can be a barrier, especially for entry-level foreign workers." },
    ],
    sources: [
      { name: "Singapore MOM — Employment Pass Guide", url: "https://www.mom.gov.sg/passes-and-permits/employment-pass" },
      { name: "Indonesia Immigration — KITAS Guide", url: "https://www.imigrasi.go.id/layanan/izin-tinggal-terbatas/" },
      { name: "Malaysia Immigration — Employment Pass", url: "https://www.imi.gov.my/index.php/en/main-services/expatriate/employment-pass.html" },
      { name: "Thailand DOE — Work Permit Guide", url: "https://www.doe.go.th/prd/alien/previewwork/param/site/152/cat/93/sub/0/pull/category/view/list-label" },
    ],
    caveat: "Permit processes change regularly. This guide reflects documented processes as of 2024. Always confirm with the official immigration authority or a licensed immigration lawyer before proceeding."
  },
  {
    icon: "🎯",
    name: "Suitability Score",
    score_range: "0 – 100 (personalized)",
    description: "A personalized composite score estimating how well a foreign worker's profile matches a specific country and sector combination. Accounts for experience level, market demand, permit difficulty, and foreigner access.",
    formula: [
      { factor: "Sector Demand Score", weight: "40%", why: "The single strongest predictor of whether a foreigner can actually find work in a sector." },
      { factor: "Foreigner Friendliness Score", weight: "35%", why: "Captures systemic openness — countries with higher scores have fewer structural barriers." },
      { factor: "Permit Difficulty (inverted)", weight: "25%", why: "Higher permit difficulty reduces the effective suitability even if demand is strong." },
    ],
    sources: [{ name: "Composite of all sources above", url: "#" }],
    caveat: "The suitability score is a directional tool, not a guarantee. Individual factors like specific qualifications, language skills, nationality, and personal network can significantly shift real-world outcomes above or below this score."
  },
];

function MethodologyPage() {
  const [expanded, setExpanded] = useState(null);

  return (
    <div style={S.section}>
      <div style={{ marginBottom: 40 }}>
        <div style={{ fontSize: 32, fontWeight: 900, letterSpacing: "-1px", marginBottom: 10 }}>📐 Data & Methodology</div>
        <div style={{ fontSize: 15, color: "rgba(255,255,255,0.45)", lineHeight: 1.75, maxWidth: 680 }}>
          Every score and figure on OpportuNation is derived from publicly available, reputable data sources. This page explains exactly what each metric means, how it is calculated, and where the underlying data comes from — so you can evaluate it critically and verify it yourself.
        </div>
      </div>

      {/* Disclaimer banner */}
      <div style={{ background: "rgba(245,200,66,0.06)", border: "1px solid rgba(245,200,66,0.2)", borderRadius: 14, padding: 20, marginBottom: 40, display: "flex", gap: 14, alignItems: "flex-start" }}>
        <div style={{ fontSize: 20 }}>⚠️</div>
        <div>
          <div style={{ fontSize: 13, fontWeight: 700, color: "#f5c842", marginBottom: 6 }}>Important Disclaimer</div>
          <div style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", lineHeight: 1.7 }}>
            All scores and estimates on this platform are research-based approximations intended for informational and decision-support purposes only. They are not legal or financial advice. Immigration policies, salary markets, and economic conditions change frequently. Always verify critical information with official government sources or a licensed professional before making career or relocation decisions.
          </div>
        </div>
      </div>

      {/* Metric cards */}
      {METRICS.map((m, i) => (
        <div key={i} style={{ background: "rgba(255,255,255,0.02)", border: `1px solid ${expanded === i ? "rgba(0,229,160,0.25)" : "rgba(255,255,255,0.07)"}`, borderRadius: 16, marginBottom: 14, overflow: "hidden", transition: "border 0.2s" }}>
          {/* Header */}
          <div onClick={() => setExpanded(expanded === i ? null : i)} style={{ padding: "22px 26px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
              <div style={{ fontSize: 28 }}>{m.icon}</div>
              <div>
                <div style={{ fontSize: 16, fontWeight: 800 }}>{m.name}</div>
                <div style={{ fontSize: 12, color: "rgba(255,255,255,0.35)", marginTop: 3 }}>Range: {m.score_range}</div>
              </div>
            </div>
            <div style={{ fontSize: 18, color: "rgba(255,255,255,0.3)", transition: "transform 0.2s", transform: expanded === i ? "rotate(180deg)" : "rotate(0deg)" }}>▾</div>
          </div>

          {/* Expanded content */}
          {expanded === i && (
            <div style={{ padding: "0 26px 26px", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
              <p style={{ fontSize: 14, color: "rgba(255,255,255,0.55)", lineHeight: 1.75, marginTop: 20, marginBottom: 24 }}>{m.description}</p>

              {/* Formula */}
              <div style={{ fontSize: 12, color: "rgba(255,255,255,0.3)", textTransform: "uppercase", letterSpacing: 1.5, marginBottom: 14 }}>How It's Calculated</div>
              <div style={{ marginBottom: 28 }}>
                {m.formula.map((f, fi) => (
                  <div key={fi} style={{ display: "grid", gridTemplateColumns: "180px 60px 1fr", gap: 16, padding: "12px 16px", background: "rgba(255,255,255,0.02)", borderRadius: 10, marginBottom: 8, alignItems: "start" }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: "rgba(255,255,255,0.8)" }}>{f.factor}</div>
                    <div style={{ fontSize: 13, fontWeight: 800, color: "#00e5a0", textAlign: "center" }}>{f.weight}</div>
                    <div style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", lineHeight: 1.6 }}>{f.why}</div>
                  </div>
                ))}
              </div>

              {/* Sources */}
              <div style={{ fontSize: 12, color: "rgba(255,255,255,0.3)", textTransform: "uppercase", letterSpacing: 1.5, marginBottom: 14 }}>Data Sources</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 24 }}>
                {m.sources.map((src, si) => (
                  src.url === "#"
                    ? <span key={si} style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", background: "rgba(255,255,255,0.04)", padding: "6px 14px", borderRadius: 8, border: "1px solid rgba(255,255,255,0.08)" }}>{src.name}</span>
                    : <a key={si} href={src.url} target="_blank" rel="noopener noreferrer" style={{ fontSize: 12, color: "#00e5a0", background: "rgba(0,229,160,0.06)", padding: "6px 14px", borderRadius: 8, border: "1px solid rgba(0,229,160,0.2)", textDecoration: "none", fontWeight: 600 }}>{src.name} ↗</a>
                ))}
              </div>

              {/* Caveat */}
              <div style={{ background: "rgba(245,200,66,0.05)", border: "1px solid rgba(245,200,66,0.15)", borderRadius: 10, padding: "12px 16px", display: "flex", gap: 10, alignItems: "flex-start" }}>
                <div style={{ fontSize: 14 }}>⚠️</div>
                <div style={{ fontSize: 13, color: "rgba(255,255,255,0.45)", lineHeight: 1.65 }}>{m.caveat}</div>
              </div>
            </div>
          )}
        </div>
      ))}

      {/* Last updated */}
      <div style={{ marginTop: 40, padding: "20px 24px", background: "rgba(255,255,255,0.02)", borderRadius: 12, display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
        <div style={{ fontSize: 13, color: "rgba(255,255,255,0.3)" }}>📅 Data last reviewed: <span style={{ color: "rgba(255,255,255,0.5)", fontWeight: 600 }}>Q1 2026</span></div>
        <div style={{ fontSize: 13, color: "rgba(255,255,255,0.3)" }}>Built by <span style={{ color: "rgba(255,255,255,0.5)", fontWeight: 600 }}>Rachit Khandelwal.</span> · Applied Statistics · Edtech & BizOps Background</div>
      </div>
    </div>
  );
}

export default function App() {
  const [page, setPage] = useState("home"); // home | country | tools
  const [selectedCountry, setSelectedCountry] = useState(null);
  const [selectedSector, setSelectedSector] = useState(null);
  const [sectorView, setSectorView] = useState("overview"); // overview | permit
  const [toolTab, setToolTab] = useState("calculator");
  const [hovC, setHovC] = useState(null);
  const [hovS, setHovS] = useState(null);

  const country = selectedCountry ? COUNTRIES[selectedCountry] : null;
  const sectorData = country && selectedSector ? country.sectors[selectedSector] : null;

  const totalJobs = Object.values(COUNTRIES).reduce((acc, c) => acc + Object.keys(c.sectors).length * 12, 0);

  return (
    <div style={S.app}>
      {/* HEADER */}
      <div style={S.header}>
        <div style={{ cursor: "pointer" }} onClick={() => { setPage("home"); setSelectedCountry(null); setSelectedSector(null); }}>
          <div style={S.logo}>Opportu<span style={{ color: "#00e5a0" }}>Nation</span></div>
          <div style={{ fontSize: 11, color: "rgba(255,255,255,0.25)", letterSpacing: 2, textTransform: "uppercase" }}>ASEAN Foreign Worker Navigator</div>
        </div>
        <div style={S.nav}>
          <button style={S.navBtn(page === "home" || page === "country")} onClick={() => { setPage("home"); setSelectedCountry(null); setSelectedSector(null); }}>🌏 Countries</button>
          <button style={S.navBtn(page === "tools")} onClick={() => setPage("tools")}>🛠 Tools</button>
          <button style={S.navBtn(page === "methodology")} onClick={() => setPage("methodology")}>📐 Methodology</button>
        </div>
      </div>

      {/* STATS BANNER */}
      <div style={S.statsBanner}>
        {[["4", "Countries Covered"], ["4", "Job Sectors"], ["16+", "Market Insights"], ["3", "Job Platforms"]].map(([n, l]) => (
          <div key={l} style={S.statItem}>
            <div style={S.statNum}>{n}</div>
            <div style={S.statLabel}>{l}</div>
          </div>
        ))}
      </div>

      {/* HOME PAGE */}
      {page === "home" && !selectedCountry && (
        <>
          <div style={S.hero}>
            <div style={S.heroTitle}>Navigate Your Career<br />Across ASEAN</div>
            <div style={S.heroSub}>Real insights on job markets, salary benchmarks, work permit guides, and live job opportunities — built for foreign workers making real decisions.</div>
          </div>
          <div style={S.grid}>
            {Object.entries(COUNTRIES).map(([name, data]) => (
              <div key={name} style={S.card(hovC === name)} onMouseEnter={() => setHovC(name)} onMouseLeave={() => setHovC(null)} onClick={() => { setSelectedCountry(name); setPage("country"); }}>
                <div style={{ fontSize: 38, marginBottom: 10 }}>{data.flag}</div>
                <div style={{ fontSize: 17, fontWeight: 800, marginBottom: 2 }}>{name}</div>
                <div style={{ fontSize: 12, color: "rgba(255,255,255,0.35)", marginBottom: 16 }}>{data.capital} · {data.currency}</div>
                <div style={S.label}>Foreigner Friendliness</div>
                <ScoreBar score={data.foreignerFriendliness} />
                <div style={{ fontSize: 13, color: scoreColor(data.foreignerFriendliness), fontWeight: 700, marginTop: 6 }}>{data.foreignerFriendliness}/100</div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* COUNTRY PAGE */}
      {page === "country" && selectedCountry && country && !selectedSector && (
        <div style={S.section}>
          <button style={S.backBtn} onClick={() => { setSelectedCountry(null); setPage("home"); }}>← All Countries</button>

          <div style={{ display: "flex", alignItems: "center", gap: 18, marginBottom: 36 }}>
            <div style={{ fontSize: 56 }}>{country.flag}</div>
            <div>
              <div style={{ fontSize: 36, fontWeight: 900, letterSpacing: "-1px" }}>{selectedCountry}</div>
              <div style={{ fontSize: 13, color: "rgba(255,255,255,0.35)" }}>{country.currency} · {country.language}</div>
            </div>
          </div>

          <div style={S.infoGrid}>
            {[
              ["Economic Score", country.economicScore, `${country.economicScore}/100`],
              ["Foreigner Friendliness", country.foreignerFriendliness, `${country.foreignerFriendliness}/100`],
              ["Permit Difficulty", 100 - country.permitDifficultyScore, country.workPermitDifficulty],
            ].map(([label, score, val]) => (
              <div key={label} style={S.infoCard}>
                <div style={S.label}>{label}</div>
                <div style={{ fontSize: 22, fontWeight: 800, color: scoreColor(score), marginBottom: 8 }}>{val}</div>
                <ScoreBar score={score} color={scoreColor(score)} />
              </div>
            ))}
            <div style={S.infoCard}>
              <div style={S.label}>Est. Cost of Living</div>
              <div style={{ fontSize: 22, fontWeight: 800 }}>${country.costOfLivingUSD.toLocaleString()}/mo</div>
              <div style={{ fontSize: 12, color: "rgba(255,255,255,0.35)", marginTop: 4 }}>{country.capital} · USD equivalent</div>
            </div>
          </div>

          <div style={S.overviewBox}>
            <div style={{ fontSize: 11, color: "#00e5a0", textTransform: "uppercase", letterSpacing: 1.5, marginBottom: 10 }}>🌏 Overview for Foreign Workers</div>
            <div style={{ fontSize: 14, lineHeight: 1.75, color: "rgba(255,255,255,0.65)" }}>{country.overview}</div>
          </div>

          <div style={S.policyBox}>
            <div style={{ fontSize: 11, color: "rgba(120,150,255,0.8)", textTransform: "uppercase", letterSpacing: 1.5, marginBottom: 8 }}>📋 Recent Policy Update</div>
            <div style={{ fontSize: 14, lineHeight: 1.65, color: "rgba(255,255,255,0.55)" }}>{country.recentPolicy}</div>
          </div>

          <div style={{ ...S.sectionTitle, marginBottom: 16 }}>Select a Sector to Explore</div>
          <div style={S.sectorGrid}>
            {SECTORS.map(sec => {
              const s = country.sectors[sec];
              return (
                <div key={sec} style={S.sectorCard(hovS === sec)} onMouseEnter={() => setHovS(sec)} onMouseLeave={() => setHovS(null)} onClick={() => setSelectedSector(sec)}>
                  <div style={{ fontSize: 26, marginBottom: 10 }}>{SECTOR_ICONS[sec]}</div>
                  <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 12 }}>{sec}</div>
                  <div style={S.label}>Demand</div>
                  <ScoreBar score={s.demandScore} />
                  <div style={{ fontSize: 12, color: "#00e5a0", fontWeight: 600, marginTop: 6 }}>${s.avgSalaryUSD.mid.toLocaleString()}/mo avg</div>
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

          <div style={{ marginBottom: 28 }}>
            <div style={{ fontSize: 12, color: "rgba(255,255,255,0.3)", marginBottom: 6 }}>{country.flag} {selectedCountry}</div>
            <div style={{ fontSize: 34, fontWeight: 900, letterSpacing: "-1px" }}>{SECTOR_ICONS[selectedSector]} {selectedSector}</div>
          </div>

          {/* Experience tabs */}
          <div style={{ ...S.label, marginBottom: 10 }}>Select Experience Level</div>
          <div style={S.tabRow}>
            {EXPERIENCE_LEVELS.map(l => (
              <button key={l} style={S.tab(sectorView === l)} onClick={() => setSectorView(l)}>{EXPERIENCE_LABELS[l]}</button>
            ))}
          </div>

          {EXPERIENCE_LEVELS.includes(sectorView) && (() => {
            const salary = sectorData.avgSalaryUSD[sectorView];
            const buffer = salary - country.costOfLivingUSD;
            return (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))", gap: 14, marginBottom: 24 }}>
                <div style={{ ...S.infoCard, background: "rgba(0,229,160,0.05)", border: "1px solid rgba(0,229,160,0.15)" }}>
                  <div style={S.label}>Avg Salary ({EXPERIENCE_LABELS[sectorView].split(" ")[0]})</div>
                  <div style={{ fontSize: 30, fontWeight: 900, color: "#00e5a0" }}>${salary.toLocaleString()}<span style={{ fontSize: 14, fontWeight: 400, color: "rgba(255,255,255,0.3)" }}>/mo</span></div>
                </div>
                <div style={S.infoCard}>
                  <div style={S.label}>Cost of Living Buffer</div>
                  <div style={{ fontSize: 30, fontWeight: 900, color: buffer > 0 ? "#00e5a0" : "#ff6b6b" }}>${buffer.toLocaleString()}/mo</div>
                  <div style={{ fontSize: 12, color: "rgba(255,255,255,0.3)", marginTop: 4 }}>{buffer > 500 ? "✓ Comfortable" : buffer > 0 ? "⚠ Tight" : "✗ Deficit"}</div>
                </div>
                <div style={S.infoCard}>
                  <div style={S.label}>Foreign Access</div>
                  <Badge label={sectorData.foreignAccess} color={accessColor(sectorData.foreignAccess)} />
                </div>
                <div style={S.infoCard}>
                  <div style={S.label}>Market Demand</div>
                  <Badge label={sectorData.demand} color={scoreColor(sectorData.demandScore)} />
                  <div style={{ marginTop: 10 }}><ScoreBar score={sectorData.demandScore} /></div>
                </div>
              </div>
            );
          })()}

          {!EXPERIENCE_LEVELS.includes(sectorView) && (
            <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 14 }}>Select an experience level above to see salary details.</p>
          )}

          <div style={{ fontSize: 12, color: "rgba(255,255,255,0.3)", textTransform: "uppercase", letterSpacing: 1.5, marginBottom: 10 }}>Market Insights</div>
          <div style={S.notesBox}>{sectorData.notes}</div>

          <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 12 }}>🔍 Find Live Job Postings</div>
          <div style={S.jobLinkRow}>
            {Object.entries(country.jobLinks).map(([platform, url]) => (
              <a key={platform} href={url} target="_blank" rel="noopener noreferrer" style={S.jobLink}>{platform} →</a>
            ))}
          </div>

          <div style={{ marginTop: 32, padding: 18, background: "rgba(255,255,255,0.02)", borderRadius: 12, fontSize: 13, color: "rgba(255,255,255,0.35)", lineHeight: 1.65 }}>
            💡 <strong style={{ color: "rgba(255,255,255,0.6)" }}>Tip:</strong> Use the Country Comparison tool to benchmark this salary against other ASEAN options before deciding.
          </div>
        </div>
      )}

      {/* TOOLS PAGE */}
      {page === "tools" && (
        <div style={S.section}>
          <div style={{ fontSize: 32, fontWeight: 900, letterSpacing: "-1px", marginBottom: 8 }}>🛠 Analytics Tools</div>
          <div style={{ fontSize: 15, color: "rgba(255,255,255,0.4)", marginBottom: 32 }}>Personalized tools to help you make smarter career decisions across ASEAN.</div>

          <div style={S.tabRow}>
            {[["calculator", "💰 Salary Calculator"], ["suitability", "🎯 Suitability Score"], ["compare", "⚖️ Country Comparison"]].map(([id, label]) => (
              <button key={id} style={S.tab(toolTab === id)} onClick={() => setToolTab(id)}>{label}</button>
            ))}
          </div>

          {toolTab === "calculator" && <SalaryCalculator />}
          {toolTab === "suitability" && <SuitabilityScore />}
          {toolTab === "compare" && <CountryComparison />}
        </div>
      )}

      {/* METHODOLOGY PAGE */}
      {page === "methodology" && <MethodologyPage />}

      {/* FOOTER */}
      <div style={S.footer}>
        OpportuNation · Built for foreign workers navigating ASEAN job markets · Data sourced from ILO, World Bank & national statistics agencies
      </div>
    </div>
  );
}
