'use client';

import React, { useEffect, useRef, useState } from 'react';
import { GameManager, GameState, Difficulty, SkinConfig } from './GameManager';
import { Button } from '@/components/ui/button';
import { Trophy, RefreshCcw, Play, Zap, Shield, Volume2, VolumeX, Skull, Languages, Palette, Baby, Smile, ListOrdered, MoveHorizontal, Smartphone, Info, CircleAlert } from 'lucide-react';
import { cn } from '@/lib/utils';
import { translations, Language } from '@/app/lib/translations';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

declare global {
  interface Window {
    YaGames?: {
      init: () => Promise<any>;
    };
  }
}

const SKINS: SkinConfig[] = [
    { id: 'toxic', color: 0xb8f53d, hex: '#b8f53d', gravity: -0.015, bounceStrength: 0.32, scale: 2.0 },
    { id: 'neon', color: 0xff00ff, hex: '#ff00ff', gravity: -0.012, bounceStrength: 0.37, scale: 0.8 },
    { id: 'aqua', color: 0x00ffff, hex: '#00ffff', gravity: -0.018, bounceStrength: 0.30, scale: 1.2 }
];

interface LeaderboardEntry {
  rank: number;
  score: number;
  name: string;
  photo: string;
}

export default function HelixGame() {
  const containerRef = useRef<HTMLDivElement>(null);
  const managerRef = useRef<GameManager | null>(null);
  const [score, setScore] = useState(0);
  const [gameState, setGameState] = useState<GameState>('START');
  const [showGameOverUI, setShowGameOverUI] = useState(false);
  const [difficulty, setDifficulty] = useState<Difficulty>('EASY');
  const [selectedSkin, setSelectedSkin] = useState(SKINS[0]);
  const [isMuted, setIsMuted] = useState(false);
  const [lang, setLang] = useState<Language>('en');
  const [ysdk, setYsdk] = useState<any>(null);
  const [player, setPlayer] = useState<any>(null);
  const [lbEntries, setLbEntries] = useState<LeaderboardEntry[]>([]);
  const [lbLoading, setLbLoading] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);

  const t = translations[lang];

  useEffect(() => {
    const hasPlayed = localStorage.getItem('stepSmash_hasPlayed');
    if (!hasPlayed) {
      setShowOnboarding(true);
    }

    let retryCount = 0;
    const maxRetries = 10;

    const initYandex = async () => {
      if (typeof window === 'undefined') return;

      if (window.YaGames) {
        try {
          const sdk = await window.YaGames.init();
          setYsdk(sdk);

          if (sdk.environment && sdk.environment.i18n && sdk.environment.i18n.lang) {
            const detectedLang = sdk.environment.i18n.lang;
            if (detectedLang === 'ru' || detectedLang === 'en') {
              setLang(detectedLang as Language);
            }
          }

          try {
            const p = await sdk.getPlayer({ scopes: false });
            setPlayer(p);
          } catch (playerError) {
            console.warn('Player initialization failed:', playerError);
          } finally {
            if (sdk.features && sdk.features.LoadingAPI) {
              sdk.features.LoadingAPI.ready();
            }
          }
        } catch (e) {
          console.error('Yandex SDK failed to initialize', e);
        }
      } else if (retryCount < maxRetries) {
        retryCount++;
        setTimeout(initYandex, 500);
      }
    };

    initYandex();
  }, []);

  const closeOnboarding = () => {
    setShowOnboarding(false);
    localStorage.setItem('stepSmash_hasPlayed', 'true');
  };

  const submitScore = (finalScore: number) => {
    if (!ysdk || finalScore <= 0) return;
    ysdk.getLeaderboards()
      .then((lb: any) => {
        lb.setLeaderboardScore('TopScores', finalScore);
      })
      .catch((err: any) => {
        console.error('Leaderboard submission failed:', err);
      });
  };

  useEffect(() => {
    if (gameState === 'GAMEOVER') {
      submitScore(score);
      const timer = setTimeout(() => {
        setShowGameOverUI(true);
      }, 1500);
      return () => clearTimeout(timer);
    } else {
      setShowGameOverUI(false);
    }
  }, [gameState, score]);

  const fetchLeaderboard = async () => {
    if (!ysdk) return;
    setLbLoading(true);
    try {
      const lb = await ysdk.getLeaderboards();
      const entries = await lb.getLeaderboardEntries('TopScores', {
        quantityTop: 10,
        includeUser: true,
        quantityAround: 3
      });
      
      const formatted = entries.entries.map((e: any) => ({
        rank: e.rank,
        score: e.score,
        name: e.player.publicName || (lang === 'en' ? 'Anonymous' : 'Аноним'),
        photo: e.player.getAvatarSrc('small')
      }));
      setLbEntries(formatted);
    } catch (err) {
      console.error('Failed to fetch leaderboard:', err);
    } finally {
      setLbLoading(false);
    }
  };

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
  }, [gameState, difficulty, selectedSkin, showGameOverUI, showOnboarding]);

  const handleStart = (diff: Difficulty = difficulty) => {
    const manager = managerRef.current;
    if (!manager) return;

    if (ysdk && ysdk.adv) {
      ysdk.adv.showFullscreenAdv({
        callbacks: {
          onOpen: () => manager.setMuted(true),
          onClose: () => {
            manager.setMuted(isMuted);
            manager.startGame(diff, selectedSkin);
          },
          onError: () => manager.startGame(diff, selectedSkin),
          onOffline: () => manager.startGame(diff, selectedSkin)
        }
      });
    } else {
      manager.startGame(diff, selectedSkin);
    }
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
                <Dialog onOpenChange={(open) => open && fetchLeaderboard()}>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="icon" className="rounded-full bg-white/20 backdrop-blur-sm border-white/30 text-foreground hover:bg-white/40">
                      <ListOrdered className="w-5 h-5" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-md bg-white/90 backdrop-blur-xl border-white/30 shadow-2xl rounded-3xl p-6">
                    <DialogHeader>
                      <DialogTitle className="text-2xl font-black text-primary text-center uppercase tracking-tighter">{t.leaderboard}</DialogTitle>
                    </DialogHeader>
                    <div className="mt-4 flex flex-col gap-2 max-h-[60vh] overflow-y-auto pr-2">
                      {lbLoading ? (
                        <div className="text-center py-8 text-muted-foreground font-bold animate-pulse">{t.loading}</div>
                      ) : lbEntries.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">{t.noData}</div>
                      ) : (
                        <div className="flex flex-col gap-2">
                           <div className="grid grid-cols-[40px_1fr_60px] gap-2 px-4 py-2 text-[10px] font-bold text-muted-foreground uppercase tracking-widest border-b border-black/5">
                            <div>{t.rank}</div>
                            <div>{t.player}</div>
                            <div className="text-right">{t.score}</div>
                          </div>
                          {lbEntries.map((entry) => (
                            <div key={entry.rank} className="grid grid-cols-[40px_1fr_60px] items-center gap-2 bg-white/50 p-3 rounded-2xl border border-white/40 shadow-sm">
                              <div className={cn("w-8 h-8 rounded-full flex items-center justify-center font-black text-sm", entry.rank === 1 ? "bg-yellow-400 text-yellow-900" : entry.rank === 2 ? "bg-slate-300 text-slate-700" : entry.rank === 3 ? "bg-orange-300 text-orange-900" : "bg-black/5 text-muted-foreground")}>
                                {entry.rank}
                              </div>
                              <div className="flex items-center gap-3 min-w-0">
                                {entry.photo ? <img src={entry.photo} alt={entry.name} className="w-8 h-8 rounded-full bg-black/10 flex-shrink-0" /> : <div className="w-8 h-8 rounded-full bg-black/10 flex-shrink-0 flex items-center justify-center"><Trophy className="w-4 h-4 text-muted-foreground" /></div>}
                                <span className="font-bold truncate">{entry.name}</span>
                              </div>
                              <div className="font-black text-right text-accent">{entry.score}</div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </DialogContent>
                </Dialog>
                <Button variant="outline" size="icon" onClick={toggleLang} className="rounded-full bg-white/20 backdrop-blur-sm border-white/30 text-foreground hover:bg-white/40"><Languages className="w-5 h-5" /></Button>
                <Button variant="outline" size="icon" onClick={toggleMute} className="rounded-full bg-white/20 backdrop-blur-sm border-white/30 text-foreground hover:bg-white/40">{isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}</Button>
            </div>
        </div>

        <Dialog open={showOnboarding} onOpenChange={setShowOnboarding}>
          <DialogContent className="max-w-md bg-white/95 backdrop-blur-xl border-white/30 shadow-2xl rounded-3xl p-8 pointer-events-auto">
            <DialogHeader className="flex flex-col items-center gap-2">
              <div className="bg-primary/20 p-4 rounded-full"><Info className="w-12 h-12 text-primary" /></div>
              <DialogTitle className="text-3xl font-black text-primary uppercase tracking-tighter text-center">{t.onboarding.title}</DialogTitle>
            </DialogHeader>
            <div className="flex flex-col gap-6 mt-4">
              <div className="flex items-start gap-4 p-4 bg-black/5 rounded-2xl border border-black/5">
                <Play className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
                <div>
                  <h4 className="font-bold text-lg leading-tight mb-1">{t.onboarding.welcome}</h4>
                  <p className="text-sm text-muted-foreground">{t.onboarding.goal}</p>
                </div>
              </div>
              <div className="flex items-start gap-4 p-4 bg-destructive/5 rounded-2xl border border-destructive/10">
                <CircleAlert className="w-6 h-6 text-destructive flex-shrink-0 mt-1" />
                <div>
                  <h4 className="font-bold text-lg leading-tight mb-1 text-destructive">{t.onboarding.hazardTitle}</h4>
                  <p className="text-sm text-muted-foreground">{t.onboarding.hazardDesc}</p>
                </div>
              </div>
              <div className="flex items-start gap-4 p-4 bg-accent/5 rounded-2xl border border-accent/10">
                <MoveHorizontal className="w-6 h-6 text-accent flex-shrink-0 mt-1" />
                <div>
                  <h4 className="font-bold text-lg leading-tight mb-1">{t.instructions}</h4>
                  <p className="text-sm text-muted-foreground">{t.onboarding.controls}</p>
                </div>
              </div>
              <Button onClick={closeOnboarding} className="h-14 w-full rounded-2xl bg-primary text-primary-foreground font-black text-xl shadow-lg hover:bg-primary/90 transition-all">{t.onboarding.gotIt}</Button>
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
