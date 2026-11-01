namespace CakeManagementAPI.Services.Interfaces
{
    public interface ICourseEnrollmentEmailService
    {
        Task SendCourseEnrollmentEmailAsync(
            string email,
            string customerName,
            string courseName,
            DateTime startDate,
            DateTime endDate,
            string scheduleDetails);
    }
}
