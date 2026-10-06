import { ChevronRight } from "lucide-react";
import "../../styles/template.css";

const STEPS = [
  { id: 1, label: "Choose Template" },
  { id: 2, label: "Customize & Order" },
];

export default function StepIndicator({ current = 1 }) {
  return (
    <nav className="steps" aria-label="Progress">
      {STEPS.map((step, i) => {
        const active = step.id === current;
        return (
          <div className="steps__group" key={step.id}>
            <div className={`step ${active ? "step--active" : ""}`} aria-current={active ? "step" : undefined}>
              <span className="step__num">{step.id}</span>
              <span className="step__label">{step.label}</span>
            </div>
            {i < STEPS.length - 1 && <ChevronRight size={16} className="steps__sep" />}
          </div>
        );
      })}
    </nav>
  );
}
