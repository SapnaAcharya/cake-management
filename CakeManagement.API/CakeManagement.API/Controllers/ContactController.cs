using CakeManagementAPI.DTOs;
using CakeManagementAPI.DTOs.Contact;
using CakeManagementAPI.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;

namespace CakeManagementAPI.Controllers
{
    [ApiController]
    [Route("api/contact")]
    public class ContactController : ControllerBase
    {
        private readonly IContactEmailService _contactEmailService;
        private readonly IContactMessageService _contactMessageService;
        private readonly ILogger<ContactController> _logger;

        public ContactController(
            IContactEmailService contactEmailService,
            IContactMessageService contactMessageService,
            ILogger<ContactController> logger)
        {
            _contactEmailService = contactEmailService;
            _contactMessageService = contactMessageService;
            _logger = logger;
        }

        // POST: api/contact
        // Customer submits an enquiry.
        // Save the message and notify admin by email.
        [HttpPost]
        [EnableRateLimiting("ContactForm")]
        public async Task<IActionResult> SendMessage(
            [FromBody] ContactMessageDto dto)
        {
            // Save the enquiry first so it is available
            // in the admin dashboard even if email fails.
            var savedMessage =
                await _contactMessageService.CreateMessageAsync(dto);

            try
            {
                await _contactEmailService.SendContactMessageAsync(
                    dto.Name.Trim(),
                    dto.Email.Trim(),
                    dto.Subject.Trim(),
                    dto.Message.Trim());

                return Ok(new
                {
                    message = "Your enquiry has been submitted successfully.",
                    emailNotificationSent = true,
                    id = savedMessage.Id
                });
            }
            catch (InvalidOperationException ex)
            {
                _logger.LogError(
                    ex,
                    "Contact email configuration is missing.");

                return Ok(new
                {
                    message = "Your enquiry was received, but the email notification could not be sent.",
                    emailNotificationSent = false,
                    id = savedMessage.Id
                });
            }
            catch (HttpRequestException ex)
            {
                _logger.LogError(
                    ex,
                    "Failed to send contact email.");

                return Ok(new
                {
                    message = "Your enquiry was received, but the email notification could not be sent.",
                    emailNotificationSent = false,
                    id = savedMessage.Id
                });
            }
        }

        // GET: api/contact/messages
        // Admin: Get all customer enquiries.
        [HttpGet("messages")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> GetAllMessages()
        {
            var messages =
                await _contactMessageService.GetAllMessagesAsync();

            return Ok(messages);
        }

        // GET: api/contact/messages/{id}
        // Admin: Get one enquiry.
        [HttpGet("messages/{id:int}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> GetMessageById(int id)
        {
            var message =
                await _contactMessageService.GetMessageByIdAsync(id);

            if (message == null)
            {
                return NotFound(new
                {
                    message = "Contact enquiry not found."
                });
            }

            return Ok(message);
        }

        // PUT: api/contact/messages/{id}/status
        // Admin: Update enquiry status.
        [HttpPut("messages/{id:int}/status")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> UpdateMessageStatus(
            int id,
            [FromBody] UpdateContactMessageStatusDto dto)
        {
            try
            {
                var updated =
                    await _contactMessageService.UpdateMessageStatusAsync(
                        id, dto);

                if (!updated)
                {
                    return NotFound(new
                    {
                        message = "Contact enquiry not found."
                    });
                }

                return Ok(new
                {
                    message = "Contact enquiry status updated successfully."
                });
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new
                {
                    message = ex.Message
                });
            }
        }

        // DELETE: api/contact/messages/{id}
        // Admin: Delete an enquiry.
        [HttpDelete("messages/{id:int}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> DeleteMessage(int id)
        {
            var deleted =
                await _contactMessageService.DeleteMessageAsync(id);

            if (!deleted)
            {
                return NotFound(new
                {
                    message = "Contact enquiry not found."
                });
            }

            return Ok(new
            {
                message = "Contact enquiry deleted successfully."
            });
        }
    }
}

