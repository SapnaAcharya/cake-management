import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
    ArrowLeft,
    ArrowRight,
    CalendarDays,
    Check,
    CheckCircle2,
    GraduationCap,
    Users,
} from "lucide-react";
import Navbar from "../../components/Navbar";
import trainingPackageService from "../../services/training/trainingPackageService";
import trainingBatchService from "../../services/training/trainingBatchService";
import { enrollInTraining } from "../../services/training/trainingEnrollmentService";
import { API_ORIGIN } from "../../config/apiConfig";
import TrainingEnrollModal from "./TrainingEnrollModal";
import "./TrainingCourseDetails.css";

const resolveImageUrl = (imageUrl) => {
    if (!imageUrl) return "";
    if (/^https?:\/\//i.test(imageUrl)) return imageUrl;
    return `${API_ORIGIN.replace(/\/$/, "")}/${imageUrl.replace(/^\//, "")}`;
};

const formatDate = (value) => {
    if (!value) return "To be announced";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "To be announced";
    return date.toLocaleDateString("en-GB", {
        day: "numeric",
        month: "short",
        year: "numeric",
    });
};

const formatDuration = (days) => {
    if (days == null || days === "") return "To be announced";
    const n = Number(days);
    if (n === 0.5) return "Half day";
    if (n >= 30) {
        const months = Math.round(n / 30);
        return `${months} ${months === 1 ? "month" : "months"}`;
    }
    return `${n} ${n === 1 ? "day" : "days"}`;
};

const formatPrice = (fee) =>
    fee != null ? `₹ ${Number(fee).toLocaleString("en-IN")}` : "Contact us";

const getOutcomes = (value) => {
    if (!value) return [];
    if (Array.isArray(value)) return value;
    return String(value)
        .split(/\r?\n/)
        .map((item) => item.trim())
        .filter(Boolean);
};

const ABOUT_POINTS = [
    "Small batch sizes for personalized attention",
    "Hands-on practical training",
    "Take home your creations",
    "Certificate upon completion",
    "Business guidance and mentorship",
    "Lifetime access to our alumni network",
];

/* ---------- One full course card (used for every course) ---------- */
function CourseCard({ course, nextBatch, onEnroll }) {
    const imageUrl = resolveImageUrl(course.imageUrl);
    const outcomes = getOutcomes(course.learningOutcomes);

    return (
        <article className="course-card">
            <div className="course-card__image">
                {imageUrl ? (
                    <img
                        src={imageUrl}
                        alt={course.name}
                        onError={(e) => (e.currentTarget.style.display = "none")}
                    />
                ) : (
                    <div className="training-details-placeholder">
                        <GraduationCap size={42} />
                        <span>SweetCakes Training</span>
                    </div>
                )}
            </div>

            <div className="course-card__body">
                <h2 className="course-card__title">{course.name}</h2>

                {course.skillLevel && (
                    <span className="training-level-pill">{course.skillLevel}</span>
                )}

                <p className="course-description">
                    {course.description ||
                        "Develop your baking and cake decorating skills with practical training from SweetCakes."}
                </p>

                <dl className="course-facts">
                    <div>
                        <dt>Duration:</dt>
                        <dd>{formatDuration(course.durationInDays)}</dd>
                    </div>
                    <div>
                        <dt>Price:</dt>
                        <dd>{formatPrice(course.fee)}</dd>
                    </div>
                    <div>
                        <dt>Next Batch:</dt>
                        <dd>{nextBatch}</dd>
                    </div>
                </dl>

                <section className="course-outcomes">
                    <h3>What You'll Learn:</h3>
                    {outcomes.length > 0 ? (
                        <ul>
                            {outcomes.map((outcome, index) => (
                                <li key={`${index}-${outcome}`}>
                                    <Check size={16} className="course-outcomes__check" />
                                    <span>{outcome}</span>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="training-details-muted">
                            Learning outcomes will be announced soon.
                        </p>
                    )}
                </section>

                <button
                    type="button"
                    className="training-gradient-button"
                    onClick={() => onEnroll(course)}
                >
                    Enroll Now
                </button>
            </div>
        </article>
    );
}

export default function TrainingCourseDetails() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [course, setCourse] = useState(null);
    const [batches, setBatches] = useState([]); // open batches of the current course
    const [allBatches, setAllBatches] = useState([]); // open batches of ALL courses
    const [allCourses, setAllCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [enrollCourse, setEnrollCourse] = useState(null); // course chosen for the modal

    /* ---------- Load current course + open batches ---------- */
    useEffect(() => {
        let isMounted = true;

        const loadDetails = async () => {
            try {
                setLoading(true);
                setError("");

                const [courseData, batchData] = await Promise.all([
                    trainingPackageService.getActiveById(id),
                    trainingBatchService.getAllOpen(),
                ]);

                if (!isMounted) return;
                setCourse(courseData);

                const openBatches = Array.isArray(batchData) ? batchData : [];
                setAllBatches(openBatches);
                setBatches(
                    openBatches.filter((batch) => {
                        const packageId =
                            batch.trainingPackageId ?? batch.TrainingPackageId;
                        const status = String(
                            batch.status ?? batch.Status ?? "Open"
                        ).toLowerCase();
                        return Number(packageId) === Number(id) && status === "open";
                    })
                );
            } catch (err) {
                console.error("Failed to load course details:", err);
                if (isMounted) {
                    setError(
                        err.response?.data?.message ||
                            "Unable to load course details. Please try again."
                    );
                }
            } finally {
                if (isMounted) setLoading(false);
            }
        };

        loadDetails();
        return () => {
            isMounted = false;
        };
    }, [id]);

    /* ---------- Load all courses ---------- */
    useEffect(() => {
        let isMounted = true;
        window.scrollTo({ top: 0 });

        const loadAllCourses = async () => {
            try {
                // Use whichever "list active courses" method your service has
                const loadAll =
                    trainingPackageService.getActive ??
                    trainingPackageService.getAllActive ??
                    trainingPackageService.getAll;
                const data = await loadAll.call(trainingPackageService);
                if (!isMounted) return;
                const list = Array.isArray(data) ? data : data?.items ?? [];
                setAllCourses(list);
            } catch (err) {
                console.error("Failed to load courses:", err);
                if (isMounted) setAllCourses([]);
            }
        };

        loadAllCourses();
        return () => {
            isMounted = false;
        };
    }, [id]);

    /* ---------- Next batch date for any course ---------- */
    const getNextBatchLabel = (courseId) => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const dates = allBatches
            .filter((b) => {
                const pid = b.trainingPackageId ?? b.TrainingPackageId;
                const status = String(b.status ?? b.Status ?? "Open").toLowerCase();
                return Number(pid) === Number(courseId) && status === "open";
            })
            .map((b) => new Date(b.startDate ?? b.StartDate))
            .filter((d) => !Number.isNaN(d.getTime()) && d >= today)
            .sort((a, b) => a - b);

        return dates.length ? formatDate(dates[0]) : "Contact for details";
    };

    /* ---------- Current course first, then the rest ---------- */
    const orderedCourses = useMemo(() => {
        const rest = allCourses.filter((c) => Number(c.id ?? c.Id) !== Number(id));
        return course ? [course, ...rest] : rest;
    }, [allCourses, course, id]);

    const handleEnroll = (c) => setEnrollCourse(c);

    const enrollmentBatches = useMemo(() => {
    if (!enrollCourse) return [];

    const selectedTrainingId = Number(
        enrollCourse.id ?? enrollCourse.Id
    );

    return allBatches.filter((batch) => {
        const packageId =
            batch.trainingPackageId ?? batch.TrainingPackageId;

        const status = String(
            batch.status ?? batch.Status ?? ""
        ).toLowerCase();

        return (
            Number(packageId) === selectedTrainingId &&
            status === "open"
        );
    });
}, [enrollCourse, allBatches]);

    const handleEnrollSubmit = (formData) =>
    enrollInTraining({
        trainingId: Number(enrollCourse?.id ?? enrollCourse?.Id),

        trainingBatchId: Number(formData.trainingBatchId),

        name: formData.name,
        email: formData.email,
        phone: formData.phone,

        whatsApp: formData.whatsApp?.trim() || null,
        city: formData.city?.trim() || null,

        experienceLevel: formData.experienceLevel
    });

    const showContent = !loading && !error && course;

    return (
        <div className="training-details-page">
            <Navbar />

            {/* Gradient banner */}
            <header className="training-hero">
                <div className="training-hero__inner">
                    {/* <span className="training-eyebrow">Sweet Cakes Training</span> */}
                    <h1>Professional Bakery Training</h1>
                    <p>Master the art of baking with our comprehensive training programs</p>
                </div>
            </header>

            <main className="training-details-main">
                <nav className="training-details-breadcrumb" aria-label="Breadcrumb">
                    <button type="button" onClick={() => navigate("/training")}>
                        <ArrowLeft size={16} />
                        Training courses
                    </button>
                    <span aria-hidden="true">/</span>
                    <span aria-current="page">{course?.name || "Course details"}</span>
                </nav>

                {loading && (
                    <section className="training-details-state" role="status" aria-live="polite">
                        <span className="training-details-spinner" />
                        <h2>Loading course details...</h2>
                        <p>Please wait while we load the course and its schedules.</p>
                    </section>
                )}

                {!loading && (error || !course) && (
                    <section
                        className="training-details-state training-details-state--error"
                        role="alert"
                    >
                        <h2>Course details unavailable</h2>
                        <p>
                            {error ||
                                "This course could not be found or is no longer available."}
                        </p>
                        <button
                            type="button"
                            className="training-details-button"
                            onClick={() => navigate("/training")}
                        >
                            <ArrowLeft size={16} />
                            Back to training courses
                        </button>
                    </section>
                )}

                {showContent && (
                    <>
                        {/* Section heading */}
                        <div className="training-details-section-heading training-packages-heading">
                            <div>
                                
                                <h2>Our Training Packages</h2>
                                {/* <p>Choose the program that fits your goals and enroll today.</p> */}
                            </div>
                            <span className="training-details-batch-count">
                                {orderedCourses.length}{" "}
                                {orderedCourses.length === 1 ? "course" : "courses"}
                            </span>
                        </div>

                        {/* All courses, 2 per row */}
                        <div className="course-grid">
                            {orderedCourses.map((c) => {
                                const cid = c.id ?? c.Id;
                                return (
                                    <CourseCard
                                        key={cid}
                                        course={c}
                                        nextBatch={getNextBatchLabel(cid)}
                                        onEnroll={handleEnroll}
                                    />
                                );
                            })}
                        </div>

                        {batches.length > 1 && (
                            <a
                                className="course-summary__link"
                                href="#training-available-batches"
                            >
                                See all {batches.length} batches for {course.name}
                            </a>
                        )}

                        {/* Schedules (current course) */}
                        {batches.length > 1 && (
                            <section
                                className="training-details-batches"
                                id="training-available-batches"
                            >
                                <div className="training-details-section-heading training-details-batches-heading">
                                    <div>
                                        <h2>Available training schedules</h2>
                                        <p>
                                            Choose a batch that suits your schedule and
                                            reserve your place.
                                        </p>
                                    </div>
                                    <span className="training-details-batch-count">
                                        {batches.length} batches
                                    </span>
                                </div>

                                <div className="training-details-batch-grid">
                                    {batches.map((batch) => {
                                        const capacity = Number(
                                            batch.capacity ?? batch.Capacity ?? 0
                                        );
                                        const registeredCount = Number(
                                            batch.registeredCount ??
                                                batch.RegisteredCount ??
                                                0
                                        );
                                        const remainingSeats = Math.max(
                                            0,
                                            capacity - registeredCount
                                        );
                                        const isFull = remainingSeats === 0;
                                        const batchId = batch.id ?? batch.Id;
                                        const startDate = batch.startDate ?? batch.StartDate;
                                        const endDate = batch.endDate ?? batch.EndDate;
                                        const trainerName =
                                            batch.trainerName ?? batch.TrainerName;
                                        const scheduleDetails =
                                            batch.scheduleDetails ?? batch.ScheduleDetails;

                                        return (
                                            <article
                                                className="training-details-batch-card"
                                                key={batchId}
                                            >
                                                <div className="training-details-batch-card-top">
                                                    <span
                                                        className={`training-details-batch-status ${
                                                            isFull ? "full" : ""
                                                        }`}
                                                    >
                                                        <span />
                                                        {isFull
                                                            ? "Fully booked"
                                                            : "Open for enrollment"}
                                                    </span>
                                                    <span className="training-details-batch-number">
                                                        Batch #{batchId}
                                                    </span>
                                                </div>

                                                <div className="training-details-batch-information">
                                                    <div className="training-details-batch-row">
                                                        <span>
                                                            <CalendarDays size={16} />
                                                            Start date
                                                        </span>
                                                        <strong>{formatDate(startDate)}</strong>
                                                    </div>
                                                    <div className="training-details-batch-row">
                                                        <span>
                                                            <CalendarDays size={16} />
                                                            End date
                                                        </span>
                                                        <strong>{formatDate(endDate)}</strong>
                                                    </div>
                                                    <div className="training-details-batch-row">
                                                        <span>
                                                            <GraduationCap size={16} />
                                                            Trainer
                                                        </span>
                                                        <strong>
                                                            {trainerName || "To be announced"}
                                                        </strong>
                                                    </div>
                                                    <div className="training-details-batch-row">
                                                        <span>
                                                            <Users size={16} />
                                                            Seats remaining
                                                        </span>
                                                        <strong
                                                            className={
                                                                remainingSeats <= 2
                                                                    ? "training-details-seats-low"
                                                                    : ""
                                                            }
                                                        >
                                                            {remainingSeats} of {capacity}
                                                        </strong>
                                                    </div>
                                                </div>

                                                {scheduleDetails && (
                                                    <div className="training-details-schedule">
                                                        <span>Class schedule</span>
                                                        <p>{scheduleDetails}</p>
                                                    </div>
                                                )}

                                                <button
                                                    type="button"
                                                    className="training-details-button training-details-enroll"
                                                    disabled={isFull}
                                                    onClick={() =>
                                                        navigate(`/training/register/${batchId}`)
                                                    }
                                                >
                                                    {isFull ? "Batch full" : "Enroll in this batch"}
                                                    {!isFull && <ArrowRight size={17} />}
                                                </button>
                                            </article>
                                        );
                                    })}
                                </div>
                            </section>
                        )}

                        {/* About */}
                        <section className="training-about">
                            <h2>About our training program</h2>
                            <p>
                                With over 12 years of experience in professional cake
                                training, we have helped hundreds of aspiring bakers turn
                                their passion into successful careers. Our programs are
                                designed by industry experts and cover everything from basic
                                baking techniques to advanced decoration skills.
                            </p>
                            <ul className="training-about-list">
                                {ABOUT_POINTS.map((point) => (
                                    <li key={point}>
                                        <CheckCircle2 size={20} />
                                        <span>{point}</span>
                                    </li>
                                ))}
                            </ul>
                        </section>
                    </>
                )}
            </main>

            {showContent && (
                <section className="training-cta-band">
                    <h2>Ready to start your baking journey?</h2>
                    <p>Join our next batch and turn your passion into a profession.</p>
                    <button
                        type="button"
                        className="training-cta-band__button"
                        onClick={() => handleEnroll(course)}
                    >
                        Enroll now
                    </button>
                </section>
            )}

            {enrollCourse && (
    <TrainingEnrollModal
        courseName={enrollCourse.name ?? enrollCourse.Name}
        trainingId={enrollCourse.id ?? enrollCourse.Id}
        batches={enrollmentBatches}
        onClose={() => setEnrollCourse(null)}
        onSubmit={handleEnrollSubmit}
    />
)}
        </div>
    );
}