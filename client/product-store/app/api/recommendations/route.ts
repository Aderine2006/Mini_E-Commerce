import { NextResponse } from 'next/server';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
        return NextResponse.json({ error: 'Missing userId' }, { status: 400 });
    }

    // Simulate AI processing delay
    await new Promise(resolve => setTimeout(resolve, 800));

    return NextResponse.json({
        products: [
            {
                id: 21,
                name: "Mouse Pad",
                price: 199.0,
                category: "Accessories",
                keywords: ["mousepad", "desk", "gaming"],
                createdBy: 1,
                createdAt: "2026-02-06 05:40:00"
            },
            {
                id: 22,
                name: "USB Hub",
                price: 499.0,
                category: "Accessories",
                keywords: ["usb", "hub", "laptop"],
                createdBy: 1,
                createdAt: "2026-02-06 05:41:00"
            },
            {
                id: 23,
                name: "Keyboard Wrist Rest",
                price: 299.0,
                category: "Accessories",
                keywords: ["keyboard", "ergonomic", "wrist"],
                createdBy: 1,
                createdAt: "2026-02-06 05:42:00"
            }
        ]
    });
}
