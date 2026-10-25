using CakeManagement.DTOs.Auth;
using CakeManagementAPI.Data;
using CakeManagementAPI.DTOs.Auth;
using CakeManagementAPI.Models;
using CakeManagementAPI.Services.Interfaces;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using Microsoft.AspNetCore.Hosting;
using Google.Apis.Auth;
using System.Text;

namespace CakeManagementAPI.Services
{
    public class AuthService : IAuthService
    {
        private readonly AppDbContext _context;
        private readonly IConfiguration _configuration;
        private readonly PasswordHasher<User> _passwordHasher;

        private readonly IPasswordResetEmailService _passwordResetEmailService;

        private readonly IWebHostEnvironment _environment;
        public AuthService(
            AppDbContext context,
            IConfiguration configuration,
            IPasswordResetEmailService passwordResetEmailService,
            IWebHostEnvironment environment)
        {
            _context = context;
            _configuration = configuration;
            _passwordResetEmailService = passwordResetEmailService;
            _passwordHasher = new PasswordHasher<User>();
            _environment = environment;
        }

       
        // REGISTER
        public async Task RegisterAsync(RegisterDto dto)
        {
            var email = dto.Email.Trim().ToLowerInvariant();

            // Check whether the email already exists.
            var existingUser = await _context.Users
                .FirstOrDefaultAsync(u => u.Email == email);

            if (existingUser != null)
            {
                throw new InvalidOperationException(
                    "A user with this email already exists.");
            }

            // Create a new, unverified customer account.
            var user = new User
            {
                Name = dto.Name.Trim(),
                Email = email,
                Phone = dto.Phone,
                Address = dto.Address,
                Role = "Customer",
                IsEmailVerified = false,
                CreatedAt = DateTime.UtcNow
            };

            user.PasswordHash = _passwordHasher.HashPassword(
                user,
                dto.Password);

            _context.Users.Add(user);

            // Save the user first so the OTP can reference its ID.
            await _context.SaveChangesAsync();

            // Generate and send the initial verification code.
            await ResendEmailOtpAsync(
                new ResendEmailOtpDto { Email = email });
        }


        // LOGIN
        public async Task<LoginResponseDto> LoginAsync(
            LoginDto dto)
        {
            var email = dto.Email.Trim().ToLowerInvariant();

            // Find user
            var user = await _context.Users
                .FirstOrDefaultAsync(u => u.Email == email);

            if (user == null)
            {
                throw new UnauthorizedAccessException(
                    "Invalid email or password.");
            }

            // Verify password only if this account has a password.
            if (string.IsNullOrWhiteSpace(user.PasswordHash))
            {
                throw new UnauthorizedAccessException(
                    "Invalid email or password.");
            }

            var passwordResult =
                _passwordHasher.VerifyHashedPassword(
                    user,
                    user.PasswordHash,
                    dto.Password);

            if (passwordResult == PasswordVerificationResult.Failed)
            {
                throw new UnauthorizedAccessException(
                    "Invalid email or password.");
            }

            if (!user.IsEmailVerified)
            {
                throw new UnauthorizedAccessException(
                    "Please verify your email address before signing in.");
            }

            // Generate JWT token
            var token = GenerateToken(user);

            return new LoginResponseDto
            {
                Token = token,
                UserId = user.Id,
                Name = user.Name,
                Email = user.Email,
                Role = user.Role
            };
        }

