import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Navbar from "../components/Navbar";
import cakeService from "../services/cakeService";
import cartService from "../services/cartService";
import { getGuestCartCount } from "../services/guestCartService";
import { getImageUrl } from "../utils/imageUrl";
import "../styles/Cakes.css";

function Cakes() {
    const [searchParams] = useSearchParams();
    const searchQuery = searchParams.get("search") || "";

    const [cakes, setCakes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [cartCount, setCartCount] = useState(0);

    const [pageNumber, setPageNumber] = useState(1);
    const pageSize = 8;
    const [totalPages, setTotalPages] = useState(0);

    // ---------- Load cakes ----------
    useEffect(() => {
        const loadCakes = async () => {
            try {
                setLoading(true);
                setError("");

                const data = await cakeService.getCakes(pageNumber, pageSize);

                setCakes(data.items || []);
                setTotalPages(data.totalPages || 0);
            } catch (err) {
                console.error(err);
                setError(err.message || "Failed to load cakes.");
            } finally {
                setLoading(false);
            }
        };

        loadCakes();
    }, [pageNumber]);

    // ---------- Cart badge (guest or customer) ----------
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

    const filteredCakes = searchQuery
        ? cakes.filter(
              (cake) =>
                  cake.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                  cake.description?.toLowerCase().includes(searchQuery.toLowerCase())
          )
        : cakes;

    return (
        <div className="cakes-page">
            <Navbar cartCount={cartCount} />

            <main className="cakes-content">
                <div className="cakes-header">
                    <h2>{searchQuery ? `Results for "${searchQuery}"` : "All Cakes"}</h2>
                    <p>
                        {searchQuery
                            ? "Showing cakes matching your search."
                            : "Browse our full collection of handcrafted cakes."}
                    </p>
                </div>

                {loading ? (
                    <div className="cakes-loading">Loading cakes...</div>
                ) : error ? (
                    <div className="cakes-error">{error}</div>
                ) : filteredCakes.length === 0 ? (
                    <div className="cakes-empty">
                        {searchQuery
                            ? `No cakes found matching "${searchQuery}".`
                            : "No cakes available right now."}
                    </div>
                ) : (
                    <>
                        <div className="cakes-grid">
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
                                            alt={cake.name}
                                            loading="lazy"
                                        />
                                    </div>

                                    <div className="cake-card-body">
                                        <h3>{cake.name}</h3>

                                        <div className="cake-card-footer">
                                            <div className="cake-card-price">
                                                NPR {Number(cake.price).toLocaleString()}
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>

                        {totalPages > 1 && (
                            <div className="pagination">
                                <button
                                    onClick={() => setPageNumber((p) => Math.max(p - 1, 1))}
                                    disabled={pageNumber === 1}
                                >
                                    <ChevronLeft size={16} /> Previous
                                </button>

                                {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                                    (page) => (
                                        <button
                                            key={page}
                                            onClick={() => setPageNumber(page)}
                                            className={page === pageNumber ? "active" : ""}
                                        >
                                            {page}
                                        </button>
                                    )
                                )}

                                <button
                                    onClick={() =>
                                        setPageNumber((p) => Math.min(p + 1, totalPages))
                                    }
                                    disabled={pageNumber === totalPages}
                                >
                                    Next <ChevronRight size={16} />
                                </button>
                            </div>
                        )}
                    </>
                )}
            </main>
        </div>
    );
}

export default Cakes;
