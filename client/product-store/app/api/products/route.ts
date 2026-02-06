// Update imports to include NextRequest
import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const DATA_FILE_PATH = path.join(process.cwd(), 'products.json');

const initialProducts: any[] = [
    {
        id: 10,
        name: "Phone Case",
        price: 199.0,
        category: "Accessories",
        keywords: ["case", "phone", "protective"],
        images: ["https://images.unsplash.com/photo-1586232702178-f044c5f4d4b7?w=500&q=80"],
        createdBy: 1,
        createdAt: "2026-02-06 05:30:00"
    },
    {
        id: 11,
        name: "Wireless Mouse",
        price: 899.0,
        category: "Electronics",
        keywords: ["mouse", "wireless", "usb"],
        images: ["https://images.unsplash.com/photo-1527814050087-3793815479db?w=500&q=80"],
        createdBy: 1,
        createdAt: "2026-02-06 05:31:00"
    },
    {
        id: 12,
        name: "Mechanical Keyboard",
        price: 1299.0,
        category: "Electronics",
        keywords: ["keyboard", "gaming", "rgb"],
        images: ["https://images.unsplash.com/photo-1587829741301-308231f890f0?w=500&q=80"],
        createdBy: 1,
        createdAt: "2026-02-06 05:32:00"
    },
    {
        id: 13,
        name: "USB-C Hub",
        price: 450.0,
        category: "Accessories",
        keywords: ["usb", "hub", "connector"],
        images: [],
        createdBy: 1,
        createdAt: "2026-02-06 05:33:00"
    }
];

// Helper to read data
function getProducts() {
    try {
        if (!fs.existsSync(DATA_FILE_PATH)) {
            fs.writeFileSync(DATA_FILE_PATH, JSON.stringify(initialProducts, null, 2));
            return initialProducts;
        }
        const fileData = fs.readFileSync(DATA_FILE_PATH, 'utf8');
        return JSON.parse(fileData);
    } catch (error) {
        return initialProducts;
    }
}

// Helper to save data
function saveProducts(products: any[]) {
    try {
        fs.writeFileSync(DATA_FILE_PATH, JSON.stringify(products, null, 2));
    } catch (error) {
        console.error('Failed to save products', error);
    }
}

export async function GET(request: NextRequest) {
    const products = getProducts();
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get('search')?.toLowerCase();

    if (query) {
        const filteredProducts = products.filter((p: any) =>
            p.name.toLowerCase().includes(query) ||
            p.category.toLowerCase().includes(query) ||
            p.keywords.some((k: string) => k.toLowerCase().includes(query))
        );
        return NextResponse.json({ products: filteredProducts });
    }

    return NextResponse.json({ products });
}

export async function POST(request: Request) {
    const products = getProducts();
    const body = await request.json();
    const newProduct = {
        id: Math.floor(Math.random() * 10000) + 20,
        ...body,
        images: body.images || [],
        createdAt: new Date().toISOString()
    };
    products.push(newProduct);
    saveProducts(products);
    return NextResponse.json({ product: newProduct }, { status: 201 });
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
    const products = getProducts();
    const { id } = await params;
    const body = await request.json();
    const productId = Number(id);
    const index = products.findIndex((p: any) => p.id === productId);

    if (index === -1) {
        return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    products[index] = { ...products[index], ...body };
    saveProducts(products);
    return NextResponse.json({ product: products[index] });
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
    const products = getProducts();
    const { id } = await params;
    const productId = Number(id);
    const index = products.findIndex((p: any) => p.id === productId);

    if (index === -1) {
        return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    products.splice(index, 1);
    saveProducts(products);
    return NextResponse.json({ ok: true });
}
