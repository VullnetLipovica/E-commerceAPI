namespace E_commerceAPI.Entities
{
    // Klasa e Basket përmban informacionin për një shportë elektronike (Basket)
    public class Basket
    {
        // Id e shportës elektronike
        public int Id { get; set; }

        // BuyerId është një unik identifikues për blerësin e shportës
        public string BuyerId { get; set; }

        // Lista e elementeve (produkteve) të përfshira në shportë
        public List<BasketItem> Items { get; set; } = new List<BasketItem>();

        // Metoda AddItem shton një produkt në shportë me sasinë e caktuar
        public void AddItem(Product product, int quantity)
        {
            // Nëse produkti nuk ekziston në shportë, shtohet një element i ri
            if (Items.All(item => item.ProductId != product.Id))
            {
                Items.Add(new BasketItem { Product = product, Quantity = quantity });
                return;
            }

            // Nëse produkti ekziston në shportë, shtohet sasia e re në elementin ekzistues
            var existingItem = Items.FirstOrDefault(item => item.ProductId == product.Id);
            if (existingItem != null) existingItem.Quantity += quantity;
        }

        // Metoda RemoveItem heq një sasi të caktuar të një produkti nga shporta
        public void RemoveItem(int productId, int quantity = 1)
        {
            // Gjen elementin e shportës për produktin e caktuar
            var item = Items.FirstOrDefault(basketItem => basketItem.ProductId == productId);
            if (item == null) return;

            // Zvogëlon sasinë e produktit në shportë
            item.Quantity -= quantity;

            // Nëse sasia bëhet 0, heqet elementi nga lista e produkteve në shportë
            if (item.Quantity == 0) Items.Remove(item);
        }
    }
}
