import { useEffect, useState } from "react";
import {
    Save,
    RefreshCw,
    CheckCircle,
    XCircle,
    Plus,
    Trash2,
} from "lucide-react";

import AdminLayout from "../../../layouts/AdminLayout";
import contactService from "../../../services/contactService";
import "../../../styles/ContactSettings.css";

const initialFormData = {
    heroTitle: "",
    heroText: "",
    phone: "",
    email: "",
    hours: "",
    emailNote: "",
    address: "",
    latitude: 0,
    longitude: 0,
    whatsApp: "",
    instagram: "",
    facebook: "",
    subjects: [],
};

const initialFaqForm = {
    question: "",
    answer: "",
    displayOrder: 0,
};

function ContactSettings() {
    const [formData, setFormData] = useState(initialFormData);

    const [newSubject, setNewSubject] = useState("");

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    // FAQ management
    const [faqs, setFaqs] = useState([]);
    const [faqForm, setFaqForm] = useState(initialFaqForm);
    const [editingFaqId, setEditingFaqId] = useState(null);
    const [savingFaq, setSavingFaq] = useState(false);

    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    // Load existing contact settings
    const loadSettings = async () => {
        try {
            setLoading(true);
            setError("");
            setSuccess("");

            const response = await contactService.getContactSettings();
            const data = response?.data ?? response;

            setFormData({
                heroTitle: data.heroTitle || "",
                heroText: data.heroText || "",
                phone: data.phone || "",
                email: data.email || "",
                hours: data.hours || "",
                emailNote: data.emailNote || "",
                address: data.address || "",
                latitude: Number(data.latitude ?? 0),
                longitude: Number(data.longitude ?? 0),
                whatsApp: data.whatsApp || "",
                instagram: data.instagram || "",
                facebook: data.facebook || "",
                subjects: Array.isArray(data.subjects) ? data.subjects : [],
            });

            // Load FAQs separately
            const faqResponse = await contactService.getFaqs();
            const faqData = faqResponse?.data ?? faqResponse;

            setFaqs(Array.isArray(faqData) ? faqData : []);
        } catch (err) {
            console.error(err);
            setError(err.message || "Failed to load contact settings.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadSettings();
    }, []);

    // Handle normal input changes
    const handleChange = (e) => {
        const { name, value } = e.target;

        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    // Add a contact form subject
    const handleAddSubject = () => {
        const subject = newSubject.trim();

        if (!subject) return;

        if (
            formData.subjects.some(
                (item) => item.toLowerCase() === subject.toLowerCase()
            )
        ) {
            setError("This subject already exists.");
            return;
        }

        setFormData((prev) => ({
            ...prev,
            subjects: [...prev.subjects, subject],
        }));

        setNewSubject("");
        setError("");
    };

    // Remove a subject
    const handleRemoveSubject = (index) => {
        setFormData((prev) => ({
            ...prev,
            subjects: prev.subjects.filter((_, i) => i !== index),
        }));
    };

    // Handle FAQ input changes
    const handleFaqChange = (e) => {
        const { name, value } = e.target;

        setFaqForm((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    // Create or update FAQ
    const handleFaqSubmit = async (e) => {
        e.preventDefault();

        try {
            setSavingFaq(true);
            setError("");
            setSuccess("");

            const payload = {
                question: faqForm.question.trim(),
                answer: faqForm.answer.trim(),
                displayOrder: Number(faqForm.displayOrder),
            };

            if (editingFaqId !== null) {
                await contactService.updateFaq(editingFaqId, payload);
                setSuccess("FAQ updated successfully.");
            } else {
                await contactService.createFaq(payload);
                setSuccess("FAQ created successfully.");
            }

            // Reload FAQs after saving
            const response = await contactService.getFaqs();
            const data = response?.data ?? response;

            setFaqs(Array.isArray(data) ? data : []);

            // Reset form
            setFaqForm(initialFaqForm);
            setEditingFaqId(null);

            scrollToTop();
        } catch (err) {
            console.error(err);
            setError(err.message || "Failed to save FAQ.");
            scrollToTop();
        } finally {
            setSavingFaq(false);
        }
    };

    // Edit FAQ
    const handleEditFaq = (faq) => {
        setEditingFaqId(faq.id);

        setFaqForm({
            question: faq.question || "",
            answer: faq.answer || "",
            displayOrder: faq.displayOrder ?? 0,
        });
    };

    // Cancel editing FAQ
    const handleCancelFaqEdit = () => {
        setEditingFaqId(null);
        setFaqForm(initialFaqForm);
    };

    // Delete FAQ
    const handleDeleteFaq = async (id) => {
        const confirmed = window.confirm(
            "Are you sure you want to delete this FAQ?"
        );

        if (!confirmed) return;

        try {
            setError("");
            setSuccess("");

            await contactService.deleteFaq(id);

            setFaqs((prev) => prev.filter((faq) => faq.id !== id));

            if (editingFaqId === id) {
                handleCancelFaqEdit();
            }

            setSuccess("FAQ deleted successfully.");
            scrollToTop();
        } catch (err) {
            console.error(err);
            setError(err.message || "Failed to delete FAQ.");
            scrollToTop();
        }
    };

    // Save updated settings
    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            setSaving(true);
            setError("");
            setSuccess("");

            const payload = {
                ...formData,
                latitude: Number(formData.latitude),
                longitude: Number(formData.longitude),
                whatsApp: formData.whatsApp.trim() || null,
                instagram: formData.instagram.trim() || null,
                facebook: formData.facebook.trim() || null,
            };

            await contactService.updateContactSettings(payload);

            setSuccess("Contact settings updated successfully.");
            scrollToTop();
        } catch (err) {
            console.error(err);
            setError(err.message || "Failed to update contact settings.");
            scrollToTop();
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <AdminLayout
                title="Contact Settings"
                subtitle="Manage your store's contact information."
            >
                <div className="contact-settings-loading">
                    <RefreshCw className="refresh-spinning" size={22} />
                    <p>Loading contact settings...</p>
                </div>
            </AdminLayout>
        );
    }

    return (
        <AdminLayout
            title="Contact Settings"
            subtitle="Manage the information displayed on your Contact Us page."
        >
            <>
                {/* MAIN SETTINGS FORM (ends after the Subjects section) */}
                <form
                    id="contact-settings-form"
                    className="contact-settings-form"
                    onSubmit={handleSubmit}
                >
                    {/* SUCCESS MESSAGE */}
                    {success && (
                        <div className="contact-settings-success">
                            <CheckCircle size={18} />
                            {success}
                        </div>
                    )}

                    {/* ERROR MESSAGE */}
                    {error && (
                        <div className="contact-settings-error">
                            <XCircle size={18} />
                            {error}
                        </div>
                    )}

                    {/* HERO SECTION */}
                    <section className="contact-settings-card">
                        <div className="contact-settings-card-header">
                            <h2>Contact Page Content</h2>
                            <p>
                                Manage the main heading and description shown
                                to customers.
                            </p>
                        </div>

                        <div className="contact-settings-grid">
                            <div className="contact-settings-field">
                                <label htmlFor="heroTitle">Hero Title</label>

                                <input
                                    id="heroTitle"
                                    name="heroTitle"
                                    value={formData.heroTitle}
                                    onChange={handleChange}
                                    required
                                    maxLength={100}
                                />
                            </div>

                            <div className="contact-settings-field full-width">
                                <label htmlFor="heroText">
                                    Hero Description
                                </label>

                                <textarea
                                    id="heroText"
                                    name="heroText"
                                    value={formData.heroText}
                                    onChange={handleChange}
                                    maxLength={500}
                                    rows={4}
                                />
                            </div>
                        </div>
                    </section>

                    {/* CONTACT INFORMATION */}
                    <section className="contact-settings-card">
                        <div className="contact-settings-card-header">
                            <h2>Contact Information</h2>
                            <p>
                                Update your bakery's phone, email and business
                                hours.
                            </p>
                        </div>

                        <div className="contact-settings-grid">
                            <div className="contact-settings-field">
                                <label htmlFor="phone">Phone Number</label>

                                <input
                                    id="phone"
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleChange}
                                    required
                                    maxLength={30}
                                />
                            </div>

                            <div className="contact-settings-field">
                                <label htmlFor="email">Email Address</label>

                                <input
                                    id="email"
                                    name="email"
                                    type="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    required
                                    maxLength={254}
                                />
                            </div>

                            <div className="contact-settings-field">
                                <label htmlFor="hours">Opening Hours</label>

                                <input
                                    id="hours"
                                    name="hours"
                                    value={formData.hours}
                                    onChange={handleChange}
                                    maxLength={200}
                                    placeholder="e.g. Sunday - Friday, 9 AM - 7 PM"
                                />
                            </div>

                            <div className="contact-settings-field">
                                <label htmlFor="emailNote">Email Note</label>

                                <input
                                    id="emailNote"
                                    name="emailNote"
                                    value={formData.emailNote}
                                    onChange={handleChange}
                                    maxLength={500}
                                />
                            </div>
                        </div>
                    </section>

                    {/* LOCATION */}
                    <section className="contact-settings-card">
                        <div className="contact-settings-card-header">
                            <h2>Bakery Location</h2>
                            <p>
                                Update your bakery address and map coordinates.
                            </p>
                        </div>

                        <div className="contact-settings-grid">
                            <div className="contact-settings-field full-width">
                                <label htmlFor="address">Full Address</label>

                                <input
                                    id="address"
                                    name="address"
                                    value={formData.address}
                                    onChange={handleChange}
                                    required
                                    maxLength={300}
                                />
                            </div>

                            <div className="contact-settings-field">
                                <label htmlFor="latitude">Latitude</label>

                                <input
                                    id="latitude"
                                    name="latitude"
                                    type="number"
                                    step="any"
                                    min="-90"
                                    max="90"
                                    value={formData.latitude}
                                    onChange={handleChange}
                                    required
                                />
                            </div>

                            <div className="contact-settings-field">
                                <label htmlFor="longitude">Longitude</label>

                                <input
                                    id="longitude"
                                    name="longitude"
                                    type="number"
                                    step="any"
                                    min="-180"
                                    max="180"
                                    value={formData.longitude}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                        </div>

                        <p className="contact-settings-map-note">
                            We will add an interactive map picker in the next
                            step so you can select the location by moving a
                            marker.
                        </p>
                    </section>

                    {/* SOCIAL MEDIA */}
                    <section className="contact-settings-card">
                        <div className="contact-settings-card-header">
                            <h2>Social Media Links</h2>
                            <p>
                                Add links to your bakery's social media
                                accounts.
                            </p>
                        </div>

                        <div className="contact-settings-grid">
                            <div className="contact-settings-field">
                                <label htmlFor="whatsApp">WhatsApp URL</label>

                                <input
                                    id="whatsApp"
                                    name="whatsApp"
                                    type="url"
                                    value={formData.whatsApp}
                                    onChange={handleChange}
                                    placeholder="https://wa.me/..."
                                />
                            </div>

                            <div className="contact-settings-field">
                                <label htmlFor="instagram">Instagram URL</label>

                                <input
                                    id="instagram"
                                    name="instagram"
                                    type="url"
                                    value={formData.instagram}
                                    onChange={handleChange}
                                    placeholder="https://instagram.com/..."
                                />
                            </div>

                            <div className="contact-settings-field">
                                <label htmlFor="facebook">Facebook URL</label>

                                <input
                                    id="facebook"
                                    name="facebook"
                                    type="url"
                                    value={formData.facebook}
                                    onChange={handleChange}
                                    placeholder="https://facebook.com/..."
                                />
                            </div>
                        </div>
                    </section>

                    {/* SUBJECTS */}
                    <section className="contact-settings-card">
                        <div className="contact-settings-card-header">
                            <h2>Contact Form Subjects</h2>
                            <p>
                                Manage the subject options customers can select
                                when sending an enquiry.
                            </p>
                        </div>

                        <div className="contact-subject-add">
                            <input
                                type="text"
                                value={newSubject}
                                onChange={(e) => setNewSubject(e.target.value)}
                                onKeyDown={(e) => {
                                    // Enter adds the subject instead of
                                    // submitting the whole settings form
                                    if (e.key === "Enter") {
                                        e.preventDefault();
                                        handleAddSubject();
                                    }
                                }}
                                placeholder="Enter a new subject"
                                maxLength={150}
                            />

                            <button
                                type="button"
                                className="contact-subject-add-btn"
                                onClick={handleAddSubject}
                            >
                                <Plus size={17} />
                                Add Subject
                            </button>
                        </div>

                        <div className="contact-subject-list">
                            {formData.subjects.length > 0 ? (
                                formData.subjects.map((subject, index) => (
                                    <div
                                        className="contact-subject-item"
                                        key={`${subject}-${index}`}
                                    >
                                        <span>{subject}</span>

                                        <button
                                            type="button"
                                            onClick={() =>
                                                handleRemoveSubject(index)
                                            }
                                            aria-label={`Remove ${subject}`}
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                ))
                            ) : (
                                <p className="contact-subject-empty">
                                    No subjects added yet.
                                </p>
                            )}
                        </div>
                    </section>

                </form>
                {/* MAIN FORM ENDS HERE: the FAQ section below is NOT inside it */}

                {/* FAQ MANAGEMENT (has its own separate form) */}
                <section
                    className="contact-settings-card"
                    style={{ marginTop: 24 }}
                >
                    <div className="contact-settings-card-header">
                        <h2>Frequently Asked Questions</h2>
                        <p>
                            Manage the questions and answers displayed on your
                            customer Contact Us page.
                        </p>
                    </div>

                    {/* FAQ FORM */}
                    <form onSubmit={handleFaqSubmit}>
                        <div className="contact-settings-grid">
                            <div className="contact-settings-field full-width">
                                <label htmlFor="faqQuestion">Question</label>

                                <input
                                    id="faqQuestion"
                                    name="question"
                                    value={faqForm.question}
                                    onChange={handleFaqChange}
                                    placeholder="Enter a question"
                                    required
                                    maxLength={300}
                                />
                            </div>

                            <div className="contact-settings-field full-width">
                                <label htmlFor="faqAnswer">Answer</label>

                                <textarea
                                    id="faqAnswer"
                                    name="answer"
                                    value={faqForm.answer}
                                    onChange={handleFaqChange}
                                    placeholder="Enter the answer"
                                    rows={4}
                                    required
                                />
                            </div>

                            <div className="contact-settings-field">
                                <label htmlFor="displayOrder">
                                    Display Order
                                </label>

                                <input
                                    id="displayOrder"
                                    name="displayOrder"
                                    type="number"
                                    min="0"
                                    value={faqForm.displayOrder}
                                    onChange={handleFaqChange}
                                />
                            </div>
                        </div>

                        <div className="contact-settings-actions">
                            <button
                                type="submit"
                                className="contact-settings-save-btn"
                                disabled={savingFaq}
                            >
                                <Save size={18} />

                                {savingFaq
                                    ? "Saving..."
                                    : editingFaqId !== null
                                    ? "Update FAQ"
                                    : "Add FAQ"}
                            </button>

                            {editingFaqId !== null && (
                                <button
                                    type="button"
                                    onClick={handleCancelFaqEdit}
                                >
                                    Cancel
                                </button>
                            )}
                        </div>
                    </form>

                    {/* EXISTING FAQ LIST */}
                    <div className="contact-faq-admin-list">
                        <h3>Existing FAQs ({faqs.length})</h3>

                        {faqs.length === 0 ? (
                            <p>No FAQs added yet.</p>
                        ) : (
                            faqs.map((faq) => (
                                <div
                                    className="contact-faq-admin-item"
                                    key={faq.id}
                                >
                                    <div>
                                        <h4>{faq.question}</h4>

                                        <p>{faq.answer}</p>

                                        <small>
                                            Display Order: {faq.displayOrder}
                                        </small>
                                    </div>

                                    <div className="contact-faq-admin-actions">
                                        <button
                                            type="button"
                                            onClick={() => handleEditFaq(faq)}
                                        >
                                            Edit
                                        </button>

                                        <button
                                            type="button"
                                            onClick={() =>
                                                handleDeleteFaq(faq.id)
                                            }
                                        >
                                            <Trash2 size={16} />
                                            Delete
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </section>

                {/* SAVE BAR: at the bottom of the page, linked to the main form by id */}
                <div className="contact-settings-save-bar">
                    <button
                        type="submit"
                        form="contact-settings-form"
                        className="contact-settings-save-btn"
                        disabled={saving}
                    >
                        <Save size={18} />
                        {saving ? "Saving..." : "Save Changes"}
                    </button>
                </div>
            </>
        </AdminLayout>
    );
}

export default ContactSettings;