import { NextResponse } from 'next/server';

const products = [
    {
        id: 10,
        name: "Phone Case",
        price: 199.0,
        category: "Accessories",
        keywords: ["case", "phone", "protective"],
        createdBy: 1,
        createdAt: "2026-02-06 05:30:00"
    },
    {
        id: 11,
        name: "Wireless Mouse",
        price: 899.0,
        category: "Electronics",
        keywords: ["mouse", "wireless", "usb"],
        createdBy: 1,
        createdAt: "2026-02-06 05:31:00"
    },
    {
        id: 12,
        name: "Mechanical Keyboard",
        price: 1299.0,
        category: "Electronics",
        keywords: ["keyboard", "gaming", "rgb"],
        createdBy: 1,
        createdAt: "2026-02-06 05:32:00"
    },
    {
        id: 13,
        name: "USB-C Hub",
        price: 450.0,
        category: "Accessories",
        keywords: ["usb", "hub", "connector"],
        createdBy: 1,
        createdAt: "2026-02-06 05:33:00"
    }
];

export async function GET() {
    return NextResponse.json({ products });
}

export async function POST(request: Request) {
    const body = await request.json();
    const newProduct = {
        id: Math.floor(Math.random() * 10000) + 20,
        ...body,
        createdAt: new Date().toISOString()
    };
    return NextResponse.json({ product: newProduct }, { status: 201 });
}
