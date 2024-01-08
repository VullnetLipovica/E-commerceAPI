using E_commerceAPI.Entities.OrderAggregate;

namespace E_commerceAPI.DTOs;

public class CreateOrderDto
{
    public bool SaveAddress { get; set; }
    public ShippingAddress ShippingAddress { get; set; }
}