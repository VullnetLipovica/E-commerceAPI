using E_commerceAPI.Data;
using E_commerceAPI.DTOs;
using E_commerceAPI.Entities;
using E_commerceAPI.Extensions;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;


namespace E_commerceAPI.Controllers
{
    public class BasketController : BaseApiController
    {
        private readonly StoreContext _context;

        // Konstruktori i BasketController, merr një instancë të StoreContext për akses në bazën e të dhënave
        public BasketController(StoreContext context)
        {
            _context = context;
        }

        // Endpoint për marrjen e shportës aktuale
        [HttpGet(Name = "GetBasket")]
        public async Task<ActionResult<BasketDto>> GetBasket()
        {
            // Merr shportën duke përdorur metoden RetrieveBasket
            var basket = await RetrieveBasket(GetBuyerId());

            // Nëse nuk gjen shportën, kthehet NotFound
            if (basket == null) return NotFound();

            // Kthehet shporta si një objekt BasketDto duke përdorur metoden MapBasketToDto
            return basket.MapBasketToDto();
        }

        // Endpoint për shtimin e një artikulli në shportë
        [HttpPost]
        public async Task<ActionResult> AddItemToBasket(int productId, int quantity = 1)
        {
            // Merr shportën duke përdorur metoden RetrieveBasket
            var basket = await RetrieveBasket(GetBuyerId());

           
            if (basket == null) basket = CreateBasket();

            var product = await _context.Products.FindAsync(productId);

            // Nëse produkti nuk gjendet, kthehet një përgjigje BadRequest me një mesazh të problematikës
            if (product == null) return BadRequest(new ProblemDetails { Title = "Product not found" });

            // Shton artikullin në shportë duke përdorur metoden AddItem
            basket.AddItem(product, quantity);

            // Ruajtja e ndryshimeve në bazën e të dhënave
            var result = await _context.SaveChangesAsync() > 0;

            // Nëse ruajtja ka sukses, kthehet një përgjigje CreatedAtRoute me emrin e route "GetBasket"
            if (result) return CreatedAtRoute("GetBasket", basket.MapBasketToDto());

            // Në rast se ruajtja nuk ka sukses, kthehet një përgjigje BadRequest me një mesazh të problematikës
            return BadRequest(new ProblemDetails { Title = "Problem saving item to basket" });
        }

        
        [HttpDelete]
        public async Task<ActionResult> RemoveBasketItem(int productId, int quantity = 1)
        {
            // Merr shportën duke përdorur metoden RetrieveBasket
            var basket = await RetrieveBasket(GetBuyerId());

            // Nëse nuk gjen shportën, kthehet NotFound
            if (basket == null) return NotFound();

            // Heq artikullin nga shporta duke përdorur metoden RemoveItem
            basket.RemoveItem(productId, quantity);

            // Ruajtja e ndryshimeve në bazën e të dhënave
            var result = await _context.SaveChangesAsync() > 0;

            // Nëse ruajtja ka sukses, kthehet një përgjigje Ok
            if (result) return Ok();

            // Në rast se ruajtja nuk ka sukses, kthehet një përgjigje BadRequest me një mesazh të problematikës
            return BadRequest(new ProblemDetails { Title = "Problem removing item from the basket" });
        }

        // Metoda private për marrjen e shportës nga bazadata bazuar në buyerId
        private async Task<Basket> RetrieveBasket(string buyerId)
        {
            // Nëse buyerId është bosh ose null, fshihet cookie për buyerId dhe kthehet null
            if (string.IsNullOrEmpty(buyerId))
            {
                Response.Cookies.Delete("buyerId");
                return null;
            }

            // Kërkesa në bazën e të dhënave për të marrë shportën dhe produkte e saj
            return await _context.Baskets
                .Include(i => i.Items)
                .ThenInclude(p => p.Product)
                .FirstOrDefaultAsync(basket => basket.BuyerId == buyerId);
        }

        // Metoda private për marrjen e buyerId nga User.Identity ose nga cookie
        private string GetBuyerId()
        {
            return User.Identity?.Name ?? Request.Cookies["buyerId"];
        }

        // Metoda private për krijimin e një shporte të re
        private Basket CreateBasket()
        {
            // Merr buyerId nga User.Identity, nëse është null krijohet një buyerId unik me Guid
            var buyerId = User.Identity?.Name;
            if (string.IsNullOrEmpty(buyerId))
            {
                buyerId = Guid.NewGuid().ToString();
                // Shtohet një cookie për buyerId që do të jetë esenciale dhe do të skadojë pas 30 ditëve
                var cookieOptions = new CookieOptions { IsEssential = true, Expires = DateTime.Now.AddDays(30) };
                Response.Cookies.Append("buyerId", buyerId, cookieOptions);
            }

            // Krijohet një objekt Basket me buyerId dhe shtohet në bazën e të dhënave
            var basket = new Basket { BuyerId = buyerId };
            _context.Baskets.Add(basket);
            return basket;
        }
    }
}
