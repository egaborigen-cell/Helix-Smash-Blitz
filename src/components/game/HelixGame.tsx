'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { GameManager, GameState, SkinConfig } from './GameManager';
import { Button } from '@/components/ui/button';
import { 
  RefreshCcw, 
  Play, 
  Volume2, 
  VolumeX, 
  Languages, 
  Palette, 
  MoveHorizontal, 
  Smartphone, 
  Info, 
  CircleAlert, 
  ChevronRight, 
  Heart, 
  ArrowRight 
} from 'lucide-react';
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
  { id: 'toy', color: 0xff4500, hex: '#ff4500', gravity: -0.012, bounceStrength: 0.30, scale: 2.8 },
  { id: 'neon', color: 0xff00ff, hex: '#ff00ff', gravity: -0.010, bounceStrength: 0.32, scale: 2.4 },
  { id: 'aqua', color: 0x00ffff, hex: '#00ffff', gravity: -0.015, bounceStrength: 0.28, scale: 2.6 }
];

export default function HelixGame() {
  const containerRef = useRef<HTMLDivElement>(null);
  const managerRef = useRef<GameManager | null>(null);
  
  // Game State
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [gameState, setGameState] = useState<GameState>('START');
  
  // UI State
  const [selectedSkin, setSelectedSkin] = useState<SkinConfig>(SKINS[0]);
  const [isMuted, setIsMuted] = useState(false);
  const [lang, setLang] = useState<Language>('en');
  const [showGameOverUI, setShowGameOverUI] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showSkinDialog, setShowSkinDialog] = useState(false);
  
  // Onboarding Carousel State
  const [onboardingApi, setOnboardingApi] = useState<CarouselApi>();
  const [currentSlide, setCurrentSlide] = useState(0);

  const t = translations[lang];

  // Initialize Game Manager
  useEffect(() => {
    if (!containerRef.current) return;
    
    const manager = new GameManager({
      container: containerRef.current,
      onScoreUpdate: setScore,
      onLivesUpdate: setLives,
      onGameStateChange: setGameState,
    });
    
    managerRef.current = manager;
    
    return () => {
      manager.dispose();
      managerRef.current = null;
    };
  }, []);

  // Handle Onboarding logic
  useEffect(() => {
    const hasPlayed = localStorage.getItem('stepSmash_hasPlayed');
    if (!hasPlayed) {
      setShowOnboarding(true);
    }
    
    const handleContextMenu = (e: MouseEvent) => e.preventDefault();
    window.addEventListener('contextmenu', handleContextMenu);
    return () => window.removeEventListener('contextmenu', handleContextMenu);
  }, []);

  const closeOnboarding = () => {
    setShowOnboarding(false);
    localStorage.setItem('stepSmash_hasPlayed', 'true');
  };

  useEffect(() => {
    if (!onboardingApi) return;
    onboardingApi.on("select", () => {
      setCurrentSlide(onboardingApi.selectedScrollSnap());
    });
  }, [onboardingApi]);

  // Handle Game Over delay
  useEffect(() => {
    if (gameState === 'GAMEOVER') {
      const timer = setTimeout(() => setShowGameOverUI(true), 1200);
      return () => clearTimeout(timer);
    }
    setShowGameOverUI(false);
  }, [gameState]);

  // Input Handling
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
      const normalizedDelta = (deltaPixels / window.innerWidth) * 150;
      manager.moveBall(normalizedDelta);
      lastX = x;
    };

    const onEnd = () => {
      isDragging = false;
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      keysPressed.add(e.key);
      if ((e.key === 'Enter' || e.key === ' ') && !showOnboarding && !showSkinDialog) {
        if (gameState === 'START' || (gameState === 'GAMEOVER' && showGameOverUI)) {
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
        const moveMultiplier = 1.8;
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
    
    const touchStart = (e: TouchEvent) => {
      if (e.touches.length > 0) onStart(e.touches[0].clientX);
    };
    const touchMove = (e: TouchEvent) => {
      if (e.touches.length > 0) onMove(e.touches[0].clientX, e);
    };

    window.addEventListener('mousedown', mouseDown);
    window.addEventListener('mousemove', mouseMove, { passive: false });
    window.addEventListener('mouseup', onEnd);
    window.addEventListener('touchstart', touchStart, { passive: true });
    window.addEventListener('touchmove', touchMove, { passive: false });
    window.addEventListener('touchend', onEnd);
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('mousedown', mouseDown);
      window.removeEventListener('mousemove', mouseMove);
      window.removeEventListener('mouseup', onEnd);
      window.removeEventListener('touchstart', touchStart);
      window.removeEventListener('touchmove', touchMove);
      window.removeEventListener('touchend', onEnd);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      cancelAnimationFrame(rafId);
    };
  }, [gameState, showGameOverUI, showOnboarding, showSkinDialog]);

  const handleStart = useCallback(() => {
    if (managerRef.current) {
      managerRef.current.startGame(selectedSkin);
      setShowGameOverUI(false);
    }
  }, [selectedSkin]);

  const toggleMute = () => {
    if (managerRef.current) {
      setIsMuted(managerRef.current.toggleMute());
    }
  };

  const toggleLang = () => setLang(prev => prev === 'en' ? 'ru' : 'en');
  
  // Heart render helpers
  const heartIndices = [1, 2, 3, 4, 5];

  return (
    <div className="game-container touch-none select-none relative w-full h-full overflow-hidden bg-background">
      {/* 3D Scene Container */}
      <div ref={containerRef} className="absolute inset-0 z-10" />

      {/* UI Layer */}
      <div className="absolute inset-0 z-20 ui-overlay flex flex-col items-center justify-between p-6 pointer-events-none">
        
        {/* Header HUD */}
        <div className="w-full flex justify-between items-start pointer-events-auto max-w-7xl mx-auto">
          <div className="flex gap-6 sm:gap-12">
            <div className="flex flex-col gap-0.5">
              <span className="text-[10px] sm:text-xs font-bold text-muted-foreground/70 uppercase tracking-widest">{t.score}</span>
              <span className="text-2xl sm:text-4xl font-black text-primary drop-shadow-md">{score}m</span>
            </div>
            
            <div className="flex flex-col gap-0.5">
              <span className="text-[10px] sm:text-xs font-bold text-muted-foreground/70 uppercase tracking-widest">{t.lives}</span>
              <div className="flex gap-1.5 items-center h-8 sm:h-10">
                {heartIndices.map((idx) => (
                  <div key={idx} className="relative transition-all duration-700">
                    <Heart 
                      className={cn(
                        "w-5 h-5 sm:w-7 sm:h-7 transition-all duration-500", 
                        idx <= lives 
                          ? "text-red-500 fill-red-500 drop-shadow-[0_0_10px_rgba(239,68,68,0.5)] animate-in zoom-in-50" 
                          : "text-white/5 opacity-0 scale-50 -translate-y-4 rotate-12 pointer-events-none"
                      )} 
                    />
                    {idx === 1 && lives === 1 && gameState === 'PLAYING' && (
                      <div className="absolute inset-0 text-red-500 fill-red-500 animate-heart-beat">
                        <Heart className="w-5 h-5 sm:w-7 sm:h-7" />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="flex gap-2">
            <Button variant="outline" size="icon" onClick={toggleLang} className="w-10 h-10 rounded-2xl bg-white/10 backdrop-blur-md border-white/20 text-foreground hover:bg-white/20 transition-all">
              <Languages className="w-5 h-5" />
            </Button>
            <Button variant="outline" size="icon" onClick={toggleMute} className="w-10 h-10 rounded-2xl bg-white/10 backdrop-blur-md border-white/20 text-foreground hover:bg-white/20 transition-all">
              {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
            </Button>
          </div>
        </div>

        {/* Center UI (Start / Game Over) */}
        <div className="flex-1 flex items-center justify-center w-full">
          {gameState === 'START' && (
            <div className="flex flex-col items-center gap-8 bg-white/5 backdrop-blur-2xl p-10 sm:p-14 rounded-[3rem] border border-white/20 shadow-2xl animate-in zoom-in-95 fade-in duration-500 pointer-events-auto max-w-sm w-full">
              <h1 className="text-5xl sm:text-7xl font-black text-primary tracking-tighter text-center drop-shadow-xl uppercase italic">
                {t.title}
              </h1>
              
              <div className="w-full space-y-4">
                <button 
                  onClick={() => setShowSkinDialog(true)}
                  className="w-full flex items-center justify-between p-5 rounded-3xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all group"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full border-2 border-white/50 shadow-xl" style={{ backgroundColor: selectedSkin.hex }} />
                    <div className="text-left">
                      <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-0.5">{t.selectSkin}</div>
                      <div className="font-black text-foreground text-lg">{t.skins[selectedSkin.id as 'toy' | 'neon' | 'aqua']}</div>
                    </div>
                  </div>
                  <Palette className="w-6 h-6 text-primary group-hover:rotate-12 transition-transform" />
                </button>

                <Button 
                  onClick={handleStart} 
                  className="w-full h-20 text-2xl font-black rounded-3xl bg-primary hover:bg-primary/90 text-primary-foreground shadow-[0_8px_0_rgba(0,0,0,0.2)] active:translate-y-1 active:shadow-none transition-all flex items-center justify-center gap-3 uppercase italic"
                >
                  {t.play}
                  <ArrowRight className="w-8 h-8" />
                </Button>
              </div>
            </div>
          )}

          {showGameOverUI && (
            <div className="flex flex-col items-center gap-8 bg-white/95 backdrop-blur-3xl p-10 sm:p-14 rounded-[3rem] border-8 border-destructive/10 shadow-[0_30px_60px_rgba(0,0,0,0.4)] animate-in fade-in zoom-in-95 duration-500 pointer-events-auto max-w-[90vw] w-full sm:max-w-md text-center">
              <div className="relative">
                <div className="absolute inset-0 bg-destructive/20 blur-3xl rounded-full" />
                <div className="relative bg-destructive/10 p-5 rounded-full border-4 border-destructive/20">
                  <RefreshCcw className="w-16 h-16 text-destructive animate-spin-slow" />
                </div>
              </div>
              
              <div className="space-y-1">
                <h2 className="text-4xl sm:text-5xl font-black text-foreground tracking-tighter uppercase italic">{t.gameOver}</h2>
                <div className="h-1.5 w-24 bg-destructive/40 mx-auto rounded-full" />
              </div>

              <div className="w-full bg-muted/20 p-8 rounded-[2.5rem] border border-white space-y-1 shadow-inner">
                <p className="text-[10px] sm:text-xs font-black text-muted-foreground uppercase tracking-[0.3em]">{t.finalScore}</p>
                <p className="text-6xl sm:text-8xl font-black text-accent drop-shadow-sm tracking-tighter italic">
                  {score}<span className="text-2xl sm:text-3xl ml-1 not-italic text-accent/50">m</span>
                </p>
              </div>

              <div className="flex flex-col gap-4 w-full">
                <Button size="lg" onClick={handleStart} className="h-16 text-xl font-black rounded-2xl bg-primary hover:bg-primary/90 text-primary-foreground shadow-[0_6px_0_rgba(0,0,0,0.1)] active:translate-y-1 active:shadow-none transition-all w-full uppercase italic">
                  {t.tryAgain}
                </Button>
                <Button variant="ghost" onClick={() => setGameState('START')} className="h-12 text-muted-foreground/60 font-black hover:bg-muted/50 rounded-2xl uppercase text-xs tracking-widest">
                  {t.backToMenu}
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Footer Instructions */}
        <div className="w-full flex flex-col items-center gap-2 opacity-50 pb-2">
          <div className="text-[10px] text-muted-foreground font-black uppercase tracking-[0.2em] text-center flex flex-col md:flex-row items-center gap-3">
            <div className="flex items-center gap-2 bg-white/5 px-3 py-1.5 rounded-full">
              <Smartphone className="w-3.5 h-3.5" /> {t.instructionsMobile}
            </div>
            <div className="hidden md:block opacity-30">|</div>
            <div className="flex items-center gap-2 bg-white/5 px-3 py-1.5 rounded-full">
              <MoveHorizontal className="w-3.5 h-3.5" /> {t.instructions}
            </div>
          </div>
        </div>
      </div>

      {/* Onboarding Dialog */}
      <Dialog open={showOnboarding} onOpenChange={setShowOnboarding}>
        <DialogContent className="w-[94vw] max-w-sm bg-white/95 backdrop-blur-3xl border-white/50 shadow-2xl rounded-[2.5rem] p-8 pointer-events-auto overflow-hidden">
          <DialogHeader className="flex flex-col items-center gap-3 mb-4">
            <div className="bg-primary/20 p-4 rounded-3xl"><Info className="w-10 h-10 text-primary" /></div>
            <DialogTitle className="text-3xl font-black text-primary uppercase tracking-tighter text-center italic">{t.onboarding.title}</DialogTitle>
          </DialogHeader>
          
          <div className="relative">
            <Carousel setApi={setOnboardingApi} className="w-full">
              <CarouselContent>
                <CarouselItem className="px-2">
                  <div className="flex flex-col items-center text-center gap-5 py-6">
                    <div className="bg-primary/10 p-5 rounded-[2rem] border border-primary/20"><Play className="w-12 h-12 text-primary" /></div>
                    <div className="space-y-2">
                      <h4 className="font-black text-2xl uppercase tracking-tighter">{t.onboarding.welcome}</h4>
                      <p className="text-sm text-muted-foreground leading-relaxed px-4">{t.onboarding.goal}</p>
                    </div>
                  </div>
                </CarouselItem>
                <CarouselItem className="px-2">
                  <div className="flex flex-col items-center text-center gap-5 py-6">
                    <div className="bg-destructive/10 p-5 rounded-[2rem] border border-destructive/20"><CircleAlert className="w-12 h-12 text-destructive" /></div>
                    <div className="space-y-2">
                      <h4 className="font-black text-2xl uppercase tracking-tighter text-destructive">{t.onboarding.hazardTitle}</h4>
                      <p className="text-sm text-muted-foreground leading-relaxed px-4">{t.onboarding.hazardDesc}</p>
                    </div>
                  </div>
                </CarouselItem>
                <CarouselItem className="px-2">
                  <div className="flex flex-col items-center text-center gap-5 py-6">
                    <div className="bg-accent/10 p-5 rounded-[2rem] border border-accent/20"><MoveHorizontal className="w-12 h-12 text-accent" /></div>
                    <div className="space-y-2">
                      <h4 className="font-black text-2xl uppercase tracking-tighter">{t.instructions}</h4>
                      <p className="text-sm text-muted-foreground leading-relaxed px-4">{t.onboarding.controls}</p>
                    </div>
                  </div>
                </CarouselItem>
              </CarouselContent>
            </Carousel>
            
            <div className="flex justify-center gap-2 mt-4">
              {[0, 1, 2].map((i) => (
                <div key={i} className={cn("w-2.5 h-2.5 rounded-full transition-all duration-300", currentSlide === i ? "bg-primary w-8" : "bg-primary/20")} />
              ))}
            </div>
          </div>

          <div className="mt-8">
            {currentSlide < 2 ? (
              <Button onClick={() => onboardingApi?.scrollNext()} className="h-16 w-full rounded-2xl bg-primary text-primary-foreground font-black text-xl shadow-lg hover:bg-primary/90 flex items-center justify-center gap-2 uppercase tracking-tighter">
                NEXT <ChevronRight className="w-6 h-6" />
              </Button>
            ) : (
              <Button onClick={closeOnboarding} className="h-16 w-full rounded-2xl bg-primary text-primary-foreground font-black text-xl shadow-lg hover:bg-primary/90 animate-in zoom-in-95 duration-300 uppercase tracking-tighter">
                {t.onboarding.gotIt}
              </Button>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Skin Selection Dialog */}
      <Dialog open={showSkinDialog} onOpenChange={setShowSkinDialog}>
        <DialogContent className="w-[94vw] max-w-sm bg-white/95 backdrop-blur-3xl border-white/50 shadow-2xl rounded-[2.5rem] p-8 pointer-events-auto">
          <DialogHeader className="flex flex-col items-center gap-3 mb-6">
            <div className="bg-primary/20 p-4 rounded-3xl"><Palette className="w-10 h-10 text-primary" /></div>
            <DialogTitle className="text-3xl font-black text-primary uppercase tracking-tighter text-center italic">{t.selectSkin}</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-1 gap-4">
            {SKINS.map((skin) => (
              <button 
                key={skin.id} 
                onClick={() => {
                  setSelectedSkin(skin);
                  setShowSkinDialog(false);
                }} 
                className={cn(
                  "flex items-center justify-between p-5 rounded-[2rem] border-4 transition-all group", 
                  selectedSkin.id === skin.id ? "bg-primary/10 border-primary shadow-xl scale-[1.02]" : "bg-white border-transparent hover:border-muted hover:scale-[1.01]"
                )}
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full shadow-lg border-2 border-white" style={{ backgroundColor: skin.hex }} />
                  <div className="text-left">
                    <div className="font-black text-xl uppercase tracking-tighter">{t.skins[skin.id as 'toy' | 'neon' | 'aqua']}</div>
                    <div className="text-xs font-bold text-muted-foreground uppercase opacity-70 tracking-wide">{t.skins.traits[skin.id as 'toy' | 'neon' | 'aqua']}</div>
                  </div>
                </div>
                {selectedSkin.id === skin.id && (
                  <div className="w-4 h-4 rounded-full bg-primary animate-pulse" />
                )}
              </button>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
