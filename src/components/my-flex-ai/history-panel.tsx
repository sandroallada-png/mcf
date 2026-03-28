'use client';

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { MessageSquare, Plus, Loader2, Sparkles, Clock } from "lucide-react";
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
    try {
      return formatDistanceToNow(new Date(timestamp.seconds * 1000), { addSuffix: true, locale: fr });
    } catch {
      return "Date inconnue";
    }
  };

  return (
    <div className="flex flex-col flex-1 min-h-0 w-full overflow-hidden">
      {/* ── Barre d'en-tête : une seule ligne, sans débordement ── */}
      <div className="shrink-0 flex items-center justify-between gap-2 px-4 py-3 border-b border-primary/5">
        {/* Titre compact */}
        <div className="flex items-center gap-2 min-w-0">
          <div className="shrink-0 h-7 w-7 rounded-lg bg-primary/10 flex items-center justify-center">
            <MessageSquare className="h-4 w-4 text-primary" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-black tracking-tight text-foreground leading-none truncate">Historique</p>
            <p className="text-[8px] font-bold text-muted-foreground/60 uppercase tracking-wider mt-0.5">Échanges récents</p>
          </div>
        </div>

        {/* Bouton Nouveau chat : icône seule sur mobile, texte sur desktop */}
        <Button
          onClick={() => onSelectConversation(null)}
          size="sm"
          className="shrink-0 h-8 rounded-xl bg-primary hover:bg-primary/90 text-white shadow-md flex items-center gap-1.5 px-3"
        >
          <Plus className="h-3.5 w-3.5" />
          <span className="hidden sm:inline text-[9px] font-black uppercase tracking-widest whitespace-nowrap">Nouveau</span>
        </Button>
      </div>

      {/* ── Liste scrollable ── */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden px-3 py-3 space-y-1.5">
        {isLoading && (
          <div className="flex flex-col items-center justify-center py-10 gap-3">
            <Loader2 className="h-7 w-7 animate-spin text-primary/30" />
            <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/60">Chargement...</p>
          </div>
        )}

        {!isLoading && conversations && conversations.map((conv) => {
          const isActive = activeConversationId === conv.id;
          return (
            <button
              key={conv.id}
              onClick={() => onSelectConversation(conv.id)}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl border transition-all duration-200 text-left group active:scale-[0.98]",
                isActive
                  ? "bg-primary border-primary text-white shadow-md"
                  : "bg-card border-border/50 hover:border-primary/30 hover:bg-primary/5"
              )}
            >
              {/* Icône */}
              <div className={cn(
                "shrink-0 h-8 w-8 rounded-lg flex items-center justify-center transition-all duration-300",
                isActive ? "bg-white/20" : "bg-primary/5 group-hover:bg-primary/10"
              )}>
                <MessageSquare className={cn("h-4 w-4", isActive ? "text-white" : "text-primary")} />
              </div>

              {/* Texte */}
              <div className="flex-1 min-w-0">
                <p className={cn(
                  "text-sm font-bold truncate leading-tight",
                  isActive ? "text-white" : "text-foreground group-hover:text-primary"
                )}>
                  {conv.title || "Nouvelle conversation"}
                </p>
                <div className="flex items-center gap-1 mt-0.5">
                  <Clock className={cn("h-3 w-3 shrink-0", isActive ? "text-white/70" : "text-muted-foreground/60")} />
                  <span className={cn(
                    "text-[9px] font-semibold uppercase tracking-wider truncate",
                    isActive ? "text-white/70" : "text-muted-foreground/60"
                  )}>
                    {formatDate(conv.createdAt)}
                  </span>
                </div>
              </div>
            </button>
          );
        })}

        {!isLoading && (!conversations || conversations.length === 0) && (
          <div className="flex flex-col items-center justify-center py-14 px-4 text-center">
            <div className="h-14 w-14 bg-muted/30 rounded-2xl flex items-center justify-center mb-4">
              <Sparkles className="h-7 w-7 text-primary/20" />
            </div>
            <p className="text-sm font-black tracking-tight mb-1">Aucune conversation</p>
            <p className="text-xs text-muted-foreground leading-relaxed mb-6 max-w-[180px]">
              Lancez votre première discussion !
            </p>
            <Button
              onClick={() => onSelectConversation(null)}
              size="sm"
              className="rounded-xl h-9 px-6 font-black uppercase text-[9px] tracking-widest"
            >
              Commencer
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
