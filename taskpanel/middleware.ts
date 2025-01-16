import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { verifyToken } from './lib/auth-service'

export function middleware(request: NextRequest) {
    // Exclude auth endpoints and public paths
    if (request.nextUrl.pathname.startsWith('/api/auth')) {
        return NextResponse.next()
    }

    const token = request.headers.get('Authorization')?.replace('Bearer ', '')
    
    if (!token) {
        return new NextResponse(
            JSON.stringify({ message: 'Authentication required' }),
            { status: 401, headers: { 'content-type': 'application/json' } }
        )
    }

    const payload = verifyToken(token)
    if (!payload) {
        return new NextResponse(
            JSON.stringify({ message: 'Invalid token' }),
            { status: 401, headers: { 'content-type': 'application/json' } }
        )
    }

    return NextResponse.next()
}

export const config = {
    matcher: '/api/:path*',
}