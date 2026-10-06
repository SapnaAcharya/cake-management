import { Brush, ArrowRight, Layers3, Ruler, Clock } from "lucide-react";
import ColorSwatches from "./ColorSwatches.jsx";
import PriceRow from "./PriceRow.jsx";
import { formatTiers, formatSizes, formatPrep } from "../../data/helpers.js";
import "../../styles/template.css";

export default function TemplateDetails({
  template,
  colorId,
  onColorChange,
  onUseTemplate,
}) {
  const { name, description, basePrice, colors, popular, tiers, sizes, prepHours} = template;

   const stats = [
    { icon: Layers3, value: formatTiers(tiers), label: "Tiers" },
    { icon: Ruler, value: formatSizes(sizes), label: "Available Sizes" },
    { icon: Clock, value: formatPrep(prepHours), label: "Prep Time" },
  ];

  return (
    <aside className="details">
      <h2 className="details__heading">Template Details</h2>

      <div className="details__top">
        <h3 className="details__title">
          {name}
          {popular && <span className="details__pill">Popular</span>}
        </h3>
      </div>


      <ul className="stats">
        {stats.map(({ icon: Icon, value, label }) => (
          <li key={label} className="stats__item">
            <Icon size={22} strokeWidth={1.5} />
            <div>
              <strong>{value}</strong>
              <span>{label}</span>
            </div>
          </li>
        ))}
      </ul>

       <section className="stage__about">
        <h3 className="section-title">About This Template</h3>
        <p>{description}</p>
      </section>

      <hr className="details__rule" />
      <ColorSwatches active={colorId} onChange={onColorChange} colors={colors} />
      <hr className="details__rule" />
      <PriceRow price={basePrice} />

      <div className="details__note">
        <p>
          This is a template design. You can customize colors, text, toppings and more on the next step.
        </p>
      </div>

      <button type="button" className="details__cta" onClick={onUseTemplate}>
        <Brush size={20} strokeWidth={1.8} />
        Use This Template
        <ArrowRight size={18} strokeWidth={2} />
      </button>
    </aside>
  );
}