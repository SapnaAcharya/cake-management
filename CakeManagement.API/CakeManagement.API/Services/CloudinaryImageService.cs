using CloudinaryDotNet;
using CloudinaryDotNet.Actions;
using Microsoft.Extensions.Options;
using Microsoft.AspNetCore.Http;

namespace CakeManagementAPI.Services
{
    public class CloudinarySettings
    {
        public string CloudName { get; set; } = "";
        public string ApiKey { get; set; } = "";
        public string ApiSecret { get; set; } = "";
    }

    public interface IImageService
    {
        Task<string> UploadAsync(IFormFile file, string folder);
        Task<string> UploadProfilePhotoAsync(IFormFile file, int userId);
        Task DeleteProfilePhotoAsync(int userId);
    }

    public class CloudinaryImageService : IImageService
    {
        private readonly Cloudinary _cloudinary;

        public CloudinaryImageService(IOptions<CloudinarySettings> options)
        {
            var s = options.Value;
            _cloudinary = new Cloudinary(new Account(s.CloudName, s.ApiKey, s.ApiSecret));
            _cloudinary.Api.Secure = true;
        }

        public async Task<string> UploadAsync(IFormFile file, string folder)
        {
            if (file == null || file.Length == 0)
                throw new ArgumentException("No file provided.");

            await using var stream = file.OpenReadStream();

            var result = await _cloudinary.UploadAsync(new ImageUploadParams
            {
                File = new FileDescription(file.FileName, stream),
                Folder = folder,
                UseFilename = false,
                UniqueFilename = true
            });

            if (result.Error != null)
                throw new InvalidOperationException(result.Error.Message);

            return result.SecureUrl.ToString();
        }

        public async Task<string> UploadProfilePhotoAsync(IFormFile file, int userId)
        {
            if (file == null || file.Length == 0)
                throw new ArgumentException("No file provided.");

            await using var stream = file.OpenReadStream();

            var result = await _cloudinary.UploadAsync(new ImageUploadParams
            {
                File = new FileDescription(file.FileName, stream),
                Folder = "profiles",
                PublicId = $"user_{userId}",   // one photo per user
                Overwrite = true,              // replaces the old photo
                Invalidate = true,             // clears the CDN cache
                Transformation = new Transformation()
                    .Width(256).Height(256)
                    .Crop("fill").Gravity("face")
                    .Quality("auto").FetchFormat("auto")
            });

            if (result.Error != null)
                throw new InvalidOperationException(result.Error.Message);

            return result.SecureUrl.ToString();
        }

        public async Task DeleteProfilePhotoAsync(int userId)
        {
            await _cloudinary.DestroyAsync(new DeletionParams($"profiles/user_{userId}")
            {
                Invalidate = true
            });
        }
    }
}