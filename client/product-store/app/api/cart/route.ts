import { NextResponse } from 'next/server';

// Temporary in-memory cart for demo (resets on server restart)
let cartItems: any[] = [];

export async function GET() {
    return NextResponse.json({ items: cartItems });
}

export async function POST(request: Request) {
    const body = await request.json();
    const { productId, quantity = 1 } = body;

    // Mock product data lookup
    const mockProduct = {
        id: productId,
        name: productId === 10 ? "Phone Case" : "Wireless Mouse",
        price: productId === 10 ? 199.0 : 899.0,
        category: "Electronics",
        keywords: ["mock"]
    };

    const existingItemIndex = cartItems.findIndex(item => item.product.id === productId);

    if (existingItemIndex > -1) {
        cartItems[existingItemIndex].quantity += quantity;
        if (cartItems[existingItemIndex].quantity <= 0) {
            cartItems.splice(existingItemIndex, 1);
        }
    } else if (quantity > 0) {
        cartItems.push({
            product: mockProduct,
            quantity
        });
    }

    return NextResponse.json({ ok: true }, { status: 201 });
}
