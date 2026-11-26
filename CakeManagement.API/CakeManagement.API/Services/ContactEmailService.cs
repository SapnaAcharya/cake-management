using System.Net;
using System.Net.Http.Json;
using CakeManagementAPI.Services.Interfaces;

namespace CakeManagementAPI.Services
{
    public class ContactEmailService : IContactEmailService
    {
        private readonly HttpClient _httpClient;
        private readonly IConfiguration _configuration;

        public ContactEmailService(
            HttpClient httpClient,
            IConfiguration configuration)
        {
            _httpClient = httpClient;
            _configuration = configuration;
        }


        public async Task SendContactMessageAsync(
            string name,
            string email,
            string subject,
            string message)
        {
            // Step 1: Read Brevo configuration
            var apiKey = _configuration["Brevo:ApiKey"];
            var senderEmail = _configuration["Brevo:SenderEmail"];
            var recipientEmail = _configuration["Contact:RecipientEmail"];

            // Step 2: Validate email configuration
            if (string.IsNullOrWhiteSpace(apiKey) ||
                string.IsNullOrWhiteSpace(senderEmail) ||
                string.IsNullOrWhiteSpace(recipientEmail))
            {
                throw new InvalidOperationException(
                    "Brevo or Contact email settings are missing.");
            }

            // Step 3: Encode customer information for HTML
            var safeName = WebUtility.HtmlEncode(name);
            var safeEmail = WebUtility.HtmlEncode(email);
            var safeSubject = WebUtility.HtmlEncode(subject);

            var safeMessage = WebUtility.HtmlEncode(message)
                .Replace("\r\n", "<br>")
                .Replace("\n", "<br>");


            var html = $"""
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
    </head>

    <body style="
        font-family:Arial,Helvetica,sans-serif;
        color:#333333;
        margin:0;
        padding:20px;
        background-color:#ffffff;
    ">

        <div style="max-width:600px;margin:auto;">

            <h2 style="
                color:#B5486B;
                margin-bottom:5px;
            ">
                SweetCakes
            </h2>

            <p style="
                color:#777777;
                font-size:13px;
                margin-top:0;
            ">
                Custom Cakes for Every Celebration
            </p>

            <hr style="
                border:none;
                border-top:1px solid #eeeeee;
                margin:20px 0;
            ">

            <h3 style="font-size:18px;color:#333333;">
                New Contact Message
            </h3>

            <p style="font-size:14px;line-height:1.6;">
                A customer has submitted a message through
                the SweetCakes Contact Us form.
            </p>

            <p style="font-size:14px;line-height:1.8;">
                <strong>Name:</strong> {safeName}<br>

                <strong>Email:</strong>
                <a href="mailto:{safeEmail}"
                   style="color:#B5486B;">
                    {safeEmail}
                </a>
                <br>

                <strong>Subject:</strong> {safeSubject}
            </p>

            <hr style="
                border:none;
                border-top:1px solid #eeeeee;
                margin:20px 0;
            ">

            <h3 style="font-size:16px;color:#333333;">
                Customer Message
            </h3>

            <p style="
                font-size:14px;
                line-height:1.7;
                white-space:normal;
                overflow-wrap:anywhere;
            ">
                {safeMessage}
            </p>

            <hr style="
                border:none;
                border-top:1px solid #eeeeee;
                margin:24px 0;
            ">

            <p style="
                font-size:13px;
                color:#777777;
                line-height:1.6;
            ">
                You can reply directly to this email
                to contact the customer.
            </p>

            <p style="
                font-size:12px;
                color:#999999;
                margin-top:20px;
            ">
                SweetCakes Admin Notification
            </p>

        </div>

    </body>
    </html>
    """;

            var text =
                "SweetCakes - New Contact Message\n\n" +
                "A customer has submitted a message through the Contact Us form.\n\n" +
                $"Name: {name}\n" +
                $"Email: {email}\n" +
                $"Subject: {subject}\n\n" +
                "Customer Message:\n" +
                $"{message}\n\n" +
                "You can reply directly to this email to contact the customer.\n\n" +
                "SweetCakes Admin Notification";


            // Step 6: Prepare Brevo email request
            var emailBody = new
            {
                sender = new
                {
                    name = "SweetCakes",
                    email = senderEmail
                },

                to = new[]
                {
            new
            {
                email = recipientEmail
            }
        },

                replyTo = new
                {
                    email = email,
                    name = name
                },

                subject = $"Contact Form: {subject}",
                htmlContent = html,
                textContent = text
            };

            // Step 7: Send email through Brevo
            using var request = new HttpRequestMessage(
                HttpMethod.Post,
                "https://api.brevo.com/v3/smtp/email");

            request.Headers.Add("api-key", apiKey);
            request.Headers.Add("accept", "application/json");

            request.Content = JsonContent.Create(emailBody);

            using var response =
                await _httpClient.SendAsync(request);

            // Step 8: Handle Brevo errors
            if (!response.IsSuccessStatusCode)
            {
                var errorResponse =
                    await response.Content.ReadAsStringAsync();

                throw new HttpRequestException(
                    $"Brevo contact email failed. " +
                    $"Status: {(int)response.StatusCode}. " +
                    $"Details: {errorResponse}");
            }
        }


