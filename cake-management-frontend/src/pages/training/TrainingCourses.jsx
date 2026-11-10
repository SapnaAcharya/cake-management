import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Search, Clock, Cake, Sparkles, Heart, GraduationCap } from "lucide-react";

import Navbar from "../../components/Navbar";
import trainingPackageService from "../../services/training/trainingPackageService";
import { API_ORIGIN } from "../../config/apiConfig";
import { ChevronLeft, ChevronRight } from "lucide-react";

import "./TrainingCourses.css";
import "./TrainingCourseCards.css";
import "./TrainingWhyCard.css";

const heroSlides = [
    {
        id: 1,
        image: "/images/training/hero_banner1.PNG",
        eyebrow: "LEARN · CREATE · GROW",
        title: "Explore Our",
        titleLine2: "Training Courses",
        description:
            "Develop your cake baking and decorating skills with practical training designed for beginners and experienced bakers.",
        primaryButtonText: "Explore Courses",
        secondaryButtonText: "Contact Us",
        secondaryButtonLink: "/contact",
    },
    {
        id: 2,
        image: "/images/training/hero_banner2.PNG",
        eyebrow: "HANDS-ON LEARNING",
        title: "Practical Classes",
        titleLine2: "For Every Level",
        description: "From beginner basics to advanced cake design.",
        primaryButtonText: "Explore Courses",
        secondaryButtonText: "Contact Us",
        secondaryButtonLink: "/contact",
    },
    {
        id: 3,
        image: "/images/training/hero_banner3.PNG",
        eyebrow: "EXPERT INSTRUCTORS",
        title: "Learn From",
        titleLine2: "Professionals",
        description: "Real techniques, real results.",
        primaryButtonText: "Explore Courses",
        secondaryButtonText: "Contact Us",
        secondaryButtonLink: "/contact",
    },
    {
        id: 4,
        image: "/images/training/hero_banner4.PNG",
        eyebrow: "START TODAY",
        title: "Turn Your Passion Into",
        titleLine2: "A Skill",
        description: "Enroll now and start your baking journey.",
        primaryButtonText: "Explore Courses",
        secondaryButtonText: "Contact Us",
        secondaryButtonLink: "/contact",
    },
];

const resolveImageUrl = (imageUrl) => {
    if (!imageUrl) return "";

    const value = String(imageUrl).trim();

    if (!value) return "";

    if (/^https?:\/\//i.test(value)) {
        return value;
    }

    return `${API_ORIGIN.replace(/\/$/, "")}/${value.replace(/^\//, "")}`;
};

const formatDuration = (value) => {
    if (value == null || value === "") {
        return "Duration to be announced";
    }

    const duration = Number(value);

    if (!Number.isFinite(duration) || duration <= 0) {
        return "Duration to be announced";
    }

    if (duration === 0.5) {
        return "Half day";
    }

    return `${duration} ${duration === 1 ? "day" : "days"}`;
};

const formatFee = (fee) => {
    if (fee == null || fee === "") {
        return "Contact us";
    }

    const amount = Number(fee);

    if (!Number.isFinite(amount)) {
        return "Contact us";
    }

    return `NPR ${amount.toLocaleString("en-NP")}`;
};

const getLevelClass = (level) => {
    const normalized = String(level || "").trim().toLowerCase();

    if (normalized.includes("beginner")) {
        return "training-level-pill--beginner";
    }

    if (normalized.includes("intermediate")) {
        return "training-level-pill--intermediate";
    }

    if (normalized.includes("advanced")) {
        return "training-level-pill--advanced";
    }

    return "training-level-pill--all";
};

