
using CakeManagementAPI.DTOs.Training;
using CakeManagementAPI.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CakeManagementAPI.Controllers
{
    [ApiController]
    [Route("api/trainers")]
    public class TrainersController : ControllerBase
    {
        private readonly ITrainerService _service;

        public TrainersController(ITrainerService service)
        {
            _service = service;
        }

        // GET: api/trainers
        // Public: Get all active trainers.
        [HttpGet]
        [AllowAnonymous]
        public async Task<ActionResult<List<TrainerResponseDto>>> GetAll()
        {
            var trainers = await _service.GetAllActiveAsync();
            return Ok(trainers);
        }

        // GET: api/trainers/admin/all
        // Admin only: Get all trainers, including inactive trainers.
        [HttpGet("admin/all")]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<List<TrainerResponseDto>>> GetAllForAdmin()
        {
            var trainers = await _service.GetAllAsync();
            return Ok(trainers);
        }

// PATCH: api/trainers/1/activate
[HttpPatch("{id:int}/activate")]
[Authorize(Roles = "Admin")]
public async Task<IActionResult> Activate(int id)
{
    var activated = await _service.ActivateAsync(id);
    if (!activated)
        return NotFound(new { message = "Trainer not found." });

    return Ok(new { message = "Trainer activated successfully." });
}

        // GET: api/trainers/1
        // Public: Get one active trainer.
        [HttpGet("{id:int}")]
        [AllowAnonymous]
        public async Task<ActionResult<TrainerResponseDto>> GetById(int id)
        {
            var trainer = await _service.GetActiveByIdAsync(id);

            if (trainer == null)
            {
                return NotFound(new
                {
                    message = "Trainer not found."
                });
            }

            return Ok(trainer);
        }

        // POST: api/trainers
        // Admin only: Create a trainer.
        [HttpPost]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<TrainerResponseDto>> Create(
            CreateTrainerDto dto)
        {
            var trainer = await _service.CreateAsync(dto);

            return CreatedAtAction(
                nameof(GetById),
                new { id = trainer.Id },
                trainer);
        }

        // PUT: api/trainers/1
        // Admin only: Update a trainer.
        [HttpPut("{id:int}")]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<TrainerResponseDto>> Update(
            int id,
            UpdateTrainerDto dto)
        {
            var trainer = await _service.UpdateAsync(id, dto);

            if (trainer == null)
            {
                return NotFound(new
                {
                    message = "Trainer not found."
                });
            }

            return Ok(trainer);
        }

        // PATCH: api/trainers/1/deactivate
        // Admin only: Deactivate a trainer.
        [HttpPatch("{id:int}/deactivate")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Deactivate(int id)
        {
            var deactivated = await _service.DeactivateAsync(id);

            if (!deactivated)
            {
                return NotFound(new
                {
                    message = "Trainer not found."
                });
            }

            return Ok(new
            {
                message = "Trainer deactivated successfully."
            });
        }
    }
}
