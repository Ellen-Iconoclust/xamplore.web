import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, query, where, getDocs, onSnapshot, doc, getDoc } from 'firebase/firestore';
import { User, Exam } from '../types';
import { useNavigate } from 'react-router-dom';
import { AlertCircle, Clock, CheckCircle, MonitorOff, Minimize, Copy, AlertTriangle, Lock, Loader2, RotateCcw } from 'lucide-react';
import { motion } from 'motion/react';

interface DashboardProps {
  user: User;
}

export default function Dashboard({ user }: DashboardProps) {
  const navigate = useNavigate();
  const [step, setStep] = useState<'login' | 'rules'>('login');
  const [name, setName] = useState(user.displayName);
  const [pattern, setPattern] = useState('');
  const [password, setPassword] = useState('');
  const [warning, setWarning] = useState('');
  const [loading, setLoading] = useState(false);
  const [completedPatterns, setCompletedPatterns] = useState<string[]>([]);
  const [failedPatterns, setFailedPatterns] = useState<string[]>([]);
  const [examWindow, setExamWindow] = useState<any>(null);
  const [activeExams, setActiveExams] = useState<Exam[]>([]);
  const [loginCountdown, setLoginCountdown] = useState<Record<string, number>>({});
  const [specialLoginCountdown, setSpecialLoginCountdown] = useState<Record<string, {pattern: string, seconds: number}>>({});

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  useEffect(() => {
    if (activeExams.length === 0) return;

    const timer = setInterval(() => {
      const newCountdowns: Record<string, number> = {};
      activeExams.forEach(exam => {
        if (exam.startTime && exam.loginWindow) {
          const startTime = (exam.startTime as any).toDate();
          const now = new Date();
          const expiryTime = startTime.getTime() + exam.loginWindow * 60 * 1000;
          const diffSeconds = Math.floor((expiryTime - now.getTime()) / 1000);
          newCountdowns[exam.id] = Math.max(0, diffSeconds);
        }
      });
      setLoginCountdown(newCountdowns);
    }, 1000);

    return () => clearInterval(timer);
  }, [activeExams]);

  useEffect(() => {
    if (!db || !user.uid) return;

    const qSpecial = query(
      collection(db, 'submissions'), 
      where('userId', '==', user.uid), 
      where('status', '==', 'retake_allowed')
    );

    const unsubSpecial = onSnapshot(qSpecial, (snapshot) => {
      const updateTimer = () => {
        const newCountdowns: Record<string, {pattern: string, seconds: number}> = {};
        snapshot.docs.forEach(doc => {
          const data = doc.data();
          if (data.specialLoginExpiry) {
            const expiry = data.specialLoginExpiry.toDate();
            const now = new Date();
            const diffSeconds = Math.floor((expiry.getTime() - now.getTime()) / 1000);
            newCountdowns[doc.id] = {
              pattern: data.pattern,
              seconds: Math.max(0, diffSeconds)
            };
          }
        });
        setSpecialLoginCountdown(newCountdowns);
      };

      updateTimer();
      const timer = setInterval(updateTimer, 1000);
      return () => clearInterval(timer);
    });

    return () => unsubSpecial();
  }, [user.uid]);

  useEffect(() => {
    if (!db || !user.uid) return;

    // Listen for completed/failed patterns for this user in real-time
    const qSubmissions = query(collection(db, 'submissions'), where('userId', '==', user.uid));
    const unsubSubmissions = onSnapshot(qSubmissions, (snapshot) => {
      const completed: string[] = [];
      const failed: string[] = [];
      
      snapshot.docs.forEach(doc => {
        const data = doc.data();
        if (data.status === 'submitted' && data.pattern) {
          completed.push(data.pattern);
        } else if (data.status === 'failed' && data.pattern) {
          failed.push(data.pattern);
        }
      });
      
      setCompletedPatterns(completed);
      setFailedPatterns(failed);
    }, (error) => {
      console.error('Error listening to user patterns:', error);
    });

    // Fetch active exams
    const unsubExams = onSnapshot(query(collection(db, 'exams'), where('status', '==', 'active')), (snapshot) => {
      const allActiveExams = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Exam));
      // Filter by allowedEmails if the list is not empty
      const filteredExams = allActiveExams.filter(exam => 
        !exam.allowedEmails || 
        exam.allowedEmails.length === 0 || 
        exam.allowedEmails.includes(user.email)
      );
      setActiveExams(filteredExams);
    }, (error) => {
      console.error('Error listening to exams:', error);
    });

    // Listen for exam window status
    const unsubSettings = onSnapshot(doc(db, 'settings', 'examWindow'), (doc) => {
      if (doc.exists()) {
        setExamWindow(doc.data());
      }
    }, (error) => {
      console.error('Error listening to settings:', error);
    });

    return () => {
      unsubSubmissions();
      unsubExams();
      unsubSettings();
    };
  }, [user.uid]);

  const handleContinue = async () => {
    if (!name || !pattern || !password) {
      setWarning('Please fill all fields');
      return;
    }

    if (completedPatterns.includes(pattern)) {
      setWarning(`Pattern ${pattern} is already completed. You cannot retake it.`);
      return;
    }

    if (failedPatterns.includes(pattern)) {
      setWarning(`Pattern ${pattern} is blocked due to malpractice. Please contact the administrator.`);
      return;
    }

    // Double-check with database to prevent stale state bypass
    try {
      const qCheck = query(
        collection(db, 'submissions'), 
        where('userId', '==', user.uid), 
        where('pattern', '==', pattern)
      );
      const snapshotCheck = await getDocs(qCheck);
      let existingSubmission: any = null;
      if (!snapshotCheck.empty) {
        const submissions = snapshotCheck.docs.map(d => ({ id: d.id, ...d.data() })) as any[];
        const isSubmitted = submissions.some(s => s.status === 'submitted');
        const isFailed = submissions.some(s => s.status === 'failed');

        if (isSubmitted) {
          setWarning(`Pattern ${pattern} is already completed. You cannot retake it.`);
          return;
        } else if (isFailed) {
          setWarning(`Pattern ${pattern} is blocked due to malpractice. Please contact the administrator.`);
          return;
        }
        
        // Check for retake_allowed or in-progress
        existingSubmission = submissions.find(s => s.status === 'retake_allowed' || s.status === 'in-progress');
      }

      setLoading(true);
      setWarning('');

      // Verify pattern password
      const q = query(collection(db, 'exams'), where('pattern', '==', pattern));
      const snapshot = await getDocs(q);
      
      if (snapshot.empty) {
        setWarning('Invalid Pattern');
        setLoading(false);
        return;
      }

      const examData = snapshot.docs[0].data() as Exam;
      if (examData.password !== password) {
        setWarning('Incorrect Password');
        setLoading(false);
        return;
      }

      // Check if exam is active
      if (examData.status !== 'active') {
        setWarning('This exam is not currently active.');
        setLoading(false);
        return;
      }

      // Login Window Check
      if (examData.startTime && examData.loginWindow) {
        const startTime = examData.startTime.toDate();
        const now = new Date();
        const diffMins = (now.getTime() - startTime.getTime()) / (1000 * 60);
        
        const isWithinWindow = diffMins <= examData.loginWindow;
        const hasActiveSession = existingSubmission && existingSubmission.status === 'in-progress';
        const hasValidSpecialLogin = existingSubmission && 
                                   existingSubmission.status === 'retake_allowed' && 
                                   existingSubmission.specialLoginExpiry && 
                                   existingSubmission.specialLoginExpiry.toDate() > now;

        if (!isWithinWindow && !hasActiveSession && !hasValidSpecialLogin) {
          setWarning(`Login window for this exam closed ${Math.floor(diffMins - examData.loginWindow)} minutes ago.`);
          setLoading(false);
          return;
        }
      }

      setStep('rules');
    } catch (e) {
      console.error('Error during continue:', e);
      setWarning('Server Error');
    } finally {
      setLoading(false);
    }
  };

  const startExam = () => {
    if (!db) return;
    // Find the exam ID for this pattern
    const fetchAndNavigate = async () => {
      if (!pattern) return;
      try {
        // Final check before navigating
        const qCheck = query(
          collection(db, 'submissions'), 
          where('userId', '==', user.uid), 
          where('pattern', '==', pattern)
        );
        const snapshotCheck = await getDocs(qCheck);
        if (!snapshotCheck.empty) {
          const submissions = snapshotCheck.docs.map(d => d.data());
          const isSubmitted = submissions.some(s => s.status === 'submitted');
          const isFailed = submissions.some(s => s.status === 'failed');

          if (isSubmitted) {
            setWarning(`Pattern ${pattern} is already completed.`);
            return;
          } else if (isFailed) {
            setWarning(`Pattern ${pattern} is blocked due to malpractice.`);
            return;
          }
        }

        const q = query(collection(db, 'exams'), where('pattern', '==', pattern), where('status', '==', 'active'));
        const snapshot = await getDocs(q);
        if (!snapshot.empty) {
          navigate(`/exam/${snapshot.docs[0].id}`);
        } else {
          setWarning('Exam data not found or exam is not active.');
        }
      } catch (error) {
        console.error('Error starting exam:', error);
        setWarning('Failed to start exam. Please check your connection.');
      }
    };
    fetchAndNavigate();
  };

  return (
    <section id="test" className="py-16 bg-gray-50 min-h-screen">
      <div className="max-w-xl mx-auto bg-white p-8 rounded-xl shadow-xl border border-gray-100">
        
        {/* Exam Window Status (Simplified) */}
        {examWindow && examWindow.active && (
          <div className={`mb-6 p-4 border rounded-lg text-center ${examWindow.paused ? 'bg-yellow-50 border-yellow-200' : 'bg-emerald-50 border-emerald-200'}`}>
             <div className="flex items-center justify-center gap-2 text-emerald-700">
                <Clock size={18} />
                <span className="font-medium">Exam Window {examWindow.paused ? 'Paused' : 'Open'}</span>
             </div>
          </div>
        )}

        {loading && (
          <div className="text-center py-10">
            <Loader2 className="animate-spin text-emerald-600 mx-auto" size={40} />
            <p className="mt-3 text-emerald-600 font-semibold">Connecting to Server...</p>
          </div>
        )}

        {!loading && step === 'login' && (
          <div id="login">
            <h2 className="text-2xl font-bold mb-6 text-emerald-600 brand">Exam Login</h2>
            
            {/* Login Window Countdown */}
            {(activeExams.some(exam => loginCountdown[exam.id] > 0) || Object.values(specialLoginCountdown).some((s: any) => s.seconds > 0)) && (
              <div className="mb-6 space-y-2">
                <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">Active Login Windows</p>
                
                {/* Regular Login Windows */}
                {activeExams.map(exam => {
                  const timeLeft = loginCountdown[exam.id];
                  if (timeLeft === undefined || timeLeft <= 0) return null;
                  return (
                    <motion.div 
                      key={exam.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      className={`p-3 rounded-lg border flex justify-between items-center ${
                        timeLeft < 60 ? 'bg-red-50 border-red-100 animate-pulse' : 'bg-blue-50 border-blue-100'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <Clock size={14} className={timeLeft < 60 ? 'text-red-500' : 'text-blue-500'} />
                        <span className={`text-xs font-bold uppercase tracking-tight ${timeLeft < 60 ? 'text-red-700' : 'text-blue-700'}`}>
                          Pattern {exam.pattern}
                        </span>
                      </div>
                      <span className={`font-mono font-bold ${timeLeft < 60 ? 'text-red-600' : 'text-blue-600'}`}>
                        {formatTime(timeLeft)}
                      </span>
                    </motion.div>
                  );
                })}

                {/* Special Login Windows (Retakes) */}
                {Object.entries(specialLoginCountdown).map(([id, data]: [string, any]) => {
                  if (data.seconds <= 0) return null;
                  return (
                    <motion.div 
                      key={id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="p-3 rounded-lg border bg-purple-50 border-purple-100 flex justify-between items-center"
                    >
                      <div className="flex items-center gap-2">
                        <RotateCcw size={14} className="text-purple-500" />
                        <span className="text-xs font-bold uppercase tracking-tight text-purple-700">
                          Special Login (Pattern {data.pattern})
                        </span>
                      </div>
                      <span className="font-mono font-bold text-purple-600">
                        {formatTime(data.seconds)}
                      </span>
                    </motion.div>
                  );
                })}
              </div>
            )}

            {completedPatterns.length > 0 && (
              <div className="mb-4 p-4 bg-emerald-50 border border-emerald-200 rounded-lg">
                <div className="flex items-center gap-2 text-sm text-emerald-600 mb-2">
                  <CheckCircle size={18} />
                  <span className="font-semibold">Completed Patterns:</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {completedPatterns.map(p => (
                    <span key={p} className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
                      Pattern {p}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {failedPatterns.length > 0 && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-center gap-2 text-sm text-red-600 mb-2">
                  <AlertCircle size={18} />
                  <span className="font-semibold text-red-700 uppercase tracking-tighter">Blocked Patterns (Malpractice):</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {failedPatterns.map(p => (
                    <span key={p} className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-red-200 text-red-900">
                      Pattern {p}
                    </span>
                  ))}
                </div>
                <p className="text-[10px] text-red-500 mt-2 italic font-bold">Contact Admin to clear your status.</p>
              </div>
            )}
            
            <div className="space-y-4">
              <input 
                className="input-field" 
                placeholder="Your Name" 
                value={name} 
                onChange={(e) => setName(e.target.value)}
              />
              <select 
                className="input-field" 
                value={pattern} 
                onChange={(e) => setPattern(e.target.value)}
              >
                <option value="">Select Pattern</option>
                {activeExams.map(exam => (
                  <option key={exam.id} value={exam.pattern}>Pattern {exam.pattern}</option>
                ))}
              </select>
              
              {/* Selected Pattern Login Window Timer */}
              {pattern && (
                <div className="mt-2">
                  {(() => {
                    // Check for special login first
                    const specialLogin = Object.values(specialLoginCountdown).find((s: any) => s.pattern === pattern && s.seconds > 0);
                    
                    if (specialLogin) {
                      return (
                        <div className="p-3 rounded-lg border bg-purple-50 border-purple-200 flex justify-between items-center animate-pulse">
                          <div className="flex items-center gap-2">
                            <RotateCcw size={16} className="text-purple-500" />
                            <span className="text-xs font-bold uppercase tracking-tight text-purple-700">
                              Special Login Window Closes In:
                            </span>
                          </div>
                          <span className="font-mono font-bold text-lg text-purple-600">
                            {formatTime((specialLogin as any).seconds)}
                          </span>
                        </div>
                      );
                    }

                    // Fallback to regular login window
                    const exam = activeExams.find(e => e.pattern === pattern);
                    if (!exam) return null;
                    
                    const timeLeft = loginCountdown[exam.id];
                    if (timeLeft === undefined) return null;
                    
                    if (timeLeft > 0) {
                      return (
                        <div className={`p-3 rounded-lg border flex justify-between items-center ${
                          timeLeft < 60 ? 'bg-red-50 border-red-200 animate-pulse' : 'bg-emerald-50 border-emerald-200'
                        }`}>
                          <div className="flex items-center gap-2">
                            <Clock size={16} className={timeLeft < 60 ? 'text-red-500' : 'text-emerald-500'} />
                            <span className={`text-xs font-bold uppercase tracking-tight ${timeLeft < 60 ? 'text-red-700' : 'text-emerald-700'}`}>
                              Login Window Closes In:
                            </span>
                          </div>
                          <span className={`font-mono font-bold text-lg ${timeLeft < 60 ? 'text-red-600' : 'text-emerald-600'}`}>
                            {formatTime(timeLeft)}
                          </span>
                        </div>
                      );
                    } else {
                      return (
                        <div className="p-3 rounded-lg border bg-red-50 border-red-200 flex items-center gap-2">
                          <AlertCircle size={16} className="text-red-500" />
                          <span className="text-xs font-bold uppercase tracking-tight text-red-700">
                            Login Window Closed
                          </span>
                        </div>
                      );
                    }
                  })()}
                </div>
              )}
              
              <input 
                type="password" 
                className="input-field" 
                placeholder="Pattern Password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              
              <button 
                onClick={handleContinue}
                disabled={loading || !pattern || completedPatterns.includes(pattern) || failedPatterns.includes(pattern)}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white p-3 rounded-lg font-semibold transition duration-300 shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Checking...' : 'Continue'}
              </button>
              
              {warning && <p className="text-red-500 text-xs mt-2 font-medium">{warning}</p>}
            </div>
          </div>
        )}

        {!loading && step === 'rules' && (
          <div id="rules">
            <h2 className="text-xl font-bold text-emerald-600 mb-3 brand">Rules & Regulations</h2>
            
            {/* Login Window Countdown (Rules Step) */}
            {(() => {
              const specialLogin = Object.values(specialLoginCountdown).find((s: any) => s.pattern === pattern && s.seconds > 0);
              if (specialLogin) {
                return (
                  <div className="mb-6 p-3 bg-purple-50 border border-purple-100 rounded-lg flex justify-between items-center animate-pulse">
                    <div className="flex items-center gap-2">
                      <RotateCcw size={16} className="text-purple-500" />
                      <span className="text-xs font-bold uppercase tracking-tight text-purple-700">
                        Special Login Closes In:
                      </span>
                    </div>
                    <span className="font-mono font-bold text-purple-600 text-lg">
                      {formatTime((specialLogin as any).seconds)}
                    </span>
                  </div>
                );
              }

              const exam = activeExams.find(e => e.pattern === pattern);
              if (exam && loginCountdown[exam.id] > 0) {
                const timeLeft = loginCountdown[exam.id];
                return (
                  <div className={`mb-6 p-3 rounded-lg border flex justify-between items-center animate-pulse ${
                    timeLeft < 60 ? 'bg-red-50 border-red-100' : 'bg-emerald-50 border-emerald-100'
                  }`}>
                    <div className="flex items-center gap-2">
                      <Clock size={16} className={timeLeft < 60 ? 'text-red-500' : 'text-emerald-500'} />
                      <span className={`text-xs font-bold uppercase tracking-tight ${timeLeft < 60 ? 'text-red-700' : 'text-emerald-700'}`}>
                        Login Window Closing In:
                      </span>
                    </div>
                    <span className={`font-mono font-bold text-lg ${timeLeft < 60 ? 'text-red-600' : 'text-emerald-600'}`}>
                      {formatTime(timeLeft)}
                    </span>
                  </div>
                );
              }
              return null;
            })()}

            <p className="text-sm text-gray-600 mb-6">Read these rules carefully before proceeding.</p>
            
            <ul className="space-y-4 mb-8">
              <li className="flex items-start gap-3">
                <MonitorOff className="w-5 h-5 text-red-500 shrink-0" />
                <span className="text-sm"><strong>No tab switching</strong> - System detects browser tab switches</span>
              </li>
              <li className="flex items-start gap-3">
                <Minimize className="w-5 h-5 text-red-500 shrink-0" />
                <span className="text-sm"><strong>No exiting fullscreen</strong> - Remain in fullscreen mode</span>
              </li>
              <li className="flex items-start gap-3">
                <Copy className="w-5 h-5 text-red-500 shrink-0" />
                <span className="text-sm"><strong>No screenshots or copy-paste</strong></span>
              </li>
              <li className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-red-500 shrink-0" />
                <span className="text-sm"><strong>Violations end the test</strong></span>
              </li>
              <li className="flex items-start gap-3">
                <Clock className="w-5 h-5 text-yellow-500 shrink-0" />
                <span className="text-sm"><strong>Timed submission only</strong></span>
              </li>
              <li className="flex items-start gap-3">
                <Lock className="w-5 h-5 text-red-500 shrink-0" />
                <span className="text-sm"><strong>No retakes on completed patterns</strong></span>
              </li>
            </ul>
            
            {/* Xavi Rules Image */}
            <div className="bg-gradient-to-r from-emerald-50 to-emerald-100 p-6 rounded-xl border border-emerald-200 mb-8 text-center">
              <div className="mb-4">
                <img 
                  src="https://xamplore1.vercel.app/xavi2-rules.png" 
                  alt="Xavi - Rules Guardian" 
                  className="w-32 h-auto mx-auto rounded-lg drop-shadow-md"
                  referrerPolicy="no-referrer"
                />
              </div>
              <p className="text-sm font-medium text-emerald-700 mb-1">Remember the rules!</p>
              <p className="text-xs text-emerald-600">- Xavi the Fox</p>
            </div>
            
            <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg mb-6">
              <div className="flex items-start gap-3">
                <AlertCircle className="text-yellow-600 w-5 h-5 shrink-0" />
                <div>
                  <p className="text-sm font-semibold text-yellow-700">Important Notice</p>
                  <p className="text-xs text-yellow-600">By clicking "I Agree", you confirm you have read and understood all rules.</p>
                </div>
              </div>
            </div>
            
            <button 
              onClick={startExam}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white p-4 rounded-lg font-bold shadow-lg transition duration-300 flex items-center justify-center gap-2"
            >
              <CheckCircle size={20} /> I Agree & Start Exam
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
