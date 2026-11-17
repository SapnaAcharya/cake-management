import "../styles/CakeSkeleton.css";

const CakeSkeleton = () => {
  return (
    <div className="cake-skeleton-card" aria-hidden="true">
      <div className="skeleton skeleton-image" />

      <div className="skeleton-content">
        <div className="skeleton skeleton-title" />
        <div className="skeleton skeleton-price" />
      </div>
    </div>
  );
};

export default CakeSkeleton;
