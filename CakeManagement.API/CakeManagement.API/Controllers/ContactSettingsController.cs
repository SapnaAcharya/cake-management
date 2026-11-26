using CakeManagementAPI.DTOs.Contact;
using CakeManagementAPI.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CakeManagementAPI.Controllers
{
    [ApiController]
    [Route("api/contact/settings")]
    public class ContactSettingsController : ControllerBase
    {
        private readonly IContactService _contactService;

        public ContactSettingsController(
            IContactService contactService)
        {
            _contactService = contactService;
        }

        // GET: api/contact/settings
        // Public
        [HttpGet]
        [AllowAnonymous]
        public async Task<IActionResult> GetContactSettings()
        {
            var settings =
                await _contactService.GetContactSettingsAsync();

            return Ok(settings);
        }

        // PUT: api/contact/settings
        // Admin only
        [HttpPut]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> UpdateContactSettings(
            [FromBody] UpdateContactSettingsDto dto)
        {
            try
            {
                await _contactService.UpdateContactSettingsAsync(dto);
                return Ok(new { message = "Contact settings updated successfully." });
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        // GET: api/contact/settings/faqs
        // Public
        [HttpGet("faqs")]
        [AllowAnonymous]
        public async Task<IActionResult> GetFaqs()
        {
            var faqs = await _contactService.GetFaqsAsync();

            return Ok(faqs);
        }

        // POST: api/contact/settings/faqs
        // Admin only
        [HttpPost("faqs")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> CreateFaq(
            [FromBody] CreateContactFaqDto dto)
        {
            try
            {
                var faq = await _contactService.CreateFaqAsync(dto);

                return Ok(new
                {
                    message = "FAQ created successfully.",
                    data = faq
                });
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        // PUT: api/contact/settings/faqs/{id}
        // Admin only
        [HttpPut("faqs/{id:int}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> UpdateFaq(
            int id,
            [FromBody] CreateContactFaqDto dto)
        {
            try
            {
                var faq = await _contactService.UpdateFaqAsync(id, dto);

                if (faq == null)
                {
                    return NotFound(new { message = "FAQ not found." });
                }

                return Ok(new
                {
                    message = "FAQ updated successfully.",
                    data = faq
                });
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        // DELETE: api/contact/settings/faqs/{idCon}
        // Admin only
        [HttpDelete("faqs/{id:int}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> DeleteFaq(int id)
        {
            var deleted = await _contactService.DeleteFaqAsync(id);

            if (!deleted)
            {
                return NotFound(new { message = "FAQ not found." });
            }

            return Ok(new
            {
                message = "FAQ deleted successfully."
            });
        }

    }
}
