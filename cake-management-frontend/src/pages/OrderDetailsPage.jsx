// // // // import { useCallback, useEffect, useState } from "react";
// // // // import { useNavigate, useParams, useLocation } from "react-router-dom";
// // // // import { CheckCircle2, ArrowLeft } from "lucide-react";
// // // // import { getOrderByPublicId, getGuestOrderByPublicId } from "../services/orderservice";
// // // // import "../styles/OrderDetails.css";

// // // // const statusClass = (status) => {
// // // //     switch (status) {
// // // //         case "Pending": return "order-status pending";
// // // //         case "Confirmed": return "order-status confirmed";
// // // //         case "Preparing": return "order-status preparing";
// // // //         case "Shipped": return "order-status shipped";
// // // //         case "Delivered": return "order-status delivered";
// // // //         case "Cancelled": return "order-status cancelled";
// // // //         default: return "order-status";
// // // //     }
// // // // };

// // // // const formatDate = (date) => {
// // // //     if (!date) return "—";
// // // //     return new Date(date).toLocaleDateString("en-US", {
// // // //         year: "numeric",
// // // //         month: "short",
// // // //         day: "numeric",
// // // //         hour: "numeric",
// // // //         minute: "2-digit"
// // // //     });
// // // // };

// // // // const getToken = () => {
// // // //     return localStorage.getItem("token") || sessionStorage.getItem("token");
// // // // }

// // // // const OrderDetails = () => {
// // // //     const navigate = useNavigate();
// // // //     //const { orderId } = useParams();
// // // //     const { publicId } = useParams();
// // // //     const location = useLocation();

// // // //     const justPlaced = location.state?.justPlaced || false;

// // // //     const passedPhoneNumber = location.state?.phoneNumber || null;

// // // //     const isLoggedIn = Boolean(getToken());

// // // //     const [order, setOrder] = useState(null);
// // // //     const [loading, setLoading] = useState(true);
// // // //     const [error, setError] = useState("");

// // // //     const [guestPhoneInput, setGuestPhoneInput] = useState("");
// // // //     const [needsGuestPhone, setNeedsGuestPhone] = useState(false);

// // // //     // LOAD ORDER
// // // //      const loadOrder = useCallback(async (phoneOverride) => {
// // // //             try {
// // // //                 setLoading(true);
// // // //                 setError("");
// // // //                 setNeedsGuestPhone(false);

// // // //                 if (!publicId) {
// // // //                     setError("Invalid order reference.");
// // // //                 }
    
// // // //                 let data;
    
// // // //                 // if (isLoggedIn) {
// // // //                 //     data = await getOrderById(orderId);
// // // //                 // } else {
// // // //                 //     const phoneToUse = phoneOverride || passedPhoneNumber;
    
// // // //                 //     if (!phoneToUse) {
// // // //                 //         // No token, no phone number available — ask for it
// // // //                 //         // instead of calling the API with nothing to verify.
// // // //                 //         setNeedsGuestPhone(true);
// // // //                 //         setLoading(false);
// // // //                 //         return;
// // // //                 //     }
    
// // // //                 //     data = await getOrderById(orderId, phoneToUse);
// // // //                 // }

// // // //                 if (isLoggedIn) {
// // // //     data = await getOrderByPublicId(publicId);
// // // // } else {
// // // //     const phoneToUse = phoneOverride || passedPhoneNumber;

// // // //     if (!phoneToUse) {
// // // //         setNeedsGuestPhone(true);
// // // //         setLoading(false);
// // // //         return;
// // // //     }

// // // //     data = await getGuestOrderByPublicId(
// // // //         publicId,
// // // //         phoneToUse
// // // //     );
// // // // }
    
// // // //                 setOrder(data);
// // // //             } catch (err) {
// // // //                 console.error("Error loading order:", err);
// // // //                 setError(err.message || "Unable to load this order.");
// // // //             } finally {
// // // //                 setLoading(false);
// // // //             }
// // // //         }, [publicId, isLoggedIn, passedPhoneNumber]);

// // // //     useEffect(() => {
// // // //         // eslint-disable-next-line react-hooks/set-state-in-effect -- data fetch on mount, setState only runs after await
// // // //         loadOrder();
// // // //     }, [loadOrder]);

// // // //     const handleGuestPhoneSubmit = (e) => {
// // // //         e.preventDefault();
// // // //         if (guestPhoneInput.trim()){
// // // //             loadOrder(guestPhoneInput.trim());
// // // //         }
// // // //     };

// // // //     // LOADING STATE
// // // //     if (loading) {
// // // //         return (
// // // //             <div className="orderdetails-page">
// // // //                 <div className="orderdetails-loading">
// // // //                     <p>Loading order details...</p>
// // // //                 </div>
// // // //             </div>
// // // //         );
// // // //     }

// // // //     // Guest needs phone number to verify
// // // //      if (needsGuestPhone) {
// // // //         return (
// // // //             <div className="orderdetails-page">
// // // //                 <div className="orderdetails-error">
// // // //                     <h2>Verify your order</h2>
// // // //                     <p>Enter the phone number you used when placing this order.</p>

// // // //                     <form onSubmit={handleGuestPhoneSubmit} className="orderdetails-guest-form">
// // // //                         <input
// // // //                             type="tel"
// // // //                             value={guestPhoneInput}
// // // //                             onChange={(e) => setGuestPhoneInput(e.target.value)}
// // // //                             placeholder="98XXXXXXXX"
// // // //                             required
// // // //                         />
// // // //                         <button type="submit">View Order</button>
// // // //                     </form>
// // // //                 </div>
// // // //             </div>
// // // //         );
// // // //     }

// // // //     // ERROR STATE
// // // //     if (error || !order) {
// // // //         return (
// // // //             <div className="orderdetails-page">
// // // //                 <div className="orderdetails-error">
// // // //                     <h2>Order not found</h2>
// // // //                     <p>{error || "We couldn't find this order."}</p>
// // // //                     <button onClick={() => navigate("/orders")}>
// // // //                         Back to My Orders
// // // //                     </button>
// // // //                 </div>
// // // //             </div>
// // // //         );
// // // //     }

// // // //     // MAIN ORDER DETAILS
// // // //     return (
// // // //         <div className="orderdetails-page">
// // // //             <div className="orderdetails-container">

// // // //                 {/* CONFIRMATION BANNER (only right after checkout) */}
// // // //                 {justPlaced && (
// // // //                     <div className="orderdetails-confirmation">
// // // //                         <CheckCircle2 size={22} />
// // // //                         <div>
// // // //                             <h2>Order placed successfully!</h2>
// // // //                             <p>Thank you for your order. We've started preparing it.</p>
// // // //                         </div>
// // // //                     </div>
// // // //                 )}

// // // //                 {/* BACK LINK */}
// // // //                 <button
// // // //                     className="orderdetails-back-link"
// // // //                     onClick={() => navigate("/orders")}
// // // //                 >
// // // //                     <ArrowLeft size={15} />
// // // //                     Back to My Orders
// // // //                 </button>

// // // //                 {/* HEADER */}
// // // //                 <div className="orderdetails-header">
// // // //                     <div>
// // // //                         {/* <h1>Order #{order.orderId}</h1> */}
// // // //                         <h1>Order #{order.publicId}</h1>
// // // //                         <p>Placed on {formatDate(order.orderDate)}</p>
// // // //                     </div>

// // // //                     <span className={statusClass(order.status)}>
// // // //                         {order.status}
// // // //                     </span>
// // // //                 </div>

// // // //                 {/* INFO GRID */}
// // // //                 <div className="orderdetails-info-grid">
// // // //                     <div className="orderdetails-info-box">
// // // //                         <span>Shipping Address</span>
// // // //                         <strong>{order.shippingAddress}</strong>
// // // //                     </div>

