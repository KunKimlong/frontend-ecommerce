// src/middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Define route categories
const PUBLIC_ROUTES = ['/signin', '/signup', '/forgot-password', '/reset-password'];
const API_AUTH_ROUTES = ['/api/auth/login', '/api/auth/register', '/api/auth/logout'];
const STATIC_ROUTES = ['/_next', '/favicon.ico', '/robots.txt', '/sitemap.xml'];

/**
 * Check if the path matches static assets
 */
function isStaticAsset(pathname: string): boolean {
    return (
        STATIC_ROUTES.some(route => pathname.startsWith(route)) ||
        pathname.match(/\.(png|jpg|jpeg|gif|svg|webp|ico|woff|woff2|eot|ttf|otf|css|js|map)$/i) !== null
    );
}

/**
 * Check if the path is a public route
 */
function isPublicRoute(pathname: string): boolean {
    return PUBLIC_ROUTES.some(route => pathname.startsWith(route));
}

/**
 * Check if the path is a public API route (doesn't require auth)
 */
function isPublicApiRoute(pathname: string): boolean {
    return API_AUTH_ROUTES.some(route => pathname.startsWith(route));
}

/**
 * Verify JWT token (basic check - you can make this more robust)
 */
function isValidToken(token: string): boolean {
    if (!token) return false;

    try {
        const parts = token.split('.');
        if (parts.length !== 3) return false;

        const payload = JSON.parse(atob(parts[1]));

        if (payload.exp) {
            const now = Math.floor(Date.now() / 1000);
            if (payload.exp < now) {
                console.log('Token expired');
                return false;
            }
        }

        return true;
    } catch (error) {
        console.error('Token validation error:', error);
        return false;
    }
}

export async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;
    const token = request.cookies.get('token')?.value;

    if (process.env.NODE_ENV === 'development') {
        console.log(`[Middleware] ${request.method} ${pathname} | Token: ${token ? '✓' : '✗'}`);
    }

    if (isStaticAsset(pathname)) {
        return NextResponse.next();
    }

    if (isPublicApiRoute(pathname)) {
        return NextResponse.next();
    }

    if (isPublicRoute(pathname)) {
        if (token && isValidToken(token)) {
            console.log('[Middleware] User already authenticated, redirecting to home');
            return NextResponse.redirect(new URL('/', request.url));
        }
        return NextResponse.next();
    }

    if (pathname.startsWith('/api/')) {
        if (!token || !isValidToken(token)) {
            console.log('[Middleware] Unauthorized API access');
            return NextResponse.json(
                { error: 'Unauthorized', message: 'Please login to access this resource' },
                { status: 401 }
            );
        }
        return NextResponse.next();
    }

    if (!token || !isValidToken(token)) {
        console.log('[Middleware] No valid token, redirecting to signin');
        const response = NextResponse.redirect(new URL('/signin', request.url));

        if (token) {
            response.cookies.delete('token');
            response.cookies.delete('refreshToken');
        }

        return response;
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        '/((?!_next/static|_next/image|favicon.ico).*)',
    ],
};
