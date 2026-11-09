using System.Text.RegularExpressions;

namespace CakeManagementAPI.Helpers
{
    public static class SlugHelper
    {
        public static string Generate(string name, string fallback = "item")
        {
            var slug = Regex.Replace(
                (name ?? string.Empty).Trim().ToLowerInvariant(),
                @"[^a-z0-9]+",
                "-"
            ).Trim('-');

            return string.IsNullOrWhiteSpace(slug) ? fallback : slug;
        }
    }
}