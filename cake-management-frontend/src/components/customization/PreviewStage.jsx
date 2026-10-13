import { useState, useEffect } from "react";
import { Eye, Maximize2, Minimize2, Heart } from "lucide-react";
import PreviewThumbnails from "./PreviewThumbnails.jsx";
import { stageView } from "../../data/Options";
import { getImageUrl } from "../../utils/imageUrl.js";
import "../../styles/template.css";

export default function PreviewStage({
  template,
  cfg,
  colorId,
  decorations = [],
  liked = false,
  onToggleLike = () => {},
}) {
  const [expanded, setExpanded] = useState(false);
  const [previewIndex, setPreviewIndex] = useState(0);
  const [loadedImage, setLoadedImage] = useState(null);

  // Only computed when cfg is provided (not on the plain browsing page).
  const stage = cfg ? stageView(template, cfg, null, decorations) : null;
  
  // Color picked in the details panel (works without cfg)
const pickedColor = template.colors?.find((c) => c.id === colorId);
const tint = stage?.tint ?? pickedColor?.tint ?? pickedColor?.filter;

  const gallery = stage?.gallery?.length
    ? stage.gallery
    : template.images.gallery?.length
      ? template.images.gallery
      : [template.images.preview];

  const mainImage = gallery[previewIndex] ?? gallery[0] ?? null;
  const previewImage = mainImage ? getImageUrl(mainImage) : null;

  const loaded = Boolean(previewImage) && loadedImage === previewImage;

  // Close full view with Esc
  useEffect(() => {
    if (!expanded) return;
    const onKey = (e) => e.key === "Escape" && setExpanded(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [expanded]);

  return (
    <div className="preview-col">
      <section
        className={`ps ${expanded ? "ps--expanded" : ""}`}
        aria-label="Cake preview"
      >
        {/* 1. Toolbar */}
        <header className="ps__toolbar">
          <div className="ps__badge">
            <Eye size={18} strokeWidth={1.8} />
            <span>Live Preview</span>
          </div>

          <div className="ps__tools">
            <button
              type="button"
              className="ps__tool"
              aria-label={expanded ? "Exit full view" : "Expand preview"}
              onClick={() => setExpanded((e) => !e)}
            >
              {expanded ? (
                <Minimize2 size={18} strokeWidth={1.8} />
              ) : (
                <Maximize2 size={18} strokeWidth={1.8} />
              )}
            </button>
            <button
              type="button"
              className="ps__tool"
              aria-label={liked ? "Remove from saved" : "Save design"}
              aria-pressed={liked}
              onClick={onToggleLike}
            >
              <Heart
                size={18}
                strokeWidth={1.8}
                color="var(--pink-500)"
                fill={liked ? "var(--pink-500)" : "none"}
              />
            </button>
          </div>
        </header>

        {/* 2. Image area */}
        <div className="ps__stage">
          <div className={`ps__canvas ${loaded ? "is-loaded" : ""}`}>
            {previewImage && (
              <img
                className="ps__image"
                src={previewImage}
                alt={`${template.name} preview`}
                onLoad={() => setLoadedImage(previewImage)}
                style={{
                        filter: tint,
                        transform: stage ? `scale(${stage.sizeScale})` : undefined,
                }}
              />
            )}

            {stage?.overlays.map((o) => (
              <img
                key={o.id}
                src={getImageUrl(o.overlay)}
                alt=""
                className="stage__overlay ps__overlay"
                style={{
                  left: `${o.x}%`,
                  top: `${o.y}%`,
                  width: `${o.w}%`,
                }}
              />
            ))}

            {stage?.candles.map((c, i) => (
              <img
                key={i}
                src="/images/candle.PNG"
                alt=""
                className="ps__overlay"
                style={{ left: `${c.x}%`, top: `${c.y}%`, width: "6%" }}
              />
            ))}
          </div>
        </div>

        {/* 3. Thumbnails: always rendered */}
        <div className="ps__footer">
          <PreviewThumbnails
            images={gallery}
            index={previewIndex}
            onIndex={setPreviewIndex}
          />
        </div>
      </section>

      {expanded && (
        <button
          type="button"
          className="ps__backdrop"
          aria-label="Close full view"
          onClick={() => setExpanded(false)}
        />
      )}
    </div>
  );
}
