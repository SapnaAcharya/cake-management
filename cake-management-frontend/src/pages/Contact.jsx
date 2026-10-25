import { useState } from "react";
import Navbar from "../components/Navbar";
import  API_BASE_URL  from "../config/apiConfig";
import "../styles/Contact.css";

function Contact() {
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        subject: "",
        message: "",
    });

    const [submitted, setSubmitted] = useState(false);
    const [loading, setLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");

    const handleChange = (e) => {
        const { name, value } = e.target;

        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));

        setSubmitted(false);
        setErrorMessage("");
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        setLoading(true);
        setSubmitted(false);
        setErrorMessage("");

        try {
            const response = await fetch(`${API_BASE_URL}/contact`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Accept: "application/json",
                },
                body: JSON.stringify({
                    name: formData.name.trim(),
                    email: formData.email.trim(),
                    subject: formData.subject.trim(),
                    message: formData.message.trim(),
                }),
            });

            const data = await response.json().catch(() => ({}));

            if (!response.ok) {
                throw new Error(
                    data.message || "Unable to send your message. Please try again."
                );
            }

            setSubmitted(true);
            setFormData({
                name: "",
                email: "",
                subject: "",
                message: "",
            });
        } catch (error) {
            console.error("Contact form error:", error);

            setErrorMessage(
                error.message ||
                    "Unable to send your message. Please try again later."
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="contact-page">
            <Navbar />

            <main className="contact-content">
                <h1>Contact Us</h1>
                <p>
                    Have a question or a custom cake request? Send us a message.
                </p>

                {submitted && (
                    <div className="contact-success" role="status">
                        Thanks for reaching out! Your message has been sent
                        successfully.
                    </div>
                )}

                {errorMessage && (
                    <div className="contact-error" role="alert">
                        {errorMessage}
                    </div>
                )}

                <form className="contact-form" onSubmit={handleSubmit}>
                    <label htmlFor="name">Name</label>
                    <input
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        maxLength={100}
                        autoComplete="name"
                        required
                    />

                    <label htmlFor="email">Email</label>
                    <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        maxLength={254}
                        autoComplete="email"
                        required
                    />

                    <label htmlFor="subject">Subject</label>
                    <input
                        type="text"
                        id="subject"
                        name="subject"
                        value={formData.subject}
                        onChange={handleChange}
                        maxLength={150}
                        placeholder="e.g. Custom birthday cake enquiry"
                        required
                    />

                    <label htmlFor="message">Message</label>
                    <textarea
                        id="message"
                        name="message"
                        rows="5"
                        value={formData.message}
                        onChange={handleChange}
                        maxLength={5000}
                        required
                    />

                    <button
                        type="submit"
                        className="contact-submit-btn"
                        disabled={loading}
                    >
                        {loading ? "Sending..." : "Send Message"}
                    </button>
                </form>
            </main>
        </div>
    );
}

export default Contact;
