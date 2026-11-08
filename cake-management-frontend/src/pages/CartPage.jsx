// import { useEffect, useState } from "react";
// import { useNavigate } from "react-router-dom";
// import {
//     getCart,
//     updateCartItem,
//     removeCartItem,
//     clearCart,
//     updatePersonalizedMessage
// } from "../services/cartService";
// import { ShoppingCart } from "lucide-react";
// import "../styles/CartPage.css";

// const CartPage = () => {
//     const navigate = useNavigate();

//     const [cart, setCart] = useState(null);
//     const [loading, setLoading] = useState(true);
//     const [error, setError] = useState("");
//     const [actionLoading, setActionLoading] = useState(null);

//     // Store message drafts separately until the customer saves them.
//     const [messageDrafts, setMessageDrafts] = useState({});

//     // --------------------------------------------------
//     // UPDATE CART STATE
//     // --------------------------------------------------
//     const updateCartState = (data) => {
//         setCart(data);

//         const drafts = {};

//         (data?.items || []).forEach((item) => {
//             const itemId =
//                 item.cartItemId ?? item.lineId ?? item.cakeId;

//             drafts[itemId] = item.personalizedMessage ?? "";
//         });

//         setMessageDrafts(drafts);
//     };

//     // --------------------------------------------------
//     // LOAD CART
//     // Used by remove, clear and retry actions.
//     // --------------------------------------------------
//     const loadCart = async (showLoading = false) => {
//         try {
//             if (showLoading) {
//                 setLoading(true);
//             }

//             setError("");

//             const data = await getCart();

//             updateCartState(data);

//         } catch (error) {
//             console.error("Error loading cart:", error);

//             setError(error.message || "Failed to load cart.");

//         } finally {
//             setLoading(false);
//         }
//     };

//     // --------------------------------------------------
//     // INITIAL CART LOAD
//     // --------------------------------------------------
//     useEffect(() => {
//         let isMounted = true;

//         const fetchInitialCart = async () => {
//             try {
//                 const data = await getCart();

//                 // Avoid updating state after component unmounts.
//                 if (!isMounted) return;

//                 updateCartState(data);

//             } catch (error) {
//                 if (!isMounted) return;

//                 console.error("Error loading cart:", error);

//                 setError(
//                     error.message || "Failed to load cart."
//                 );

//             } finally {
//                 if (isMounted) {
//                     setLoading(false);
//                 }
//             }
//         };

//         fetchInitialCart();

//         return () => {
//             isMounted = false;
//         };
//     }, []);

//     // --------------------------------------------------
//     // HELPERS
//     // --------------------------------------------------
//     const getItemId = (item) => {
//         return item.cartItemId ?? item.lineId ?? item.cakeId;
//     };

//     const getActionKey = (item) => {
//         return String(getItemId(item));
//     };

//     const isCustomizedCake = (item) => {
//         return (
//             item.isCustomized === true ||
//             !!item.customization ||
//             !!item.customizationDto ||
//             !!item.customizationJson
//         );
//     };

//     const isMessageDirty = (item) => {
//         const itemId = getItemId(item);

//         const currentMessage =
//             messageDrafts[itemId] ?? "";

//         const savedMessage =
//             item.personalizedMessage ?? "";

//         return currentMessage.trim() !== savedMessage.trim();
//     };

//     // --------------------------------------------------
//     // INCREASE QUANTITY
//     // --------------------------------------------------
//     const handleIncrease = async (item) => {
//         const actionKey = getActionKey(item);

//         try {
//             setActionLoading(actionKey);
//             setError("");

//             const updatedCart = await updateCartItem(
//                 item.cartItemId ?? item.lineId,
//                 Number(item.quantity) + 1
//             );

//          //   updateCartState(updatedCart);
//          setCart(updatedCart);

//         } catch (error) {
//             console.error("Error increasing quantity:", error);

//             setError(
//                 error.message || "Unable to update quantity."
//             );
//         } finally {
//             setActionLoading(null);
//         }
//     };

//     // --------------------------------------------------
//     // DECREASE QUANTITY
//     // --------------------------------------------------
//     const handleDecrease = async (item) => {
//         if (item.quantity <= 1) {
//             return;
//         }

//         const actionKey = getActionKey(item);

//         try {
//             setActionLoading(actionKey);
//             setError("");

