import { useState } from "react";
import { ChevronDown } from "lucide-react";
import "../../styles/template.css";

const MAX_INLINE = 4; // how many chips show before overflowing into "More"

export default function CategoryFilters({ categories = [], active, onChange }) {
  const [open, setOpen] = useState(false);

  const inline = categories.slice(0, MAX_INLINE);
  const overflow = categories.slice(MAX_INLINE);
  const moreActive = overflow.includes(active);

  return (
    <div className="chips" role="tablist" aria-label="Template categories">
      {inline.map((c) => (
        <button
          key={c}
          type="button"
          role="tab"
          aria-selected={active === c}
          className={`chip ${active === c ? "chip--active" : ""}`}
          onClick={() => onChange(c)}
        >
          {c}
        </button>
      ))}

      {overflow.length > 0 && (
        <div className="chip-more">
          <button
            type="button"
            className={`chip chip--more ${moreActive ? "chip--active" : ""}`}
            aria-haspopup="menu"
            aria-expanded={open}
            onClick={() => setOpen((o) => !o)}
          >
            More <ChevronDown size={14} />
          </button>
          {open && (
            <ul className="chip-menu" role="menu">
              {overflow.map((c) => (
                <li key={c} role="none">
                  <button
                    role="menuitem"
                    type="button"
                    onClick={() => {
                      onChange(c);
                      setOpen(false);
                    }}
                  >
                    {c}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}