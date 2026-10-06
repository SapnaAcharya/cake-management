import { useRef } from "react";
import { Check, ChevronRight } from "lucide-react";
import "../../styles/template.css";

export default function ColorSwatches({ active, onChange, colors = [] }) {
  const listRef = useRef(null);

  if (!colors.length) return null;

  return (
    <section>
      <h3 className="section-title">Choose a Color Variation</h3>
      <div className="swatches">
        <div className="swatches__list" ref={listRef} role="radiogroup" aria-label="Colour variation">
          {colors.map((c) => {
            const on = active === c.id;
            return (
              <div className="swatch-item" key={c.id}>
                <button
                  type="button"
                  role="radio"
                  aria-checked={on}
                  aria-label={c.label}
                  className={`swatch ${on ? "swatch--on" : ""}`}
                  onClick={() => onChange(c.id)}
                >
                  <span className="swatch__fill" style={{ background: c.hex }}>
                    {on && <Check size={14} strokeWidth={3} color="#fff" />}
                  </span>
                </button>
                <span className="swatch__label">{c.label}</span>
              </div>
            );
          })}
        </div>

        {colors.length > 4 && (
          <button
            type="button"
            className="swatches__next"
            aria-label="More colours"
            onClick={() => listRef.current?.scrollBy({ left: 80, behavior: "smooth" })}
          >
            <ChevronRight size={20} />
          </button>
        )}
      </div>
    </section>
  );
}