// // // //                     <div className="orderdetails-info-box">
// // // //                         <span>Payment Method</span>
// // // //                         <strong>{order.paymentMethod}</strong>
// // // //                     </div>

// // // //                     <div className="orderdetails-info-box">
// // // //                         <span>Payment Status</span>
// // // //                         <strong>{order.paymentStatus}</strong>
// // // //                     </div>
// // // //                 </div>

// // // //                 {/* ITEMS */}
// // // //                 {/* <div className="orderdetails-items">
// // // //                     <h2>Items</h2>

// // // //                     <div className="orderdetails-items-table">
// // // //                         <div className="orderdetails-items-head">
// // // //                             <span>Cake</span>
// // // //                             <span>Qty</span>
// // // //                             <span>Unit Price</span>
// // // //                             <span>Subtotal</span>
// // // //                         </div>

// // // //                         {order.items.map((item) => (
// // // //                             <div className="orderdetails-item-row" key={item.orderItemId}>
// // // //                                 <span className="orderdetails-item-name">{item.cakeName}</span>
// // // //                                 <span>{item.quantity}</span>
// // // //                                 <span>Rs. {item.unitPrice.toFixed(2)}</span>
// // // //                                 <strong>Rs. {item.subtotal.toFixed(2)}</strong>
// // // //                             </div>
// // // //                         ))}
// // // //                     </div>
// // // //                 </div> */}

                
// // // // {/* ITEMS */}
// // // // <div className="orderdetails-items">
// // // //     <h2>Items</h2>

// // // //     <div className="orderdetails-items-list">
// // // //         {order.items.map((item) => {
// // // //             const personalizedMessage =
// // // //                 item.personalizedMessage?.trim() || "";

// // // //             const messageCharge =
// // // //                 Number(item.messageAdditionalPrice || 0);

// // // //             const unitPrice = Number(item.unitPrice || 0);
// // // //             const subtotal = Number(item.subtotal || 0);

// // // //             const cakePrice = unitPrice - messageCharge;

// // // //             const hasPersonalizedMessage =
// // // //                 personalizedMessage.length > 0 && !item.isCustomized;

// // // //             return (
// // // //                 <div
// // // //                     className="orderdetails-item-card"
// // // //                     key={item.orderItemId}
// // // //                 >
// // // //                     <div className="orderdetails-item-heading">
// // // //                         <div>
// // // //                             <h3>{item.cakeName}</h3>

// // // //                             <span className="orderdetails-item-type">
// // // //                                 {item.isCustomized
// // // //                                     ? "Customized Cake"
// // // //                                     : "Regular Cake"}
// // // //                             </span>
// // // //                         </div>

// // // //                         <span className="orderdetails-item-quantity">
// // // //                             Qty: {item.quantity}
// // // //                         </span>
// // // //                     </div>

// // // //                     {/* PERSONALIZED MESSAGE */}
// // // //                     {hasPersonalizedMessage && (
// // // //                         <div className="orderdetails-personalized-message">
// // // //                             <strong>Personalized Message</strong>
// // // //                             <p>{personalizedMessage}</p>
// // // //                         </div>
// // // //                     )}

// // // //                     {/* CUSTOMIZATION INFORMATION */}
// // // //                     {item.isCustomized && (
// // // //                         <div className="orderdetails-customized-info">
// // // //                             <strong>Customized Cake</strong>
// // // //                             <p>
// // // //                                 This cake was ordered with your selected
// // // //                                 customization options.
// // // //                             </p>
// // // //                         </div>
// // // //                     )}

// // // //                     {/* PRICE BREAKDOWN */}
// // // //                     <div className="orderdetails-item-pricing">

// // // //                         <div>
// // // //                             <span>Cake Price</span>
// // // //                             <strong>
// // // //                                 Rs. {cakePrice.toFixed(2)}
// // // //                             </strong>
// // // //                         </div>

// // // //                         {hasPersonalizedMessage && (
// // // //                             <div>
// // // //                                 <span>Message Charge (per cake)</span>
// // // //                                 <strong>
// // // //                                     Rs. {messageCharge.toFixed(2)}
// // // //                                 </strong>
// // // //                             </div>
// // // //                         )}

// // // //                         <div>
// // // //                             <span>Quantity</span>
// // // //                             <strong>{item.quantity}</strong>
// // // //                         </div>

// // // //                         <div>
// // // //                             <span>Final Unit Price</span>
// // // //                             <strong>
// // // //                                 Rs. {unitPrice.toFixed(2)}
// // // //                             </strong>
// // // //                         </div>

// // // //                         {hasPersonalizedMessage && (
// // // //                             <div>
// // // //                                 <span>Total Message Charge</span>
// // // //                                 <strong>
// // // //                                     Rs. {(messageCharge * item.quantity).toFixed(2)}
// // // //                                 </strong>
// // // //                             </div>
// // // //                         )}

// // // //                         <div className="orderdetails-item-subtotal">
// // // //                             <span>Subtotal</span>
// // // //                             <strong>
// // // //                                 Rs. {subtotal.toFixed(2)}
// // // //                             </strong>
// // // //                         </div>

// // // //                     </div>
// // // //                 </div>
// // // //             );
// // // //         })}
// // // //     </div>
// // // // </div>


// // // //                 {/* TOTAL */}
// // // //                 <div className="orderdetails-total">
// // // //                     <span>Total Amount</span>
// // // //                     <strong>Rs. {order.totalAmount.toFixed(2)}</strong>
// // // //                 </div>

// // // //                 {/* ACTIONS */}
// // // //                 <div className="orderdetails-actions">
// // // //                     <button
// // // //                         className="orderdetails-browse-btn"
// // // //                         onClick={() => navigate("/")}
// // // //                     >
// // // //                         Continue Shopping
// // // //                     </button>
// // // //                 </div>

// // // //             </div>
// // // //         </div>
// // // //     );
// // // // };

// // // // export default OrderDetails;


// // // import { useCallback, useEffect, useState } from "react";
// // // import { useNavigate, useParams, useLocation } from "react-router-dom";
// // // import { CheckCircle2, ArrowLeft, Link2, Check } from "lucide-react";
// // // import {
// // //     getOrderByPublicId,
// // //     getGuestOrderByPublicId
// // // } from "../services/orderservice";
// // // import "../styles/OrderDetails.css";

// // // // --------------------------------------------------
// // // // HELPERS
// // // // --------------------------------------------------

// // // const statusClass = (status) => {
// // //     switch (status) {
// // //         case "Pending": return "order-status pending";
// // //         case "Confirmed": return "order-status confirmed";
// // //         case "Processing":
// // //         case "Preparing": return "order-status preparing";
// // //         case "Shipped": return "order-status shipped";
// // //         case "Delivered": return "order-status delivered";
// // //         case "Cancelled": return "order-status cancelled";
// // //         default: return "order-status";
// // //     }
// // // };

// // // const formatDate = (date) => {
// // //     if (!date) return "—";
// // //     return new Date(date).toLocaleDateString("en-US", {
// // //         year: "numeric",
// // //         month: "short",
// // //         day: "numeric",
// // //         hour: "numeric",
// // //         minute: "2-digit"
// // //     });
// // // };

// // // const isRecentOrder = (date, minutes = 30) =>
// // //     date && Date.now() - new Date(date).getTime() < minutes * 60 * 1000;

// // // const formatMoney = (amount) =>
// // //     `Rs. ${Number(amount || 0).toLocaleString("en-US", {
// // //         minimumFractionDigits: 2,
// // //         maximumFractionDigits: 2
// // //     })}`;

// // // // Short, readable reference for display. The full GUID stays in the URL.
// // // const getReference = (publicId) =>
// // //     publicId ? `CK-${String(publicId).slice(0, 8).toUpperCase()}` : "—";

