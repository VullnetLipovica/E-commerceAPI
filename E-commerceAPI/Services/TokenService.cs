using E_commerceAPI.Entities;
using Microsoft.AspNetCore.Identity;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace E_commerceAPI.Services
{
    // Klasa TokenService përdoret për gjenerimin e JWT token për përdoruesin
    public class TokenService
    {
        private readonly UserManager<User> _userManager;
        private readonly IConfiguration _config;

        // Konstruktori, merr një UserManager dhe një IConfiguration për të konfiguruar TokenService
        public TokenService(UserManager<User> userManager, IConfiguration config)
        {
            _config = config;
            _userManager = userManager;
        }

        // Metoda për të gjeneruar JWT token për një përdorues
        public async Task<string> GenerateToken(User user)
        {
            // Krijon një listë prej Claims për përdoruesin
            var claims = new List<Claim>
            {
                new Claim(ClaimTypes.Email, user.Email),
                new Claim(ClaimTypes.Name, user.UserName)
            };

            // Merr rollet e përdoruesit dhe i shton ato në listën e Claims
            var roles = await _userManager.GetRolesAsync(user);
            foreach (var role in roles)
            {
                claims.Add(new Claim(ClaimTypes.Role, role));
            }

            // Krijon një objekt SymmetricSecurityKey me çelësin e koduar nga IConfiguration
            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_config["JWTSettings:TokenKey"]));

            // Krijon objektin SigningCredentials për shënjestrimin e token-it
            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha512);

            // Krijon objektin JwtSecurityToken për të konfiguruar token-in
            var tokenOptions = new JwtSecurityToken(
                issuer: null,
                audience: null,
                claims: claims,
                expires: DateTime.Now.AddDays(7),
                signingCredentials: creds
            );

            // Kthen token-in e koduar në formë string
            return new JwtSecurityTokenHandler().WriteToken(tokenOptions);
        }
    }
}
