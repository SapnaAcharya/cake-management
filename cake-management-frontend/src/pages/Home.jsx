import { useEffect, useState } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import cakeService from "../services/cakeService";
import categoryService from "../services/categoryService";
import templateService from "../services/CakeTemplateService";
import { getImageUrl } from "../utils/imageUrl";
import cartService from "../services/cartService";
import { getGuestCartCount } from "../services/guestCartService";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Truck, CakeSlice, Palette, ShieldCheck } from "lucide-react";
import "../styles/Home.css";

// HERO SLIDER DATA
const heroSlides = [
    {
        id: 1,
        image: "/images/banners/banner1.PNG",
        eyebrow: "Fresh • Delicious • Handmade",
        title: "The Perfect Cake",
        titleLine2: "for Every Moment",
        description:
            "Explore our delicious collection of cakes made with love and the finest ingredients.",
        primaryButtonText: "Shop Cakes",
        primaryButtonLink: "/cakes",
        secondaryButtonText: "Design Your Cake",
        secondaryButtonLink: "/design-by-template",
    },
    {
        id: 2,
        image: "/images/banners/banner2.PNG",
        eyebrow: "Made For Your Special Moments",
        title: "Celebrate With",
        titleLine2: "Something Sweet",
        description:
            "Discover beautiful cakes made for birthdays, celebrations and unforgettable moments.",
        primaryButtonText: "Shop Cakes",
        primaryButtonLink: "/cakes",
        secondaryButtonText: "Design Your Cake",
        secondaryButtonLink: "/design-by-template",
    },
    {
        id: 3,
        image: "/images/banners/banner3.PNG",
        eyebrow: "Design • Customize • Celebrate",
        title: "Create Your Dream",
        titleLine2: "Cake",
        description:
            "Choose your flavor, frosting, decorations and message to create a cake that's uniquely yours.",
        primaryButtonText: "Shop Cakes",
        primaryButtonLink: "/cakes",
        secondaryButtonText: "Design Your Cake",
        secondaryButtonLink: "/design-by-template",
    },
];

