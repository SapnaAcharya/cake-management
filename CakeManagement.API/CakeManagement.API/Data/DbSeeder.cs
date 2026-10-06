using CakeManagementAPI.Models;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace CakeManagementAPI.Data
{
    public static class DbSeeder
    {
        public static async Task SeedAdminAsync(
            AppDbContext context,
            IConfiguration configuration)
        {
            // Check whether an admin already exists
            var adminExists = await context.Users
                .AnyAsync(u => u.Role == "Admin");

            if (adminExists)
            {
                return;
            }

            // Create admin user
             var admin = new User
            {
                Name = "Admin",
                Email = configuration["Admin:Email"]!,
                Role = "Admin",
                Phone = configuration["Admin:Phone"],
                Address = configuration["Admin:Address"],
                CreatedAt = DateTime.UtcNow
            };

            //Hash admin password
            var passwordHasher = new PasswordHasher<User>();

            admin.PasswordHash = passwordHasher.HashPassword(
                admin, configuration["Admin:Password"]!);

            // Add admin to database
            context.Users.Add(admin);

            await context.SaveChangesAsync();
        }
    }
}
