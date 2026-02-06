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

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const product = products.find(p => p.id === parseInt(id));

    if (product) {
        return NextResponse.json({ product });
    }

    return NextResponse.json({ message: "Product not found" }, { status: 404 });
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const productId = parseInt(id);
    const body = await request.json();
    const index = products.findIndex(p => p.id === productId);

    if (index > -1) {
        products[index] = { ...products[index], ...body };
        return NextResponse.json({ product: products[index] });
    }

    return NextResponse.json({ message: "Product not found" }, { status: 404 });
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const productId = parseInt(id);
    const index = products.findIndex(p => p.id === productId);

    if (index > -1) {
        products.splice(index, 1);
        return NextResponse.json({ ok: true });
    }

    return NextResponse.json({ message: "Product not found" }, { status: 404 });
}
