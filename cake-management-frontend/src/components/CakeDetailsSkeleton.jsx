import "../styles/CakeSkeleton.css";
import "../styles/CakeDetailsSkeleton.css";

export function RelatedCakesSkeleton({ count = 4 }) {
  return Array.from({ length: count }).map((_, i) => (
    <div key={i} className="cake-related-card cds-related-card" aria-hidden="true">
      <div className="skeleton cake-related-img cds-related-img" />
      <div className="cake-related-body">
        <div className="skeleton cds-related-title" />
        <div className="skeleton cds-related-price" />
      </div>
    </div>
  ));
}

function CakeDetailsSkeleton() {
  return (
    <div className="cake-details-skeleton" role="status" aria-label="Loading cake details">
      <div aria-hidden="true">
        <div className="skeleton cds-breadcrumb" />

        <div className="cake-details-layout">
          <div className="cake-details-gallery">
            <div className="skeleton cds-main-image" />
            <div className="cds-thumbs">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="skeleton cds-thumb" />
              ))}
            </div>
          </div>

          <div className="cake-details-info">
            <div className="skeleton cds-category" />
            <div className="skeleton cds-title" />
            <div className="skeleton cds-rating" />
            <div className="skeleton cds-price" />

            <div className="cds-description">
              <div className="skeleton cds-line" />
              <div className="skeleton cds-line" />
              <div className="skeleton cds-line short" />
            </div>

            <div className="cds-badges">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="skeleton cds-badge" />
              ))}
            </div>

            <div className="skeleton cds-order-box" />

            <div className="cds-actions">
              <div className="skeleton cds-qty" />
              <div className="skeleton cds-btn" />
            </div>
            <div className="skeleton cds-btn full" />
          </div>
        </div>

        <section className="cds-specs">
          <div className="skeleton cds-specs-title" />
          <div className="skeleton cds-specs-box" />
        </section>
      </div>
    </div>
  );
}

export default CakeDetailsSkeleton;
