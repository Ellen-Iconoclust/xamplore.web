import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { doc, getDoc, updateDoc, setDoc, serverTimestamp, onSnapshot, collection, addDoc, query, where, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import { User, Exam } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { Clock, AlertTriangle, Loader2, CheckCircle2, ArrowLeft, ArrowRight, ShieldCheck, Info, Trophy, RotateCcw, Home as HomeIcon, Download, XCircle, Maximize, Zap, Lock } from 'lucide-react';

interface ExamPageProps {
  user: User;
}

export default function ExamPage({ user }: ExamPageProps) {
  const { examId } = useParams<{ examId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const enteredName = queryParams.get('name') || user.displayName || 'Anonymous Student';
  
  const [exam, setExam] = useState<Exam | null>(null);
  const [loading, setLoading] = useState(true);
  const [started, setStarted] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [serverEndTime, setServerEndTime] = useState<number | null>(null);
  const [tabSwitches, setTabSwitches] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState<'idle' | 'started' | 'completed' | 'failed'>('idle');
  const [isWaiting, setIsWaiting] = useState(false);
  
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const answersRef = useRef<Record<string, number>>({});
  const tabSwitchesRef = useRef(0);
  const wasFullscreenActive = useRef(false);

  useEffect(() => {
    answersRef.current = answers;
  }, [answers]);

  useEffect(() => {
    tabSwitchesRef.current = tabSwitches;
  }, [tabSwitches]);

  useEffect(() => {
    if (!examId || !db || !user) return;

    const initExam = async () => {
      setLoading(true);
      try {
        const submissionId = `${user.uid}_${examId}`;
        const submissionRef = doc(db, 'submissions', submissionId);
        const submissionSnap = await getDoc(submissionRef);
        
        // 1. Check for existing submission
        if (submissionSnap.exists()) {
          const subData = submissionSnap.data() as any;
          
          if (subData.status === 'submitted') {
            alert('You have already completed this exam.');
            navigate('/dashboard');
            return;
          } else if (subData.status === 'failed') {
            alert('This exam is blocked due to malpractice.');
            navigate('/dashboard');
            return;
          } else if (subData.status === 'retake_allowed') {
            // Check expiry
            const now = new Date();
            if (subData.specialLoginExpiry && subData.specialLoginExpiry.toDate() < now) {
              alert('Special login window has expired. Please contact admin.');
              navigate('/dashboard');
              return;
            }
          }
        }

        // 2. Fetch exam data
        const examSnap = await getDoc(doc(db, 'exams', examId));
        if (!examSnap.exists()) {
          alert('Exam not found.');
          navigate('/dashboard');
          return;
        }
        const examData = { id: examSnap.id, ...examSnap.data() } as Exam;
        setExam(examData);
        
        // Synchronized Timer Calculation
        if (examData.startTime && examData.loginWindow) {
          const startTimeDate = examData.startTime.toDate();
          const examStartMs = startTimeDate.getTime() + (examData.loginWindow * 60 * 1000);
          const examEndMs = examStartMs + (examData.duration * 60 * 1000);
          setServerEndTime(examEndMs);
          
          const nowMs = Date.now();
          const syncedTimeLeft = Math.max(0, Math.floor((examEndMs - nowMs) / 1000));
          
          // Limit to max duration just in case of weird startup overlaps
          setTimeLeft(Math.min(syncedTimeLeft, examData.duration * 60));
        } else {
          // Fallback if no global start time
          setTimeLeft(examData.duration * 60);
          setServerEndTime(Date.now() + (examData.duration * 60 * 1000));
        }

        // 3. Update or Initial Lock-in
        if (submissionSnap.exists()) {
          const subData = submissionSnap.data() as any;
          if (subData.status === 'retake_allowed') {
            await updateDoc(submissionRef, {
              status: 'in-progress',
              startedAt: serverTimestamp(),
              specialLoginExpiry: null,
              tabSwitches: 0,
              userName: enteredName,
              answers: {}
            });
          }
        } else {
          // Create new in-progress submission
          await setDoc(submissionRef, {
            examId: examId,
            userId: user.uid,
            userName: enteredName,
            status: 'in-progress',
            startedAt: serverTimestamp(),
            tabSwitches: 0,
            pattern: examData.pattern,
            answers: {}
          });
        }

        setStarted(true);
        setStatus('started');
        setLoading(false);
        
        // Attempt fullscreen again on entry
        try {
          if (document.documentElement.requestFullscreen && !document.fullscreenElement) {
             document.documentElement.requestFullscreen().catch(() => {});
             wasFullscreenActive.current = true;
          }
        } catch (e) {}
      } catch (error) {
        console.error('Error initializing exam:', error);
        setLoading(false);
      }
    };

    initExam();
    
    return () => {
      // Cleanup
    };
  }, [examId, user.uid, navigate]);

  // Tab Visibility Detection (Anti-Cheat)
  useEffect(() => {
    if (status !== 'started') return;

    const handleVisibilityChange = () => {
      if (document.hidden) {
        setTabSwitches(prev => {
          const next = prev + 1;
          if (next >= 3) {
            setStatus('failed');
            triggerFail('Multiple tab switches detected');
          }
          return next;
        });
      }
    };

    const handleBlur = () => {
      if (status === 'started') {
        setTabSwitches(prev => {
          const next = prev + 1;
          if (next >= 3) {
            setStatus('failed');
            triggerFail('Window focus lost multiple times');
          }
          return next;
        });
      }
    };

    const handleFullscreenChange = () => {
      if (wasFullscreenActive.current && !document.fullscreenElement && status === 'started') {
        setStatus('failed');
        triggerFail('Exited fullscreen mode');
      }
    };

    const handleContextMenu = (e: MouseEvent) => e.preventDefault();
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && (e.key === 'c' || e.key === 'v' || e.key === 'u' || e.key === 's')) {
        e.preventDefault();
      }
    };

    // Malpractice listeners
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handleBlur);
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('contextmenu', handleContextMenu);
    document.addEventListener('keydown', handleKeyDown);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleBlur);
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [status]);

  // Timer logic (Absolute Sync)
  useEffect(() => {
    if (status === 'started' && serverEndTime) {
      const updateTimer = () => {
        const now = Date.now();
        const remaining = Math.max(0, Math.floor((serverEndTime - now) / 1000));
        setTimeLeft(remaining);
        
        if (remaining <= 0) {
          if (timerRef.current) clearInterval(timerRef.current);
          handleSubmit();
        }
      };

      updateTimer(); // Initial call
      timerRef.current = setInterval(updateTimer, 1000);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [status, serverEndTime]);

  const triggerFail = async (reason: string) => {
    if (!examId || !exam) return;
    try {
      if (document.fullscreenElement) {
        document.exitFullscreen().catch(() => {});
      }
    } catch (e) {}
    
    try {
      const submissionId = `${user.uid}_${examId}`;
      const submissionRef = doc(db, 'submissions', submissionId);
      
      await updateDoc(submissionRef, {
        status: 'failed',
        reason: reason,
        tabSwitches: tabSwitches + 1,
        submittedAt: serverTimestamp()
      });
    } catch (err) {
      console.error('Error recording malpractice:', err);
    }
  };

  const [score, setScore] = useState<number | null>(null);

  const handleSubmit = async () => {
    if (!exam || !examId || submitting) return;
    setSubmitting(true);
    
    // Use refs to get latest state during auto-submit from timer
    const currentAnswers = answersRef.current;
    const currentTabSwitches = tabSwitchesRef.current;
    
    try {
      const submissionId = `${user.uid}_${examId}`;
      const submissionRef = doc(db, 'submissions', submissionId);
      
      await updateDoc(submissionRef, {
        answers: currentAnswers,
        tabSwitches: currentTabSwitches,
        status: 'submitted',
        totalQuestions: exam.questions.length,
        submittedAt: serverTimestamp()
      });

      // Auto-Grade Attempt (Server-Side preferred)
      try {
        const response = await fetch('/api/grade-submission', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ submissionId, examId })
        });
        const result = await response.json();
        if (result.success) {
          setScore(result.score);
        } else {
          throw new Error(result.error);
        }
      } catch (gradErr) {
        console.warn('Server grading failed, attempting client-side fallback:', gradErr);
        // Client-Side Fallback (Now authorized by rules after submission)
        try {
          const keySnap = await getDoc(doc(db, 'exam_keys', examId));
          if (keySnap.exists()) {
            const { answers: correctAnswers } = keySnap.data();
            let calculatedScore = 0;
            const questionIds = Object.keys(correctAnswers);
            questionIds.forEach(qId => {
              if (currentAnswers[qId] !== undefined && String(currentAnswers[qId]) === String(correctAnswers[qId])) {
                calculatedScore++;
              }
            });
            
            // Update score locally back to Firestore
            await updateDoc(submissionRef, {
              score: calculatedScore,
              gradedAt: serverTimestamp()
            });
            setScore(calculatedScore);
          }
        } catch (clientGradErr) {
          console.error('Final grading fallback failed:', clientGradErr);
        }
      }
      
      setStatus('completed');
    } catch (error) {
      console.error('Error submitting exam:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const formatTime = (seconds: number) => {
    const absSeconds = Math.max(0, Math.floor(seconds));
    const mins = Math.floor(absSeconds / 60);
    const secs = absSeconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-white">
        <Loader2 className="animate-spin text-emerald-600" size={40} />
      </div>
    );
  }

  if (!exam) return null;

  if (status === 'completed') {
    return (
      <div className="max-w-xl mx-auto px-6 py-20 text-center">
        <div className="bg-white rounded-xl p-12 shadow-2xl border border-emerald-100">
          <div className="mb-8">
            <Trophy size={64} className="mx-auto text-emerald-500" />
          </div>
          <h2 className="text-3xl font-bold text-emerald-600 brand mb-4">Test Submitted!</h2>
          <p className="text-lg font-semibold text-gray-700 mb-8">
            {enteredName} — Pattern {exam.pattern} — {score !== null ? `Score: ${score}/${exam.questions.length}` : 'Evaluation Pending'}
          </p>
          
          <div className="p-6 bg-emerald-50 border border-emerald-200 rounded-lg mb-8">
            {score !== null ? (
              <p className="text-sm text-emerald-700 mb-2 font-bold italic">Verification complete. Great job!</p>
            ) : (
              <p className="text-sm text-emerald-700 mb-2">Final results are being securely verified...</p>
            )}
            <p className="text-[10px] text-emerald-600 uppercase tracking-widest font-bold">Secure ID: {examId?.slice(-6)}</p>
          </div>

          <div className="space-y-4">
            <button className="w-full bg-emerald-600 hover:bg-emerald-700 text-white p-3 rounded-lg font-bold shadow-md transition flex items-center justify-center gap-2">
              <Download size={20} /> Download PDF Certificate
            </button>
            <button onClick={() => navigate('/dashboard')} className="w-full bg-emerald-500 hover:bg-emerald-600 text-white p-3 rounded-lg font-bold shadow-md transition flex items-center justify-center gap-2">
              <RotateCcw size={20} /> Take Another Test
            </button>
            <button onClick={() => navigate('/')} className="w-full bg-gray-600 hover:bg-gray-700 text-white p-3 rounded-lg font-bold shadow-md transition flex items-center justify-center gap-2">
              <HomeIcon size={20} /> Return to Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (status === 'failed') {
    return (
      <div className="max-w-xl mx-auto px-6 py-20 text-center">
        <div className="bg-white rounded-xl p-12 shadow-2xl border border-red-100">
          <div className="mb-8">
            <XCircle size={64} className="mx-auto text-red-500" />
          </div>
          <h2 className="text-3xl font-bold text-red-600 brand mb-4">Test Blocked</h2>
          <p className="text-gray-600 mb-8">Malpractice detected (tab switching or window focus loss).</p>
          
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-8 text-left">
            <div className="flex items-start gap-3">
              <AlertTriangle className="text-red-500 shrink-0" size={24} />
              <div>
                <p className="font-bold text-red-700 text-sm mb-1">Access Restricted</p>
                <p className="text-xs text-red-600">Your attempt has been logged. You cannot retake this exam until an administrator clears your status.</p>
              </div>
            </div>
          </div>
          
          <button onClick={() => navigate('/dashboard')} className="w-full bg-gray-600 hover:bg-gray-700 text-white p-4 rounded-lg font-bold shadow-lg transition flex items-center justify-center gap-2">
            <ArrowLeft size={18} /> Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  if (isWaiting) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl p-12 shadow-2xl border border-emerald-100 text-center max-w-lg w-full"
        >
          <Clock size={64} className="mx-auto text-emerald-500 mb-6 animate-pulse" />
          <h2 className="text-3xl font-bold text-gray-800 mb-4 brand">Answers Recorded</h2>
          <p className="text-gray-600 mb-10">
            Your responses have been saved. Please wait for the timer to expire to finalize your submission. 
            <span className="block mt-2 font-bold text-red-600 uppercase tracking-tighter text-xs">
              Do not exit fullscreen or switch tabs.
            </span>
          </p>
          
          <div className="relative">
            <div className="text-6xl font-mono font-bold text-emerald-600 bg-emerald-50 py-10 rounded-2xl border border-emerald-100 shadow-inner">
              {formatTime(timeLeft)}
            </div>
            <div className="absolute -top-3 -right-3">
              <span className="flex h-6 w-6">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-6 w-6 bg-emerald-500"></span>
              </span>
            </div>
          </div>
          
          <p className="mt-10 text-sm text-gray-400 italic">
            The exam will auto-submit when the countdown reaches zero.
          </p>
        </motion.div>
      </div>
    );
  }

  if (!exam.questions || exam.questions.length === 0) {
    return (
      <div className="max-w-xl mx-auto px-6 py-20 text-center">
        <div className="bg-white rounded-xl p-12 shadow-2xl border border-red-100">
          <h2 className="text-2xl font-bold text-red-600 mb-4">No Questions Found</h2>
          <p className="text-gray-600 mb-8">This exam doesn't have any questions yet. Please contact the administrator.</p>
          <button onClick={() => navigate('/dashboard')} className="btn-secondary w-full">Back to Dashboard</button>
        </div>
      </div>
    );
  }

  const currentQuestion = exam.questions[currentQuestionIndex];

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Exam Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-40 px-8 py-4 shadow-sm">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-emerald-600 rounded-lg flex items-center justify-center text-white font-bold">
              {currentQuestionIndex + 1}
            </div>
            <div>
              <h2 className="font-bold text-gray-800 line-clamp-1">{exam.title}</h2>
              <p className="text-[10px] font-bold uppercase tracking-widest text-emerald-600">
                Question {currentQuestionIndex + 1} of {exam.questions.length}
              </p>
            </div>
          </div>
          
          <div className={`flex items-center gap-3 px-6 py-2 rounded-full font-mono text-xl font-bold border ${
            timeLeft < 300 ? 'bg-red-50 border-red-100 text-red-600 animate-pulse' : 'bg-emerald-50 border-emerald-100 text-emerald-700'
          }`}>
            <Clock size={20} />
            {formatTime(timeLeft)}
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-12">
        <div className="bg-white rounded-xl p-8 shadow-xl border border-gray-100">
          <div className="mb-6 p-3 bg-emerald-50 border border-emerald-200 rounded text-center">
            <p className="text-sm text-emerald-700 flex items-center justify-center gap-2">
              <Info size={18} />
              You can answer questions now, but can only submit when timer ends
            </p>
          </div>

          <div id="questionBox">
            <p className="font-bold mb-8 text-xl text-gray-800">Q{currentQuestionIndex + 1}: {currentQuestion.text}</p>
            
            <div className="flex flex-col md:flex-row gap-8">
              {/* Options */}
              <div className="md:w-2/5 space-y-3">
                {currentQuestion.options.map((option, i) => {
                  const optionId = `q-${currentQuestion.id}-opt-${i}`;
                  const isSelected = answers[currentQuestion.id] === i;
                  return (
                    <label 
                      key={i}
                      htmlFor={optionId}
                      className={`flex items-center cursor-pointer p-4 rounded-lg border transition-all duration-200 ${
                        isSelected 
                        ? 'bg-emerald-50 border-emerald-500 shadow-sm' 
                        : 'bg-white border-gray-200 hover:bg-gray-50'
                      }`}
                    >
                      <input 
                        id={optionId}
                        type="radio" 
                        name={`question-${currentQuestion.id}`} 
                        value={i}
                        checked={isSelected}
                        onChange={() => setAnswers({...answers, [currentQuestion.id]: i})}
                        className="mr-4 h-5 w-5 text-emerald-600 shrink-0"
                      />
                      <span className="text-gray-700 font-medium">{option}</span>
                    </label>
                  );
                })}
              </div>
              
              {/* QR Code */}
              <div className="md:w-3/5 flex items-center justify-center bg-gray-50 rounded-xl p-4 border border-dashed border-gray-300">
                <img 
                  src="https://xamplore1.vercel.app/xamplore-qr-code.png" 
                  alt="QR Code"
                  className="max-w-full h-auto object-contain rounded-lg shadow-sm"
                  referrerPolicy="no-referrer"
                />
              </div>
            </div>
          </div>

          <div className="mt-12 flex justify-end items-center gap-4">
            {currentQuestionIndex === exam.questions.length - 1 ? (
              <button 
                disabled={answers[currentQuestion.id] === undefined}
                onClick={() => setIsWaiting(true)}
                className="bg-purple-600 hover:bg-purple-700 text-white px-10 py-3 rounded-lg font-bold shadow-lg transition flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Submit Exam
              </button>
            ) : (
              <button 
                disabled={answers[currentQuestion.id] === undefined}
                onClick={() => setCurrentQuestionIndex(prev => prev + 1)}
                className="bg-emerald-600 hover:bg-emerald-700 text-white px-10 py-3 rounded-lg font-bold shadow-lg transition flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next <ArrowRight size={20} />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