        // Google Signin
        public async Task<LoginResponseDto> GoogleLoginAsync(
            GoogleLoginDto dto)
        {
            var clientId = _configuration["GoogleAuth:ClientId"];

            if (string.IsNullOrWhiteSpace(clientId))
            {
                throw new InvalidOperationException(
                    "Google authentication is not configured.");
            }

            GoogleJsonWebSignature.Payload payload;

            try
            {
                payload = await GoogleJsonWebSignature.ValidateAsync(
                    dto.IdToken,
                    new GoogleJsonWebSignature.ValidationSettings
                    {
                        Audience = new[] { clientId }
                    });
            }
            catch (InvalidJwtException)
            {
                throw new UnauthorizedAccessException(
                    "Invalid Google sign-in token.");
            }

            if (string.IsNullOrWhiteSpace(payload.Subject) ||
                string.IsNullOrWhiteSpace(payload.Email) ||
                payload.EmailVerified != true)
            {
                throw new UnauthorizedAccessException(
                    "Google sign-in requires a verified email address.");
            }

            var email = payload.Email.Trim().ToLowerInvariant();

            // Find an account already linked to this Google identity.
            var user = await _context.Users
                .FirstOrDefaultAsync(u =>
                    u.GoogleSubject == payload.Subject);

            if (user == null)
{
    var existingUser = await _context.Users
        .FirstOrDefaultAsync(u => u.Email == email);

    if (existingUser != null)
    {
        // Never overwrite a different Google identity.
        if (!string.IsNullOrEmpty(existingUser.GoogleSubject) &&
            existingUser.GoogleSubject != payload.Subject)
        {
            throw new InvalidOperationException(
                "This email is already linked to a different Google account.");
        }

        // If the account was never verified, someone else may have set
        // its password, so remove it. Google has proven who owns the email.
        if (!existingUser.IsEmailVerified)
        {
            existingUser.IsEmailVerified = true;
            existingUser.PasswordHash = string.Empty;
        }

        existingUser.GoogleSubject = payload.Subject;
        await _context.SaveChangesAsync();

        user = existingUser;
    }
    else
    {
        user = new User
        {
            Name = string.IsNullOrWhiteSpace(payload.Name)
                ? email.Split('@')[0]
                : payload.Name.Trim(),
            Email = email,
            PasswordHash = string.Empty,
            GoogleSubject = payload.Subject,
            Role = "Customer",
            IsEmailVerified = true,
            CreatedAt = DateTime.UtcNow
        };

        _context.Users.Add(user);
        await _context.SaveChangesAsync();
    }
}

            // Use the same JWT format as normal login.
            var token = GenerateToken(user);

            return new LoginResponseDto
            {
                Token = token,
                UserId = user.Id,
                Name = user.Name,
                Email = user.Email,
                Role = user.Role
            };
        }


        public async Task LinkGoogleAccountAsync(
            int userId,
            GoogleLoginDto dto)
        {
            if (string.IsNullOrWhiteSpace(dto.IdToken))
            {
                throw new InvalidOperationException(
                    "A Google ID token is required.");
            }

            var clientId = _configuration["GoogleAuth:ClientId"];

            if (string.IsNullOrWhiteSpace(clientId))
            {
                throw new InvalidOperationException(
                    "Google authentication is not configured.");
            }

            GoogleJsonWebSignature.Payload payload;

            try
            {
                payload = await GoogleJsonWebSignature.ValidateAsync(
                    dto.IdToken,
                    new GoogleJsonWebSignature.ValidationSettings
                    {
                        Audience = new[] { clientId }
                    });
            }
            catch (InvalidJwtException)
            {
                throw new UnauthorizedAccessException(
                    "Invalid Google sign-in token.");
            }

            if (string.IsNullOrWhiteSpace(payload.Subject) ||
                string.IsNullOrWhiteSpace(payload.Email) ||
                payload.EmailVerified != true)
            {
                throw new UnauthorizedAccessException(
                    "A valid Google account with a verified email is required.");
            }

            // Find the currently signed-in SweetCakes customer.
            var user = await _context.Users
                .FirstOrDefaultAsync(u => u.Id == userId);

            if (user == null || user.Role != "Customer")
            {
                throw new UnauthorizedAccessException(
                    "The customer account could not be found.");
            }

            if (!user.IsEmailVerified)
            {
                throw new InvalidOperationException(
                    "Verify your SweetCakes email before linking Google.");
            }

            // Reject a Google identity already linked to another user.
            var googleIdentityOwner = await _context.Users
                .FirstOrDefaultAsync(u =>
                    u.GoogleSubject == payload.Subject);

            if (googleIdentityOwner != null &&
                googleIdentityOwner.Id != user.Id)
            {
                throw new InvalidOperationException(
                    "This Google account is already linked to another SweetCakes account.");
            }

            // Do not allow an existing Google link to be silently replaced.
            if (!string.IsNullOrWhiteSpace(user.GoogleSubject) &&
                user.GoogleSubject != payload.Subject)
            {
                throw new InvalidOperationException(
                    "A different Google account is already linked.");
            }

            // Require the Google email to match the signed-in account.
            // This basic version deliberately avoids cross-email linking.
            if (!string.Equals(
                user.Email.Trim(),
                payload.Email.Trim(),
                StringComparison.OrdinalIgnoreCase))
            {
                throw new InvalidOperationException(
                    "Your Google email must match your SweetCakes account email.");
            }

            if (string.IsNullOrWhiteSpace(user.GoogleSubject))
            {
                user.GoogleSubject = payload.Subject;
                await _context.SaveChangesAsync();
            }
        }


