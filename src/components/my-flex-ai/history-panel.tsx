'use client';

import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { MessageSquare, Plus, Trash2, Loader2 } from "lucide-react";
import { useUser, useFirebase, useCollection, useMemoFirebase } from "@/firebase";
import { collection, query, orderBy } from "firebase/firestore";
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';

interface Conversation {
    id: string;
    title: string;
    createdAt: {
        seconds: number;
        nanoseconds: number;
    } | null;
}

interface HistoryPanelProps {
    onSelectConversation: (id: string | null) => void;
    activeConversationId: string | null;
}

export function HistoryPanel({ onSelectConversation, activeConversationId }: HistoryPanelProps) {
  const { user } = useUser();
  const { firestore } = useFirebase();

  const conversationsQuery = useMemoFirebase(
    () => user ? query(collection(firestore, `users/${user.uid}/conversations`), orderBy('createdAt', 'desc')) : null,
    [user, firestore]
  );
  
  const { data: conversations, isLoading } = useCollection<Conversation>(conversationsQuery);
  
  const formatDate = (timestamp: Conversation['createdAt']) => {
    if (!timestamp) return "À l'instant";
    const date = new Date(timestamp.seconds * 1000);
    return formatDistanceToNow(date, { addSuffix: true, locale: fr });
  };


  return (
    <div className="flex h-full flex-col p-4 md:p-6">
      <div className="flex items-center justify-between pb-4">
        <h2 className="text-lg font-semibold tracking-tight">Historique</h2>
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onSelectConversation(null)}>
            <Plus className="h-5 w-5" />
            <span className="sr-only">Nouvelle conversation</span>
        </Button>
      </div>
      <ScrollArea className="flex-1 -mx-4">
        <div className="px-4 space-y-2">
            {isLoading && (
                 <div className="flex justify-center items-center h-24">
                    <Loader2 className="h-6 w-6 animate-spin text-primary" />
                </div>
            )}
            {conversations && conversations.map((conv) => (
                <button
                    key={conv.id}
                    onClick={() => onSelectConversation(conv.id)}
                    className={cn(
                        "w-full text-left p-3 rounded-lg transition-colors group",
                        activeConversationId === conv.id ? "bg-accent text-accent-foreground" : "hover:bg-accent/50"
                    )}
                >
                    <div className="flex items-start justify-between gap-4">
                         <div className="flex-1 overflow-hidden">
                             <p className="text-sm font-medium truncate">{conv.title}</p>
                            <p className="text-xs text-muted-foreground mt-1">{formatDate(conv.createdAt)}</p>
                         </div>
                        <Trash2 className="h-4 w-4 text-destructive opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                </button>
            ))}
            {!isLoading && conversations?.length === 0 && (
                <div className="text-center text-sm text-muted-foreground pt-10">
                    Aucune conversation pour le moment.
                </div>
            )}
        </div>
      </ScrollArea>
    </div>
  );
}
