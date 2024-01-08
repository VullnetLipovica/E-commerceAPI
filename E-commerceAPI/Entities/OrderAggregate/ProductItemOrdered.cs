using Microsoft.EntityFrameworkCore;

namespace E_commerceAPI.Entities.OrderAggregate;

[Owned]
public class ProductItemOrdered
{
    public int ProductId { get; set; }
    public string Name { get; set; }
    public string PictureUrl { get; set; }
}