        public async Task SendCustomerConfirmationAsync(
            string name,
            string email,
            string subject)
        {
            // Step 1: Read Brevo Confirmation
            var apiKey = _configuration["Brevo:ApiKey"];
            var senderEmail = _configuration["Brevo:SenderEmail"];

            // Step 2: Validate configuration
            if (string.IsNullOrWhiteSpace(apiKey) ||
                string.IsNullOrWhiteSpace(senderEmail))
            {
                throw new InvalidOperationException(
                    "Brevo email settings are missing.");
            }

            // Step 3: Validate customer information
            if (string.IsNullOrWhiteSpace(name) ||
                string.IsNullOrWhiteSpace(email) ||
                string.IsNullOrWhiteSpace(subject))
            {
                throw new ArgumentException(
                    "Customer name, email, and subject are required.");
            }


            // Step 4: Encode customer information for HTML
            var safeName = WebUtility.HtmlEncode(name);
            var safeSubject = WebUtility.HtmlEncode(subject);

            // Step 5: Create HTML email
            var html = $"""
        <!DOCTYPE html>
        <html>
        <body style="font-family:Arial,sans-serif;color:#333">
            <div style="max-width:600px;margin:auto;padding:24px">
                <h2 style="color:#B5486B">
                    Thank You for Contacting SweetCakes!
                </h2>

                <p>Dear {safeName},</p>

                <p>
                    Thank you for reaching out to SweetCakes.
                    We have successfully received your enquiry.
                </p>

                <p>
                    Our team will review your message and
                    get back to you as soon as possible.
                </p>

                <p>
                    <strong>Your enquiry subject:</strong>
                    {safeSubject}
                </p>

                <p>
                    Thank you for choosing SweetCakes.
                </p>

                <p>
                    SweetCakes<br>
                    Custom Cakes for Every Celebration
                </p>
            </div>
        </body>
        </html>
        """;

            // Step 6: Create plain-text email
            var text =
                $"Dear {name},\n\n" +
                "Thank you for contacting SweetCakes.\n" +
                "We have successfully received your enquiry.\n" +
                "Our team will get back to you as soon as possible.\n\n" +
                $"Your enquiry subject: {subject}\n\n" +
                "Thank you for choosing SweetCakes.";

            // Step 7: Prepare Brevo email request
            var emailBody = new
            {
                sender = new
                {
                    name = "SweetCakes",
                    email = senderEmail
                },

                // Send confirmation to the customer
                to = new[]
                {
            new { email = email, name = name }
        },
                subject = "We Received Your Message - SweetCakes",
                htmlContent = html,
                textContent = text
            };

            // Step 8: Send email through Brevo
            using var request = new HttpRequestMessage(
                HttpMethod.Post,
                "https://api.brevo.com/v3/smtp/email");

            request.Headers.Add("api-key", apiKey);
            request.Headers.Add("accept", "application/json");
            request.Content = JsonContent.Create(emailBody);

            using var response =
                await _httpClient.SendAsync(request);

            // step 9: Handle Brevo errors
            if (!response.IsSuccessStatusCode)
            {
                var errorResponse = await response.Content.ReadAsStringAsync();

                throw new HttpRequestException(
                    $"Brevo customer confirmation email failed. " +
                    $"Status: {(int)response.StatusCode}. " +
                    $"Details: {errorResponse}");
            }
        }