        // FORGOT PASSWORD
        public async Task ForgotPasswordAsync(
            ForgotPasswordDto dto)
        {
            var email = dto.Email.Trim().ToLowerInvariant();

            var user = await _context.Users
                .FirstOrDefaultAsync(u => u.Email == email);

            // Do not reveal whether the email is registered.
            if (user == null)
            {
                return;
            }

            var now = DateTime.UtcNow;
            var rawToken = GeneratePasswordResetToken();
            var tokenHash = HashPasswordResetToken(rawToken);

            // Invalidate older, unused reset tokens.
            var previousTokens = await _context.PasswordResetTokens
                .Where(t =>
                    t.UserId == user.Id &&
                    t.UsedAtUtc == null)
                .ToListAsync();

            foreach (var previousToken in previousTokens)
            {
                previousToken.UsedAtUtc = now;
            }

            var resetToken = new PasswordResetToken
            {
                UserId = user.Id,
                TokenHash = tokenHash,
                CreatedAtUtc = now,
                ExpiresAtUtc = now.AddMinutes(30)
            };

            _context.PasswordResetTokens.Add(resetToken);

            // Save the token before sending the email.
            await _context.SaveChangesAsync();

            var frontendBaseUrl = _configuration["Frontend:BaseUrl"];

if (string.IsNullOrWhiteSpace(frontendBaseUrl) ||
    !Uri.TryCreate(
        frontendBaseUrl,
        UriKind.Absolute,
        out var frontendUri))
{
    throw new InvalidOperationException(
        "Frontend:BaseUrl must be a valid absolute URL.");
}

if (frontendUri.Scheme != Uri.UriSchemeHttp &&
    frontendUri.Scheme != Uri.UriSchemeHttps)
{
    throw new InvalidOperationException(
        "Frontend:BaseUrl must use HTTP or HTTPS.");
}

if (!string.IsNullOrEmpty(frontendUri.UserInfo) ||
    !string.IsNullOrEmpty(frontendUri.Query) ||
    !string.IsNullOrEmpty(frontendUri.Fragment) ||
    frontendUri.AbsolutePath != "/")
{
    throw new InvalidOperationException(
        "Frontend:BaseUrl must contain only the scheme and hostname.");
}

if (_environment.IsProduction() &&
    frontendUri.Scheme != Uri.UriSchemeHttps)
{
    throw new InvalidOperationException(
        "Frontend:BaseUrl must use HTTPS in production.");
}

var allowedHosts = _configuration
    .GetSection("Frontend:AllowedHosts")
    .Get<string[]>() ?? Array.Empty<string>();

if (!allowedHosts.Contains(
        frontendUri.Host,
        StringComparer.OrdinalIgnoreCase))
{
    throw new InvalidOperationException(
        "Frontend:BaseUrl hostname is not trusted.");
}

var frontendBaseUrlValidated =
    frontendUri.GetLeftPart(UriPartial.Authority);

            var resetUrl =
                $"{frontendBaseUrlValidated}/reset-password" +
                $"?email={Uri.EscapeDataString(user.Email)}" +
                $"&token={Uri.EscapeDataString(rawToken)}";

            await _passwordResetEmailService
                .SendPasswordResetEmailAsync(
                    user.Email,
                    resetUrl);
        }

