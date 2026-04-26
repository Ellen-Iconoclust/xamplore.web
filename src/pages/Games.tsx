import React, { useState, useEffect } from 'react';
import { Trophy, RotateCcw, Gamepad2, Star, Target, Sparkles, Code, Brain, Zap, Heart, Info, XCircle, CheckCircle2, Loader2, Share2, PlayCircle, Send, ChevronDown, ChevronUp, User as UserIcon, BookOpen, ExternalLink, Play, Keyboard, Lightbulb, Delete, Award } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { WORDS } from '../data/hangmanWords';
import { LOGIC_PUZZLES } from '../data/logicPuzzles';
import { WORDLE_WORDS } from '../data/wordleWords';
import { getDailyWordObj } from '../utils/wordle';
import { User } from '../types';
import { db } from '../firebase';
import { doc, updateDoc, arrayUnion } from 'firebase/firestore';

interface GamesProps {
  user: User | null;
}

export default function Games({ user }: GamesProps) {
  const [activeGame, setActiveGame] = useState<'hangman' | 'logic' | 'wordle'>('hangman');
  
  // Hangman State
  const [wordObj, setWordObj] = useState(() => WORDS[Math.floor(Math.random() * WORDS.length)]);
  const [guessedLetters, setGuessedLetters] = useState<string[]>([]);
  const [mistakes, setMistakes] = useState(0);
  const [hangmanScore, setHangmanScore] = useState(0);
  const [hangmanGameOver, setHangmanGameOver] = useState(false);
  const [hangmanWon, setHangmanWon] = useState(false);
  const [showHint, setShowHint] = useState(false);

  // Logic Lab State
  const [shuffledPuzzles, setShuffledPuzzles] = useState(() => [...LOGIC_PUZZLES].sort(() => Math.random() - 0.5));
  const [currentLogicIndex, setCurrentLogicIndex] = useState(0);
  const [logicScore, setLogicScore] = useState(0);
  const [logicGameOver, setLogicGameOver] = useState(false);
  const [logicFeedback, setLogicFeedback] = useState<{ correct: boolean; message: string } | null>(null);

  // Tech Wordle State
  const [wordleTargetObj, setWordleTargetObj] = useState(getDailyWordObj);
  const wordleTarget = wordleTargetObj.word.toUpperCase();
  
  const wordleLength = wordleTarget.length;
  const maxWordleRows = wordleLength <= 4 ? 4 : wordleLength <= 6 ? 6 : 7;

  const [wordleGuesses, setWordleGuesses] = useState<string[]>(() => {
    const today = new Date().toISOString().split('T')[0];
    const saved = localStorage.getItem(`wordle_guesses_${today}`);
    return saved ? JSON.parse(saved) : [];
  });
  const [currentWordleGuess, setCurrentWordleGuess] = useState('');
  const [wordleStatus, setWordleStatus] = useState<'playing' | 'won' | 'lost'>(() => {
    const today = new Date().toISOString().split('T')[0];
    const saved = localStorage.getItem(`wordle_status_${today}`);
    return (saved as 'playing' | 'won' | 'lost') || 'playing';
  });
  const [wordleShake, setWordleShake] = useState(false);

  const maxMistakes = 6;

  const resetHangman = () => {
    const randomWord = WORDS[Math.floor(Math.random() * WORDS.length)];
    setWordObj(randomWord);
    setGuessedLetters([]);
    setMistakes(0);
    setHangmanGameOver(false);
    setHangmanWon(false);
    setShowHint(false);
  };

  const handleHangmanGuess = (letter: string) => {
    if (hangmanGameOver || guessedLetters.includes(letter)) return;

    setGuessedLetters(prev => [...prev, letter]);

    if (!wordObj.word.includes(letter)) {
      setMistakes(prev => {
        const next = prev + 1;
        if (next >= maxMistakes) {
          setHangmanGameOver(true);
          setHangmanWon(false);
          
          // Reset hangman streak on loss
          if (user) {
            updateDoc(doc(db, 'users', user.uid), {
              hangmanStreak: 0
            }).catch(err => console.error('Failed to reset hangman streak:', err));
          }
        }
        return next;
      });
    }
  };

  const handleLogicAnswer = (selected: string) => {
    if (logicFeedback) return;

    const current = shuffledPuzzles[currentLogicIndex];
    const isCorrect = selected === current.answer;

    if (isCorrect) {
      setLogicScore(prev => prev + 20);
      setLogicFeedback({ correct: true, message: 'Correct! ' + current.explanation });
    } else {
      setLogicFeedback({ correct: false, message: 'Incorrect. ' + current.explanation });
    }

    setTimeout(() => {
      const puzzlesPerSession = 10;
      if (currentLogicIndex < puzzlesPerSession - 1 && currentLogicIndex < shuffledPuzzles.length - 1) {
        setCurrentLogicIndex(prev => prev + 1);
        setLogicFeedback(null);
      } else {
        setLogicGameOver(true);
      }
    }, 3000);
  };

  const resetLogic = () => {
    setShuffledPuzzles([...LOGIC_PUZZLES].sort(() => Math.random() - 0.5));
    setCurrentLogicIndex(0);
    setLogicScore(0);
    setLogicGameOver(false);
    setLogicFeedback(null);
  };

  const resetWordle = () => {
    const today = new Date().toISOString().split('T')[0];
    localStorage.removeItem(`wordle_guesses_${today}`);
    localStorage.removeItem(`wordle_status_${today}`);
    setWordleGuesses([]);
    setWordleStatus('playing');
    setCurrentWordleGuess('');
  };

  // Wordle Logic
  const handleWordleKeyPress = React.useCallback((key: string) => {
    if (wordleStatus !== 'playing') return;

    if (key === 'ENTER') {
      if (currentWordleGuess.length !== wordleLength) {
        setWordleShake(true);
        setTimeout(() => setWordleShake(false), 500);
        return;
      }
      
      const guessToSubmit = currentWordleGuess;
      const today = new Date().toISOString().split('T')[0];
      
      setWordleGuesses(prev => {
        const newGuesses = [...prev, guessToSubmit];
        localStorage.setItem(`wordle_guesses_${today}`, JSON.stringify(newGuesses));
        return newGuesses;
      });

      if (guessToSubmit === wordleTarget) {
        setWordleStatus('won');
        localStorage.setItem(`wordle_status_${today}`, 'won');
        
        // Update streak and handle achievements in Firestore
        if (user) {
          const lastSolved = user.wordleLastSolved;
          const currentStreak = user.wordleStreak || 0;
          let newStreak = 1;

          if (lastSolved) {
            const lastDate = new Date(lastSolved);
            const todayDate = new Date(today);
            const diffTime = Math.abs(todayDate.getTime() - lastDate.getTime());
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

            if (diffDays === 1) {
              newStreak = currentStreak + 1;
            }
          }

          const updates: any = {
            wordleStreak: newStreak,
            wordleLastSolved: today
          };

          if (newStreak >= 30 && (!user.achievements || !user.achievements.includes('Wordle Wordsworth'))) {
            updates.achievements = arrayUnion('Wordle Wordsworth');
          }

          updateDoc(doc(db, 'users', user.uid), updates).catch(err => console.error('Failed to update wordle streak:', err));
        }
      } else if (wordleGuesses.length + 1 >= maxWordleRows) {
        setWordleStatus('lost');
        localStorage.setItem(`wordle_status_${today}`, 'lost');
        
        // Reset streak in Firestore on loss
        if (user) {
          updateDoc(doc(db, 'users', user.uid), {
            wordleStreak: 0
          }).catch(err => console.error('Failed to reset wordle streak:', err));
        }
      }
      
      setCurrentWordleGuess('');
    } else if (key === 'BACKSPACE') {
      setCurrentWordleGuess(prev => prev.slice(0, -1));
    } else if (/^[A-Z]$/.test(key) && currentWordleGuess.length < wordleLength) {
      setCurrentWordleGuess(prev => prev + key);
    }
  }, [wordleStatus, currentWordleGuess, wordleTarget, wordleGuesses, wordleLength, maxWordleRows]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (activeGame !== 'wordle') return;
      const key = e.key.toUpperCase();
      if (key === 'ENTER' || key === 'BACKSPACE' || /^[A-Z]$/.test(key)) {
        handleWordleKeyPress(key);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeGame, handleWordleKeyPress]);

  const getGuessStatuses = React.useCallback((guess: string) => {
    const statuses = Array(wordleLength).fill('absent');
    const targetChars = wordleTarget.split('');
    const guessChars = guess.split('');

    // First pass: Correct
    for (let i = 0; i < wordleLength; i++) {
      if (guessChars[i] === targetChars[i]) {
        statuses[i] = 'correct';
        targetChars[i] = '';
      }
    }

    // Second pass: Present
    for (let i = 0; i < wordleLength; i++) {
      if (statuses[i] !== 'correct') {
        const index = targetChars.indexOf(guessChars[i]);
        if (index !== -1 && guessChars[i] !== '') {
          statuses[i] = 'present';
          targetChars[index] = '';
        }
      }
    }

    return statuses;
  }, [wordleTarget, wordleLength]);

  useEffect(() => {
    if (activeGame === 'hangman') {
      const isWon = wordObj.word.split('').every(letter => guessedLetters.includes(letter));
      if (isWon) {
        setHangmanWon(true);
        setHangmanGameOver(true);
        setHangmanScore(prev => prev + 10);
        
        // Update hangman streak only if 0 mistakes
          if (user && mistakes === 0) {
            const newStreak = (user.hangmanStreak || 0) + 1;
            const updates: any = {
              hangmanStreak: newStreak
            };
            
            const levels = [
              { streak: 10, id: 'Non-Hanger 1' },
              { streak: 30, id: 'Non-Hanger 2' },
              { streak: 60, id: 'Non-Hanger 3' },
              { streak: 120, id: 'Non-Hanger 4' },
              { streak: 300, id: 'Non-Hanger 5' }
            ];

            const earned = levels
              .filter(l => newStreak >= l.streak && (!user.achievements || !user.achievements.includes(l.id)))
              .map(l => l.id);

            if (earned.length > 0) {
              updates.achievements = arrayUnion(...earned);
            }
            
            updateDoc(doc(db, 'users', user.uid), updates).catch(err => console.error('Failed to update hangman streak:', err));
          } else if (user) {
          // Reset streak if errors were made but still won
          updateDoc(doc(db, 'users', user.uid), {
            hangmanStreak: 0
          }).catch(err => console.error('Failed to reset hangman streak due to error:', err));
        }
      }
    }
  }, [guessedLetters, wordObj.word, activeGame, user, mistakes]);

  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

  return (
    <section className="py-16 bg-gray-50 min-h-screen">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Game Selector Tabs */}
        <div className="mb-12">
          {/* Desktop Tabs */}
          <div className="hidden md:flex justify-center p-1 bg-gray-200 rounded-2xl w-fit mx-auto">
            <button
              onClick={() => setActiveGame('hangman')}
              className={`px-6 py-3 rounded-xl font-bold transition-all duration-300 flex items-center gap-2 whitespace-nowrap ${
                activeGame === 'hangman' 
                ? 'bg-white text-emerald-600 shadow-md' 
                : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              <Gamepad2 size={20} /> Tech Hangman
            </button>
            <button
              onClick={() => setActiveGame('wordle')}
              className={`px-6 py-3 rounded-xl font-bold transition-all duration-300 flex items-center gap-2 whitespace-nowrap ${
                activeGame === 'wordle' 
                ? 'bg-white text-emerald-600 shadow-md' 
                : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              <Keyboard size={20} /> Tech Wordle
            </button>
            <button
              onClick={() => setActiveGame('logic')}
              className={`px-6 py-3 rounded-xl font-bold transition-all duration-300 flex items-center gap-2 whitespace-nowrap ${
                activeGame === 'logic' 
                ? 'bg-white text-emerald-600 shadow-md' 
                : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              <Brain size={20} /> Logic Lab
            </button>
          </div>

          {/* Mobile Dropdown */}
          <div className="md:hidden w-full max-w-xs mx-auto">
            <div className="relative">
              <select
                value={activeGame}
                onChange={(e) => setActiveGame(e.target.value as any)}
                className="w-full bg-white border-2 border-emerald-100 rounded-2xl px-6 py-4 font-bold text-emerald-600 shadow-lg appearance-none focus:outline-none focus:border-emerald-500 transition-all"
              >
                <option value="hangman">Tech Hangman</option>
                <option value="wordle">Tech Wordle</option>
                <option value="logic">Logic Lab</option>
              </select>
              <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-emerald-600">
                <ChevronDown size={24} />
              </div>
            </div>
          </div>
        </div>

        {activeGame === 'hangman' ? (
          <div id="hangman">
            <div className="text-center mb-12">
              <h2 className="text-4xl md:text-5xl font-extrabold brand text-emerald-600 mb-4">
                Tech Hangman
              </h2>
              <p className="text-xl text-gray-600 mb-6">Test your programming vocabulary!</p>
              <div className="flex items-center justify-center gap-6">
                <div className="bg-white px-6 py-2 rounded-full shadow-md border border-emerald-100 flex items-center gap-2">
                  <Trophy className="text-yellow-500 w-5 h-5" />
                  <span className="font-bold text-gray-800">Score: {hangmanScore}</span>
                </div>
                <div className="bg-white px-6 py-2 rounded-full shadow-md border border-emerald-100 flex items-center gap-2">
                  <Heart className="text-red-500 w-5 h-5" />
                  <span className="font-bold text-gray-800">Lives: {maxMistakes - mistakes}</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-3xl p-8 md:p-12 shadow-2xl border border-gray-100 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-50 rounded-full -mr-32 -mt-32 opacity-50"></div>
              
              <div className="relative z-10">
                <div className="flex flex-wrap justify-center gap-3 mb-12">
                  {wordObj.word.split('').map((letter, i) => (
                    <div 
                      key={i} 
                      className={`w-10 h-12 md:w-12 md:h-16 border-b-4 flex items-center justify-center text-2xl md:text-3xl font-bold transition-all duration-300 ${
                        guessedLetters.includes(letter) ? 'border-emerald-500 text-emerald-600' : 'border-gray-300 text-transparent'
                      }`}
                    >
                      {guessedLetters.includes(letter) ? letter : '_'}
                    </div>
                  ))}
                </div>

                <div className="text-center mb-12">
                  <button 
                    onClick={() => setShowHint(!showHint)}
                    className="text-emerald-600 hover:text-emerald-700 font-bold flex items-center gap-2 mx-auto transition-colors"
                  >
                    <Info size={20} />
                    {showHint ? 'Hide Hint' : 'Show Hint'}
                  </button>
                  <AnimatePresence>
                    {showHint && (
                      <motion.p 
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="mt-4 text-gray-600 italic bg-emerald-50 p-4 rounded-xl border border-emerald-100 inline-block"
                      >
                        {wordObj.hint}
                      </motion.p>
                    )}
                  </AnimatePresence>
                </div>

                <div className="grid grid-cols-7 sm:grid-cols-9 md:grid-cols-13 gap-2 md:gap-3 mb-12">
                  {alphabet.map(letter => {
                    const isGuessed = guessedLetters.includes(letter);
                    const isCorrect = isGuessed && wordObj.word.includes(letter);
                    const isWrong = isGuessed && !wordObj.word.includes(letter);

                    return (
                      <button
                        key={letter}
                        onClick={() => handleHangmanGuess(letter)}
                        disabled={isGuessed || hangmanGameOver}
                        className={`w-full aspect-square rounded-lg font-bold text-sm md:text-base flex items-center justify-center transition-all duration-200 shadow-sm ${
                          isCorrect ? 'bg-emerald-500 text-white shadow-emerald-200' :
                          isWrong ? 'bg-red-500 text-white shadow-red-200' :
                          isGuessed ? 'bg-gray-100 text-gray-400 cursor-not-allowed' :
                          'bg-white text-gray-700 hover:bg-emerald-50 hover:text-emerald-600 border border-gray-200 hover:border-emerald-300'
                        }`}
                      >
                        {letter}
                      </button>
                    );
                  })}
                </div>

                <AnimatePresence>
                  {hangmanGameOver && (
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="absolute inset-0 bg-white/95 backdrop-blur-sm z-20 flex flex-col items-center justify-center p-8 text-center rounded-3xl"
                    >
                      <div className={`w-24 h-24 rounded-full flex items-center justify-center mb-6 ${hangmanWon ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-600'}`}>
                        {hangmanWon ? <CheckCircle2 size={64} /> : <XCircle size={64} />}
                      </div>
                      <h3 className={`text-4xl font-bold mb-4 ${hangmanWon ? 'text-emerald-600' : 'text-red-600'}`}>
                        {hangmanWon ? 'Excellent Work!' : 'Game Over'}
                      </h3>
                      <p className="text-xl text-gray-700 mb-8 font-medium">
                        {hangmanWon ? 'You decoded the tech term!' : `The word was: ${wordObj.word}`}
                      </p>
                      <div className="flex flex-col sm:flex-row gap-4 w-full max-w-md">
                        <button 
                          onClick={resetHangman}
                          className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-4 px-8 rounded-xl shadow-lg transition duration-300 flex items-center justify-center gap-2"
                        >
                          <RotateCcw size={20} /> Play Again
                        </button>
                        <button 
                          onClick={() => window.location.href = '/'}
                          className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold py-4 px-8 rounded-xl transition duration-300"
                        >
                          Return Home
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        ) : activeGame === 'wordle' ? (
          <div id="wordle">
            <div className="text-center mb-12">
              <h2 className="text-4xl md:text-5xl font-extrabold brand text-emerald-600 mb-4">
                Tech Wordle
              </h2>
              <p className="text-xl text-gray-600 mb-6 font-medium">One shared tech word every day!</p>
              <div className="flex items-center justify-center gap-6">
                <div className="bg-white px-6 py-2 rounded-full shadow-md border border-emerald-100 flex items-center gap-2">
                  <Star className="text-emerald-500 w-5 h-5" />
                  <span className="font-bold text-gray-800">Daily Challenge</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-3xl p-8 md:p-12 shadow-2xl border border-gray-100 relative overflow-hidden min-h-[600px]">
              <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-50 rounded-full -mr-32 -mt-32 opacity-50"></div>
              
              <div className="relative z-10">
                {/* Status Message */}
                <div className="h-12 flex items-center justify-center mb-8">
                  <AnimatePresence mode="wait">
                    {wordleStatus === 'won' ? (
                      <motion.p
                        key="won"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-[#6aaa64] font-bold text-2xl flex items-center gap-2"
                      >
                        <CheckCircle2 size={28} /> Genius! Today's word decoded.
                      </motion.p>
                    ) : wordleStatus === 'lost' ? (
                      <motion.p
                        key="lost"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-red-500 font-bold text-2xl flex items-center gap-2"
                      >
                        <XCircle size={28} /> Game Over. The word was {wordleTarget}.
                      </motion.p>
                    ) : null}
                  </AnimatePresence>
                </div>

                <div className="flex flex-col items-center gap-12">
                  {/* Wordle Grid */}
                  <div className={`grid ${wordleLength > 7 ? 'gap-1' : 'gap-2'} ${wordleShake ? 'animate-shake' : ''} w-full max-w-full overflow-x-auto pb-4`} style={{ gridTemplateRows: `repeat(${maxWordleRows}, 1fr)` }}>
                    {[...Array(maxWordleRows)].map((_, rowIndex) => {
                      const guess = wordleGuesses[rowIndex] || (rowIndex === wordleGuesses.length ? currentWordleGuess : '');
                      const isSubmitted = rowIndex < wordleGuesses.length;

                      return (
                        <div key={rowIndex} className={`grid ${wordleLength > 7 ? 'gap-1' : 'gap-2'} mx-auto w-full`} style={{ gridTemplateColumns: `repeat(${wordleLength}, 1fr)`, maxWidth: `${wordleLength * 3.5}rem` }}>
                          {[...Array(wordleLength)].map((_, colIndex) => {
                            const letter = guess[colIndex] || '';
                            const statuses = isSubmitted ? getGuessStatuses(guess) : [];
                            const status = isSubmitted ? statuses[colIndex] : letter ? 'tbd' : 'empty';

                            return (
                              <motion.div
                                key={colIndex}
                                initial={false}
                                animate={isSubmitted ? { 
                                  rotateX: [0, 90, 0],
                                  backgroundColor: status === 'correct' ? '#6aaa64' : status === 'present' ? '#c9b458' : '#3a3a3c',
                                  borderColor: status === 'correct' ? '#6aaa64' : status === 'present' ? '#c9b458' : '#3a3a3c',
                                  color: '#ffffff'
                                } : {
                                  scale: letter ? [1, 1.1, 1] : 1,
                                  borderColor: letter ? '#565758' : '#e5e7eb',
                                  backgroundColor: '#ffffff',
                                  color: '#1f2937'
                                }}
                                transition={{ 
                                  rotateX: { duration: 0.6, delay: colIndex * 0.1, times: [0, 0.5, 1] },
                                  scale: { duration: 0.1 },
                                  backgroundColor: { delay: colIndex * 0.1 + 0.3 },
                                  borderColor: { delay: colIndex * 0.1 + 0.3 }
                                }}
                                className="aspect-square w-full border-2 flex items-center justify-center font-bold rounded-sm uppercase transition-all duration-300 text-sm sm:text-base md:text-2xl lg:text-3xl"
                                style={{ fontSize: `calc(min(1.5rem, ${80 / wordleLength}vw))` }}
                              >
                                {letter}
                              </motion.div>
                            );
                          })}
                        </div>
                      );
                    })}
                  </div>

                  {/* Virtual Keyboard */}
                  <div className="w-full max-w-2xl mt-8">
                    {[
                      ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
                      ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
                      ['ENTER', 'Z', 'X', 'C', 'V', 'B', 'N', 'M', 'BACKSPACE']
                    ].map((row, i) => (
                      <div key={i} className="flex justify-center gap-1 mb-2">
                        {row.map(key => {
                          const isSpecial = key === 'ENTER' || key === 'BACKSPACE';
                          
                          // Determine key status based on all guesses
                          let keyStatus = 'unused';
                          for (const guess of wordleGuesses) {
                            const statuses = getGuessStatuses(guess);
                            const charIndex = guess.indexOf(key);
                            if (charIndex !== -1) {
                              const status = statuses[charIndex];
                              if (status === 'correct') {
                                keyStatus = 'correct';
                                break;
                              } else if (status === 'present' && keyStatus !== 'correct') {
                                keyStatus = 'present';
                              } else if (status === 'absent' && keyStatus === 'unused') {
                                keyStatus = 'absent';
                              }
                            }
                          }

                          return (
                            <button
                              key={key}
                              onClick={() => handleWordleKeyPress(key)}
                              disabled={wordleStatus !== 'playing'}
                              className={`${
                                isSpecial ? 'px-1 sm:px-4 text-[10px] sm:text-xs min-w-[3.5rem] sm:min-w-[4.5rem]' : 'flex-1 min-w-[1.75rem] sm:min-w-[2.5rem] text-xs sm:text-base'
                              } h-12 sm:h-14 md:h-16 rounded-md sm:rounded-lg font-bold transition-all duration-200 flex items-center justify-center ${
                                keyStatus === 'correct' ? 'bg-[#6aaa64] text-white' :
                                keyStatus === 'present' ? 'bg-[#c9b458] text-white' :
                                keyStatus === 'absent' ? 'bg-[#3a3a3c] text-white' :
                                'bg-gray-200 text-gray-700 hover:bg-gray-300'
                              } ${wordleStatus !== 'playing' ? 'opacity-50 cursor-not-allowed' : 'active:scale-95'}`}
                            >
                              {key === 'BACKSPACE' ? <Delete size={18} /> : key}
                            </button>
                          );
                        })}
                      </div>
                    ))}
                  </div>

                  {/* Reset Button */}
                  <div className="mt-8 text-center">
                    <button
                      onClick={resetWordle}
                      className="px-8 py-3 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 transition-all duration-300 shadow-lg hover:shadow-emerald-200 flex items-center gap-2 mx-auto"
                    >
                      <RotateCcw size={20} /> Reset Game
                    </button>
                  </div>

                  {/* Word Definition */}
                  <AnimatePresence>
                    {(wordleStatus !== 'playing') && (
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mt-12 p-8 bg-emerald-50 rounded-3xl border border-emerald-100 max-w-2xl w-full"
                      >
                        <div className="flex items-center gap-3 mb-4">
                          <div className="bg-emerald-600 p-2 rounded-lg text-white">
                            <Lightbulb size={24} />
                          </div>
                          <h4 className="text-2xl font-bold text-gray-800">
                            {wordleTarget}
                          </h4>
                        </div>
                        
                        <p className="text-lg text-gray-700 leading-relaxed italic">
                          "{wordleTargetObj.definition}"
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div id="logic">
            <div className="text-center mb-12">
              <h2 className="text-4xl md:text-5xl font-extrabold brand text-emerald-600 mb-4">
                Logic Lab
              </h2>
              <p className="text-xl text-gray-600 mb-6">Master programming logic puzzles!</p>
              <div className="flex items-center justify-center gap-6">
                <div className="bg-white px-6 py-2 rounded-full shadow-md border border-emerald-100 flex items-center gap-2">
                  <Trophy className="text-yellow-500 w-5 h-5" />
                  <span className="font-bold text-gray-800">Score: {logicScore}</span>
                </div>
                <div className="bg-white px-6 py-2 rounded-full shadow-md border border-emerald-100 flex items-center gap-2">
                  <Star className="text-emerald-500 w-5 h-5" />
                  <span className="font-bold text-gray-800">Puzzle: {currentLogicIndex + 1}/10</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-3xl p-8 md:p-12 shadow-2xl border border-gray-100 relative overflow-hidden min-h-[500px] flex flex-col">
              <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-50 rounded-full -mr-32 -mt-32 opacity-50"></div>
              
              <div className="relative z-10 flex-1 flex flex-col">
                <div className="mb-8">
                  <h4 className="text-sm font-bold text-emerald-600 uppercase tracking-widest mb-4">What is the output of this code?</h4>
                  <div className="bg-gray-900 rounded-2xl p-6 font-mono text-emerald-400 shadow-inner overflow-x-auto">
                    <pre className="text-sm md:text-base whitespace-pre-wrap">
                      {shuffledPuzzles[currentLogicIndex].code}
                    </pre>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-auto">
                  {shuffledPuzzles[currentLogicIndex].options.map((option, i) => (
                    <button
                      key={i}
                      onClick={() => handleLogicAnswer(option)}
                      disabled={!!logicFeedback || logicGameOver}
                      className={`p-6 rounded-2xl font-bold text-lg transition-all duration-300 border-2 text-center ${
                        logicFeedback?.correct && option === shuffledPuzzles[currentLogicIndex].answer
                          ? 'bg-emerald-500 border-emerald-500 text-white'
                          : !logicFeedback?.correct && logicFeedback && option === shuffledPuzzles[currentLogicIndex].answer
                          ? 'bg-emerald-100 border-emerald-500 text-emerald-700'
                          : !logicFeedback?.correct && logicFeedback && option !== shuffledPuzzles[currentLogicIndex].answer
                          ? 'bg-gray-50 border-gray-200 text-gray-400'
                          : 'bg-white border-gray-100 text-gray-700 hover:border-emerald-500 hover:bg-emerald-50'
                      }`}
                    >
                      {option}
                    </button>
                  ))}
                </div>

                <AnimatePresence>
                  {logicFeedback && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`mt-8 p-6 rounded-2xl border flex items-start gap-4 ${
                        logicFeedback.correct 
                        ? 'bg-emerald-50 border-emerald-200 text-emerald-800' 
                        : 'bg-red-50 border-red-200 text-red-800'
                      }`}
                    >
                      <div className={`shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${logicFeedback.correct ? 'bg-emerald-200' : 'bg-red-200'}`}>
                        {logicFeedback.correct ? <CheckCircle2 size={24} /> : <XCircle size={24} />}
                      </div>
                      <p className="font-medium">{logicFeedback.message}</p>
                    </motion.div>
                  )}
                </AnimatePresence>

                <AnimatePresence>
                  {logicGameOver && (
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="absolute inset-0 bg-white/95 backdrop-blur-sm z-20 flex flex-col items-center justify-center p-8 text-center rounded-3xl"
                    >
                      <div className="w-24 h-24 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mb-6">
                        <Trophy size={64} />
                      </div>
                      <h3 className="text-4xl font-bold mb-4 text-emerald-600">
                        Lab Complete!
                      </h3>
                      <p className="text-xl text-gray-700 mb-8 font-medium">
                        You've mastered the logic puzzles with a score of {logicScore}!
                      </p>
                      <div className="flex flex-col sm:flex-row gap-4 w-full max-w-md">
                        <button 
                          onClick={resetLogic}
                          className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-4 px-8 rounded-xl shadow-lg transition duration-300 flex items-center justify-center gap-2"
                        >
                          <RotateCcw size={20} /> Try Again
                        </button>
                        <button 
                          onClick={() => window.location.href = '/'}
                          className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold py-4 px-8 rounded-xl transition duration-300"
                        >
                          Return Home
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        )}

        {/* Game Tips */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
            <div className="bg-emerald-100 w-10 h-10 rounded-lg flex items-center justify-center mb-4">
              <Brain className="text-emerald-600 w-6 h-6" />
            </div>
            <h4 className="font-bold text-gray-800 mb-2">Think Logically</h4>
            <p className="text-sm text-gray-600">Consider common programming terms and patterns.</p>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
            <div className="bg-emerald-100 w-10 h-10 rounded-lg flex items-center justify-center mb-4">
              <Zap className="text-emerald-600 w-6 h-6" />
            </div>
            <h4 className="font-bold text-gray-800 mb-2">Use Hints</h4>
            <p className="text-sm text-gray-600">Stuck? Use the hint to narrow down the possibilities.</p>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
            <div className="bg-emerald-100 w-10 h-10 rounded-lg flex items-center justify-center mb-4">
              <Target className="text-emerald-600 w-6 h-6" />
            </div>
            <h4 className="font-bold text-gray-800 mb-2">Master Terms</h4>
            <p className="text-sm text-gray-600">Learn new tech vocabulary while having fun!</p>
          </div>
        </div>
      </div>
    </section>
  );
}