        public async Task SendAdminReplyAsync(
    string customerName,
    string customerEmail,
    string originalSubject,
    string replyMessage)
        {
            // Step 1: Read Brevo configuration
            var apiKey = _configuration["Brevo:ApiKey"];
            var senderEmail = _configuration["Brevo:SenderEmail"];
            var adminReplyTo = _configuration["Contact:RecipientEmail"];

            // Step 2: Validate configuration
            if (string.IsNullOrWhiteSpace(apiKey) ||
                string.IsNullOrWhiteSpace(senderEmail))
            {
                throw new InvalidOperationException(
                    "Brevo email settings are missing.");
            }

            // Step 3: Validate input
            if (string.IsNullOrWhiteSpace(customerName) ||
                string.IsNullOrWhiteSpace(customerEmail) ||
                string.IsNullOrWhiteSpace(originalSubject) ||
                string.IsNullOrWhiteSpace(replyMessage))
            {
                throw new ArgumentException(
                    "Customer name, email, subject, and reply message are required.");
            }

            // Step 4: Encode values for HTML
            var safeName = WebUtility.HtmlEncode(customerName);
            var safeSubject = WebUtility.HtmlEncode(originalSubject);
            var safeReply = WebUtility.HtmlEncode(replyMessage)
                .Replace("\r\n", "<br>")
                .Replace("\n", "<br>");

            // Step 5: Create HTML email
            var html = $"""
    <!DOCTYPE html>
    <html>
    <body style="font-family:Arial,sans-serif;color:#333">
        <div style="max-width:600px;margin:auto;padding:24px">
            <h2 style="color:#B5486B">SweetCakes</h2>

            <p>Dear {safeName},</p>

            <p>
                Thank you for contacting us. Here is our reply
                to your enquiry
                "<strong>{safeSubject}</strong>":
            </p>

            <div style="
                border-left:3px solid #B5486B;
                padding:8px 16px;
                margin:16px 0;
                font-size:14px;
                line-height:1.7;
                overflow-wrap:anywhere;
            ">
                {safeReply}
            </div>

            <p>
                If you have any more questions, just reply
                to this email.
            </p>

            <p>
                Warm regards,<br>
                SweetCakes<br>
                Custom Cakes for Every Celebration
            </p>
        </div>
    </body>
    </html>
    """;

            // Step 6: Create plain-text email
            var text =
                $"Dear {customerName},\n\n" +
                $"Thank you for contacting us. Here is our reply to your enquiry \"{originalSubject}\":\n\n" +
                $"{replyMessage}\n\n" +
                "If you have any more questions, just reply to this email.\n\n" +
                "Warm regards,\nSweetCakes\nCustom Cakes for Every Celebration";

            // Step 7: Prepare Brevo request
            var emailBody = new Dictionary<string, object>
            {
                ["sender"] = new { name = "SweetCakes", email = senderEmail },
                ["to"] = new[] { new { email = customerEmail, name = customerName } },
                ["subject"] = $"Re: {originalSubject}",
                ["htmlContent"] = html,
                ["textContent"] = text
            };

            // Customer replies go to the admin inbox (only if configured)
            if (!string.IsNullOrWhiteSpace(adminReplyTo))
            {
                emailBody["replyTo"] = new { email = adminReplyTo, name = "SweetCakes" };
            }

            // Step 8: Send email through Brevo
            using var request = new HttpRequestMessage(
                HttpMethod.Post,
                "https://api.brevo.com/v3/smtp/email");

            request.Headers.Add("api-key", apiKey);
            request.Headers.Add("accept", "application/json");
            request.Content = JsonContent.Create(emailBody);

            using var response = await _httpClient.SendAsync(request);

            // Step 9: Handle Brevo errors
            if (!response.IsSuccessStatusCode)
            {
                var errorResponse = await response.Content.ReadAsStringAsync();

                throw new HttpRequestException(
                    $"Brevo admin reply email failed. " +
                    $"Status: {(int)response.StatusCode}. " +
                    $"Details: {errorResponse}");
            }
        }

    }
}
