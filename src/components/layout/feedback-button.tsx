'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { MessageSquarePlus, Send, Loader2 } from 'lucide-react';
import { useUser, useFirebase, addDocumentNonBlocking } from '@/firebase';
import { collection, serverTimestamp } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { usePathname } from 'next/navigation';

export function FeedbackButton() {
  const { user } = useUser();
  const { firestore } = useFirebase();
  const { toast } = useToast();
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!user || !comment.trim()) return;

    setIsSubmitting(true);
    try {
      const feedbackCollection = collection(firestore, 'feedbacks');
      await addDocumentNonBlocking(feedbackCollection, {
        userId: user.uid,
        userName: user.displayName || 'Anonyme',
        rating: 0, // Neutral rating for general feedback/bug report
        comment: comment,
        page: pathname,
        status: 'new',
        createdAt: serverTimestamp(),
      });
      toast({
        title: 'Merci pour votre retour !',
        description: "Nous l'examinerons attentivement.",
      });
      setComment('');
      setIsOpen(false);
    } catch (error) {
      console.error('Failed to submit feedback:', error);
      toast({
        variant: 'destructive',
        title: 'Erreur',
        description: 'Impossible d\'envoyer votre retour. Veuillez réessayer.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!user || pathname.startsWith('/admin')) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant="default"
          className="fixed top-32 right-0 z-50 h-16 w-6 md:h-24 md:w-8 rounded-l-xl rounded-r-none shadow-[-2px_4px_12px_rgba(0,0,0,0.15)] flex flex-col items-center justify-center gap-1 md:gap-2 p-0 hover:w-7 md:hover:w-10 transition-all duration-300 bg-primary/90 hover:bg-primary border-l border-y border-white/20"
          aria-label="Laisser un avis"
        >
          <span className="text-[8px] md:text-[10px] font-bold tracking-widest uppercase -rotate-90 whitespace-nowrap">Avis</span>
          <MessageSquarePlus className="h-3 w-3 md:h-4 md:w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Partagez votre avis ou signalez un problème</DialogTitle>
          <DialogDescription>
            Vos retours sont essentiels pour nous aider à améliorer My Cook Flex pendant cette phase bêta.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4 space-y-2">
          <Label htmlFor="feedback-comment">Votre message</Label>
          <Textarea
            id="feedback-comment"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Décrivez votre idée, votre bug ou simplement ce que vous pensez de l'application..."
            className="min-h-32"
          />
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="ghost">Annuler</Button>
          </DialogClose>
          <Button onClick={handleSubmit} disabled={isSubmitting || !comment.trim()}>
            {isSubmitting ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Send className="mr-2 h-4 w-4" />
            )}
            Envoyer
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