//             const updatedCart = await updateCartItem(
//                 item.cartItemId ?? item.lineId,
//                 Number(item.quantity) - 1
//             );

//             setCart(updatedCart);

//         } catch (error) {
//             console.error("Error decreasing quantity:", error);

//             setError(
//                 error.message || "Unable to update quantity."
//             );
//         } finally {
//             setActionLoading(null);
//         }
//     };

//     // --------------------------------------------------
//     // REMOVE CART ITEM
//     // --------------------------------------------------
//     const handleRemove = async (item) => {
//         const actionKey = getActionKey(item);

//         try {
//             setActionLoading(actionKey);
//             setError("");

//             await removeCartItem(
//                 item.cartItemId ?? item.lineId
//             );

//             await loadCart();

//         } catch (error) {
//             console.error("Error removing cart item:", error);

//             setError(
//                 error.message || "Unable to remove cart item."
//             );
//         } finally {
//             setActionLoading(null);
//         }
//     };

//     // --------------------------------------------------
//     // CLEAR CART
//     // --------------------------------------------------
//     const handleClearCart = async () => {
//         const confirmed = window.confirm(
//             "Are you sure you want to clear your cart?"
//         );

//         if (!confirmed) {
//             return;
//         }

//         try {
//             setActionLoading("clear");
//             setError("");

//             await clearCart();

//             setMessageDrafts({});

//             await loadCart();

//         } catch (error) {
//             console.error("Error clearing cart:", error);

//             setError(
//                 error.message || "Unable to clear cart."
//             );
//         } finally {
//             setActionLoading(null);
//         }
//     };

//     // --------------------------------------------------
//     // UPDATE MESSAGE DRAFT
//     // --------------------------------------------------
//     const handleMessageChange = (item, value) => {
//         const itemId = getItemId(item);

//         setMessageDrafts((previous) => ({
//             ...previous,
//             [itemId]: value
//         }));
//     };

//     // --------------------------------------------------
//     // SAVE PERSONALIZED MESSAGE
//     // Works for guest and authenticated customers
//     // --------------------------------------------------

//     // --------------------------------------------------
// // SAVE PERSONALIZED MESSAGE
// // Works for guest and authenticated customers
// // --------------------------------------------------
// const handleSaveMessage = async (item) => {
//     const itemId = getItemId(item);
//     const actionKey = `message-${itemId}`;

//     try {
//         setActionLoading(actionKey);
//         setError("");

//         const personalizedMessage =
//             messageDrafts[itemId] ?? "";

//         const updatedCart = await updatePersonalizedMessage(
//             item.cartItemId ?? item.lineId,
//             personalizedMessage.trim()
//         );

//         // Update cart information returned by the backend.
//         setCart(updatedCart);

//         // Update only the saved item's draft.
//         // Other unsaved message drafts remain unchanged.
//         const updatedItem = updatedCart.items.find(
//             (cartItem) =>
//                 String(getItemId(cartItem)) === String(itemId)
//         );

//         if (updatedItem) {
//             setMessageDrafts((previous) => ({
//                 ...previous,
//                 [itemId]:
//                     updatedItem.personalizedMessage ?? ""
//             }));
//         }

//     } catch (error) {
//         console.error(
//             "Error saving personalized message:",
//             error
//         );

//         setError(
//             error.message ||
//             "Unable to save personalized message."
//         );
//     } finally {
//         setActionLoading(null);
//     }
// };
//     // const handleSaveMessage = async (item) => {
//     //     const itemId = getItemId(item);
//     //     const actionKey = `message-${itemId}`;

//     //     try {
//     //         setActionLoading(actionKey);
//     //         setError("");

//     //         const personalizedMessage =
//     //             messageDrafts[itemId] ?? "";

//     //         const updatedCart = await updatePersonalizedMessage(
//     //             item.cartItemId ?? item.lineId,
//     //             personalizedMessage
//     //         );

//     //         setCart(updatedCart);

//     //         // Update the local draft from the saved cart response.
//     //         const updatedItem = updatedCart.items.find(
//     //             (cartItem) =>
//     //                 String(getItemId(cartItem)) === String(itemId)
//     //         );

//     //         setMessageDrafts((previous) => ({
//     //             ...previous,
//     //             [itemId]:
//     //                 updatedItem?.personalizedMessage ?? ""
//     //         }));

