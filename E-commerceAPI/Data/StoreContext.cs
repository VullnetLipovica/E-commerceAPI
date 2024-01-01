using E_commerceAPI.Entities;
using Microsoft.EntityFrameworkCore;

namespace E_commerceAPI.Data
{
    public class StoreContext : DbContext
    {
        public StoreContext(DbContextOptions options) : base(options)
        {
            
        }

        public DbSet<Product> Products { get; set; }
    }
}
