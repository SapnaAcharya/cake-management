using Microsoft.OpenApi;
using Swashbuckle.AspNetCore.SwaggerGen;

namespace CakeManagementAPI.Filters
{
    public class GuestIdHeaderFilter : IOperationFilter
    {
        public void Apply(OpenApiOperation operation, OperationFilterContext context)
        {
            operation.Parameters ??= new List<IOpenApiParameter>();

            operation.Parameters.Add(new OpenApiParameter
            {
                Name = "X-Guest-Id",
                In = ParameterLocation.Header,
                Required = false,
                Schema = new OpenApiSchema { Type = JsonSchemaType.String },
                Description = "Guest identifier for anonymous cake customizations"
            });
        }
    }
}