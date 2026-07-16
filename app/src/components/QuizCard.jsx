import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Play, HelpCircle, Clock, Shuffle, Globe, Code, Film, FlaskConical, Trophy } from 'lucide-react';

export default function QuizCard({ quiz }) {
  const navigate = useNavigate();
  const [shuffleQuestions, setShuffleQuestions] = useState(false);
  const [shuffleOptions, setShuffleOptions] = useState(false);

  const getDifficultyStyles = (diff) => {
    switch (diff.toLowerCase()) {
      case 'easy':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-800/50';
      case 'medium':
        return 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/20 dark:text-amber-400 dark:border-amber-800/50';
      case 'hard':
        return 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/20 dark:text-rose-400 dark:border-rose-800/50';
      default:
        return 'bg-slate-50 text-slate-700 border-slate-200 dark:bg-slate-900 dark:text-slate-400 dark:border-slate-800';
    }
  };

  const getCategoryHeader = (cat) => {
    switch (cat.toLowerCase()) {
      case 'general knowledge':
        return {
          gradient: 'from-blue-500 to-cyan-500 text-white',
          icon: <Globe className="w-6 h-6" />,
        };
      case 'programming':
        return {
          gradient: 'from-violet-500 to-fuchsia-500 text-white',
          icon: <Code className="w-6 h-6" />,
        };
      case 'entertainment':
        return {
          gradient: 'from-pink-500 to-rose-500 text-white',
          icon: <Film className="w-6 h-6" />,
        };
      case 'science':
        return {
          gradient: 'from-emerald-500 to-teal-500 text-white',
          icon: <FlaskConical className="w-6 h-6" />,
        };
      case 'sports':
        return {
          gradient: 'from-amber-500 to-orange-500 text-white',
          icon: <Trophy className="w-6 h-6" />,
        };
      default:
        return {
          gradient: 'from-slate-500 to-slate-700 text-white',
          icon: <HelpCircle className="w-6 h-6" />,
        };
    }
  };

  const handleStart = () => {
    navigate(`/quiz/${quiz.id}`, {
      state: { shuffleQuestions, shuffleOptions }
    });
  };

  const header = getCategoryHeader(quiz.category);

  return (
    <div className="glass-card hover:scale-[1.01] hover:shadow-xl transition-all duration-300 rounded-2xl overflow-hidden flex flex-col justify-between border border-slate-200/50 dark:border-slate-800/50 group h-full">
      {/* Category Header Gradient */}
      <div className={`h-24 bg-gradient-to-r ${header.gradient} flex items-center justify-between px-6 relative overflow-hidden`}>
        <div className="absolute -right-4 -bottom-4 opacity-15 scale-[2.2] pointer-events-none">
          {header.icon}
        </div>
        <div className="z-10 bg-white/20 backdrop-blur-md p-2.5 rounded-xl border border-white/20">
          {header.icon}
        </div>
      </div>

      <div className="p-6 flex-grow">
        {/* Category & Difficulty */}
        <div className="flex items-center justify-between mb-4">
          <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-primary-50 dark:bg-primary-950/30 text-primary-600 dark:text-primary-400 border border-primary-200/30 dark:border-primary-800/30">
            {quiz.category}
          </span>
          <span className={`text-xs font-semibold px-2.5 py-1 rounded-lg border ${getDifficultyStyles(quiz.difficulty)}`}>
            {quiz.difficulty}
          </span>
        </div>

        {/* Title & Description */}
        <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-2 leading-tight group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors duration-200">
          {quiz.title}
        </h3>
        <p className="text-sm text-slate-600 dark:text-slate-400 mb-6 line-clamp-2">
          {quiz.description}
        </p>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 mb-6 py-4 border-y border-slate-200/50 dark:border-slate-800/50 text-slate-600 dark:text-slate-400">
          <div className="flex items-center gap-2">
            <HelpCircle className="w-4.5 h-4.5 text-primary-500" />
            <span className="text-xs font-semibold">{quiz.totalQuestions} Questions</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="w-4.5 h-4.5 text-primary-500" />
            <span className="text-xs font-semibold">{quiz.timePerQuestion}s / Q</span>
          </div>
        </div>

        {/* Config Options */}
        <div className="bg-slate-100/50 dark:bg-slate-900/40 rounded-xl p-4 mb-4">
          <div className="flex items-center gap-1.5 mb-3">
            <Shuffle className="w-4 h-4 text-primary-500" />
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Tweak Game Options</span>
          </div>
          
          <div className="space-y-3">
            <label className="flex items-center justify-between cursor-pointer">
              <span className="text-xs text-slate-600 dark:text-slate-400 font-medium select-none">Shuffle Questions</span>
              <div className="relative inline-flex items-center">
                <input
                  type="checkbox"
                  checked={shuffleQuestions}
                  onChange={(e) => setShuffleQuestions(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-slate-300 dark:bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary-600"></div>
              </div>
            </label>

            <label className="flex items-center justify-between cursor-pointer">
              <span className="text-xs text-slate-600 dark:text-slate-400 font-medium select-none">Shuffle Options</span>
              <div className="relative inline-flex items-center">
                <input
                  type="checkbox"
                  checked={shuffleOptions}
                  onChange={(e) => setShuffleOptions(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-slate-300 dark:bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary-600"></div>
              </div>
            </label>
          </div>
        </div>
      </div>

      <div className="p-6 pt-0">
        <button
          onClick={handleStart}
          className="w-full py-3.5 bg-gradient-to-r from-primary-600 to-indigo-600 hover:from-primary-500 hover:to-indigo-500 text-white font-semibold rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-primary-500/20 active:scale-[0.98] transition-all duration-200 cursor-pointer"
        >
          <Play className="w-4 h-4 fill-current" />
          Play Quiz
        </button>
      </div>
    </div>
  );
}
