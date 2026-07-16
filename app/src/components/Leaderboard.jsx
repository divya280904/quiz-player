import React, { useState, useEffect } from 'react';
import { getLeaderboard } from '../services/firebase';
import { Trophy, RefreshCw, Calendar, Award } from 'lucide-react';

export default function Leaderboard({ quizId, refreshTrigger }) {
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchLeaderboard = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getLeaderboard(quizId);
      setLeaderboard(data);
    } catch (err) {
      console.error(err);
      setError('Could not fetch scores.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (quizId) {
      fetchLeaderboard();
    }
  }, [quizId, refreshTrigger]);

  const formatDate = (dateString) => {
    try {
      const d = new Date(dateString);
      return d.toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (e) {
      return '';
    }
  };

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-4">
        <h4 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-1.5">
          <Trophy className="w-5 h-5 text-amber-500" />
          Top 10 Leaderboard
        </h4>
        <button
          onClick={fetchLeaderboard}
          disabled={loading}
          className="p-2 rounded-lg text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/50 transition-colors"
          title="Refresh Scores"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {loading ? (
        <div className="py-12 flex items-center justify-center">
          <div className="w-8 h-8 border-3 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : error ? (
        <div className="p-4 bg-rose-50 dark:bg-rose-950/20 text-rose-500 border border-rose-100 dark:border-rose-800/30 rounded-xl text-center text-xs font-semibold">
          {error}
        </div>
      ) : leaderboard.length === 0 ? (
        <div className="p-8 text-center text-slate-500 dark:text-slate-400 font-semibold border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl bg-slate-50/30 dark:bg-slate-900/10">
          No scores registered yet. Be the first to claim a rank! 🚀
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-slate-200/50 dark:border-slate-800/50 bg-white/30 dark:bg-slate-900/10">
          <div className="max-h-[360px] overflow-y-auto no-scrollbar">
            <table className="w-full border-collapse text-left text-sm">
              <thead className="sticky top-0 bg-slate-100 dark:bg-slate-900 border-b border-slate-200/50 dark:border-slate-800/50 text-slate-500 dark:text-slate-400 font-bold text-xs uppercase">
                <tr>
                  <th className="px-4 py-3 text-center">Rank</th>
                  <th className="px-4 py-3">Player</th>
                  <th className="px-4 py-3 text-right">Score</th>
                  <th className="px-4 py-3 text-right">Accuracy</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-semibold text-slate-700 dark:text-slate-300">
                {leaderboard.map((row, idx) => {
                  const rank = idx + 1;
                  let rankBadge = `${rank}`;
                  let rowBg = '';

                  if (rank === 1) {
                    rankBadge = '🥇';
                    rowBg = 'bg-amber-500/5 dark:bg-amber-500/5 text-amber-700 dark:text-amber-300';
                  } else if (rank === 2) {
                    rankBadge = '🥈';
                    rowBg = 'bg-slate-400/5 dark:bg-slate-400/5 text-slate-700 dark:text-slate-300';
                  } else if (rank === 3) {
                    rankBadge = '🥉';
                    rowBg = 'bg-orange-500/5 dark:bg-orange-500/5 text-orange-700 dark:text-orange-300';
                  }

                  return (
                    <tr
                      key={row.id || idx}
                      className={`hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors ${rowBg}`}
                    >
                      <td className="px-4 py-3.5 text-center font-extrabold text-base">
                        {rankBadge}
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="flex flex-col">
                          <span className="font-bold text-slate-800 dark:text-white truncate max-w-[140px] md:max-w-xs">
                            {row.name}
                          </span>
                          <span className="text-[10px] text-slate-400 flex items-center gap-1 font-medium mt-0.5">
                            <Calendar className="w-3 h-3" />
                            {formatDate(row.completedAt)}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3.5 text-right font-extrabold text-slate-800 dark:text-white">
                        {row.score}
                      </td>
                      <td className="px-4 py-3.5 text-right text-xs">
                        <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-bold border border-slate-200/50 dark:border-slate-800/50">
                          {row.percentage}%
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
