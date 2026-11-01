using System.Net.Http.Json;
using CakeManagementAPI.Services.Interfaces;
using System.Net.Http;
using System.Net.Http.Json;
using System.Text.Json;

namespace CakeManagementAPI.Services
{
    public class BrevoPasswordResetEmailService :
        IPasswordResetEmailService,
        ICourseEnrollmentEmailService
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

        // 1. Password Reset Email
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

        // 2. Email Verification OTP
        public async Task SendEmailVerificationOtpAsync(
         string email,
         string otp)
        {
            var apiKey = _configuration["Brevo:ApiKey"];
            var senderEmail = _configuration["Brevo:SenderEmail"];

            if (string.IsNullOrWhiteSpace(apiKey) ||
                string.IsNullOrWhiteSpace(senderEmail))
            {
                throw new InvalidOperationException(
                    "Brevo API key or sender email is not configured.");
            }

            var safeOtp = System.Net.WebUtility.HtmlEncode(otp);
            var year = DateTime.UtcNow.Year;

            var html = $"""
                <!DOCTYPE html>
                <html>
                <body style="font-family:Arial,sans-serif;color:#222;padding:24px">
                    <div style="max-width:520px;margin:auto">
                        <h2 style="color:#B5486B">Verify your email</h2>
                        <p>Welcome to SweetCakes!</p>
                        <p>Enter this verification code to confirm your email address:</p>
                        <div style="padding:20px;background:#f9f0f3;
                                    text-align:center;font-size:32px;
                                    font-weight:bold;letter-spacing:8px">
                            {safeOtp}
                        </div>
                        <p>This code expires in 5 minutes.</p>
                        <p>If you did not create a SweetCakes account, you can ignore this email.</p>
                        <p>Thanks,<br>The SweetCakes Team</p>
                        <p style="font-size:12px;color:#888">
                            &copy; {year} SweetCakes
                        </p>
                    </div>
                </body>
                </html>
                """;

            var text =
                "Welcome to SweetCakes!\n\n" +
                $"Your email verification code is: {otp}\n\n" +
                "This code expires in 5 minutes. " +
                "If you did not create an account, ignore this email.";

            var emailBody = new
            {
                sender = new
                {
                    name = "SweetCakes",
                    email = senderEmail
                },
                to = new[]
                {
                    new { email }
                },
                subject = "Verify your SweetCakes email address",
                htmlContent = html,
                textContent = text
            };

            using var request = new HttpRequestMessage(
                HttpMethod.Post,
                "https://api.brevo.com/v3/smtp/email");

            request.Headers.Add("api-key", apiKey);
            request.Headers.Add("accept", "application/json");
            request.Content = JsonContent.Create(emailBody);

            using var response = await _httpClient.SendAsync(request);

            if (!response.IsSuccessStatusCode)
            {
                throw new HttpRequestException(
                    $"Brevo verification email failed with status " +
                    $"{(int)response.StatusCode}.");
            }
        }