//     //     } catch (error) {
//     //         console.error(
//     //             "Error saving personalized message:",
//     //             error
//     //         );

//     //         setError(
//     //             error.message ||
//     //             "Unable to save personalized message."
//     //         );
//     //     } finally {
//     //         setActionLoading(null);
//     //     }
//     // };

//     // --------------------------------------------------
//     // LOADING STATE
//     // --------------------------------------------------
//     if (loading) {
//         return (
//             <div className="cart-page">
//                 <div className="cart-loading">
//                     <p>Loading your cart...</p>
//                 </div>
//             </div>
//         );
//     }

//     // --------------------------------------------------
//     // ERROR STATE
//     // --------------------------------------------------
//     if (error && !cart) {
//         return (
//             <div className="cart-page">
//                 <div className="cart-error">
//                     <h2>Something went wrong</h2>

//                     <p>{error}</p>

//                     <button onClick={loadCart}>
//                         Try Again
//                     </button>
//                 </div>
//             </div>
//         );
//     }

//     // --------------------------------------------------
//     // EMPTY CART
//     // --------------------------------------------------
//     if (!cart || !cart.items || cart.items.length === 0) {
//         return (
//             <div className="cart-page">
//                 <div className="cart-container">

//                     <div className="cart-header">
//                         <h1>My Cart</h1>
//                     </div>

//                     {error && (
//                         <div className="cart-error-message">
//                             {error}
//                         </div>
//                     )}

//                     <div className="empty-cart">
//                         <div className="empty-cart-icon">
//                             <ShoppingCart
//                                 size={64}
//                                 strokeWidth={1.5}
//                             />
//                         </div>

//                         <h2>Your cart is empty</h2>

//                         <p>
//                             Looks like you haven't added any cakes
//                             to your cart yet.
//                         </p>

//                         <button
//                             className="continue-shopping-btn"
//                             onClick={() => navigate("/")}
//                         >
//                             Continue Shopping
//                         </button>
//                     </div>

//                 </div>
//             </div>
//         );
//     }

//     // --------------------------------------------------
//     // MAIN CART PAGE
//     // --------------------------------------------------
//     return (
//         <div className="cart-page">

//             <div className="cart-container">

//                 <div className="cart-header">

//                     <div>
//                         <h1>My Cart</h1>

//                         <p>
//                             {cart.items.length}{" "}
//                             {cart.items.length === 1
//                                 ? "item"
//                                 : "items"}{" "}
//                             in your cart
//                         </p>
//                     </div>

//                     <button
//                         className="clear-cart-btn"
//                         onClick={handleClearCart}
//                         disabled={actionLoading === "clear"}
//                     >
//                         {actionLoading === "clear"
//                             ? "Clearing..."
//                             : "Clear Cart"}
//                     </button>

//                 </div>

//                 {/* ERROR MESSAGE */}
//                 {error && (
//                     <div className="cart-error-message">
//                         {error}
//                     </div>
//                 )}

//                 {/* CART CONTENT */}
//                 <div className="cart-content">

//                     {/* CART ITEMS */}
//                     <div className="cart-items">

//                         {cart.items.map((item, index) => {

//                             const itemId = getItemId(item);
//                             const itemKey = `${itemId}-${index}`;

//                             const isUpdating =
//                                 actionLoading === getActionKey(item);

//                             const isSavingMessage =
//                                 actionLoading === `message-${itemId}`;

//                             const customized =
//                                 isCustomizedCake(item);

//                             const allowMessage =
//                                 !customized &&
//                                 item.allowMessage === true;

//                             const message =
//                                 messageDrafts[itemId] ?? "";

//                             const maxLength =
//                                 Number(item.maxMessageLength ?? 100);

//                             const additionalPrice =
//                                 Number(item.messageAdditionalPrice ?? 0);

//                             return (
//                                 <div
//                                     className="cart-item"
//                                     key={itemKey}
//                                 >

//                                     {/* CAKE INFORMATION */}
//                                     <div className="cart-item-info">

//                                         <h2>
//                                             {item.cakeName}
//                                         </h2>

//                                         <p className="cart-item-price">
//                                             Rs.{" "}
//                                             {Number(item.price ?? 0).toFixed(2)}
//                                         </p>

//                                     </div>

