import { Brush, ArrowRight, Clock } from "lucide-react";
import PriceRow from "./PriceRow.jsx";
import { formatPrep } from "../../data/helpers.js";
import "../../styles/template.css";

export default function TemplateDetails({ template, onUseTemplate }) {
  const { name, description, basePrice, popular, prepHours } = template;

  return (
    <aside className="details">
      {/* Scrollable content */}
      <div className="details__body">
        <header className="details__top">
          <h2 className="details__title">
            {name}
            {popular && <span className="details__pill">Popular</span>}
          </h2>
        </header>

        <p className="details__meta">
          <Clock size={16} strokeWidth={1.6} />
          Prep time: {formatPrep(prepHours)}
        </p>

        <section className="details__about">
          <h3 className="section-title">About This Template</h3>
          <p>{description}</p>
        </section>

        <div className="details__note">
          <p>
            This is a template design. You can customize colors, text, toppings
            and more on the next step.
          </p>
        </div>
      </div>

      {/* Always visible */}
      <footer className="details__footer">
        <PriceRow price={basePrice} />
        <button type="button" className="details__cta" onClick={onUseTemplate}>
          <Brush size={20} strokeWidth={1.8} />
          Use This Template
          <ArrowRight size={18} strokeWidth={2} />
        </button>
      </footer>
    </aside>
  );
}
