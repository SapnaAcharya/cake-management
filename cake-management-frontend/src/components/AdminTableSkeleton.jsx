import "../styles/AdminSkeleton.css";

export default function AdminTableSkeleton({ columns = 5, rows = 6 }) {
  return (
    <div className="admin-skeleton-table" style={{ "--admin-skeleton-columns": columns }} role="status" aria-label="Loading records">
      {Array.from({ length: rows }, (_, row) => (
        <div className="admin-skeleton-row" key={row} aria-hidden="true">
          {Array.from({ length: columns }, (_, column) => (
            <span className="admin-skeleton-cell" key={column} />
          ))}
        </div>
      ))}
    </div>
  );
}

export function AdminFormSkeleton({ fields = 8 }) {
  return (
    <div className="admin-form-skeleton" role="status" aria-label="Loading form">
      <div className="admin-form-skeleton-heading" aria-hidden="true" />
      <div className="admin-form-skeleton-grid" aria-hidden="true">
        {Array.from({ length: fields }, (_, field) => (
          <div className="admin-form-skeleton-field" key={field}>
            <i />
            <i />
          </div>
        ))}
      </div>
      <div className="admin-form-skeleton-actions" aria-hidden="true"><i /><i /></div>
    </div>
  );
}

export function AdminDetailSkeleton({ rows = 5 }) {
  return (
    <div className="admin-detail-skeleton" role="status" aria-label="Loading details">
      {Array.from({ length: rows }, (_, row) => (
        <div className="admin-detail-skeleton-row" key={row} aria-hidden="true">
          <i /><i />
        </div>
      ))}
    </div>
  );
}
