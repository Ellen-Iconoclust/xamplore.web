import React from 'react';
import { motion } from 'motion/react';

interface MascotProps {
  className?: string;
  mood?: 'happy' | 'thinking' | 'warning' | 'sad';
}

export default function Mascot({ className = "", mood = 'happy' }: MascotProps) {
  // Using the original Xavi mascot image from the reference
  const mascotImg = "https://xamplore1.vercel.app/xavi-intro.png";

  return (
    <div className={`relative ${className}`}>
      <motion.div 
        animate={{ y: [0, -10, 0] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        className="relative"
      >
        <div className="w-40 h-40 flex items-center justify-center">
          <img 
            src={mascotImg} 
            alt="Xavi the Fox" 
            className="w-full h-auto drop-shadow-xl"
            referrerPolicy="no-referrer"
          />
        </div>
      </motion.div>
      
      {/* Speech Bubble */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.8, x: 20 }}
        animate={{ opacity: 1, scale: 1, x: 0 }}
        className="absolute -top-12 -right-32 bg-white p-4 rounded-2xl shadow-lg border border-emerald-100 min-w-[150px] z-10"
      >
        <p className="text-sm font-medium text-secondary">
          {mood === 'happy' && "Welcome to Xamplore!"}
          {mood === 'thinking' && "Let me check that..."}
          {mood === 'warning' && "Stay focused on the test!"}
          {mood === 'sad' && "Oh no, something went wrong."}
        </p>
        <div className="absolute bottom-[-8px] left-4 w-4 h-4 bg-white rotate-45 border-b border-r border-emerald-100"></div>
      </motion.div>
    </div>
  );
}