        // RESET PASSWORD
        public async Task ResetPasswordAsync(
            ResetPasswordDto dto)
        {
            var email = dto.Email.Trim().ToLowerInvariant();
            var tokenHash = HashPasswordResetToken(dto.Token);
            var now = DateTime.UtcNow;

            var user = await _context.Users
                .FirstOrDefaultAsync(u => u.Email == email);

            if (user == null)
            {
                throw new InvalidOperationException(
                    "The reset link is invalid or has expired.");
            }

            var resetToken = await _context.PasswordResetTokens
                .FirstOrDefaultAsync(t =>
                    t.UserId == user.Id &&
                    t.TokenHash == tokenHash &&
                    t.UsedAtUtc == null &&
                    t.ExpiresAtUtc > now);

            if (resetToken == null)
            {
                throw new InvalidOperationException(
                    "The reset link is invalid or has expired.");
            }

            user.PasswordHash = _passwordHasher.HashPassword(
                user,
                dto.NewPassword);

            // Make this reset token unusable after the password changes.
            resetToken.UsedAtUtc = now;

            await _context.SaveChangesAsync();
        }


        // GENERATE A SIX-DIGIT EMAIL VERIFICATION OTP
        private static string GenerateEmailOtp()
        {
            return RandomNumberGenerator
                .GetInt32(0, 1_000_000)
                .ToString("D6");
        }

        // HASH OTP BEFORE STORING IT
        private static string HashEmailOtp(string otp)
        {
            var hash = SHA256.HashData(
                Encoding.UTF8.GetBytes(otp));

            return Convert.ToHexString(hash).ToLowerInvariant();
        }

        // SEND OR RESEND EMAIL VERIFICATION OTP
        public async Task ResendEmailOtpAsync(
            ResendEmailOtpDto dto)
        {
            var email = dto.Email.Trim().ToLowerInvariant();

            var user = await _context.Users
                .FirstOrDefaultAsync(u => u.Email == email);

            // Do not reveal whether an email is registered.
            if (user == null || user.IsEmailVerified)
            {
                return;
            }

            var now = DateTime.UtcNow;

            var previousOtps = await _context.EmailVerificationOtps
                .Where(o => o.UserId == user.Id && o.UsedAtUtc == null)
                .OrderByDescending(o => o.CreatedAtUtc)
                .ToListAsync();

            // Enforce a 60-second resend cooldown.
            if (previousOtps.Any() &&
                previousOtps[0].CreatedAtUtc > now.AddSeconds(-60))
            {
                throw new InvalidOperationException(
                    "Please wait 60 seconds before requesting another code.");
            }

            // Invalidate any previous unused codes.
            foreach (var previousOtp in previousOtps)
            {
                previousOtp.UsedAtUtc = now;
            }

            var otp = GenerateEmailOtp();

            var verificationOtp = new EmailVerificationOtp
            {
                UserId = user.Id,
                OtpHash = HashEmailOtp(otp),
                CreatedAtUtc = now,
                ExpiresAtUtc = now.AddMinutes(5),
                FailedAttempts = 0
            };

            _context.EmailVerificationOtps.Add(verificationOtp);

            await _context.SaveChangesAsync();

            await _passwordResetEmailService
                .SendEmailVerificationOtpAsync(user.Email, otp);
        }

