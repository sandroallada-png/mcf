
'use client';

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { useUser, useFirebase, useDoc, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import type { UserProfile } from '@/lib/types';

interface ReadOnlyContextValue {
    /** True si l'utilisateur est un membre de famille (lecture seule) */
    isReadOnly: boolean;
    /** Nom du chef de famille, si disponible */
    chefName: string | null;
    /** True quand le modal de restriction est visible */
    isBlocked: boolean;
    /** Déclenche l'affichage du modal de restriction */
    triggerBlock: () => void;
    /** Ferme le modal de restriction */
    dismissBlock: () => void;
    /** Wrapper de handler : si readOnly, bloque + ouvre modal. Sinon, exécute l'action. */
    guardAction: <T extends any[]>(fn: (...args: T) => void) => (...args: T) => void;
}

const ReadOnlyContext = createContext<ReadOnlyContextValue>({
    isReadOnly: false,
    chefName: null,
    isBlocked: false,
    triggerBlock: () => { },
    dismissBlock: () => { },
    guardAction: (fn) => fn,
});

export function ReadOnlyProvider({ children }: { children: React.ReactNode }) {
    const { user } = useUser();
    const { firestore } = useFirebase();

    const userProfileRef = useMemoFirebase(
        () => (user ? doc(firestore, 'users', user.uid) : null),
        [user, firestore]
    );
    const { data: userProfile } = useDoc<UserProfile>(userProfileRef);

    const chefProfileRef = useMemoFirebase(
        () => (userProfile?.chefId ? doc(firestore, 'users', userProfile.chefId) : null),
        [userProfile, firestore]
    );
    const { data: chefProfile } = useDoc<UserProfile>(chefProfileRef);

    const [isBlocked, setIsBlocked] = useState(false);

    const isReadOnly = !!userProfile?.chefId;
    const chefName = chefProfile?.name || null;

    const triggerBlock = useCallback(() => {
        setIsBlocked(true);
    }, []);

    const dismissBlock = useCallback(() => {
        setIsBlocked(false);
    }, []);

    const guardAction = useCallback(
        <T extends any[]>(fn: (...args: T) => void) =>
            (...args: T) => {
                if (isReadOnly) {
                    setIsBlocked(true);
                    return;
                }
                fn(...args);
            },
        [isReadOnly]
    );

    return (
        <ReadOnlyContext.Provider value={{ isReadOnly, chefName, isBlocked, triggerBlock, dismissBlock, guardAction }}>
            {children}
        </ReadOnlyContext.Provider>
    );
}

export function useReadOnly() {
    return useContext(ReadOnlyContext);
}
