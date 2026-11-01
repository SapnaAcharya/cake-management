using CakeManagementAPI.DTOs.Training;
using CakeManagementAPI.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CakeManagementAPI.Controllers
{
    [ApiController]
    [Route("api/trainingbatches")]
    public class TrainingBatchesController : ControllerBase
    {
        private readonly ITrainingBatchService _service;

        public TrainingBatchesController(ITrainingBatchService service)
        {
            _service = service;
        }

        // Public: list batches open for registration.
        [HttpGet]
        [AllowAnonymous]
        public async Task<IActionResult> GetAll()
        {
            var batches = await _service.GetAllOpenAsync();
            return Ok(batches);
        }

        // Public: get one open batch.
        [HttpGet("{id:int}")]
        [AllowAnonymous]
        public async Task<IActionResult> GetById(int id)
        {
            var batch = await _service.GetOpenByIdAsync(id);

            if (batch == null)
                return NotFound(new { message = "Open training batch not found." });

            return Ok(batch);
        }

        
        // GET: api/trainingbatches/admin/all
        // Admin: Get all batches, including closed and cancelled batches.
        [HttpGet("admin/all")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> GetAllForAdmin()
        {
            var batches = await _service.GetAllAsync();
            return Ok(batches);
        }

        // GET: api/trainingbatches/admin/1
        // Admin: Get one batch regardless of status.
        [HttpGet("admin/{id:int}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> GetByIdForAdmin(int id)
        {
            var batch = await _service.GetByIdAsync(id);

            if (batch == null)
                return NotFound(new { message = "Training batch not found." });

            return Ok(batch);
        }


        // Admin: create a batch.
        [HttpPost]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Create(
            [FromBody] CreateTrainingBatchDto dto)
        {
            try
            {
                var batch = await _service.CreateAsync(dto);

                return CreatedAtAction(
                    nameof(GetById),
                    new { id = batch.Id },
                    batch);
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        // Admin: update a batch.
        [HttpPut("{id:int}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Update(
            int id,
            [FromBody] UpdateTrainingBatchDto dto)
        {
            try
            {
                var batch = await _service.UpdateAsync(id, dto);

                if (batch == null)
                    return NotFound(new { message = "Training batch not found." });

                return Ok(batch);
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        // Admin: close a batch without deleting its history.
        [HttpPatch("{id:int}/close")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Close(int id)
        {
            var closed = await _service.CloseAsync(id);

            if (!closed)
                return NotFound(new { message = "Training batch not found." });

            return Ok(new { message = "Training batch closed successfully." });
        }
    }
}