function Home() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const searchQuery = searchParams.get("search") || "";

    // ---------- Cake state ----------
    const [cakes, setCakes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    // ---------- Category filter state ----------
    const [categories, setCategories] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState(null); // null = All

    // ---------- Hero slider state ----------
    const [currentSlide, setCurrentSlide] = useState(0);

    // ---------- Cart badge (the Navbar still shows it) ----------
    const [cartCount, setCartCount] = useState(0);

    // ---------- Featured templates ----------
    const [featuredTemplates, setFeaturedTemplates] = useState([]);

    const pageSize = 8;

    // HERO AUTOPLAY (restarts after manual change)
    useEffect(() => {
        const timer = setTimeout(() => {
            setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
        }, 5000);

        return () => clearTimeout(timer);
    }, [currentSlide]);

    // ============================================
    // LOAD CAKES (reloads on category change)
    // ============================================
    useEffect(() => {
        const loadCakes = async () => {
            try {
                setLoading(true);
                setError("");

                const data = await cakeService.getCakes(
                    1,
                    pageSize,
                    selectedCategory
                );

                setCakes(data.items || []);
            } catch (err) {
                console.error(err);
                setError(err.message || "Failed to load cakes.");
            } finally {
                setLoading(false);
            }
        };

        loadCakes();
    }, [selectedCategory]);

    // LOAD CATEGORIES
    useEffect(() => {
        const loadCategories = async () => {
            try {
                const data = await categoryService.getCategories();
                setCategories(Array.isArray(data) ? data : data.items || []);
            } catch (err) {
                console.error("Failed to load categories", err);
            }
        };

        loadCategories();
    }, []);

    // LOAD CART COUNT (guest or customer)
    useEffect(() => {
        const loadInitialCartCount = async () => {
            const token =
                localStorage.getItem("token") ||
                sessionStorage.getItem("token");

            if (!token) {
                setCartCount(getGuestCartCount());
                return;
            }

            try {
                const cart = await cartService.getCart();
                const count = cart.items.reduce(
                    (total, item) => total + item.quantity,
                    0
                );
                setCartCount(count);
            } catch (err) {
                console.error("Failed to load customer cart:", err);
            }
        };

        loadInitialCartCount();
    }, []);

    // LOAD FEATURED TEMPLATES
    useEffect(() => {
        let isMounted = true;

        const loadFeaturedTemplates = async () => {
            try {
                const data = await templateService.getFeaturedTemplates();
                const list = Array.isArray(data) ? data : data?.items || [];

                // Attach a ready-to-use `imageSrc` to every template
                const withImages = list.map((t) => {
                    const images = Array.isArray(t.images) ? t.images : [];
                    const fromList =
                        images.find(
                            (i) =>
                                String(i.imageType ?? "").toLowerCase() === "thumb"
                        ) ?? images[0];

                    const raw =
                        t.imageUrl ??
                        t.thumbUrl ??
                        t.image ??
                        fromList?.imageUrl ??
                        fromList?.url ??
                        null;

                    const imageSrc = raw
                        ? /^https?:\/\//i.test(raw)
                            ? raw
                            : getImageUrl(raw)
                        : null;

                    return { ...t, imageSrc };
                });

                if (isMounted) setFeaturedTemplates(withImages);
            } catch (err) {
                console.error("Failed to load featured templates:", err);
            }
        };

        loadFeaturedTemplates();

        return () => {
            isMounted = false;
        };
    }, []);

    // SEARCH FILTER (current page only)
    const filteredCakes = searchQuery
        ? cakes.filter(
              (cake) =>
                  cake.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                  cake.description
                      ?.toLowerCase()
                      .includes(searchQuery.toLowerCase())
          )
        : cakes;

    // HANDLERS
    const handleCategoryChange = (categoryId) => {
        setSelectedCategory(categoryId);
    };

    const handlePreviousSlide = () => {
        setCurrentSlide(
            (currentSlide - 1 + heroSlides.length) % heroSlides.length
        );
    };

    const handleNextSlide = () => {
        setCurrentSlide((currentSlide + 1) % heroSlides.length);
    };

    const handleSlideChange = (index) => {
        setCurrentSlide(index);
    };

    const slide = heroSlides[currentSlide];

    // RENDER
    return (
        <div className="home-page">
            <Navbar cartCount={cartCount} />

            <main className="home-content">
                {/* HERO SLIDER */}
                <section className="hero">
                    <img
                        src={slide.image}
                        alt={slide.title}
                        className={`hero-image slide-${currentSlide + 1}`}
                    />

                    <div className="hero-overlay" />

                    <div className="hero-text-card">
                        <div className="hero-text">
                            <div className="hero-eyebrow">{slide.eyebrow}</div>

                            <h1>
                                {slide.title}
                                <br />
                                {slide.titleLine2}
                            </h1>

                            <p>{slide.description}</p>

                            <div className="hero-actions">
                                <Link
                                    to={slide.primaryButtonLink}
                                    className="hero-btn primary"
                                >
                                    {slide.primaryButtonText}
                                </Link>

                                <Link
                                    to={slide.secondaryButtonLink}
                                    className="hero-btn secondary"
                                >
                                    {slide.secondaryButtonText}
                                </Link>
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
                                onClick={() => handleSlideChange(index)}
                                aria-label={`Go to slide ${index + 1}`}
                            />
                        ))}
                    </div>
                </section>

                {/* TRUST BAR */}
                <section className="trust-bar">
  <div className="trust-item">
    <Truck size={32} strokeWidth={1.8} />
    <div>
      <h4>Fast Delivery</h4>
      <p>Same-day delivery available</p>
    </div>
  </div>

  <div className="trust-item">
    <CakeSlice size={32} strokeWidth={1.8} />
    <div>
      <h4>Freshly Baked</h4>
      <p>Made daily with premium ingredients</p>
    </div>
  </div>

  <div className="trust-item">
    <Palette size={32} strokeWidth={1.8} />
    <div>
      <h4>Custom Designs</h4>
      <p>Create cakes your way</p>
    </div>
  </div>

  <div className="trust-item">
    <ShieldCheck size={32} strokeWidth={1.8} />
    <div>
      <h4>Secure Checkout</h4>
      <p>Safe and reliable ordering</p>
    </div>
  </div>
