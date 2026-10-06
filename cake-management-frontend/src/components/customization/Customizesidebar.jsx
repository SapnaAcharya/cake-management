import {
  Cake, Check, ChevronRight, ClipboardList, Heart, Layers,
  MessageSquare, Palette, Pencil, Ruler,
} from "lucide-react";
import { formatPrice, formatTiers } from "../../data/helpers";
import { TIERS } from "../../data/Options";
import { getImageUrl } from "../../utils/imageUrl";

const jumpTo = (id) =>
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "center" });

export default function CustomizeSidebar({ template, cfg, onChangeTemplate }) {
  const features = (template.includes || []).map((name) => ({
    id: name,
    label: name.charAt(0).toUpperCase() + name.slice(1),
  }));
  const color = template.colors.find((c) => c.id === cfg.colorId);
  const tier = TIERS.find((t) => t.value === cfg.tier);

  const rows = [
    { icon: MessageSquare, label: "Message", target: "cz-message", value: cfg.message || "None" },
    {
      icon: Palette,
      label: "Color",
      target: "cz-color",
      value: (
        <>
          <span className="cz-dot" style={{ background: cfg.colorHex }} />
          {color?.label ?? "custom"}
        </>
      ),
    },
    { icon: Ruler, label: "Size", target: "cz-size", value: `${cfg.size} Inch` },
    { icon: Layers, label: "Tier", target: "cz-tier", value: `${tier?.label} Tier` },
  ];

  return (
    <aside className="cz-side">
      <section className="cz-card">
        <h2 className="cz-tag">
          <span className="cz-check"><Check size={14} strokeWidth={3} /></span>
          Selected Design
        </h2>

        <div className="cz-selected">
          <img className="cz-selected__img" src={getImageUrl(template.images.thumb)} alt={template.name} />
          <div className="cz-selected__info">
            <h3 className="cz-selected__name">{template.name}</h3>
            <ul className="cz-selected__meta">
              <li><Cake size={16} strokeWidth={1.6} /> <span className="cz-cap">{template.category}</span></li>
              <li><Layers size={16} strokeWidth={1.6} /> {formatTiers(template.tiers)}</li>
              <li><Heart size={16} strokeWidth={1.6} /> {template.styleName ?? "Classic Design"}</li>
            </ul>
            <p className="cz-selected__price">{formatPrice(template.basePrice)}</p>
            <button type="button" className="cz-link" onClick={onChangeTemplate}>
              <Pencil size={14} strokeWidth={1.8} />
              <span>Change Template</span>
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      </section>

      <section className="cz-card">
        <h2 className="cz-card__title">
          <ClipboardList size={22} strokeWidth={1.6} /> Design Includes
        </h2>
        <ul className="cz-includes">
          {features.map((f) => (
            <li key={f.id}>
              <span className="cz-check"><Check size={13} strokeWidth={3} /></span>
              {f.label}
            </li>
          ))}
        </ul>
      </section>

      <section className="cz-card">
        <h2 className="cz-card__title">
          <Heart size={22} strokeWidth={1.6} /> Current Selection
        </h2>
        <ul className="cz-rows">
          {rows.map(({ icon: Icon, label, value, target }) => (
            <li key={label}>
              <button type="button" className="cz-row" onClick={() => jumpTo(target)}>
                <Icon size={20} strokeWidth={1.6} />
                <span className="cz-row__label">{label}</span>
                <span className="cz-row__value">{value}</span>
                <ChevronRight size={16} />
              </button>
            </li>
          ))}
        </ul>
      </section>
    </aside>
  );
}