export const getApiUrl = (path: string) => {
    // Si on est dans Capacitor, on appelle ton serveur Vercel
    // Si on est sur le web, on utilise le chemin relatif
    const baseUrl = typeof window !== 'undefined' && (window as any).Capacitor 
        ? 'https://my-cook-flex.vercel.app' 
        : '';
    
    return `${baseUrl}${path}`;
};
