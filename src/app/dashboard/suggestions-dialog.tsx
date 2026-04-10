
'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { getApiUrl } from '@/lib/api-utils';

export function SuggestionsDialog({
  meal,
  goals,
  open,
  onOpenChange,
}: SuggestionsDialogProps) {
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleGetSuggestions = async () => {
    setIsLoading(true);
    setSuggestions([]);
    try {
      const response = await fetch(getApiUrl('/api/ai/suggest-healthy-replacements'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          loggedFood: meal.name,
          healthGoals: goals,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erreur lors de la génération des suggestions.');
      } else if (data.suggestions) {
        setSuggestions(data.suggestions);
      }
    } catch (e: any) {
      toast({
        variant: 'destructive',
        title: 'Erreur',
        description: e.message || 'Impossible de générer des suggestions.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Reset state when dialog is closed
  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
        setSuggestions([]);
        setIsLoading(false);
    }
    onOpenChange(isOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            Alternatives plus saines
          </DialogTitle>
          <DialogDescription>
            Suggestions de notre outil pour remplacer{' '}
            <span className="font-semibold text-foreground">{meal.name}</span>.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          {isLoading ? (
            <div className="flex h-32 items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : suggestions.length > 0 ? (
            <div className="space-y-3">
              <h4 className="font-medium">Voici quelques idées :</h4>
              <ul className="list-disc space-y-2 pl-5 text-sm text-muted-foreground">
                {suggestions.map((s, i) => (
                  <li key={i}>{s}</li>
                ))}
              </ul>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed bg-muted/50 p-8 text-center">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                <Lightbulb className="h-6 w-6 text-primary" />
              </div>
              <p className="text-sm text-muted-foreground">
                Cliquez sur le bouton pour obtenir des suggestions intelligentes basées sur vos objectifs de santé.
              </p>
            </div>
          )}
        </div>
        <DialogFooter>
          <Button onClick={handleGetSuggestions} disabled={isLoading} className='w-full'>
            {isLoading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Sparkles className="mr-2 h-4 w-4" />
            )}
            Générer des suggestions
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
