import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
    ChevronLeft,
    ChevronRight,
    ChevronDown,
    Home,
    Search,
    SlidersHorizontal,
    ArrowUpDown,
    Cake,
    ArrowRight,
    X,
} from "lucide-react";
import Navbar from "../components/Navbar";
import cakeService from "../services/cakeService";
import cartService from "../services/cartService";
import { getGuestCartCount } from "../services/guestCartService";
import { getImageUrl } from "../utils/imageUrl";
import "../styles/Cakes.css";

const PAGE_SIZE = 8;
const FETCH_SIZE = 50;

// Change this to the route of your custom cake / design page
const CUSTOM_CAKE_PATH = "/design-by-template";

const PRICE_RANGES = [
    { value: "under-1000", label: "Under NPR 1,000", min: 0, max: 1000 },
    { value: "1000-1500", label: "NPR 1,000 - 1,500", min: 1000, max: 1500 },
    { value: "1500-2500", label: "NPR 1,500 - 2,500", min: 1500, max: 2500 },
    { value: "over-2500", label: "Over NPR 2,500", min: 2500, max: Infinity },
];

const SORT_OPTIONS = [
    { value: "featured", label: "Featured" },
    { value: "price-asc", label: "Price: Low to High" },
    { value: "price-desc", label: "Price: High to Low" },
    { value: "name-asc", label: "Name: A to Z" },
];

/*  field helpers (they only show a filter if your data has it)  */

const getCategory = (cake) =>
    cake.categoryName ||
    (typeof cake.category === "string" ? cake.category : cake.category?.name) ||
    "";

const getFlavour = (cake) => cake.flavour || cake.flavor || "";

const getSizes = (cake) => {
    const raw = cake.sizes || cake.cakeSizes || [];

    if (!Array.isArray(raw)) return [];

    return raw
        .map((size) =>
            typeof size === "string"
                ? size
                : size?.name || size?.label || size?.size || ""
        )
        .filter(Boolean);
};

const hasAvailability = (cake) => typeof cake.isAvailable === "boolean";

const unique = (values) => [...new Set(values.filter(Boolean))];

const toOptions = (values) =>
    values.map((value) => ({ value, label: value }));

/* small select used for every filter  */

function FilterSelect({ label, value, onChange, options }) {
    return (
        <div className={`cakes-select${value ? " is-active" : ""}`}>
            <select
                value={value}
                onChange={(e) => onChange(e.target.value)}
                aria-label={label}
            >
                <option value="">{label}</option>
                {options.map((option) => (
                    <option key={option.value} value={option.value}>
                        {option.label}
                    </option>
                ))}
            </select>
            <ChevronDown size={16} aria-hidden="true" />
        </div>
    );
}

