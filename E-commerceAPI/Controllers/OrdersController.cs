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

    // Endpoint p�r marrjen e list�s s� porosive t� p�rdoruesit t� autentikuar
    [HttpGet]
    public async Task<ActionResult<List<OrderDto>>> GetOrders()
    {
        // K�rkon dhe projekton porosit� n� formatin e OrderDto duke p�rdorur ProjectOrderToOrderDto
        var orders = await _context.Orders
            .ProjectOrderToOrderDto()
            .Where(x => x.BuyerId == User.Identity.Name)  // Filtron porosit� p�r p�rdoruesin aktual
            .ToListAsync();

        return orders;
    }

    // Endpoint p�r marrjen e nj� porosie t� caktuar nga p�rdoruesi t� autentikuar
    [HttpGet("{id}", Name = "GetOrder")]
    public async Task<ActionResult<OrderDto>> GetOrder(int id)
    {
        // K�rkon dhe projekton porosin� n� formatin e OrderDto duke p�rdorur ProjectOrderToOrderDto
        var order = await _context.Orders
            .ProjectOrderToOrderDto()
            .Where(x => x.BuyerId == User.Identity.Name && x.Id == id)  // Filtron p�r porosin� me id e caktuar
            .FirstOrDefaultAsync();

        return order;
    }

    // Endpoint p�r krijuar nj� porosi t� re nga shporta e p�rdoruesit t� autentikuar
    [HttpPost]
    public async Task<ActionResult<Order>> CreateOrder(CreateOrderDto orderDto)
    {
        // Merr shport�n aktuale t� p�rdoruesit
        var basket = await _context.Baskets
            .RetrieveBasketWithItems(User.Identity.Name)
            .FirstOrDefaultAsync();

        // N�se nuk gjendet shporta, kthehet nj� p�rgjigje BadRequest
        if (basket == null) return BadRequest(new ProblemDetails { Title = "Could not locate basket" });

        // Lista p�r t� mbajtur artikujt e porosis�
        var items = new List<OrderItem>();

        // P�r �do artikull n� shport�, krijon nj� artikull p�r porosi dhe p�rdit�son sasin� n� magazin
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

        // Llogaritja e n�n-totalit dhe tarif�s s� transportit
        var subtotal = items.Sum(item => item.Price * item.Quantity);
        var deliveryFee = subtotal > 10000 ? 0 : 500;

        // Krijon nj� objekt Order me artikujt e porosis�, t� dh�nat e p�rdoruesit dhe t� dh�nat e transportit
        var order = new Order
        {
            OrderItems = items,
            BuyerId = User.Identity.Name,
            ShippingAddress = orderDto.ShippingAddress,
            Subtotal = subtotal,
            DeliveryFee = deliveryFee
        };

        // Shton porosin� n� baz� t� t� dh�nave dhe fshin shport�n
        _context.Orders.Add(order);
        _context.Baskets.Remove(basket);

        // N�se p�rdoruesi d�shiron t� ruaj� adres�n, p�rdit�son adres�n e p�rdoruesit n� baz� t� t� dh�nave
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

        // Ruajtja e ndryshimeve n� baz�n e t� dh�nave
        var result = await _context.SaveChangesAsync() > 0;

        // N�se ruajtja ka sukses, kthehet nj� p�rgjigje CreatedAtRoute me emrin e route "GetOrder" dhe id e porosis�
        if (result) return CreatedAtRoute("GetOrder", new { id = order.Id }, order.Id);

        // N� rast se ruajtja nuk ka sukses, kthehet nj� p�rgjigje BadRequest me nj� mesazh t� problematik�s
        return BadRequest("Problem creating order");
    }
}