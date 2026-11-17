import "../styles/CakeSkeleton.css"; // provides the base .skeleton shimmer
import "../styles/CakeDetailsSkeleton.css";

// Skeleton for the "Related Cakes" grid (used while related cakes load)
export function RelatedCakesSkeleton({ count = 4 }) {
    return Array.from({ length: count }).map((_, i) => (
        <div key={i} className="cake-related-card" aria-hidden="true">
            <div className="skeleton cake-related-img" />
            <div className="cake-related-body">
                <div className="skeleton cds-line" style={{ width: "75%" }} />
                <div className="skeleton cds-line short" />
            </div>
        </div>
    ));
}

// Skeleton for the main cake details section
function CakeDetailsSkeleton() {
    return (
        <div aria-hidden="true">
            {/* Breadcrumb */}
            <div className="skeleton cds-breadcrumb" />

            <div className="cake-details-layout">
                {/* Gallery */}
                <div className="cake-details-gallery">
                    <div className="skeleton cds-main-image" />
                    <div className="cds-thumbs">
                        {Array.from({ length: 4 }).map((_, i) => (
                            <div key={i} className="skeleton cds-thumb" />
                        ))}
                    </div>
                </div>

                {/* Info */}
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

            {/* Placeholder for the sections below the fold (reduces layout jump) */}
            <div className="skeleton cds-section" />
        </div>
    );
}

export default CakeDetailsSkeleton;