</section>

                {/* SHOP BY CATEGORY*/}
                <section className="shop-categories">
                    <div className="section-heading">
                        <span>Explore</span>
                        <h2>Shop By Category</h2>
                        <p>Discover cakes for every celebration and occasion.</p>
                    </div>

                    <div className="filter-chips">
                        <button
                            className={`chip ${
                                selectedCategory === null ? "active" : ""
                            }`}
                            onClick={() => handleCategoryChange(null)}
                        >
                            All
                        </button>

                        {categories.map((category) => (
                            <button
                                key={category.id}
                                className={`chip ${
                                    selectedCategory === category.id
                                        ? "active"
                                        : ""
                                }`}
                                onClick={() => handleCategoryChange(category.id)}
                            >
                                {category.name}
                            </button>
                        ))}
                    </div>
                </section>

                {/* POPULAR CAKES */}
                <section className="popular-section" id="popular-cakes">
                    <div className="popular-header">
                        <div className="popular-title">
                            <span className="section-tag">Our Collection</span>

                            <h2>
                                {searchQuery
                                    ? `Results for "${searchQuery}"`
                                    : selectedCategory === null
                                    ? "Popular Cakes"
                                    : categories.find(
                                          (c) => c.id === selectedCategory
                                      )?.name}
                            </h2>

                            <p>Freshly baked cakes for every celebration.</p>
                        </div>

                        <Link to="/cakes" className="popular-view-all">
                            View All
                            <ChevronRight size={16} />
                        </Link>
                    </div>

                    {loading ? (
                        <div className="popular-loading">Loading cakes...</div>
                    ) : error ? (
                        <div className="popular-error">{error}</div>
                    ) : filteredCakes.length === 0 ? (
                        <div className="popular-empty">
                            {searchQuery
                                ? `No cakes found matching "${searchQuery}".`
                                : "No cakes available in this category."}
                        </div>
                    ) : (
                        <div className="popular-grid">
                            {filteredCakes.map((cake) => (
                                <Link
                                    key={cake.id}
                                    to={`/cakes/${cake.id}`}
                                    state={{ cake }}
                                    className="cake-card"
                                >
                                    <div className="cake-card-image">
                                        <img
                                            src={getImageUrl(cake.imageUrl)}
                                            crossOrigin="anonymous"
                                            alt={cake.name}
                                            loading="lazy"
                                        />
                                    </div>

                                    <div className="cake-card-body">
                                        <h3 className="cake-name">{cake.name}</h3>

                                        <div className="cake-card-price">
                                            NPR {Number(cake.price).toLocaleString()}
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}
                </section>

                {/* FEATURED TEMPLATES*/}
                <section className="featured-templates">
                    <div className="section-heading">
                        <span>Design Your Own</span>
                        <h2>Featured Templates</h2>
                    </div>

                    <div className="template-grid">
                        {featuredTemplates.map((template) => (
                            <Link
                                key={template.id}
                                to={`/design-by-template?templateId=${template.id}`}
                                className="template-card"
                            >
                                {template.imageSrc && (
                                    <img
                                        src={template.imageSrc}
                                        alt={template.name || "Cake template"}
                                    />
                                )}
                                <h3>{template.name || "Custom Cake Template"}</h3>
                            </Link>
                        ))}
                    </div>
                </section>

                {/* CUSTOM CAKE PROMO*/}
                <section className="custom-promo">
                    <div className="custom-promo-content">
                        <div className="section-heading">
                            <span>Create Something Unique</span>
                        <h2>Create Your Dream Cake</h2>

                        <p>
                            Choose a template, customize colors, flavors,
                            decorations and messages.
                        </p>
                         </div>

                        
        <div className="custom-flow">
            <div>Choose Template</div>
            <span aria-hidden="true">→</span>
            <div>Customize</div>
            <span aria-hidden="true">→</span>
            <div>Checkout</div>
            <span aria-hidden="true">→</span>
            <div>Order</div>
        </div>

                        <button
                            type="button"
                            className="promo-btn"
                            onClick={() => navigate("/design-by-template")}
                        >
                            Start Designing Your Cake
                        </button>
                    </div>
                </section>

                {/* WHY CHOOSE US */}
                <section className="why-us">
                    <div className="section-heading">
                        <span>Why SweetCakes</span>
                        <h2>Why Choose Us</h2>
                    </div>

                    <div className="why-grid">
                        <div className="why-card">
                        <div className="why-card-icon">
                            <CakeSlice size={40} strokeWidth={1.8} />
                        </div>
                            <h4>Fresh Ingredients</h4>
                            <p>Premium quality ingredients.</p>
                        </div>

                        <div className="why-card">
                          <div className="why-card-icon">
                              <Truck size={40} strokeWidth={1.8} />
                            </div>
                            <h4>Fast Delivery</h4>
                            <p>Reliable and timely delivery.</p>
                        </div>

                        <div className="why-card">
                          <div className="why-card-icon">
                            <Palette size={40} strokeWidth={1.8} />
                            </div>
                            <h4>Custom Designs</h4>
                            <p>Design cakes your way.</p>
                        </div>

                        <div className="why-card">
                        <div className="why-card-icon">
                          <ShieldCheck size={40} strokeWidth={1.8} />
                        </div>
                            <h4>Secure Checkout</h4>
                            <p>Safe payment experience.</p>
                        </div>
                    </div>
                </section>

                {/* TESTIMONIALS*/}
            </main>
        </div>
    );
}

export default Home;
