
'use client';

import { useState, useEffect } from 'react';
import { useFirebase } from '@/firebase';
import { collection, query, orderBy, onSnapshot, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Bug, Trash2, CheckCircle, Clock, AlertTriangle, Monitor, User, Globe } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface BugReport {
    id: string;
    errorCode: string;
    message: string;
    stack?: string;
    userId?: string;
    path: string;
    status: 'new' | 'resolved';
    createdAt: any;
    userAgent?: string;
}

export default function AdminBugsPage() {
    const { firestore } = useFirebase();
    const [bugs, setBugs] = useState<BugReport[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const q = query(collection(firestore, 'bugs'), orderBy('createdAt', 'desc'));
        
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const bugsData = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            })) as BugReport[];
            setBugs(bugsData);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [firestore]);

    const handleResolve = async (id: string, currentStatus: string) => {
        const newStatus = currentStatus === 'resolved' ? 'new' : 'resolved';
        await updateDoc(doc(firestore, 'bugs', id), { status: newStatus });
    };

    const handleDelete = async (id: string) => {
        if (confirm('Voulez-vous vraiment supprimer ce signalement ?')) {
            await deleteDoc(doc(firestore, 'bugs', id));
        }
    };

    return (
        <div className="p-6 space-y-6 max-w-7xl mx-auto">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-zinc-900 dark:text-white flex items-center gap-3">
                        <Bug className="h-8 w-8 text-orange-500" />
                        Signalements de Bugs
                    </h1>
                    <p className="text-zinc-500 dark:text-zinc-400 mt-1">
                        Suivi des erreurs rencontrées par les utilisateurs en temps réel.
                    </p>
                </div>
                <div className="flex gap-2">
                    <Badge variant="outline" className="px-4 py-1 text-sm rounded-full">
                        {bugs.length} bugs au total
                    </Badge>
                    <Badge variant="secondary" className="px-4 py-1 text-sm rounded-full bg-orange-500/10 text-orange-600 border-none">
                        {bugs.filter(b => b.status === 'new').length} non résolus
                    </Badge>
                </div>
            </div>

            <div className="grid gap-4">
                {loading ? (
                    <div className="p-20 text-center text-muted-foreground italic">Chargement des signalements...</div>
                ) : bugs.length === 0 ? (
                    <div className="p-20 text-center bg-zinc-50 dark:bg-zinc-900/50 rounded-3xl border-2 border-dashed border-zinc-200 dark:border-zinc-800">
                        <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4 opacity-20" />
                        <p className="text-zinc-500">Aucun bug signalé pour le moment. Tout va bien !</p>
                    </div>
                ) : (
                    bugs.map((bug) => (
                        <Card key={bug.id} className={`overflow-hidden rounded-2xl border-l-4 transition-all hover:shadow-md ${bug.status === 'resolved' ? 'border-l-green-500 opacity-60' : 'border-l-orange-500'}`}>
                            <CardContent className="p-0">
                                <div className="p-6 flex flex-col md:flex-row gap-6">
                                    {/* Info Header */}
                                    <div className="min-w-[140px] flex flex-col gap-2">
                                        <div className="text-xl font-mono font-bold text-orange-600 bg-orange-500/5 px-3 py-1 rounded-lg inline-block text-center border border-orange-200/20">
                                            {bug.errorCode}
                                        </div>
                                        <div className="text-[10px] text-zinc-400 uppercase tracking-tighter flex items-center gap-1">
                                            <Clock className="h-3 w-3" />
                                            {bug.createdAt?.toDate ? format(bug.createdAt.toDate(), 'PPp', { locale: fr }) : 'Date inconnue'}
                                        </div>
                                        <Badge variant={bug.status === 'resolved' ? 'outline' : 'default'} className={`text-[10px] uppercase font-bold justify-center ${bug.status === 'resolved' ? 'text-green-600 border-green-200' : 'bg-orange-500'}`}>
                                            {bug.status === 'resolved' ? 'Résolu' : 'Nouveau'}
                                        </Badge>
                                    </div>

                                    {/* Detailed Content */}
                                    <div className="flex-1 space-y-3">
                                        <div>
                                            <h3 className="font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                                                <AlertTriangle className="h-4 w-4 text-orange-400" />
                                                Détail technique (Secret)
                                            </h3>
                                            <p className="text-sm font-mono bg-zinc-50 dark:bg-zinc-900/80 p-3 rounded-xl border border-zinc-100 dark:border-zinc-800 mt-2 text-red-600 dark:text-red-400">
                                                {bug.message}
                                            </p>
                                        </div>

                                        <div className="flex flex-wrap gap-4 text-xs text-zinc-500">
                                            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-100 dark:bg-zinc-800 rounded-lg">
                                                <Globe className="h-3.5 w-3.5" />
                                                <span className="font-medium">Chemin :</span> {bug.path}
                                            </div>
                                            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-100 dark:bg-zinc-800 rounded-lg">
                                                <User className="h-3.5 w-3.5" />
                                                <span className="font-medium">User ID :</span> {bug.userId || 'Anonyme'}
                                            </div>
                                            {bug.userAgent && (
                                                <div className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-100 dark:bg-zinc-800 rounded-lg max-w-xs truncate">
                                                    <Monitor className="h-3.5 w-3.5" />
                                                    <span className="font-medium">Navigateur :</span> {bug.userAgent}
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex md:flex-col gap-2 justify-center">
                                        <Button 
                                            size="sm" 
                                            variant={bug.status === 'resolved' ? 'outline' : 'secondary'} 
                                            className="rounded-xl flex-1"
                                            onClick={() => handleResolve(bug.id, bug.status)}
                                        >
                                            {bug.status === 'resolved' ? 'Réouvrir' : 'Marquer résolu'}
                                        </Button>
                                        <Button 
                                            size="icon" 
                                            variant="ghost" 
                                            className="text-zinc-400 hover:text-red-500 rounded-xl"
                                            onClick={() => handleDelete(bug.id)}
                                        >
                                            <Trash2 className="h-5 w-5" />
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))
                )}
            </div>
        </div>
    );
}
