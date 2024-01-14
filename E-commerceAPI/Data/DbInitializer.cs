using E_commerceAPI.Entities;
using Microsoft.AspNetCore.Identity;
using System.Xml.Linq;

namespace E_commerceAPI.Data
{
    public static class DbInitializer
    {
        public static async Task Initialize(StoreContext context, UserManager<User> userManager)
        {
            if (!userManager.Users.Any())
            {
                var user = new User
                {
                    UserName = "vullnet",
                    Email = "Vullnet@gmail.com"
                };

                await userManager.CreateAsync(user, "Lipovica123*");
                await userManager.AddToRoleAsync(user, "Member");

                var admin = new User
                {
                    UserName = "admin",
                    Email = "admin@test.com"
                };

                await userManager.CreateAsync(admin, "Admin@123");
                await userManager.AddToRolesAsync(admin, new[] { "Admin", "Member" });

                var admin2 = new User
                {
                    UserName = "ardit",
                    Email = "Ardit@gmail.com"
                };

                await userManager.CreateAsync(admin2, "Ardit123*");
                await userManager.AddToRoleAsync(admin2, "Admin");
            }

            if (context.Products.Any()) return;

            var products = new List<Product>
            {
                new Product
                {
                    Name = "Whey Gold Standard",
                    Description =
                        "Whey Gold Standard 2.3KG",
                    Price = 8000,
                    PictureURL = "https://res.cloudinary.com/diaj9lrnn/image/upload/v1705253833/rvfjxl0dcwcbnuhamzhw.png",
                    Brand = "Optimum Nutrition",
                    Type = "Whey",
                    QuantityInStock = 100,
                    PublicId = "bd548fb2"
                },
                new Product
                {
                    Name = "Masstech Extreme 2000",
                    Description = "2000 kalori, 80g protein, 400 carbs, vitamina & minerale",
                    Price = 15000,
                    PictureURL = "https://res.cloudinary.com/diaj9lrnn/image/upload/v1705254613/ozvswdlqh82vitixg2b7.jpg",
                    Brand = "MuscleTech",
                    Type = "Weight Gainer",
                    QuantityInStock = 100,
                    PublicId = "a9ad1435"
                },
                new Product
                {
                    Name = "Super Mass Weight Gainer",
                    Description = "10g protein, 79g carbs, 357 kalori",
                    Price = 2500,
                    PictureURL = "https://res.cloudinary.com/diaj9lrnn/image/upload/v1705254701/zqo8bi33uu7lowkft07y.png",
                    Brand = "HsLabs",
                    Type = "Weight Gainer",
                    QuantityInStock = 100,
                    PublicId = "6731ea15"
                },
                new Product
                {
                    Name = "True Mass 1200 Mass Gainer",
                    Description =
                        "1248 kalori, 54g protein, 210 carbs",
                    Price = 3000,
                    PictureURL = "https://res.cloudinary.com/diaj9lrnn/image/upload/v1705254649/bdnvpenusfunyicqdjqa.jpg",
                    Brand = "BSN",
                    Type = "Weight Gainer",
                    QuantityInStock = 100,
                    PublicId = "86237ce7"
                },
                new Product
                {
                    Name = "Serious Mass 5.4KG",
                    Description =
                        "Siguron kalori, duke inkurajuar shtimin e peshës dhe karburanton rezervat e glikogjenit të trupit",
                    Price = 9000,
                    PictureURL = "https://res.cloudinary.com/diaj9lrnn/image/upload/v1705254490/wqurw4cgw1etm2jpybio.png",
                    Brand = "Optimum Nutrition",
                    Type = "Weight Gainer",
                    QuantityInStock = 100,
                    PublicId = "b17dc314"
                },
                new Product
                {
                    Name = "Micronised Creatine",
                    Description =
                        "5 grams pure creatine monohydrate per serving,Supports increases in energy, endurance & recovery,Maximum potency supports muscle size, strength, and power",
                    Price = 12000,
                    PictureURL = "https://res.cloudinary.com/diaj9lrnn/image/upload/v1705254490/wqurw4cgw1etm2jpybio.png",
                    Brand = "Optimum Nutrition",
                    Type = "Creatine",
                    QuantityInStock = 100,
                    PublicId = "1f64c850"
                },
                new Product
                {
                    Name = "Cell Tech Creatine 2.27kg",
                    Description =
                        "10g kreatinë per servim për të mbështetur muskulin e dobet dhe për të rritur forcën (5 gram creatin monohidrate 5 gram creatine citrate).",
                    Price = 1000,
                    PictureURL = "https://res.cloudinary.com/diaj9lrnn/image/upload/v1705254450/ohgmbboge4vm1kn8ssz0.jpg",
                    Brand = "MuscleTech",
                    Type = "Creatine",
                    QuantityInStock = 100,
                    PublicId = "2b61f4d6"
                },
                new Product
                {
                    Name = "Muscletech Iso Whey Clear",
                    Description =
                        "22g proteinë ultra, 0% sheqer, 0% yndyrë, në një formulë më të lehtë, më të pastër me aromë frutash në një përzierje të ngjashme me lëngun – për një pije të shijshme dhe freskuese.",
                    Price = 7600,
                    PictureURL = "https://res.cloudinary.com/diaj9lrnn/image/upload/v1705254549/vktzn3f02gsfj3kcy4kk.png",
                    Brand = "MuscleTech",
                    Type = "Whey",
                    QuantityInStock = 100,
                    PublicId = "b994e7b6"
                },
                new Product
                {
                    Name = "Muscletech Shatter Pre-Workout",
                    Description =
                        "Energy Booster",
                    Price = 1500,
                    PictureURL = "https://res.cloudinary.com/diaj9lrnn/image/upload/v1705254815/npwnxbgaxyywr5mtqepp.png",
                    Brand = "MuscleTech",
                    Type = "Pre-Workout",
                    QuantityInStock = 100,
                    PublicId = "30361a28"
                },
                new Product
                {
                    Name = "OPTIMUM NUTRITION PLANT PRE WORKOUT",
                    Description =
                        "Energy Booster",
                    Price = 1800,
                    PictureURL = "https://res.cloudinary.com/diaj9lrnn/image/upload/v1705254891/kvvtvbnkweddyf7pwvgh.png",
                    Brand = "Optimum Nutrition",
                    Type = "Pre-Workout",
                    QuantityInStock = 100,
                    PublicId = "a21344a3"
                },
                new Product
                {
                    Name = "C4 Original 60 Servings",
                    Description =
                        "Energji shperthyese dhe perfomance e larte per shkake te sasis se kafeines dhe aminoacideve kryesore si arginine ,beta alanine ,citruline.",
                    Price = 1500,
                    PictureURL = "https://res.cloudinary.com/diaj9lrnn/image/upload/v1705254373/cdp1nvopa22hurqa0kl0.png",
                    Brand = "Cellucor",
                    Type = "Pre-Workout",
                    QuantityInStock = 100,
                    PublicId = "133b9c03"
                },
                new Product
                {
                    Name = "Myobuild Amino-Bcaa",
                    Description =
                        "Bcaa i avancuar që ndërton 4x më shumë muskuj. Përmirëson qëndrueshmërinë si dhe ka elektrolite të shtuara",
                    Price = 1600,
                    PictureURL = "https://res.cloudinary.com/diaj9lrnn/image/upload/v1705254222/oykpobbj4sdwyocbrpba.png",
                    Brand = "MuscleTech",
                    Type = "Amino-Acide",
                    QuantityInStock = 100,
                    PublicId = "a49977f38851 "
                },
                new Product
                {
                    Name = "EAA ENERGY",
                    Description =
                        "Supports Energy Focus & Essential Amino Acid Intake.",
                    Price = 1400,
                    PictureURL = "https://res.cloudinary.com/diaj9lrnn/image/upload/v1705254750/onzfcjjbnfqjpbaqlkws.png",
                    Brand = "Optimum Nutrition",
                    Type = "Amino-Acide",
                    QuantityInStock = 100,
                    PublicId = "fbdf5afd"
                },
                new Product
                {
                    Name = "Opti-Men Tablets",
                    Description =
                        "Opti-Men është një multi-vitamin gjithëpërfshirës i optimizimit të ushqyesve që ofron 75+ përbërës aktivë në 4 përzierje të krijuara posaçërisht për të mbështetur nevojat ushqyese të meshkujve aktiv. Nje sevim përfshin aminoacide të formës së lirë, vitamina antioksiduese, minerale thelbësore dhe ekstrakte botanike në sasi themelore që mund të ndërtohen përmes konsumimit të një diete të ekuilibruar të shëndetshme.",
                    Price = 25000,
                    PictureURL = "https://res.cloudinary.com/diaj9lrnn/image/upload/v1705254243/m1myqnjz5fono0jmczew.jpg",
                    Brand = "Optimum Nutrition",
                    Type = "Vitamins",
                    QuantityInStock = 100,
                    PublicId = "af09444f0ea2 "
                }, 
            };

            foreach (var product in products)
            {
                context.Products.Add(product);
            }

            context.SaveChanges();
        }
    }
}
