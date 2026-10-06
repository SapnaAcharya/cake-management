import { Link, useNavigate, useLocation } from "react-router-dom";
import { Cake, Check, ChevronRight, Heart, ShoppingCart } from "lucide-react";
import "../../styles/template.css";

const STEPS = [
  { label: "Choose Template", path: "/design-by-template" },
  { label: "Customize",       path: "/customize" },
  { label: "Review",          path: "/review" },
  { label: "Checkout",        path: "/checkout" },
];

export default function CustomizeHeader({
  highestStepReached = 1,   // furthest step the user has unlocked so far — pass this down from wherever the order flow state lives, don't rely on the default
  cartCount = 0,
}) {
  const navigate = useNavigate();
  const location = useLocation();

  // derive the active step from the URL instead of a hardcoded prop
  const matchedIndex = STEPS.findIndex((s) => location.pathname.startsWith(s.path));
  const current = matchedIndex === -1 ? 1 : matchedIndex + 1;

  const goToStep = (n) => {
    if (n <= highestStepReached) navigate(STEPS[n - 1].path);
  };

  return (
    <header className="cz-header">
      <Link to="/" className="cz-brand">
        <Cake size={44} strokeWidth={1.4} color="var(--pink-500)" />
        <span className="brand__text">
          <span className="brand__name script">SweetCakes</span>
          <span className="brand__tag">Custom Cakes for Every Celebration</span>
        </span>
      </Link>

      <ol className="cz-steps" aria-label="Order progress">
        {STEPS.map(({ label }, i) => {
          const n = i + 1;
          const state = n < current ? "done" : n === current ? "active" : "todo";
          const reachable = n <= highestStepReached;
          return (
            <li key={label} className="cz-steps__item">
              <button
                type="button"
                className={`cz-step cz-step--${state}`}
                disabled={!reachable}
                aria-current={state === "active" ? "step" : undefined}
                onClick={() => goToStep(n)}
              >
                <span className="cz-step__num">
                  {state === "done" ? <Check size={16} strokeWidth={3} /> : n}
                </span>
                <span className="cz-step__label">{label}</span>
              </button>
              {n < STEPS.length && <ChevronRight className="cz-steps__sep" size={14} />}
            </li>
          );
        })}
      </ol>

      <div className="cz-actions">
        <button
          type="button"
          className="cz-action-pill"
          onClick={() => navigate("/saved-designs")}
        >
          <Heart size={18} />
          <span>Saved Designs</span>
        </button>

        <button
          type="button"
          className="cz-action-pill"
          onClick={() => navigate("/cart")}
        >
          <ShoppingCart size={18} />
          <span>Cart</span>
          {cartCount > 0 && <span className="cz-action-pill__badge">{cartCount}</span>}
        </button>
      </div>
    </header>
  );
}