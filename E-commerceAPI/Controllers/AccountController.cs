using E_commerceAPI.Data;
using E_commerceAPI.DTOs;
using E_commerceAPI.Entities;
using E_commerceAPI.Extensions;
using E_commerceAPI.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace E_commerceAPI.Controllers
{
    public class AccountController : BaseApiController  // Deklarimi i klases AccountController që trashëgon nga BaseApiController
    {
        private readonly UserManager<User> _userManager;  // Variabla private për të përdorur UserManager për menaxhimin e përdoruesve
        private readonly TokenService _tokenService;  // Variabla private për të përdorur TokenService për gjenerimin e token-it
        private readonly StoreContext _context;  // Variabla private për të përdorur StoreContext për akses në bazën e të dhënave

        // Konstruktori i klases AccountController
        public AccountController(UserManager<User> userManager, TokenService tokenService, StoreContext context)
        {
            _context = context;
            _tokenService = tokenService;
            _userManager = userManager;
        }

        // Endpoint për autentikim (login)
        [HttpPost("login")]
        public async Task<ActionResult<UserDto>> Login(LoginDto loginDto)
        {
            var user = await _userManager.FindByNameAsync(loginDto.Username);  // Gjetja e përdoruesit nga emri i përdoruesit

            // Verifikimi i përdoruesit dhe kthimi i Unauthorized nëse nuk është i vlefshëm
            if (user == null || !await _userManager.CheckPasswordAsync(user, loginDto.Password))
                return Unauthorized();

            var userBasket = await RetrieveBasket(loginDto.Username);  // Merrja e shportës së përdoruesit
            var anonBasket = await RetrieveBasket(Request.Cookies["buyerId"]);  // Merrja e shportës anonime nga cookie

            // Lidhja e shportave nëse ekziston një shportë anonime
            if (anonBasket != null)
            {
                if (userBasket != null) _context.Baskets.Remove(userBasket);  // Fshirja e shportës së përdoruesit nëse ekziston
                anonBasket.BuyerId = user.UserName;  // Ndryshimi i buyerId për shportën anonime
                Response.Cookies.Delete("buyerId");  // Fshirja e cookie për buyerId
                await _context.SaveChangesAsync();  // Ruajtja e ndryshimeve në bazën e të dhënave
            }

            // Kthimi i informacionit të përdoruesit dhe token-it në një objekt UserDto
            return new UserDto
            {
                Email = user.Email,
                Token = await _tokenService.GenerateToken(user),
                Basket = anonBasket != null ? anonBasket.MapBasketToDto() : userBasket?.MapBasketToDto()
            };
        }

        // Endpoint për regjistrim të përdoruesve
        [HttpPost("register")]
        public async Task<ActionResult> RegisterUser(RegisterDto registerDto)
        {
            var user = new User { UserName = registerDto.Username, Email = registerDto.Email };  // Krijimi i një objekti User me të dhënat e regjistrimit

            // Regjistrimi i përdoruesit përmes UserManager
            var result = await _userManager.CreateAsync(user, registerDto.Password);

            // Përpunimi i rezultatit të regjistrimit dhe kthimi i problemeve nëse ka ndonjë gabim
            if (!result.Succeeded)
            {
                foreach (var error in result.Errors)
                {
                    ModelState.AddModelError(error.Code, error.Description);
                }

                return ValidationProblem();
            }

            // Shtimi i përdoruesit në rolin "Member"
            await _userManager.AddToRoleAsync(user, "Member");

            // Kthimi i një status code 201 nëse regjistrimi është kryer me sukses
            return StatusCode(201);
        }

        // Endpoint për marrjen e përdoruesit aktual
        [Authorize]
        [HttpGet("currentUser")]
        public async Task<ActionResult<UserDto>> GetCurrentUser()
        {
            var user = await _userManager.FindByNameAsync(User.Identity.Name);  // Gjetja e përdoruesit nga emri i identitetit

            var userBasket = await RetrieveBasket(User.Identity.Name);  // Merrja e shportës së përdoruesit

            // Kthimi i informacionit të përdoruesit dhe token-it në një objekt UserDto
            return new UserDto
            {
                Email = user.Email,
                Token = await _tokenService.GenerateToken(user),
                Basket = userBasket?.MapBasketToDto()
            };
        }

        // Endpoint për marrjen e adresës së ruajtur të përdoruesit
        [Authorize]
        [HttpGet("savedAddress")]
        public async Task<ActionResult<UserAddress>> GetSavedAddress()
        {
            return await _userManager.Users
                .Where(x => x.UserName == User.Identity.Name)
                .Select(user => user.Address)
                .FirstOrDefaultAsync();
        }


        // Metoda private për marrjen e shportës bazuar në buyerId
        private async Task<Basket> RetrieveBasket(string buyerId)
        {
            // Kujdeset për rastin kur buyerId është null ose bosh
            if (string.IsNullOrEmpty(buyerId))
            {
                Response.Cookies.Delete("buyerId");  // Fshirja e cookie për buyerId
                return null;
            }

            // Kërkesa në bazën e të dhënave për të marrë shportën dhe produkte e saj
            return await _context.Baskets
                .Include(i => i.Items)
                .ThenInclude(p => p.Product)
                .FirstOrDefaultAsync(basket => basket.BuyerId == buyerId);
        }
    }
}
