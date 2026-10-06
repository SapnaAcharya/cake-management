using System.Security.Cryptography;
using System.Text;
using CakeManagementAPI.Data;
using CakeManagementAPI.DTOs.PhoneVerification;
using CakeManagementAPI.Models;
using CakeManagementAPI.Services.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace CakeManagementAPI.Services
{
    public class PhoneVerificationService
        : IPhoneVerificationService
    {
        private readonly AppDbContext _context;

        public PhoneVerificationService(
            AppDbContext context)
        {
            _context = context;
        }

        // SEND OTP
        public async Task SendOtpAsync(
            SendOtpDto dto)
        {
            var phoneNumber = dto.PhoneNumber.Trim();

            if (string.IsNullOrWhiteSpace(phoneNumber))
            {
                throw new ArgumentException(
                    "Phone number is required.");
            }

            // Generate 6-digit OTP
            var otp = RandomNumberGenerator
                .GetInt32(100000, 1000000)
                .ToString();

            // Hash OTP before storing
            var otpHash = HashOtp(otp);

            // Expire after 5 minutes
            var expiresAt =
                DateTime.UtcNow.AddMinutes(5);

            // Remove previous verification records
            var existingRecords =
                await _context.PhoneVerifications
                    .Where(v =>
                        v.PhoneNumber == phoneNumber &&
                        !v.IsVerified)
                    .ToListAsync();

            _context.PhoneVerifications
                .RemoveRange(existingRecords);

            // Create new verification
            var verification = new PhoneVerification
            {
                PhoneNumber = phoneNumber,
                OtpHash = otpHash,
                ExpiresAt = expiresAt,
                IsVerified = false,
                Attempts = 0,
                CreatedAt = DateTime.UtcNow
            };

            _context.PhoneVerifications
                .Add(verification);

            await _context.SaveChangesAsync();

            // DEVELOPMENT ONLY
            Console.WriteLine(
                $"OTP for {phoneNumber}: {otp}");
        }

        // VERIFY OTP
        public async Task VerifyOtpAsync(
            VerifyOtpDto dto)
        {
            var phoneNumber =
                dto.PhoneNumber.Trim();

            var otp =
                dto.Otp.Trim();

            var verification =
                await _context.PhoneVerifications
                    .Where(v =>
                        v.PhoneNumber == phoneNumber &&
                        !v.IsVerified)
                    .OrderByDescending(v => v.CreatedAt)
                    .FirstOrDefaultAsync();

            if (verification == null)
            {
                throw new InvalidOperationException(
                    "No OTP verification request found.");
            }

            // Check expiration
            if (verification.ExpiresAt < DateTime.UtcNow)
            {
                throw new InvalidOperationException(
                    "OTP has expired. Please request a new OTP.");
            }

            // Check attempts
            if (verification.Attempts >= 5)
            {
                throw new InvalidOperationException(
                    "Too many incorrect attempts. Please request a new OTP.");
            }

            var otpHash = HashOtp(otp);

            if (otpHash != verification.OtpHash)
            {
                verification.Attempts++;

                await _context.SaveChangesAsync();

                throw new InvalidOperationException(
                    "Invalid OTP.");
            }

            // OTP is correct
            verification.IsVerified = true;

            await _context.SaveChangesAsync();
        }

        // HASH OTP
        private string HashOtp(string otp)
        {
            using var sha256 =
                SHA256.Create();

            var bytes =
                Encoding.UTF8.GetBytes(otp);

            var hash =
                sha256.ComputeHash(bytes);

            return Convert.ToHexString(hash);
        }
    }
}