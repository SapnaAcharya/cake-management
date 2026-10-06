import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createOrder } from "../services/orderservice";
import { getGuestCart, clearGuestCart } from "../services/guestCartService";
import phoneVerificationService from "../services/phoneVerificationService";
import "../styles/Checkout.css";

const Checkout = () => {
    const navigate = useNavigate();

    const [shippingAddress, setShippingAddress] = useState("");
    const [paymentMethod, setPaymentMethod] = useState("CashOnDelivery");

    const [phoneNumber, setPhoneNumber] = useState("");
    const [otpSent, setOtpSent] = useState(false);
    const [otp, setOtp] = useState("");
    const [phoneVerified, setPhoneVerified] = useState(false);
    const [verificationLoading, setVerificationLoading] = useState(false);

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    // Logged in or guest?
    const token =
        localStorage.getItem("token") ||
        sessionStorage.getItem("token");

    const isGuest = !token;

    const cleanDecorations = (decorations) =>
         (decorations ?? [])
         .filter((d) => Number.isInteger(Number(d.decorationId)))
         .map((d) => ({ ...d, decorationId: Number(d.decorationId), quantity: d.quantity ?? 1 }));

    // PLACE ORDER
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        // Validate shipping address
        if (!shippingAddress.trim()) {
            setError("Please enter a shipping address.");
            return;
        }

        // Guests: phone number + OTP verification required.
        // Logged-in customers already proved their identity via login.
        let cleanedPhone = "";

        if (isGuest) {
            cleanedPhone = phoneNumber.replace(/\s+/g, "");

            if (!cleanedPhone) {
                setError("Please enter your phone number.");
                return;
            }

            // Nepal mobile number validation
            if (!/^9[678]\d{8}$/.test(cleanedPhone)) {
                setError("Please enter a valid 10-digit Nepal mobile number.");
                return;
            }

            if (!phoneVerified) {
                setError(
                    "Please verify your phone number before placing the order."
                );
                return;
            }
        }

        try {
            setLoading(true);

            const orderData = {
                shippingAddress: shippingAddress.trim(),
                paymentMethod
            };

            // Guest: send items from the local guest cart.
            // Logged-in: no items needed, the server reads the cart.
            if (isGuest) {
                orderData.phoneNumber = cleanedPhone;

                const guestCart = getGuestCart();

                if (!guestCart || guestCart.length === 0) {
                    setError(
                        "Your cart is empty. Please add a cake before checkout."
                    );
                    return;
                }

                // Customized items saved before the update have no design details
                const brokenItem = guestCart.find(
                    (item) => item.isCustomized && !item.customizationDto
                );

                if (brokenItem) {
                    setError(
                        "A customized cake in your cart is missing its design details. " +
                        "Please remove it and customize it again."
                    );
                    return;
                }
orderData.items = guestCart.map((item) => {
    if (!item.isCustomized) {
        return {
            cakeId: item.cakeId ?? item.id,
            quantity: item.quantity,
            customization: null
        };
    }

    const dto = item.customizationDto;
    const rawColorId = dto?.colorId;
    const parsedColorId =
        rawColorId === "" || rawColorId === undefined
            ? null
            : parseInt(rawColorId, 10);

    const customization = {
        ...dto,
        cakeId: item.cakeId ?? item.id,
        colorId: parsedColorId,
        decorations: cleanDecorations(dto?.decorations)
    };

    return {
        cakeId: item.cakeId ?? item.id,
        quantity: item.quantity,
        customization
    };
});

console.log(
    "ORDER DATA",
    JSON.stringify(orderData, null, 2)
);

console.log(
    "CUSTOMIZATION DTOs",
    guestCart.map(x => x.customizationDto)
);
            }

            console.log(
    "ORDER DATA",
    JSON.stringify(orderData, null, 2)
);
            const order = await createOrder(orderData);
            console.log("Order data",JSON.stringify(orderData, null, 2));

            if (isGuest) {
                clearGuestCart();
            }

            navigate(`/orders/${order.orderId}`, {
                state: {
                    justPlaced: true,
                    ...(isGuest && { phoneNumber: cleanedPhone })
                }
            });
        } catch (err) {
            console.error("Error placing order:", err);

            setError(
                err.message ||
                "Unable to place your order. Please try again."
            );
        } finally {
            setLoading(false);
        }
    };

    // SEND OTP
    const handleSendOtp = async () => {
        if (!phoneNumber.trim()) {
            setError("Please enter your phone number.");
            return;
        }

        try {
            setVerificationLoading(true);
            setError("");

            await phoneVerificationService.sendOtp(phoneNumber.trim());

            setOtpSent(true);
        } catch (err) {
            console.error("Error sending OTP:", err);
            setError(err.message || "Unable to send OTP.");
        } finally {
            setVerificationLoading(false);
        }
    };

    // VERIFY OTP
    const handleVerifyOtp = async () => {
        if (!otp.trim()) {
            setError("Please enter the OTP.");
            return;
        }

        try {
            setVerificationLoading(true);
            setError("");

            await phoneVerificationService.verifyOtp(
                phoneNumber.trim(),
                otp.trim()
            );

            setPhoneVerified(true);
            setOtpSent(false);
        } catch (err) {
            console.error("Error verifying OTP:", err);
            setError(err.message || "Invalid OTP. Please try again.");
        } finally {
            setVerificationLoading(false);
        }
    };

    return (
        <div className="checkout-page">
            <div className="checkout-container">

                {/* HEADER */}
                <div className="checkout-header">
                    <h1>Checkout</h1>
                    <p>Confirm your delivery details to place your order.</p>
                </div>

                {/* ERROR MESSAGE */}
                {error && (
                    <div className="checkout-error-message">
                        {error}
                    </div>
                )}

                {/* CHECKOUT FORM */}
                <form onSubmit={handleSubmit} className="checkout-form">

                    {/* Phone + OTP: guests only */}
                    {isGuest && (
                        <div className="checkout-field">
                            <label htmlFor="phoneNumber">
                                Contact Number
                            </label>
                            <input
                                id="phoneNumber"
                                type="tel"
                                value={phoneNumber}
                                onChange={(e) => {
                                    setPhoneNumber(e.target.value);
                                    setPhoneVerified(false);
                                }}
                                placeholder="Enter your 10-digit mobile number"
                                disabled={phoneVerified}
                            />

                            {!phoneVerified && !otpSent && (
                                <button
                                    type="button"
                                    onClick={handleSendOtp}
                                    disabled={verificationLoading}
                                >
                                    {verificationLoading
                                        ? "Sending OTP..."
                                        : "Send OTP"}
                                </button>
                            )}

                            {otpSent && !phoneVerified && (
                                <div className="otp-section">
                                    <label htmlFor="otp">Enter OTP</label>
                                    <input
                                        id="otp"
                                        type="text"
                                        value={otp}
                                        onChange={(e) => setOtp(e.target.value)}
                                        placeholder="Enter OTP"
                                    />

                                    <button
                                        type="button"
                                        onClick={handleVerifyOtp}
                                        disabled={verificationLoading}
                                    >
                                        {verificationLoading
                                            ? "Verifying..."
                                            : "Verify OTP"}
                                    </button>
                                </div>
                            )}

                            {phoneVerified && (
                                <p className="phone-verified">
                                    Phone number verified
                                </p>
                            )}
                        </div>
                    )}

                    <div className="checkout-field">
                        <label htmlFor="shippingAddress">
                            Shipping Address
                        </label>
                        <textarea
                            id="shippingAddress"
                            value={shippingAddress}
                            onChange={(e) => setShippingAddress(e.target.value)}
                            placeholder="Enter your full delivery address"
                            rows={4}
                            required
                        />
                    </div>

                    <div className="checkout-field">
                        <label htmlFor="paymentMethod">
                            Payment Method
                        </label>
                        <select
                            id="paymentMethod"
                            value={paymentMethod}
                            onChange={(e) => setPaymentMethod(e.target.value)}
                        >
                            <option value="CashOnDelivery">Cash on Delivery</option>
                            <option value="Card">Card</option>
                            <option value="eSewa">eSewa</option>
                        </select>
                    </div>

                    {/* ACTIONS */}
                    <div className="checkout-actions">
                        <button
                            type="button"
                            className="checkout-back-btn"
                            onClick={() => navigate("/cart")}
                            disabled={loading}
                        >
                            Back to Cart
                        </button>

                        <button
                            type="submit"
                            className="checkout-submit-btn"
                            disabled={loading}
                        >
                            {loading ? "Placing Order..." : "Place Order"}
                        </button>
                    </div>

                </form>
            </div>
        </div>
    );
};

export default Checkout;
