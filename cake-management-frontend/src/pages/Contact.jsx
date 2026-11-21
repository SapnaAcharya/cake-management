import { useEffect, useState } from "react";
import { Navigation, Phone, Mail, MapPin, MessageCircle } from "lucide-react";

import Navbar from "../components/Navbar";
import ContactLocationMap from "../components/ContactLocationMap";
import contactService from "../services/contactService";
import "../styles/Contact.css";

const EMPTY_FORM = {
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
};

const Contact = () => {
    const [settings, setSettings] = useState(null);
    const [faqs, setFaqs] = useState([]);

    const [formData, setFormData] = useState(EMPTY_FORM);

    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    const [pageError, setPageError] = useState("");
    const [formError, setFormError] = useState("");
    const [success, setSuccess] = useState("");

    // Load contact settings and FAQs from the backend
    useEffect(() => {
        loadPageData();
    }, []);

    const loadPageData = async () => {
        setLoading(true);
        setPageError("");

        try {
            const results = await Promise.allSettled([
                contactService.getContactSettings(),
                contactService.getFaqs(),
            ]);

            if (results[0].status === "fulfilled") {
                const data = results[0].value;
                setSettings(data?.data ?? data ?? null);
            } else {
                console.error("Contact settings error:", results[0].reason);
            }

            if (results[1].status === "fulfilled") {
                const data = results[1].value;
                const faqList = data?.data ?? data;
                setFaqs(Array.isArray(faqList) ? faqList : []);
            } else {
                console.error("FAQ loading error:", results[1].reason);
            }

            if (
                results[0].status === "rejected" &&
                results[1].status === "rejected"
            ) {
                setPageError(
                    "Unable to load contact information. Please try again later."
                );
            }
        } catch (err) {
            console.error("Contact page loading error:", err);
            setPageError("Something went wrong while loading this page.");
        } finally {
            setLoading(false);
        }
    };

    // Subject options from backend settings
    const getSubjects = () => {
        if (!settings) return [];

        if (Array.isArray(settings.subjects)) {
            return settings.subjects;
        }

        if (typeof settings.subjectsJson === "string") {
            try {
                const parsed = JSON.parse(settings.subjectsJson);
                return Array.isArray(parsed) ? parsed : [];
            } catch {
                console.error("Invalid contact subjects JSON.");
                return [];
            }
        }

        return [];
    };

    const subjects = getSubjects();

    // Use the FAQs saved in Contact Settings if the separate FAQ call returned none
    const faqItems =
        faqs.length > 0
            ? faqs
            : Array.isArray(settings?.faqs)
            ? settings.faqs
            : [];

    const handleChange = (e) => {
        const { name, value } = e.target;

        setFormData((previousData) => ({
            ...previousData,
            [name]: value,
        }));

        setFormError("");
        setSuccess("");
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        setFormError("");
        setSuccess("");

        const payload = {
            name: formData.name.trim(),
            email: formData.email.trim(),
            subject: formData.subject.trim(),
            message: formData.message.trim(),
        };

        // Phone is optional. It is only sent when filled in, so the existing
        // request is unchanged for everyone who leaves it empty.
        const phone = formData.phone.trim();
        if (phone) {
            payload.phone = phone;
        }

        try {
            setSubmitting(true);

            const result = await contactService.sendContactMessage(payload);

            // The backend saves the message even if email fails
            if (result?.emailNotificationSent === false) {
                setSuccess(
                    result.message ||
                        "Your enquiry was received, but the email notification could not be sent."
                );
            } else {
                setSuccess(
                    result?.message ||
                        "Your enquiry has been submitted successfully."
                );
            }

            setFormData(EMPTY_FORM);
        } catch (err) {
            console.error("Contact form submission error:", err);

            setFormError(
                err.message ||
                    "Unable to submit your message. Please try again."
            );
        } finally {
            setSubmitting(false);
        }
    };

    const scrollToForm = (e) => {
        e.preventDefault();
        document
            .getElementById("contact-form")
            ?.scrollIntoView({ behavior: "smooth", block: "start" });
    };

    const scrollToDetails = (e) => {
        e.preventDefault();
        document
            .getElementById("contact-details")
            ?.scrollIntoView({ behavior: "smooth", block: "start" });
    };

    if (loading) {
        return (
            <>
                <Navbar />
                <p className="cu-loading">Loading contact information...</p>
            </>
        );
    }

    const latitude = Number(settings?.latitude);
    const longitude = Number(settings?.longitude);

    const validCoordinates =
        settings?.latitude !== null &&
        settings?.latitude !== undefined &&
        settings?.latitude !== "" &&
        settings?.longitude !== null &&
        settings?.longitude !== undefined &&
        settings?.longitude !== "" &&
        Number.isFinite(latitude) &&
        Number.isFinite(longitude);

    const hasSocials =
        settings?.whatsApp || settings?.instagram || settings?.facebook;

    const phoneHref = settings?.phone
        ? `tel:${settings.phone.replace(/[^\d+]/g, "")}`
        : null;

    return (
        <>
            <Navbar />

            <main className="cu-page">
                {/* HERO: text on the page background (left), photo fading in
                    from the right. No overlay, so nothing covers the faces.
                    Layout and fade are done in CSS (.cu-hero, .cu-hero-image). */}
                <section className="cu-hero">
                    <div className="cu-hero-inner">
                        <div className="cu-hero-text">
                            <span className="cu-eyebrow">Contact us</span>
                            <h1>{settings?.heroTitle || "Get in Touch"}</h1>
                            <p>
                                {settings?.heroText ||
                                    "Questions about an order or a custom cake? Send us a message and we will reply soon."}
                            </p>

                            <div className="cu-hero-actions">
                                <a
                                    className="cu-btn cu-btn-primary"
                                    href="#contact-form"
                                    onClick={scrollToForm}
                                >
                                    Send a message
                                </a>

                                <a
                                    className="cu-btn cu-btn-outline"
                                    href="#contact-details"
                                    onClick={scrollToDetails}
                                >
                                    Call us
                                </a>
                            </div>
                        </div>
                    </div>

                    <img
                        className="cu-hero-image"
                        src="/images/contact/contact_hero.png"
                        alt="A baker discussing a cake order with a customer"
                        onError={(e) => {
                            e.currentTarget.style.display = "none";
                        }}
                    />
                </section>

                <div className="cu-container">
                    {pageError && (
                        <div className="cu-alert cu-alert-error">
                            {pageError}
                        </div>
                    )}

                    {/* DETAILS + FORM */}
                    <section className="cu-grid cu-top">
                        {/* Contact details */}
                        <div className="cu-col cu-info" id="contact-details">
                            <h2>Contact details</h2>
                            <p className="cu-sub">
                                Feel free to reach out to us through any of the
                                following channels.
                            </p>

                            <ul className="cu-info-list">
                                <li>
                                    <span className="cu-icon">
                                        <Phone size={20} aria-hidden="true" />
                                    </span>
                                    <div className="cu-info-text">
                                        <span className="cu-label">Call us</span>
                                        {phoneHref ? (
                                            <a
                                                className="cu-value"
                                                href={phoneHref}
                                            >
                                                {settings.phone}
                                            </a>
                                        ) : (
                                            <span className="cu-value">
                                                Not provided
                                            </span>
                                        )}
                                        {settings?.hours && (
                                            <small>{settings.hours}</small>
                                        )}
                                    </div>
                                </li>

                                <li>
                                    <span className="cu-icon">
                                        <Mail size={20} aria-hidden="true" />
                                    </span>
                                    <div className="cu-info-text">
                                        <span className="cu-label">
                                            Email us
                                        </span>
                                        {settings?.email ? (
                                            <a
                                                className="cu-value"
                                                href={`mailto:${settings.email}`}
                                            >
                                                {settings.email}
                                            </a>
                                        ) : (
                                            <span className="cu-value">
                                                Not provided
                                            </span>
                                        )}
                                        {settings?.emailNote && (
                                            <small>{settings.emailNote}</small>
                                        )}
                                    </div>
                                </li>

                                <li>
                                    <span className="cu-icon">
                                        <MapPin size={20} aria-hidden="true" />
                                    </span>
                                    <div className="cu-info-text">
                                        <span className="cu-label">
                                            Visit the bakery
                                        </span>
                                        <span className="cu-value">
                                            {settings?.address ||
                                                "Address not provided"}
                                        </span>
                                    </div>
                                </li>

                                {hasSocials && (
                                    <li>
                                        <span className="cu-icon">
                                            <MessageCircle
                                                size={20}
                                                aria-hidden="true"
                                            />
                                        </span>
                                        <div className="cu-info-text">
                                            <span className="cu-label">
                                                Message us online
                                            </span>
                                            <span className="cu-socials">
                                                {settings?.whatsApp && (
                                                    <a
                                                        href={settings.whatsApp}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                    >
                                                        WhatsApp
                                                    </a>
                                                )}
                                                {settings?.instagram && (
                                                    <a
                                                        href={
                                                            settings.instagram
                                                        }
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                    >
                                                        Instagram
                                                    </a>
                                                )}
                                                {settings?.facebook && (
                                                    <a
                                                        href={settings.facebook}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                    >
                                                        Facebook
                                                    </a>
                                                )}
                                            </span>
                                        </div>
                                    </li>
                                )}
                            </ul>
                        </div>

                        {/* Message form */}
                        <div className="cu-col cu-form-panel" id="contact-form">
                            <h2>Send us a message</h2>
                            <p className="cu-sub">
                                Fill out the form below and we&rsquo;ll get back
                                to you soon.
                            </p>

                            {success && (
                                <p
                                    className="cu-alert cu-alert-success"
                                    role="status"
                                >
                                    {success}
                                </p>
                            )}

                            {formError && (
                                <p
                                    className="cu-alert cu-alert-error"
                                    role="alert"
                                >
                                    {formError}
                                </p>
                            )}

                            <form className="cu-form" onSubmit={handleSubmit}>
                                <div className="cu-form-row">
                                    <div className="cu-field">
                                        <label htmlFor="name">
                                            Your name *
                                        </label>
                                        <input
                                            id="name"
                                            type="text"
                                            name="name"
                                            autoComplete="name"
                                            value={formData.name}
                                            onChange={handleChange}
                                            maxLength={100}
                                            required
                                        />
                                    </div>

                                    <div className="cu-field">
                                        <label htmlFor="email">
                                            Your email *
                                        </label>
                                        <input
                                            id="email"
                                            type="email"
                                            name="email"
                                            autoComplete="email"
                                            value={formData.email}
                                            onChange={handleChange}
                                            maxLength={150}
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="cu-form-row">
                                    <div className="cu-field">
                                        <label htmlFor="phone">
                                            Phone <span>(optional)</span>
                                        </label>
                                        <input
                                            id="phone"
                                            type="tel"
                                            name="phone"
                                            autoComplete="tel"
                                            value={formData.phone}
                                            onChange={handleChange}
                                            maxLength={30}
                                        />
                                    </div>

                                    <div className="cu-field">
                                        <label htmlFor="subject">
                                            Subject *
                                        </label>
                                        <select
                                            id="subject"
                                            name="subject"
                                            value={formData.subject}
                                            onChange={handleChange}
                                            required
                                        >
                                            <option value="">
                                                Choose a subject
                                            </option>
                                            {subjects.map((subject, index) => (
                                                <option
                                                    key={index}
                                                    value={subject}
                                                >
                                                    {subject}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                <div className="cu-field cu-field-message">
                                    <label htmlFor="message">
                                        Your message *
                                    </label>
                                    <textarea
                                        id="message"
                                        name="message"
                                        rows={4}
                                        value={formData.message}
                                        onChange={handleChange}
                                        maxLength={2000}
                                        required
                                    />
                                    <span
                                        className="cu-counter"
                                        aria-hidden="true"
                                    >
                                        {formData.message.length}/2000
                                    </span>
                                </div>

                                <button
                                    type="submit"
                                    className="cu-btn cu-btn-primary cu-submit"
                                    disabled={submitting}
                                >
                                    {submitting ? "Sending..." : "Send Message"}
                                </button>
                            </form>
                        </div>
                    </section>

                    {/* FAQ + MAP */}
                    <section
                        className={`cu-grid cu-bottom ${
                            faqItems.length === 0 ? "cu-bottom-single" : ""
                        }`}
                    >
                        {faqItems.length > 0 && (
                            <div className="cu-col cu-faq">
                                <h2>Common questions</h2>
                                <p className="cu-sub">
                                    Find quick answers to common questions.
                                </p>

                                <div className="cu-faq-list">
                                    {faqItems.map((faq, index) => (
                                        <details
                                            className="cu-faq-item"
                                            key={faq.id ?? index}
                                            open={index === 0 ? true : undefined}
                                        >
                                            <summary>{faq.question}</summary>
                                            <p>{faq.answer}</p>
                                        </details>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div className="cu-col cu-map-col">
                            <h2>Find us</h2>
                            <p className="cu-sub">
                                {settings?.address || "Address not provided"}
                            </p>

                            {validCoordinates ? (
                                <div className="cu-map">
                                    <ContactLocationMap
                                        latitude={latitude}
                                        longitude={longitude}
                                        label={settings?.address || "Our Bakery"}
                                    />

                                    <a
                                        className="cu-directions"
                                        href={`https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                    >
                                        <Navigation
                                            size={16}
                                            aria-hidden="true"
                                        />
                                        Get directions
                                    </a>
                                </div>
                            ) : (
                                <p className="cu-muted">
                                    Location map is currently unavailable.
                                </p>
                            )}
                        </div>
                    </section>
                </div>
            </main>
        </>
    );
};

export default Contact;