// // // const getToken = () =>
// // //     localStorage.getItem("token") || sessionStorage.getItem("token");

// // // // --------------------------------------------------
// // // // COMPONENT
// // // // --------------------------------------------------

// // // const OrderDetails = () => {
// // //     const navigate = useNavigate();
// // //     const { publicId } = useParams();
// // //     const location = useLocation();

// // //     const justPlaced = location.state?.justPlaced || false;
// // //     const passedPhoneNumber = location.state?.phoneNumber || null;

// // //     const isLoggedIn = Boolean(getToken());

// // //     const [order, setOrder] = useState(null);
// // //     const [loading, setLoading] = useState(true);
// // //     const [error, setError] = useState("");

// // //     const [guestPhoneInput, setGuestPhoneInput] = useState("");
// // //     const [needsGuestPhone, setNeedsGuestPhone] = useState(false);

// // //     const [linkCopied, setLinkCopied] = useState(false);

// // //     // LOAD ORDER
// // //     const loadOrder = useCallback(
// // //         async (phoneOverride) => {
// // //             try {
// // //                 setLoading(true);
// // //                 setError("");
// // //                 setNeedsGuestPhone(false);

// // //                 if (!publicId) {
// // //                     setError("Invalid order reference.");
// // //                     return;
// // //                 }

// // //                 let data;

// // //                 if (isLoggedIn) {
// // //                     data = await getOrderByPublicId(publicId);
// // //                 } else {
// // //                     const phoneToUse = phoneOverride || passedPhoneNumber;

// // //                     if (!phoneToUse) {
// // //                         // Guests must verify with their phone number first.
// // //                         setNeedsGuestPhone(true);
// // //                         return;
// // //                     }

// // //                     data = await getGuestOrderByPublicId(
// // //                         publicId,
// // //                         phoneToUse
// // //                     );
// // //                 }

// // //                 setOrder(data);
// // //             } catch (err) {
// // //                 console.error("Error loading order:", err);
// // //                 setError(err.message || "Unable to load this order.");
// // //             } finally {
// // //                 setLoading(false);
// // //             }
// // //         },
// // //         [publicId, isLoggedIn, passedPhoneNumber]
// // //     );

// // //     useEffect(() => {
// // //         // eslint-disable-next-line react-hooks/set-state-in-effect -- data fetch on mount, setState only runs after await
// // //         loadOrder();
// // //     }, [loadOrder]);

// // //     const handleGuestPhoneSubmit = (e) => {
// // //         e.preventDefault();

// // //         const cleaned = guestPhoneInput.replace(/\s+/g, "");

// // //         if (cleaned) {
// // //             loadOrder(cleaned);
// // //         }
// // //     };

// // //     const handleCopyLink = async () => {
// // //         try {
// // //             await navigator.clipboard.writeText(window.location.href);
// // //             setLinkCopied(true);
// // //             setTimeout(() => setLinkCopied(false), 2000);
// // //         } catch (err) {
// // //             console.error("Could not copy link:", err);
// // //         }
// // //     };

// // //     // LOADING STATE
// // //     if (loading) {
// // //         return (
// // //             <div className="orderdetails-page">
// // //                 <div className="orderdetails-loading">
// // //                     <p>Loading order details...</p>
// // //                 </div>
// // //             </div>
// // //         );
// // //     }

// // //     // GUEST NEEDS PHONE NUMBER TO VERIFY
// // //     if (needsGuestPhone) {
// // //         return (
// // //             <div className="orderdetails-page">
// // //                 <div className="orderdetails-error">
// // //                     <h2>Verify your order</h2>
// // //                     <p>
// // //                         Enter the phone number you used when placing this
// // //                         order.
// // //                     </p>

// // //                     <form
// // //                         onSubmit={handleGuestPhoneSubmit}
// // //                         className="orderdetails-guest-form"
// // //                     >
// // //                         <input
// // //                             type="tel"
// // //                             value={guestPhoneInput}
// // //                             onChange={(e) =>
// // //                                 setGuestPhoneInput(e.target.value)
// // //                             }
// // //                             placeholder="98XXXXXXXX"
// // //                             required
// // //                         />

// // //                         <button type="submit">View order</button>
// // //                     </form>
// // //                 </div>
// // //             </div>
// // //         );
// // //     }

// // //     // ERROR STATE
// // //     if (error || !order) {
// // //         return (
// // //             <div className="orderdetails-page">
// // //                 <div className="orderdetails-error">
// // //                     <h2>Order not found</h2>
// // //                     <p>{error || "We couldn't find this order."}</p>

// // //                     <button
// // //                         onClick={() =>
// // //                             navigate(isLoggedIn ? "/orders" : "/")
// // //                         }
// // //                     >
// // //                         {isLoggedIn ? "Back to my orders" : "Back to home"}
// // //                     </button>
// // //                 </div>
// // //             </div>
// // //         );
// // //     }

// // //     // MAIN ORDER DETAILS
// // //     return (
// // //         <div className="orderdetails-page">
// // //             <div className="orderdetails-container">

// // //                 {/* CONFIRMATION BANNER (only right after checkout) */}
// // //                 {/* {justPlaced && ( */}
// // //                 {(justPlaced || isRecentOrder(order.orderDate)) && (
// // //                     <div className="orderdetails-confirmation">
// // //                         <CheckCircle2 size={22} />

// // //                         <div>
// // //                             <h2>Order placed successfully</h2>
// // //                             <p>
// // //                                 Thank you for your order. We will confirm it
// // //                                 shortly.
// // //                             </p>
// // //                         </div>
// // //                     </div>
// // //                 )}

// // //                 {/* BACK LINK (registered customers only) */}
// // //                 {isLoggedIn && (
// // //                     <button
// // //                         className="orderdetails-back-link"
// // //                         onClick={() => navigate("/orders")}
// // //                     >
// // //                         <ArrowLeft size={15} />
// // //                         Back to my orders
// // //                     </button>
// // //                 )}

// // //                 {/* HEADER CARD */}
// // //                 <div className="orderdetails-card orderdetails-header">
// // //                     <div className="orderdetails-header-text">
// // //                         <span className="orderdetails-header-label">
// // //                             Order reference
// // //                         </span>

// // //                         <h1 title={order.publicId}>
// // //                             {getReference(order.publicId)}
// // //                         </h1>

// // //                         <p>Placed on {formatDate(order.orderDate)}</p>
// // //                     </div>

// // //                     <span className={statusClass(order.status)}>
// // //                         {order.status}
// // //                     </span>
// // //                 </div>

// // //                 {/* GUEST NOTE: THE LINK IS THEIR WAY BACK TO THE ORDER */}
// // //                 {!isLoggedIn && (
// // //                     <div className="orderdetails-guest-note">
// // //                         <p>
// // //                             Save this page link to check your order later.
// // //                             You will need your phone number to open it.
// // //                         </p>

// // //                         <button
// // //                             type="button"
// // //                             className="orderdetails-copy-btn"
// // //                             onClick={handleCopyLink}
// // //                         >
// // //                             {linkCopied ? (
// // //                                 <>
// // //                                     <Check size={14} />
// // //                                     Link copied
// // //                                 </>
// // //                             ) : (
// // //                                 <>
// // //                                     <Link2 size={14} />
// // //                                     Copy link
// // //                                 </>
// // //                             )}
// // //                         </button>
// // //                     </div>
// // //                 )}

// // //                 {/* DELIVERY AND PAYMENT */}
// // //                 <div className="orderdetails-card orderdetails-info">
// // //                     <div className="orderdetails-info-row orderdetails-info-wide">
// // //                         <span>Delivery address</span>
// // //                         <strong>{order.shippingAddress || "—"}</strong>
// // //                     </div>

