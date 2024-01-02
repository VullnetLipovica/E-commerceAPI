export interface Product {
    id: number,
    name: string,
    description: string,
    pictureURL: string,
    price: number,
    brand: string,
    type?: string,
    quantityInStock?: number
}