'use client';

import React, { useEffect, useRef, useState } from 'react';
import { GameManager, GameState, Difficulty, SkinConfig } from './GameManager';
import { Button } from '@/components/ui/button';
import { RefreshCcw, Play, Zap, Shield, Volume2, VolumeX, Skull, Languages, Palette, Baby, Smile, MoveHorizontal, Smartphone, Info, CircleAlert, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { translations, Language } from '@/app/lib/translations';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from "@/components/ui/carousel";

const SKINS: SkinConfig[] = [
    { id: 'toxic', color: 0xb8f53d, hex: '#b8f53d', gravity: -0.015, bounceStrength: 0.32, scale: 2.0 },
    { id: 'neon', color: 0xff00ff, hex: '#ff00ff', gravity: -0.012, bounceStrength: 0.37, scale: 0.8 },
    { id: 'aqua', color: 0x00ffff, hex: '#00ffff', gravity: -0.018, bounceStrength: 0.30, scale: 1.2 }
];

export default function HelixGame() {
  const containerRef = useRef<HTMLDivElement>(null);
  const managerRef = useRef<GameManager | null>(null);
  const [score, setScore] = useState(0);
  const [gameState, setGameState] = useState<GameState>('START');
  const [showGameOverUI, setShowGameOverUI] = useState(false);
  const [difficulty, setDifficulty] = useState<Difficulty>('EASY');
  const [selectedSkin, setSelectedSkin] = useState(SKINS[0]);
  const [isMuted, setIsMuted] = useState(false);
  const [lang, setLang] = useState<Language>('ru');
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [onboardingApi, setOnboardingApi] = useState<CarouselApi>();
  const [currentSlide, setCurrentSlide] = useState(0);

  const t = translations[lang];

  useEffect(() => {
    if (!onboardingApi) return;
    onboardingApi.on("select", () => {
      setCurrentSlide(onboardingApi.selectedScrollSnap());
    });
  }, [onboardingApi]);

  useEffect(() => {
    const hasPlayed = localStorage.getItem('stepSmash_hasPlayed');
    if (!hasPlayed) {
      setShowOnboarding(true);
    }
  }, []);

  const closeOnboarding = () => {
    setShowOnboarding(false);
    localStorage.setItem('stepSmash_hasPlayed', 'true');
  };

  useEffect(() => {
    if (gameState === 'GAMEOVER') {
      const timer = setTimeout(() => {
        setShowGameOverUI(true);
      }, 1500);
      return () => clearTimeout(timer);
    } else {
      setShowGameOverUI(false);
    }
  }, [gameState]);

  useEffect(() => {
    if (!containerRef.current || managerRef.current) return;
    const manager = new GameManager({
      container: containerRef.current,
      onScoreUpdate: (s) => setScore(s),
      onGameStateChange: (state) => setGameState(state),
    });
    managerRef.current = manager;
    return () => {
      manager.dispose();
      managerRef.current = null;
    };
  }, []);

  useEffect(() => {
    const manager = managerRef.current;
    if (!manager) return;

    let isDragging = false;
    let lastX = 0;
    const keysPressed = new Set<string>();

    const onStart = (x: number) => {
        isDragging = true;
        lastX = x;
    };

    const onMove = (x: number, e: MouseEvent | TouchEvent) => {
        if (!isDragging) return;
        if (e.cancelable) e.preventDefault();
        const deltaPixels = x - lastX;
        const normalizedDelta = (deltaPixels / window.innerWidth) * 100;
        manager.moveBall(normalizedDelta); 
        lastX = x;
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      keysPressed.add(e.key);
      if (e.key === 'Enter' || e.key === ' ') {
        if (gameState === 'START' && !showOnboarding) {
          handleStart();
        } else if (gameState === 'GAMEOVER' && showGameOverUI) {
          handleStart();
        }
      }
    };
    
    const handleKeyUp = (e: KeyboardEvent) => {
      keysPressed.delete(e.key);
    };

    let rafId: number;
    const updateKeyboard = () => {
      if (gameState === 'PLAYING') {
        const moveMultiplier = 1.5;
        if (keysPressed.has('ArrowLeft') || keysPressed.has('a') || keysPressed.has('A')) {
          manager.moveBall(-moveMultiplier);
        }
        if (keysPressed.has('ArrowRight') || keysPressed.has('d') || keysPressed.has('D')) {
          manager.moveBall(moveMultiplier);
        }
      }
      rafId = requestAnimationFrame(updateKeyboard);
    };
    rafId = requestAnimationFrame(updateKeyboard);

    const mouseDown = (e: MouseEvent) => onStart(e.clientX);
    const mouseMove = (e: MouseEvent) => onMove(e.clientX, e);
    const mouseUp = () => isDragging = false;

    const touchStart = (e: TouchEvent) => {
        if (e.touches.length > 0) onStart(e.touches[0].clientX);
    };
    const touchMove = (e: TouchEvent) => {
        if (e.touches.length > 0) onMove(e.touches[0].clientX, e);
    };
    const touchEnd = () => isDragging = false;

    window.addEventListener('mousedown', mouseDown);
    window.addEventListener('mousemove', mouseMove, { passive: false });
    window.addEventListener('mouseup', mouseUp);
    window.addEventListener('touchstart', touchStart, { passive: true });
    window.addEventListener('touchmove', touchMove, { passive: false });
    window.addEventListener('touchend', touchEnd);
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('mousedown', mouseDown);
      window.removeEventListener('mousemove', mouseMove);
      window.removeEventListener('mouseup', mouseUp);
      window.removeEventListener('touchstart', touchStart);
      window.removeEventListener('touchmove', touchMove);
      window.removeEventListener('touchend', touchEnd);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      cancelAnimationFrame(rafId);
    };
  }, [gameState, showGameOverUI, showOnboarding]);

  const handleStart = (diff: Difficulty = difficulty) => {
    const manager = managerRef.current;
    if (!manager) return;
    manager.startGame(diff, selectedSkin);
  };

  const toggleMute = () => {
    if (managerRef.current) {
      const muted = managerRef.current.toggleMute();
      setIsMuted(muted);
    }
  };

  const toggleLang = () => setLang(prev => prev === 'en' ? 'ru' : 'en');

  return (
    <div className="game-container touch-none select-none relative overflow-hidden bg-background">
      <div ref={containerRef} className="w-full h-full relative z-10" />
      <div className="absolute inset-0 z-20 ui-overlay flex flex-col items-center justify-between p-8 pointer-events-none">
        <div className="w-full flex justify-between items-start pointer-events-auto">
            <div className="flex flex-col items-start gap-1">
                <div className="text-xs font-semibold text-muted-foreground tracking-widest uppercase">{t.score}</div>
                <div className="text-4xl font-extrabold text-accent drop-shadow-lg">{score}m</div>
            </div>
            <div className="flex gap-2">
                <Button variant="outline" size="icon" onClick={toggleLang} className="rounded-full bg-white/20 backdrop-blur-sm border-white/30 text-foreground hover:bg-white/40"><Languages className="w-5 h-5" /></Button>
                <Button variant="outline" size="icon" onClick={toggleMute} className="rounded-full bg-white/20 backdrop-blur-sm border-white/30 text-foreground hover:bg-white/40">{isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}</Button>
            </div>
        </div>

        <Dialog open={showOnboarding} onOpenChange={setShowOnboarding}>
          <DialogContent className="w-[92vw] max-w-sm bg-white/95 backdrop-blur-xl border-white/30 shadow-2xl rounded-3xl p-6 pointer-events-auto overflow-hidden">
            <DialogHeader className="flex flex-col items-center gap-2 mb-2">
              <div className="bg-primary/20 p-3 rounded-full"><Info className="w-8 h-8 text-primary" /></div>
              <DialogTitle className="text-2xl font-black text-primary uppercase tracking-tighter text-center">{t.onboarding.title}</DialogTitle>
            </DialogHeader>
            
            <div className="relative">
              <Carousel setApi={setOnboardingApi} className="w-full">
                <CarouselContent>
                  <CarouselItem className="flex flex-col items-center text-center px-2">
                    <div className="w-full flex flex-col items-center gap-4 py-4">
                      <div className="bg-primary/10 p-4 rounded-3xl border border-primary/20">
                        <Play className="w-10 h-10 text-primary" />
                      </div>
                      <div>
                        <h4 className="font-bold text-xl mb-2">{t.onboarding.welcome}</h4>
                        <p className="text-sm text-muted-foreground leading-relaxed">{t.onboarding.goal}</p>
                      </div>
                    </div>
                  </CarouselItem>
                  <CarouselItem className="flex flex-col items-center text-center px-2">
                    <div className="w-full flex flex-col items-center gap-4 py-4">
                      <div className="bg-destructive/10 p-4 rounded-3xl border border-destructive/20">
                        <CircleAlert className="w-10 h-10 text-destructive" />
                      </div>
                      <div>
                        <h4 className="font-bold text-xl mb-2 text-destructive">{t.onboarding.hazardTitle}</h4>
                        <p className="text-sm text-muted-foreground leading-relaxed">{t.onboarding.hazardDesc}</p>
                      </div>
                    </div>
                  </CarouselItem>
                  <CarouselItem className="flex flex-col items-center text-center px-2">
                    <div className="w-full flex flex-col items-center gap-4 py-4">
                      <div className="bg-accent/10 p-4 rounded-3xl border border-accent/20">
                        <MoveHorizontal className="w-10 h-10 text-accent" />
                      </div>
                      <div>
                        <h4 className="font-bold text-xl mb-2">{t.instructions}</h4>
                        <p className="text-sm text-muted-foreground leading-relaxed">{t.onboarding.controls}</p>
                      </div>
                    </div>
                  </CarouselItem>
                </CarouselContent>
              </Carousel>
              
              <div className="flex justify-center gap-2 mt-6">
                {[0, 1, 2].map((i) => (
                  <div 
                    key={i} 
                    className={cn(
                      "w-2 h-2 rounded-full transition-all duration-300", 
                      currentSlide === i ? "bg-primary w-6" : "bg-primary/20"
                    )} 
                  />
                ))}
              </div>
            </div>

            <div className="mt-8 flex gap-3">
              {currentSlide < 2 ? (
                <Button 
                  onClick={() => onboardingApi?.scrollNext()} 
                  className="h-14 w-full rounded-2xl bg-primary text-primary-foreground font-black text-lg shadow-lg hover:bg-primary/90 transition-all flex items-center justify-center gap-2"
                >
                  NEXT <ChevronRight className="w-5 h-5" />
                </Button>
              ) : (
                <Button 
                  onClick={closeOnboarding} 
                  className="h-14 w-full rounded-2xl bg-primary text-primary-foreground font-black text-lg shadow-lg hover:bg-primary/90 animate-in zoom-in-95 duration-300"
                >
                  {t.onboarding.gotIt}
                </Button>
              )}
            </div>
          </DialogContent>
        </Dialog>

        {gameState === 'START' && (
          <div className="flex flex-col items-center gap-6 bg-white/10 backdrop-blur-md p-10 rounded-3xl border border-white/20 shadow-2xl animate-in zoom-in-95 duration-500 pointer-events-auto max-w-sm w-full overflow-y-auto max-h-[85vh]">
            <h1 className="text-4xl font-extrabold text-primary tracking-tighter text-center">{t.title}</h1>
            <div className="w-full flex flex-col gap-2">
                <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground tracking-widest uppercase mb-1"><Palette className="w-4 h-4" /> {t.selectSkin}</div>
                <div className="grid grid-cols-3 gap-3">
                    {SKINS.map((skin) => (
                        <button key={skin.id} onClick={() => setSelectedSkin(skin)} className={cn("flex flex-col items-center gap-2 p-3 rounded-2xl border-2 transition-all", selectedSkin.id === skin.id ? "bg-white/20 border-white" : "bg-white/5 border-transparent opacity-60")}>
                            <div className="w-8 h-8 rounded-full shadow-lg border border-white/20" style={{ backgroundColor: skin.hex }} />
                            <div className="flex flex-col items-center">
                                <span className="text-[10px] font-bold uppercase tracking-wider text-center">{t.skins[skin.id as keyof typeof t.skins]}</span>
                                <span className="text-[8px] opacity-70 font-medium text-center leading-tight">{t.skins.traits[skin.id as keyof typeof t.skins.traits]}</span>
                            </div>
                        </button>
                    ))}
                </div>
            </div>
            <div className="flex flex-col gap-3 w-full">
                {['PRACTICE', 'BEGINNER', 'EASY', 'HARD', 'INSANE'].map((mode) => (
                  <button key={mode} onClick={() => { setDifficulty(mode as Difficulty); handleStart(mode as Difficulty); }} className={cn("flex items-center justify-between p-4 rounded-2xl border-2 transition-all group", difficulty === mode ? "bg-primary/20 border-primary shadow-lg" : "bg-white/5 border-transparent opacity-60 hover:opacity-100")}>
                      <div className="flex items-center gap-3">
                          {mode === 'PRACTICE' ? <Baby className="w-6 h-6 text-green-500" /> : mode === 'BEGINNER' ? <Smile className="w-6 h-6 text-cyan-500" /> : mode === 'EASY' ? <Shield className="w-6 h-6 text-primary" /> : mode === 'HARD' ? <Zap className="w-6 h-6 text-orange-500" /> : <Skull className="w-6 h-6 text-red-500" />}
                          <div className="text-left">
                              <div className="font-bold">{t.difficulty[mode as keyof typeof t.difficulty].name}</div>
                              <div className="text-xs opacity-70">{t.difficulty[mode as keyof typeof t.difficulty].desc}</div>
                          </div>
                      </div>
                      <Play className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity text-primary" />
                  </button>
                ))}
            </div>
          </div>
        )}

        {showGameOverUI && (
          <div className="flex flex-col items-center gap-6 bg-white/80 backdrop-blur-xl p-10 rounded-3xl border border-destructive/20 shadow-2xl animate-in fade-in zoom-in-95 pointer-events-auto">
            <div className="bg-destructive/10 p-4 rounded-full"><RefreshCcw className="w-12 h-12 text-destructive" /></div>
            <h2 className="text-4xl font-extrabold text-foreground">{t.gameOver}</h2>
            <div className="text-center">
                <p className="text-muted-foreground">{t.finalScore}</p>
                <p className="text-5xl font-black text-accent">{score}m</p>
            </div>
            <Button size="lg" onClick={() => handleStart()} className="h-16 px-10 text-xl rounded-full bg-primary hover:bg-primary/80 text-primary-foreground shadow-xl">{t.tryAgain}</Button>
            <Button variant="ghost" onClick={() => setGameState('START')} className="text-muted-foreground">{t.backToMenu}</Button>
          </div>
        )}

        <div className="text-xs text-muted-foreground font-medium opacity-60 uppercase tracking-widest pb-4 text-center flex flex-col md:flex-row items-center gap-2">
            <div className="flex items-center gap-1"><Smartphone className="w-3 h-3" /> {t.instructionsMobile}</div>
            <div className="hidden md:flex items-center gap-1 opacity-50">|</div>
            <div className="flex items-center gap-1"><MoveHorizontal className="w-3 h-3" /> {t.instructions}</div>
        </div>
      </div>
    </div>
  );
}
