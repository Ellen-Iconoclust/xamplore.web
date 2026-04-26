import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { User, Submission } from '../types';
import { motion } from 'motion/react';
import { Trophy, Mail, User as UserIcon, BookOpen, XCircle, Medal, Star, Award, Zap, History } from 'lucide-react';

interface ProfileProps {
  user: User;
}

export default function Profile({ user }: ProfileProps) {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user.uid) return;

    const q = query(collection(db, 'submissions'), where('userId', '==', user.uid));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const subs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Submission));
      setSubmissions(subs);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user.uid]);

  const examsDone = submissions.filter(s => s.status === 'submitted').length;
  const failedExams = submissions.filter(s => s.status === 'failed').length;
  const hasAchievements = user.achievements && user.achievements.length > 0;

  const hangmanLevels = ['Non-Hanger 1', 'Non-Hanger 2', 'Non-Hanger 3', 'Non-Hanger 4', 'Non-Hanger 5'];
  const allHangmanDone = hangmanLevels.every(id => user.achievements?.includes(id));
  const wordsworthDone = user.achievements?.includes('Wordle Wordsworth');

  const getMedalColor = () => {
    if (wordsworthDone) return 'bg-emerald-600 text-white border-emerald-200';
    if (allHangmanDone) return 'bg-blue-600 text-white border-blue-200';
    if (hasAchievements) return 'bg-yellow-500 text-white border-yellow-200';
    return 'bg-gray-400 text-white border-gray-200';
  };

  const getMedalTitle = () => {
    if (wordsworthDone) return 'Wordle Wordsworth & More!';
    if (allHangmanDone) return 'Master of Hangman';
    if (hasAchievements) return 'Rising Achiever';
    return 'No achievements yet';
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Profile Card */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-3xl overflow-hidden shadow-xl border border-gray-100 mb-8"
        >
          <div className="h-48 bg-linear-to-r from-emerald-500 to-teal-600"></div>
          <div className="px-4 sm:px-8 pb-8">
            <div className="relative flex flex-col sm:flex-row items-center sm:items-start sm:justify-start">
              <div className="relative -mt-20 sm:-mt-24">
                <div className="w-32 h-32 rounded-3xl border-4 border-white overflow-hidden bg-white shadow-lg">
                  {user.photoURL ? (
                    <img 
                      src={user.photoURL} 
                      alt={user.displayName} 
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div className="w-full h-full bg-emerald-100 flex items-center justify-center text-emerald-600">
                      <UserIcon size={48} />
                    </div>
                  )}
                </div>
                <div className={`absolute -bottom-2 -right-2 p-2 rounded-xl shadow-lg border-2 border-white ${getMedalColor()}`} title={getMedalTitle()}>
                  <Medal size={20} />
                </div>
              </div>
              <div className="mt-6 sm:mt-4 sm:ml-6 flex-1 text-center sm:text-left pt-2 overflow-hidden w-full">
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 brand truncate">{user.displayName || 'Anonymous student'}</h1>
                <p className="text-gray-500 flex items-center justify-center sm:justify-start gap-2 mt-1 text-sm sm:text-base break-all">
                  <Mail size={16} className="shrink-0" /> {user.email}
                </p>
                <div className="mt-4 flex flex-wrap justify-center sm:justify-start gap-2 sm:gap-3">
                  <span className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-[10px] sm:text-xs font-bold uppercase tracking-wider">
                    {user.role}
                  </span>
                  {user.wordleStreak && user.wordleStreak > 0 && (
                    <span className="bg-orange-100 text-orange-700 px-3 py-1 rounded-full text-[10px] sm:text-xs font-bold uppercase tracking-wider flex items-center gap-1">
                      <Zap size={12} /> Wordle Streak: {user.wordleStreak}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Stats Section */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white p-6 sm:p-8 rounded-3xl shadow-lg border border-gray-100"
          >
            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <Trophy className="text-emerald-500" /> Academic Stats
            </h2>
            <div className="grid grid-cols-2 gap-3 sm:gap-4">
              <div className="bg-emerald-50 p-4 sm:p-6 rounded-2xl border border-emerald-100">
                <div className="text-emerald-600 mb-2">
                  <BookOpen size={24} />
                </div>
                <p className="text-xl sm:text-2xl font-bold text-gray-900">{examsDone}</p>
                <p className="text-xs sm:text-sm text-gray-600 font-medium sm:whitespace-nowrap">Exams Done</p>
              </div>
              <div className="bg-red-50 p-4 sm:p-6 rounded-2xl border border-red-100">
                <div className="text-red-600 mb-2">
                  <XCircle size={24} />
                </div>
                <p className="text-xl sm:text-2xl font-bold text-gray-900">{failedExams}</p>
                <p className="text-xs sm:text-sm text-gray-600 font-medium sm:whitespace-nowrap">Failed Exams</p>
              </div>
            </div>

            <div className="mt-8">
              <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4">Recent Activity</h3>
              <div className="space-y-3">
                {submissions.slice(0, 3).map((sub, i) => (
                  <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl gap-2">
                    <div className="flex items-center gap-3 overflow-hidden">
                      <History size={16} className="text-gray-400 shrink-0" />
                      <div className="truncate">
                        <p className="text-xs sm:text-sm font-bold text-gray-800 truncate">
                          Exam Submission {sub.score !== undefined ? `(${sub.score}/${sub.totalQuestions || '?'})` : ''}
                        </p>
                        <p className="text-[10px] text-gray-500">{sub.submittedAt?.toDate().toLocaleDateString()}</p>
                      </div>
                    </div>
                    <span className={`text-[8px] sm:text-[10px] font-bold px-2 py-1 rounded-md uppercase shrink-0 ${
                      sub.status === 'submitted' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'
                    }`}>
                      {sub.status}
                    </span>
                  </div>
                ))}
                {submissions.length === 0 && (
                  <p className="text-sm text-gray-500 italic text-center py-4">No exam activity yet.</p>
                )}
              </div>
            </div>
          </motion.div>

          {/* Achievements Section */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white p-6 sm:p-8 rounded-3xl shadow-lg border border-gray-100"
          >
            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <Award className="text-emerald-500" /> Achievements
            </h2>
            
            <div className="space-y-4">
              {user.achievements?.includes('Wordle Wordsworth') ? (
                <div className="flex items-center gap-4 p-4 bg-emerald-50 rounded-2xl border border-emerald-100">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-emerald-100 rounded-xl flex items-center justify-center text-emerald-600 shrink-0">
                    <Star size={20} className="sm:size-24" />
                  </div>
                  <div>
                    <h4 className="text-sm sm:text-base font-bold text-gray-900">Wordle Wordsworth</h4>
                    <p className="text-[10px] sm:text-xs text-gray-600">Solved 30 Tech Wordle words consecutively.</p>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-2xl border border-dashed border-gray-200 grayscale opacity-50">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gray-200 rounded-xl flex items-center justify-center text-gray-400 shrink-0">
                    <Medal size={20} className="sm:size-24" />
                  </div>
                  <div>
                    <h4 className="text-sm sm:text-base font-bold text-gray-600">Wordle Wordsworth</h4>
                    <p className="text-[10px] sm:text-xs text-gray-500 truncate">Solve 30 Wordles in a row to unlock.</p>
                  </div>
                </div>
              )}

              {[
                { id: 'Non-Hanger 1', streak: 10 },
                { id: 'Non-Hanger 2', streak: 30 },
                { id: 'Non-Hanger 3', streak: 60 },
                { id: 'Non-Hanger 4', streak: 120 },
                { id: 'Non-Hanger 5', streak: 300 }
              ].map((level) => (
                user.achievements?.includes(level.id) ? (
                  <div key={level.id} className="flex items-center gap-4 p-4 bg-emerald-50 rounded-2xl border border-emerald-100">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-emerald-100 rounded-xl flex items-center justify-center text-emerald-600 shrink-0">
                      <Medal size={20} className="sm:size-24" />
                    </div>
                    <div>
                      <h4 className="text-sm sm:text-base font-bold text-gray-900">{level.id}</h4>
                      <p className="text-[10px] sm:text-xs text-gray-600">Solved {level.streak} Tech Hangman words without errors.</p>
                    </div>
                  </div>
                ) : (
                  <div key={level.id} className="flex items-center gap-4 p-4 bg-gray-50 rounded-2xl border border-dashed border-gray-200 grayscale opacity-50">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gray-200 rounded-xl flex items-center justify-center text-gray-400 shrink-0">
                      <Medal size={20} className="sm:size-24" />
                    </div>
                    <div>
                      <h4 className="text-sm sm:text-base font-bold text-gray-600">{level.id}</h4>
                      <p className="text-[10px] sm:text-xs text-gray-500 truncate">Solve {level.streak} Hangmen flawlessly to unlock.</p>
                    </div>
                  </div>
                )
              ))}

              {!hasAchievements && (
                <div className="mt-8 p-6 bg-gray-50 rounded-2xl text-center border-2 border-dashed border-gray-200">
                  <Medal size={32} className="mx-auto text-gray-300 mb-2" />
                  <p className="text-sm font-medium text-gray-500">Play games to earn your first achievement!</p>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
