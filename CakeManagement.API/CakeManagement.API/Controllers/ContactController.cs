using CakeManagementAPI.DTOs;
using CakeManagementAPI.DTOs.Contact;
using CakeManagementAPI.Services.Interfaces;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;

namespace CakeManagementAPI.Controllers
{
    [ApiController]
    [Route("api/contact")]
    public class ContactController : ControllerBase
    {
        private readonly IContactEmailService _contactEmailService;
        private readonly ILogger<ContactController> _logger;

        public ContactController(
            IContactEmailService contactEmailService,
            ILogger<ContactController> logger)
        {
            _contactEmailService = contactEmailService;
            _logger = logger;
        }

        [HttpPost]
        [EnableRateLimiting("ContactForm")]
        public async Task<IActionResult> SendMessage(
            [FromBody] ContactMessageDto dto)
        {
            try
            {
                await _contactEmailService.SendContactMessageAsync(
                    dto.Name.Trim(),
                    dto.Email.Trim(),
                    dto.Subject.Trim(),
                    dto.Message.Trim());

                return Ok(new
                {
                    message = "Your message has been sent successfully."
                });
            }
            catch (InvalidOperationException ex)
            {
                _logger.LogError(ex, "Contact email configuration is missing.");

                return StatusCode(500, new
                {
                    message = "Email service is not configured correctly."
                });
            }
            catch (HttpRequestException ex)
            {
                _logger.LogError(ex, "Failed to send contact email.");

                return StatusCode(502, new
                {
                    message = "Unable to send your message. Please try again later."
                });
            }
        }
    }
}