//                                     {/* PERSONALIZED MESSAGE */}
//                                     {allowMessage && (
//                                         <div className="cart-personalized-message">

//                                             <label
//                                                 htmlFor={`message-${itemId}`}
//                                             >
//                                                 {item.messageLabel ||
//                                                     "Personalized Message"}
//                                             </label>

//                                             <textarea
//                                                 id={`message-${itemId}`}
//                                                 value={message}
//                                                 placeholder={
//                                                     item.messagePlaceholder ||
//                                                     "Enter your message"
//                                                 }
//                                                 maxLength={maxLength}
//                                                 rows={3}
//                                                 onChange={(event) =>
//                                                     handleMessageChange(
//                                                         item,
//                                                         event.target.value
//                                                     )
//                                                 }
//                                                 disabled={
//                                                     isSavingMessage ||
//                                                     isUpdating
//                                                 }
//                                             />
// {/* 
//                                             <div className="cart-message-footer">

//                                                 <span>
//                                                     {message.length}/{maxLength} characters
//                                                 </span>

//                                                 <span>
//                                                     Additional charge: Rs.{" "}
//                                                     {additionalPrice.toFixed(2)}
//                                                 </span> 
//                                                 </di>*/}
//                                                 <div className="cart-message-footer">

//     <span>
//         {message.length}/{maxLength} characters
//     </span>

//     {message.trim().length > 0 && (
//         <span>
//             Additional charge: Rs.{" "}
//             {additionalPrice.toFixed(2)}
//         </span>
//     )}

// </div>

                                            

//                                             {isMessageDirty(item) && (
//                                                 <button
//                                                     type="button"
//                                                     className="save-message-btn"
//                                                     onClick={() =>
//                                                         handleSaveMessage(item)
//                                                     }
//                                                     disabled={
//                                                         isSavingMessage ||
//                                                         isUpdating
//                                                     }
//                                                 >
//                                                     {isSavingMessage
//                                                         ? "Saving..."
//                                                         : "Save Message"}
//                                                 </button>
//                                             )}

//                                         </div>
//                                     )}

//                                     const hasUnsavedMessages = () => {
//     return cart?.items?.some(
//         (item) =>
//             !isCustomizedCake(item) &&
//             item.allowMessage === true &&
//             isMessageDirty(item)
//     );
// };

//                                     {/* QUANTITY CONTROLS */}
//                                     <div className="quantity-section">

//                                         <span className="quantity-label">
//                                             Quantity
//                                         </span>

//                                         <div className="quantity-controls">

//                                             <button
//                                                 onClick={() =>
//                                                     handleDecrease(item)
//                                                 }
//                                                 disabled={
//                                                     item.quantity <= 1 ||
//                                                     isUpdating ||
//                                                     isSavingMessage
//                                                 }
//                                             >
//                                                 −
//                                             </button>

//                                             <span>
//                                                 {isUpdating
//                                                     ? "..."
//                                                     : item.quantity}
//                                             </span>

//                                             <button
//                                                 onClick={() =>
//                                                     handleIncrease(item)
//                                                 }
//                                                 disabled={
//                                                     isUpdating ||
//                                                     isSavingMessage
//                                                 }
//                                             >
//                                                 +
//                                             </button>

//                                         </div>

//                                     </div>

//                                     {/* SUBTOTAL */}
//                                     <div className="cart-item-subtotal">

//                                         <span>
//                                             Subtotal
//                                         </span>

//                                         <strong>
//                                             Rs.{" "}
//                                             {Number(
//                                                 item.subtotal ?? 0
//                                             ).toFixed(2)}
//                                         </strong>

//                                     </div>

//                                     {/* REMOVE BUTTON */}
//                                     <button
//                                         className="remove-item-btn"
//                                         onClick={() =>
//                                             handleRemove(item)
//                                         }
//                                         disabled={
//                                             isUpdating ||
//                                             isSavingMessage
//                                         }
//                                     >
//                                         {isUpdating
//                                             ? "Removing..."
//                                             : "Remove"}
//                                     </button>

//                                 </div>
//                             );
//                         })}

//                     </div>

//                     {/* CART SUMMARY */}
//                     <div className="cart-summary">

//                         <h2>
//                             Order Summary
//                         </h2>

//                         <div className="summary-row">

//                             <span>
//                                 Items
//                             </span>

