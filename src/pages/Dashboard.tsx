import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, query, where, getDocs, onSnapshot, doc, getDoc } from 'firebase/firestore';
import { User, Exam } from '../types';
import { useNavigate } from 'react-router-dom';
import { AlertCircle, Clock, CheckCircle, MonitorOff, Minimize, Copy, AlertTriangle, Lock, Loader2 } from 'lucide-react';
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
  const [examWindow, setExamWindow] = useState<any>(null);
  const [activeExams, setActiveExams] = useState<Exam[]>([]);

  useEffect(() => {
    // Fetch completed patterns for this user
    const fetchCompleted = async () => {
      if (!db) return;
      try {
        const q = query(collection(db, 'submissions'), where('userId', '==', user.uid), where('status', '==', 'submitted'));
        const snapshot = await getDocs(q);
        const patterns = snapshot.docs.map(doc => doc.data().pattern);
        setCompletedPatterns(patterns);
      } catch (error) {
        console.error('Error fetching completed patterns:', error);
      }
    };
    fetchCompleted();

    // Fetch active exams
    if (!db) return;
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

    setLoading(true);
    setWarning('');

    try {
      // Verify pattern password
      const q = query(collection(db, 'exams'), where('pattern', '==', pattern));
      const snapshot = await getDocs(q);
      
      if (snapshot.empty) {
        setWarning('Invalid Pattern');
        setLoading(false);
        return;
      }

      const examData = snapshot.docs[0].data();
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

      setStep('rules');
    } catch (e) {
      setWarning('Server Error');
    } finally {
      setLoading(false);
    }
  };

  const startExam = () => {
    if (!db) return;
    // Find the exam ID for this pattern
    const fetchAndNavigate = async () => {
      try {
        const q = query(collection(db, 'exams'), where('pattern', '==', pattern));
        const snapshot = await getDocs(q);
        if (!snapshot.empty) {
          navigate(`/exam/${snapshot.docs[0].id}`);
        } else {
          setWarning('Exam data not found for this pattern.');
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
            
            {completedPatterns.length > 0 && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-center gap-2 text-sm text-red-600 mb-2">
                  <AlertCircle size={18} />
                  <span className="font-semibold">Completed Patterns:</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {completedPatterns.map(p => (
                    <span key={p} className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                      Pattern {p}
                    </span>
                  ))}
                </div>
                <p className="text-xs text-red-500 mt-2">You cannot retake completed patterns</p>
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
              
              <input 
                type="password" 
                className="input-field" 
                placeholder="Pattern Password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              
              <button 
                onClick={handleContinue}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white p-3 rounded-lg font-semibold transition duration-300 shadow-md"
              >
                Continue
              </button>
              
              {warning && <p className="text-red-500 text-xs mt-2 font-medium">{warning}</p>}
            </div>
          </div>
        )}

        {!loading && step === 'rules' && (
          <div id="rules">
            <h2 className="text-xl font-bold text-emerald-600 mb-3 brand">Rules & Regulations</h2>
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
