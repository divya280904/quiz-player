import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import Navbar from './components/Navbar';
import QuizList from './components/QuizList';
import QuizPlayer from './components/QuizPlayer';
import ResultScreen from './components/ResultScreen';

function App() {
  return (
    <ThemeProvider>
      <Router>
        <div className="flex flex-col min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 transition-colors duration-300">
          <Navbar />
          <Routes>
            <Route path="/" element={<QuizList />} />
            <Route path="/quiz/:id" element={<QuizPlayer />} />
            <Route path="/quiz/:id/results" element={<ResultScreen />} />
          </Routes>
        </div>
      </Router>
    </ThemeProvider>
  );
}

export default App;
