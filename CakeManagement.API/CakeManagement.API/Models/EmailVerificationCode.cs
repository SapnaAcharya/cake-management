namespace CakeManagementAPI.Models
{
    public class EmailVerificationCode
    {
        public int Id { get; set; }
        public string Email { get; set; } = "";
        public string Purpose { get; set; } = "";     
        public string CodeHash { get; set; } = "";     
        public DateTime ExpiresAt { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public int FailedAttempts { get; set; }
        public bool Used { get; set; }

        // Email verification token information
        public string? VerificationTokenHash { get; set; }

        public DateTime? VerificationTokenExpiresAt { get; set; }

        public bool VerificationTokenUsed { get; set; } = false;
    }
}
