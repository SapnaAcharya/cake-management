import API_BASE_URL from "../config/apiConfig";

const sendOtp = async(phoneNumber) => {
    const response = await fetch(
        `${API_BASE_URL}/PhoneVerification/send`,
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                phoneNumber
            })
        }
    );

    const data = await response.json().catch(() => null);

    if (!response.ok){
        throw new Error(
            data?.message || "Failed to send OTP."
        );
    }
    return data;
};

const verifyOtp = async(phoneNumber, otp) => {
    const response = await fetch(
        `${API_BASE_URL}/PhoneVerification/verify`,
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                phoneNumber, otp
            })
        }
    );

    const data = await response.json().catch(() => null);

    if (!response.ok){
        throw new Error(
            data?.message || "Invalid OTP."
        )
    }
    return data;
};

// export 
const phoneVerificationService = {
    sendOtp, 
    verifyOtp
}

export default phoneVerificationService;