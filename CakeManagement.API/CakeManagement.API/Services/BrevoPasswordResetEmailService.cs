using System.Net.Http.Json;
using CakeManagementAPI.Services.Interfaces;

namespace CakeManagementAPI.Services
{
    public class BrevoPasswordResetEmailService
        : IPasswordResetEmailService
    {
        private readonly HttpClient _httpClient;
        private readonly IConfiguration _configuration;

        public BrevoPasswordResetEmailService(
            HttpClient httpClient,
            IConfiguration configuration)
        {
            _httpClient = httpClient;
            _configuration = configuration;
        }

        public async Task SendPasswordResetEmailAsync(
            string email,
            string resetUrl)
        {
            var apiKey = _configuration["Brevo:ApiKey"];
            var senderEmail = _configuration["Brevo:SenderEmail"];

            if (string.IsNullOrWhiteSpace(apiKey) ||
                string.IsNullOrWhiteSpace(senderEmail))
            {
                throw new InvalidOperationException(
                    "Brevo API key or sender email is not configured.");
            }

            var safeResetUrl =
                System.Net.WebUtility.HtmlEncode(resetUrl);

            var year = DateTime.UtcNow.Year;

            var html = $"""
                <!DOCTYPE html>
                <html>
                <head>
                    <meta charset="utf-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1">
                </head>
                <body style="margin:0;padding:24px;background-color:#f9f9f9;font-family:Arial,sans-serif;color:#222222">
                    <div style="max-width:560px;margin:0 auto">
                        <p style="text-align:center;font-size:22px;font-weight:bold;margin:0 0 16px">
                            Cake Management
                        </p>
                        <div style="background-color:#ffffff;padding:32px;border-radius:8px">
                            <h2 style="margin:0 0 12px;font-size:20px">
                                You requested to reset your password!
                            </h2>
                            <p style="margin:0 0 8px;font-size:15px;line-height:1.5">
                                Please click the following button to proceed!
                            </p>
                            <p style="text-align:center;margin:28px 0">
                                <a href="{safeResetUrl}"
                                   style="display:inline-block;padding:12px 28px;
                                          background-color:#B5486B;color:#ffffff;
                                          font-size:15px;line-height:20px;
                                          text-decoration:none;border-radius:6px">
                                    Reset Password
                                </a>
                            </p>
                            <p style="margin:0 0 6px;font-size:13px;color:#555555;font-style:italic">
                                If you are unable to click the button, please click the following link:
                            </p>
                            <p style="margin:0 0 20px;font-size:13px;word-break:break-all">
                                <a href="{safeResetUrl}" style="color:#B5486B">{safeResetUrl}</a>
                            </p>
                            <p style="margin:0 0 20px;font-size:13px;color:#555555;line-height:1.5">
                                If you have not requested a password change, please ignore
                                this email. The link is valid for the next 30 minutes and
                                will automatically become invalid after that.
                            </p>
                            <p style="margin:0;font-size:14px;line-height:1.5">
                                Thanks,<br>
                                With lots of love,<br>
                                Your friends at Cake Management
                            </p>
                        </div>
                        <p style="text-align:center;font-size:12px;color:#888888;margin:16px 0 0">
                            &copy; {year} Cake Management. All rights reserved.
                        </p>
                    </div>
                </body>
                </html>
                """;
            var text =
                "You requested to reset your password!\n\n" +
                $"Please open this link to proceed: {resetUrl}\n\n" +
                "If you have not requested a password change, please ignore this email. " +
                "The link is valid for the next 30 minutes and will automatically become invalid after that.\n\n" +
                "Thanks,\nWith lots of love,\nYour friends at Cake Management";
            var emailBody = new
            {
                sender = new
                {
                    name = "Cake Management",
                    email = senderEmail
                },
                to = new[]
                {
                    new { email }
                },
                subject = "Reset your Cake Management password",
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
                    $"Brevo email request failed with status " +
                    $"{(int)response.StatusCode}.");
            }
        }
    }
}