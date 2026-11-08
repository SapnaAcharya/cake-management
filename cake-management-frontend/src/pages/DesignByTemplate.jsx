import { useState, useMemo, useEffect } from "react";
import {
  useNavigate,
  useParams,
  useLocation,
  useSearchParams,            // NEW
} from "react-router-dom";
import Header from "../components/customization/TemplateHeader";
import TemplateSidebar from "../components/customization/TemplateSidebar";
import PreviewStage from "../components/customization/PreviewStage";
import TemplateDetails from "../components/customization/TemplateDetails";
import templateService from "../services/CakeTemplateService";
import { mapApiTemplateToViewModel } from "../utils/mapApiTemplate";
import { CATEGORY } from "../data/categories";
import "../styles/template.css";
import "../styles/templateresponsive.css";

export default function DesignByTemplate() {
  const navigate = useNavigate();
  const { cakeSlug } = useParams();
  const location = useLocation();
  const cakeFromState = location.state?.cake;

  // NEW: read the template from the query string
  const [searchParams, setSearchParams] = useSearchParams();
  const slugParam = searchParams.get("template");
  const legacyId = searchParams.get("templateId");

  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedId, setSelectedId] = useState(null);
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

        // CHANGED: select the template from the URL, else the first one
        const fromUrl = slugParam
          ? mapped.find((t) => t.slug === slugParam)
          : legacyId
          ? mapped.find((t) => String(t.id) === legacyId)
          : null;

        const initial = fromUrl ?? mapped[0];
        if (initial) setSelectedId(initial.id);

        // NEW: turn old ?templateId=8 links into ?template=birthday-cake
        if (fromUrl && legacyId && !slugParam && fromUrl.slug) {
          setSearchParams(
            { template: fromUrl.slug },
            { replace: true, state: location.state }
          );
        }
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const selected = templates.find((t) => t.id === selectedId) ?? templates[0];

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

  // NEW: keep the URL in sync when a template is clicked in the sidebar
  const handleSelect = (id) => {
    setSelectedId(id);
    const t = templates.find((x) => x.id === id);
    if (t?.slug) {
      setSearchParams(
        { template: t.slug },
        { replace: true, state: location.state }
      );
    }
  };

  // const handleUseTemplate = () =>
  //   navigate(`/customize/${cakeSlug}/${selected.id}`, {
  //     state: { cake: cakeFromState },
  //   });

  const handleUseTemplate = () => {
  const templatePart = selected.slug || selected.id;
  const search = cakeSlug ? `?cake=${cakeSlug}` : "";

  navigate(
    { pathname: `/customize/${templatePart}`, search },
    { state: { cake: cakeFromState } }
  );
};

  if (loading) {
    return (
      <div className="dbt app">
        <Header />
        <div className="dbt-body">
          <aside className="sidebar">
            <div className="sidebar__head">
              <h1 className="sidebar__title">Design by Template</h1>
              <p className="sidebar__lead">
                Choose from our ready-made designs and make it your own.
              </p>
            </div>
            <div className="template-skeleton-grid" aria-hidden="true">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="template-skeleton-card" />
              ))}
            </div>
          </aside>

          <div className="preview-col">
            <div
              className="ps ps--skeleton"
              style={{ background: "var(--surface-2)" }}
              aria-hidden="true"
            />
          </div>

          <aside className="details details--skeleton" aria-hidden="true" />
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
      <Header
        leftTitle="Design by Template"
        rightTitle={
          <>
            {selected.name}
            {selected.popular && <span className="details__pill">Popular</span>}
          </>
        }
      />

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
          onSelect={handleSelect}          // CHANGED (was setSelectedId)
          onToggleLike={toggleLike}
        />

        <PreviewStage
          key={selected.id}
          template={selected}
          liked={liked.has(selected.id)}
          onToggleLike={() => toggleLike(selected.id)}
        />

        <TemplateDetails
          template={selected}
          onUseTemplate={handleUseTemplate}
        />
      </div>
    </div>
  );
}