using Microsoft.AspNetCore.Mvc;
using System.Text.Json;

namespace E_commerceAPI.Middleware
{
    // Klasa ExceptionMiddleware përdoret për të kapur dhe trajtuar shqetësimet gjatë ekzekutimit të kërkesave
    public class ExceptionMiddleware
    {
        private readonly RequestDelegate _next;
        private readonly ILogger<ExceptionMiddleware> _logger;
        private readonly IHostEnvironment _env;

        // Konstruktori, merr një RequestDelegate, një ILogger dhe një IHostEnvironment
        public ExceptionMiddleware(RequestDelegate next, ILogger<ExceptionMiddleware> logger, IHostEnvironment env)
        {
            _next = next;
            _logger = logger;
            _env = env;
        }

        // Metoda InvokeAsync, thirret për të ekzekutuar middleware
        public async Task InvokeAsync(HttpContext context)
        {
            try
            {
                // Thirr metoden tjeter middleware ne rradhe (_next)
                await _next(context);
            }
            catch (Exception ex)
            {
                // Kap shqetësimin dhe logon gabimet
                _logger.LogError(ex, ex.Message);

                // Përcakton tipin dhe statusin e përgjigjes
                context.Response.ContentType = "application/json";
                context.Response.StatusCode = 500;

                // Krijon një objekt ProblemDetails për përgjigjen e gabimit
                var response = new ProblemDetails
                {
                    Status = 500,
                    Detail = _env.IsDevelopment() ? ex.StackTrace?.ToString() : null,
                    Title = ex.Message
                };

                // Konfiguron opsionet për serializimin e JSON
                var options = new JsonSerializerOptions { PropertyNamingPolicy = JsonNamingPolicy.CamelCase };

                // Serializon objektin ProblemDetails në format JSON
                var json = JsonSerializer.Serialize(response, options);

                // Dërgon përgjigjen JSON në klient
                await context.Response.WriteAsync(json);
            }
        }
    }
}
