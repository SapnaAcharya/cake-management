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
            var apiKey = _configuration["Brevo:ApiKey"];
            var senderEmail = _configuration["Brevo:SenderEmail"];
            var recipientEmail =
                _configuration["Contact:RecipientEmail"];

            if (string.IsNullOrWhiteSpace(apiKey) ||
                string.IsNullOrWhiteSpace(senderEmail) ||
                string.IsNullOrWhiteSpace(recipientEmail))
            {
                throw new InvalidOperationException(
                    "Brevo or Contact email settings are missing.");
            }

            var safeName = WebUtility.HtmlEncode(name);
            var safeEmail = WebUtility.HtmlEncode(email);
            var safeSubject = WebUtility.HtmlEncode(subject);
            var safeMessage = WebUtility.HtmlEncode(message)
                .Replace("\r\n", "<br>")
                .Replace("\n", "<br>");

            var html = $"""
                <!DOCTYPE html>
                <html>
                <body style="font-family:Arial,sans-serif;color:#333">
                    <div style="max-width:600px;margin:auto;padding:24px">
                        <h2 style="color:#B5486B">
                            New SweetCakes Contact Message
                        </h2>
                        <p><strong>Name:</strong> {safeName}</p>
                        <p><strong>Email:</strong> {safeEmail}</p>
                        <p><strong>Subject:</strong> {safeSubject}</p>
                        <hr>
                        <h3>Message</h3>
                        <p style="line-height:1.7">{safeMessage}</p>
                    </div>
                </body>
                </html>
                """;

            var text =
                $"New SweetCakes contact message\n\n" +
                $"Name: {name}\n" +
                $"Email: {email}\n" +
                $"Subject: {subject}\n\n" +
                $"Message:\n{message}";

            var emailBody = new
            {
                sender = new
                {
                    name = "SweetCakes",
                    email = senderEmail
                },
                to = new[]
                {
                    new { email = recipientEmail }
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

            using var request = new HttpRequestMessage(
                HttpMethod.Post,
                "https://api.brevo.com/v3/smtp/email");

            request.Headers.Add("api-key", apiKey);
            request.Headers.Add("accept", "application/json");
            request.Content = JsonContent.Create(emailBody);

            using var response =
                await _httpClient.SendAsync(request);

            if (!response.IsSuccessStatusCode)
            {
                throw new HttpRequestException(
                    $"Brevo contact email failed with status " +
                    $"{(int)response.StatusCode}.");
            }
        }
    }
}
