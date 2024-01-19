using E_commerceAPI.Data;
using E_commerceAPI.DTOs;
using E_commerceAPI.Entities;
using E_commerceAPI.Entities.OrderAggregate;
using E_commerceAPI.Extensions;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace E_commerceAPI.Controllers;

public class OrdersController : BaseApiController
{
    private readonly StoreContext _context;

    public OrdersController(StoreContext context)
    {
        _context = context;
    }

    // Endpoint për marrjen e listës së porosive të përdoruesit të autentikuar
    [HttpGet]
    public async Task<ActionResult<List<OrderDto>>> GetOrders()
    {
        // Kërkon dhe projekton porositë në formatin e OrderDto duke përdorur ProjectOrderToOrderDto
        var orders = await _context.Orders
            .ProjectOrderToOrderDto()
            .Where(x => x.BuyerId == User.Identity.Name)  // Filtron porositë për përdoruesin aktual
            .ToListAsync();

        return orders;
    }

    // Endpoint për marrjen e një porosie të caktuar nga përdoruesi të autentikuar
    [HttpGet("{id}", Name = "GetOrder")]
    public async Task<ActionResult<OrderDto>> GetOrder(int id)
    {
        // Kërkon dhe projekton porosinë në formatin e OrderDto duke përdorur ProjectOrderToOrderDto
        var order = await _context.Orders
            .ProjectOrderToOrderDto()
            .Where(x => x.BuyerId == User.Identity.Name && x.Id == id)  // Filtron për porosinë me id e caktuar
            .FirstOrDefaultAsync();

        return order;
    }

    // Endpoint për krijuar një porosi të re nga shporta e përdoruesit të autentikuar
    [HttpPost]
    public async Task<ActionResult<Order>> CreateOrder(CreateOrderDto orderDto)
    {
        // Merr shportën aktuale të përdoruesit
        var basket = await _context.Baskets
            .RetrieveBasketWithItems(User.Identity.Name)
            .FirstOrDefaultAsync();

        // Nëse nuk gjendet shporta, kthehet një përgjigje BadRequest
        if (basket == null) return BadRequest(new ProblemDetails { Title = "Could not locate basket" });

        // Lista për të mbajtur artikujt e porosisë
        var items = new List<OrderItem>();

        // Për çdo artikull në shportë, krijon një artikull për porosi dhe përditëson sasinë në magazin
        foreach (var item in basket.Items)
        {
            var productItem = await _context.Products.FindAsync(item.ProductId);
            var itemOrdered = new ProductItemOrdered
            {
                ProductId = productItem.Id,
                Name = productItem.Name,
                PictureUrl = productItem.PictureURL
            };
            var orderItem = new OrderItem
            {
                ItemOrdered = itemOrdered,
                Price = productItem.Price,
                Quantity = item.Quantity
            };
            items.Add(orderItem);
            productItem.QuantityInStock -= item.Quantity;
        }

        // Llogaritja e nën-totalit dhe tarifës së transportit
        var subtotal = items.Sum(item => item.Price * item.Quantity);
        var deliveryFee = subtotal > 10000 ? 0 : 500;

        // Krijon një objekt Order me artikujt e porosisë, të dhënat e përdoruesit dhe të dhënat e transportit
        var order = new Order
        {
            OrderItems = items,
            BuyerId = User.Identity.Name,
            ShippingAddress = orderDto.ShippingAddress,
            Subtotal = subtotal,
            DeliveryFee = deliveryFee
        };

        // Shton porosinë në bazë të të dhënave dhe fshin shportën
        _context.Orders.Add(order);
        _context.Baskets.Remove(basket);

        // Nëse përdoruesi dëshiron të ruajë adresën, përditëson adresën e përdoruesit në bazë të të dhënave
        if (orderDto.SaveAddress)
        {
            var user = await _context.Users
                .Include(a => a.Address)
                .FirstOrDefaultAsync(x => x.UserName == User.Identity.Name);

            var address = new UserAddress
            {
                FullName = orderDto.ShippingAddress.FullName,
                Address1 = orderDto.ShippingAddress.Address1,
                Address2 = orderDto.ShippingAddress.Address2,
                City = orderDto.ShippingAddress.City,
                State = orderDto.ShippingAddress.State,
                Zip = orderDto.ShippingAddress.Zip,
                Country = orderDto.ShippingAddress.Country
            };
            user.Address = address;
        }

        // Ruajtja e ndryshimeve në bazën e të dhënave
        var result = await _context.SaveChangesAsync() > 0;

        // Nëse ruajtja ka sukses, kthehet një përgjigje CreatedAtRoute me emrin e route "GetOrder" dhe id e porosisë
        if (result) return CreatedAtRoute("GetOrder", new { id = order.Id }, order.Id);

        // Në rast se ruajtja nuk ka sukses, kthehet një përgjigje BadRequest me një mesazh të problematikës
        return BadRequest("Problem creating order");
    }
}