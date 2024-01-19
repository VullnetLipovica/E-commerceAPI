using E_commerceAPI.Entities;

namespace E_commerceAPI.Extensions
{
    // Klasa e ProductExtensions përmban metodat për filtrimin dhe renditjen e produkteve
    public static class ProductExtensions
    {
        // Metoda Sort kthen një IQueryable të produkteve duke i aplikuar një renditje sipas orderBy
        public static IQueryable<Product> Sort(this IQueryable<Product> query, string orderBy)
        {
            // Nëse orderBy është bosh ose null, renditja bëhet sipas emrit të produktit në mënyrë ascendente
            if (string.IsNullOrWhiteSpace(orderBy)) return query.OrderBy(p => p.Name);

            // Renditja bëhet sipas parametrit orderBy duke përdorur switch
            query = orderBy switch
            {
                "price" => query.OrderBy(p => p.Price),         // Renditja sipas çmimit në mënyrë ascendente
                "priceDesc" => query.OrderByDescending(p => p.Price),  // Renditja sipas çmimit në mënyrë zbritëse
                _ => query.OrderBy(n => n.Name)                 // Në rast se orderBy nuk është një opsion i njohur, renditja bëhet sipas emrit në mënyrë ascendente
            };

            return query;
        }

        // Metoda Search kthen një IQueryable të produkteve duke i aplikuar një kërkim sipas searchTerm
        public static IQueryable<Product> Search(this IQueryable<Product> query, string searchTerm)
        {
            // Nëse searchTerm është bosh ose null, kërkimi nuk bëhet dhe kthehet query origjinale
            if (string.IsNullOrEmpty(searchTerm)) return query;

            // Konvertohet searchTerm në lower case për një kërkim case-insensitive
            var lowerCaseSearchTerm = searchTerm.Trim().ToLower();

            // Filtrimi bëhet duke kërkuar në emrat e produkteve në mënyrë case-insensitive
            return query.Where(p => p.Name.ToLower().Contains(lowerCaseSearchTerm));
        }

        // Metoda Filter kthen një IQueryable të produkteve duke i aplikuar filtrim sipas brand-ave dhe type-ve
        public static IQueryable<Product> Filter(this IQueryable<Product> query, string brands, string types)
        {
            // Listat e brand-ave dhe type-ve
            var brandList = new List<string>();
            List<string> typeList = new();

            // Nëse brands nuk është bosh ose null, ndahen brand-et dhe shtohen në listë
            if (!string.IsNullOrEmpty(brands))
            {
                brandList.AddRange(brands.ToLower().Split(",").ToList());
            }

            // Nëse types nuk është bosh ose null, ndahen type-et dhe shtohen në listë
            if (!string.IsNullOrEmpty(types))
            {
                typeList.AddRange(types.ToLower().Split(",").ToList());
            }

            // Filtrimi bëhet duke përdorur Where për brand-et dhe type-et
            query = query.Where(p => brandList.Count == 0 || brandList.Contains(p.Brand.ToLower()));
            query = query.Where(p => typeList.Count == 0 || typeList.Contains(p.Type.ToLower()));

            return query;
        }
    }
}