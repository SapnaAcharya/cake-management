
function FeaturedTemplateSkeleton() {
    return (
        <>
            {Array.from({ length: 4 }).map((_, index) => (
                <div
                    key={index}
                    className="template-skeleton-card"
                    aria-hidden="true"
                >
                    <div className="template-skeleton-image" />
                    <div className="template-skeleton-title" />
                </div>
            ))}
        </>
    );
}

export default FeaturedTemplateSkeleton;