// // //                     <div className="orderdetails-info-row">
// // //                         <span>Payment method</span>
// // //                         <strong>
// // //                             {order.paymentMethod === "CashOnDelivery"
// // //                                 ? "Cash on delivery"
// // //                                 : order.paymentMethod}
// // //                         </strong>
// // //                     </div>

// // //                     <div className="orderdetails-info-row">
// // //                         <span>Payment status</span>
// // //                         <strong>{order.paymentStatus}</strong>
// // //                     </div>
// // //                 </div>

// // //                 {/* ITEMS */}
// // //                 <div className="orderdetails-items">
// // //                     <h2>Items</h2>

// // //                     <div className="orderdetails-items-list">
// // //                         {order.items.map((item) => {
// // //                             const personalizedMessage =
// // //                                 item.personalizedMessage?.trim() || "";

// // //                             const messageCharge = Number(
// // //                                 item.messageAdditionalPrice || 0
// // //                             );

// // //                             const unitPrice = Number(item.unitPrice || 0);
// // //                             const quantity = Number(item.quantity || 1);

// // //                             const hasPersonalizedMessage =
// // //                                 personalizedMessage.length > 0 &&
// // //                                 !item.isCustomized;

// // //                             const cakePrice = hasPersonalizedMessage
// // //                                 ? unitPrice - messageCharge
// // //                                 : unitPrice;

// // //                             return (
// // //                                 <div
// // //                                     className="orderdetails-item-card"
// // //                                     key={item.orderItemId}
// // //                                 >
// // //                                     <div className="orderdetails-item-heading">
// // //                                         <div>
// // //                                             <h3>{item.cakeName}</h3>

// // //                                             <span className="orderdetails-item-type">
// // //                                                 {item.isCustomized
// // //                                                     ? "Customized cake"
// // //                                                     : "Regular cake"}
// // //                                             </span>
// // //                                         </div>

// // //                                         <span className="orderdetails-item-quantity">
// // //                                             Qty {quantity}
// // //                                         </span>
// // //                                     </div>

// // //                                     {/* PERSONALIZED MESSAGE */}
// // //                                     {hasPersonalizedMessage && (
// // //                                         <div className="orderdetails-personalized-message">
// // //                                             <span>Personalized message</span>
// // //                                             <p>“{personalizedMessage}”</p>
// // //                                         </div>
// // //                                     )}

// // //                                     {/* CUSTOMIZATION NOTE */}
// // //                                     {item.isCustomized && (
// // //                                         <p className="orderdetails-customized-note">
// // //                                             Made with your selected design
// // //                                             options.
// // //                                         </p>
// // //                                     )}

// // //                                     {/* PRICE BREAKDOWN */}
// // //                                     <dl className="orderdetails-item-pricing">
// // //                                         <div>
// // //                                             <dt>Cake price</dt>
// // //                                             <dd>{formatMoney(cakePrice)}</dd>
// // //                                         </div>

// // //                                         {hasPersonalizedMessage && (
// // //                                             <div>
// // //                                                 <dt>Message charge</dt>
// // //                                                 <dd>
// // //                                                     {formatMoney(messageCharge)}
// // //                                                 </dd>
// // //                                             </div>
// // //                                         )}

// // //                                         <div>
// // //                                             <dt>
// // //                                                 Unit price × {quantity}
// // //                                             </dt>
// // //                                             <dd>{formatMoney(unitPrice)}</dd>
// // //                                         </div>

// // //                                         <div className="orderdetails-item-subtotal">
// // //                                             <dt>Subtotal</dt>
// // //                                             <dd>
// // //                                                 {formatMoney(item.subtotal)}
// // //                                             </dd>
// // //                                         </div>
// // //                                     </dl>
// // //                                 </div>
// // //                             );
// // //                         })}
// // //                     </div>
// // //                 </div>

// // //                 {/* TOTAL */}
// // //                 <div className="orderdetails-total">
// // //                     <span>Total amount</span>
// // //                     <strong>{formatMoney(order.totalAmount)}</strong>
// // //                 </div>

// // //                 {/* ACTIONS */}
// // //                 <div className="orderdetails-actions">
// // //                     <button
// // //                         className="orderdetails-browse-btn"
// // //                         onClick={() => navigate("/")}
// // //                     >
// // //                         Continue shopping
// // //                     </button>
// // //                 </div>

// // //             </div>
// // //         </div>
// // //     );
// // // };

// // // export default OrderDetails;

// // import { useCallback, useEffect, useState } from "react";
// // import { useNavigate, useParams, useLocation } from "react-router-dom";
// // import { CheckCircle2, ArrowLeft, Link2, Check } from "lucide-react";
// // import {
// //     getOrderByPublicId,
// //     getGuestOrderByPublicId
// // } from "../services/orderservice";
// // import "../styles/OrderDetails.css";

// // // --------------------------------------------------
// // // HELPERS
// // // --------------------------------------------------

// // const statusClass = (status) => {
// //     switch (status) {
// //         case "Pending": return "order-status pending";
// //         case "Confirmed": return "order-status confirmed";
// //         case "Processing":
// //         case "Preparing": return "order-status preparing";
// //         case "Shipped": return "order-status shipped";
// //         case "Delivered": return "order-status delivered";
// //         case "Cancelled": return "order-status cancelled";
// //         default: return "order-status";
// //     }
// // };

// // const formatDate = (date) => {
// //     if (!date) return "—";
// //     return new Date(date).toLocaleDateString("en-US", {
// //         year: "numeric",
// //         month: "short",
// //         day: "numeric",
// //         hour: "numeric",
// //         minute: "2-digit"
// //     });
// // };

// // const formatMoney = (amount) =>
// //     `Rs. ${Number(amount || 0).toLocaleString("en-US", {
// //         minimumFractionDigits: 2,
// //         maximumFractionDigits: 2
// //     })}`;

// // // Short, readable reference for display. The full GUID stays in the URL.
// // const getReference = (publicId) =>
// //     publicId ? `CK-${String(publicId).slice(0, 8).toUpperCase()}` : "—";

// // const getToken = () =>
// //     localStorage.getItem("token") || sessionStorage.getItem("token");

// // // --------------------------------------------------
// // // COMPONENT
// // // --------------------------------------------------

// // const OrderDetails = () => {
// //     const navigate = useNavigate();
// //     const { publicId } = useParams();
// //     const location = useLocation();

// //     const justPlaced = location.state?.justPlaced || false;
// //     const passedPhoneNumber = location.state?.phoneNumber || null;

// //     const isLoggedIn = Boolean(getToken());

// //     const [order, setOrder] = useState(null);
// //     const [loading, setLoading] = useState(true);
// //     const [error, setError] = useState("");

// //     const [guestPhoneInput, setGuestPhoneInput] = useState("");
// //     const [needsGuestPhone, setNeedsGuestPhone] = useState(false);

// //     const [linkCopied, setLinkCopied] = useState(false);

// //     // LOAD ORDER
// //     const loadOrder = useCallback(
// //         async (phoneOverride) => {
// //             try {
// //                 setLoading(true);
// //                 setError("");
// //                 setNeedsGuestPhone(false);

// //                 if (!publicId) {
// //                     setError("Invalid order reference.");
// //                     return;
// //                 }

// //                 let data;

// //                 if (isLoggedIn) {
// //                     data = await getOrderByPublicId(publicId);
// //                 } else {
// //                     const phoneToUse = phoneOverride || passedPhoneNumber;

// //                     if (!phoneToUse) {
// //                         // Guests must verify with their phone number first.
// //                         setNeedsGuestPhone(true);
// //                         return;
// //                     }

