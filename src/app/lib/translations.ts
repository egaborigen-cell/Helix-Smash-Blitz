
export type Language = 'en' | 'ru';

export const translations = {
  en: {
    score: "Distance",
    title: "STEP SMASH",
    play: "START RUN",
    tryAgain: "TRY AGAIN",
    backToMenu: "BACK TO MENU",
    gameOver: "OUT OF STEPS",
    winTitle: "UNBELIEVABLE!",
    winSub: "You reached {diff} level distance!",
    finalScore: "Total Distance",
    instructions: "Arrows or A-D to Move",
    instructionsMobile: "Swipe to Move",
    selectSkin: "SELECT SKIN",
    leaderboard: "Leaderboard",
    loading: "Loading...",
    noData: "No scores yet",
    rank: "Rank",
    player: "Player",
    onboarding: {
      title: "HOW TO PLAY",
      welcome: "Welcome to Step Smash!",
      goal: "Navigate the bouncing ball across floating platforms. Land on yellow steps to keep moving forward.",
      hazard: "DANGER: Avoid the red spikes and hazard zones! One touch and the run ends.",
      controls: "Use Arrows, A/D, or Swipe to move laterally.",
      gotIt: "GOT IT!"
    },
    skins: {
      toxic: "Toxic",
      neon: "Neon",
      aqua: "Aqua",
      traits: {
        toxic: "Big & Balanced",
        neon: "Bouncy & Light",
        aqua: "Fast & Heavy"
      }
    },
    difficulty: {
      PRACTICE: {
        name: "PRACTICE",
        desc: "Slow speed, wide steps"
      },
      BEGINNER: {
        name: "BEGINNER",
        desc: "Relaxed pace"
      },
      EASY: {
        name: "EASY",
        desc: "Standard runner"
      },
      HARD: {
        name: "HARD",
        desc: "Fast & Narrow"
      },
      INSANE: {
        name: "INSANE",
        desc: "Extreme speed, tiny steps"
      }
    }
  },
  ru: {
    score: "Дистанция",
    title: "STEP SMASH",
    play: "НАЧАТЬ ЗАБЕГ",
    tryAgain: "ЕЩЁ РАЗ",
    backToMenu: "В МЕНЮ",
    gameOver: "ШАГИ ЗАКОНЧИЛИСЬ",
    winTitle: "НЕВЕРОЯТНО!",
    winSub: "Дистанция на сложности: {diff}",
    finalScore: "Итоговая дистанция",
    instructions: "Стрелки или A-D для движения",
    instructionsMobile: "Проведи для движения",
    selectSkin: "ВЫБЕРИ СКИН",
    leaderboard: "Таблица лидеров",
    loading: "Загрузка...",
    noData: "Пока нет результатов",
    rank: "Место",
    player: "Игрок",
    onboarding: {
      title: "КАК ИГРАТЬ",
      welcome: "Добро пожаловать в Step Smash!",
      goal: "Управляйте прыгающим шаром. Приземляйтесь на желтые платформы, чтобы двигаться вперед.",
      hazard: "ОПАСНОСТЬ: Избегайте красных шипов! Одно касание — и игра окончена.",
      controls: "Используйте стрелки, A/D или свайпы для движения в стороны.",
      gotIt: "ПОНЯТНО!"
    },
    skins: {
      toxic: "Токсик",
      neon: "Неон",
      aqua: "Аква",
      traits: {
        toxic: "Большой и Баланс",
        neon: "Прыгучий",
        aqua: "Тяжелый"
      }
    },
    difficulty: {
      PRACTICE: {
        name: "ПРАКТИКА",
        desc: "Медленно, широкие шаги"
      },
      BEGINNER: {
        name: "НОВИЧОК",
        desc: "Спокойный темп"
      },
      EASY: {
        name: "ЛЕГКО",
        desc: "Обычный забег"
      },
      HARD: {
        name: "СЛОЖНО",
        desc: "Быстро и узко"
      },
      INSANE: {
        name: "БЕЗУМИЕ",
        desc: "Макс. скорость, крошечные шаги"
      }
    }
  }
};
