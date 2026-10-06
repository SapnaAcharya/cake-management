import { useState } from "react";
import { Eye, Maximize2, Heart } from "lucide-react";
import PreviewThumbnails from "./PreviewThumbnails.jsx";
import { stageView } from "../../data/Options";
import { getImageUrl } from "../../utils/imageUrl.js";
import "../../styles/template.css";

export default function PreviewStage({
  template,
  cfg,
  decorations = [],
  liked = false,
  onToggleLike = () => {},
}) {
  const [expanded, setExpanded] = useState(false);
  const [previewIndex, setPreviewIndex] = useState(0);

  // Only computed when cfg is actually provided (e.g. not on the plain
  // Design-by-Template browsing page, which has no customization yet).
  const stage = cfg ? stageView(template, cfg, null, decorations) : null;

  const gallery = stage?.gallery?.length
    ? stage.gallery
    : template.images.gallery?.length
      ? template.images.gallery
      : [template.images.preview];

  // const mainImage = gallery[previewIndex] ?? gallery[0] ?? null;
  const mainImage =
  gallery[previewIndex] ?? gallery[0] ?? null;

const previewImage = mainImage
  ? getImageUrl(mainImage)
  : null;

  return (
    <div className="preview-col">
      <section className={`stage ${expanded ? "stage--expanded" : ""}`} aria-label="Cake preview">
        <div className="stage__image-wrap">
          <img
  className="stage__image"
  src={previewImage}
  alt={`${template.name} preview`}
  style={
    stage
      ? {
          filter: stage.tint,
          transform: `scale(${stage.sizeScale})`,
        }
      : undefined
  }
/>

          {stage?.overlays.map((o) => (
            <img
              key={o.id}
              // src={o.overlay}
              src={getImageUrl(o.overlay)}
              alt=""
              className="stage__overlay"
              style={{
                position: "absolute",
                left: `${o.x}%`,
                top: `${o.y}%`,
                width: `${o.w}%`,
                transform: "translate(-50%, -50%)",
                pointerEvents: "none",
              }}
            />
          ))}

          {stage?.candles.map((c, i) => (
            <img
              key={i}
              src="/images/candle.PNG"
              alt=""
              className="stage__candle"
              style={{
                position: "absolute",
                left: `${c.x}%`,
                top: `${c.y}%`,
                width: "6%",
                pointerEvents: "none",
              }}
            />
          ))}
        </div>

        <div className="stage__badge">
          <span className="stage__badge-icon">
            <Eye size={20} strokeWidth={1.8} />
          </span>
          <p className="stage__badge-title">Live Preview</p>
        </div>

        <div className="stage__tools">
          <button
            type="button"
            className="icon-btn stage__tool"
            aria-label={expanded ? "Exit full view" : "Expand preview"}
            onClick={() => setExpanded((e) => !e)}
          >
            <Maximize2 size={18} strokeWidth={1.8} />
          </button>
          <button
            type="button"
            className="icon-btn stage__tool"
            aria-label={liked ? "Remove from saved" : "Save design"}
            aria-pressed={liked}
            onClick={onToggleLike}
          >
            <Heart
              size={20}
              strokeWidth={1.8}
              color="var(--pink-500)"
              fill={liked ? "var(--pink-500)" : "none"}
            />
          </button>
        </div>

        <PreviewThumbnails
          images={gallery}
          index={previewIndex}
          onIndex={setPreviewIndex}
        />
      </section>
    </div>
  );
}