// //                     data = await getGuestOrderByPublicId(
// //                         publicId,
// //                         phoneToUse
// //                     );
// //                 }

// //                 setOrder(data);
// //             } catch (err) {
// //                 console.error("Error loading order:", err);
// //                 setError(err.message || "Unable to load this order.");
// //             } finally {
// //                 setLoading(false);
// //             }
// //         },
// //         [publicId, isLoggedIn, passedPhoneNumber]
// //     );

// //     useEffect(() => {
// //         // eslint-disable-next-line react-hooks/set-state-in-effect -- data fetch on mount, setState only runs after await
// //         loadOrder();
// //     }, [loadOrder]);

// //     const handleGuestPhoneSubmit = (e) => {
// //         e.preventDefault();

// //         const cleaned = guestPhoneInput.replace(/\s+/g, "");

// //         if (cleaned) {
// //             loadOrder(cleaned);
// //         }
// //     };

// //     const handleCopyLink = async () => {
// //         try {
// //             await navigator.clipboard.writeText(window.location.href);
// //             setLinkCopied(true);
// //             setTimeout(() => setLinkCopied(false), 2000);
// //         } catch (err) {
// //             console.error("Could not copy link:", err);
// //         }
// //     };

// //     // LOADING STATE
// //     if (loading) {
// //         return (
// //             <div className="orderdetails-page">
// //                 <div className="orderdetails-loading">
// //                     <p>Loading order details...</p>
// //                 </div>
// //             </div>
// //         );
// //     }

// //     // GUEST NEEDS PHONE NUMBER TO VERIFY
// //     if (needsGuestPhone) {
// //         return (
// //             <div className="orderdetails-page">
// //                 <div className="orderdetails-error">
// //                     <h2>Verify your order</h2>
// //                     <p>
// //                         Enter the phone number you used when placing this
// //                         order.
// //                     </p>

// //                     <form
// //                         onSubmit={handleGuestPhoneSubmit}
// //                         className="orderdetails-guest-form"
// //                     >
// //                         <input
// //                             type="tel"
// //                             value={guestPhoneInput}
// //                             onChange={(e) =>
// //                                 setGuestPhoneInput(e.target.value)
// //                             }
// //                             placeholder="98XXXXXXXX"
// //                             required
// //                         />

// //                         <button type="submit">View order</button>
// //                     </form>
// //                 </div>
// //             </div>
// //         );
// //     }

// //     // ERROR STATE
// //     if (error || !order) {
// //         return (
// //             <div className="orderdetails-page">
// //                 <div className="orderdetails-error">
// //                     <h2>Order not found</h2>
// //                     <p>{error || "We couldn't find this order."}</p>

// //                     <button
// //                         onClick={() =>
// //                             navigate(isLoggedIn ? "/orders" : "/")
// //                         }
// //                     >
// //                         {isLoggedIn ? "Back to my orders" : "Back to home"}
// //                     </button>
// //                 </div>
// //             </div>
// //         );
// //     }

// //     // MAIN ORDER DETAILS
// //     return (
// //         <div className="orderdetails-page">
// //             <div className="orderdetails-container">

// //                 {/* CONFIRMATION BANNER (only right after checkout) */}
// //                 {justPlaced && (
// //                     <div className="orderdetails-confirmation">
// //                         <CheckCircle2 size={22} />

// //                         <div>
// //                             <h2>Order placed successfully</h2>
// //                             <p>
// //                                 Thank you for your order. We will confirm it
// //                                 shortly.
// //                             </p>
// //                         </div>
// //                     </div>
// //                 )}

// //                 {/* BACK LINK (registered customers only) */}
// //                 {isLoggedIn && (
// //                     <button
// //                         className="orderdetails-back-link"
// //                         onClick={() => navigate("/orders")}
// //                     >
// //                         <ArrowLeft size={15} />
// //                         Back to my orders
// //                     </button>
// //                 )}

// //                 {/* HEADER CARD */}
// //                 <div className="orderdetails-card orderdetails-header">
// //                     <div className="orderdetails-header-text">
// //                         <span className="orderdetails-header-label">
// //                             Order reference
// //                         </span>

// //                         <h1 title={order.publicId}>
// //                             {getReference(order.publicId)}
// //                         </h1>

// //                         <p>Placed on {formatDate(order.orderDate)}</p>
// //                     </div>

// //                     <span className={statusClass(order.status)}>
// //                         {order.status}
// //                     </span>
// //                 </div>

// //                 {/* GUEST NOTE: THE LINK IS THEIR WAY BACK TO THE ORDER */}
// //                 {!isLoggedIn && (
// //                     <div className="orderdetails-guest-note">
// //                         <p>
// //                             Save this page link to check your order later.
// //                             You will need your phone number to open it.
// //                         </p>

// //                         <button
// //                             type="button"
// //                             className="orderdetails-copy-btn"
// //                             onClick={handleCopyLink}
// //                         >
// //                             {linkCopied ? (
// //                                 <>
// //                                     <Check size={14} />
// //                                     Link copied
// //                                 </>
// //                             ) : (
// //                                 <>
// //                                     <Link2 size={14} />
// //                                     Copy link
// //                                 </>
// //                             )}
// //                         </button>
// //                     </div>
// //                 )}

// //                 {/* ITEMS */}
// //                 <div className="orderdetails-items">
// //                     <h2>Items</h2>

// //                     <div className="orderdetails-items-list">
// //                         {order.items.map((item) => {
// //                             const personalizedMessage =
// //                                 item.personalizedMessage?.trim() || "";

// //                             const messageCharge = Number(
// //                                 item.messageAdditionalPrice || 0
// //                             );

// //                             const unitPrice = Number(item.unitPrice || 0);
// //                             const quantity = Number(item.quantity || 1);

// //                             const hasPersonalizedMessage =
// //                                 personalizedMessage.length > 0 &&
// //                                 !item.isCustomized;

// //                             const cakePrice = hasPersonalizedMessage
// //                                 ? unitPrice - messageCharge
// //                                 : unitPrice;

// //                             return (
// //                                 <div
// //                                     className="orderdetails-item-card"
// //                                     key={item.orderItemId}
// //                                 >
// //                                     <div className="orderdetails-item-heading">
// //                                         <div>
// //                                             <h3>{item.cakeName}</h3>

// //                                             <span className="orderdetails-item-type">
// //                                                 {item.isCustomized
// //                                                     ? "Customized cake"
// //                                                     : "Regular cake"}
// //                                             </span>
// //                                         </div>

// //                                         <span className="orderdetails-item-quantity">
// //                                             Qty {quantity}
// //                                         </span>
// //                                     </div>

// //                                     {/* PERSONALIZED MESSAGE */}
// //                                     {hasPersonalizedMessage && (
// //                                         <div className="orderdetails-personalized-message">
// //                                             <span>Personalized message</span>
// //                                             <p>“{personalizedMessage}”</p>
// //                                         </div>
// //                                     )}

// //                                     {/* CUSTOMIZATION NOTE */}
// //                                     {item.isCustomized && (
// //                                         <p className="orderdetails-customized-note">
// //                                             Made with your selected design
// //                                             options.
// //                                         </p>
// //                                     )}

// //                                     {/* PRICE BREAKDOWN */}
// //                                     <dl className="orderdetails-item-pricing">
// //                                         <div>
// //                                             <dt>Cake price</dt>
// //                                             <dd>{formatMoney(cakePrice)}</dd>
// //                                         </div>

// //                                         {hasPersonalizedMessage && (
// //                                             <div>
// //                                                 <dt>Message charge</dt>
// //                                                 <dd>
// //                                                     {formatMoney(messageCharge)}
// //                                                 </dd>
// //                                             </div>
// //                                         )}

