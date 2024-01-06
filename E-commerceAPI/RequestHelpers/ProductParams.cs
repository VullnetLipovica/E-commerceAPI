namespace E_commerceAPI.RequestHelpers
{
    public class ProductParams : PaginationParams
    {
        public string OrderBy { get; set; } = "price";
        public string SearchTerm { get; set; } = "";
        public string Types { get; set; } = "";
        public string Brands { get; set; } = "";
    }
}
