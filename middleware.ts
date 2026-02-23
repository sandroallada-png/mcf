import { NextRequest, NextResponse } from 'next/server';

// ─────────────────────────────────────────────────────────────────
//  Routes publiques : accessibles SANS être connecté
// ─────────────────────────────────────────────────────────────────
const PUBLIC_ROUTES = [
    '/',
    '/login',
    '/register',
    '/forgot-password',
    '/reset-password',
    '/about',
    '/support',
    '/market',
    '/forum',
    '/terms',
    '/privacy',
    '/join-family',
    '/offline',
];

// ─────────────────────────────────────────────────────────────────
//  Routes admin : réservées aux administrateurs
// ─────────────────────────────────────────────────────────────────
const ADMIN_ROUTES = ['/admin'];

// Cookie inscrit par l'AuthProvider côté client dès que l'utilisateur
// est authentifié. Sa valeur vaut 'admin' pour les admins, 'user' sinon.
const AUTH_COOKIE = 'mcf_auth';

function isPublic(pathname: string): boolean {
    return PUBLIC_ROUTES.some(
        (route) => pathname === route || pathname.startsWith(route + '/')
    );
}

function isAdminRoute(pathname: string): boolean {
    return ADMIN_ROUTES.some(
        (route) => pathname === route || pathname.startsWith(route + '/')
    );
}

export function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // Laisser passer les ressources statiques / API
    if (
        pathname.startsWith('/_next') ||
        pathname.startsWith('/api') ||
        pathname.startsWith('/static') ||
        pathname.match(/\.(.*)$/) // fichiers avec extension
    ) {
        return NextResponse.next();
    }

    const authCookie = request.cookies.get(AUTH_COOKIE)?.value; // 'admin' | 'user' | undefined

    const isAuthenticated = !!authCookie;
    const isAdmin = authCookie === 'admin';

    // ── Route Admin ──────────────────────────────────────────────────
    if (isAdminRoute(pathname)) {
        if (!isAuthenticated) {
            // Non connecté → login
            const url = request.nextUrl.clone();
            url.pathname = '/login';
            return NextResponse.redirect(url);
        }
        if (!isAdmin) {
            // Connecté mais pas admin → dashboard
            const url = request.nextUrl.clone();
            url.pathname = '/dashboard';
            return NextResponse.redirect(url);
        }
        // Admin confirmé → OK
        return NextResponse.next();
    }

    // ── Route protégée (non publique) ────────────────────────────────
    if (!isPublic(pathname) && !isAuthenticated) {
        const url = request.nextUrl.clone();
        url.pathname = '/login';
        return NextResponse.redirect(url);
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        /*
         * Correspond à tout sauf :
         * - _next/static (fichiers statiques)
         * - _next/image (optimisation d'images)
         * - favicon.ico, images, manifestes PWA
         */
        '/((?!_next/static|_next/image|favicon.ico|manifest.json|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|mp4|wav|woff|woff2|ttf|otf)).*)',
    ],
};