// //                                         <div>
// //                                             <dt>
// //                                                 Unit price × {quantity}
// //                                             </dt>
// //                                             <dd>{formatMoney(unitPrice)}</dd>
// //                                         </div>

// //                                         <div className="orderdetails-item-subtotal">
// //                                             <dt>Subtotal</dt>
// //                                             <dd>
// //                                                 {formatMoney(item.subtotal)}
// //                                             </dd>
// //                                         </div>
// //                                     </dl>
// //                                 </div>
// //                             );
// //                         })}
// //                     </div>
// //                 </div>

// //                 {/* TOTAL */}
// //                 <div className="orderdetails-total">
// //                     <span>Total amount</span>
// //                     <strong>{formatMoney(order.totalAmount)}</strong>
// //                 </div>

// //                 {/* DELIVERY AND PAYMENT */}
// //                 <div className="orderdetails-card orderdetails-info">
// //                     <div className="orderdetails-info-row orderdetails-info-wide">
// //                         <span>Delivery address</span>
// //                         <strong>{order.shippingAddress || "—"}</strong>
// //                     </div>

// //                     <div className="orderdetails-info-row">
// //                         <span>Payment method</span>
// //                         <strong>
// //                             {order.paymentMethod === "CashOnDelivery"
// //                                 ? "Cash on delivery"
// //                                 : order.paymentMethod}
// //                         </strong>
// //                     </div>

// //                     <div className="orderdetails-info-row">
// //                         <span>Payment status</span>
// //                         <strong>{order.paymentStatus}</strong>
// //                     </div>
// //                 </div>

// //                 {/* ACTIONS */}
// //                 <div className="orderdetails-actions">
// //                     <button
// //                         className="orderdetails-browse-btn"
// //                         onClick={() => navigate("/")}
// //                     >
// //                         Continue shopping
// //                     </button>
// //                 </div>

// //             </div>
// //         </div>
// //     );
// // };

// // export default OrderDetails;

// import { useCallback, useEffect, useState } from "react";
// import { useNavigate, useParams, useLocation } from "react-router-dom";
// import { CheckCircle2, ArrowLeft, Link2, Check } from "lucide-react";
// import {
//     getOrderByPublicId,
//     getGuestOrderByPublicId
// } from "../services/orderservice";
// import "../styles/OrderDetails.css";

// // --------------------------------------------------
// // HELPERS
// // --------------------------------------------------

// const statusClass = (status) => {
//     switch (status) {
//         case "Pending": return "order-status pending";
//         case "Confirmed": return "order-status confirmed";
//         case "Processing":
//         case "Preparing": return "order-status preparing";
//         case "Shipped": return "order-status shipped";
//         case "Delivered": return "order-status delivered";
//         case "Cancelled": return "order-status cancelled";
//         default: return "order-status";
//     }
// };

// const formatDate = (date) => {
//     if (!date) return "—";
//     return new Date(date).toLocaleDateString("en-US", {
//         year: "numeric",
//         month: "short",
//         day: "numeric",
//         hour: "numeric",
//         minute: "2-digit"
//     });
// };

// const formatMoney = (amount) =>
//     `Rs. ${Number(amount || 0).toLocaleString("en-US", {
//         minimumFractionDigits: 2,
//         maximumFractionDigits: 2
//     })}`;

// // Short, readable reference for display. The full GUID stays in the URL.
// const getReference = (publicId) =>
//     publicId ? `CK-${String(publicId).slice(0, 8).toUpperCase()}` : "—";

// const getToken = () =>
//     localStorage.getItem("token") || sessionStorage.getItem("token");

// // --------------------------------------------------
// // COMPONENT
// // --------------------------------------------------

// const OrderDetails = () => {
//     const navigate = useNavigate();
//     const { publicId } = useParams();
//     const location = useLocation();

//     const justPlaced = location.state?.justPlaced || false;
//     const passedPhoneNumber = location.state?.phoneNumber || null;

//     const isLoggedIn = Boolean(getToken());

//     const [order, setOrder] = useState(null);
//     const [loading, setLoading] = useState(true);
//     const [error, setError] = useState("");

//     const [guestPhoneInput, setGuestPhoneInput] = useState("");
//     const [needsGuestPhone, setNeedsGuestPhone] = useState(false);

//     const [linkCopied, setLinkCopied] = useState(false);

//     // LOAD ORDER
//     const loadOrder = useCallback(
//         async (phoneOverride) => {
//             try {
//                 setLoading(true);
//                 setError("");
//                 setNeedsGuestPhone(false);

//                 if (!publicId) {
//                     setError("Invalid order reference.");
//                     return;
//                 }

//                 let data;

//                 if (isLoggedIn) {
//                     data = await getOrderByPublicId(publicId);
//                 } else {
//                     const phoneToUse = phoneOverride || passedPhoneNumber;

//                     if (!phoneToUse) {
//                         // Guests must verify with their phone number first.
//                         setNeedsGuestPhone(true);
//                         return;
//                     }

//                     data = await getGuestOrderByPublicId(
//                         publicId,
//                         phoneToUse
//                     );
//                 }

//                 setOrder(data);
//             } catch (err) {
//                 console.error("Error loading order:", err);
//                 setError(err.message || "Unable to load this order.");
//             } finally {
//                 setLoading(false);
//             }
//         },
//         [publicId, isLoggedIn, passedPhoneNumber]
//     );

//     useEffect(() => {
//         // eslint-disable-next-line react-hooks/set-state-in-effect -- data fetch on mount, setState only runs after await
//         loadOrder();
//     }, [loadOrder]);

//     const handleGuestPhoneSubmit = (e) => {
//         e.preventDefault();

//         const cleaned = guestPhoneInput.replace(/\s+/g, "");

//         if (cleaned) {
//             loadOrder(cleaned);
//         }
//     };

//     const handleCopyLink = async () => {
//         try {
//             await navigator.clipboard.writeText(window.location.href);
//             setLinkCopied(true);
//             setTimeout(() => setLinkCopied(false), 2000);
//         } catch (err) {
//             console.error("Could not copy link:", err);
//         }
//     };

//     // LOADING STATE
//     if (loading) {
//         return (
//             <div className="orderdetails-page">
//                 <div className="orderdetails-loading">
//                     <p>Loading order details...</p>
//                 </div>
//             </div>
//         );
//     }

//     // GUEST NEEDS PHONE NUMBER TO VERIFY
//     if (needsGuestPhone) {
//         return (
//             <div className="orderdetails-page">
//                 <div className="orderdetails-error">
//                     <h2>Verify your order</h2>
//                     <p>
//                         Enter the phone number you used when placing this
//                         order.
//                     </p>

//                     <form
//                         onSubmit={handleGuestPhoneSubmit}
//                         className="orderdetails-guest-form"
//                     >
//                         <input
//                             type="tel"
//                             value={guestPhoneInput}
//                             onChange={(e) =>
//                                 setGuestPhoneInput(e.target.value)
//                             }
//                             placeholder="98XXXXXXXX"
//                             required
//                         />

//                         <button type="submit">View order</button>
//                     </form>
//                 </div>
//             </div>
//         );
//     }

//     // ERROR STATE
//     if (error || !order) {
//         return (
//             <div className="orderdetails-page">
//                 <div className="orderdetails-error">
//                     <h2>Order not found</h2>
//                     <p>{error || "We couldn't find this order."}</p>

//                     <button
//                         onClick={() =>
//                             navigate(isLoggedIn ? "/orders" : "/")
//                         }
//                     >
//                         {isLoggedIn ? "Back to my orders" : "Back to home"}
//                     </button>
//                 </div>
//             </div>
//         );
//     }

//     // MAIN ORDER DETAILS
//     return (
//         <div className="orderdetails-page">
//             <div className="orderdetails-container">

