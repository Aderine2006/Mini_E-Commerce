export interface Product {
    id: number;
    name: string;
    price: number;
    category: string;
    keywords: string[];
    createdBy?: number;
    createdAt?: string;
}

export interface CartItem {
    product: Product;
    quantity: number;
}
