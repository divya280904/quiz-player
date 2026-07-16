import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { saveScore } from '../services/firebase';
import { soundManager } from '../services/SoundManager';
import Leaderboard from './Leaderboard';
import { Trophy, RotateCcw, Home, Sparkles, Send, Award, CheckCircle2, XCircle, ChevronDown, ChevronUp } from 'lucide-react';

export default function ResultScreen() {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  // Retrieve parameters from router state
  const state = location.state || {};
  const {
    score = 0,
    correctCount = 0,
    wrongCount = 0,
    totalQuestions = 0,
    percentage = 0,
    userAnswers = [],
    quizTitle = ''
  } = state;

  // State
  const [playerName, setPlayerName] = useState('');
  const [submitStatus, setSubmitStatus] = useState('idle'); // idle, submitting, submitted, error
  const [errorMsg, setErrorMsg] = useState('');
  const [showReview, setShowReview] = useState(false);
  const [refreshLeaderboard, setRefreshLeaderboard] = useState(0);

  // Redirect if accessed directly without data
  useEffect(() => {
    if (!location.state) {
      navigate('/');
    }
  }, [location.state, navigate]);

  // High score triggers
  useEffect(() => {
    if (!location.state) return;

    if (percentage >= 80) {
      soundManager.playSuccess();
      
      // Confetti fanfare
      const duration = 2.5 * 1000;
      const animationEnd = Date.now() + duration;
      const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 100 };

      const randomInRange = (min, max) => Math.random() * (max - min) + min;

      const interval = setInterval(function() {
        const timeLeft = animationEnd - Date.now();

        if (timeLeft <= 0) {
          return clearInterval(interval);
        }

        const particleCount = 50 * (timeLeft / duration);
        // since particles fall down, start a bit higher than random
        confetti(Object.assign({}, defaults, { particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } }));
        confetti(Object.assign({}, defaults, { particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } }));
      }, 250);

      return () => clearInterval(interval);
    } else {
      // Normal completion sound
      soundManager.playCorrect();
    }
  }, [percentage, location.state]);

  const getPerformanceMessage = (pct) => {
    if (pct === 100) return { title: 'Perfect Score!', desc: 'You are a master! Double crown achievement! 🏆', color: 'text-amber-500' };
    if (pct >= 80) return { title: 'Exceptional!', desc: 'Amazing job! You really know your stuff! 🌟', color: 'text-indigo-500 dark:text-indigo-400' };
    if (pct >= 50) return { title: 'Good Attempt!', desc: 'You did well! Keep practicing to get higher. 👍', color: 'text-emerald-500' };
    return { title: 'Keep Training!', desc: 'Review the explanations and try again. You can do it! 💪', color: 'text-rose-500' };
  };

  const performance = getPerformanceMessage(percentage);

  const handleSubmitScore = async (e) => {
    e.preventDefault();
    if (!playerName.trim()) return;

    setSubmitStatus('submitting');
    setErrorMsg('');

    try {
      const res = await saveScore(playerName, id, quizTitle, score, percentage);
      setSubmitStatus('submitted');
      // Trigger leaderboard re-fetch
      setRefreshLeaderboard((prev) => prev + 1);
    } catch (err) {
      console.error(err);
      setErrorMsg('Failed to publish score. Please check connection.');
      setSubmitStatus('error');
    }
  };

  if (!location.state) return null;

  return (
    <main className="max-w-4xl mx-auto px-4 py-8 flex-grow w-full relative z-10">
      {/* Decorative radial glows */}
      <div className="absolute top-10 left-1/4 w-[350px] h-[350px] rounded-full radial-glow-1 -z-10 pointer-events-none" />

      {/* Main Results Header Card */}
      <div className="glass-card rounded-3xl p-8 mb-8 border border-slate-200/50 dark:border-slate-800/50 flex flex-col md:flex-row items-center gap-8 md:gap-12 relative overflow-hidden">
        {/* Score Ring */}
        <div className="relative w-40 h-40 flex items-center justify-center flex-shrink-0">
          <svg className="w-full h-full -rotate-90">
            <circle
              cx="80"
              cy="80"
              r="68"
              className="stroke-slate-200 dark:stroke-slate-800 fill-none"
              strokeWidth="10"
            />
            <motion.circle
              cx="80"
              cy="80"
              r="68"
              className="fill-none stroke-current text-primary-500"
              strokeWidth="10"
              strokeDasharray={2 * Math.PI * 68}
              initial={{ strokeDashoffset: 2 * Math.PI * 68 }}
              animate={{ strokeDashoffset: 2 * Math.PI * 68 - (percentage / 100) * (2 * Math.PI * 68) }}
              transition={{ duration: 1.5, ease: 'easeOut' }}
            />
          </svg>
          <div className="absolute text-center">
            <motion.span
              className="text-4xl font-extrabold text-slate-800 dark:text-white"
              initial={{ scale: 0.5 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.5, type: 'spring' }}
            >
              {percentage}%
            </motion.span>
            <span className="block text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">
              Accuracy
            </span>
          </div>
        </div>

        {/* performance status */}
        <div className="text-center md:text-left flex-grow">
          <span className="text-xs font-bold text-primary-500 dark:text-primary-400 uppercase tracking-widest block mb-1">
            Quiz Result
          </span>
          <h2 className="text-3xl font-extrabold text-slate-800 dark:text-white mb-2 leading-tight">
            {quizTitle}
          </h2>
          <h3 className={`text-2xl font-black mb-3 ${performance.color}`}>
            {performance.title}
          </h3>
          <p className="text-slate-600 dark:text-slate-400 text-sm font-semibold max-w-lg mb-0">
            {performance.desc}
          </p>
        </div>
      </div>

      {/* Grid: Details & Submission / Leaderboard */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        
        {/* Left Column: Stats & Leaderboard submission */}
        <div className="space-y-6">
          {/* Stats overview cards */}
          <div className="grid grid-cols-3 gap-3">
            <div className="glass-card rounded-2xl p-4 text-center border border-slate-200/50 dark:border-slate-800/50">
              <span className="block text-2xl font-black text-slate-800 dark:text-white mb-0.5">
                {score}
              </span>
              <span className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase">
                Score
              </span>
            </div>
            <div className="glass-card rounded-2xl p-4 text-center border border-emerald-200/40 dark:border-emerald-950/20 bg-emerald-50/20 dark:bg-emerald-950/5">
              <span className="block text-2xl font-black text-emerald-600 dark:text-emerald-400 mb-0.5">
                {correctCount}
              </span>
              <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold uppercase">
                Correct
              </span>
            </div>
            <div className="glass-card rounded-2xl p-4 text-center border border-rose-200/40 dark:border-rose-950/20 bg-rose-50/20 dark:bg-rose-950/5">
              <span className="block text-2xl font-black text-rose-600 dark:text-rose-400 mb-0.5">
                {wrongCount}
              </span>
              <span className="text-[10px] text-rose-600 dark:text-rose-400 font-bold uppercase">
                Wrong
              </span>
            </div>
          </div>

          {/* Submit Score to Leaderboard Card */}
          <div className="glass-card rounded-2xl p-6 border border-slate-200/50 dark:border-slate-800/50">
            <h4 className="text-base font-extrabold text-slate-800 dark:text-white flex items-center gap-1.5 mb-4">
              <Award className="w-5 h-5 text-indigo-500" />
              Publish Score to Leaderboard
            </h4>

            {submitStatus === 'submitted' ? (
              <div className="p-4 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/30 rounded-xl text-center text-xs font-semibold">
                🎉 Your score has been published to the leaderboard!
              </div>
            ) : (
              <form onSubmit={handleSubmitScore} className="space-y-4">
                <div className="relative">
                  <input
                    type="text"
                    required
                    maxLength={20}
                    value={playerName}
                    onChange={(e) => setPlayerName(e.target.value)}
                    placeholder="Enter your name..."
                    disabled={submitStatus === 'submitting'}
                    className="w-full px-4 py-3 bg-slate-100/50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/10 rounded-xl outline-none transition-all duration-200 text-sm font-semibold text-slate-800 dark:text-white"
                  />
                </div>
                {errorMsg && (
                  <p className="text-xs font-bold text-rose-500">{errorMsg}</p>
                )}
                <button
                  type="submit"
                  disabled={!playerName.trim() || submitStatus === 'submitting'}
                  className="w-full py-3 bg-primary-600 hover:bg-primary-500 disabled:bg-slate-200 dark:disabled:bg-slate-800 text-white disabled:text-slate-400 font-bold rounded-xl flex items-center justify-center gap-1.5 shadow-md transition-all cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                  {submitStatus === 'submitting' ? 'Publishing...' : 'Publish Score'}
                </button>
              </form>
            )}
          </div>
          
          {/* Action buttons */}
          <div className="flex gap-4">
            <button
              onClick={() => navigate(`/quiz/${id}`, { state: location.state?.state })}
              className="flex-1 py-3.5 bg-gradient-to-r from-primary-600 to-indigo-600 text-white font-bold rounded-xl flex items-center justify-center gap-1.5 shadow-md shadow-primary-500/20 cursor-pointer hover:scale-[1.01] transition-transform active:scale-95"
            >
              <RotateCcw className="w-4 h-4" />
              Play Again
            </button>
            <button
              onClick={() => navigate('/')}
              className="flex-1 py-3.5 bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold rounded-xl flex items-center justify-center gap-1.5 shadow-sm cursor-pointer hover:bg-slate-300 dark:hover:bg-slate-700/80 active:scale-95 transition-transform"
            >
              <Home className="w-4 h-4" />
              Home Menu
            </button>
          </div>
        </div>

        {/* Right Column: Leaderboard display */}
        <div className="glass-card rounded-3xl p-6 border border-slate-200/50 dark:border-slate-800/50 flex flex-col justify-between">
          <Leaderboard quizId={id} refreshTrigger={refreshLeaderboard} />
        </div>
      </div>

      {/* Collapsible Accordion: Review Questions */}
      {userAnswers.length > 0 && (
        <div className="glass-card rounded-2xl border border-slate-200/50 dark:border-slate-800/50 overflow-hidden">
          <button
            onClick={() => setShowReview(!showReview)}
            className="w-full px-6 py-4 flex items-center justify-between text-left font-bold text-slate-800 dark:text-white bg-slate-100/50 dark:bg-slate-900/50 border-b border-slate-200/50 dark:border-slate-800/50 cursor-pointer"
          >
            <span className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-indigo-500" />
              Review Your Answers ({correctCount}/{totalQuestions} Correct)
            </span>
            {showReview ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
          </button>

          <AnimatePresence>
            {showReview && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="p-6 space-y-6 divide-y divide-slate-100 dark:divide-slate-800/60 max-h-[500px] overflow-y-auto no-scrollbar">
                  {userAnswers.map((answer, index) => {
                    const isCorrect = answer.isCorrect;
                    
                    return (
                      <div key={answer.questionId || index} className={`pt-6 ${index === 0 ? 'pt-0' : ''}`}>
                        <div className="flex items-start gap-2.5 mb-3">
                          {isCorrect ? (
                            <CheckCircle2 className="w-5.5 h-5.5 text-emerald-500 flex-shrink-0 mt-0.5" />
                          ) : (
                            <XCircle className="w-5.5 h-5.5 text-rose-500 flex-shrink-0 mt-0.5" />
                          )}
                          <h4 className="font-bold text-slate-800 dark:text-white leading-tight">
                            {index + 1}. {answer.question}
                          </h4>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs font-semibold mb-3 pl-8">
                          <div className={`p-2.5 rounded-lg border ${
                            isCorrect 
                              ? 'bg-emerald-50/50 border-emerald-200 text-emerald-800 dark:bg-emerald-950/20 dark:border-emerald-800/50 dark:text-emerald-400'
                              : 'bg-rose-50/50 border-rose-200 text-rose-800 dark:bg-rose-950/20 dark:border-rose-800/50 dark:text-rose-400'
                          }`}>
                            <span className="block text-[10px] text-slate-400 font-bold uppercase mb-0.5">Your selection:</span>
                            {answer.selected}
                          </div>
                          {!isCorrect && (
                            <div className="p-2.5 rounded-lg border bg-emerald-50/50 border-emerald-200 text-emerald-800 dark:bg-emerald-950/20 dark:border-emerald-800/50 dark:text-emerald-400">
                              <span className="block text-[10px] text-slate-400 font-bold uppercase mb-0.5">Correct Answer:</span>
                              {answer.correct}
                            </div>
                          )}
                        </div>

                        {answer.explanation && (
                          <div className="pl-8 text-xs font-medium text-slate-500 dark:text-slate-400">
                            <span className="font-bold text-slate-700 dark:text-slate-300">Explanation: </span>
                            {answer.explanation}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </main>
  );
}