//                 {/* CONFIRMATION BANNER (only right after checkout) */}
//                 {justPlaced && (
//                     <div className="orderdetails-confirmation">
//                         <CheckCircle2 size={22} />

//                         <div>
//                             <h2>Order placed successfully</h2>
//                             <p>
//                                 Thank you for your order. We will confirm it
//                                 shortly.
//                             </p>
//                         </div>
//                     </div>
//                 )}

//                 {/* BACK LINK (registered customers only) */}
//                 {isLoggedIn && (
//                     <button
//                         className="orderdetails-back-link"
//                         onClick={() => navigate("/orders")}
//                     >
//                         <ArrowLeft size={15} />
//                         Back to my orders
//                     </button>
//                 )}

//                 {/* HEADER CARD */}
//                 <div className="orderdetails-card orderdetails-header">
//                     <div className="orderdetails-header-text">
//                         <span className="orderdetails-header-label">
//                             Order reference
//                         </span>

//                         <h1 title={order.publicId}>
//                             {getReference(order.publicId)}
//                         </h1>

//                         <p>Placed on {formatDate(order.orderDate)}</p>
//                     </div>

//                     <span className={statusClass(order.status)}>
//                         {order.status}
//                     </span>
//                 </div>

//                 {/* GUEST NOTE: THE LINK IS THEIR WAY BACK TO THE ORDER */}
//                 {!isLoggedIn && (
//                     <div className="orderdetails-guest-note">
//                         <p>
//                             Save this page link to check your order later.
//                             You will need your phone number to open it.
//                         </p>

//                         <button
//                             type="button"
//                             className="orderdetails-copy-btn"
//                             onClick={handleCopyLink}
//                         >
//                             {linkCopied ? (
//                                 <>
//                                     <Check size={14} />
//                                     Link copied
//                                 </>
//                             ) : (
//                                 <>
//                                     <Link2 size={14} />
//                                     Copy link
//                                 </>
//                             )}
//                         </button>
//                     </div>
//                 )}

//                 {/* ITEMS */}
//                 <div className="orderdetails-items">
//                     <h2>Items</h2>

//                     <div className="orderdetails-items-list">
//                         {order.items.map((item) => {
//                             const personalizedMessage =
//                                 item.personalizedMessage?.trim() || "";

//                             const messageCharge = Number(
//                                 item.messageAdditionalPrice || 0
//                             );

//                             const unitPrice = Number(item.unitPrice || 0);
//                             const quantity = Number(item.quantity || 1);

//                             const hasPersonalizedMessage =
//                                 personalizedMessage.length > 0 &&
//                                 !item.isCustomized;

//                             const cakePrice = hasPersonalizedMessage
//                                 ? unitPrice - messageCharge
//                                 : unitPrice;

//                             return (
//                                 <div
//                                     className="orderdetails-item-card"
//                                     key={item.orderItemId}
//                                 >
//                                     <div className="orderdetails-item-heading">
//                                         <div>
//                                             <h3>{item.cakeName}</h3>

//                                             <span className="orderdetails-item-type">
//                                                 {item.isCustomized
//                                                     ? "Customized cake"
//                                                     : "Regular cake"}
//                                             </span>
//                                         </div>

//                                         <span className="orderdetails-item-quantity">
//                                             Qty {quantity}
//                                         </span>
//                                     </div>

//                                     {/* PERSONALIZED MESSAGE */}
//                                     {hasPersonalizedMessage && (
//                                         <div className="orderdetails-personalized-message">
//                                             <span>Personalized message</span>
//                                             <p>“{personalizedMessage}”</p>
//                                         </div>
//                                     )}

//                                     {/* CUSTOMIZATION NOTE */}
//                                     {item.isCustomized && (
//                                         <p className="orderdetails-customized-note">
//                                             Made with your selected design
//                                             options.
//                                         </p>
//                                     )}

//                                     {/* PRICE BREAKDOWN */}
//                                     <dl className="orderdetails-item-pricing">
//                                         <div>
//                                             <dt>Cake price</dt>
//                                             <dd>{formatMoney(cakePrice)}</dd>
//                                         </div>

//                                         {hasPersonalizedMessage && (
//                                             <div>
//                                                 <dt>Message charge</dt>
//                                                 <dd>
//                                                     {formatMoney(messageCharge)}
//                                                 </dd>
//                                             </div>
//                                         )}

//                                         <div>
//                                             <dt>
//                                                 Unit price × {quantity}
//                                             </dt>
//                                             <dd>{formatMoney(unitPrice)}</dd>
//                                         </div>

//                                         <div className="orderdetails-item-subtotal">
//                                             <dt>Subtotal</dt>
//                                             <dd>
//                                                 {formatMoney(item.subtotal)}
//                                             </dd>
//                                         </div>
//                                     </dl>
//                                 </div>
//                             );
//                         })}
//                     </div>
//                 </div>

//                 {/* TOTAL */}
//                 <div className="orderdetails-total">
//                     <span>Total amount</span>
//                     <strong>{formatMoney(order.totalAmount)}</strong>
//                 </div>

//                 {/* DELIVERY AND PAYMENT */}
//                 <div className="orderdetails-card orderdetails-info">
//                     <div className="orderdetails-info-row orderdetails-info-wide">
//                         <span>Delivery address</span>
//                         <strong>{order.shippingAddress || "—"}</strong>
//                     </div>

//                     <div className="orderdetails-info-row">
//                         <span>Payment method</span>
//                         <strong>
//                             {order.paymentMethod === "CashOnDelivery"
//                                 ? "Cash on delivery"
//                                 : order.paymentMethod}
//                         </strong>
//                     </div>

//                     <div className="orderdetails-info-row">
//                         <span>Payment status</span>
//                         <strong>{order.paymentStatus}</strong>
//                     </div>
//                 </div>

//                 {/* ACTIONS */}
//                 <div className="orderdetails-actions">
//                     {isLoggedIn && (
//                         <button
//                             className="orderdetails-orders-btn"
//                             onClick={() => navigate("/orders")}
//                         >
//                             My orders
//                         </button>
//                     )}

//                     <button
//                         className="orderdetails-browse-btn"
//                         onClick={() => navigate("/")}
//                     >
//                         Continue shopping
//                     </button>
//                 </div>

//             </div>
//         </div>
//     );
// };

// export default OrderDetails;

import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { CheckCircle2 } from "lucide-react";
import {
    getOrderByPublicId,
    getGuestOrderByPublicId
} from "../services/orderservice";
import "../styles/OrderDetails.css";

// --------------------------------------------------
// HELPERS
// --------------------------------------------------

const statusClass = (status) => {
    switch (status) {
        case "Pending": return "order-status pending";
        case "Confirmed": return "order-status confirmed";
        case "Processing":
        case "Preparing": return "order-status preparing";
        case "Shipped": return "order-status shipped";
        case "Delivered": return "order-status delivered";
        case "Cancelled": return "order-status cancelled";
        default: return "order-status";
    }
};

const formatDate = (date) => {
    if (!date) return "—";
    return new Date(date).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit"
    });
};

const formatMoney = (amount) =>
    `Rs. ${Number(amount || 0).toLocaleString("en-US", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    })}`;

// Short, readable reference for display. The full GUID stays in the URL.
const getReference = (publicId) =>
    publicId ? `CK-${String(publicId).slice(0, 8).toUpperCase()}` : "—";

const getToken = () =>
    localStorage.getItem("token") || sessionStorage.getItem("token");

// --------------------------------------------------
// COMPONENT
// --------------------------------------------------

