import { Heart, User, ShoppingCart } from "lucide-react";
import { LogoMark } from "./Icons.jsx";
import StepIndicator from "./StepIndicator.jsx";
import "../../styles/template.css";

export default function Header({ step, cartCount, savedCount }) {
  return (
    <header className="header">
      <a className="brand" href="/" aria-label="SweetCakes home">
        <LogoMark />
        <div className="brand__text">
          <span className="brand__name script">SweetCakes</span>
          <span className="brand__tag">Cake Design Templates</span>
        </div>
      </a>

      <StepIndicator current={step} />

      <div className="header__actions">
        <button className="saved-btn" type="button">
          <Heart size={22} strokeWidth={1.8} color="var(--pink-500)" />
          <span>Saved{savedCount > 0 ? ` (${savedCount})` : ""}</span>
        </button>
        <button className="icon-btn" type="button" aria-label="Account">
          <User size={22} strokeWidth={1.8} />
        </button>
        <button className="icon-btn" type="button" aria-label={`Cart, ${cartCount} items`}>
          <ShoppingCart size={22} strokeWidth={1.8} />
          {cartCount > 0 && <span className="badge">{cartCount}</span>}
        </button>
      </div>
    </header>
  );
}
