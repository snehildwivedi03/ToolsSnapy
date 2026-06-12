import { useState } from "react";
import ToolPageShell from "../../../components/ToolPageShell/ToolPageShell";
import s from "../../../styles/calc.module.css";

const Icon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
  </svg>
);

type Unit = "metric" | "imperial";

interface Result {
  bmi: number;
  category: string;
  badge: string;
  color: string;
  idealMin: number;
  idealMax: number;
}

const BMI_CATEGORIES = [
  { max: 18.5, label: "Underweight", badge: "badgeBlue",   color: "#1d4ed8" },
  { max: 25,   label: "Normal",      badge: "badgeGreen",  color: "#15803d" },
  { max: 30,   label: "Overweight",  badge: "badgeOrange", color: "#c2410c" },
  { max: Infinity, label: "Obese",   badge: "badgeRed",    color: "#dc2626" },
];

function getCategory(bmi: number) {
  return BMI_CATEGORIES.find(c => bmi < c.max) ?? BMI_CATEGORIES[3];
}

const BmiCalculator = () => {
  const [unit, setUnit]     = useState<Unit>("metric");
  const [weight, setWeight] = useState("");
  const [heightCm, setHeightCm] = useState("");
  const [heightFt, setHeightFt] = useState("");
  const [heightIn, setHeightIn] = useState("");
  const [result, setResult] = useState<Result | null>(null);

  const calculate = () => {
    const w = parseFloat(weight);
    let hM = 0;

    if (unit === "metric") {
      hM = parseFloat(heightCm) / 100;
    } else {
      const ft = parseFloat(heightFt) || 0;
      const inches = parseFloat(heightIn) || 0;
      hM = (ft * 12 + inches) * 0.0254;
    }

    const wKg = unit === "metric" ? w : w * 0.453592;
    if (!wKg || !hM || hM <= 0) return;

    const bmi = wKg / (hM * hM);
    const cat = getCategory(bmi);
    const idealMin = +(18.5 * hM * hM).toFixed(1);
    const idealMax = +(24.9 * hM * hM).toFixed(1);

    setResult({
      bmi: Math.round(bmi * 10) / 10,
      category: cat.label,
      badge: cat.badge,
      color: cat.color,
      idealMin: unit === "metric" ? idealMin : Math.round(idealMin * 2.20462 * 10) / 10,
      idealMax: unit === "metric" ? idealMax : Math.round(idealMax * 2.20462 * 10) / 10,
    });
  };

  const weightUnit = unit === "metric" ? "kg" : "lbs";

  return (
    <ToolPageShell
      backTo="/calculators"
      backLabel="Calculators"
      icon={<Icon />}
      iconColor="#059669"
      iconBg="#ecfdf5"
      title="BMI Calculator"
      description="Calculate your Body Mass Index and find your healthy weight range."
    >
      <div className={s.workspace}>
        {/* Inputs */}
        <div className={s.card}>
          <span className={s.cardTitle}>Your Details</span>

          <div className={s.inputGroup}>
            <span className={s.label}>Unit System</span>
            <div className={s.radioGroup}>
              <button
                className={`${s.radioBtn} ${unit === "metric" ? s.radioBtnActive : ""}`}
                onClick={() => setUnit("metric")}
              >Metric (cm / kg)</button>
              <button
                className={`${s.radioBtn} ${unit === "imperial" ? s.radioBtnActive : ""}`}
                onClick={() => setUnit("imperial")}
              >Imperial (ft / lbs)</button>
            </div>
          </div>

          {unit === "metric" ? (
            <div className={s.inputGroup}>
              <label className={s.label}>Height (cm)</label>
              <input className={s.input} type="number" placeholder="e.g. 175"
                value={heightCm} onChange={e => setHeightCm(e.target.value)} />
            </div>
          ) : (
            <div className={`${s.inputGrid} ${s.inputGrid2}`}>
              <div className={s.inputGroup}>
                <label className={s.label}>Height (ft)</label>
                <input className={s.input} type="number" placeholder="5"
                  value={heightFt} onChange={e => setHeightFt(e.target.value)} />
              </div>
              <div className={s.inputGroup}>
                <label className={s.label}>Height (in)</label>
                <input className={s.input} type="number" placeholder="9"
                  value={heightIn} onChange={e => setHeightIn(e.target.value)} />
              </div>
            </div>
          )}

          <div className={s.inputGroup}>
            <label className={s.label}>Weight ({weightUnit})</label>
            <input className={s.input} type="number" placeholder={unit === "metric" ? "e.g. 70" : "e.g. 154"}
              value={weight} onChange={e => setWeight(e.target.value)} />
          </div>

          <button className={s.calcBtn} onClick={calculate}>Calculate BMI</button>
        </div>

        {/* Result */}
        {result && (
          <div className={s.card}>
            <span className={s.cardTitle}>Your BMI</span>

            <div className={s.resultCard} style={{ borderColor: result.color + "55", background: result.color + "11" }}>
              <div className={`${s.resultValue} ${s.resultValueLg}`}>{result.bmi}</div>
              <div className={s.resultLabel}>Body Mass Index</div>
              <span className={`${s.badge} ${s[result.badge as keyof typeof s]}`} style={{ marginTop: "0.5rem" }}>
                {result.category}
              </span>
            </div>

            <div className={`${s.resultGrid} ${s.resultGrid2}`}>
              <div className={`${s.resultCard} ${s.resultCardGreen}`}>
                <div className={s.resultValue}>{result.idealMin}</div>
                <div className={s.resultLabel}>Ideal Min ({weightUnit})</div>
              </div>
              <div className={`${s.resultCard} ${s.resultCardGreen}`}>
                <div className={s.resultValue}>{result.idealMax}</div>
                <div className={s.resultLabel}>Ideal Max ({weightUnit})</div>
              </div>
            </div>

            <div className={s.hint}>
              BMI 18.5–24.9 = Normal · 25–29.9 = Overweight · 30+ = Obese
            </div>
          </div>
        )}
      </div>
    </ToolPageShell>
  );
};

export default BmiCalculator;