const OrderDetails = () => {
    const navigate = useNavigate();
    const { publicId } = useParams();
    const location = useLocation();

    const justPlaced = location.state?.justPlaced || false;
    const passedPhoneNumber = location.state?.phoneNumber || null;

    const isLoggedIn = Boolean(getToken());

    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [guestPhoneInput, setGuestPhoneInput] = useState("");
    const [needsGuestPhone, setNeedsGuestPhone] = useState(false);

    // LOAD ORDER
    const loadOrder = useCallback(
        async (phoneOverride) => {
            try {
                setLoading(true);
                setError("");
                setNeedsGuestPhone(false);

                if (!publicId) {
                    setError("Invalid order reference.");
                    return;
                }

                let data;

                if (isLoggedIn) {
                    data = await getOrderByPublicId(publicId);
                } else {
                    const phoneToUse = phoneOverride || passedPhoneNumber;

                    if (!phoneToUse) {
                        // Guests must verify with their phone number first.
                        setNeedsGuestPhone(true);
                        return;
                    }

                    data = await getGuestOrderByPublicId(
                        publicId,
                        phoneToUse
                    );
                }

                setOrder(data);
            } catch (err) {
                console.error("Error loading order:", err);
                setError(err.message || "Unable to load this order.");
            } finally {
                setLoading(false);
            }
        },
        [publicId, isLoggedIn, passedPhoneNumber]
    );

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect -- data fetch on mount, setState only runs after await
        loadOrder();
    }, [loadOrder]);

    const handleGuestPhoneSubmit = (e) => {
        e.preventDefault();

        const cleaned = guestPhoneInput.replace(/\s+/g, "");

        if (cleaned) {
            loadOrder(cleaned);
        }
    };

    // LOADING STATE
    if (loading) {
        return (
            <div className="orderdetails-page">
                <div className="orderdetails-loading">
                    <p>Loading order details...</p>
                </div>
            </div>
        );
    }

    // GUEST NEEDS PHONE NUMBER TO VERIFY
    if (needsGuestPhone) {
        return (
            <div className="orderdetails-page">
                <div className="orderdetails-error">
                    <h2>Verify your order</h2>
                    <p>
                        Enter the phone number you used when placing this
                        order.
                    </p>

                    <form
                        onSubmit={handleGuestPhoneSubmit}
                        className="orderdetails-guest-form"
                    >
                        <input
                            type="tel"
                            value={guestPhoneInput}
                            onChange={(e) =>
                                setGuestPhoneInput(e.target.value)
                            }
                            placeholder="98XXXXXXXX"
                            required
                        />

                        <button type="submit">View order</button>
                    </form>
                </div>
            </div>
        );
    }

    // ERROR STATE
    if (error || !order) {
        return (
            <div className="orderdetails-page">
                <div className="orderdetails-error">
                    <h2>Order not found</h2>
                    <p>{error || "We couldn't find this order."}</p>

                    <button
                        onClick={() =>
                            navigate(isLoggedIn ? "/orders" : "/")
                        }
                    >
                        {isLoggedIn ? "Back to my orders" : "Back to home"}
                    </button>
                </div>
            </div>
        );
    }

    // MAIN ORDER DETAILS
    return (
        <div className="orderdetails-page">
            <div className="orderdetails-container">

                {/* CONFIRMATION BANNER (only right after checkout) */}
                {justPlaced && (
                    <div className="orderdetails-confirmation">
                        <CheckCircle2 size={22} />

                        <div>
                            <h2>Order placed successfully</h2>
                            <p>
                                Thank you for your order. We will confirm it
                                shortly.
                            </p>
                        </div>
                    </div>
                )}

                {/* HEADER CARD */}
                <div className="orderdetails-card orderdetails-header">
                    <div className="orderdetails-header-text">
                        <span className="orderdetails-header-label">
                            Order reference
                        </span>

                        <h1 title={order.publicId}>
                            {getReference(order.publicId)}
                        </h1>

                        <p>Placed on {formatDate(order.orderDate)}</p>
                    </div>

                    <span className={statusClass(order.status)}>
                        {order.status}
                    </span>
                </div>

                {/* ITEMS */}
                <div className="orderdetails-items">
                    <h2>Items</h2>

                    <div className="orderdetails-items-list">
                        {order.items.map((item) => {
                            const personalizedMessage =
                                item.personalizedMessage?.trim() || "";

                            const messageCharge = Number(
                                item.messageAdditionalPrice || 0
                            );

                            const unitPrice = Number(item.unitPrice || 0);
                            const quantity = Number(item.quantity || 1);

                            const hasPersonalizedMessage =
                                personalizedMessage.length > 0 &&
                                !item.isCustomized;

                            const cakePrice = hasPersonalizedMessage
                                ? unitPrice - messageCharge
                                : unitPrice;

                            return (
                                <div
                                    className="orderdetails-item-card"
                                    key={item.orderItemId}
                                >
                                    <div className="orderdetails-item-heading">
                                        <div>
                                            <h3>{item.cakeName}</h3>

                                            <span className="orderdetails-item-type">
                                                {item.isCustomized
                                                    ? "Customized cake"
                                                    : "Regular cake"}
                                            </span>
                                        </div>

                                        <span className="orderdetails-item-quantity">
                                            Qty {quantity}
                                        </span>
                                    </div>

                                    {/* PERSONALIZED MESSAGE */}
                                    {hasPersonalizedMessage && (
                                        <div className="orderdetails-personalized-message">
                                            <span>Personalized message</span>
                                            <p>“{personalizedMessage}”</p>
                                        </div>
                                    )}

                                    {/* CUSTOMIZATION NOTE */}
                                    {item.isCustomized && (
                                        <p className="orderdetails-customized-note">
                                            Made with your selected design
                                            options.
                                        </p>
                                    )}

                                    {/* PRICE BREAKDOWN */}
                                    <dl className="orderdetails-item-pricing">
                                        <div>
                                            <dt>Cake price</dt>
                                            <dd>{formatMoney(cakePrice)}</dd>
                                        </div>

                                        {hasPersonalizedMessage && (
                                            <div>
                                                <dt>Message charge</dt>
                                                <dd>
                                                    {formatMoney(messageCharge)}
                                                </dd>
                                            </div>
                                        )}

                                        <div>
                                            <dt>
                                                Unit price × {quantity}
                                            </dt>
                                            <dd>{formatMoney(unitPrice)}</dd>
                                        </div>

                                        <div className="orderdetails-item-subtotal">
                                            <dt>Subtotal</dt>
                                            <dd>
                                                {formatMoney(item.subtotal)}
                                            </dd>
                                        </div>
                                    </dl>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* TOTAL */}
                <div className="orderdetails-total">
                    <span>Total amount</span>
                    <strong>{formatMoney(order.totalAmount)}</strong>
                </div>

                {/* DELIVERY AND PAYMENT */}
                <div className="orderdetails-card orderdetails-info">
                    <div className="orderdetails-info-row orderdetails-info-wide">
                        <span>Delivery address</span>
                        <strong>{order.shippingAddress || "—"}</strong>
                    </div>

                    <div className="orderdetails-info-row">
                        <span>Payment method</span>
                        <strong>
                            {order.paymentMethod === "CashOnDelivery"
                                ? "Cash on delivery"
                                : order.paymentMethod}
                        </strong>
                    </div>

                    <div className="orderdetails-info-row">
                        <span>Payment status</span>
                        <strong>{order.paymentStatus}</strong>
                    </div>
                </div>

                {/* ACTIONS */}
                <div className="orderdetails-actions">
                    {isLoggedIn && (
                        <button
                            className="orderdetails-orders-btn"
                            onClick={() => navigate("/orders")}
                        >
                            My orders
                        </button>
                    )}

                    <button
                        className="orderdetails-browse-btn"
                        onClick={() => navigate("/")}
                    >
                        Continue shopping
                    </button>
                </div>

            </div>
        </div>
    );
};

export default OrderDetails;
