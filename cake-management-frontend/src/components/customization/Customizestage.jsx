import { useEffect, useMemo, useRef, useState } from "react";
import {
  ChevronLeft, ChevronRight, Check, Eye, Heart, Maximize2,
  RotateCcw, RotateCw, ZoomIn, ZoomOut,
} from "lucide-react";
import { stageView } from "../../data/Options";
import TierCake from "./TierCake";
import { getImageUrl } from "../../utils/imageUrl";

const ZOOM_STEP = 0.25;
const ZOOM_MAX = 2;

export default function CustomizeStage({ template, cfg, baseline, decorations }) {
  const [index, setIndex] = useState(0);
  const [zoom, setZoom] = useState(1);
  const [liked, setLiked] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const trackRef = useRef(null);

  // Everything visual comes from the current selections
  const view = useMemo(() => stageView(template, cfg, baseline, decorations), [template, cfg, baseline, decorations]);
  const { gallery, tint, sizeScale, useDrawnCake } = view;

  // Reset to the first photo when the set of photos changes.
  // Done during render (not in an effect), so there is no extra flash or render.
  const galleryKey = gallery.join("|");
  const [prevGalleryKey, setPrevGalleryKey] = useState(galleryKey);
  if (prevGalleryKey !== galleryKey) {
    setPrevGalleryKey(galleryKey);
    setIndex(0);
  }

  const step = (dir) => setIndex((i) => (i + dir + gallery.length) % gallery.length);
  const zoomBy = (delta) =>
    setZoom((z) => Math.min(ZOOM_MAX, Math.max(1, +(z + delta).toFixed(2))));
  const reset = () => {
    setZoom(1);
    setIndex(0);
  };

  const safeIndex = Math.max(0, Math.min(index, gallery.length - 1));
  const image = gallery[safeIndex];
  const previewImage = image ? getImageUrl(image) : null;

  // Whenever the selection changes (arrow click, thumb click, reset…),
  // scroll the active thumbnail fully into view instead of leaving it
  // clipped at the edge of the strip.
  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    const active = track.querySelector(".cz-thumb--on");
    active?.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
  }, [safeIndex, useDrawnCake]);

  return (
    <section className={`cz-stage ${expanded ? "cz-stage--expanded" : ""}`} aria-label="Cake preview">
      {/* Canvas: cake + overlays zoom together so decorations stay on the cake */}
      <div className="cz-stage__canvas" style={{ transform: `scale(${zoom * (useDrawnCake ? 1 : sizeScale)})` }}>
        {useDrawnCake ? (
          /* Tier, frosting, sponge or colour changed → drawn cake */
          <TierCake cfg={cfg} fontFamily={view.fontFamily} colorHex={cfg.colorHex} decorations={decorations} />
        ) : (
          <>
            {image && (
              <img
                key={image}
                className="cz-stage__img"
                src={previewImage}
                alt={`${template.name} preview`}
                style={{ filter: tint }}
              />
            )}

            {/* Overlays only line up on the main angle */}
            {safeIndex === 0 && (
              <div className="cz-overlays" aria-hidden="true">
                {view.overlays.map((d) => (
                  <img
                    key={d.id}
                    className="cz-overlay"
                    src={getImageUrl(d.overlay)}
                    alt=""
                    style={{ left: `${d.x}%`, top: `${d.y}%`, width: `${d.w}%` }}
                  />
                ))}

                {view.candles.map((c, i) => (
                  <span
                    key={i}
                    className={`cz-candle ${cfg.lit ? "cz-candle--lit" : ""}`}
                    style={{ left: `${c.x}%`, top: `${c.y}%` }}
                  />
                ))}

                {cfg.message && (
                  <p className="cz-message" style={{ fontFamily: view.fontFamily }}>
                    {cfg.message}
                  </p>
                )}
              </div>
            )}
          </>
        )}
      </div>

      {/* Live preview badge */}
      <div className="cz-glass cz-badge-live">
        <Eye size={22} strokeWidth={1.8} />
        <div>
          <p className="cz-badge-live__title">
            Live Preview <span className="cz-live-dot" aria-hidden="true" />
          </p>
          <p className="cz-badge-live__sub">See your cake in real time</p>
        </div>
      </div>

      {/* Shown alongside the illustration when the chosen tiers have no real photo */}
      {view.tierNote && <div className="cz-glass cz-illus">{view.tierNote}</div>}

      {/* Top-right tools */}
      <div className="cz-stage__tools">
        <button
          type="button"
          className="cz-round"
          aria-label={liked ? "Remove from saved" : "Save design"}
          aria-pressed={liked}
          onClick={() => setLiked((v) => !v)}
        >
          <Heart size={20} strokeWidth={1.8} color="var(--pink-500)" fill={liked ? "var(--pink-500)" : "none"} />
        </button>
        <button
          type="button"
          className="cz-round"
          aria-label={expanded ? "Exit full view" : "Expand preview"}
          onClick={() => setExpanded((v) => !v)}
        >
          <Maximize2 size={18} strokeWidth={1.8} />
        </button>
        <button type="button" className="cz-round" aria-label="Reset view" onClick={reset}>
          <RotateCcw size={18} strokeWidth={1.8} />
        </button>
      </div>

      {/* Bottom bar: zoom controls + thumbnails */}
      <div className="cz-stage__bar">
        <div className="cz-glass cz-zoom">
          <button type="button" onClick={() => zoomBy(-ZOOM_STEP)} disabled={zoom <= 1}>
            <ZoomOut size={18} strokeWidth={1.8} /> Zoom Out
          </button>
          <button type="button" onClick={() => zoomBy(ZOOM_STEP)} disabled={zoom >= ZOOM_MAX}>
            <ZoomIn size={18} strokeWidth={1.8} /> Zoom In
          </button>
          {/* Steps through the photos for now; swap for a real 360° viewer later */}
          <button
            type="button"
            onClick={() => step(1)}
            disabled={useDrawnCake || gallery.length < 2}
            title={
              useDrawnCake
                ? "360° is available for the original template photos"
                : "Rotate view"
            }
          >
            <RotateCw size={22} strokeWidth={1.6} /> 360°
          </button>
        </div>

        {/* Photo thumbnails only make sense while a photo is showing */}
        {!useDrawnCake && (
          <div className="cz-glass cz-thumbs">
            {gallery.length > 1 && (
              <button
                type="button"
                className="cz-thumbs__arrow"
                aria-label="Previous photo"
                onClick={() => step(-1)}
              >
                <ChevronLeft size={18} />
              </button>
            )}

            {/* Scrollable track — arrows above stay fixed, only this scrolls */}
            <div className="cz-thumbs__track" ref={trackRef}>
              {gallery.map((src, i) => (
                <button
                  key={`${i}-${src}`}
                  type="button"
                  className={`cz-thumb ${i === safeIndex ? "cz-thumb--on" : ""}`}
                  aria-label={`View ${i + 1}`}
                  aria-pressed={i === safeIndex}
                  onClick={() => setIndex(i)}
                >
                  <span className="cz-thumb__frame">
                    {/* <img src={src} alt="" style={{ filter: tint }} /> */}
                  <img
    src={getImageUrl(src)}
    alt=""
    style={{ filter: tint }}
/>
                  </span>
                  {i === safeIndex && (
                    <span className="cz-thumb__badge" aria-hidden="true">
                      <Check size={11} strokeWidth={3} />
                    </span>
                  )}
                </button>
              ))}
            </div>

            {gallery.length > 1 && (
              <button
                type="button"
                className="cz-thumbs__arrow"
                aria-label="Next photo"
                onClick={() => step(1)}
              >
                <ChevronRight size={18} />
              </button>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
