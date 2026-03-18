import React, { useState, useEffect } from 'react';
import { Trophy, RotateCcw, Gamepad2, Star, Target, Sparkles, Code, Brain, Zap, Heart, Info, XCircle, CheckCircle2, Loader2, Share2, PlayCircle, Send, ChevronDown, ChevronUp, User, BookOpen, ExternalLink, Play } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const WORDS = [
  { word: 'PYTHON', hint: 'A versatile high-level programming language' },
  { word: 'JAVASCRIPT', hint: 'The language of the web' },
  { word: 'REACT', hint: 'A popular frontend library' },
  { word: 'DATABASE', hint: 'Where data is stored' },
  { word: 'ALGORITHM', hint: 'Step-by-step problem solving' },
  { word: 'COMPILER', hint: 'Translates code to machine language' },
  { word: 'VARIABLE', hint: 'A container for data' },
  { word: 'FUNCTION', hint: 'A reusable block of code' },
  { word: 'FRONTEND', hint: 'The user-facing part of an app' },
  { word: 'BACKEND', hint: 'The server-side part of an app' }
];

export default function Games() {
  const [wordObj, setWordObj] = useState(WORDS[0]);
  const [guessedLetters, setGuessedLetters] = useState<string[]>([]);
  const [mistakes, setMistakes] = useState(0);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [won, setWon] = useState(false);
  const [showHint, setShowHint] = useState(false);

  const maxMistakes = 6;

  const resetGame = () => {
    const randomWord = WORDS[Math.floor(Math.random() * WORDS.length)];
    setWordObj(randomWord);
    setGuessedLetters([]);
    setMistakes(0);
    setGameOver(false);
    setWon(false);
    setShowHint(false);
  };

  const handleGuess = (letter: string) => {
    if (gameOver || guessedLetters.includes(letter)) return;

    setGuessedLetters(prev => [...prev, letter]);

    if (!wordObj.word.includes(letter)) {
      setMistakes(prev => {
        const next = prev + 1;
        if (next >= maxMistakes) {
          setGameOver(true);
          setWon(false);
        }
        return next;
      });
    }
  };

  useEffect(() => {
    const isWon = wordObj.word.split('').every(letter => guessedLetters.includes(letter));
    if (isWon) {
      setWon(true);
      setGameOver(true);
      setScore(prev => prev + 10);
    }
  }, [guessedLetters, wordObj.word]);

  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

  return (
    <section id="hangman" className="py-16 bg-gray-50 min-h-screen">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-extrabold brand text-emerald-600 mb-4">
            Tech Hangman
          </h2>
          <p className="text-xl text-gray-600 mb-6">Test your programming vocabulary!</p>
          <div className="flex items-center justify-center gap-6">
            <div className="bg-white px-6 py-2 rounded-full shadow-md border border-emerald-100 flex items-center gap-2">
              <Trophy className="text-yellow-500 w-5 h-5" />
              <span className="font-bold text-gray-800">Score: {score}</span>
            </div>
            <div className="bg-white px-6 py-2 rounded-full shadow-md border border-emerald-100 flex items-center gap-2">
              <Heart className="text-red-500 w-5 h-5" />
              <span className="font-bold text-gray-800">Lives: {maxMistakes - mistakes}</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-8 md:p-12 shadow-2xl border border-gray-100 relative overflow-hidden">
          {/* Background Decoration */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-50 rounded-full -mr-32 -mt-32 opacity-50"></div>
          
          <div className="relative z-10">
            {/* Word Display */}
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

            {/* Hint Section */}
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

            {/* Keyboard */}
            <div className="grid grid-cols-7 sm:grid-cols-9 md:grid-cols-13 gap-2 md:gap-3 mb-12">
              {alphabet.map(letter => {
                const isGuessed = guessedLetters.includes(letter);
                const isCorrect = isGuessed && wordObj.word.includes(letter);
                const isWrong = isGuessed && !wordObj.word.includes(letter);

                return (
                  <button
                    key={letter}
                    onClick={() => handleGuess(letter)}
                    disabled={isGuessed || gameOver}
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

            {/* Game Status Overlay */}
            <AnimatePresence>
              {gameOver && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="absolute inset-0 bg-white/95 backdrop-blur-sm z-20 flex flex-col items-center justify-center p-8 text-center rounded-3xl"
                >
                  <div className={`w-24 h-24 rounded-full flex items-center justify-center mb-6 ${won ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-600'}`}>
                    {won ? <CheckCircle2 size={64} /> : <XCircle size={64} />}
                  </div>
                  <h3 className={`text-4xl font-bold mb-4 ${won ? 'text-emerald-600' : 'text-red-600'}`}>
                    {won ? 'Excellent Work!' : 'Game Over'}
                  </h3>
                  <p className="text-xl text-gray-700 mb-8 font-medium">
                    {won ? 'You decoded the tech term!' : `The word was: ${wordObj.word}`}
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4 w-full max-w-md">
                    <button 
                      onClick={resetGame}
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
