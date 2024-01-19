using E_commerceAPI.Entities;
using E_commerceAPI.Entities.OrderAggregate;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;

namespace E_commerceAPI.Data
{
    // Klasa StoreContext është përgjegjëse për lidhjen me bazën e të dhënave dhe përcaktimin e modeleave
    public class StoreContext : IdentityDbContext<User, Role, int>
    {
        // Konstruktori i klasës, pranon një objekt DbContextOptions
        public StoreContext(DbContextOptions options) : base(options)
        {
        }

        // Tabelat e bazës së të dhënave
        public DbSet<Product> Products { get; set; }
        public DbSet<Basket> Baskets { get; set; }
        public DbSet<Order> Orders { get; set; }

        // Përcaktimi i mapeve të tabelave në bazë të modeleve
        protected override void OnModelCreating(ModelBuilder builder)
        {
            // Thirr metoden bazë OnModelCreating
            base.OnModelCreating(builder);

            // Përcakton marrëdhënien e një-nga-një mes User dhe UserAddress, me fushën e jashtme UserId
            builder.Entity<User>()
                .HasOne(a => a.Address)
                .WithOne()
                .HasForeignKey<UserAddress>(a => a.Id)
                .OnDelete(DeleteBehavior.Cascade);

            // Shton të dhënat fillestare për rolet në bazën e të dhënave
            builder.Entity<Role>()
                .HasData(
                    new Role { Id = 1, Name = "Member", NormalizedName = "MEMBER" },
                    new Role { Id = 2, Name = "Admin", NormalizedName = "ADMIN" }
                );
        }
    }
}
