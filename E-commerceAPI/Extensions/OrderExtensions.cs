using E_commerceAPI.DTOs;
using E_commerceAPI.Entities.OrderAggregate;
using Microsoft.EntityFrameworkCore;

namespace E_commerceAPI.Extensions;

// Klasa e OrderExtensions përmban metodën për projektimin e entiteteve Order në DTO (Data Transfer Object)
public static class OrderExtensions
{
    // Metoda ProjectOrderToOrderDto kthen një IQueryable të Order të projektuar në OrderDto
    public static IQueryable<OrderDto> ProjectOrderToOrderDto(this IQueryable<Order> query)
    {
        return query
            // Përzgjedh entitetet e Order dhe i mapon në OrderDto
            .Select(order => new OrderDto
            {
                Id = order.Id,
                BuyerId = order.BuyerId,
                OrderDate = order.OrderDate,
                ShippingAddress = order.ShippingAddress,
                DeliveryFee = order.DeliveryFee,
                Subtotal = order.Subtotal,
                OrderStatus = order.OrderStatus.ToString(),
                Total = order.GetTotal(),
                OrderItems = order.OrderItems.Select(item => new OrderItemDto
                {
                    ProductId = item.ItemOrdered.ProductId,
                    Name = item.ItemOrdered.Name,
                    PictureUrl = item.ItemOrdered.PictureUrl,
                    Price = item.Price,
                    Quantity = item.Quantity
                }).ToList()
            })
            // Përdor AsNoTracking për të shmangur ndjekjen e ndryshimeve nga Entity Framework
            .AsNoTracking();
    }
}