import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import trainingPackageAdminService from "../../services/training/trainingPackageAdminService";
import trainingTrainerAdminService from "../../services/training/trainingTrainerAdminService";
import trainingBatchAdminService from "../../services/training/trainingBatchAdminService";
import "../../styles/EditTrainingBatch.css";

const initialForm = {
  trainingPackageId: "",
  trainerId: "",
  startDate: "",
  endDate: "",
  scheduleDetails: "",
  capacity: "20",
  status: "Open",
};

function getId(item) {
  return item.id ?? item.Id;
}

function isActive(item) {
  return (item.isActive ?? item.IsActive) !== false;
}

function getPackageName(item) {
  return (
    item.name ??
    item.packageName ??
    item.Name ??
    item.PackageName ??
    "Unnamed package"
  );
}

function getTrainerName(item) {
  const fullName =
    item.fullName ??
    item.name ??
    item.trainerName ??
    item.FullName ??
    item.Name ??
    item.TrainerName;

  if (fullName) return fullName;

  const firstName = item.firstName ?? item.FirstName ?? "";
  const lastName = item.lastName ?? item.LastName ?? "";

  return (
    `${firstName} ${lastName}`.trim() ||
    `Trainer #${getId(item)}`
  );
}

function getDateInputValue(value) {
  if (!value) return "";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "";

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

export default function EditTrainingBatch() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [form, setForm] = useState(initialForm);
  const [packages, setPackages] = useState([]);
  const [trainers, setTrainers] = useState([]);
  const [registeredCount, setRegisteredCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadBatch() {
      setLoading(true);
      setError("");

      try {
        const [batch, packageData, trainerData] = await Promise.all([
          trainingBatchAdminService.getById(id),
          trainingPackageAdminService.getAll(),
          trainingTrainerAdminService.getAll(),
        ]);

        if (cancelled) return;

        const packageList = Array.isArray(packageData)
          ? packageData
          : packageData?.items ?? [];

        const trainerList = Array.isArray(trainerData)
          ? trainerData
          : trainerData?.items ?? [];

        const batchPackageId =
          batch.trainingPackageId ?? batch.TrainingPackageId;
        const batchTrainerId =
          batch.trainerId ?? batch.TrainerId;

        // Preserve the batch's currently assigned package and trainer
        // even if either has subsequently become inactive.
        const allPackages = [...packageList];
        const allTrainers = [...trainerList];

        if (
          !allPackages.some(
            (item) => String(getId(item)) === String(batchPackageId)
          )
        ) {
          allPackages.push({
            id: batchPackageId,
            name:
              batch.trainingPackageName ??
              batch.TrainingPackageName ??
              `Package #${batchPackageId}`,
            isActive: false,
          });
        }

        if (
          !allTrainers.some(
            (item) => String(getId(item)) === String(batchTrainerId)
          )
        ) {
          allTrainers.push({
            id: batchTrainerId,
            name:
              batch.trainerName ??
              batch.TrainerName ??
              `Trainer #${batchTrainerId}`,
            isActive: false,
          });
        }

        setPackages(allPackages);
        setTrainers(allTrainers);
        setRegisteredCount(
          batch.registeredCount ?? batch.RegisteredCount ?? 0
        );

        setForm({
          trainingPackageId: String(batchPackageId ?? ""),
          trainerId: String(batchTrainerId ?? ""),
          startDate: getDateInputValue(
            batch.startDate ?? batch.StartDate
          ),
          endDate: getDateInputValue(
            batch.endDate ?? batch.EndDate
          ),
          scheduleDetails:
            batch.scheduleDetails ?? batch.ScheduleDetails ?? "",
          capacity: String(batch.capacity ?? batch.Capacity ?? 20),
          status: batch.status ?? batch.Status ?? "Open",
        });
      } catch (err) {
        if (!cancelled) {
          setError(
            err.response?.data?.message ??
              err.response?.data?.title ??
              "Unable to load the training batch. Please try again."
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    if (id) loadBatch();

    return () => {
      cancelled = true;
    };
  }, [id]);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    if (!form.trainingPackageId || !form.trainerId) {
      setError("Please select a training package and trainer.");
      return;
    }

    if (!form.startDate || !form.endDate) {
      setError("Please select both training dates.");
      return;
    }

    if (form.endDate < form.startDate) {
      setError("The end date cannot be earlier than the start date.");
      return;
    }

    if (!form.scheduleDetails.trim()) {
      setError("Please enter the training schedule details.");
      return;
    }

    const capacity = Number(form.capacity);

    if (
      !Number.isInteger(capacity) ||
      capacity < 1 ||
      capacity > 500
    ) {
      setError("Capacity must be a whole number between 1 and 500.");
      return;
    }

    if (capacity < registeredCount) {
      setError(
        `Capacity cannot be less than the ${registeredCount} existing registrations.`
      );
      return;
    }

    const updatedBatch = {
      trainingPackageId: Number(form.trainingPackageId),
      trainerId: Number(form.trainerId),
    //   startDate: `${form.startDate}T00:00:00`,
    //   endDate: `${form.endDate}T00:00:00`,
      startDate: new Date(`${form.startDate}T00:00:00`).toISOString(),
      endDate: new Date(`${form.endDate}T23:59:00`).toISOString(),
      scheduleDetails: form.scheduleDetails.trim(),
      capacity,
      status: form.status,
    };

    try {
      setSaving(true);

      await trainingBatchAdminService.update(id, updatedBatch);

      navigate("/admin/training-batches", {
        state: { message: "Training batch updated successfully." },
      });
    } catch (err) {
      setError(
        err.response?.data?.message ??
          err.response?.data?.title ??
          "Failed to update the training batch. Please check your entries."
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="edit-training-batch">
        <div className="etb-state">Loading training batch...</div>
      </div>
    );
  }

  return (
    <div className="edit-training-batch">
      <div className="etb-page-header">
        <div>
          <p className="etb-eyebrow">TRAINING MANAGEMENT</p>
          <h1>Edit Training Batch</h1>
          <p className="etb-subtitle">
            Update the assigned package, trainer, schedule, and capacity.
          </p>
        </div>

        <Link to="/admin/training-batches" className="etb-back-link">
          ← Back to batches
        </Link>
      </div>

      {error && (
        <div className="etb-alert" role="alert">
          {error}
        </div>
      )}

      <form className="etb-form" onSubmit={handleSubmit}>
        <section className="etb-section">
          <h2>Training assignment</h2>
          <p>Select the package and trainer assigned to this batch.</p>

          <div className="etb-grid">
            <div className="etb-field">
              <label htmlFor="trainingPackageId">
                Training package <span>*</span>
              </label>
              <select
                id="trainingPackageId"
                name="trainingPackageId"
                value={form.trainingPackageId}
                onChange={handleChange}
                required
              >
                <option value="">Select a package</option>
                {packages.map((item) => (
                  <option key={getId(item)} value={getId(item)}>
                    {getPackageName(item)}
                    {!isActive(item) ? " (Inactive)" : ""}
                  </option>
                ))}
              </select>
            </div>

            <div className="etb-field">
              <label htmlFor="trainerId">
                Trainer <span>*</span>
              </label>
              <select
                id="trainerId"
                name="trainerId"
                value={form.trainerId}
                onChange={handleChange}
                required
              >
                <option value="">Select a trainer</option>
                {trainers.map((item) => (
                  <option key={getId(item)} value={getId(item)}>
                    {getTrainerName(item)}
                    {!isActive(item) ? " (Inactive)" : ""}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </section>

        <section className="etb-section">
          <h2>Dates and schedule</h2>
          <p>Update the training period and session details.</p>

          <div className="etb-grid">
            <div className="etb-field">
              <label htmlFor="startDate">
                Start date <span>*</span>
              </label>
              <input
                id="startDate"
                name="startDate"
                type="date"
                value={form.startDate}
                onChange={handleChange}
                required
              />
            </div>

            <div className="etb-field">
              <label htmlFor="endDate">
                End date <span>*</span>
              </label>
              <input
                id="endDate"
                name="endDate"
                type="date"
                min={form.startDate || undefined}
                value={form.endDate}
                onChange={handleChange}
                required
              />
            </div>

            <div className="etb-field etb-field-full">
              <label htmlFor="scheduleDetails">
                Schedule details <span>*</span>
              </label>
              <textarea
                id="scheduleDetails"
                name="scheduleDetails"
                value={form.scheduleDetails}
                onChange={handleChange}
                maxLength={1000}
                rows={4}
                placeholder="Example: Monday, Wednesday and Friday, 10:00 AM–12:00 PM"
                required
              />
              <small>{form.scheduleDetails.length}/1000 characters</small>
            </div>
          </div>
        </section>

        <section className="etb-section">
          <h2>Capacity and status</h2>
          <p>Manage the maximum registrations and current batch status.</p>

          <div className="etb-grid">
            <div className="etb-field">
              <label htmlFor="capacity">
                Maximum trainees <span>*</span>
              </label>
              <input
                id="capacity"
                name="capacity"
                type="number"
                min={Math.max(1, registeredCount)}
                max="500"
                step="1"
                value={form.capacity}
                onChange={handleChange}
                required
              />
              <small>
                Current registrations: {registeredCount}
              </small>
            </div>

            <div className="etb-field">
              <label htmlFor="status">
                Batch status <span>*</span>
              </label>
              <select
                id="status"
                name="status"
                value={form.status}
                onChange={handleChange}
                required
              >
                <option value="Open">Open</option>
                <option value="Closed">Closed</option>
                <option value="Full">Full</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </div>
          </div>
        </section>

        <div className="etb-form-actions">
          <Link to="/admin/training-batches" className="etb-cancel-button">
            Cancel
          </Link>

          <button
            type="submit"
            className="etb-submit-button"
            disabled={saving}
          >
            {saving ? "Saving changes..." : "Save Changes"}
          </button>
        </div>
      </form>
    </div>
  );
}
