using E_commerceAPI.RequestHelpers;
using System.Text.Json;

namespace E_commerceAPI.Extensions
{
    // Klasa e HttpExtensions përmban metodën për shtimin e headers për paginim në një përgjigje HTTP
    public static class HttpExtensions
    {
        // Metoda AddPaginationHeader shton headers për paginim në një përgjigje HttpResponse
        public static void AddPaginationHeader(this HttpResponse response, MetaData metaData)
        {
            // Krijohet një objekt JsonSerializerOptions për konfigurimin e serializimit të JSON
            var options = new JsonSerializerOptions { PropertyNamingPolicy = JsonNamingPolicy.CamelCase };

            // Serializohet objekti metaData dhe shtohet në header-in "Pagination"
            response.Headers.Append("Pagination", JsonSerializer.Serialize(metaData, options));

            // Shtohet header-i "Access-Control-Expose-Headers" për të lejuar qasjen nga klienti
            response.Headers.Append("Access-Control-Expose-Headers", "Pagination");
        }
    }
}