export default function TrainingCourses() {
    const [packages, setPackages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [search, setSearch] = useState("");
    const [selectedLevel, setSelectedLevel] = useState("All");
    const [selectedDuration, setSelectedDuration] = useState("All");
    const [retryCount, setRetryCount] = useState(0);

    // ---------- Hero slider state ----------
    const [currentSlide, setCurrentSlide] = useState(0);

    // HERO AUTOPLAY (restarts after manual change)
    useEffect(() => {
        const timer = setTimeout(() => {
            setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
        }, 5000);

        return () => clearTimeout(timer);
    }, [currentSlide]);

    const handlePreviousSlide = () => {
        setCurrentSlide(
            (currentSlide - 1 + heroSlides.length) % heroSlides.length
        );
    };

    const handleNextSlide = () => {
        setCurrentSlide((currentSlide + 1) % heroSlides.length);
    };

    const slide = heroSlides[currentSlide];

    // Load active training courses from the existing API.
    useEffect(() => {
        let isMounted = true;

        const fetchPackages = async () => {
            try {
                setLoading(true);
                setError("");

                const data = await trainingPackageService.getAllActive();

                if (isMounted) {
                    setPackages(Array.isArray(data) ? data : []);
                }
            } catch (err) {
                console.error("Failed to load training courses:", err);

                if (isMounted) {
                    setError(
                        err.response?.data?.message ||
                            "Unable to load training courses. Please try again."
                    );
                }
            } finally {
                if (isMounted) {
                    setLoading(false);
                }
            }
        };

        fetchPackages();

        return () => {
            isMounted = false;
        };
    }, [retryCount]);

    // Build the skill-level filter from available courses.
    const levels = useMemo(() => {
        const uniqueLevels = [
            ...new Set(
                packages
                    .map((course) => String(course.skillLevel || "").trim())
                    .filter(Boolean)
            ),
        ];

        return ["All", ...uniqueLevels];
    }, [packages]);

    // Build the duration filter from available courses.
    const durations = useMemo(() => {
        const uniqueDurations = [
            ...new Set(
                packages
                    .map((course) => Number(course.durationInDays))
                    .filter(
                        (duration) => Number.isFinite(duration) && duration > 0
                    )
            ),
        ].sort((a, b) => a - b);

        return ["All", ...uniqueDurations];
    }, [packages]);

    // Search and filter the course catalog.
    const filteredPackages = useMemo(() => {
        const query = search.trim().toLowerCase();

        return packages.filter((course) => {
            const searchableFields = [
                course.name,
                course.description,
                course.skillLevel,
                course.learningOutcomes,
            ];

            const matchesSearch = searchableFields.some((value) =>
                String(value ?? "").toLowerCase().includes(query)
            );

            const courseLevel = String(course.skillLevel || "").trim();

            const matchesLevel =
                selectedLevel === "All" || courseLevel === selectedLevel;

            const matchesDuration =
                selectedDuration === "All" ||
                Number(course.durationInDays) === selectedDuration;

            return matchesSearch && matchesLevel && matchesDuration;
        });
    }, [packages, search, selectedLevel, selectedDuration]);

    const clearFilters = () => {
        setSearch("");
        setSelectedLevel("All");
        setSelectedDuration("All");
    };

    const hasActiveFilters =
        search.trim() !== "" ||
        selectedLevel !== "All" ||
        selectedDuration !== "All";

    return (
        <div className="training-page">
            <Navbar />

            <main className="training-courses-page">
                {/* Hero slider */}
                <section className="hero">
                    {/* key makes the fade animation replay on every slide */}
                    <img
                        key={slide.id}
                        src={slide.image}
                        alt={slide.title}
                        className={`hero-image slide-${currentSlide + 1}`}
                    />

                    <div className="hero-overlay" />

                    <div key={`text-${slide.id}`} className="hero-text-card">
                        <div className="hero-text">
                            <div className="hero-eyebrow">{slide.eyebrow}</div>

                            <h1>
                                {slide.title}
                                <br />
                                {slide.titleLine2}
                            </h1>

                            <p>{slide.description}</p>

                            <div className="hero-actions">
                                <a
                                    href="#available-training-courses"
                                    className="hero-btn primary"
                                >
                                    {slide.primaryButtonText}
                                </a>

                                {slide.secondaryButtonText && (
                                    <Link
                                        to={slide.secondaryButtonLink}
                                        className="hero-btn secondary"
                                    >
                                        {slide.secondaryButtonText}
                                    </Link>
                                )}
                            </div>
                        </div>
                    </div>

                    <button
                        className="hero-arrow hero-arrow-left"
                        onClick={handlePreviousSlide}
                        aria-label="Previous slide"
                    >
                        <ChevronLeft size={24} />
                    </button>

                    <button
                        className="hero-arrow hero-arrow-right"
                        onClick={handleNextSlide}
                        aria-label="Next slide"
                    >
                        <ChevronRight size={24} />
                    </button>

                    <div className="hero-dots">
                        {heroSlides.map((s, index) => (
                            <button
                                key={s.id}
                                className={`hero-dot ${
                                    index === currentSlide ? "active" : ""
                                }`}
                                onClick={() => setCurrentSlide(index)}
                                aria-label={`Go to slide ${index + 1}`}
                            />
                        ))}
                    </div>
                </section>

                {/* Course catalog */}
                <section
                    className="training-courses-content"
                    id="available-training-courses"
                >
                    <div className="training-courses-heading">
                        <div>
                            <span className="training-eyebrow">
                                FIND YOUR NEXT SKILL
                            </span>

                            <h2>Explore Our Courses</h2>

                            <p>
                                Compare course levels, duration, and fees. Open
                                a course to see the full description and
                                available training schedules.
                            </p>
                        </div>

                        {!loading && !error && (
                            <span className="training-course-count">
                                {filteredPackages.length}{" "}
                                {filteredPackages.length === 1
                                    ? "Course"
                                    : "Courses"}
                            </span>
                        )}
                    </div>

                    {/* Search and filters */}
                    <div className="training-course-toolbar">
                        <label className="training-course-search">
                        
                            <Search
    size={18}
    className="training-search-icon"
    aria-hidden="true"
/>

                            <input
                                type="search"
                                placeholder="Search courses..."
                                value={search}
                                onChange={(event) =>
                                    setSearch(event.target.value)
                                }
                                aria-label="Search training courses"
                            />
                        </label>

                        <label className="training-course-select">
                            <span className="sr-only">
                                Filter by skill level
                            </span>

                            <select
                                value={selectedLevel}
                                onChange={(event) =>
                                    setSelectedLevel(event.target.value)
                                }
                            >
                                {levels.map((level) => (
                                    <option key={level} value={level}>
                                        {level === "All"
                                            ? "All Skill Levels"
                                            : level}
                                    </option>
                                ))}
                            </select>
                        </label>

                        <label className="training-course-select">
                            <span className="sr-only">Filter by duration</span>

                            <select
                                value={selectedDuration}
                                onChange={(event) =>
                                    setSelectedDuration(
                                        event.target.value === "All"
                                            ? "All"
                                            : Number(event.target.value)
                                    )
                                }
                            >
                                {durations.map((duration) => (
                                    <option key={duration} value={duration}>
                                        {duration === "All"
                                            ? "All Durations"
                                            : formatDuration(duration)}
                                    </option>
                                ))}
                            </select>
                        </label>

                        <button
                            type="button"
                            className="training-filter-reset"
                            onClick={clearFilters}
                            disabled={!hasActiveFilters}
                        >
                            Clear Filters
                        </button>
                    </div>

                    {/* Loading state */}
                    {loading && (
                        <div
                            className="training-state"
                            role="status"
                            aria-live="polite"
                        >
                            <span className="training-spinner" />

                            <h3>Discovering our courses...</h3>

                            <p>
                                Please wait while we load available training
                                courses.
                            </p>
                        </div>
                    )}

                    {/* Error state */}
                    {!loading && error && (
                        <div
                            className="training-state training-state--error"
                            role="alert"
                        >
                            <div className="training-state-icon">!</div>

                            <h3>Courses could not be loaded</h3>

                            <p>{error}</p>

                            <button
                                type="button"
                                onClick={() =>
                                    setRetryCount((count) => count + 1)
                                }
                            >
                                Try Again
                            </button>
                        </div>
                    )}

                    {/* Empty state */}
                    {!loading && !error && filteredPackages.length === 0 && (
                        <div className="training-state">
                            
<div className="training-empty-icon">
    <Cake size={48} aria-hidden="true" />
</div>
                            <h3>
                                {packages.length === 0
                                    ? "No courses available yet"
                                    : "No matching courses found"}
                            </h3>

                            <p>
                                {packages.length === 0
                                    ? "Please check back soon for upcoming training opportunities."
                                    : "Try another search term or adjust your filters."}
                            </p>

                            {hasActiveFilters && (
                                <button type="button" onClick={clearFilters}>
                                    Clear Filters
                                </button>
                            )}
                        </div>
                    )}

                    {/* Clean course cards: image, level, title, duration, price */}
                    {!loading && !error && filteredPackages.length > 0 && (
                        <>
                            <div className="training-courses-grid">
                                {filteredPackages.map((course) => {
                                    const imageUrl = resolveImageUrl(
                                        course.imageUrl
                                    );

                                    const level =
                                        String(course.skillLevel || "").trim() ||
                                        "All levels";

                                    return (
                                        <article
                                            className="training-course-card"
                                            key={course.id}
                                        >
                                            {/* Course image (placeholder if missing or broken) */}
                                            <div className="training-course-image">
                                                <div
                                                    className="training-image-placeholder"
                                                    hidden={Boolean(imageUrl)}
                                                >
                                                    <span aria-hidden="true">
                                                         <GraduationCap size={24} />
                                                    </span>
                                                    <p>SweetCakes Training</p>
                                                </div>

                                                {imageUrl && (
                                                    <img
                                                        src={imageUrl}
                                                        alt=""
                                                        loading="lazy"
                                                        onError={(event) => {
                                                            event.currentTarget.style.display =
                                                                "none";

                                                            event.currentTarget.parentElement
                                                                ?.querySelector(
                                                                    ".training-image-placeholder"
                                                                )
                                                                ?.removeAttribute(
                                                                    "hidden"
                                                                );
                                                        }}
                                                    />
                                                )}
                                            </div>

                                            <div className="training-course-card__body">
                                                <span
                                                    className={`training-level-pill ${getLevelClass(
                                                        level
                                                    )}`}
                                                >
                                                    {level}
                                                </span>

                                                <h3>
                                                    {/* Stretched link: the whole card is clickable */}
                                                    <Link
                                                        to={`/training/${course.id}`}
                                                        className="training-course-link"
                                                    >
                                                        {course.name}
                                                    </Link>
                                                </h3>

                                                <p className="training-course-duration">
                                                      <Clock
        size={16}
        className="training-duration-icon"
        aria-hidden="true"
    />
                                                    {formatDuration(
                                                        course.durationInDays
                                                    )}
                                                </p>

                                                <div className="training-course-card__footer">
                                                    <strong className="training-course-price">
                                                        {formatFee(course.fee)}
                                                    </strong>

                                                    <span
                                                        className="training-course-cta"
                                                        aria-hidden="true"
                                                    >
                                                        Enroll Now ›
                                                    </span>
                                                </div>
                                            </div>
                                        </article>
                                    );
                                })}
                            </div>

                            {/* Benefits panel below the course grid */}
                            <aside className="training-why-card">
                                <div className="training-why-card__intro">
                                    <span className="training-eyebrow">
                                        WHY CHOOSE SWEETCAKES?
                                    </span>

                                    <h3>Learn. Create. Grow.</h3>

                                    <p>
                                        Practical training for every skill
                                        level.
                                    </p>
                                </div>

                                <div className="training-why-items">
                                    <div className="training-why-item">
                                      <Sparkles size={16} aria-hidden="true" />

                                        <div>
                                            <h4>Practical Learning</h4>
                                            <p>
                                                Develop useful baking and
                                                decorating skills.
                                            </p>
                                        </div>
                                    </div>

                                    <div className="training-why-item">
                                       <Heart size={16} aria-hidden="true" />

                                        <div>
                                            <h4>Different Skill Levels</h4>
                                            <p>
                                                Courses for beginners through
                                                advanced learners.
                                            </p>
                                        </div>
                                    </div>

                                    <div className="training-why-item">
                                      <Clock size={16} aria-hidden="true" />

                                        <div>
                                            <h4>Available Schedules</h4>
                                            <p>
                                                Review open training batches
                                                before enrolling.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </aside>
                        </>
                    )}
                </section>

                {/* Bottom benefits strip */}
                <section
                    className="training-benefits"
                    aria-label="Benefits of SweetCakes training"
                >
                    <div className="training-benefit-item">
                       <Sparkles size={16} aria-hidden="true" />

                        <div>
                            <h3>Expert Learning</h3>
                            <p>Build practical baking and decorating skills.</p>
                        </div>
                    </div>

                    <div className="training-benefit-item">
                       <Heart size={16} aria-hidden="true" />

                        <div>
                            <h3>Learn Your Way</h3>
                            <p>Find courses suited to your experience.</p>
                        </div>
                    </div>

                    <div className="training-benefit-item">
                        <span aria-hidden="true">↗</span>

                        <div>
                            <h3>Grow Your Skills</h3>
                            <p>Take the next step in your baking journey.</p>
                        </div>
                    </div>
                </section>
            </main>
        </div>
    );
}
