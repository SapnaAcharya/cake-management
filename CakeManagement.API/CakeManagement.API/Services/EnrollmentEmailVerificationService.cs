using System.Security.Cryptography;
using System.Text;
using CakeManagementAPI.Data;
using CakeManagementAPI.Models;
using CakeManagementAPI.Services.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace CakeManagementAPI.Services
{
    public class EnrollmentEmailVerificationService
    {
        private const string Purpose = "TrainingEnrollment";
        private const int MaxAttempts = 5;

        private readonly AppDbContext _context;
        private readonly IPasswordResetEmailService _emailService;
        private readonly IConfiguration _configuration;

        public EnrollmentEmailVerificationService(
            AppDbContext context,
            IPasswordResetEmailService emailService,
            IConfiguration configuration)
        {
            _context = context;
            _emailService = emailService;
            _configuration = configuration;
        }

        // Hash OTP using HMAC-SHA256
        private string HashCode(string email, string code)
        {
            var key = _configuration["Otp:HmacKey"];

            if (string.IsNullOrWhiteSpace(key) || key.Length < 32)
            {
                throw new InvalidOperationException(
                    "A secure Otp:HmacKey of at least 32 characters is required.");
            }

            using var hmac = new HMACSHA256(
                Encoding.UTF8.GetBytes(key));

            var input = $"{email}:{code}";

            return Convert.ToHexString(
                hmac.ComputeHash(
                    Encoding.UTF8.GetBytes(input)));
        }

        // Hash the verification token before storing it
        private static string HashVerificationToken(string token)
        {
            var tokenBytes = Encoding.UTF8.GetBytes(token);

            return Convert.ToHexString(
                SHA256.HashData(tokenBytes));
        }

        // STEP 1: Send OTP to customer email
        public async Task SendCodeAsync(string email)
        {
            if (string.IsNullOrWhiteSpace(email))
                throw new InvalidOperationException("Email is required.");

            email = email.Trim().ToLowerInvariant();

            var now = DateTime.UtcNow;

            var recentCode = await _context.EmailVerificationCodes
                .AnyAsync(c =>
                    c.Email == email &&
                    c.Purpose == Purpose &&
                    c.CreatedAt > now.AddSeconds(-60));

            if (recentCode)
            {
                throw new InvalidOperationException(
                    "Please wait 60 seconds before requesting another OTP.");
            }

            // Invalidate previous unused OTP records
            var previousCodes = await _context.EmailVerificationCodes
                .Where(c =>
                    c.Email == email &&
                    c.Purpose == Purpose &&
                    !c.Used)
                .ToListAsync();

            foreach (var previous in previousCodes)
            {
                previous.Used = true;
            }

            // Generate six-digit OTP
            var otp = RandomNumberGenerator
                .GetInt32(100000, 1000000)
                .ToString();

            var record = new EmailVerificationCode
            {
                Email = email,
                Purpose = Purpose,
                CodeHash = HashCode(email, otp),
                ExpiresAt = now.AddMinutes(5),
                CreatedAt = now,
                FailedAttempts = 0,
                Used = false,

                VerificationTokenHash = null,
                VerificationTokenExpiresAt = null,
                VerificationTokenUsed = true
            };

            _context.EmailVerificationCodes.Add(record);

            await _context.SaveChangesAsync();

            try
            {
                await _emailService.SendEmailVerificationOtpAsync(
                    email,
                    otp);
            }
            catch
            {
                record.Used = true;
                await _context.SaveChangesAsync();
                throw;
            }
        }

        // STEP 2: Verify OTP and generate verification token
        public async Task<string?> VerifyAndCreateTokenAsync(
            string email,
            string code)
        {
            if (string.IsNullOrWhiteSpace(email) ||
                string.IsNullOrWhiteSpace(code))
            {
                return null;
            }

            email = email.Trim().ToLowerInvariant();
            code = code.Trim();

            if (code.Length != 6 ||
                !code.All(char.IsDigit))
            {
                return null;
            }

            var record = await _context.EmailVerificationCodes
                .Where(c =>
                    c.Email == email &&
                    c.Purpose == Purpose &&
                    !c.Used)
                .OrderByDescending(c => c.CreatedAt)
                .FirstOrDefaultAsync();

            var now = DateTime.UtcNow;

            if (record == null ||
                record.ExpiresAt <= now ||
                record.FailedAttempts >= MaxAttempts)
            {
                return null;
            }

            var expectedHash = HashCode(email, code);

            var expectedBytes = Convert.FromHexString(expectedHash);

            var actualBytes = Convert.FromHexString(record.CodeHash);

            // Compare hashes safely
            if (!CryptographicOperations.FixedTimeEquals(
                expectedBytes,
                actualBytes))
            {
                record.FailedAttempts++;

                await _context.SaveChangesAsync();

                return null;
            }

            // OTP is correct. Generate a secure random token.
            var verificationToken = Convert.ToBase64String(
                RandomNumberGenerator.GetBytes(32));

            // Store only the token hash
            record.Used = true;

            record.VerificationTokenHash =
                HashVerificationToken(verificationToken);

            // Token expires after 10 minutes
            record.VerificationTokenExpiresAt =
                now.AddMinutes(10);

            record.VerificationTokenUsed = false;

            await _context.SaveChangesAsync();

            // Return plaintext token to frontend
            return verificationToken;
        }

        // STEP 3: Validate and consume verification token
        public async Task<bool> ConsumeVerificationTokenAsync(
            string email,
            string verificationToken)
        {
            if (string.IsNullOrWhiteSpace(email) ||
                string.IsNullOrWhiteSpace(verificationToken))
            {
                return false;
            }

            email = email.Trim().ToLowerInvariant();

            var tokenHash =
                HashVerificationToken(verificationToken);

            var now = DateTime.UtcNow;

            // Atomically mark the token as used.
            // Only one request can successfully consume it.
            var affectedRows = await _context.EmailVerificationCodes
                .Where(c =>
                    c.Email == email &&
                    c.Purpose == Purpose &&
                    c.VerificationTokenHash == tokenHash &&
                    c.VerificationTokenUsed == false &&
                    c.VerificationTokenExpiresAt > now)
                .ExecuteUpdateAsync(setters => setters
                    .SetProperty(
                        c => c.VerificationTokenUsed,
                        true));

            return affectedRows == 1;
        }
    }
}
