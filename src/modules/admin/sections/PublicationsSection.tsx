'use client';

import { useState, useMemo } from 'react';
import { useFirebase, useCollection, useMemoFirebase } from '@/firebase';
import { collection, doc } from 'firebase/firestore';
import { updateDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { Loader2, CheckCircle, XCircle, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import type { Publication } from '@/lib/types';
import { Badge } from '@/components/ui/badge';
import Image from 'next/image';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

export function PublicationsSection() {
  const { firestore } = useFirebase();
  const { toast } = useToast();
  
  const publicationsCollectionRef = useMemoFirebase(() => collection(firestore, 'publications'), [firestore]);
  const { data: publications, isLoading: isLoadingPublications } = useCollection<Publication>(publicationsCollectionRef);

  const [activeTab, setActiveTab] = useState('pending');
  const [isUpdating, setIsUpdating] = useState<string | null>(null);

  const filteredPublications = useMemo(() => {
    if (!publications) return [];
    return publications.filter(p => p.status === activeTab);
  }, [publications, activeTab]);

  const handleUpdateStatus = async (publicationId: string, newStatus: 'approved' | 'rejected') => {
    setIsUpdating(publicationId);
    const pubDocRef = doc(firestore, 'publications', publicationId);
    try {
      await updateDocumentNonBlocking(pubDocRef, { status: newStatus });
      toast({
        title: "Statut mis à jour",
        description: `La publication a été ${newStatus === 'approved' ? 'approuvée' : 'rejetée'}.`,
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de mettre à jour le statut.",
      });
    } finally {
      setIsUpdating(null);
    }
  };

  if (isLoadingPublications) {
    return (
      <div className="flex w-full items-center justify-center p-12">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Modération du contenu</CardTitle>
        <CardDescription>Approuvez ou rejetez les recettes et guides soumis par les utilisateurs.</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="pending">En attente</TabsTrigger>
            <TabsTrigger value="approved">Approuvées</TabsTrigger>
            <TabsTrigger value="rejected">Rejetées</TabsTrigger>
          </TabsList>
          <Table className="mt-4">
            <TableHeader>
              <TableRow>
                <TableHead>Titre</TableHead>
                <TableHead>Auteur</TableHead>
                <TableHead>Catégorie</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPublications.length > 0 ? (
                filteredPublications.map((pub) => (
                  <TableRow key={pub.id}>
                    <TableCell className="font-medium flex items-center gap-3">
                      <Image src={pub.imageUrl} alt={pub.title} width={48} height={48} className="rounded-md object-cover aspect-square" />
                      {pub.title}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={pub.authorAvatar} />
                          <AvatarFallback>{pub.authorName.charAt(0)}</AvatarFallback>
                        </Avatar>
                        {pub.authorName}
                      </div>
                    </TableCell>
                    <TableCell><Badge variant="secondary" className="capitalize">{pub.category}</Badge></TableCell>
                    <TableCell>{pub.createdAt ? format(pub.createdAt.toDate(), 'd MMM yyyy', { locale: fr }) : 'N/A'}</TableCell>
                    <TableCell className="text-right">
                      {pub.status === 'pending' && (
                        <>
                          <Button variant="ghost" size="sm" onClick={() => handleUpdateStatus(pub.id, 'approved')} disabled={isUpdating === pub.id}>
                            {isUpdating === pub.id ? <Loader2 className="h-4 w-4 animate-spin"/> : <CheckCircle className="h-4 w-4 text-green-500" />}
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => handleUpdateStatus(pub.id, 'rejected')} disabled={isUpdating === pub.id}>
                            {isUpdating === pub.id ? <Loader2 className="h-4 w-4 animate-spin"/> : <XCircle className="h-4 w-4 text-red-500" />}
                          </Button>
                        </>
                      )}
                      {pub.status === 'approved' && (
                           <Button variant="ghost" size="sm" onClick={() => handleUpdateStatus(pub.id, 'rejected')} disabled={isUpdating === pub.id}>
                              {isUpdating === pub.id ? <Loader2 className="h-4 w-4 animate-spin"/> : <XCircle className="h-4 w-4 text-red-500" />}
                          </Button>
                      )}
                       {pub.status === 'rejected' && (
                           <Button variant="ghost" size="sm" onClick={() => handleUpdateStatus(pub.id, 'approved')} disabled={isUpdating === pub.id}>
                              {isUpdating === pub.id ? <Loader2 className="h-4 w-4 animate-spin"/> : <CheckCircle className="h-4 w-4 text-green-500" />}
                          </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center">
                    Aucune publication dans cette catégorie.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </Tabs>
      </CardContent>
    </Card>
  );
}
