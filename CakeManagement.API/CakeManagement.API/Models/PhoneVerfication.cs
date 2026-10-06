namespace CakeManagementAPI.Models
{
    public class PhoneVerification
    {
        public int Id { get; set; }

        public string PhoneNumber { get; set; } = null!;

        public string OtpHash { get; set; } = null!;

        public DateTime ExpiresAt { get; set; }

        public bool IsVerified { get; set; } = false;

        public int Attempts { get; set; } = 0;

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}
