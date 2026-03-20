import { WORDLE_WORDS, WordleWord } from '../data/wordleWords';

export function getDailyWordObj(): WordleWord {
  const today = new Date();
  const dateString = today.toISOString().split('T')[0];
  
  let hash = 0;
  for (let i = 0; i < dateString.length; i++) {
    hash = ((hash << 5) - hash) + dateString.charCodeAt(i);
    hash |= 0;
  }
  const index = Math.abs(hash) % WORDLE_WORDS.length;
  return WORDLE_WORDS[index];
}
