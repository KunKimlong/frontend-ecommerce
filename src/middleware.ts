// src/middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// ============================================================================
// CONFIGURATION
// ============================================================================

const PUBLIC_ROUTES = [
    '/signin',
    '/signup',
    '/forgot-password',
    '/reset-password',
    '/verify-email',
    '/terms',
    '/privacy'
];

const API_AUTH_ROUTES = [
    '/api/auth/login',
    '/api/auth/register',
    '/api/auth/logout',
    '/api/auth/refresh',
    '/api/auth/verify'
];

const STATIC_EXTENSIONS = [
    'png', 'jpg', 'jpeg', 'gif', 'svg', 'webp', 'ico',
    'woff', 'woff2', 'eot', 'ttf', 'otf',
    'css', 'js', 'map', 'json'
];

const COOKIE_NAMES = {
    ACCESS_TOKEN: 'authToken',      // Changed to match your backend
    REFRESH_TOKEN: 'refreshToken'
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Check if the path is a static asset
 */
function isStaticAsset(pathname: string): boolean {
    // Check if it starts with static prefixes
    if (pathname.startsWith('/_next') ||
        pathname.startsWith('/static') ||
        pathname === '/favicon.ico' ||
        pathname === '/robots.txt' ||
        pathname === '/sitemap.xml') {
        return true;
    }

    // Check file extension
    const extension = pathname.split('.').pop()?.toLowerCase();
    return extension ? STATIC_EXTENSIONS.includes(extension) : false;
}

/**
 * Check if the path is a public route
 */
function isPublicRoute(pathname: string): boolean {
    return PUBLIC_ROUTES.some(route =>
        pathname === route || pathname.startsWith(`${route}/`)
    );
}

/**
 * Check if the path is a public API route
 */
function isPublicApiRoute(pathname: string): boolean {
    return API_AUTH_ROUTES.some(route => pathname.startsWith(route));
}

/**
 * Verify JWT token structure and expiration
 */
function isValidToken(token: string | undefined): boolean {
    if (!token || token.trim() === '') return false;

    try {
        // Split JWT into parts
        const parts = token.split('.');
        if (parts.length !== 3) {
            console.warn('[Middleware] Invalid JWT format');
            return false;
        }

        // Decode payload
        const payload = JSON.parse(
            Buffer.from(parts[1], 'base64').toString('utf-8')
        );

        // Check expiration
        if (payload.exp) {
            const now = Math.floor(Date.now() / 1000);
            if (payload.exp < now) {
                console.log('[Middleware] Token expired');
                return false;
            }
        }

        // Optional: Check other claims (issuer, audience, etc.)
        // if (payload.iss !== 'your-issuer') return false;

        return true;
    } catch (error) {
        console.error('[Middleware] Token validation error:', error);
        return false;
    }
}

/**
 * Create a redirect response with optional cookie cleanup
 */
function createRedirect(
    url: string,
    request: NextRequest,
    clearCookies: boolean = false
): NextResponse {
    const response = NextResponse.redirect(new URL(url, request.url));

    if (clearCookies) {
        response.cookies.delete(COOKIE_NAMES.ACCESS_TOKEN);
        response.cookies.delete(COOKIE_NAMES.REFRESH_TOKEN);
    }

    return response;
}

/**
 * Create an unauthorized API response
 */
function createUnauthorizedResponse(message: string = 'Unauthorized'): NextResponse {
    return NextResponse.json(
        {
            success: false,
            error: 'Unauthorized',
            message
        },
        { status: 401 }
    );
}

/**
 * Log middleware activity (only in development)
 */
function logMiddleware(request: NextRequest, token: string | undefined, action: string) {
    if (process.env.NODE_ENV === 'development') {
        console.log(
            `[Middleware] ${request.method} ${request.nextUrl.pathname} | ` +
            `Token: ${token ? '✓' : '✗'} | Action: ${action}`
        );
    }
}

// ============================================================================
// MAIN MIDDLEWARE FUNCTION
// ============================================================================

export async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;
    const token = request.cookies.get(COOKIE_NAMES.ACCESS_TOKEN)?.value;

    // ========================================================================
    // 1. SKIP STATIC ASSETS
    // ========================================================================
    if (isStaticAsset(pathname)) {
        return NextResponse.next();
    }

    // ========================================================================
    // 2. ALLOW PUBLIC API ROUTES (auth endpoints)
    // ========================================================================
    if (isPublicApiRoute(pathname)) {
        logMiddleware(request, token, 'Public API - Allowed');
        return NextResponse.next();
    }

    // ========================================================================
    // 3. HANDLE PUBLIC ROUTES (signin, signup, etc.)
    // ========================================================================
    if (isPublicRoute(pathname)) {
        // If user is already authenticated, redirect to home
        if (token && isValidToken(token)) {
            logMiddleware(request, token, 'Already authenticated - Redirect to home');
            return createRedirect('/', request);
        }

        logMiddleware(request, token, 'Public route - Allowed');
        return NextResponse.next();
    }

    // ========================================================================
    // 4. PROTECT API ROUTES (require authentication)
    // ========================================================================
    if (pathname.startsWith('/api/')) {
        if (!token || !isValidToken(token)) {
            logMiddleware(request, token, 'API unauthorized');
            return createUnauthorizedResponse('Please login to access this resource');
        }

        logMiddleware(request, token, 'API authenticated - Allowed');
        return NextResponse.next();
    }

    // ========================================================================
    // 5. PROTECT ALL OTHER ROUTES (require authentication)
    // ========================================================================
    if (!token || !isValidToken(token)) {
        logMiddleware(request, token, 'Unauthorized - Redirect to signin');
        return createRedirect('/signin', request, true);
    }

    // ========================================================================
    // 6. AUTHENTICATED - ALLOW ACCESS
    // ========================================================================
    logMiddleware(request, token, 'Authenticated - Allowed');

    // Optional: Add user info to headers for server components
    const response = NextResponse.next();

    // You can add custom headers here if needed
    // response.headers.set('x-user-authenticated', 'true');

    return response;
}

// ============================================================================
// MATCHER CONFIGURATION
// ============================================================================

export const config = {
    matcher: [
        /*
         * Match all request paths except:
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         */
        '/((?!_next/static|_next/image|favicon.ico).*)',
    ],
};