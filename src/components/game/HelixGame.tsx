
'use client';

import React, { useEffect, useRef, useState } from 'react';
import { GameManager, GameState, Difficulty } from './GameManager';
import { Button } from '@/components/ui/button';
import { Trophy, RefreshCcw, Play, Zap, Shield, Volume2, VolumeX, Skull, Languages, Palette, Baby, Smile, ListOrdered } from 'lucide-react';
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

const SKINS = [
    { id: 'toxic', color: 0xb8f53d, hex: '#b8f53d' },
    { id: 'neon', color: 0xff00ff, hex: '#ff00ff' },
    { id: 'aqua', color: 0x00ffff, hex: '#00ffff' }
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
  const [difficulty, setDifficulty] = useState<Difficulty>('EASY');
  const [selectedSkin, setSelectedSkin] = useState(SKINS[0]);
  const [isMuted, setIsMuted] = useState(false);
  const [lang, setLang] = useState<Language>('en');
  const [ysdk, setYsdk] = useState<any>(null);
  const [player, setPlayer] = useState<any>(null);
  const [lbEntries, setLbEntries] = useState<LeaderboardEntry[]>([]);
  const [lbLoading, setLbLoading] = useState(false);

  const t = translations[lang];

  useEffect(() => {
    let retryCount = 0;
    const maxRetries = 10;

    const initYandex = async () => {
      if (typeof window !== 'undefined') {
        if (window.YaGames) {
          try {
            const sdk = await window.YaGames.init();
            setYsdk(sdk);
            
            try {
                const p = await sdk.getPlayer({ scopes: false });
                setPlayer(p);
            } catch (playerError) {
                console.warn('Player initialization failed or declined:', playerError);
            }

            if (sdk.features && sdk.features.LoadingAPI) {
              sdk.features.LoadingAPI.ready();
            }
          } catch (e) {
            console.error('Yandex SDK failed to initialize', e);
          }
        } else if (retryCount < maxRetries) {
          retryCount++;
          setTimeout(initYandex, 500);
        }
      }
    };
    initYandex();
  }, []);

  const submitScore = (finalScore: number) => {
    if (ysdk && finalScore > 0) {
      ysdk.getLeaderboards()
        .then((lb: any) => {
          lb.setLeaderboardScore('TopScores', finalScore);
        })
        .catch((err: any) => {
          console.error('Leaderboard submission failed:', err);
        });
    }
  };

  useEffect(() => {
    if (gameState === 'GAMEOVER' || gameState === 'WON') {
      submitScore(score);
    }
  }, [gameState]);

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
        name: e.player.publicName || 'Anonymous',
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
        const delta = x - lastX;
        manager.rotateTower(delta * 2.5); 
        lastX = x;
    };

    const onEnd = () => { isDragging = false; };
    const handleKeyDown = (e: KeyboardEvent) => handleKey(e.key, true);
    const handleKeyUp = (e: KeyboardEvent) => handleKey(e.key, false);

    const handleKey = (key: string, isDown: boolean) => {
      if (isDown) keysPressed.add(key);
      else keysPressed.delete(key);
    };

    let rafId: number;
    const updateKeyboard = () => {
      if (gameState === 'PLAYING') {
        const rotationSpeed = 15;
        if (keysPressed.has('ArrowLeft') || keysPressed.has('a') || keysPressed.has('A')) {
          manager.rotateTower(rotationSpeed);
        }
        if (keysPressed.has('ArrowRight') || keysPressed.has('d') || keysPressed.has('D')) {
          manager.rotateTower(-rotationSpeed);
        }
      }
      rafId = requestAnimationFrame(updateKeyboard);
    };
    rafId = requestAnimationFrame(updateKeyboard);

    const mouseDown = (e: MouseEvent) => onStart(e.clientX);
    const mouseMove = (e: MouseEvent) => onMove(e.clientX, e);
    const mouseUp = () => onEnd();

    const touchStart = (e: TouchEvent) => onStart(e.touches[0].clientX);
    const touchMove = (e: TouchEvent) => onMove(e.touches[0].clientX, e);
    const touchEnd = () => onEnd();

    window.addEventListener('mousedown', mouseDown);
    window.addEventListener('mousemove', mouseMove, { passive: false });
    window.addEventListener('mouseup', mouseUp);
    window.addEventListener('touchstart', touchStart, { passive: false });
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
  }, [gameState]);

  const handleStart = (diff: Difficulty = difficulty) => {
    if (managerRef.current) {
        managerRef.current.startGame(diff, selectedSkin.color);
        
        if (ysdk && ysdk.adv) {
            ysdk.adv.showFullscreenAdv({
                callbacks: {
                    onOpen: () => managerRef.current?.toggleMute(),
                    onClose: () => managerRef.current?.toggleMute()
                }
            });
        }
    }
  };

  const toggleMute = () => {
    if (managerRef.current) {
      const muted = managerRef.current.toggleMute();
      setIsMuted(muted);
    }
  };

  const toggleLang = () => {
    setLang(prev => prev === 'en' ? 'ru' : 'en');
  };

  return (
    <div className="game-container touch-none select-none relative overflow-hidden bg-background">
      {/* 3D Game Layer */}
      <div ref={containerRef} className="w-full h-full relative z-10" />
      
      {/* UI Overlay */}
      <div className="absolute inset-0 z-20 ui-overlay flex flex-col items-center justify-between p-8 pointer-events-none">
        
        {/* HUD */}
        <div className="w-full flex justify-between items-start pointer-events-auto">
            <div className="flex flex-col items-start gap-1">
                <div className="text-xs font-semibold text-muted-foreground tracking-widest uppercase">{t.score}</div>
                <div className="text-4xl font-extrabold text-accent drop-shadow-lg">{score}</div>
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
                      <DialogTitle className="text-2xl font-black text-primary text-center uppercase tracking-tighter">
                        {t.leaderboard}
                      </DialogTitle>
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
                              <div className={cn(
                                "w-8 h-8 rounded-full flex items-center justify-center font-black text-sm",
                                entry.rank === 1 ? "bg-yellow-400 text-yellow-900" : 
                                entry.rank === 2 ? "bg-slate-300 text-slate-700" :
                                entry.rank === 3 ? "bg-orange-300 text-orange-900" : "bg-black/5 text-muted-foreground"
                              )}>
                                {entry.rank}
                              </div>
                              <div className="flex items-center gap-3 min-w-0">
                                <img src={entry.photo} alt={entry.name} className="w-8 h-8 rounded-full bg-black/10 flex-shrink-0" />
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

                <Button variant="outline" size="icon" onClick={toggleLang} className="rounded-full bg-white/20 backdrop-blur-sm border-white/30 text-foreground hover:bg-white/40">
                    <Languages className="w-5 h-5" />
                </Button>
                <Button variant="outline" size="icon" onClick={toggleMute} className="rounded-full bg-white/20 backdrop-blur-sm border-white/30 text-foreground hover:bg-white/40">
                    {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                </Button>
            </div>
        </div>

        {/* Start Screen */}
        {gameState === 'START' && (
          <div className="flex flex-col items-center gap-6 bg-white/10 backdrop-blur-md p-10 rounded-3xl border border-white/20 shadow-2xl animate-in zoom-in-95 duration-500 pointer-events-auto max-w-sm w-full overflow-y-auto max-h-[85vh]">
            <h1 className="text-4xl font-extrabold text-primary tracking-tighter text-center">{t.title}</h1>
            
            {/* Skin Selection */}
            <div className="w-full flex flex-col gap-2">
                <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground tracking-widest uppercase mb-1">
                    <Palette className="w-4 h-4" /> {t.selectSkin}
                </div>
                <div className="flex justify-between gap-3">
                    {SKINS.map((skin) => (
                        <button
                            key={skin.id}
                            onClick={() => setSelectedSkin(skin)}
                            className={cn(
                                "flex-1 flex flex-col items-center gap-2 p-3 rounded-2xl border-2 transition-all",
                                selectedSkin.id === skin.id ? "bg-white/20 border-white" : "bg-white/5 border-transparent opacity-60"
                            )}
                        >
                            <div 
                                className="w-8 h-8 rounded-full shadow-lg border border-white/20" 
                                style={{ backgroundColor: skin.hex }}
                            />
                            <span className="text-[10px] font-bold uppercase tracking-wider">
                                {t.skins[skin.id as keyof typeof t.skins]}
                            </span>
                        </button>
                    ))}
                </div>
            </div>

            {/* Difficulty Selection */}
            <div className="flex flex-col gap-3 w-full">
                <button 
                    onClick={() => {
                        setDifficulty('PRACTICE');
                        handleStart('PRACTICE');
                    }}
                    className={cn(
                        "flex items-center justify-between p-4 rounded-2xl border-2 transition-all group",
                        difficulty === 'PRACTICE' ? "bg-green-500/20 border-green-500 shadow-lg" : "bg-white/5 border-transparent opacity-60 hover:opacity-100"
                    )}
                >
                    <div className="flex items-center gap-3">
                        <Baby className="w-6 h-6 text-green-500" />
                        <div className="text-left">
                            <div className="font-bold">{t.difficulty.PRACTICE.name}</div>
                            <div className="text-xs opacity-70">{t.difficulty.PRACTICE.desc}</div>
                        </div>
                    </div>
                    <Play className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity text-green-500" />
                </button>

                <button 
                    onClick={() => {
                        setDifficulty('BEGINNER');
                        handleStart('BEGINNER');
                    }}
                    className={cn(
                        "flex items-center justify-between p-4 rounded-2xl border-2 transition-all group",
                        difficulty === 'BEGINNER' ? "bg-cyan-500/20 border-cyan-500 shadow-lg" : "bg-white/5 border-transparent opacity-60 hover:opacity-100"
                    )}
                >
                    <div className="flex items-center gap-3">
                        <Smile className="w-6 h-6 text-cyan-500" />
                        <div className="text-left">
                            <div className="font-bold">{t.difficulty.BEGINNER.name}</div>
                            <div className="text-xs opacity-70">{t.difficulty.BEGINNER.desc}</div>
                        </div>
                    </div>
                    <Play className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity text-cyan-500" />
                </button>

                <button 
                    onClick={() => {
                        setDifficulty('EASY');
                        handleStart('EASY');
                    }}
                    className={cn(
                        "flex items-center justify-between p-4 rounded-2xl border-2 transition-all group",
                        difficulty === 'EASY' ? "bg-primary/20 border-primary shadow-lg" : "bg-white/5 border-transparent opacity-60 hover:opacity-100"
                    )}
                >
                    <div className="flex items-center gap-3">
                        <Shield className="w-6 h-6 text-primary" />
                        <div className="text-left">
                            <div className="font-bold">{t.difficulty.EASY.name}</div>
                            <div className="text-xs opacity-70">{t.difficulty.EASY.desc}</div>
                        </div>
                    </div>
                    <Play className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity text-primary" />
                </button>

                <button 
                    onClick={() => {
                        setDifficulty('HARD');
                        handleStart('HARD');
                    }}
                    className={cn(
                        "flex items-center justify-between p-4 rounded-2xl border-2 transition-all group",
                        difficulty === 'HARD' ? "bg-orange-500/20 border-orange-500 shadow-lg" : "bg-white/5 border-transparent opacity-60 hover:opacity-100"
                    )}
                >
                    <div className="flex items-center gap-3">
                        <Zap className="w-6 h-6 text-orange-500" />
                        <div className="text-left">
                            <div className="font-bold">{t.difficulty.HARD.name}</div>
                            <div className="text-xs opacity-70">{t.difficulty.HARD.desc}</div>
                        </div>
                    </div>
                    <Play className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity text-orange-500" />
                </button>

                <button 
                    onClick={() => {
                        setDifficulty('INSANE');
                        handleStart('INSANE');
                    }}
                    className={cn(
                        "flex items-center justify-between p-4 rounded-2xl border-2 transition-all group",
                        difficulty === 'INSANE' ? "bg-red-500/20 border-red-500 shadow-lg" : "bg-white/5 border-transparent opacity-60 hover:opacity-100"
                    )}
                >
                    <div className="flex items-center gap-3">
                        <Skull className="w-6 h-6 text-red-500" />
                        <div className="text-left">
                            <div className="font-bold">{t.difficulty.INSANE.name}</div>
                            <div className="text-xs opacity-70">{t.difficulty.INSANE.desc}</div>
                        </div>
                    </div>
                    <Play className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity text-red-500" />
                </button>
            </div>
          </div>
        )}

        {/* Game Over Screen */}
        {gameState === 'GAMEOVER' && (
          <div className="flex flex-col items-center gap-6 bg-white/80 backdrop-blur-xl p-10 rounded-3xl border border-destructive/20 shadow-2xl animate-in fade-in zoom-in-95 pointer-events-auto">
            <div className="bg-destructive/10 p-4 rounded-full">
                <RefreshCcw className="w-12 h-12 text-destructive" />
            </div>
            <h2 className="text-4xl font-extrabold text-foreground">{t.gameOver}</h2>
            <div className="text-center">
                <p className="text-muted-foreground">{t.finalScore}</p>
                <p className="text-5xl font-black text-accent">{score}</p>
            </div>
            <Button size="lg" onClick={() => handleStart()} className="h-16 px-10 text-xl rounded-full bg-primary hover:bg-primary/80 text-primary-foreground shadow-xl">
                {t.tryAgain}
            </Button>
            <Button variant="ghost" onClick={() => setGameState('START')} className="text-muted-foreground">
                {t.backToMenu}
            </Button>
          </div>
        )}

        {/* Win Screen */}
        {gameState === 'WON' && (
          <div className="flex flex-col items-center gap-6 bg-white/80 backdrop-blur-xl p-10 rounded-3xl border border-primary/20 shadow-2xl animate-in fade-in zoom-in-95 pointer-events-auto">
            <div className="bg-primary/20 p-4 rounded-full">
                <Trophy className="w-12 h-12 text-primary" />
            </div>
            <h2 className="text-4xl font-extrabold text-foreground">{t.winTitle}</h2>
            <p className="text-muted-foreground">{t.winSub.replace('{diff}', t.difficulty[difficulty].name)}</p>
            <div className="text-center">
                <p className="text-muted-foreground">{t.finalScore}</p>
                <p className="text-5xl font-black text-accent">{score}</p>
            </div>
            <Button size="lg" onClick={() => handleStart()} className="h-16 px-10 text-xl rounded-full bg-primary hover:bg-primary/80 text-primary-foreground shadow-xl">
                {t.play} {t.tryAgain}
            </Button>
            <Button variant="ghost" onClick={() => setGameState('START')} className="text-muted-foreground">
                {t.backToMenu}
            </Button>
          </div>
        )}

        <div className="text-xs text-muted-foreground font-medium opacity-50 uppercase tracking-widest pb-4 text-center">
            {t.instructions}
        </div>
      </div>
    </div>
  );
}
