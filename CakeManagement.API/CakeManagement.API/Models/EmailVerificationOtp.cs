namespace CakeManagementAPI.Models
{
    public class EmailVerificationOtp
    {
        public int Id { get; set; }

        public int UserId { get; set; }

        public string OtpHash { get; set; } = string.Empty;

        public DateTime CreatedAtUtc { get; set; } = DateTime.UtcNow;

        public DateTime ExpiresAtUtc { get; set; }

        public DateTime? UsedAtUtc { get; set; }

        public int FailedAttempts { get; set; }

        public User? User { get; set; }
    }
}
