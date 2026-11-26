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

        [HttpPost]
        [EnableRateLimiting("ContactForm")]
        public async Task<IActionResult> SendMessage(
            [FromBody] ContactMessageDto dto)
        {
            // Step 1: Save the customer's enquiry.
            var savedMessage =
                await _contactMessageService.CreateMessageAsync(dto);

            var adminEmailSent = false;
            var customerEmailSent = false;

            // Step 2: Send notification to the admin.
            try
            {
                await _contactEmailService.SendContactMessageAsync(
                    dto.Name.Trim(),
                    dto.Email.Trim(),
                    dto.Subject.Trim(),
                    dto.Message.Trim());

                adminEmailSent = true;

                _logger.LogInformation(
                    "Admin contact notification sent for message ID: {MessageId}",
                    savedMessage.Id);
            }
            catch (Exception ex)
            {
                _logger.LogError(
                    ex,
                    "Failed to send admin notification for message ID: {MessageId}",
                    savedMessage.Id);
            }

            // Step 3: Send confirmation to the customer.
            try
            {
                await _contactEmailService.SendCustomerConfirmationAsync(
                    dto.Name.Trim(),
                    dto.Email.Trim(),
                    dto.Subject.Trim());

                customerEmailSent = true;

                _logger.LogInformation(
                    "Customer confirmation sent for message ID: {MessageId}",
                    savedMessage.Id);
            }
            catch (Exception ex)
            {
                _logger.LogError(
                    ex,
                    "Failed to send customer confirmation for message ID: {MessageId}",
                    savedMessage.Id);
            }

            // Step 4: Return the result to React.
            return Ok(new
            {
                message = "Your enquiry has been received successfully.",
                id = savedMessage.Id,
                adminEmailSent,
                customerEmailSent
            });
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

        // POST: api/contact/messages/{id}/reply
        // Admin: Reply to a customer enquiry.
        [HttpPost("messages/{id:int}/reply")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> ReplyToMessage(
            int id,
            [FromBody] AdminReplyDto dto)
        {
            if (string.IsNullOrWhiteSpace(dto.ReplyMessage))
            {
                return BadRequest(new
                {
                    message = "Reply message cannot be empty."
                });
            }

            try
            {
                var result =
                    await _contactMessageService.SendAdminReplyAsync(
                        id,
                        dto.ReplyMessage.Trim());

                if (!result)
                {
                    return NotFound(new
                    {
                        message = "Contact enquiry not found."
                    });
                }

                _logger.LogInformation(
                    "Admin reply sent for contact message ID: {MessageId}",
                    id);

                return Ok(new
                {
                    message = "Admin reply sent successfully to the customer."
                });
            }
            catch (HttpRequestException ex)
            {
                _logger.LogError(
                    ex,
                    "Failed to send admin reply for contact message ID: {MessageId}",
                    id);

                return StatusCode(502, new
                {
                    message = "The reply could not be sent. Please try again."
                });
            }
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

