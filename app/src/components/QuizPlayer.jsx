import React, { useState, useEffect, useRef } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { soundManager } from '../services/SoundManager';
import { Clock, HelpCircle, ArrowLeft, ArrowRight, CheckCircle2, XCircle } from 'lucide-react';

export default function QuizPlayer() {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  // Configurations from route state
  const { shuffleQuestions = false, shuffleOptions = false } = location.state || {};

  // Component state
  const [quiz, setQuiz] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [timeLeft, setTimeLeft] = useState(15);
  const [score, setScore] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [wrongCount, setWrongCount] = useState(0);
  const [userAnswers, setUserAnswers] = useState([]); // Array to store user selections: { questionId, question, selected, correct, isCorrect }
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(false);

  const timerRef = useRef(null);

  // Fetch quiz details at runtime
  useEffect(() => {
    fetch('/quiz.json')
      .then((res) => res.json())
      .then((data) => {
        const found = data.quizzes?.find((q) => q.id === id);
        if (found) {
          setQuiz(found);
          setTimeLeft(found.timePerQuestion);
          
          let quizQuestions = [...found.questions];
          if (shuffleQuestions) {
            quizQuestions.sort(() => Math.random() - 0.5);
          }
          if (shuffleOptions) {
            quizQuestions = quizQuestions.map((q) => ({
              ...q,
              options: [...q.options].sort(() => Math.random() - 0.5)
            }));
          }
          setQuestions(quizQuestions);
          setLoading(false);
        } else {
          setFetchError(true);
          setLoading(false);
        }
      })
      .catch((err) => {
        console.error('Error fetching quiz data:', err);
        setFetchError(true);
        setLoading(false);
      });
  }, [id, shuffleQuestions, shuffleOptions]);

  const currentQuestion = questions[currentIdx];

  // Start question timer
  useEffect(() => {
    if (loading || !currentQuestion || isAnswered || !quiz) return;

    setTimeLeft(quiz.timePerQuestion);

    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          handleTimeout();
          return 0;
        }
        
        // Play critical tick sound when time is <= 5 seconds
        if (prev <= 6) {
          soundManager.playTick();
        }
        
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [currentIdx, loading, isAnswered, quiz, currentQuestion]);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (loading || !currentQuestion) return;

      // Escape to exit quiz
      if (e.key === 'Escape') {
        const confirmExit = window.confirm('Are you sure you want to quit the quiz? Your progress will be lost.');
        if (confirmExit) navigate('/');
        return;
      }

      // Option selection keys: A, B, C, D or 1, 2, 3, 4
      if (!isAnswered) {
        const key = e.key.toLowerCase();
        let index = -1;
        if (key === 'a' || key === '1') index = 0;
        else if (key === 'b' || key === '2') index = 1;
        else if (key === 'c' || key === '3') index = 2;
        else if (key === 'd' || key === '4') index = 3;

        if (index >= 0 && index < currentQuestion.options.length) {
          handleOptionClick(currentQuestion.options[index]);
        }
      } else {
        // Proceed on Space or Enter
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleNext();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentQuestion, isAnswered, loading]);

  const handleOptionClick = (option) => {
    if (isAnswered) return;
    
    if (timerRef.current) clearInterval(timerRef.current);
    setSelectedOption(option);
    setIsAnswered(true);

    const isCorrect = option === currentQuestion.correctAnswer;
    if (isCorrect) {
      setScore((prev) => prev + currentQuestion.points);
      setCorrectCount((prev) => prev + 1);
      soundManager.playCorrect();
    } else {
      setWrongCount((prev) => prev + 1);
      soundManager.playIncorrect();
    }

    setUserAnswers((prev) => [
      ...prev,
      {
        questionId: currentQuestion.id,
        question: currentQuestion.question,
        selected: option,
        correct: currentQuestion.correctAnswer,
        isCorrect,
        explanation: currentQuestion.explanation,
        pointsAwarded: isCorrect ? currentQuestion.points : 0
      }
    ]);
  };

  const handleTimeout = () => {
    if (isAnswered) return;
    setIsAnswered(true);
    setSelectedOption(''); // Empty indicates timeout
    setWrongCount((prev) => prev + 1);
    soundManager.playIncorrect();

    setUserAnswers((prev) => [
      ...prev,
      {
        questionId: currentQuestion.id,
        question: currentQuestion.question,
        selected: '[Time Out]',
        correct: currentQuestion.correctAnswer,
        isCorrect: false,
        explanation: currentQuestion.explanation,
        pointsAwarded: 0
      }
    ]);

    // Automatically advance after a 1.8 second delay to let them see the correct answer
    setTimeout(() => {
      handleNext();
    }, 1800);
  };

  const handleNext = () => {
    if (currentIdx < questions.length - 1) {
      setCurrentIdx((prev) => prev + 1);
      setSelectedOption(null);
      setIsAnswered(false);
    } else {
      // Finished all questions! Route to results.
      const percentage = Math.round((correctCount / questions.length) * 100);
      navigate(`/quiz/${quiz.id}/results`, {
        state: {
          score,
          correctCount,
          wrongCount,
          totalQuestions: questions.length,
          percentage,
          userAnswers,
          quizTitle: quiz.title
        }
      });
    }
  };

  const handleBackToHome = () => {
    const confirmExit = window.confirm('Quit current quiz? Score progress will not be saved.');
    if (confirmExit) navigate('/');
  };

  if (loading || !currentQuestion || !quiz) {
    return (
      <div className="flex-grow flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (fetchError) {
    return (
      <div className="max-w-md mx-auto my-12 text-center p-8 glass-card rounded-2xl">
        <h3 className="text-xl font-bold text-rose-500 mb-2">Quiz Not Found</h3>
        <button onClick={() => navigate('/')} className="px-4 py-2 bg-primary-600 text-white rounded-xl cursor-pointer">
          Back to Home
        </button>
      </div>
    );
  }

  const progressPercent = Math.round(((currentIdx + 1) / questions.length) * 100);
  const timerRadius = 24;
  const strokeDash = 2 * Math.PI * timerRadius;
  const strokeDashOffset = strokeDash - (timeLeft / quiz.timePerQuestion) * strokeDash;

  return (
    <main className="max-w-3xl mx-auto px-4 py-6 md:py-10 flex-grow w-full relative z-10 flex flex-col justify-center">
      {/* Quiz Top Action Controls */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={handleBackToHome}
          className="flex items-center gap-1.5 text-sm font-semibold text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          Exit Quiz
        </button>
        
        {/* Topic Banner */}
        <div className="text-right">
          <span className="text-xs font-semibold text-primary-500 dark:text-primary-400 block">
            {quiz.category}
          </span>
          <span className="text-sm font-bold text-slate-800 dark:text-white">
            {quiz.title}
          </span>
        </div>
      </div>

      {/* Progress & State Dashboard */}
      <div className="glass-card rounded-2xl p-4 md:p-6 mb-6 border border-slate-200/50 dark:border-slate-800/50 flex items-center justify-between gap-4">
        {/* Left Side: Question count & Horizontal progress bar */}
        <div className="flex-grow">
          <div className="flex items-end justify-between mb-2">
            <span className="text-sm font-bold text-slate-800 dark:text-white">
              Question <span className="text-primary-500">{currentIdx + 1}</span> of {questions.length}
            </span>
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
              {progressPercent}% Complete
            </span>
          </div>
          {/* Progress Bar Container */}
          <div className="w-full h-3 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-primary-500 to-indigo-500 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progressPercent}%` }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
            />
          </div>
        </div>

        {/* Right Side: Circular timer indicator */}
        <div className="flex-shrink-0 flex items-center justify-center relative w-16 h-16">
          <svg className="w-full h-full -rotate-90">
            <circle
              cx="32"
              cy="32"
              r={timerRadius}
              className="stroke-slate-200 dark:stroke-slate-800 fill-none"
              strokeWidth="4"
            />
            <motion.circle
              cx="32"
              cy="32"
              r={timerRadius}
              className={`fill-none stroke-current ${
                timeLeft <= 5 ? 'text-rose-500 animate-pulse' : 'text-primary-500'
              }`}
              strokeWidth="4"
              strokeDasharray={strokeDash}
              animate={{ strokeDashoffset: strokeDashOffset }}
              transition={{ duration: 1, ease: 'linear' }}
            />
          </svg>
          <div className="absolute text-center">
            <span className={`text-sm font-extrabold ${timeLeft <= 5 ? 'text-rose-500 text-base' : 'text-slate-800 dark:text-white'}`}>
              {timeLeft}
            </span>
            <span className="block text-[8px] text-slate-400 -mt-1 font-bold">secs</span>
          </div>
        </div>
      </div>

      {/* Main Play Area */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentIdx}
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -50 }}
          transition={{ duration: 0.25 }}
          className="glass-card rounded-3xl p-6 md:p-8 mb-6 border border-slate-200/50 dark:border-slate-800/50 flex-grow"
        >
          {/* Question Text */}
          <div className="flex items-start gap-3 mb-6">
            <HelpCircle className="w-6 h-6 text-primary-500 flex-shrink-0 mt-0.5" />
            <h2 className="text-xl md:text-2xl font-bold text-slate-800 dark:text-white leading-snug">
              {currentQuestion.question}
            </h2>
          </div>

          {/* Options Grid */}
          <div className="grid grid-cols-1 gap-3.5">
            {currentQuestion.options.map((option, idx) => {
              const letter = String.fromCharCode(65 + idx); // A, B, C, D
              const isSelected = selectedOption === option;
              const isCorrectAnswer = option === currentQuestion.correctAnswer;
              
              let optionClass = "option-btn-default";
              if (isAnswered) {
                if (isCorrectAnswer) optionClass = "option-btn-correct";
                else if (isSelected) optionClass = "option-btn-wrong";
                else optionClass = "option-btn-default opacity-50";
              } else if (isSelected) {
                optionClass = "option-btn-selected";
              }

              return (
                <button
                  key={idx}
                  onClick={() => handleOptionClick(option)}
                  disabled={isAnswered}
                  className={`${optionClass} group relative cursor-pointer`}
                >
                  <div className="flex items-center gap-3">
                    <span className={`w-8 h-8 rounded-lg flex items-center justify-center font-extrabold text-sm border ${
                      isSelected 
                        ? 'bg-primary-500 text-white border-primary-600'
                        : isAnswered && isCorrectAnswer
                          ? 'bg-emerald-500 text-white border-emerald-600'
                          : isAnswered && isSelected
                            ? 'bg-rose-500 text-white border-rose-600'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-500 border-slate-200 dark:border-slate-700'
                    }`}>
                      {letter}
                    </span>
                    <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                      {option}
                    </span>
                  </div>

                  {/* Icon indicator */}
                  <div>
                    {isAnswered && isCorrectAnswer && <CheckCircle2 className="w-5 h-5 text-emerald-500" />}
                    {isAnswered && isSelected && !isCorrectAnswer && <XCircle className="w-5 h-5 text-rose-500" />}
                    {!isAnswered && (
                      <span className="text-[10px] text-slate-400 group-hover:text-primary-500 font-bold opacity-0 group-hover:opacity-100 transition-opacity">
                        Press {letter}
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Explanation reveal */}
          {isAnswered && currentQuestion.explanation && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-6 p-4 rounded-xl bg-slate-100/50 dark:bg-slate-900/50 border border-slate-200/50 dark:border-slate-800/50"
            >
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                Explanation
              </h4>
              <p className="text-sm font-medium text-slate-600 dark:text-slate-300">
                {currentQuestion.explanation}
              </p>
            </motion.div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Play Controls Footer */}
      <div className="flex items-center justify-between">
        <div className="text-xs text-slate-400 dark:text-slate-500 font-bold flex flex-col">
          <span>💡 Protip: Use A, B, C, D on your keyboard</span>
          {isAnswered && <span>Press SPACE / ENTER to go next</span>}
        </div>

        <button
          onClick={handleNext}
          disabled={!isAnswered}
          className={`px-6 py-3.5 rounded-xl font-bold text-sm flex items-center gap-2 cursor-pointer transition-all duration-200 shadow-md ${
            isAnswered
              ? 'bg-gradient-to-r from-primary-600 to-indigo-600 hover:from-primary-500 hover:to-indigo-500 text-white active:scale-95 shadow-primary-500/20'
              : 'bg-slate-200 dark:bg-slate-800 text-slate-400 dark:text-slate-600 cursor-not-allowed'
          }`}
        >
          {currentIdx === questions.length - 1 ? 'Finish Quiz' : 'Next Question'}
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </main>
  );
}