        public async Task SendCourseEnrollmentEmailAsync(
            string email,
            string customerName,
            string courseName,
            DateTime startDate,
            DateTime endDate,
            string scheduleDetails)
        {
            var apiKey = _configuration["Brevo:ApiKey"];
            var senderEmail = _configuration["Brevo:SenderEmail"];

            if (string.IsNullOrWhiteSpace(apiKey) ||
                string.IsNullOrWhiteSpace(senderEmail))
            {
                throw new InvalidOperationException(
                    "Brevo API key or sender email is not configured.");
            }

            // Format training batch details
            var formattedStartDate = startDate.ToString("dd MMMM yyyy");
            var formattedEndDate = endDate.ToString("dd MMMM yyyy");

            // Encode dynamic values
            var safeCustomerName =
                System.Net.WebUtility.HtmlEncode(customerName);

            var safeCourseName =
                System.Net.WebUtility.HtmlEncode(courseName);

            var safeStartDate =
                System.Net.WebUtility.HtmlEncode(formattedStartDate);

            var safeEndDate =
                System.Net.WebUtility.HtmlEncode(formattedEndDate);

            var safeSchedule =
                System.Net.WebUtility.HtmlEncode(scheduleDetails);

            var year = DateTime.UtcNow.Year;

            var html = $"""
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Enrollment Confirmation</title>
</head>

<body style="margin:0;padding:24px;background-color:#f6f1ea;
             font-family:Arial,Helvetica,sans-serif;color:#2f2622;">

    <table role="presentation" width="100%" cellpadding="0"
           cellspacing="0" style="background-color:#f6f1ea;">
        <tr>
            <td align="center">

                <table role="presentation" width="600" cellpadding="0"
                       cellspacing="0"
                       style="width:100%;max-width:600px;
                              background:#ffffff;border-radius:12px;
                              overflow:hidden;">

                    <tr>
                        <td align="center"
                            style="background:#4a3428;padding:28px;">
                            <h2 style="color:white;margin:0;">
                                SweetCakes
                            </h2>
                            <p style="color:#e9dccd;font-size:12px;">
                                Professional Bakery Training
                            </p>
                        </td>
                    </tr>

                    <tr>
                        <td style="padding:32px;">
                            <h2 style="color:#4a3428;">
                                Your Enrollment is Confirmed!
                            </h2>

                            <p>Dear {safeCustomerName},</p>

                            <p>
                                Thank you for enrolling in our
                                SweetCakes training program.
                                Your seat has been successfully reserved.
                            </p>

                            <table width="100%" cellpadding="12"
                                   cellspacing="0"
                                   style="background:#faf6f0;
                                          border:1px solid #e8dfd3;">

                                <tr>
                                    <td colspan="2">
                                        <strong>Training Details</strong>
                                    </td>
                                </tr>

                                <tr>
                                    <td>Course</td>
                                    <td align="right">
                                        <strong>{safeCourseName}</strong>
                                    </td>
                                </tr>

                                <tr>
                                    <td>Start Date</td>
                                    <td align="right">
                                        {safeStartDate}
                                    </td>
                                </tr>

                                <tr>
                                    <td>End Date</td>
                                    <td align="right">
                                        {safeEndDate}
                                    </td>
                                </tr>

                                <tr>
                                    <td>Schedule</td>
                                    <td align="right">
                                        {safeSchedule}
                                    </td>
                                </tr>

                                <tr>
                                    <td>Status</td>
                                    <td align="right">
                                        <strong style="color:green;">
                                            Confirmed
                                        </strong>
                                    </td>
                                </tr>
                            </table>

                            <h3>What happens next?</h3>

                            <p>
                                Please arrive according to the
                                training schedule. Our team looks
                                forward to helping you develop your
                                baking and cake decorating skills.
                            </p>

                            <p>
                                If you have any questions, please
                                contact our team.
                            </p>

                            <p>
                                Thanks,<br>
                                With lots of love,<br>
                                <strong>The SweetCakes Team</strong>
                            </p>
                        </td>
                    </tr>

                    <tr>
                        <td align="center"
                            style="background:#faf6f0;padding:18px;
                                   color:#9a8d83;font-size:12px;">
                            &copy; {year} SweetCakes.
                            All rights reserved.
                        </td>
                    </tr>

                </table>

            </td>
        </tr>
    </table>

</body>
</html>
""";

            var text =
                $"Dear {customerName},\n\n" +
                "Your training enrollment is confirmed!\n\n" +
                $"Course: {courseName}\n" +
                $"Start Date: {formattedStartDate}\n" +
                $"End Date: {formattedEndDate}\n" +
                $"Schedule: {scheduleDetails}\n" +
                "Status: Confirmed\n\n" +
                "We look forward to seeing you at SweetCakes!\n\n" +
                "Thanks,\nThe SweetCakes Team";

            var emailBody = new
            {
                sender = new
                {
                    name = "SweetCakes",
                    email = senderEmail
                },
                to = new[]
                {
            new { email }
        },
                subject = "Your SweetCakes Training Enrollment is Confirmed!",
                htmlContent = html,
                textContent = text
            };

            using var request = new HttpRequestMessage(
                HttpMethod.Post,
                "https://api.brevo.com/v3/smtp/email");

            request.Headers.Add("api-key", apiKey);
            request.Headers.Add("accept", "application/json");

            request.Content = JsonContent.Create(emailBody);

            using var response = await _httpClient.SendAsync(request);

            if (!response.IsSuccessStatusCode)
            {
                throw new HttpRequestException(
                    $"Brevo enrollment email failed with status " +
                    $"{(int)response.StatusCode}.");
            }
        }

    }
}