function Cakes() {
    const [searchParams, setSearchParams] = useSearchParams();
    const searchQuery = searchParams.get("search") || "";

    const [allCakes, setAllCakes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [cartCount, setCartCount] = useState(0);

    // search box text (the URL ?search= is what actually filters)
    const [searchInput, setSearchInput] = useState(searchQuery);

    // filters + sort
    const [category, setCategory] = useState("");
    const [priceRange, setPriceRange] = useState("");
    const [flavour, setFlavour] = useState("");
    const [size, setSize] = useState("");
    const [availability, setAvailability] = useState("");
    const [sort, setSort] = useState("featured");

    const [pageNumber, setPageNumber] = useState(1);
    const listRef = useRef(null);

    //  Load ALL cakes once, filter / sort / page on the client 
    useEffect(() => {
        const loadCakes = async () => {
            try {
                setLoading(true);
                setError("");

                const first = await cakeService.getCakes(1, FETCH_SIZE);
                let items = first.items || [];
                const totalPages = first.totalPages || 1;

                if (totalPages > 1) {
                    const rest = await Promise.all(
                        Array.from({ length: totalPages - 1 }, (_, i) =>
                            cakeService.getCakes(i + 2, FETCH_SIZE)
                        )
                    );

                    rest.forEach((page) => {
                        items = items.concat(page.items || []);
                    });
                }

                setAllCakes(items);
            } catch (err) {
                console.error(err);
                setError(err.message || "Failed to load cakes.");
            } finally {
                setLoading(false);
            }
        };

        loadCakes();
    }, []);

    // Cart badge (guest or customer) 
    useEffect(() => {
        const loadCartCount = async () => {
            const token =
                localStorage.getItem("token") || sessionStorage.getItem("token");

            if (!token) {
                setCartCount(getGuestCartCount());
                return;
            }

            try {
                const cart = await cartService.getCart();
                setCartCount(
                    cart.items.reduce((total, item) => total + item.quantity, 0)
                );
            } catch {
                // leave the badge at 0
            }
        };

        loadCartCount();
    }, []);

    // Keep the search box in sync when the navbar search changes the URL
    useEffect(() => {
        setSearchInput(searchQuery);
    }, [searchQuery]);

    // Back to page 1 whenever the result set changes
    useEffect(() => {
        setPageNumber(1);
    }, [searchQuery, category, priceRange, flavour, size, availability, sort]);

    //  Filter options built from the real data 
    const categoryOptions = useMemo(
        () => toOptions(unique(allCakes.map(getCategory)).sort()),
        [allCakes]
    );

    const flavourOptions = useMemo(
        () => toOptions(unique(allCakes.map(getFlavour)).sort()),
        [allCakes]
    );

    const sizeOptions = useMemo(
        () =>
            toOptions(
                unique(allCakes.flatMap(getSizes)).sort(
                    (a, b) => parseFloat(a) - parseFloat(b) || a.localeCompare(b)
                )
            ),
        [allCakes]
    );

    const showAvailability = useMemo(
        () => allCakes.some(hasAvailability),
        [allCakes]
    );

    //  Apply search + filters + sort 
    const filteredCakes = useMemo(() => {
        const query = searchQuery.trim().toLowerCase();
        const range = PRICE_RANGES.find((r) => r.value === priceRange);

        const result = allCakes.filter((cake) => {
            if (query) {
                const text = [
                    cake.name,
                    cake.description,
                    getCategory(cake),
                    getFlavour(cake),
                ]
                    .join(" ")
                    .toLowerCase();

                if (!text.includes(query)) return false;
            }

            if (category && getCategory(cake) !== category) return false;
            if (flavour && getFlavour(cake) !== flavour) return false;
            if (size && !getSizes(cake).includes(size)) return false;

            if (range) {
                const price = Number(cake.price);
                if (price < range.min || price >= range.max) return false;
            }

            if (availability && hasAvailability(cake)) {
                const wantAvailable = availability === "available";
                if (cake.isAvailable !== wantAvailable) return false;
            }

            return true;
        });

        const sorted = [...result];

        if (sort === "price-asc") {
            sorted.sort((a, b) => Number(a.price) - Number(b.price));
        } else if (sort === "price-desc") {
            sorted.sort((a, b) => Number(b.price) - Number(a.price));
        } else if (sort === "name-asc") {
            sorted.sort((a, b) => (a.name || "").localeCompare(b.name || ""));
        }

        return sorted;
    }, [allCakes, searchQuery, category, priceRange, flavour, size, availability, sort]);

    //  Pagination (client side) 
    const totalPages = Math.max(1, Math.ceil(filteredCakes.length / PAGE_SIZE));
    const startIndex = (pageNumber - 1) * PAGE_SIZE;
    const pageCakes = filteredCakes.slice(startIndex, startIndex + PAGE_SIZE);

    const goToPage = (page) => {
        setPageNumber(page);
        listRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    };

    // Handlers 
    const handleSearchSubmit = (e) => {
        e.preventDefault();

        const value = searchInput.trim();
        setSearchParams(value ? { search: value } : {});
    };

    const hasActiveFilters = Boolean(
        searchQuery || category || priceRange || flavour || size || availability
    );

    const clearAll = () => {
        setCategory("");
        setPriceRange("");
        setFlavour("");
        setSize("");
        setAvailability("");
        setSearchInput("");
        setSearchParams({});
    };

    return (
        <div className="cakes-page">
            <Navbar cartCount={cartCount} />

            {/*  HERO  */}
            <section className="cakes-hero">

                <div className="cakes-hero-title">
                    <h1>Our Cake Collection</h1>

                    <div className="cakes-hero-divider" aria-hidden="true">
                        <span />
                        <Cake size={22} />
                        <span />
                    </div>

                    <p>Find the perfect cake for your taste and occasion.</p>
                </div>
            </section>

            <main className="cakes-content">
                {/*  SEARCH  */}
                <form
                    className="cakes-search"
                    onSubmit={handleSearchSubmit}
                    role="search"
                >
                    <Search size={20} aria-hidden="true" />

                    <input
                        type="search"
                        value={searchInput}
                        onChange={(e) => setSearchInput(e.target.value)}
                        placeholder="Search cakes by name..."
                        aria-label="Search cakes"
                    />

                    <button type="submit">Search</button>
                </form>

                {/*  FILTERS  */}
                <div className="cakes-filters">
                    <div className="cakes-filters-label">
                        <SlidersHorizontal size={18} aria-hidden="true" />
                        Filter Cakes:
                    </div>

                    <div className="cakes-filters-group">
                        {categoryOptions.length > 0 && (
                            <FilterSelect
                                label="All Categories"
                                value={category}
                                onChange={setCategory}
                                options={categoryOptions}
                            />
                        )}

                        <FilterSelect
                            label="Price Range"
                            value={priceRange}
                            onChange={setPriceRange}
                            options={PRICE_RANGES}
                        />

                        {flavourOptions.length > 0 && (
                            <FilterSelect
                                label="Flavour"
                                value={flavour}
                                onChange={setFlavour}
                                options={flavourOptions}
                            />
                        )}

                        {sizeOptions.length > 0 && (
                            <FilterSelect
                                label="Size"
                                value={size}
                                onChange={setSize}
                                options={sizeOptions}
                            />
                        )}

                    </div>

                    <div className="cakes-sort">
                        <ArrowUpDown size={18} aria-hidden="true" />
                        <span>Sort By:</span>

                        <div className="cakes-select">
                            <select
                                value={sort}
                                onChange={(e) => setSort(e.target.value)}
                                aria-label="Sort cakes"
                            >
                                {SORT_OPTIONS.map((option) => (
                                    <option key={option.value} value={option.value}>
                                        {option.label}
                                    </option>
                                ))}
                            </select>
                            <ChevronDown size={16} aria-hidden="true" />
                        </div>
                    </div>
                </div>

                {/*  LIST HEADING  */}
                <div className="cakes-list-head" ref={listRef}>
                    <h2>
                        <Cake size={28} aria-hidden="true" />
                        {searchQuery ? `Results for "${searchQuery}"` : "All Cakes"}
                    </h2>

                    {!loading && !error && filteredCakes.length > 0 && (
                        <p className="cakes-count">
                            Showing {startIndex + 1}-
                            {Math.min(startIndex + PAGE_SIZE, filteredCakes.length)} of{" "}
                            {filteredCakes.length} cakes
                        </p>
                    )}
                </div>

                {/*  RESULTS  */}
                {loading ? (
                    <div
                        className="cakes-grid cakes-skeleton-grid"
                        role="status"
                        aria-label="Loading cakes"
                    >
                        {Array.from({ length: PAGE_SIZE }, (_, index) => (
                            <div
                                className="cakes-skeleton-card"
                                key={index}
                                aria-hidden="true"
                            >
                                <div className="cakes-skeleton-image" />
                                <div className="cakes-skeleton-copy">
                                    <div className="cakes-skeleton-line cakes-skeleton-name" />
                                    <div className="cakes-skeleton-line cakes-skeleton-price" />
                                </div>
                            </div>
                        ))}
                    </div>
                ) : error ? (
                    <div className="cakes-error">{error}</div>
                ) : filteredCakes.length === 0 ? (
                    <div className="cakes-empty">
                        <Search size={30} aria-hidden="true" />
                        <h3>No cakes found</h3>
                        <p>
                            {hasActiveFilters
                                ? "Try changing or clearing your search and filters."
                                : "No cakes available right now."}
                        </p>

                        {hasActiveFilters && (
                            <button type="button" onClick={clearAll}>
                                <X size={16} />
                                Clear all filters
                            </button>
                        )}
                    </div>
                ) : (
                    <>
                        <div className="cakes-grid">
                            {pageCakes.map((cake) => {
                                const sizes = getSizes(cake);
                                const soldOut = cake.isAvailable === false;

                                return (
                                    <article className="cake-card" key={cake.id}>
                                        <Link
                                            to={`/cakes/${cake.slug}`}
                                            state={{ cake }}
                                            className="cake-card-image"
                                        >
                                            <img
                                                src={getImageUrl(cake.imageUrl)}
                                                alt={cake.name}
                                                loading="lazy"
                                            />

                                            {soldOut && (
                                                <span className="cake-card-badge">
                                                    Sold out
                                                </span>
                                            )}
                                        </Link>

                                        <div className="cake-card-body">
                                            <h3>
                                                <Link
                                                    to={`/cakes/${cake.slug}`}
                                                    state={{ cake }}
                                                >
                                                    {cake.name}
                                                </Link>
                                            </h3>

                                            {cake.description && (
                                                <p className="cake-card-desc">
                                                    {cake.description}
                                                </p>
                                            )}

                                            <div className="cake-card-price">
                                                NPR {Number(cake.price).toLocaleString()}
                                            </div>

                                            {sizes.length > 0 && (
                                                <ul className="cake-card-sizes">
                                                    {sizes.slice(0, 4).map((item) => (
                                                        <li key={item}>{item}</li>
                                                    ))}
                                                </ul>
                                            )}
                                        </div>
                                    </article>
                                );
                            })}
                        </div>

                        {totalPages > 1 && (
                            <div className="pagination">
                                <button
                                    onClick={() => goToPage(Math.max(pageNumber - 1, 1))}
                                    disabled={pageNumber === 1}
                                    aria-label="Previous page"
                                >
                                    <ChevronLeft size={16} />
                                </button>

                                {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                                    (page) => (
                                        <button
                                            key={page}
                                            onClick={() => goToPage(page)}
                                            className={page === pageNumber ? "active" : ""}
                                            aria-current={
                                                page === pageNumber ? "page" : undefined
                                            }
                                        >
                                            {page}
                                        </button>
                                    )
                                )}

                                <button
                                    onClick={() =>
                                        goToPage(Math.min(pageNumber + 1, totalPages))
                                    }
                                    disabled={pageNumber === totalPages}
                                    aria-label="Next page"
                                >
                                    <ChevronRight size={16} />
                                </button>
                            </div>
                        )}
                    </>
                )}

                {/*  CUSTOM CAKE BANNER*/}
                <section className="cakes-custom-banner">

                    <h2>Have a Cake Design in Mind?</h2>
                    <p>
                        Create a custom cake with your favourite flavours, colours
                        and decorations.
                    </p>

                     <Link to={CUSTOM_CAKE_PATH} className="cakes-custom-banner-btn">
                        Design Your Custom Cake
                        <ArrowRight size={18} />
                    </Link> 
                </section>
            </main>
        </div>
    );
}

export default Cakes;