        // VERIFY EMAIL OTP
        public async Task VerifyEmailOtpAsync(
            VerifyEmailOtpDto dto)
        {
            var email = dto.Email.Trim().ToLowerInvariant();
            var now = DateTime.UtcNow;

            var user = await _context.Users
                .FirstOrDefaultAsync(u => u.Email == email);

            if (user == null)
            {
                throw new InvalidOperationException(
                    "The verification code is invalid or has expired.");
            }

            if (user.IsEmailVerified)
            {
                return;
            }

            var otpRecord = await _context.EmailVerificationOtps
                .Where(o =>
                    o.UserId == user.Id &&
                    o.UsedAtUtc == null &&
                    o.ExpiresAtUtc > now)
                .OrderByDescending(o => o.CreatedAtUtc)
                .FirstOrDefaultAsync();

            if (otpRecord == null)
            {
                throw new InvalidOperationException(
                    "The verification code is invalid or has expired.");
            }

            if (otpRecord.FailedAttempts >= 5)
            {
                otpRecord.UsedAtUtc = now;
                await _context.SaveChangesAsync();

                throw new InvalidOperationException(
                    "Too many incorrect attempts. Request a new code.");
            }

            var submittedHash = HashEmailOtp(dto.Otp);

            var expectedBytes = Convert.FromHexString(otpRecord.OtpHash);
            var submittedBytes = Convert.FromHexString(submittedHash);

            if (!CryptographicOperations.FixedTimeEquals(
                    expectedBytes, submittedBytes))
            {
                otpRecord.FailedAttempts++;

                if (otpRecord.FailedAttempts >= 5)
                {
                    otpRecord.UsedAtUtc = now;
                }

                await _context.SaveChangesAsync();

                throw new InvalidOperationException(
                    otpRecord.FailedAttempts >= 5
                        ? "Too many incorrect attempts. Request a new code."
                        : "The verification code is invalid or has expired.");
            }

            // Mark the code as used and verify the email.
            otpRecord.UsedAtUtc = now;
            user.IsEmailVerified = true;

            // Invalidate any other unused verification codes.
            var otherOtps = await _context.EmailVerificationOtps
                .Where(o =>
                    o.UserId == user.Id &&
                    o.Id != otpRecord.Id &&
                    o.UsedAtUtc == null)
                .ToListAsync();

            foreach (var otherOtp in otherOtps)
            {
                otherOtp.UsedAtUtc = now;
            }

            await _context.SaveChangesAsync();
        }

        // GENERATE A CRYPTOGRAPHICALLY SECURE RESET TOKEN
        private static string GeneratePasswordResetToken()
        {
            var randomBytes = RandomNumberGenerator.GetBytes(32);

            return Convert.ToBase64String(randomBytes)
                .TrimEnd('=')
                .Replace('+', '-')
                .Replace('/', '_');
        }

        // HASH RESET TOKEN BEFORE STORING OR LOOKING IT UP
        private static string HashPasswordResetToken(string token)
        {
            var hash = SHA256.HashData(
                Encoding.UTF8.GetBytes(token));

            return Convert.ToHexString(hash).ToLowerInvariant();
        }

        // GENERATE JWT TOKEN
        private string GenerateToken(User user)
        {
            var jwtKey = _configuration["Jwt:Key"];

            if (string.IsNullOrWhiteSpace(jwtKey))
            {
                throw new InvalidOperationException(
                    "JWT key is not configured.");
            }

            var claims = new List<Claim>
            {
                new Claim(
                    ClaimTypes.NameIdentifier,
                    user.Id.ToString()),

                new Claim(
                    ClaimTypes.Name,
                    user.Name),

                new Claim(
                    ClaimTypes.Email,
                    user.Email),

                new Claim(
                    ClaimTypes.Role,
                    user.Role)
            };

            var key = new SymmetricSecurityKey(
                Encoding.UTF8.GetBytes(jwtKey));

            var credentials =
                new SigningCredentials(
                    key,
                    SecurityAlgorithms.HmacSha256);

            var expirationMinutes =
                _configuration.GetValue<int>(
                    "Jwt:ExpiresInMinutes");

            var token = new JwtSecurityToken(
                issuer: _configuration["Jwt:Issuer"],
                audience: _configuration["Jwt:Audience"],
                claims: claims,
                expires: DateTime.UtcNow.AddMinutes(
                    expirationMinutes),
                signingCredentials: credentials);

            return new JwtSecurityTokenHandler()
                .WriteToken(token);
        }
    }
}