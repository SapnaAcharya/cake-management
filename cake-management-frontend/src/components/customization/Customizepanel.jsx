import {
  Cake, CakeSlice, Check,
  Flame, Layers, Minus, Palette, Pencil, Plus, Ruler, ShoppingBag, Sparkles,
} from "lucide-react";
import { formatPrice } from "../../data/helpers";
import {
  DECORATION_CATEGORY_ORDER, FLAVORS, FONT_STYLES, FROSTINGS, MAX_CANDLES, MAX_MESSAGE_LENGTH, SIZES, TIERS,
} from "../../data/Options";
import { getImageUrl } from "../../utils/imageUrl" 

/* ---- Small building blocks ---------------------------------------------- */

function Section({ id, icon: Icon, title, children }) {
  return (
    <section id={id} className="cz-sec">
      <Icon className="cz-sec__icon" size={22} strokeWidth={1.6} />
      <div className="cz-sec__body">
        <h3 className="cz-sec__title">{title}</h3>
        {children}
      </div>
    </section>
  );
}

function Pill({ on, className = "", children, ...rest }) {
  return (
    <button
      type="button"
      className={`cz-pill ${on ? "cz-pill--on" : ""} ${className}`}
      aria-pressed={on}
      {...rest}
    >
      {children}
    </button>
  );
}

function Chip({ on, dot, image, children, ...rest }) {
  return (
    <button type="button" className={`cz-chip ${on ? "cz-chip--on" : ""}`} aria-pressed={on} {...rest}>
      {image ? (
        <span className="cz-chip__thumb">
          <img src={image} alt="" />
          {on && <span className="cz-chip__check"><Check size={11} strokeWidth={3} /></span>}
        </span>
      ) : (
        <span className="cz-chip__dot" style={{ background: dot }}>
          {on && <Check size={11} strokeWidth={3} />}
        </span>
      )}
      {children}
    </button>
  );
}

/* ---- Panel --------------------------------------------------------------- */

