import { useEffect, useState } from "react";
import {
    Mail,
    Eye,
    RefreshCw,
    Clock,
    CheckCircle,
    MessageCircle,
    XCircle,
    X,
    Trash2,
    Search,
} from "lucide-react";

import AdminLayout from "../../../layouts/AdminLayout";
import contactService from "../../../services/contactService";
import "../../../styles/ManageContactMessages.css";

const statuses = ["Pending", "Read", "Replied"];

function ManageContactMessages() {
    const [messages, setMessages] = useState([]);
    const [selectedMessage, setSelectedMessage] = useState(null);

    const [loading, setLoading] = useState(true);
    const [detailsLoading, setDetailsLoading] = useState(false);

    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const [statusFilter, setStatusFilter] = useState("All");
    const [searchTerm, setSearchTerm] = useState("");

    const [updatingMessageId, setUpdatingMessageId] = useState(null);
    const [deletingMessageId, setDeletingMessageId] = useState(null);

    // Admin reply state
   const [replyMessage, setReplyMessage] = useState("");
   const [sendingReply, setSendingReply] = useState(false);

    // Load all contact messages
    const loadMessages = async () => {
        try {
            setLoading(true);
            setError("");

            const response =
                await contactService.getAllContactMessages();

            const data = response?.data ?? response;

            setMessages(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error(err);
            setError(
                err.message || "Failed to load contact messages."
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadMessages();
    }, []);

    // View message details
    const handleViewMessage = async (messageId) => {
        try {
            setDetailsLoading(true);
            setError("");
            setSelectedMessage(null);

            const response =
                await contactService.getContactMessageById(messageId);

            const data = response?.data ?? response;

            setSelectedMessage(data);
        } catch (err) {
            console.error(err);
            setError(
                err.message || "Failed to load message details."
            );
        } finally {
            setDetailsLoading(false);
        }
    };

    // Update message status
    const handleStatusChange = async (messageId, newStatus) => {
        try {
            setUpdatingMessageId(messageId);
            setError("");
            setSuccess("");

            await contactService.updateContactMessageStatus(
                messageId,
                newStatus
            );

            // Update the message in the table
            setMessages((prev) =>
                prev.map((message) =>
                    message.id === messageId
                        ? { ...message, status: newStatus }
                        : message
                )
            );

            // Update the open details modal
            setSelectedMessage((prev) =>
                prev?.id === messageId
                    ? { ...prev, status: newStatus }
                    : prev
            );

            setSuccess(
                `Message status updated to ${newStatus}.`
            );
        } catch (err) {
            console.error(err);
            setError(
                err.message || "Failed to update message status."
            );
        } finally {
            setUpdatingMessageId(null);
        }
    };

    // Send admin reply to customer
const handleSendReply = async () => {
    if (!selectedMessage) return;

    const trimmedReply = replyMessage.trim();

    if (!trimmedReply) {
        setError("Please enter a reply message.");
        return;
    }

    try {
        setSendingReply(true);
        setError("");
        setSuccess("");

        await contactService.sendAdminReply(
            selectedMessage.id,
            trimmedReply
        );

        // Update message status in the table
        setMessages((prev) =>
            prev.map((message) =>
                message.id === selectedMessage.id
                    ? {
                        ...message,
                        status: "Replied",
                        updatedAt: new Date().toISOString(),
                    }
                    : message
            )
        );

        // Update the open details modal
        setSelectedMessage((prev) =>
            prev
                ? {
                    ...prev,
                    status: "Replied",
                    updatedAt: new Date().toISOString(),
                }
                : prev
        );

        setReplyMessage("");

        setSuccess(
            "Reply sent successfully to the customer."
        );
    } catch (err) {
        console.error(err);

        setError(
            err.message || "Failed to send reply."
        );
    } finally {
        setSendingReply(false);
    }
};

    // Delete contact message
    const handleDeleteMessage = async (messageId) => {
        const confirmed = window.confirm(
            "Are you sure you want to delete this contact message? This action cannot be undone."
        );

        if (!confirmed) return;

        try {
            setDeletingMessageId(messageId);
            setError("");
            setSuccess("");

            await contactService.deleteContactMessage(messageId);

            setMessages((prev) =>
                prev.filter((message) => message.id !== messageId)
            );

            if (selectedMessage?.id === messageId) {
                setSelectedMessage(null);
            }

            setSuccess("Contact message deleted successfully.");
        } catch (err) {
            console.error(err);
            setError(
                err.message || "Failed to delete contact message."
            );
        } finally {
            setDeletingMessageId(null);
        }
    };

    // Search and filter messages
    const filteredMessages = messages.filter((message) => {
        const matchesStatus =
            statusFilter === "All" ||
            message.status === statusFilter;

        const search = searchTerm.toLowerCase().trim();

        const matchesSearch =
            !search ||
            message.name?.toLowerCase().includes(search) ||
            message.email?.toLowerCase().includes(search) ||
            message.subject?.toLowerCase().includes(search);

        return matchesStatus && matchesSearch;
    });

    // Statistics
    const totalMessages = messages.length;

    const pendingMessages = messages.filter(
        (message) => message.status === "Pending"
    ).length;

    const readMessages = messages.filter(
        (message) => message.status === "Read"
    ).length;

    const repliedMessages = messages.filter(
        (message) => message.status === "Replied"
    ).length;

    // Format date
    const formatDate = (date) => {
        if (!date) return "—";

        return new Date(date).toLocaleString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    // Status CSS class
    const getStatusClass = (status) => {
        switch (status) {
            case "Pending":
                return "contact-message-status pending";

            case "Read":
                return "contact-message-status read";

            case "Replied":
                return "contact-message-status replied";

            default:
                return "contact-message-status";
        }
    };

    return (
        <AdminLayout
            title="Contact Messages"
            subtitle="View and manage enquiries submitted by your customers."
        >
            {/* SUCCESS MESSAGE */}
            {success && (
                <div className="contact-messages-success">
                    <CheckCircle size={18} />
                    {success}
                </div>
            )}

            {/* ERROR MESSAGE */}
            {error && (
                <div className="contact-messages-error">
                    <XCircle size={18} />
                    {error}
                </div>
            )}

            {/* PAGE ACTIONS */}
            <div className="contact-messages-actions">
                <button
                    className="contact-messages-refresh-btn"
                    onClick={loadMessages}
                    disabled={loading}
                >
                    <RefreshCw
                        size={17}
                        className={loading ? "refresh-spinning" : ""}
                    />
                    Refresh
                </button>
            </div>

            {/* STATISTICS */}
            <div className="contact-message-stat-grid">
                <div className="contact-message-stat-card">
                    <div className="contact-message-stat-icon">
                        <Mail size={21} />
                    </div>

                    <div>
                        <p>Total Messages</p>
                        <h2>{totalMessages}</h2>
                    </div>
                </div>

                <div className="contact-message-stat-card">
                    <div className="contact-message-stat-icon pending-icon">
                        <Clock size={21} />
                    </div>

                    <div>
                        <p>Pending</p>
                        <h2>{pendingMessages}</h2>
                    </div>
                </div>

                <div className="contact-message-stat-card">
                    <div className="contact-message-stat-icon read-icon">
                        <Eye size={21} />
                    </div>

                    <div>
                        <p>Read</p>
                        <h2>{readMessages}</h2>
                    </div>
                </div>

                <div className="contact-message-stat-card">
                    <div className="contact-message-stat-icon replied-icon">
                        <CheckCircle size={21} />
                    </div>

                    <div>
                        <p>Replied</p>
                        <h2>{repliedMessages}</h2>
                    </div>
                </div>
            </div>

            {/* MESSAGE TABLE */}
            <div className="contact-messages-card">
                <div className="contact-messages-card-header">
                    <div>
                        <h2>Customer Enquiries</h2>
                        <p>
                            {filteredMessages.length} messages found
                        </p>
                    </div>

                    <div className="contact-message-filters">
                        <div className="contact-message-search">
                            <Search size={17} />

                            <input
                                type="text"
                                placeholder="Search name, email or subject..."
                                value={searchTerm}
                                onChange={(e) =>
                                    setSearchTerm(e.target.value)
                                }
                            />
                        </div>

                        <div className="contact-message-status-filter">
                            <label htmlFor="messageStatusFilter">
                                Status
                            </label>

                            <select
                                id="messageStatusFilter"
                                value={statusFilter}
                                onChange={(e) =>
                                    setStatusFilter(e.target.value)
                                }
                            >
                                <option value="All">All Status</option>
                                <option value="Pending">Pending</option>
                                <option value="Read">Read</option>
                                <option value="Replied">Replied</option>
                            </select>
                        </div>
                    </div>
                </div>

                {loading ? (
                    <div className="contact-messages-loading">
                        <RefreshCw className="refresh-spinning" size={22} />
                        <p>Loading contact messages...</p>
                    </div>
                ) : filteredMessages.length === 0 ? (
                    <div className="contact-messages-empty">
                        <Mail size={42} />

                        <h3>No contact messages found</h3>

                        <p>
                            There are no messages matching your search
                            or selected status.
                        </p>
                    </div>
                ) : (
                    <div className="contact-messages-table-container">
                        <table className="contact-messages-table">
                            <thead>
                                <tr>
                                    <th>S.N.</th>
                                    <th>Customer</th>
                                    <th>Subject</th>
                                    <th>Received Date</th>
                                    <th>Status</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>

                            <tbody>
                                {filteredMessages.map((message, index) => (
                                    <tr key={message.id}>
                                        <td>{index + 1}</td>

                                        <td>
                                            <div className="contact-customer-info">
                                                <strong>
                                                    {message.name}
                                                </strong>

                                                <span>
                                                    {message.email}
                                                </span>
                                            </div>
                                        </td>

                                        <td>
                                            <span className="contact-message-subject">
                                                {message.subject}
                                            </span>
                                        </td>

                                        <td>
                                            {formatDate(message.createdAt)}
                                        </td>

                                        <td>
                                            <select
                                                className={getStatusClass(
                                                    message.status
                                                )}
                                                value={message.status}
                                                disabled={
                                                    updatingMessageId ===
                                                    message.id
                                                }
                                                onChange={(e) =>
                                                    handleStatusChange(
                                                        message.id,
                                                        e.target.value
                                                    )
                                                }
                                            >
                                                {statuses.map((status) => (
                                                    <option
                                                        key={status}
                                                        value={status}
                                                    >
                                                        {status}
                                                    </option>
                                                ))}
                                            </select>
                                        </td>

                                        <td>
                                            <div className="contact-message-row-actions">
                                                <button
                                                    className="contact-message-view-btn"
                                                    onClick={() =>
                                                        handleViewMessage(
                                                            message.id
                                                        )
                                                    }
                                                >
                                                    <Eye size={16} />
                                                    View
                                                </button>

                                                <button
                                                    className="contact-message-delete-btn"
                                                    onClick={() =>
                                                        handleDeleteMessage(
                                                            message.id
                                                        )
                                                    }
                                                    disabled={
                                                        deletingMessageId ===
                                                        message.id
                                                    }
                                                    aria-label="Delete message"
                                                    title="Delete message"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* MESSAGE DETAILS MODAL */}
            {(selectedMessage || detailsLoading) && (
                <div
                    className="contact-message-modal-overlay"
                    onClick={() => {
                        if (!detailsLoading) {
                            setSelectedMessage(null);
                            setReplyMessage("");
                        }
                    }}
                >
                    <div
                        className="contact-message-modal"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Modal Header */}
                        <div className="contact-message-modal-header">
                            <div>
                                <h2>Message Details</h2>
                                <p>
                                    View the customer's enquiry.
                                </p>
                            </div>

                            <button
                                className="contact-message-modal-close"
                                onClick={() => {
                                    setSelectedMessage(null);
                                    setReplyMessage("");
                                }}
                                disabled={detailsLoading}
                                aria-label="Close modal"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {/* Loading State */}
                        {detailsLoading ? (
                            <div className="contact-message-details-loading">
                                <RefreshCw
                                    size={22}
                                    className="refresh-spinning"
                                />
                                <p>Loading message details...</p>
                            </div>
                        ) : (
                            selectedMessage && (
                                <>
                                    {/* Customer Details */}
                                    <div className="contact-message-detail-grid">
                                        <div className="contact-message-detail-box">
                                            <span>Customer Name</span>
                                            <strong>
                                                {selectedMessage.name}
                                            </strong>
                                        </div>

                                        <div className="contact-message-detail-box">
                                            <span>Email Address</span>
                                            <a
                                                href={`mailto:${selectedMessage.email}`}
                                            >
                                                {selectedMessage.email}
                                            </a>
                                        </div>

                                        <div className="contact-message-detail-box">
                                            <span>Subject</span>
                                            <strong>
                                                {selectedMessage.subject}
                                            </strong>
                                        </div>

                                        <div className="contact-message-detail-box">
                                            <span>Received Date</span>
                                            <strong>
                                                {formatDate(
                                                    selectedMessage.createdAt
                                                )}
                                            </strong>
                                        </div>
                                    </div>

                                    {/* Message Status */}
                                    <div className="contact-message-detail-status">
                                        <label htmlFor="selectedMessageStatus">
                                            Message Status
                                        </label>

                                        <select
                                            id="selectedMessageStatus"
                                            className={getStatusClass(
                                                selectedMessage.status
                                            )}
                                            value={selectedMessage.status}
                                            disabled={
                                                updatingMessageId ===
                                                selectedMessage.id
                                            }
                                            onChange={(e) =>
                                                handleStatusChange(
                                                    selectedMessage.id,
                                                    e.target.value
                                                )
                                            }
                                        >
                                            {statuses.map((status) => (
                                                <option
                                                    key={status}
                                                    value={status}
                                                >
                                                    {status}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    {/* Customer Message */}
                                    <div className="contact-message-body">
                                        <h3>Customer Message</h3>
                                        <p>{selectedMessage.message}</p>
                                    </div>

                                    {/* Last Updated */}
                                    {selectedMessage.updatedAt && (
                                        <p className="contact-message-updated">
                                            Last updated:{" "}
                                            {formatDate(
                                                selectedMessage.updatedAt
                                            )}
                                        </p>
                                    )}

                                    {/* Reply to Customer */}
                                    <div className="contact-message-reply-form">
                                        <h3>Reply to Customer</h3>

                                        <p className="contact-message-reply-recipient">
                                            To: {selectedMessage.email}
                                        </p>

                                        <textarea
                                            value={replyMessage}
                                            onChange={(e) =>
                                                setReplyMessage(
                                                    e.target.value
                                                )
                                            }
                                            placeholder="Write your reply to the customer..."
                                            rows={5}
                                            maxLength={5000}
                                            disabled={sendingReply}
                                        />

                                        <button
                                            type="button"
                                            className="contact-message-reply-btn"
                                            onClick={handleSendReply}
                                            disabled={
                                                sendingReply ||
                                                !replyMessage.trim()
                                            }
                                        >
                                            <MessageCircle size={17} />

                                            {sendingReply
                                                ? "Sending..."
                                                : "Send Reply"}
                                        </button>
                                    </div>

                                    {/* Modal Actions */}
                                    <div className="contact-message-modal-actions">
                                        <button
                                            className="contact-message-modal-delete-btn"
                                            onClick={() =>
                                                handleDeleteMessage(
                                                    selectedMessage.id
                                                )
                                            }
                                            disabled={
                                                deletingMessageId ===
                                                selectedMessage.id
                                            }
                                        >
                                            <Trash2 size={17} />
                                            Delete Message
                                        </button>
                                    </div>
                                </>
                            )
                        )}
                    </div>
                </div>
            )}

        </AdminLayout>
    );
}

export default ManageContactMessages;