//                             <span>
//                                 {cart.items.length}
//                             </span>

//                         </div>

//                         <div className="summary-row">

//                             <span>
//                                 Total
//                             </span>

//                             <strong>
//                                 Rs.{" "}
//                                 {Number(
//                                     cart.totalAmount ?? 0
//                                 ).toFixed(2)}
//                             </strong>

//                         </div>

//                         <div className="summary-divider" />

//                         <div className="summary-total">

//                             <span>
//                                 Total Amount
//                             </span>

//                             <strong>
//                                 Rs.{" "}
//                                 {Number(
//                                     cart.totalAmount ?? 0
//                                 ).toFixed(2)}
//                             </strong>

//                         </div>

//                         {/* CHECKOUT */}
//                         <button
//                             className="checkout-btn"
//                             onClick={() =>  {
//                                 if (hasUnsavedMessages()) {
//             setError(
//                 "Please save your personalized messages before proceeding to checkout."
//             );
//             return;
//         }
//                                 navigate("/checkout");
//     }}
//                             disabled={hasUnsavedMessages()}
//                         >
//                             Proceed to Checkout
//                         </button>

//                         {/* CONTINUE SHOPPING */}
//                         <button
//                             className="continue-shopping-btn"
//                             onClick={() => navigate("/")}
//                         >
//                             Continue Shopping
//                         </button>

//                     </div>

//                 </div>

//             </div>

//         </div>
//     );
// };

// export default CartPage;


import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
    getCart,
    updateCartItem,
    removeCartItem,
    clearCart,
    updatePersonalizedMessage
} from "../services/cartService";

import { ShoppingCart } from "lucide-react";
import "../styles/CartPage.css";

