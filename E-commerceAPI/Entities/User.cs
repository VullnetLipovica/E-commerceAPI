using Microsoft.AspNetCore.Identity;

namespace E_commerceAPI.Entities
{
    public class User : IdentityUser<int>
    {
        public UserAddress Address { get; set; }
    }
}
