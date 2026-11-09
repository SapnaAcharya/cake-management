import { useEffect, useMemo, useRef, useState } from "react";
import {
  ChevronLeft, ChevronRight, Check, Eye, Heart, Maximize2,
  Move, RotateCcw, RotateCw, ZoomIn, ZoomOut,
} from "lucide-react";
import { stageView } from "../../data/Options";
import TierCake from "./TierCake";
import { getImageUrl } from "../../utils/imageUrl";

const ZOOM_STEP = 0.25;
const ZOOM_MAX = 2;

// keeps the dragged message from leaving the cake area (percent of the preview box)
const MSG_MIN = 8;
const MSG_MAX = 92;

// how small / large the message can be made (1 = default size)
const SCALE_MIN = 0.5;
const SCALE_MAX = 3;
const SCALE_STEP = 0.1; // used by the + / - keys

const clamp = (n, min, max) => Math.min(max, Math.max(min, n));

// light colors get a dark shadow, dark colors get a light one, so the text stays readable on the photo
const isLight = (hex = "#ffffff") => {
  const n = parseInt(hex.replace("#", ""), 16);
  const lum = 0.299 * (n >> 16) + 0.587 * ((n >> 8) & 255) + 0.114 * (n & 255);
  return lum > 150;
};

export default function CustomizeStage({ template, cfg, baseline, decorations, onChange }) {
  const [index, setIndex] = useState(0);
  const [zoom, setZoom] = useState(1);
  const [liked, setLiked] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const trackRef = useRef(null);

  // --- message dragging ---
  const overlaysRef = useRef(null); // the box the message moves inside
  const grab = useRef(null);        // where inside the text the pointer grabbed it
  const resizing = useRef(null);    // centre + start size while the corner handle is dragged
  const [draggingMsg, setDraggingMsg] = useState(false);
  const [resizingMsg, setResizingMsg] = useState(false);
  const [msgSelected, setMsgSelected] = useState(false); // NEW (isSelected moved further down)

  // Everything visual comes from the current selections
  const view = useMemo(() => stageView(template, cfg, baseline, decorations), [template, cfg, baseline, decorations]);
  const { gallery, tint, sizeScale, useDrawnCake } = view;

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

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    const active = track.querySelector(".cz-thumb--on");
    active?.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
  }, [safeIndex, useDrawnCake]);

  // ---------- message drag handlers ----------
  const onMsgDown = (e) => {
    setMsgSelected(true); // NEW: clicking the text selects it
    const el = e.currentTarget.getBoundingClientRect();
    grab.current = {
      dx: e.clientX - (el.left + el.width / 2),
      dy: e.clientY - (el.top + el.height / 2),
    };
    e.currentTarget.setPointerCapture(e.pointerId);
    setDraggingMsg(true);
  };

  const onMsgMove = (e) => {
    if (!grab.current || !overlaysRef.current) return;
    const box = overlaysRef.current.getBoundingClientRect();
    const x = ((e.clientX - grab.current.dx - box.left) / box.width) * 100;
    const y = ((e.clientY - grab.current.dy - box.top) / box.height) * 100;
    onChange?.({
      messageX: clamp(x, MSG_MIN, MSG_MAX),
      messageY: clamp(y, MSG_MIN, MSG_MAX),
    });
  };

  const onMsgUp = () => {
    grab.current = null;
    setDraggingMsg(false);
  };

  const onMsgKey = (e) => {
    // NEW: Escape deselects (blur triggers onBlur, which hides the pin)
    if (e.key === "Escape") {
      e.currentTarget.blur();
      return;
    }

    // + / - keys resize the message
    if (["+", "=", "-", "_"].includes(e.key)) {
      e.preventDefault();
      const dir = e.key === "-" || e.key === "_" ? -1 : 1;
      const base = messageMoved ? {} : currentCenterPct(e.currentTarget);
      onChange?.({
        ...base,
        messageScale: clamp(+((cfg.messageScale ?? 1) + dir * SCALE_STEP).toFixed(2), SCALE_MIN, SCALE_MAX),
      });
      return;
    }

    const nudge = { ArrowLeft: [-2, 0], ArrowRight: [2, 0], ArrowUp: [0, -2], ArrowDown: [0, 2] }[e.key];
    if (!nudge) return;
    e.preventDefault();

    // NEW: start from where the text really is, not from 50%
    const base = messageMoved
      ? { messageX: cfg.messageX, messageY: cfg.messageY }
      : currentCenterPct(e.currentTarget);

    onChange?.({
      messageX: clamp(base.messageX + nudge[0], MSG_MIN, MSG_MAX),
      messageY: clamp(base.messageY + nudge[1], MSG_MIN, MSG_MAX),
    });
  };

  const currentCenterPct = (el) => {
    const box = overlaysRef.current.getBoundingClientRect();
    const r = el.getBoundingClientRect();
    return {
      messageX: clamp(((r.left + r.width / 2 - box.left) / box.width) * 100, MSG_MIN, MSG_MAX),
      messageY: clamp(((r.top + r.height / 2 - box.top) / box.height) * 100, MSG_MIN, MSG_MAX),
    };
  };

  // ---------- message resize handlers (corner handle) ----------
  const onResizeDown = (e) => {
    e.stopPropagation();
    if (!overlaysRef.current) return;
    const msgEl = e.currentTarget.parentElement;
    const r = msgEl.getBoundingClientRect();
    const cx = r.left + r.width / 2;
    const cy = r.top + r.height / 2;
    resizing.current = {
      cx,
      cy,
      startDist: Math.hypot(e.clientX - cx, e.clientY - cy) || 1,
      startScale: cfg.messageScale ?? 1,
    };
    if (!messageMoved) onChange?.(currentCenterPct(msgEl));
    e.currentTarget.setPointerCapture(e.pointerId);
    setResizingMsg(true);
  };

  const onResizeMove = (e) => {
    const s = resizing.current;
    if (!s) return;
    const dist = Math.hypot(e.clientX - s.cx, e.clientY - s.cy);
    onChange?.({
      messageScale: clamp(+((s.startScale * dist) / s.startDist).toFixed(2), SCALE_MIN, SCALE_MAX),
    });
  };

  const onResizeUp = () => {
    resizing.current = null;
    setResizingMsg(false);
  };

  const resetMessagePosition = () =>
    onChange?.({ messageX: null, messageY: null, messageScale: 1 });

  const messageColor = cfg.messageColor ?? cfg.textColor ?? "#ffffff";
  const messageMoved = cfg.messageX != null && cfg.messageY != null;
  const messageScale = cfg.messageScale ?? 1;
  const messageChanged = messageMoved || messageScale !== 1;
  const showMessage = Boolean(cfg.message) && !useDrawnCake && safeIndex === 0;

  // NEW: must come AFTER showMessage is defined
  const isSelected = msgSelected && showMessage;

  return (
    <section className={`cz-stage ${expanded ? "cz-stage--expanded" : ""}`} aria-label="Cake preview">
      <div className="cz-stage__canvas" style={{ transform: `scale(${zoom * (useDrawnCake ? 1 : sizeScale)})` }}>
        {useDrawnCake ? (
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

            {safeIndex === 0 && (
              <div className="cz-overlays" ref={overlaysRef}>
                {view.overlays.map((d) => (
                  <img
                    key={d.id}
                    className="cz-overlay"
                    src={getImageUrl(d.overlay)}
                    alt=""
                    aria-hidden="true"
                    style={{ left: `${d.x}%`, top: `${d.y}%`, width: `${d.w}%` }}
                  />
                ))}

                {view.candles.map((c, i) => (
                  <span
                    key={i}
                    aria-hidden="true"
                    className={`cz-candle ${cfg.lit ? "cz-candle--lit" : ""}`}
                    style={{ left: `${c.x}%`, top: `${c.y}%` }}
                  />
                ))}

                {cfg.message && (
                  <p
                    className={`cz-message ${isSelected ? "cz-message--selected" : ""} ${draggingMsg ? "cz-message--dragging" : ""} ${resizingMsg ? "cz-message--resizing" : ""}`}
                    tabIndex={0}
                    role="group"
                    aria-label="Cake message. Drag or use the arrow keys to move it. Drag the corner handle or use plus and minus to resize it."
                    onFocus={() => setMsgSelected(true)} // NEW
                    onBlur={(e) => {                     // NEW
                      if (!e.currentTarget.contains(e.relatedTarget)) setMsgSelected(false);
                    }}
                    onPointerDown={onMsgDown}
                    onPointerMove={onMsgMove}
                    onPointerUp={onMsgUp}
                    onPointerCancel={onMsgUp}
                    onKeyDown={onMsgKey}
                    style={{
                      fontFamily: view.fontFamily,
                      color: messageColor,
                      textShadow: isLight(messageColor)
                        ? "0 1px 3px rgba(0,0,0,.55)"
                        : "0 1px 3px rgba(255,255,255,.65)",
                      ...(messageMoved && {
                        left: `${cfg.messageX}%`,
                        top: `${cfg.messageY}%`,
                        transform: `translate(-50%, -50%) scale(${messageScale})`,
                      }),
                    }}
                  >
                    {cfg.message}

                    {/* NEW: the pin only exists while the message is selected */}
                    {isSelected && (
                      <span
                        className="cz-message__handle"
                        role="presentation"
                        onPointerDown={onResizeDown}
                        onPointerMove={onResizeMove}
                        onPointerUp={onResizeUp}
                        onPointerCancel={onResizeUp}
                      />
                    )}
                  </p>
                )}
              </div>
            )}
          </>
        )}
      </div>

      <div className="cz-glass cz-badge-live">
        <Eye size={22} strokeWidth={1.8} />
        <div>
          <p className="cz-badge-live__title">
            Live Preview <span className="cz-live-dot" aria-hidden="true" />
          </p>
          <p className="cz-badge-live__sub">See your cake in real time</p>
        </div>
      </div>

      {view.tierNote && <div className="cz-glass cz-illus">{view.tierNote}</div>}

      <p className="cz-glass cz-note">
        Flavour and frosting are confirmed with your order.
      </p>

      {/* NEW: hint only while the message is selected */}
      {isSelected && (
        <p className="cz-glass cz-drag-hint">
          <Move size={14} strokeWidth={1.8} aria-hidden="true" /> Drag to move, pull the corner to resize
        </p>
      )}

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
        {showMessage && messageChanged && (
          <button
            type="button"
            className="cz-round"
            aria-label="Reset message position and size"
            title="Reset message position and size"
            onClick={resetMessagePosition}
          >
            <Move size={18} strokeWidth={1.8} />
          </button>
        )}
      </div>

      <div className="cz-stage__bar">
        <div className="cz-glass cz-zoom">
          <button type="button" onClick={() => zoomBy(-ZOOM_STEP)} disabled={zoom <= 1}>
            <ZoomOut size={18} strokeWidth={1.8} /> Zoom Out
          </button>
          <button type="button" onClick={() => zoomBy(ZOOM_STEP)} disabled={zoom >= ZOOM_MAX}>
            <ZoomIn size={18} strokeWidth={1.8} /> Zoom In
          </button>
          <button
            type="button"
            onClick={() => step(1)}
            disabled={useDrawnCake || gallery.length < 2}
            title={useDrawnCake ? "360° is available for the original template photos" : "Rotate view"}
          >
            <RotateCw size={22} strokeWidth={1.6} /> 360°
          </button>
        </div>

        {!useDrawnCake && (
          <div className="cz-glass cz-thumbs">
            {gallery.length > 1 && (
              <button type="button" className="cz-thumbs__arrow" aria-label="Previous photo" onClick={() => step(-1)}>
                <ChevronLeft size={18} />
              </button>
            )}

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
                    <img src={getImageUrl(src)} alt="" style={{ filter: tint }} />
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
              <button type="button" className="cz-thumbs__arrow" aria-label="Next photo" onClick={() => step(1)}>
                <ChevronRight size={18} />
              </button>
            )}
          </div>
        )}
      </div>
    </section>
  );
}