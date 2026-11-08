//using System.Text.RegularExpressions;

//namespace CakeManagementAPI.Helpers
//{
//    public static class SlugHelper
//    {
//        public static string Generate(string name)
//        {
//            if (string.IsNullOrWhiteSpace(name))
//                return string.Empty;

//            var slug = name.ToLowerInvariant().Trim();
//            slug = Regex.Replace(slug, @"[^a-z0-9\s-]", "");
//            slug = Regex.Replace(slug, @"[\s-]+", "-");
//            return slug.Trim('-');
//        }
//    }
//}

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