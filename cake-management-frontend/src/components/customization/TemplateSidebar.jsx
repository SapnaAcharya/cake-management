import SearchBar from "./SearchBar.jsx";
import CategoryFilters from "./CategoryFilters.jsx";
import TemplateCard from "./TemplateCard.jsx";
import "../../styles/template.css";

export default function TemplateSidebar({
  templates,
  categories,
  selectedId,
  category,
  query,
  liked,
  onCategory,
  onQuery,
  onSelect,
  onToggleLike,
}) {
  return (
    <aside className="sidebar">
      <div className="sidebar__head">
        <h1 className="sidebar__title">Design by Template</h1>
        <p className="sidebar__lead">
          Choose from our ready-made designs and make it your own.
        </p>
        <SearchBar value={query} onChange={onQuery} />
        <CategoryFilters categories={categories} active={category} onChange={onCategory} />
      </div>

      <div className="sidebar__grid" role="list">
        {templates.length === 0 && (
          <p className="sidebar__empty">No templates match your search. Try another name or category.</p>
        )}
        {templates.map((t) => (
          <TemplateCard
            key={t.id}
            template={t}
            selected={t.id === selectedId}
            liked={liked.has(t.id)}
            onSelect={() => onSelect(t.id)}
            onToggleLike={() => onToggleLike(t.id)}
          />
        ))}
      </div>
    </aside>
  );
}
