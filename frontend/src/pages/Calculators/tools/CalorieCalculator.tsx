/**
 * ToolSnapy — Free, private online tools. No installs, no signup.
 * https://toolsnapy.com
 *
 * © 2026 ToolSnapy. All rights reserved.
 */
import { useState } from "react";
import ToolPageShell from "../../../components/ToolPageShell/ToolPageShell";
import s from "../../../styles/calc.module.css";

const Icon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M18 8h1a4 4 0 0 1 0 8h-1"/>
    <path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"/>
    <line x1="6" y1="1" x2="6" y2="4"/>
    <line x1="10" y1="1" x2="10" y2="4"/>
    <line x1="14" y1="1" x2="14" y2="4"/>
  </svg>
);

const ACTIVITY_LEVELS = [
  { label: "Sedentary",        desc: "Little or no exercise",            factor: 1.2   },
  { label: "Lightly Active",   desc: "Light exercise 1–3 days/week",     factor: 1.375 },
  { label: "Moderately Active",desc: "Moderate exercise 3–5 days/week",  factor: 1.55  },
  { label: "Very Active",      desc: "Hard exercise 6–7 days/week",      factor: 1.725 },
  { label: "Extra Active",     desc: "Physical job + hard exercise",      factor: 1.9   },
];

interface Result {
  bmr: number;
  maintenance: number;
  mildDeficit: number;
  deficit: number;
  aggressiveDeficit: number;
  surplus: number;
}

