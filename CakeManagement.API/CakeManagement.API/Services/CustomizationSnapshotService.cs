using CakeManagementAPI.Data;
using CakeManagementAPI.DTOs.Cart;
using CakeManagementAPI.Models;
using Microsoft.EntityFrameworkCore;
using System.Drawing;
using System.Text.Json;

namespace CakeManagementAPI.Services
{
    public class CustomizationSnapshotService : ICustomizationSnapshotService
    {
        private readonly AppDbContext _context;

        public CustomizationSnapshotService(
            AppDbContext context)
        {
            _context = context;
        }

        public async Task<CustomizationSnapshot>
            CreateSnapshotAsync(CustomizationDto dto)
        {
            var template =
                await _context.CakeTemplates
                    .FindAsync(dto.TemplateId);

            if (template == null)
                throw new ArgumentException($"Cake template {dto.TemplateId} was not found.");

            var color = dto.ColorId == null
                ? null
                : await _context.CakeTemplateColors
                  .FirstOrDefaultAsync(c => c.Id == dto.ColorId);

            var decorationIds = dto.Decorations
              .Select(d => d.DecorationId)
              .ToList();

            var decorations = await _context.Decorations
                .Where(d => decorationIds.Contains(d.Id))
                .ToListAsync();

            var snapshot =
    new CustomizationSnapshot
    {
        CakeId = dto.CakeId,
        TemplateId = template.Id,
        TemplateName = template.Name,

        Size = dto.Size,
        Tiers = dto.Tiers,

        ColorId = dto.ColorId,
        ColorName = color?.ColorName,
        ColorHex = color?.ColorHex,

        Message = dto.Message,
        Font = dto.Font,

        Sponge = dto.Sponge,
        Frosting = dto.Frosting,

        Candles = dto.Candles,
        Lit = dto.Lit,

        Decorations = dto.Decorations
            .Select(d =>
            {
                var decoration = decorations
                    .FirstOrDefault(x =>
                        x.Id == d.DecorationId);

                return new SnapshotDecoration
                {
                    DecorationId = d.DecorationId,
                    Name = decoration?.Name ?? string.Empty,
                    Quantity = d.Quantity,
                    Price = decoration?.Price ?? 0
                };
            })
            .ToList()
    };

            return snapshot;
        }

            public string ToJson(CustomizationSnapshot snapshot)
            {
            return JsonSerializer.Serialize(snapshot);
            }
    }
}