export default function CustomizePanel({ template, cfg, onChange, price, added, onAddToCart,
  decorations, decorationsLoading, decorationsError,
 }) {

  const toggleDecoration = (id) =>
    onChange({
      decorations: cfg.decorations.includes(id)
        ? cfg.decorations.filter((d) => d !== id)
        : [...cfg.decorations, id],
    });

  return (
    <aside className="cz-panel">
      <header className="cz-panel__head">
        <Cake size={38} strokeWidth={1.4} color="var(--pink-500)" />
        <div>
          <h2 className="cz-panel__name">{template.name}</h2>
          <p className="cz-panel__sub">Customize your cake to make it perfect!</p>
        </div>
      </header>

      <div className="cz-panel__scroll">
        {/* Write on the cake */}
        <Section id="cz-message" icon={Pencil} title="Write on the cake">
          <label className="cz-input">
            <input
              type="text"
              value={cfg.message}
              maxLength={MAX_MESSAGE_LENGTH}
              placeholder="Happy Birthday Emma"
              onChange={(e) => onChange({ message: e.target.value })}
            />
            <span className="cz-input__count">{cfg.message.length}/{MAX_MESSAGE_LENGTH}</span>
          </label>
          <div className="cz-row-wrap">
            {FONT_STYLES.map((f) => (
              <Pill
                key={f.id}
                on={cfg.font === f.id}
                className={`cz-font cz-font--${f.id}`}
                onClick={() => onChange({ font: f.id })}
              >
                <span className="cz-font__aa">Aa</span> {f.label}
                {cfg.font === f.id && (
                  <span className="cz-check cz-check--sm"><Check size={11} strokeWidth={3} /></span>
                )}
              </Pill>
            ))}
          </div>
        </Section>

        <Section id="cz-color" icon={Palette} title="Choose a color variation">
  <div className="cz-swatches">
    {template.colors.map((c) => {
      const on = cfg.colorId === c.id;

      return (
        <button
          key={c.dbId}
          type="button"
          className={`cz-swatch ${on ? "cz-swatch--on" : ""}`}
          aria-label={c.label}
          aria-pressed={on}
          onClick={() => {
            console.log("Selected color:", c);
            onChange({ colorId: c.id, colorDbId: c.dbId, colorHex: c.hex });
          }}
        >
          <span
            className="cz-swatch__fill"
            style={{ background: c.hex }}
          >
            {on && <Check size={14} strokeWidth={3} />}
          </span>
        </button>
      );
    })}

    <label
      className="cz-swatch cz-swatch--picker"
      aria-label="Pick a custom color"
      style={{ position: "relative" }}
    >
      <input
        type="color"
        value={cfg.colorHex ?? "#ff5c8a"}
        onChange={(e) =>
          onChange({
            colorId: null,
            colorHex: e.target.value,
          })
        }
        style={{
          opacity: 0,
          position: "absolute",
          inset: 0,
          cursor: "pointer",
        }}
      />

      <span
        className="cz-swatch__fill"
        style={{
          background: cfg.colorHex ?? "#ffffff",
        }}
      >
        <Palette size={14} />
      </span>
    </label>
  </div>
</Section>

        {/* Size */}
        <Section id="cz-size" icon={Ruler} title="Choose Size">
          <div className="cz-row-wrap">
            {SIZES.map((s) => (
              <Pill
                key={s.value}
                on={cfg.size === s.value}
                disabled={!template.sizes.includes(s.value)}
                onClick={() => onChange({ size: s.value })}
              >
                {s.value}"
              </Pill>
            ))}
          </div>
        </Section>

        {/* Tier */}
        <Section id="cz-tier" icon={Layers} title="Choose Tier">
          <div className="cz-row-wrap">
            {TIERS.map((t) => (
              <Pill
                key={t.value}
                on={cfg.tier === t.value}
                onClick={() => onChange({ tier: t.value })}
              >
                {t.label}
              </Pill>
            ))}
          </div>
        </Section>

        {/* Sponge flavor */}
        <Section id="cz-flavor" icon={Cake} title="Choose Sponge Flavor">
          <div className="cz-row-wrap">
            {FLAVORS.map((f) => (
              <Chip key={f.id} on={cfg.flavor === f.id} dot={f.dot} onClick={() => onChange({ flavor: f.id })}>
                {f.label}
              </Chip>
            ))}
          </div>
        </Section>

        {/* Frosting */}
        <Section id="cz-frosting" icon={CakeSlice} title="Choose Frosting">
          <div className="cz-row-wrap">
            {FROSTINGS.map((f) => (
              <Pill key={f.id} on={cfg.frosting === f.id} onClick={() => onChange({ frosting: f.id })}>
                {f.label}
              </Pill>
            ))}
          </div>
        </Section>

        {/* Decorations — grouped by category so users know what they're applying */}
<Section id="cz-decorations" icon={Sparkles} title="Add Decorations">
  {decorationsLoading && (
    <p className="cz-sec__status">Loading decorations...</p>
  )}

  {!decorationsLoading && decorationsError && (
    <p className="cz-sec__status cz-sec__status--error">{decorationsError}</p>
  )}

  {!decorationsLoading && !decorationsError && decorations.length === 0 && (
    <p className="cz-sec__status">No decorations available yet.</p>
  )}

  {!decorationsLoading && !decorationsError && decorations.length > 0 && (() => {
    // Group decorations by category
    const grouped = decorations.reduce((acc, d) => {
      const cat = d.category || "Other";
      (acc[cat] ??= []).push(d);
      return acc;
    }, {});

    // Known categories first, in a fixed order; anything unrecognized goes after
    const orderedCategories = [
      ...DECORATION_CATEGORY_ORDER.filter((cat) => grouped[cat]?.length),
      ...Object.keys(grouped).filter((cat) => !DECORATION_CATEGORY_ORDER.includes(cat)),
    ];

    return orderedCategories.map((category) => (
      <div key={category} className="cz-deco-group">
        <p className="cz-deco-group__title">{category}</p>
        <div className="cz-row-wrap">
          {grouped[category].map((d) => (
            <Chip
              key={d.id}
              on={cfg.decorations.includes(d.id)}
              image={d.imageUrl ? getImageUrl(d.imageUrl) : undefined}
              dot={d.imageUrl ? undefined : "#e8c7d6"}
              onClick={() => toggleDecoration(d.id)}
            >
              {d.name}
            </Chip>
          ))}
        </div>
      </div>
    ));
  })()}
</Section>

        {/* Candles */}
        <Section id="cz-candles" icon={Flame} title="Add Candles">
          <div className="cz-candles">
            <div className="cz-stepper">
              <button
                type="button"
                aria-label="Fewer candles"
                disabled={cfg.candles <= 0}
                onClick={() => onChange({ candles: Math.max(0, cfg.candles - 1) })}
              >
                <Minus size={14} />
              </button>
              <span aria-live="polite">{cfg.candles}</span>
              <button
                type="button"
                aria-label="More candles"
                disabled={cfg.candles >= MAX_CANDLES}
                onClick={() => onChange({ candles: Math.min(MAX_CANDLES, cfg.candles + 1) })}
              >
                <Plus size={14} />
              </button>
            </div>
            <Pill on={cfg.lit} aria-label="Candles lit" onClick={() => onChange({ lit: !cfg.lit })}>
              <Flame size={14} /> {cfg.lit ? "Lit" : "Unlit"}
            </Pill>
          </div>
        </Section>
      </div>

      {/* Price summary + Add to cart */}
      <footer className="cz-panel__foot">
        <div className="cz-summary">
          <h3 className="cz-summary__title">Price Summary</h3>
          <ul className="cz-summary__lines">
            {price.lines.map((l) => (
              <li key={l.label}>
                <span>{l.label}</span>
                <span>{formatPrice(l.amount)}</span>
              </li>
            ))}
          </ul>
          <p className="cz-summary__total">
            <span>Total</span>
            <span>{formatPrice(price.total)}</span>
          </p>
        </div>

        <button type="button" className="cz-cta" onClick={onAddToCart}>
          <ShoppingBag size={22} strokeWidth={1.8} />
          <span className="cz-cta__text">
            <strong>{added ? "Added to Cart" : "Add To Cart"}</strong>
            <small>Total: {formatPrice(price.total)}</small>
          </span>
        </button>
      </footer>
    </aside>
  );
}