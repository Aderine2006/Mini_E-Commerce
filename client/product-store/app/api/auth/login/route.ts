import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    const body = await request.json();
    const { email, password } = body;

    // Mock Login logic
    if (email === 'admin@example.com' && password === 'password123') {
        return NextResponse.json({
            token: 'mock-jwt-token-123456',
            user: { id: 1, email: 'admin@example.com', role: 'admin' }
        });
    }

    // Accept any other user for demo purposes
    // strict check for demo
    if (email === 'user@example.com' && password === 'password123') {
        return NextResponse.json({
            token: 'mock-jwt-token-user-' + Date.now(),
            user: { id: 2, email, role: 'user' }
        });
    }

    return NextResponse.json({ message: 'Invalid credentials' }, { status: 401 });
}
