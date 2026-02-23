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
//  Routes admin : invisibles pour tout le monde sauf les admins.
//  Si un non-admin y accède → 404 (page inexistante aux yeux du monde)
// ─────────────────────────────────────────────────────────────────
const ADMIN_ROUTES = ['/admin'];

// Cookie inscrit par l'AuthProvider côté client dès que l'utilisateur
// est authentifié. Sa valeur vaut 'admin' pour les admins, 'user' sinon.
const AUTH_COOKIE = 'mcf_auth';

// Réponse 404 : identique à une page qui n'existe pas
// → Impossible pour un attaquant de distinguer /admin/users de /quelquechose-inexistant
function notFound(): NextResponse {
    return new NextResponse(null, { status: 404 });
}

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
    // Règle : pour tout le monde qui n'est pas admin confirmé,
    //         la route n'existe tout simplement pas (404).
    //         Aucune redirection ne trahit l'existence de la page.
    if (isAdminRoute(pathname)) {
        if (isAdmin) {
            // Admin confirmé → accès autorisé
            return NextResponse.next();
        }
        // Non connecté OU connecté sans droits admin → 404 silencieux
        // Le pirate ne peut pas distinguer ça d'une route qui n'existe pas.
        return notFound();
    }

    // ── Route protégée (non publique, non admin) ──────────────────────
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
