// import { COLORS } from "../../data/colors";
import { FLAVORS, candlePositions } from "../../data/Options";
import { getImageUrl } from "../../utils/imageUrl";

const tierHeight = (n) => (n <= 2 ? 84 : n === 3 ? 72 : 60);
// i = 0 is the top tier (narrowest)
const tierWidth = (i, n) => (n === 1 ? 240 : 150 + (i * 100) / (n - 1));

// How many small decoration icons trail along one tier's bottom seam.
// Cycling through the picked decorations keeps every tier dressed even
// when the customer only picked one or two decoration types.
const TRIM_COUNT = 5;
// export const MAX_CANDLES = 12; // pick whatever cap makes sense for your candle picker UI

export default function TierCake({ cfg, fontFamily, colorHex, decorations = []}) {
  const n = cfg.tier;
  // const frosting = COLORS[cfg.colorId]?.hex ?? "#f4a6c0";
  const frosting = colorHex ?? "#f4a6c0";
  const sponge = FLAVORS.find((f) => f.id === cfg.flavor)?.dot ?? "#f4dfa8";
  // const decos = decorations
  //   .filter((d) => cfg.decorations.includes(d.id))
  //   .map((d) => ({ ...d, overlay: `${API_ORIGIN}${d.imageUrl}` }));
  const decos = decorations
  .filter((d) => cfg.decorations.includes(d.id))
  .map((d) => ({
    ...d,
    overlay: getImageUrl(d.imageUrl),
  }));
  const candles = candlePositions(cfg.candles);

  const trimIcons = (tierIndex) =>
    decos.length
      ? Array.from({ length: TRIM_COUNT }, (_, k) => decos[(tierIndex + k) % decos.length])
      : [];

  return (
    <div className="cz-tc" aria-hidden="true">
      <div className="cz-tc__stack">
        {Array.from({ length: n }).map((_, i) => {
          const isTop = i === 0;
          const isBottom = i === n - 1;
          const trim = trimIcons(i);

          return (
            <div
              key={i}
              className="cz-tc__tier"
              style={{
                width: tierWidth(i, n),
                height: tierHeight(n),
                "--frosting": frosting,
                "--sponge": sponge,
              }}
            >
              {/* clipped visuals live here */}
              <div className="cz-tc__body" />

              {/* NOT clipped: candles sit above the top tier's surface */}
              {isTop && (
                <div className="cz-tc__topside">
                  {candles.map((c, k) => (
                    <span
                      key={k}
                      className={`cz-candle ${cfg.lit ? "cz-candle--lit" : ""}`}
                      style={{
                        left: `${candles.length === 1 ? 50 : 15 + (k * 70) / (candles.length - 1)}%`,
                      }}
                    />
                  ))}
                  {decos.map((d, k) => (
                    <img
                      key={d.id}
                      className="cz-tc__deco"
                      src={d.overlay}
                      alt=""
                      style={{
                        left: `${decos.length === 1 ? 50 : 18 + (k * 64) / (decos.length - 1)}%`,
                      }}
                    />
                  ))}
                </div>
              )}

              {/* NOT clipped: decorations trail along the seam of every tier,
                  so a flower/decoration pick reads as wrapping the whole
                  cake instead of only sitting on top. */}
              {trim.length > 0 && (
                <div className="cz-tc__trim">
                  {trim.map((d, k) => (
                    <img
                      key={`${d.id}-${k}`}
                      className="cz-tc__deco cz-tc__deco--trim"
                      src={d.overlay}
                      alt=""
                      style={{
                        left: `${trim.length === 1 ? 50 : (k * 100) / (trim.length - 1)}%`,
                      }}
                    />
                  ))}
                </div>
              )}

              {isBottom && cfg.message && (
                <p className="cz-tc__msg" style={{ fontFamily }}>{cfg.message}</p>
              )}
            </div>
          );
        })}
      </div>
      <div className="cz-tc__plate" />
    </div>
  );
}


