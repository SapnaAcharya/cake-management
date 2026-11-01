import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import AdminLayout from "../../layouts/AdminLayout";
import trainingPackageAdminService from "../../services/training/trainingPackageAdminService";
import trainingTrainerAdminService from "../../services/training/trainingTrainerAdminService";
import trainingBatchAdminService from "../../services/training/trainingBatchAdminService";
import "../../styles/AddTrainingBatch.css";

const initialForm = {
  trainingPackageId: "",
  trainerId: "",
  startDate: "",
  endDate: "",
  scheduleDetails: "",
  capacity: "20",
};

function getId(item) {
  return item.id ?? item.Id;
}

function isActive(item) {
  return (item.isActive ?? item.IsActive) !== false;
}

function getPackageName(item) {
  return item.name ?? item.packageName ?? item.Name ?? item.PackageName ?? "Unnamed package";
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

  return `${firstName} ${lastName}`.trim() || `Trainer #${getId(item)}`;
}

function getErrorMessage(err, fallback) {
  const data = err.response?.data;

  if (data?.errors && typeof data.errors === "object") {
    return Object.values(data.errors).flat().join(" ");
  }

  return data?.message || data?.title || fallback;
}

export default function AddTrainingBatch() {
  const navigate = useNavigate();

  const [form, setForm] = useState(initialForm);
  const [packages, setPackages] = useState([]);
  const [trainers, setTrainers] = useState([]);
  const [loadingOptions, setLoadingOptions] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadOptions() {
      setLoadingOptions(true);
      setError("");

      try {
        const [packageData, trainerData] = await Promise.all([
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

        setPackages(packageList.filter(isActive));
        setTrainers(trainerList.filter(isActive));
      } catch (err) {
        console.error("Failed to load options:", err.response?.status, err.response?.data);

        if (!cancelled) {
          setError(
            getErrorMessage(
              err,
              "Unable to load training packages and trainers. Please check your connection and try again."
            )
          );
        }
      } finally {
        if (!cancelled) setLoadingOptions(false);
      }
    }

    loadOptions();

    return () => {
      cancelled = true;
    };
  }, []);

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
      setError("Please select both a training package and a trainer.");
      return;
    }

    if (!form.startDate || !form.endDate) {
      setError("Please select both the start date and end date.");
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

    if (!Number.isInteger(capacity) || capacity < 1 || capacity > 500) {
      setError("Capacity must be a whole number between 1 and 500.");
      return;
    }

    // Start of the first day and end of the last day, in the admin's local
    // time, converted to UTC (ends with "Z") so PostgreSQL accepts it.
    const batch = {
      trainingPackageId: Number(form.trainingPackageId),
      trainerId: Number(form.trainerId),
      startDate: new Date(`${form.startDate}T00:00:00`).toISOString(),
      endDate: new Date(`${form.endDate}T23:59:00`).toISOString(),
      scheduleDetails: form.scheduleDetails.trim(),
      capacity,
    };

    try {
      setSaving(true);

      await trainingBatchAdminService.create(batch);

      navigate("/admin/training-batches", {
        state: { message: "Training batch created successfully." },
      });
    } catch (err) {
      console.error("Create batch failed:", err.response?.status, err.response?.data);

      setError(
        getErrorMessage(
          err,
          "Failed to create the training batch. Please check your entries and try again."
        )
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <AdminLayout
      title="Add Training Batch"
      subtitle="Schedule a training session and assign a package and trainer."
      headerAction={
        <Link to="/admin/training-batches" className="atb-back-link">
          ← Back to batches
        </Link>
      }
    >
      <div className="add-training-batch">
        {error && (
          <div className="atb-alert" role="alert">
            {error}
          </div>
        )}

        {loadingOptions ? (
          <div className="atb-state">Loading packages and trainers...</div>
        ) : (
          <form className="atb-form" onSubmit={handleSubmit}>
            <section className="atb-section">
              <h2>Training assignment</h2>
              <p>Choose the package and trainer for this batch.</p>

              <div className="atb-grid">
                <div className="atb-field">
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
                      </option>
                    ))}
                  </select>

                  {packages.length === 0 && (
                    <small>
                      No active training packages. Activate one in Manage
                      Packages first.
                    </small>
                  )}
                </div>

                <div className="atb-field">
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
                      </option>
                    ))}
                  </select>

                  {trainers.length === 0 && (
                    <small>
                      No active trainers. Activate one in Manage Trainers
                      first.
                    </small>
                  )}
                </div>
              </div>
            </section>

            <section className="atb-section">
              <h2>Training dates and schedule</h2>
              <p>Set the dates and describe when the sessions will take place.</p>

              <div className="atb-grid">
                <div className="atb-field">
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

                <div className="atb-field">
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

                <div className="atb-field atb-field-full">
                  <label htmlFor="scheduleDetails">
                    Schedule details <span>*</span>
                  </label>
                  <textarea
                    id="scheduleDetails"
                    name="scheduleDetails"
                    value={form.scheduleDetails}
                    onChange={handleChange}
                    placeholder="Example: Monday, Wednesday and Friday, 10:00 AM–12:00 PM"
                    maxLength={1000}
                    rows={4}
                    required
                  />
                  <small>{form.scheduleDetails.length}/1000 characters</small>
                </div>
              </div>
            </section>

            <section className="atb-section">
              <h2>Batch capacity</h2>
              <p>Choose the maximum number of trainees for this batch.</p>

              <div className="atb-field atb-capacity-field">
                <label htmlFor="capacity">
                  Maximum trainees <span>*</span>
                </label>
                <input
                  id="capacity"
                  name="capacity"
                  type="number"
                  min="1"
                  max="500"
                  step="1"
                  value={form.capacity}
                  onChange={handleChange}
                  required
                />
                <small>Enter a number between 1 and 500.</small>
              </div>
            </section>

            <div className="atb-form-actions">
              <Link to="/admin/training-batches" className="atb-cancel-button">
                Cancel
              </Link>

              <button
                type="submit"
                className="atb-submit-button"
                disabled={
                  saving ||
                  loadingOptions ||
                  packages.length === 0 ||
                  trainers.length === 0
                }
              >
                {saving ? "Creating batch..." : "Create Training Batch"}
              </button>
            </div>
          </form>
        )}
      </div>
    </AdminLayout>
  );
}