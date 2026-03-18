import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc, updateDoc, serverTimestamp, onSnapshot, collection, addDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { User, Exam } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { Clock, AlertTriangle, Loader2, CheckCircle2, ArrowLeft, ArrowRight, ShieldCheck, Info, Trophy, RotateCcw, Home as HomeIcon, Download, XCircle } from 'lucide-react';

interface ExamPageProps {
  user: User;
}

export default function ExamPage({ user }: ExamPageProps) {
  const { examId } = useParams<{ examId: string }>();
  const navigate = useNavigate();
  
  const [exam, setExam] = useState<Exam | null>(null);
  const [loading, setLoading] = useState(true);
  const [started, setStarted] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [tabSwitches, setTabSwitches] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState<'idle' | 'started' | 'completed' | 'failed'>('idle');
  const [score, setScore] = useState(0);
  
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!examId) return;
    const unsubscribe = onSnapshot(doc(db, 'exams', examId), (snapshot) => {
      if (snapshot.exists()) {
        const examData = { id: snapshot.id, ...snapshot.data() } as Exam;
        setExam(examData);
        setTimeLeft(examData.duration * 60);
        setStatus('started');
        setStarted(true);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, [examId]);

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
      if (!document.fullscreenElement && status === 'started') {
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

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handleBlur);
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('contextmenu', handleContextMenu);
    document.addEventListener('keydown', handleKeyDown);
    
    // Attempt to enter fullscreen
    try {
      document.documentElement.requestFullscreen();
    } catch (e) {
      console.error('Fullscreen request failed');
    }
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleBlur);
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [status]);

  // Timer logic
  useEffect(() => {
    if (status === 'started' && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(timerRef.current!);
            handleSubmit();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [status, timeLeft]);

  const triggerFail = async (reason: string) => {
    if (!examId) return;
    try {
      document.exitFullscreen().catch(() => {});
    } catch (e) {}
    
    await addDoc(collection(db, 'submissions'), {
      examId: examId,
      userId: user.uid,
      userName: user.displayName,
      status: 'failed',
      reason: reason,
      tabSwitches: tabSwitches + 1,
      submittedAt: serverTimestamp()
    });
  };

  const handleSubmit = async () => {
    if (!exam || !examId || submitting) return;
    setSubmitting(true);
    
    try {
      // Calculate score
      let calculatedScore = 0;
      exam.questions.forEach(q => {
        if (answers[q.id] === q.correctAnswer) {
          calculatedScore += 1;
        }
      });
      setScore(calculatedScore);

      await addDoc(collection(db, 'submissions'), {
        examId: examId,
        userId: user.uid,
        userName: user.displayName,
        answers,
        tabSwitches,
        status: 'submitted',
        score: calculatedScore,
        totalQuestions: exam.questions.length,
        pattern: exam.pattern,
        submittedAt: serverTimestamp()
      });
      setStatus('completed');
    } catch (error) {
      console.error('Error submitting exam:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
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
          <h2 className="text-3xl font-bold text-emerald-600 brand mb-4">Test Completed Successfully!</h2>
          <p className="text-lg font-semibold text-gray-700 mb-8">
            {user.displayName} — Pattern {exam.pattern} — Score {score}/{exam.questions.length}
          </p>
          
          <div className="p-6 bg-emerald-50 border border-emerald-200 rounded-lg mb-8">
            <p className="text-sm text-emerald-700 mb-2">Pattern Completed: <span className="font-bold">{exam.pattern}</span></p>
            <p className="text-xs text-emerald-600">You cannot retake this pattern</p>
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
          <h2 className="text-3xl font-bold text-red-600 brand mb-4">Test Failed</h2>
          <p className="text-gray-600 mb-8">Malpractice detected or window focus lost.</p>
          
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-8 text-left">
            <div className="flex items-start gap-3">
              <AlertTriangle className="text-red-500 shrink-0" size={24} />
              <div>
                <p className="font-bold text-red-700 text-sm mb-1">Second Chance Required</p>
                <p className="text-xs text-red-600">Please ask the invigilator for the one-time retry code.</p>
              </div>
            </div>
          </div>
          
          <input 
            type="text" 
            className="w-full p-3 border border-gray-300 rounded-lg text-center tracking-widest text-lg font-mono mb-4" 
            placeholder="XXXXX" 
            maxLength={5}
          />
          
          <button className="w-full bg-emerald-600 hover:bg-emerald-700 text-white p-4 rounded-lg font-bold shadow-lg transition">
            Retry Exam
          </button>
          
          <button onClick={() => navigate('/dashboard')} className="mt-6 w-full text-gray-500 hover:text-gray-700 font-medium flex items-center justify-center gap-2">
            <ArrowLeft size={18} /> Back to Login
          </button>
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
                {currentQuestion.options.map((option, i) => (
                  <label 
                    key={i}
                    className={`flex items-center cursor-pointer p-4 rounded-lg border transition-all duration-200 ${
                      answers[currentQuestion.id] === option 
                      ? 'bg-emerald-50 border-emerald-500 shadow-sm' 
                      : 'bg-white border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    <input 
                      type="radio" 
                      name="ans" 
                      value={option}
                      checked={answers[currentQuestion.id] === option}
                      onChange={() => setAnswers({...answers, [currentQuestion.id]: option})}
                      className="mr-4 h-5 w-5 text-emerald-600 shrink-0"
                    />
                    <span className="text-gray-700 font-medium">{option}</span>
                  </label>
                ))}
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

          <div className="mt-12 flex justify-between items-center gap-4">
            <button 
              disabled={currentQuestionIndex === 0}
              onClick={() => setCurrentQuestionIndex(prev => prev - 1)}
              className="flex items-center gap-2 px-8 py-3 bg-white border border-gray-300 rounded-lg font-bold text-gray-700 hover:bg-gray-50 disabled:opacity-30 transition shadow-sm"
            >
              <ArrowLeft size={20} /> Previous
            </button>
            
            {currentQuestionIndex === exam.questions.length - 1 ? (
              <button 
                onClick={handleSubmit}
                disabled={submitting}
                className="bg-purple-600 hover:bg-purple-700 text-white px-10 py-3 rounded-lg font-bold shadow-lg transition flex items-center gap-2"
              >
                {submitting ? 'Submitting...' : 'Submit Exam'}
              </button>
            ) : (
              <button 
                onClick={() => setCurrentQuestionIndex(prev => prev + 1)}
                className="bg-emerald-600 hover:bg-emerald-700 text-white px-10 py-3 rounded-lg font-bold shadow-lg transition flex items-center gap-2"
              >
                Next <ArrowRight size={20} />
              </button>
            )}
          </div>
        </div>

        {/* Floating Navigator (Desktop) */}
        <div className="fixed bottom-10 right-10 hidden xl:block">
          <div className="bg-white p-6 rounded-xl shadow-2xl border border-gray-200 w-64">
            <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-4">Question Navigator</p>
            <div className="grid grid-cols-5 gap-2">
              {exam.questions.map((q, i) => (
                <button
                  key={q.id}
                  onClick={() => setCurrentQuestionIndex(i)}
                  className={`w-8 h-8 rounded-lg text-xs font-bold flex items-center justify-center transition-all ${
                    currentQuestionIndex === i 
                    ? 'bg-emerald-600 text-white shadow-md' 
                    : answers[q.id] 
                      ? 'bg-emerald-100 text-emerald-700 border border-emerald-200' 
                      : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                  }`}
                >
                  {i + 1}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
