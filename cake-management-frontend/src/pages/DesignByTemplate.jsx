import { useState, useMemo, useEffect } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import Header from "../components/customization/TemplateHeader";
import TemplateSidebar from "../components/customization/TemplateSidebar";
import PreviewStage from "../components/customization/PreviewStage";
import TemplateDetails from "../components/customization/TemplateDetails";
import templateService from "../services/CakeTemplateService";
import { mapApiTemplateToViewModel } from "../utils/mapApiTemplate";
import { CATEGORY } from "../data/categories";
import "../styles/template.css";

export default function DesignByTemplate() {
  const navigate = useNavigate();
  const { cakeId } = useParams();
  const location = useLocation();
  const cakeFromState = location.state?.cake;

  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedId, setSelectedId] = useState(null);
  const [pickedColor, setPickedColor] = useState(null);
  const [category, setCategory] = useState(CATEGORY.ALL);
  const [query, setQuery] = useState("");
  const [liked, setLiked] = useState(new Set());

  useEffect(() => {
    let isMounted = true;

    templateService
      .getTemplates()
      .then((data) => {
        if (!isMounted) return;
        const mapped = data.map(mapApiTemplateToViewModel);
        setTemplates(mapped);
        if (mapped.length) setSelectedId(mapped[0].id);
      })
      .catch((err) => {
        if (isMounted) setError(err.message);
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const selected = templates.find((t) => t.id === selectedId) ?? templates[0];

  const colorId = selected
  ? (selected.colors.find((c) => c.id === pickedColor)?.id ?? selected.colors[0]?.id)
  : null;

  const categories = useMemo(() => {
    const unique = Array.from(
      new Set(templates.map((t) => t.category).filter(Boolean))
    );
    return [CATEGORY.ALL, ...unique];
  }, [templates]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return templates.filter((t) => {
      const matchesCategory = category === CATEGORY.ALL || t.category === category;
      const matchesQuery = !q || t.name.toLowerCase().includes(q);
      return matchesCategory && matchesQuery;
    });
  }, [templates, category, query]);

  const toggleLike = (id) =>
    setLiked((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const handleUseTemplate = () =>
    navigate(`/customize/${cakeId}/${selected.id}`, { state: { colorId, cake: cakeFromState } });

  if (loading) {
    return (
      <div className="dbt app">
        <Header />
        <div className="dbt-body">
          <aside className="sidebar">
            <div className="sidebar__head">
              <h1 className="sidebar__title">Choose a Template</h1>
            </div>
            <div className="template-skeleton-grid">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="template-skeleton-card" />
              ))}
            </div>
          </aside>
          <div className="stage" style={{ background: "var(--surface-2)" }} />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dbt app">
        <Header />
        <div className="dbt-error">Couldn't load templates: {error}</div>
      </div>
    );
  }

  if (!selected) {
    return (
      <div className="dbt app">
        <Header />
        <div className="dbt-empty">No templates available.</div>
      </div>
    );
  }

  return (
    <div className="dbt app">
      <Header />

      <div className="dbt-body">
        <TemplateSidebar
          templates={filtered}
          categories={categories}
          selectedId={selectedId}
          category={category}
          query={query}
          liked={liked}
          onCategory={setCategory}
          onQuery={setQuery}
          onSelect={setSelectedId}
          onToggleLike={toggleLike}
        />

        <PreviewStage
          key={selected.id}
          template={selected}
          liked={liked.has(selected.id)}
          onToggleLike={() => toggleLike(selected.id)}
          colorId={colorId}
          onColorChange={setPickedColor}
          onUseTemplate={handleUseTemplate}
        />

         <TemplateDetails
          template={selected}
          colorId={colorId}
          onColorChange={setPickedColor}
          onUseTemplate={handleUseTemplate}
        /> 
      </div>
    </div>
  );
}