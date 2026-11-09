import { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import {
    ChevronRight,
    Minus,
    Plus,
    Star,
    Clock,
    Users,
    Scale,
    Egg,
    Truck,
    Zap,
    MapPin,
    Wallet,
    Sparkles,
    Heart,
    ShieldCheck,
    CakeSlice,
} from "lucide-react";

import Navbar from "../components/Navbar";
import cakeService from "../services/cakeService";
import cartService from "../services/cartService";
import { getImageUrl } from "../utils/imageUrl";
import "../styles/CakeDetails.css";

const DESCRIPTION_LIMIT = 180;

const LOVE_POINTS = [
    {
        icon: Sparkles,
        title: "Freshly Baked",
        text: "Baked to order with premium ingredients, never frozen.",
    },
    {
        icon: Heart,
        title: "Made With Care",
        text: "Every cake is finished by hand by our bakers.",
    },
    {
        icon: Truck,
        title: "Reliable Delivery",
        text: "Arrives fresh and on time across Kathmandu Valley.",
    },
    {
        icon: ShieldCheck,
        title: "Secure Checkout",
        text: "Safe payment and easy order tracking.",
    },
];

function CakeDetails() {
    const { slug } = useParams();
    const navigate = useNavigate();
    const location = useLocation();

    const [cake, setCake] = useState(location.state?.cake ?? null);
    const [loading, setLoading] = useState(!location.state?.cake);
    const [error, setError] = useState("");

    const [quantity, setQuantity] = useState(1);
    const [expanded, setExpanded] = useState(false);
    const [adding, setAdding] = useState(false);
    const [cartCount, setCartCount] = useState(0);
    const [toast, setToast] = useState(null);

    const [activeImage, setActiveImage] = useState(0);
    const [related, setRelated] = useState([]);

    // --------------------------------------------------
    // Load cake details using its slug
    // --------------------------------------------------

    useEffect(() => {
        let cancelled = false;

        const loadCake = async () => {
            try {
                setLoading(true);
                setError("");

                const data = await cakeService.getCakeBySlug(slug);

                if (!cancelled) {
                    setCake(data);
                    setActiveImage(0);
                    setQuantity(1);
                    setExpanded(false);
                }
            } catch (err) {
                if (!cancelled) {
                    setError(err.message || "Failed to load this cake.");
                    setCake(null);
                }
            } finally {
                if (!cancelled) {
                    setLoading(false);
                }
            }
        };

        loadCake();
        window.scrollTo(0, 0);

        return () => {
            cancelled = true;
        };
    }, [slug]);

    // --------------------------------------------------
    // Load related cakes
    // --------------------------------------------------

    useEffect(() => {
        if (!cake?.id) return;

        let cancelled = false;

        const loadRelatedCakes = async () => {
            try {
                const response = await cakeService.getCakes();

                const list = Array.isArray(response)
                    ? response
                    : response?.items ?? [];

                const otherCakes = list.filter(
                    (item) => String(item.id) !== String(cake.id)
                );

                const sameCategory = otherCakes.filter(
                    (item) =>
                        cake.categoryName &&
                        item.categoryName === cake.categoryName
                );

                const picks = (
                    sameCategory.length >= 4
                        ? sameCategory
                        : otherCakes
                ).slice(0, 4);

                if (!cancelled) {
                    setRelated(picks);
                }
            } catch (err) {
                console.error("Failed to load related cakes:", err);
            }
        };

        loadRelatedCakes();

        return () => {
            cancelled = true;
        };
    }, [cake?.id, cake?.categoryName]);

    // --------------------------------------------------
    // Load cart count for guest and authenticated users
    // --------------------------------------------------

    useEffect(() => {
        let cancelled = false;

        const loadCartCount = async () => {
            try {
                const cart = await cartService.getCart();

                const items = cart?.items ?? [];

                const count = items.reduce(
                    (total, item) =>
                        total + Number(item.quantity || 0),
                    0
                );

                if (!cancelled) {
                    setCartCount(count);
                }
            } catch (err) {
                console.error("Failed to load cart count:", err);

                if (!cancelled) {
                    setCartCount(0);
                }
            }
        };

        loadCartCount();

        return () => {
            cancelled = true;
        };
    }, []);

    // --------------------------------------------------
    // Toast notification
    // --------------------------------------------------

    const showToast = (message, type = "success") => {
        setToast({ message, type });

        setTimeout(() => {
            setToast(null);
        }, 2500);
    };

    // --------------------------------------------------
    // Add cake to cart
    // Personalized message will be added on Cart Page.
    // Works for guest and authenticated customers.
    // --------------------------------------------------

    const handleAddToCart = async () => {
        if (!cake?.id) {
            showToast("Cake information is unavailable.", "error");
            return;
        }

        try {
            setAdding(true);

            const updatedCart = await cartService.addToCart(
                cake.id,
                quantity,
                cake,
                null,
                null,
                ""
            );

            const items = updatedCart?.items ?? [];

            const updatedCount = items.reduce(
                (total, item) =>
                    total + Number(item.quantity || 0),
                0
            );

            setCartCount(updatedCount);

            showToast(`${cake.name} added to cart`);

            navigate(`/cart/${cake.slug ?? slug}`);
        } catch (err) {
            console.error("Failed to add cake to cart:", err);

            showToast(
                err.message || "Could not add this cake to your cart.",
                "error"
            );
        } finally {
            setAdding(false);
        }
    };

    // --------------------------------------------------
    // Navigate to cake customization
    // --------------------------------------------------

    const handleCustomize = () => {
        if (!cake) return;

        navigate(
            `/design-by-template/${cake.slug ?? slug}`,
            {
                state: { cake },
            }
        );
    };

    // --------------------------------------------------
    // Derived data
    // --------------------------------------------------

    const description = cake?.description ?? "";
    const isLong = description.length > DESCRIPTION_LIMIT;

    const images = useMemo(() => {
        if (!cake) return [];

        const extraImages = (cake.images ?? [])
            .map((item) =>
                typeof item === "string"
                    ? item
                    : item?.imageUrl
            )
            .filter(Boolean);

        return extraImages.length
            ? extraImages
            : [cake.imageUrl].filter(Boolean);
    }, [cake]);

    const rating = Number(
        cake?.rating ?? cake?.averageRating ?? 0
    );

    const reviewCount = Number(
        cake?.reviewCount ?? cake?.reviewsCount ?? 0
    );

    const badges = cake
        ? [
              cake.weight && {
                  icon: Scale,
                  label: "Weight",
                  value: cake.weight,
              },
              cake.serves && {
                  icon: Users,
                  label: "Serves",
                  value: cake.serves,
              },
              cake.preparationTime && {
                  icon: Clock,
                  label: "Prep time",
                  value: cake.preparationTime,
              },
              cake.isEggless !== undefined && {
                  icon: Egg,
                  label: "Type",
                  value: cake.isEggless
                      ? "Eggless"
                      : "Contains egg",
              },
          ].filter(Boolean)
        : [];

    const specs = cake
        ? [
              ["Category", cake.categoryName],
              ["Flavour", cake.flavor ?? cake.flavour],
              ["Weight", cake.weight],
              ["Serves", cake.serves],
              ["Shape", cake.shape],
              ["Layers", cake.layers],
              ["Ingredients", cake.ingredients],
              ["Shelf life", cake.shelfLife],
          ].filter(([, value]) => value)
        : [];

    // --------------------------------------------------
    // Render
    // --------------------------------------------------

    return (
        <div className="cake-details-page">
            <Navbar cartCount={cartCount} />

            {toast && (
                <div
                    className={`toast toast-${toast.type}`}
                    role="status"
                >
                    {toast.message}
                </div>
            )}

            <main className="cake-details-content">
                {loading ? (
                    <div className="cake-details-state">
                        Loading cake...
                    </div>
                ) : error && !cake ? (
                    <div className="cake-details-state cake-details-state-error">
                        {error}
                        <Link to="/cakes">
                            Back to all cakes
                        </Link>
                    </div>
                ) : cake ? (
                    <>
                        {/* Breadcrumb */}
                        <nav
                            className="cake-breadcrumb"
                            aria-label="Breadcrumb"
                        >
                            <Link to="/">Home</Link>
                            <ChevronRight size={14} />

                            <Link to="/cakes">Cakes</Link>
                            <ChevronRight size={14} />

                            <span aria-current="page">
                                {cake.name}
                            </span>
                        </nav>

                        {/* Image and cake overview */}
                        <div className="cake-details-layout">

                            {/* Image gallery */}
                            <div className="cake-details-gallery">
                                <div className="cake-details-media">
                                    <img
                                        src={getImageUrl(
                                            images[activeImage] ??
                                            cake.imageUrl
                                        )}
                                        crossOrigin="anonymous"
                                        alt={cake.name}
                                    />
                                </div>

                                {images.length > 1 && (
                                    <div className="cake-details-thumbs">
                                        {images.map((img, index) => (
                                            <button
                                                key={`${img}-${index}`}
                                                type="button"
                                                className={
                                                    index === activeImage
                                                        ? "active"
                                                        : ""
                                                }
                                                onClick={() =>
                                                    setActiveImage(index)
                                                }
                                                aria-label={`Show image ${index + 1}`}
                                            >
                                                <img
                                                    src={getImageUrl(img)}
                                                    crossOrigin="anonymous"
                                                    alt=""
                                                />
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Cake information */}
                            <div className="cake-details-info">

                                {cake.categoryName && (
                                    <span className="cake-details-category">
                                        {cake.categoryName}
                                    </span>
                                )}

                                <h1>{cake.name}</h1>

                                {/* Rating */}
                                <div className="cake-details-rating">
                                    <span
                                        className="stars"
                                        aria-label={`${rating} out of 5`}
                                    >
                                        {[1, 2, 3, 4, 5].map((number) => (
                                            <Star
                                                key={number}
                                                size={16}
                                                className={
                                                    number <= Math.round(rating)
                                                        ? "filled"
                                                        : ""
                                                }
                                            />
                                        ))}
                                    </span>

                                    <span className="reviews">
                                        {reviewCount > 0
                                            ? `${rating.toFixed(1)} · ${reviewCount} review${
                                                  reviewCount === 1
                                                      ? ""
                                                      : "s"
                                              }`
                                            : "No reviews yet"}
                                    </span>
                                </div>

                                {/* Price */}
                                <div className="cake-details-price">
                                    NPR{" "}
                                    {Number(cake.price).toLocaleString()}
                                </div>

                                {/* Description */}
                                {description && (
                                    <div className="cake-details-description">
                                        <p
                                            className={
                                                expanded || !isLong
                                                    ? ""
                                                    : "clamped"
                                            }
                                        >
                                            {description}
                                        </p>

                                        {isLong && (
                                            <button
                                                type="button"
                                                className="cake-details-readmore"
                                                onClick={() =>
                                                    setExpanded(!expanded)
                                                }
                                            >
                                                {expanded
                                                    ? "Show less"
                                                    : "Read more"}
                                            </button>
                                        )}
                                    </div>
                                )}

                                {/* Quick information */}
                                {badges.length > 0 && (
                                    <div className="cake-details-badges">
                                        {badges.map(
                                            ({
                                                icon: Icon,
                                                label,
                                                value,
                                            }) => (
                                                <div
                                                    className="cake-details-badge"
                                                    key={label}
                                                >
                                                    <Icon size={18} />

                                                    <div>
                                                        <small>{label}</small>
                                                        <strong>{value}</strong>
                                                    </div>
                                                </div>
                                            )
                                        )}
                                    </div>
                                )}

                                {/* Order information */}
                                <div className="cake-details-order">
                                    <h3>Order Information</h3>

                                    <div className="order-row">
                                        <Wallet size={18} />

                                        <div>
                                            <strong>Starting price</strong>
                                            <p>
                                                NPR{" "}
                                                {Number(
                                                    cake.price
                                                ).toLocaleString()}{" "}
                                                for the base cake. The final
                                                price may change with the
                                                options you choose when
                                                customizing.
                                            </p>
                                        </div>
                                    </div>

                                    <div className="order-row">
                                        <Truck size={18} />

                                        <div>
                                            <strong>Standard Delivery</strong>
                                            <p>
                                                Delivered within 24–48 hours.
                                            </p>
                                        </div>
                                    </div>

                                    <div className="order-row">
                                        <Zap size={18} />

                                        <div>
                                            <strong>Same-Day Delivery</strong>
                                            <p>
                                                Available for selected
                                                locations when ordered
                                                before 12 PM.
                                            </p>
                                        </div>
                                    </div>

                                    <div className="order-row">
                                        <MapPin size={18} />

                                        <div>
                                            <strong>
                                                Delivery Area &amp; Charge
                                            </strong>
                                            <p>
                                                Within Kathmandu Valley,
                                                starting from NPR 150.
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Quantity and add to cart */}
                                <div className="cake-details-actions">

                                    <div
                                        className="cake-details-qty"
                                        aria-label="Quantity"
                                    >
                                        <button
                                            type="button"
                                            onClick={() =>
                                                setQuantity((current) =>
                                                    Math.max(
                                                        1,
                                                        current - 1
                                                    )
                                                )
                                            }
                                            disabled={quantity === 1}
                                            aria-label="Decrease quantity"
                                        >
                                            <Minus size={16} />
                                        </button>

                                        <span>{quantity}</span>

                                        <button
                                            type="button"
                                            onClick={() =>
                                                setQuantity((current) =>
                                                    Math.min(
                                                        20,
                                                        current + 1
                                                    )
                                                )
                                            }
                                            aria-label="Increase quantity"
                                        >
                                            <Plus size={16} />
                                        </button>
                                    </div>

                                    <button
                                        type="button"
                                        className="cake-details-btn primary"
                                        onClick={handleAddToCart}
                                        disabled={
                                            adding ||
                                            cake.isAvailable === false
                                        }
                                    >
                                        {adding
                                            ? "Adding..."
                                            : cake.isAvailable === false
                                              ? "Currently unavailable"
                                              : "Add to cart"}
                                    </button>
                                </div>

                                {/* Customize button */}
                                <button
                                    type="button"
                                    className="cake-details-btn secondary"
                                    onClick={handleCustomize}
                                >
                                    Customize Cake
                                </button>

                            </div>
                        </div>

                        {/* Cake specifications */}
                        {specs.length > 0 && (
                            <section className="cake-section">
                                <h2>Cake Specifications</h2>

                                <dl className="cake-specs">
                                    {specs.map(([label, value]) => (
                                        <div
                                            className="cake-spec-row"
                                            key={label}
                                        >
                                            <dt>{label}</dt>
                                            <dd>{value}</dd>
                                        </div>
                                    ))}
                                </dl>
                            </section>
                        )}

                        {/* Why customers love it */}
                        <section className="cake-section">
                            <h2>Why Customers Love It</h2>

                            <div className="cake-love-grid">
                                {LOVE_POINTS.map(
                                    ({ icon: Icon, title, text }) => (
                                        <div
                                            className="cake-love-card"
                                            key={title}
                                        >
                                            <span className="cake-love-icon">
                                                <Icon size={20} />
                                            </span>

                                            <h4>{title}</h4>
                                            <p>{text}</p>
                                        </div>
                                    )
                                )}
                            </div>
                        </section>

                        {/* Related cakes */}
                        {related.length > 0 && (
                            <section className="cake-section">
                                <h2>Related Cakes</h2>

                                <div className="cake-related-grid">
                                    {related.map((item) => (
                                        <Link
                                            to={`/cakes/${item.slug ?? item.id}`}
                                            state={{ cake: item }}
                                            className="cake-related-card"
                                            key={item.id}
                                        >
                                            <div className="cake-related-img">
                                                {item.imageUrl ? (
                                                    <img
                                                        src={getImageUrl(
                                                            item.imageUrl
                                                        )}
                                                        crossOrigin="anonymous"
                                                        alt={item.name}
                                                    />
                                                ) : (
                                                    <CakeSlice size={32} />
                                                )}
                                            </div>

                                            <div className="cake-related-body">
                                                <h4>{item.name}</h4>

                                                <span>
                                                    NPR{" "}
                                                    {Number(
                                                        item.price
                                                    ).toLocaleString()}
                                                </span>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            </section>
                        )}
                    </>
                ) : (
                    <div className="cake-details-state">
                        Cake not found.
                        <Link to="/cakes">Back to all cakes</Link>
                    </div>
                )}
            </main>
        </div>
    );
}

export default CakeDetails;
