import React, { useState, useMemo, useEffect } from 'react';
import { motion } from 'framer-motion';
import QuizCard from './QuizCard';
import { Search, SlidersHorizontal, Award, ShieldAlert } from 'lucide-react';

export default function QuizList() {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedDifficulty, setSelectedDifficulty] = useState('All');
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/quiz.json')
      .then((res) => res.json())
      .then((data) => {
        setQuizzes(data.quizzes || []);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to load quiz data:', err);
        setLoading(false);
      });
  }, []);

  // Extract categories dynamically
  const categories = useMemo(() => {
    const list = new Set(quizzes.map((q) => q.category));
    return ['All', ...Array.from(list)];
  }, [quizzes]);

  // Filter quizzes
  const filteredQuizzes = useMemo(() => {
    return quizzes.filter((quiz) => {
      const matchesSearch = quiz.title.toLowerCase().includes(search.toLowerCase()) ||
                            quiz.description.toLowerCase().includes(search.toLowerCase()) ||
                            quiz.category.toLowerCase().includes(search.toLowerCase());
      const matchesCategory = selectedCategory === 'All' || quiz.category === selectedCategory;
      const matchesDifficulty = selectedDifficulty === 'All' || quiz.difficulty === selectedDifficulty;
      return matchesSearch && matchesCategory && matchesDifficulty;
    });
  }, [search, selectedCategory, selectedDifficulty, quizzes]);

  // Framer motion variants
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } }
  };

  return (
    <main className="max-w-6xl mx-auto px-4 py-8 flex-grow w-full relative z-10 overflow-hidden">
      {/* Decorative radial glows */}
      <div className="absolute top-10 left-1/4 w-[400px] h-[400px] rounded-full radial-glow-1 -z-10 pointer-events-none" />
      <div className="absolute bottom-20 right-1/4 w-[400px] h-[400px] rounded-full radial-glow-2 -z-10 pointer-events-none" />

      {/* Hero Welcome Banner */}
      <div className="glass-card rounded-3xl p-6 md:p-12 mb-10 border border-slate-200/50 dark:border-slate-800/50 relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-8">
        <div className="relative z-10 max-w-xl text-center md:text-left">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary-100 dark:bg-primary-950/40 text-primary-700 dark:text-primary-300 font-semibold text-xs mb-4">
            <Award className="w-4 h-4 text-primary-500" />
            Compete for the Top Spot
          </div>
          <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight text-slate-800 dark:text-white leading-tight mb-4">
            Test Your Knowledge, <br/>
            <span className="bg-gradient-to-r from-primary-500 to-indigo-500 bg-clip-text text-transparent">
              Rule the Leaderboard!
            </span>
          </h1>
          <p className="text-slate-600 dark:text-slate-400 text-sm md:text-base max-w-lg mb-0 font-medium">
            Choose a category, toggle shufflers, solve under time limits, and publish your scores. Let's see if you can claim the Crown!
          </p>
        </div>
        <div className="relative w-32 h-32 md:w-48 md:h-48 flex-shrink-0 flex items-center justify-center bg-gradient-to-tr from-primary-500 to-indigo-500 rounded-3xl rotate-12 shadow-xl shadow-primary-500/20">
          <span className="text-5xl md:text-6xl select-none">🏆</span>
        </div>
      </div>

      {/* Controls Container */}
      <div className="glass-card rounded-2xl p-5 mb-8 border border-slate-200/50 dark:border-slate-800/50 flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Search */}
        <div className="relative flex-grow max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search quizzes by title or category..."
            className="w-full pl-11 pr-4 py-3 bg-slate-100/50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/10 rounded-xl outline-none transition-all duration-200 text-sm font-medium text-slate-800 dark:text-white"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 mr-1 text-sm font-semibold w-full md:w-auto">
            <SlidersHorizontal className="w-4 h-4" />
            Filters:
          </div>

          {/* Category Filter */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="flex-grow md:flex-grow-0 bg-slate-100/50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2.5 outline-none text-xs font-semibold text-slate-700 dark:text-slate-300 focus:border-primary-500 cursor-pointer"
          >
            {categories.map((cat) => (
              <option key={cat} value={cat} className="bg-white dark:bg-slate-900">
                Category: {cat}
              </option>
            ))}
          </select>

          {/* Difficulty Filter */}
          <select
            value={selectedDifficulty}
            onChange={(e) => setSelectedDifficulty(e.target.value)}
            className="flex-grow md:flex-grow-0 bg-slate-100/50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2.5 outline-none text-xs font-semibold text-slate-700 dark:text-slate-300 focus:border-primary-500 cursor-pointer"
          >
            <option value="All" className="bg-white dark:bg-slate-900">Difficulty: All</option>
            <option value="Easy" className="bg-white dark:bg-slate-900">Easy</option>
            <option value="Medium" className="bg-white dark:bg-slate-900">Medium</option>
            <option value="Hard" className="bg-white dark:bg-slate-900">Hard</option>
          </select>
        </div>
      </div>

      {/* Grid listing quizzes */}
      {loading ? (
        <div className="flex justify-center items-center py-24">
          <div className="w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : filteredQuizzes.length > 0 ? (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {filteredQuizzes.map((quiz) => (
            <motion.div key={quiz.id} variants={cardVariants}>
              <QuizCard quiz={quiz} />
            </motion.div>
          ))}
        </motion.div>
      ) : (
        /* Empty State */
        <div className="glass-card rounded-2xl p-12 text-center max-w-lg mx-auto border border-slate-200/50 dark:border-slate-800/50">
          <div className="w-16 h-16 rounded-full bg-rose-50 dark:bg-rose-950/20 text-rose-500 flex items-center justify-center mx-auto mb-4">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-2">No Quizzes Found</h3>
          <p className="text-sm text-slate-600 dark:text-slate-400 mb-6">
            We couldn't find any quizzes matching your search or filters. Try adjusting your selections or clear search terms.
          </p>
          <button
            onClick={() => {
              setSearch('');
              setSelectedCategory('All');
              setSelectedDifficulty('All');
            }}
            className="px-5 py-2.5 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-semibold rounded-xl text-xs transition-colors duration-200 cursor-pointer"
          >
            Clear All Filters
          </button>
        </div>
      )}
    </main>
  );
}
