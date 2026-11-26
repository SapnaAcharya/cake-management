namespace CakeManagementAPI.Services.Interfaces
{
    public interface IContactEmailService
    {
        // Notify the admin about the new enquiry.
        Task SendContactMessageAsync(
            string name,
            string email,
            string subject,
            string message);

        // Confirm to the customer that their enquiry was received.
        Task SendCustomerConfirmationAsync(
            string name,
            string email,
            string subject);

        Task SendAdminReplyAsync(
             string customerName,
             string customerEmail,
             string originalSubject,
             string replyMessage);
    }
}
