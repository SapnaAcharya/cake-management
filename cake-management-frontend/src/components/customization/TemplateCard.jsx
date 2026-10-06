import { Heart, Check } from "lucide-react";
import { getImageUrl } from "../../utils/imageUrl";
import "../../styles/template.css";

export default function TemplateCard({ template, selected, liked, onSelect, onToggleLike }) {
  const { name, category, images, popular } = template;

  const handleKeyDown = (e) => {
    if (e.target !== e.currentTarget) return;
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onSelect();
    }
  };

  return (
    <article
      className={`card ${selected ? "card--selected" : ""}`}
      role="listitem"
      tabIndex={0}
      aria-current={selected}
      onClick={onSelect}
      onKeyDown={handleKeyDown}
    >
      <div className="card__media">
        <img src={getImageUrl(images?.thumb)} alt={name} loading="lazy" />
        {popular && <span className="card__popular">Popular</span>}

        {selected ? (
          <span className="card__check" aria-hidden="true">
            <Check size={14} strokeWidth={3} />
          </span>
        ) : (
          <button
            type="button"
            className={`card__like ${liked ? "card__like--on" : ""}`}
            aria-label={liked ? `Remove ${name} from saved` : `Save ${name}`}
            aria-pressed={liked}
            onClick={(e) => {
              e.stopPropagation();
              onToggleLike();
            }}
          >
            <Heart size={16} strokeWidth={1.8} fill={liked ? "currentColor" : "none"} />
          </button>
        )}
      </div>

      <h3 className="card__name">{name}</h3>
      <p className="card__cat">{category}</p>
    </article>
  );
}