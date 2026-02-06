import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    const body = await request.json();
    const { email, role } = body;

    return NextResponse.json({
        token: 'mock-jwt-token-' + Date.now(),
        user: {
            id: Math.floor(Math.random() * 1000),
            email,
            role: role || 'user'
        }
    }, { status: 201 });
}
