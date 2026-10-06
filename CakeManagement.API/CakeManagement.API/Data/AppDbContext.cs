using CakeManagementAPI.Models;
using Microsoft.EntityFrameworkCore;
using CakeManagementAPI.Data;
using CakeManagementAPI.DTOs.Cart;

namespace CakeManagementAPI.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(
            DbContextOptions<AppDbContext> options)
            : base(options)
        {
        }
        public DbSet<User> Users { get; set; }

        public DbSet<Category> Categories { get; set; }

        public DbSet<Cake> Cakes { get; set; }

        public DbSet<Cart> Carts { get; set; }

        public DbSet<CartItem> CartItems { get; set; }

        public DbSet<Order> Orders { get; set; }

        public DbSet<OrderItem> OrderItems { get; set; }
        public DbSet<PhoneVerification> PhoneVerifications { get; set; }
       
        public DbSet<Decoration> Decorations { get; set; }

        public DbSet<CakeTemplate> CakeTemplates { get; set; }

        public DbSet<CakeTemplateImage> CakeTemplateImages { get; set; }

        public DbSet<CakeTemplateSize> CakeTemplateSizes { get; set; }

        public DbSet<CakeTemplateColor> CakeTemplateColors { get; set; }

        public DbSet<CakeTemplateFeature> CakeTemplateFeatures { get; set; }
        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // Category -> Cake
            modelBuilder.Entity<Cake>()
                .HasOne(c => c.Category)
                .WithMany(c => c.Cakes)
                .HasForeignKey(c => c.CategoryId)
                .OnDelete(DeleteBehavior.Restrict);

            // User -> Cart (One-to-One)
            modelBuilder.Entity<Cart>()
                .HasOne(c => c.User)
                .WithOne(u => u.Cart)
                .HasForeignKey<Cart>(c => c.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            // Cart -> CartItems (One-to-many)
            modelBuilder.Entity<CartItem>()
                .HasOne(ci => ci.Cart)
                .WithMany(c => c.CartItems)
                .HasForeignKey(ci => ci.CartId)
                .OnDelete(DeleteBehavior.Cascade);

            // Cake -> CartItems (foreign-key-relationship)
            modelBuilder.Entity<CartItem>()
                .HasOne(ci => ci.Cake)
                .WithMany(c => c.CartItems)
                .HasForeignKey(ci => ci.CakeId)
                .OnDelete(DeleteBehavior.Restrict);

            // User -> Orders
            modelBuilder.Entity<Order>()
                .HasOne(o => o.User)
                .WithMany(u => u.Orders)
                .HasForeignKey(o => o.UserId)
                .OnDelete(DeleteBehavior.Restrict);

            // Order -> OrderItems
            modelBuilder.Entity<OrderItem>()
                .HasOne(oi => oi.Order)
                .WithMany(o => o.OrderItems)
                .HasForeignKey(oi => oi.OrderId)
                .OnDelete(DeleteBehavior.Cascade);

            // Cake -> OrderItems
            modelBuilder.Entity<OrderItem>()
                .HasOne(oi => oi.Cake)
                .WithMany(c => c.OrderItems)
                .HasForeignKey(oi => oi.CakeId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<CakeTemplate>()
               .HasMany(t => t.Images)
               .WithOne(i => i.CakeTemplate)
               .HasForeignKey(i => i.CakeTemplateId)
               .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<CakeTemplate>()
                .HasMany(t => t.Sizes)
                .WithOne(s => s.CakeTemplate)
                .HasForeignKey(s => s.CakeTemplateId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<CakeTemplate>()
                .HasMany(t => t.Colors)
                .WithOne(c => c.CakeTemplate)
                .HasForeignKey(c => c.CakeTemplateId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<CakeTemplate>()
                .HasMany(t => t.Features)
                .WithOne(f => f.CakeTemplate)
                .HasForeignKey(f => f.CakeTemplateId)
                .OnDelete(DeleteBehavior.Cascade);

            // CartItem -> CakeTemplate (optional, only for customized cakes)
            modelBuilder.Entity<CartItem>()
                .HasOne(ci => ci.CakeTemplate)
                .WithMany()
                .HasForeignKey(ci => ci.CakeTemplateId)
                .OnDelete(DeleteBehavior.SetNull);

            // OrderItem -> CakeTemplate (optional, only for customized cakes)
            modelBuilder.Entity<OrderItem>()
                .HasOne(oi => oi.CakeTemplate)
                .WithMany()
                .HasForeignKey(oi => oi.CakeTemplateId)
                .OnDelete(DeleteBehavior.SetNull);

            // Decimal precision
            modelBuilder.Entity<Cake>()
                .Property(c => c.Price)
                .HasPrecision(18, 2);

            modelBuilder.Entity<Order>()
                .Property(o => o.TotalAmount)
                .HasPrecision(18, 2);

            modelBuilder.Entity<OrderItem>()
                .Property(oi => oi.UnitPrice)
                .HasPrecision(18, 2);

            modelBuilder.Entity<OrderItem>()
                .Property(oi => oi.Subtotal)
                .HasPrecision(18, 2);

            modelBuilder.Entity<CakeTemplate>()
                .Property(c => c.BasePrice)
                .HasPrecision(10, 2);

            // Unique email
            modelBuilder.Entity<User>()
                .HasIndex(u => u.Email)
                .IsUnique();

            // One cart per user
            modelBuilder.Entity<Cart>()
                .HasIndex(c => c.UserId)
                .IsUnique();

            // Cake template unique
            modelBuilder.Entity<CakeTemplate>()
                .HasIndex(t => t.Name)
                .IsUnique();

            // decoration unique
            modelBuilder.Entity<Decoration>()
                .HasIndex(d => d.Name)
                .IsUnique();

            modelBuilder.Entity<CartItem>()
                 .Property(ci => ci.CustomUnitPrice)
                 .HasPrecision(18, 2);

            modelBuilder.Entity<Decoration>(entity =>
            {
                entity.Property(e => e.Price).HasPrecision(18, 2);
            });
        }
    }
}