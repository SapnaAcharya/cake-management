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
using System.Text;

namespace CakeManagementAPI.Services
{
    public class AuthService : IAuthService
    {
        private readonly AppDbContext _context;
        private readonly IConfiguration _configuration;
        private readonly PasswordHasher<User> _passwordHasher;

        public AuthService(
            AppDbContext context,
            IConfiguration configuration)
        {
            _context = context;
            _configuration = configuration;
            _passwordHasher = new PasswordHasher<User>();
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