using CakeManagementAPI.DTOs.Training;
using CakeManagementAPI.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CakeManagementAPI.Controllers
{
    [ApiController]
    [Route("api/trainingpackages")]
    public class TrainingPackagesController : ControllerBase
    {
        private readonly ITrainingPackageService _service;

        public TrainingPackagesController(
            ITrainingPackageService service)
        {
            _service = service;
        }

        // GET: api/trainingpackages
        // Customers and admins can view active training packages.
        [HttpGet]
        [AllowAnonymous]
        public async Task<ActionResult<List<TrainingPackageResponseDto>>>
            GetAll()
        {
            var packages = await _service.GetAllActiveAsync();

            return Ok(packages);
        }

        // GET: api/trainingpackages/1
        // Customers and admins can view an individual active package.
        [HttpGet("{id:int}")]
        [AllowAnonymous]
        public async Task<ActionResult<TrainingPackageResponseDto>>
            GetById(int id)
        {
            var package = await _service.GetActiveByIdAsync(id);

            if (package == null)
            {
                return NotFound(new
                {
                    message = "Training package not found."
                });
            }

            return Ok(package);
        }

        // POST: api/trainingpackages
        // Only admins can create training packages.
        [HttpPost]
        [Authorize(Roles = "Admin")]
        [Consumes("multipart/form-data")]
        public async Task<ActionResult<TrainingPackageResponseDto>>
            Create([FromForm] CreateTrainingPackageDto dto)
        {
            var package = await _service.CreateAsync(dto);

            return CreatedAtAction(
                nameof(GetById),
                new { id = package.Id },
                package);
        }

        // PUT: api/trainingpackages/1
        // Only admins can update training packages.
        [HttpPut("{id:int}")]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<TrainingPackageResponseDto>>
            Update(
                int id,
                [FromForm] UpdateTrainingPackageDto dto)
        {
            var package = await _service.UpdateAsync(id, dto);

            if (package == null)
            {
                return NotFound(new
                {
                    message = "Training package not found."
                });
            }

            return Ok(package);
        }

        // PATCH: api/trainingpackages/1/deactivate
        // Only admins can deactivate training packages.
        [HttpPatch("{id:int}/deactivate")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Deactivate(int id)
        {
            var deactivated = await _service.DeactivateAsync(id);

            if (!deactivated)
            {
                return NotFound(new
                {
                    message = "Training package not found."
                });
            }

            return Ok(new
            {
                message = "Training package deactivated successfully."
            });
        }
    }
}


