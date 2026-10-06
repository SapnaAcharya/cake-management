using CakeManagementAPI.Data;
using CakeManagementAPI.DTOs.Cart;
using CakeManagementAPI.Models;
using Microsoft.EntityFrameworkCore;

namespace CakeManagementAPI.Services
{
    public class CakePricingService
    {
        private readonly AppDbContext _context;

        public CakePricingService(AppDbContext context)
        {
            _context = context;
        }

        private static readonly (int Value, decimal Extra)[] Sizes =
        {
            (6, 0m), (8, 350m), (10, 800m), (12, 1400m)
        };

        private const decimal ExtraTierPrice = 900m;

        private static readonly Dictionary<string, decimal> FlavorExtra = new()
        {
            ["vanilla"] = 0m,
            ["chocolate"] = 0m,
            ["red-velvet"] = 150m,
            ["strawberry"] = 100m,
        };

        private static readonly Dictionary<string, decimal> FrostingExtra = new()
        {
            ["buttercream"] = 0m,
            ["whipped-cream"] = 0m,
            ["fondant"] = 300m,
            ["ganache"] = 200m,
        };

        private const decimal CandlePrice = 2m;

        // Core calculation (one place for all the rules)
        public decimal CalculatePrice(
            CakeTemplate? template,
            int size,
            int tiers,
            string? sponge,
            string? frosting,
            int candles,
            IEnumerable<int> decorationIds,
            List<Decoration> decorations)
        {
            decimal total = template?.BasePrice ?? 0m;

            total += Sizes.FirstOrDefault(s => s.Value == size).Extra;

            var templateTiers = template?.Tiers ?? 1;
            total += Math.Max(0, tiers - templateTiers) * ExtraTierPrice;

            if (sponge != null && FlavorExtra.TryGetValue(sponge, out var f))
                total += f;

            if (frosting != null && FrostingExtra.TryGetValue(frosting, out var fr))
                total += fr;

            var chosen = decorationIds.ToHashSet();
            total += decorations.Where(d => chosen.Contains(d.Id)).Sum(d => d.Price);

            total += candles * CandlePrice;

            return total;
        }

        //  used by the cart, checkout and the preview endpoint
        public async Task<decimal> CalculateAsync(CustomizationDto dto)
        {
            var template = await _context.CakeTemplates.FindAsync(dto.TemplateId);

            if (template == null)
                throw new ArgumentException($"Cake template {dto.TemplateId} was not found.");

            var ids = dto.Decorations.Select(d => d.DecorationId).ToList();

            var decorations = ids.Count == 0
                ? new List<Decoration>()
                : await _context.Decorations.Where(d => ids.Contains(d.Id)).ToListAsync();

            return CalculatePrice(
                template,
                dto.Size ?? 6,          // no size chosen = smallest size, no extra charge
                dto.Tiers, dto.Sponge, dto.Frosting,
                dto.Candles, ids, decorations);
        }
    }
}