 using E_commerceAPI.DTOs;
using E_commerceAPI.Entities;
using Microsoft.EntityFrameworkCore;

namespace E_commerceAPI.Extensions
{
    // Klasa e BasketExtensions përmban metodat për mapimin e Basket në BasketDto dhe për marrjen e një Basket me elemente nga baza e të dhënave
    public static class BasketExtensions
    {
        // Metoda MapBasketToDto mapon një objekt Basket në BasketDto
        public static BasketDto MapBasketToDto(this Basket basket)
        {
            return new BasketDto
            {
                Id = basket.Id,
                BuyerId = basket.BuyerId,
                Items = basket.Items.Select(item => new BasketItemDto
                {
                    ProductId = item.ProductId,
                    Name = item.Product.Name,
                    Price = item.Product.Price,
                    PictureUrl = item.Product.PictureURL,
                    Type = item.Product.Type,
                    Brand = item.Product.Brand,
                    Quantity = item.Quantity
                }).ToList()
            };
        }

        // Metoda RetrieveBasketWithItems kthen një IQueryable të Basket me të dhëna të elementeve të lidhura nga tabela e produkteve
        public static IQueryable<Basket> RetrieveBasketWithItems(this IQueryable<Basket> query, string buyerId)
        {
            return query
                .Include(i => i.Items)             // Lidh entitetin Basket me entitetin BasketItem
                .ThenInclude(p => p.Product)       // Lidh entitetin BasketItem me entitetin Product
                .Where(b => b.BuyerId == buyerId); // Filtron bazuar në buyerId
        }
    }
}
