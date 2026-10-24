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
        public async Task<LoginResponseDto> RegisterAsync(
            RegisterDto dto)
        {
            var email = dto.Email.Trim().ToLowerInvariant();

            // Check if email already exists
            var existingUser = await _context.Users
                .FirstOrDefaultAsync(u => u.Email == email);

            if (existingUser != null)
            {
                throw new InvalidOperationException(
                    "A user with this email already exists.");
            }

            // Create new user
            var user = new User
            {
                Name = dto.Name.Trim(),
                Email = email,
                Phone = dto.Phone,
                Address = dto.Address,
                Role = "Customer",
                CreatedAt = DateTime.UtcNow
            };

            // Hash password
            user.PasswordHash =
                _passwordHasher.HashPassword(
                    user,
                    dto.Password);

            _context.Users.Add(user);

            await _context.SaveChangesAsync();

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

            // Verify password
            var passwordResult =
                _passwordHasher.VerifyHashedPassword(
                    user,
                    user.PasswordHash,
                    dto.Password);

            if (passwordResult ==
                PasswordVerificationResult.Failed)
            {
                throw new UnauthorizedAccessException(
                    "Invalid email or password.");
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