import { useState } from "react";
import Navbar from "../components/Navbar";
import "../styles/Contact.css";

function Contact() {
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        message: "",
    });
    const [submitted, setSubmitted] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        // TODO: replace with a real API call once you have a Contact endpoint
        console.log("Contact form submitted:", formData);
        setSubmitted(true);
        setFormData({ name: "", email: "", message: "" });
    };

    return (
        <div className="contact-page">
            <Navbar />

            <main className="contact-content">
                <h1>Contact Us</h1>
                <p>Have a question or a custom cake request? Send us a message.</p>

                {submitted && (
                    <div className="contact-success">
                        Thanks for reaching out! We'll get back to you soon.
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
                        required
                    />

                    <label htmlFor="email">Email</label>
                    <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                    />

                    <label htmlFor="message">Message</label>
                    <textarea
                        id="message"
                        name="message"
                        rows="5"
                        value={formData.message}
                        onChange={handleChange}
                        required
                    />

                    <button type="submit" className="contact-submit-btn">
                        Send Message
                    </button>
                </form>
            </main>
        </div>
    );
}

export default Contact;