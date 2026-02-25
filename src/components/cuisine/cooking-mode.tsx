'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Play, Pause, SkipForward, X, ChefHat, CheckCircle2, Clock, Timer, Volume2, VolumeX } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Cooking } from '@/lib/types';

// --- Helper to parse step duration in seconds ---
function parseDurationSeconds(text: string): number {
    // Match "X heure(s)" or "X minute(s)" or "X min" or "X h" patterns
    const hourMatch = text.match(/(\d+)\s*(heure|heures|h)\b/i);
    const minuteMatch = text.match(/(\d+)\s*(minute|minutes|min)\b/i);
    const secondMatch = text.match(/(\d+)\s*(seconde|secondes|sec|s)\b/i);

    let total = 0;
    if (hourMatch) total += parseInt(hourMatch[1]) * 3600;
    if (minuteMatch) total += parseInt(minuteMatch[1]) * 60;
    if (secondMatch) total += parseInt(secondMatch[1]);

    return total;
}

// --- Parse recipe into sections and steps ---
interface RecipeSection {
    title: string | null;
    items: string[];
    isIngredients: boolean;
}

function parseRecipeSections(recipe: string): RecipeSection[] {
    const lines = recipe.split('\n').map(l => l.trim()).filter(Boolean);
    const sections: RecipeSection[] = [];
    let current: RecipeSection | null = null;

    for (const line of lines) {
        // Detect headings (# ## ###)
        const headingMatch = line.match(/^#+\s*(.*)/);
        if (headingMatch) {
            if (current) sections.push(current);
            const title = headingMatch[1].trim();
            current = {
                title,
                items: [],
                isIngredients: /ingr[eé]dient/i.test(title),
            };
        } else {
            if (!current) {
                current = { title: null, items: [], isIngredients: false };
            }
            // Strip list markers
            const clean = line.replace(/^[-*•]\s*/, '').replace(/^\d+\.\s*/, '').trim();
            if (clean) current.items.push(clean);
        }
    }
    if (current) sections.push(current);
    return sections;
}

// ============================================================
// PHASE 1 – Intro Animation ("Cuisine moi !")
// ============================================================
function IntroScreen({ meal, onStartSteps }: { meal: Cooking; onStartSteps: () => void }) {
    const [countdown, setCountdown] = useState(3);
    const [phase, setPhase] = useState<'animate' | 'ready'>('animate');

    useEffect(() => {
        if (countdown <= 0) {
            setPhase('ready');
            return;
        }
        const t = setTimeout(() => setCountdown(c => c - 1), 1000);
        return () => clearTimeout(t);
    }, [countdown]);

    const imageUrl = meal.imageUrl || `https://picsum.photos/seed/${meal.name.replace(/\s/g, '-')}/400/400`;

    return (
        <div className="flex flex-col items-center justify-center h-full gap-8 p-6 text-white">
            {/* Pulsing ring + image */}
            <div className="relative select-none">
                {/* Spinning ring */}
                <div className={cn(
                    "absolute inset-0 rounded-full border-4 border-transparent border-t-primary border-r-primary/50 transition-opacity duration-500",
                    phase === 'animate' ? "animate-spin opacity-100" : "opacity-0"
                )} style={{ borderRadius: '50%', width: '100%', height: '100%' }} />
                {/* Outer glow */}
                <div className={cn(
                    "absolute -inset-2 rounded-full transition-all duration-700",
                    phase === 'ready' ? "bg-primary/20 scale-110 animate-pulse" : "bg-primary/5"
                )} />
                {/* Image circle */}
                <div className="relative w-48 h-48 rounded-full overflow-hidden ring-4 ring-primary/30 shadow-2xl">
                    <Image src={imageUrl} alt={meal.name} fill className="object-cover" sizes="192px" priority />
                </div>

                {/* Countdown badge */}
                {phase === 'animate' && (
                    <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-10 h-10 rounded-full bg-primary flex items-center justify-center shadow-lg shadow-primary/30 text-white font-black text-xl animate-bounce">
                        {countdown}
                    </div>
                )}
            </div>

            {/* Text */}
            <div className="text-center space-y-3 mt-4">
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-primary/70">
                    {phase === 'animate' ? 'Préparation du mode cuisine...' : "C'est parti !"}
                </p>
                <h2 className="text-3xl font-black font-serif leading-tight">{meal.name}</h2>
                <div className="flex items-center justify-center gap-4 text-white/50 text-[10px] uppercase font-black tracking-widest">
                    <div className="flex items-center gap-1.5"><Clock className="h-3 w-3" />{meal.cookingTime}</div>
                    {meal.calories > 0 && <div className="flex items-center gap-1.5"><span>🔥</span>{meal.calories} kcal</div>}
                </div>
            </div>

            {/* CTA */}
            {phase === 'ready' && (
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <Button
                        onClick={onStartSteps}
                        size="lg"
                        className="h-14 px-10 rounded-2xl font-black text-sm uppercase tracking-widest bg-primary text-white shadow-xl shadow-primary/30 hover:scale-105 active:scale-95 transition-all"
                    >
                        <Play className="mr-2 h-5 w-5 fill-white" />
                        Commencer la recette
                    </Button>
                </div>
            )}
        </div>
    );
}

// ============================================================
// PHASE 2 – Ingredients Screen
// ============================================================
function IngredientsScreen({ items, onContinue }: { items: string[]; onContinue: () => void }) {
    return (
        <div className="flex flex-col h-full">
            <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-4">
                <div className="flex items-center gap-2 mb-6">
                    <span className="text-2xl">🧺</span>
                    <div>
                        <h3 className="text-white font-black text-xl">Ingrédients</h3>
                        <p className="text-white/40 text-[10px] uppercase tracking-widest font-bold">Voici ce dont vous avez besoin</p>
                    </div>
                </div>
                <ul className="space-y-3">
                    {items.map((item, i) => (
                        <li key={i} className="flex items-center gap-4 p-4 rounded-xl bg-white/5 border border-white/10 text-white text-sm font-medium">
                            <span className="h-2 w-2 rounded-full bg-primary shrink-0" />
                            {item}
                        </li>
                    ))}
                </ul>
            </div>
            <div className="p-6 border-t border-white/10 shrink-0">
                <div className="h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent mb-6" />
                <Button
                    onClick={onContinue}
                    className="w-full h-14 rounded-2xl font-black text-sm uppercase tracking-widest bg-primary text-white shadow-xl shadow-primary/30 hover:scale-[1.02] active:scale-[0.98] transition-all"
                >
                    <Play className="mr-2 h-5 w-5 fill-white" />
                    Passer aux étapes
                </Button>
            </div>
        </div>
    );
}

// ============================================================
// Animated Flame — follows the end of the progress bar
// ============================================================
function AnimatedFlame({ visible }: { visible: boolean }) {
    if (!visible) return null;
    return (
        <span
            className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 text-base select-none pointer-events-none"
            style={{
                filter: 'drop-shadow(0 0 6px rgba(251,146,60,0.9))',
                animation: 'flameWiggle 0.4s ease-in-out infinite alternate',
            }}
        >
            🔥
        </span>
    );
}

// ============================================================
// PHASE 3 – Step-by-Step with smooth RAF progress bar
// ============================================================
interface StepScreenProps {
    steps: string[];
    onFinish: () => void;
}

function StepScreen({ steps, onFinish }: StepScreenProps) {
    const [currentStep, setCurrentStep] = useState(0);
    const [playing, setPlaying] = useState(false);
    const [progress, setProgress] = useState(0); // 0-100, float
    const [muted, setMuted] = useState(false);
    const rafRef = useRef<number | null>(null);
    const startTimeRef = useRef<number | null>(null);
    const pausedAtRef = useRef<number>(0); // elapsed ms when paused

    const step = steps[currentStep];
    const durationSec = parseDurationSeconds(step);
    const durationMs = durationSec * 1000;
    const hasTimer = durationMs > 0;
    const isComplete = progress >= 100;
    const isLastStep = currentStep === steps.length - 1;

    const remainingSec = hasTimer
        ? Math.max(0, Math.round(durationSec * (1 - progress / 100)))
        : 0;

    const formatTime = (sec: number) => {
        if (sec >= 3600) return `${Math.floor(sec / 3600)}h ${Math.floor((sec % 3600) / 60)}min`;
        if (sec >= 60) return `${Math.floor(sec / 60)} min ${sec % 60 > 0 ? (sec % 60) + 's' : ''}`.trim();
        return `${sec}s`;
    };

    // Reset on step change
    useEffect(() => {
        setProgress(0);
        setPlaying(false);
        pausedAtRef.current = 0;
        startTimeRef.current = null;
        if (rafRef.current) cancelAnimationFrame(rafRef.current);
    }, [currentStep]);

    // RAF loop — runs while 'playing'
    useEffect(() => {
        if (!playing || !hasTimer || isComplete) return;

        const tick = (now: number) => {
            if (startTimeRef.current === null) {
                startTimeRef.current = now - pausedAtRef.current;
            }
            const elapsed = now - startTimeRef.current;
            const pct = Math.min((elapsed / durationMs) * 100, 100);
            setProgress(pct);

            if (pct < 100) {
                rafRef.current = requestAnimationFrame(tick);
            } else {
                setPlaying(false);
                pausedAtRef.current = durationMs;
            }
        };

        rafRef.current = requestAnimationFrame(tick);
        return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
    }, [playing, hasTimer, isComplete, durationMs]);

    // On pause: record how far we got
    const handlePlayPause = () => {
        if (playing) {
            if (rafRef.current) cancelAnimationFrame(rafRef.current);
            // Store elapsed ms based on current progress
            pausedAtRef.current = (progress / 100) * durationMs;
            startTimeRef.current = null;
            setPlaying(false);
        } else {
            setPlaying(true);
        }
    };

    const handleNext = useCallback(() => {
        if (rafRef.current) cancelAnimationFrame(rafRef.current);
        if (currentStep < steps.length - 1) {
            setCurrentStep(i => i + 1);
        } else {
            onFinish();
        }
    }, [currentStep, steps.length, onFinish]);

    // Auto-advance when timer finishes
    useEffect(() => {
        if (isComplete && !playing && hasTimer) {
            const t = setTimeout(handleNext, 1500);
            return () => clearTimeout(t);
        }
    }, [isComplete, playing, hasTimer, handleNext]);

    return (
        <div className="flex flex-col h-full">
            {/* Step dots */}
            <div className="px-6 pt-6 flex items-center gap-2">
                {steps.map((_, i) => (
                    <div
                        key={i}
                        className={cn(
                            "h-1 rounded-full flex-1 transition-all duration-500",
                            i < currentStep ? "bg-primary" : i === currentStep ? "bg-primary/60 animate-pulse" : "bg-white/10"
                        )}
                    />
                ))}
            </div>

            {/* Step counter */}
            <div className="px-6 pt-4 flex items-center justify-between">
                <span className="text-[10px] font-black uppercase tracking-widest text-white/30">
                    Étape {currentStep + 1} / {steps.length}
                </span>
                {hasTimer && (
                    <button onClick={() => setMuted(m => !m)} className="text-white/30 hover:text-white/60 transition-colors">
                        {muted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                    </button>
                )}
            </div>

            {/* Step content */}
            <div className="flex-1 flex flex-col items-center justify-center px-6 py-4 gap-6">
                {/* Icon */}
                <div className={cn(
                    "w-20 h-20 rounded-full flex items-center justify-center text-4xl transition-all duration-500 shadow-2xl",
                    isComplete ? "bg-emerald-500/20 ring-4 ring-emerald-500/40 scale-110" : "bg-primary/10 ring-2 ring-primary/20"
                )}>
                    {isComplete ? '✅' : currentStep === 0 ? '🍳' : currentStep % 3 === 0 ? '🥄' : currentStep % 3 === 1 ? '🔥' : '⏱️'}
                </div>

                {/* Step text */}
                <p className={cn(
                    "text-center text-white text-xl font-bold leading-snug max-w-sm transition-all duration-300",
                    isComplete && "line-through text-emerald-400/80"
                )}>
                    {step.replace(/\(\d+\s*(minute|minutes|min|heure|heures|h|sec|s)\)/gi, '').trim()}
                </p>

                {/* Time remaining */}
                {hasTimer && (
                    <div className={cn(
                        "flex items-center gap-2 px-4 py-2 rounded-full text-sm font-black transition-all",
                        isComplete
                            ? "bg-emerald-500/20 text-emerald-400"
                            : playing
                                ? "bg-orange-500/10 text-orange-300 border border-orange-500/20"
                                : "bg-white/5 text-white/60 border border-white/10"
                    )}>
                        <Timer className="h-4 w-4" />
                        <span>
                            {isComplete
                                ? "Terminé ! 🎉"
                                : progress > 0
                                    ? formatTime(remainingSec) + " restant"
                                    : formatTime(durationSec)}
                        </span>
                    </div>
                )}
            </div>

            {/* ── Progress bar with flame ── */}
            {hasTimer && (
                <div className="px-6 mb-2">
                    <div className="relative h-4 rounded-full bg-white/5 border border-white/10 overflow-visible">
                        {/* Track fill */}
                        <div
                            className={cn(
                                "absolute inset-y-0 left-0 rounded-full",
                                isComplete
                                    ? "bg-gradient-to-r from-emerald-500 to-emerald-400"
                                    : "bg-gradient-to-r from-primary via-orange-400 to-amber-300"
                            )}
                            style={{ width: `${progress}%` }}
                        />
                        {/* Glowing tip effect */}
                        {!isComplete && progress > 0 && (
                            <div
                                className="absolute top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-amber-300 shadow-[0_0_12px_4px_rgba(251,191,36,0.8)]"
                                style={{ left: `calc(${progress}% - 8px)` }}
                            />
                        )}
                        {/* 🔥 Flame at the tip */}
                        {!isComplete && playing && (
                            <span
                                className="absolute top-0 -translate-y-3/4 text-xl select-none pointer-events-none"
                                style={{
                                    left: `calc(${progress}% - 10px)`,
                                    filter: 'drop-shadow(0 0 8px rgba(251,146,60,0.9))',
                                    animation: 'flameWiggle 0.3s ease-in-out infinite alternate',
                                }}
                            >
                                🔥
                            </span>
                        )}
                    </div>
                </div>
            )}

            {/* Action buttons */}
            <div className="p-6 space-y-3 shrink-0">
                {hasTimer && !isComplete && (
                    <Button
                        onClick={handlePlayPause}
                        className={cn(
                            "w-full h-14 rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl transition-all hover:scale-[1.02] active:scale-[0.98]",
                            playing
                                ? "bg-amber-500 text-black hover:bg-amber-600"
                                : "bg-primary text-white shadow-primary/30"
                        )}
                    >
                        {playing
                            ? <><Pause className="mr-2 h-5 w-5 fill-black" />Pause</>
                            : <><Play className="mr-2 h-5 w-5 fill-white" />{progress > 0 ? 'Reprendre' : 'Démarrer le minuteur'}</>
                        }
                    </Button>
                )}

                <Button
                    onClick={handleNext}
                    className={cn(
                        "w-full h-12 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all hover:scale-[1.02] active:scale-[0.98]",
                        hasTimer && !isComplete
                            ? "bg-transparent border border-white/10 text-white/50 hover:text-white hover:border-white/30 hover:bg-white/5"
                            : isLastStep
                                ? "bg-emerald-600 text-white shadow-xl shadow-emerald-600/20"
                                : "bg-primary text-white shadow-xl shadow-primary/20"
                    )}
                >
                    {isLastStep
                        ? <><CheckCircle2 className="mr-2 h-4 w-4" />Repas terminé !</>
                        : <><SkipForward className="mr-2 h-4 w-4" />Étape suivante</>
                    }
                </Button>
            </div>

            {/* Keyframe for flame wiggle */}
            <style>{`
                @keyframes flameWiggle {
                    from { transform: translateY(-75%) rotate(-8deg) scale(1); }
                    to   { transform: translateY(-80%) rotate(8deg) scale(1.15); }
                }
            `}</style>
        </div>
    );
}

// ============================================================
// PHASE 4 – Finish Screen
// ============================================================
function FinishScreen({ mealName, onClose, onFinished }: { mealName: string; onClose: () => void; onFinished?: () => void }) {
    return (
        <div className="flex flex-col items-center justify-center h-full gap-8 p-6 text-white text-center">
            <div className="text-8xl animate-bounce">🎉</div>
            <div className="space-y-3">
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-primary/60">Bravo, chef !</p>
                <h2 className="text-3xl font-black font-serif">{mealName}</h2>
                <p className="text-white/50 text-sm font-medium max-w-xs mx-auto">
                    Votre repas est prêt. Profitez de chaque bouchée !
                </p>
            </div>
            <div className="space-y-3 w-full max-w-xs">
                <Button
                    onClick={() => { onFinished?.(); onClose(); }}
                    className="w-full h-14 rounded-2xl font-black text-sm uppercase tracking-widest bg-primary text-white shadow-xl shadow-primary/30"
                >
                    <ChefHat className="mr-2 h-5 w-5" />
                    C'était délicieux !
                </Button>
            </div>
        </div>
    );
}

// ============================================================
// MAIN COMPONENT – CookingMode Overlay
// ============================================================
interface CookingModeProps {
    meal: Cooking;
    isOpen: boolean;
    onClose: () => void;
    onFinished?: () => void;
}

type Phase = 'intro' | 'ingredients' | 'steps' | 'finish';

export function CookingMode({ meal, isOpen, onClose, onFinished }: CookingModeProps) {
    const [phase, setPhase] = useState<Phase>('intro');

    // Parse recipe into sections
    const sections = meal.recipe ? parseRecipeSections(meal.recipe) : [];
    const ingredientItems = sections.find(s => s.isIngredients)?.items ?? [];
    const stepSection = sections.find(s => !s.isIngredients && s.items.length > 0);
    const allSteps = sections
        .filter(s => !s.isIngredients)
        .flatMap(s => s.items)
        .filter(Boolean);

    // Reset on open
    useEffect(() => {
        if (isOpen) setPhase('intro');
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] bg-[#080808] flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-white/5 shrink-0">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                        <ChefHat className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                        <p className="text-white text-xs font-black uppercase tracking-widest truncate max-w-[200px]">{meal.name}</p>
                        <p className="text-white/30 text-[9px] font-bold uppercase tracking-wider">Mode Cuisine</p>
                    </div>
                </div>
                <button
                    onClick={onClose}
                    className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white/50 hover:text-white transition-all"
                >
                    <X className="h-5 w-5" />
                </button>
            </div>

            {/* Content area (scrollable) */}
            <div className="flex-1 overflow-y-auto min-h-0">
                {phase === 'intro' && (
                    <IntroScreen
                        meal={meal}
                        onStartSteps={() => setPhase(ingredientItems.length > 0 ? 'ingredients' : 'steps')}
                    />
                )}
                {phase === 'ingredients' && (
                    <IngredientsScreen
                        items={ingredientItems}
                        onContinue={() => setPhase('steps')}
                    />
                )}
                {phase === 'steps' && allSteps.length > 0 && (
                    <StepScreen
                        steps={allSteps}
                        onFinish={() => setPhase('finish')}
                    />
                )}
                {phase === 'steps' && allSteps.length === 0 && (
                    <div className="flex flex-col items-center justify-center h-full text-white/40 gap-4 p-8 text-center">
                        <ChefHat className="h-12 w-12" />
                        <p className="text-sm font-bold">Aucune étape disponible pour ce repas.</p>
                        <Button variant="outline" onClick={onClose} className="border-white/10 text-white/50">
                            Fermer
                        </Button>
                    </div>
                )}
                {phase === 'finish' && (
                    <FinishScreen mealName={meal.name} onClose={onClose} onFinished={onFinished} />
                )}
            </div>

            {/* Subtle background gradient */}
            <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_top,rgba(var(--primary-rgb),0.05)_0%,transparent_60%)]" />
        </div>
    );
}