const CalorieCalculator = () => {
  const [age, setAge]         = useState("");
  const [gender, setGender]   = useState<"male" | "female">("male");
  const [heightCm, setHeightCm] = useState("");
  const [weight, setWeight]   = useState("");
  const [activity, setActivity] = useState(1);
  const [unit, setUnit]       = useState<"metric" | "imperial">("metric");
  const [result, setResult]   = useState<Result | null>(null);

  const calculate = () => {
    const a = parseFloat(age);
    const h = parseFloat(heightCm);
    const w = parseFloat(weight);
    if (!a || !h || !w || a <= 0 || h <= 0 || w <= 0) return;

    // Convert to metric if needed
    const hCm = unit === "metric" ? h : h * 2.54;
    const wKg = unit === "metric" ? w : w * 0.453592;

    // Mifflin-St Jeor BMR
    const bmr = gender === "male"
      ? 10 * wKg + 6.25 * hCm - 5 * a + 5
      : 10 * wKg + 6.25 * hCm - 5 * a - 161;

    const factor = ACTIVITY_LEVELS[activity].factor;
    const tdee   = bmr * factor;

    setResult({
      bmr:               Math.round(bmr),
      maintenance:       Math.round(tdee),
      mildDeficit:       Math.round(tdee - 250),
      deficit:           Math.round(tdee - 500),
      aggressiveDeficit: Math.round(tdee - 750),
      surplus:           Math.round(tdee + 500),
    });
  };

  const hUnit = unit === "metric" ? "cm" : "in";
  const wUnit = unit === "metric" ? "kg" : "lbs";

  return (
    <ToolPageShell
      backTo="/calculators"
      backLabel="Calculators"
      icon={<Icon />}
      iconColor="#059669"
      iconBg="#ecfdf5"
      title="Calorie Calculator"
      description="Find your daily calorie needs for maintenance, weight loss, or muscle gain."
    >
      <div className={s.workspace}>
        {/* Inputs */}
        <div className={s.card}>
          <span className={s.cardTitle}>Your Profile</span>

          <div className={s.inputGroup}>
            <span className={s.label}>Unit System</span>
            <div className={s.radioGroup}>
              <button className={`${s.radioBtn} ${unit === "metric" ? s.radioBtnActive : ""}`}
                onClick={() => setUnit("metric")}>Metric</button>
              <button className={`${s.radioBtn} ${unit === "imperial" ? s.radioBtnActive : ""}`}
                onClick={() => setUnit("imperial")}>Imperial</button>
            </div>
          </div>

          <div className={s.inputGroup}>
            <span className={s.label}>Gender</span>
            <div className={s.radioGroup}>
              <button className={`${s.radioBtn} ${gender === "male" ? s.radioBtnActive : ""}`}
                onClick={() => setGender("male")}>Male</button>
              <button className={`${s.radioBtn} ${gender === "female" ? s.radioBtnActive : ""}`}
                onClick={() => setGender("female")}>Female</button>
            </div>
          </div>

          <div className={`${s.inputGrid} ${s.inputGrid2}`}>
            <div className={s.inputGroup}>
              <label className={s.label}>Age (years)</label>
              <input className={s.input} type="number" placeholder="e.g. 28"
                value={age} onChange={e => setAge(e.target.value)} />
            </div>
            <div className={s.inputGroup}>
              <label className={s.label}>Height ({hUnit})</label>
              <input className={s.input} type="number" placeholder={unit === "metric" ? "175" : "69"}
                value={heightCm} onChange={e => setHeightCm(e.target.value)} />
            </div>
          </div>

          <div className={s.inputGroup}>
            <label className={s.label}>Weight ({wUnit})</label>
            <input className={s.input} type="number" placeholder={unit === "metric" ? "70" : "154"}
              value={weight} onChange={e => setWeight(e.target.value)} />
          </div>

          <div className={s.inputGroup}>
            <label className={s.label}>Activity Level</label>
            <select className={s.select} value={activity}
              onChange={e => setActivity(parseInt(e.target.value))}>
              {ACTIVITY_LEVELS.map((l, i) => (
                <option key={i} value={i}>{l.label}   {l.desc}</option>
              ))}
            </select>
          </div>

          <button className={s.calcBtn} onClick={calculate}>Calculate Calories</button>
        </div>

        {/* Results */}
        {result && (
          <div className={s.card}>
            <span className={s.cardTitle}>Daily Calorie Goals</span>

            <div className={`${s.resultCard} ${s.resultCardBlue}`}>
              <div className={s.resultValue}>{result.bmr.toLocaleString()} kcal</div>
              <div className={s.resultLabel}>Basal Metabolic Rate (BMR)</div>
              <div className={s.resultSub}>Calories burned at complete rest</div>
            </div>

            <div className={`${s.resultCard} ${s.resultCardGreen}`}>
              <div className={`${s.resultValue} ${s.resultValueLg}`}>{result.maintenance.toLocaleString()} kcal</div>
              <div className={s.resultLabel}>Maintenance (TDEE)</div>
              <div className={s.resultSub}>Calories to maintain current weight</div>
            </div>

            <div className={s.hint} style={{ fontWeight: 700, fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.07em", color: "var(--color-text-muted)" }}>
              Weight Loss
            </div>

            <div className={`${s.resultGrid} ${s.resultGrid2}`}>
              <div className={`${s.resultCard} ${s.resultCardYellow}`}>
                <div className={s.resultValue}>{result.mildDeficit.toLocaleString()} kcal</div>
                <div className={s.resultLabel}>Mild Cut (−250)</div>
                <div className={s.resultSub}>≈ 0.25 kg/week loss</div>
              </div>
              <div className={`${s.resultCard} ${s.resultCardOrange}`}>
                <div className={s.resultValue}>{result.deficit.toLocaleString()} kcal</div>
                <div className={s.resultLabel}>Moderate Cut (−500)</div>
                <div className={s.resultSub}>≈ 0.5 kg/week loss</div>
              </div>
            </div>

            <div className={`${s.resultCard} ${s.resultCardRed}`}>
              <div className={s.resultValue}>{result.aggressiveDeficit.toLocaleString()} kcal</div>
              <div className={s.resultLabel}>Aggressive Cut (−750)</div>
              <div className={s.resultSub}>≈ 0.75 kg/week loss · Not recommended long-term</div>
            </div>

            <div className={s.hint} style={{ fontWeight: 700, fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.07em", color: "var(--color-text-muted)", marginTop: "0.25rem" }}>
              Weight Gain / Muscle
            </div>

            <div className={s.resultCard} style={{ background: "#faf6f1", borderColor: "#e3d5c5" }}>
              <div className={`${s.resultValue} ${s.resultValueLg}`}>{result.surplus.toLocaleString()} kcal</div>
              <div className={s.resultLabel}>Surplus (TDEE +500)</div>
              <div className={s.resultSub}>≈ 0.5 kg/week muscle gain (with training)</div>
            </div>

            <div className={s.hint}>
              Formula: Mifflin-St Jeor BMR × Activity Factor (TDEE). Individual results vary.
            </div>
          </div>
        )}
      </div>
    </ToolPageShell>
  );
};

export default CalorieCalculator;
