import { ChevronLeft, ChevronRight } from "lucide-react";
import { getImageUrl } from "../../utils/imageUrl";
import "../../styles/template.css";

export default function PreviewThumbnails({ images = [], index, onIndex, tints = {}, colorId }) {
  const step = (dir) => {
    if (images.length < 2) return;
    onIndex((index + dir + images.length) % images.length);
  };

  return (
    <div className="pv">
      {images.length > 1 && (
        <button type="button" className="pv__arrow" aria-label="Previous view" onClick={() => step(-1)}>
          <ChevronLeft size={18} />
        </button>
      )}

      <div className="pv__thumbs">
        {images.map((src, i) => (
          <button
            key={`${i}-${src}`}
            type="button"
            className={`pv__thumb ${index === i ? "pv__thumb--active" : ""}`}
            aria-label={`View ${i + 1}`}
            aria-pressed={index === i}
            onClick={() => onIndex(i)}
          >
            <img src={getImageUrl(src)} alt="" style={{ filter: tints[colorId] }} />
          </button>
        ))}
      </div>

      {images.length > 1 && (
        <button type="button" className="pv__arrow" aria-label="Next view" onClick={() => step(1)}>
          <ChevronRight size={18} />
        </button>
      )}
    </div>
  );
}