const CartPage = () => {
    const navigate = useNavigate();

    const [cart, setCart] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [actionLoading, setActionLoading] = useState(null);

    // Store message drafts separately until the customer saves them.
    const [messageDrafts, setMessageDrafts] = useState({});

    // --------------------------------------------------
    // HELPERS
    // --------------------------------------------------

    const getItemId = (item) => {
        return (
            item.cartItemId ??
            item.lineId ??
            item.id ??
            item.cakeId
        );
    };

    const getActionKey = (item) => {
        return String(getItemId(item));
    };

    const isCustomizedCake = (item) => {
        return (
            item.isCustomized === true ||
            !!item.customization ||
            !!item.customizationDto ||
            !!item.customizationJson
        );
    };

    const isMessageDirty = (item) => {
        const itemId = getItemId(item);

        const currentMessage =
            messageDrafts[itemId] ?? "";

        const savedMessage =
            item.personalizedMessage ?? "";

        return (
            currentMessage.trim() !==
            savedMessage.trim()
        );
    };

    const hasUnsavedMessages = () => {
        return (
            cart?.items?.some(
                (item) =>
                    !isCustomizedCake(item) &&
                    item.allowMessage === true &&
                    isMessageDirty(item)
            ) ?? false
        );
    };

    // --------------------------------------------------
    // UPDATE CART STATE
    // --------------------------------------------------

    const updateCartState = (data) => {
        setCart(data);

        const drafts = {};

        (data?.items || []).forEach((item) => {
            const itemId = getItemId(item);

            drafts[itemId] =
                item.personalizedMessage ?? "";
        });

        setMessageDrafts(drafts);
    };

    // --------------------------------------------------
    // LOAD CART
    // --------------------------------------------------

    const loadCart = async (showLoading = false) => {
        try {
            if (showLoading) {
                setLoading(true);
            }

            setError("");

            const data = await getCart();

            updateCartState(data);

        } catch (error) {
            console.error("Error loading cart:", error);

            setError(
                error.message || "Failed to load cart."
            );

        } finally {
            setLoading(false);
        }
    };

    // --------------------------------------------------
    // INITIAL CART LOAD
    // --------------------------------------------------

    useEffect(() => {
        let isMounted = true;

        const fetchInitialCart = async () => {
            try {
                const data = await getCart();

                if (!isMounted) return;

                updateCartState(data);

            } catch (error) {
                if (!isMounted) return;

                console.error(
                    "Error loading cart:",
                    error
                );

                setError(
                    error.message || "Failed to load cart."
                );

            } finally {
                if (isMounted) {
                    setLoading(false);
                }
            }
        };

        fetchInitialCart();

        return () => {
            isMounted = false;
        };
    }, []);

    // --------------------------------------------------
    // INCREASE QUANTITY
    // --------------------------------------------------

    const handleIncrease = async (item) => {
        const actionKey = getActionKey(item);

        try {
            setActionLoading(actionKey);
            setError("");

            const updatedCart = await updateCartItem(
                item.cartItemId ?? item.lineId ?? item.id,
                Number(item.quantity) + 1
            );

            // Preserve unsaved message drafts.
            setCart(updatedCart);

        } catch (error) {
            console.error(
                "Error increasing quantity:",
                error
            );

            setError(
                error.message ||
                "Unable to update quantity."
            );

        } finally {
            setActionLoading(null);
        }
    };

    // --------------------------------------------------
    // DECREASE QUANTITY
    // --------------------------------------------------

    const handleDecrease = async (item) => {
        if (item.quantity <= 1) {
            return;
        }

        const actionKey = getActionKey(item);

        try {
            setActionLoading(actionKey);
            setError("");

            const updatedCart = await updateCartItem(
                item.cartItemId ?? item.lineId ?? item.id,
                Number(item.quantity) - 1
            );

            // Preserve unsaved message drafts.
            setCart(updatedCart);

        } catch (error) {
            console.error(
                "Error decreasing quantity:",
                error
            );

            setError(
                error.message ||
                "Unable to update quantity."
            );

        } finally {
            setActionLoading(null);
        }
    };

    // --------------------------------------------------
    // REMOVE CART ITEM
    // --------------------------------------------------

    const handleRemove = async (item) => {
        const actionKey = getActionKey(item);

        try {
            setActionLoading(actionKey);
            setError("");

            await removeCartItem(
                item.cartItemId ?? item.lineId ?? item.id
            );

            await loadCart();

        } catch (error) {
            console.error(
                "Error removing cart item:",
                error
            );

            setError(
                error.message ||
                "Unable to remove cart item."
            );

        } finally {
            setActionLoading(null);
        }
    };

    // --------------------------------------------------
    // CLEAR CART
    // --------------------------------------------------

    const handleClearCart = async () => {
        const confirmed = window.confirm(
            "Are you sure you want to clear your cart?"
        );

        if (!confirmed) {
            return;
        }

        try {
            setActionLoading("clear");
            setError("");

            await clearCart();

            setMessageDrafts({});

            await loadCart();

        } catch (error) {
            console.error(
                "Error clearing cart:",
                error
            );

            setError(
                error.message ||
                "Unable to clear cart."
            );

        } finally {
            setActionLoading(null);
        }
    };

    // --------------------------------------------------
    // UPDATE MESSAGE DRAFT
    // --------------------------------------------------

    const handleMessageChange = (item, value) => {
        const itemId = getItemId(item);

        setMessageDrafts((previous) => ({
            ...previous,
            [itemId]: value
        }));
    };

    // --------------------------------------------------
    // SAVE PERSONALIZED MESSAGE
    // Guest and authenticated customers
    // --------------------------------------------------

    const handleSaveMessage = async (item) => {
        const itemId = getItemId(item);

        const actionKey = `message-${itemId}`;

        try {
            setActionLoading(actionKey);
            setError("");

            const personalizedMessage =
                messageDrafts[itemId] ?? "";

            const updatedCart =
                await updatePersonalizedMessage(
                    item.cartItemId ??
                    item.lineId ??
                    item.id,
                    personalizedMessage.trim()
                );

            // Update cart without resetting other drafts.
            setCart(updatedCart);

            // Update only the saved item's draft.
            const updatedItem =
                updatedCart.items.find(
                    (cartItem) =>
                        String(getItemId(cartItem)) ===
                        String(itemId)
                );

            if (updatedItem) {
                setMessageDrafts((previous) => ({
                    ...previous,
                    [itemId]:
                        updatedItem.personalizedMessage ?? ""
                }));
            }

        } catch (error) {
            console.error(
                "Error saving personalized message:",
                error
            );

            setError(
                error.message ||
                "Unable to save personalized message."
            );

        } finally {
            setActionLoading(null);
        }
    };

    // --------------------------------------------------
    // PROCEED TO CHECKOUT
    // --------------------------------------------------

    const handleCheckout = () => {
        if (hasUnsavedMessages()) {
            setError(
                "Please save your personalized messages before proceeding to checkout."
            );

            return;
        }

        setError("");

        navigate("/checkout");
    };

    // --------------------------------------------------
    // LOADING STATE
    // --------------------------------------------------

    if (loading) {
        return (
            <div className="cart-page">
                <div className="cart-loading">
                    <p>Loading your cart...</p>
                </div>
            </div>
        );
    }

    // --------------------------------------------------
    // ERROR STATE
    // --------------------------------------------------

    if (error && !cart) {
        return (
            <div className="cart-page">
                <div className="cart-error">
                    <h2>Something went wrong</h2>

                    <p>{error}</p>

                    <button onClick={() => loadCart()}>
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    // --------------------------------------------------
    // EMPTY CART
    // --------------------------------------------------

    if (
        !cart ||
        !cart.items ||
        cart.items.length === 0
    ) {
        return (
            <div className="cart-page">
                <div className="cart-container">

                    <div className="cart-header">
                        <h1>My Cart</h1>
                    </div>

                    {error && (
                        <div className="cart-error-message">
                            {error}
                        </div>
                    )}

                    <div className="empty-cart">

                        <div className="empty-cart-icon">
                            <ShoppingCart
                                size={64}
                                strokeWidth={1.5}
                            />
                        </div>

                        <h2>Your cart is empty</h2>

                        <p>
                            Looks like you haven't added any
                            cakes to your cart yet.
                        </p>

                        <button
                            className="continue-shopping-btn"
                            onClick={() => navigate("/")}
                        >
                            Continue Shopping
                        </button>

                    </div>

                </div>
            </div>
        );
    }

    // --------------------------------------------------
    // MAIN CART PAGE
    // --------------------------------------------------

    return (
        <div className="cart-page">

            <div className="cart-container">

                {/* CART HEADER */}

                <div className="cart-header">

                    <div>
                        <h1>My Cart</h1>

                        <p>
                            {cart.items.length}{" "}
                            {cart.items.length === 1
                                ? "item"
                                : "items"}{" "}
                            in your cart
                        </p>
                    </div>

                    <button
                        className="clear-cart-btn"
                        onClick={handleClearCart}
                        disabled={actionLoading === "clear"}
                    >
                        {actionLoading === "clear"
                            ? "Clearing..."
                            : "Clear Cart"}
                    </button>

                </div>

                {/* ERROR MESSAGE */}

                {error && (
                    <div className="cart-error-message">
                        {error}
                    </div>
                )}

                {/* CART CONTENT */}

                <div className="cart-content">

                    {/* CART ITEMS */}

                    <div className="cart-items">

                        {cart.items.map((item, index) => {

                            const itemId = getItemId(item);

                            const itemKey =
                                `${itemId}-${index}`;

                            const isUpdating =
                                actionLoading ===
                                getActionKey(item);

                            const isSavingMessage =
                                actionLoading ===
                                `message-${itemId}`;

                            const customized =
                                isCustomizedCake(item);

                            const allowMessage =
                                !customized &&
                                item.allowMessage === true;

                            const message =
                                messageDrafts[itemId] ?? "";

                            const maxLength = Math.max(
                                1,
                                Number(
                                    item.maxMessageLength ?? 100
                                )
                            );

                            const additionalPrice = Math.max(
                                0,
                                Number(
                                    item.messageAdditionalPrice ?? 0
                                )
                            );

                            const messageDirty =
                                isMessageDirty(item);

                            return (
                                <div
                                    className="cart-item"
                                    key={itemKey}
                                >

                                    {/* CAKE INFORMATION */}

                                    <div className="cart-item-info">

                                        <h2>
                                            {item.cakeName}
                                        </h2>

                                        <p className="cart-item-price">
                                            Rs.{" "}
                                            {Number(
                                                item.price ??
                                                item.unitPrice ??
                                                0
                                            ).toFixed(2)}
                                        </p>

                                    </div>

                                    {/* PERSONALIZED MESSAGE */}

                                    {allowMessage && (
                                        <div className="cart-personalized-message">

                                            <label
                                                htmlFor={`message-${itemId}`}
                                            >
                                                {item.messageLabel ||
                                                    "Personalized Message"}
                                            </label>

                                            <input
                                                type="text"
                                                id={`message-${itemId}`}
                                                value={message}
                                                placeholder={
                                                    item.messagePlaceholder ||
                                                    "Enter your message"
                                                }
                                                maxLength={maxLength}
                                                onChange={(event) =>
                                                    handleMessageChange(
                                                        item,
                                                        event.target.value
                                                    )
                                                }
                                                disabled={
                                                    isSavingMessage ||
                                                    isUpdating
                                                }
                                            />

                                            {/* MESSAGE FOOTER */}

                                            <div className="cart-message-footer">

                                                <span>
                                                    {message.length}/
                                                    {maxLength} characters
                                                </span>

                                                {message.trim().length > 0 && (
                                                    <span>
                                                        Message charge: Rs.{" "}
                                                        {additionalPrice.toFixed(2)}

                                                        {messageDirty &&
                                                            " (after saving)"}
                                                    </span>
                                                )}

                                            </div>

                                            {/* SAVE MESSAGE BUTTON */}

                                            {messageDirty && (
                                                <button
                                                    type="button"
                                                    className="save-message-btn"
                                                    onClick={() =>
                                                        handleSaveMessage(item)
                                                    }
                                                    disabled={
                                                        isSavingMessage ||
                                                        isUpdating
                                                    }
                                                >
                                                    {isSavingMessage
                                                        ? "Saving..."
                                                        : "Save Message"}
                                                </button>
                                            )}

                                        </div>
                                    )}

                                    {/* QUANTITY CONTROLS */}

                                    <div className="quantity-section">

                                        <span className="quantity-label">
                                            Quantity
                                        </span>

                                        <div className="quantity-controls">

                                            <button
                                                onClick={() =>
                                                    handleDecrease(item)
                                                }
                                                disabled={
                                                    item.quantity <= 1 ||
                                                    isUpdating ||
                                                    isSavingMessage
                                                }
                                            >
                                                −
                                            </button>

                                            <span>
                                                {isUpdating
                                                    ? "..."
                                                    : item.quantity}
                                            </span>

                                            <button
                                                onClick={() =>
                                                    handleIncrease(item)
                                                }
                                                disabled={
                                                    isUpdating ||
                                                    isSavingMessage
                                                }
                                            >
                                                +
                                            </button>

                                        </div>

                                    </div>

                                    {/* SUBTOTAL */}

                                    <div className="cart-item-subtotal">

                                        <span>
                                            Subtotal
                                        </span>

                                        <strong>
                                            Rs.{" "}
                                            {Number(
                                                item.subtotal ?? 0
                                            ).toFixed(2)}
                                        </strong>

                                    </div>

                                    {/* REMOVE BUTTON */}

                                    <button
                                        className="remove-item-btn"
                                        onClick={() =>
                                            handleRemove(item)
                                        }
                                        disabled={
                                            isUpdating ||
                                            isSavingMessage
                                        }
                                    >
                                        {isUpdating
                                            ? "Removing..."
                                            : "Remove"}
                                    </button>

                                </div>
                            );
                        })}

                    </div>

                    {/* CART SUMMARY */}

                    <div className="cart-summary">

                        <h2>
                            Order Summary
                        </h2>

                        <div className="summary-row">

                            <span>
                                Items
                            </span>

                            <span>
                                {cart.items.length}
                            </span>

                        </div>

                        <div className="summary-row">

                            <span>
                                Total
                            </span>

                            <strong>
                                Rs.{" "}
                                {Number(
                                    cart.totalAmount ?? 0
                                ).toFixed(2)}
                            </strong>

                        </div>

                        <div className="summary-divider" />

                        <div className="summary-total">

                            <span>
                                Total Amount
                            </span>

                            <strong>
                                Rs.{" "}
                                {Number(
                                    cart.totalAmount ?? 0
                                ).toFixed(2)}
                            </strong>

                        </div>

                        {/* CHECKOUT */}

                        <button
                            className="checkout-btn"
                            onClick={handleCheckout}
                            disabled={
                                hasUnsavedMessages() ||
                                actionLoading !== null
                            }
                        >
                            Proceed to Checkout
                        </button>

                        {/* CONTINUE SHOPPING */}

                        <button
                            className="continue-shopping-btn"
                            onClick={() => navigate("/")}
                        >
                            Continue Shopping
                        </button>

                    </div>

                </div>

            </div>

        </div>
    );
};

export default CartPage;

