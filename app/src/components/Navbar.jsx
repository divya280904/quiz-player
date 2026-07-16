import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { soundManager } from '../services/SoundManager';
import { Sun, Moon, Volume2, VolumeX, Sparkles } from 'lucide-react';

export default function Navbar() {
  const { isDark, toggleTheme } = useTheme();
  const [isMuted, setIsMuted] = useState(soundManager.isMuted());

  const handleSoundToggle = () => {
    const nextMute = !isMuted;
    soundManager.setMuted(nextMute);
    setIsMuted(nextMute);
    if (!nextMute) {
      soundManager.playCorrect();
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full bg-white/70 dark:bg-slate-950/70 border-b border-slate-200/50 dark:border-slate-800/50 backdrop-blur-md transition-colors duration-300">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-primary-500 to-indigo-500 flex items-center justify-center text-white shadow-md shadow-primary-500/20 group-hover:rotate-6 transition-transform">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <span className="font-bold text-lg tracking-tight bg-gradient-to-r from-primary-600 to-indigo-600 dark:from-primary-400 dark:to-indigo-400 bg-clip-text text-transparent">
              QuizSphere
            </span>
            <span className="block text-[10px] text-slate-500 dark:text-slate-400 font-semibold -mt-1">
              Active Player
            </span>
          </div>
        </Link>

        <div className="flex items-center gap-2">
          {/* Sound Toggle */}
          <button
            onClick={handleSoundToggle}
            className="p-2.5 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/60 transition-colors duration-200"
            aria-label={isMuted ? "Unmute sound effects" : "Mute sound effects"}
            title={isMuted ? "Unmute sound effects" : "Mute sound effects"}
          >
            {isMuted ? <VolumeX className="w-5 h-5 text-rose-500" /> : <Volume2 className="w-5 h-5 text-emerald-500" />}
          </button>

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="p-2.5 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/60 transition-colors duration-200"
            aria-label={isDark ? "Activate light mode" : "Activate dark mode"}
            title={isDark ? "Activate light mode" : "Activate dark mode"}
          >
            {isDark ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5 text-indigo-400" />}
          </button>
        </div>
      </div>
    </header>
  );
}
