
export type Language = 'en' | 'ru';

export const translations = {
  en: {
    score: "Score",
    title: "HELIX SMASH",
    play: "PLAY",
    tryAgain: "TRY AGAIN",
    backToMenu: "BACK TO MENU",
    gameOver: "GAME OVER",
    winTitle: "YOU SMASHED IT!",
    winSub: "Level completed on {diff} mode!",
    finalScore: "Final Score",
    instructions: "Drag or use Arrows to Rotate",
    difficulty: {
      EASY: {
        name: "EASY",
        desc: "Shorter tower, more gaps"
      },
      HARD: {
        name: "HARD",
        desc: "Tall tower, high danger"
      },
      INSANE: {
        name: "INSANE",
        desc: "50 levels, 1 gap, extreme risk"
      }
    }
  },
  ru: {
    score: "Счёт",
    title: "HELIX SMASH",
    play: "ИГРАТЬ",
    tryAgain: "ЕЩЁ РАЗ",
    backToMenu: "В МЕНЮ",
    gameOver: "ИГРА ОКОНЧЕНА",
    winTitle: "ПОБЕДА!",
    winSub: "Пройдено на сложности: {diff}",
    finalScore: "Итоговый счёт",
    instructions: "Тяни или жми стрелки",
    difficulty: {
      EASY: {
        name: "ЛЕГКО",
        desc: "Короткая башня, много просветов"
      },
      HARD: {
        name: "СЛОЖНО",
        desc: "Высокая башня, больше опасностей"
      },
      INSANE: {
        name: "БЕЗУМИЕ",
        desc: "50 уровней, 1 просвет, макс. риск"
      }
    }
  }
};
