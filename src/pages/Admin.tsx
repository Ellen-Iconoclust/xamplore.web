import React, { useState, useEffect } from 'react';
import { collection, addDoc, onSnapshot, query, orderBy, deleteDoc, doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';
import { User, Exam, Question, Resource } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, Trash2, Edit3, Settings, Users, BookOpen, ShieldCheck, Loader2, Save, X, RotateCcw, Lightbulb, Star } from 'lucide-react';
import { getDailyWordObj } from '../utils/wordle';

interface AdminProps {
  user: User;
}

export default function Admin({ user }: AdminProps) {
  const [exams, setExams] = useState<Exam[]>([]);
  const [resources, setResources] = useState<Resource[]>([]);
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'exams' | 'resources' | 'submissions'>('exams');
  
  const dailyWord = getDailyWordObj();
  
  // New Exam State
  const [showExamModal, setShowExamModal] = useState(false);
  const [newExam, setNewExam] = useState<Partial<Exam>>({
    title: '',
    description: '',
    duration: 30,
    loginWindow: 5,
    status: 'draft',
    pattern: '',
    password: '',
    allowedEmails: [],
    questions: []
  });
  const [emailInput, setEmailInput] = useState('');
  const [editingExam, setEditingExam] = useState<Exam | null>(null);
  const [newQuestion, setNewQuestion] = useState<Partial<Question>>({
    text: '',
    options: ['', '', '', ''],
    correctAnswer: 0,
    points: 1
  });

  useEffect(() => {
    if (!db) return;
    const unsubscribeExams = onSnapshot(query(collection(db, 'exams'), orderBy('status', 'desc')), (snapshot) => {
      setExams(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Exam)));
    }, (error) => {
      console.error('Error listening to exams:', error);
    });

    const unsubscribeResources = onSnapshot(collection(db, 'resources'), (snapshot) => {
      setResources(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Resource)));
    }, (error) => {
      console.error('Error listening to resources:', error);
    });

    const unsubscribeSubmissions = onSnapshot(query(collection(db, 'submissions'), orderBy('submittedAt', 'desc')), (snapshot) => {
      setSubmissions(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    }, (error) => {
      console.error('Error listening to submissions:', error);
      setLoading(false);
    });

    return () => {
      unsubscribeExams();
      unsubscribeResources();
      unsubscribeSubmissions();
    };
  }, []);

  const handleCreateExam = async () => {
    if (!newExam.title || !newExam.duration || !newExam.pattern || !newExam.password) {
      alert('Please fill all required fields (Title, Duration, Pattern, Password)');
      return;
    }
    
    try {
      const examData = { ...newExam };
      if (examData.status === 'active' && !editingExam) {
        examData.startTime = serverTimestamp() as any;
      }
      
      if (editingExam) {
        await updateDoc(doc(db, 'exams', editingExam.id), {
          ...examData
        });
      } else {
        await addDoc(collection(db, 'exams'), {
          ...examData,
          createdBy: user.uid,
          createdAt: serverTimestamp()
        });
      }
      setShowExamModal(false);
      setEditingExam(null);
      setNewExam({ title: '', description: '', duration: 30, loginWindow: 5, status: 'draft', pattern: '', password: '', allowedEmails: [], questions: [] });
    } catch (error) {
      console.error('Error saving exam:', error);
    }
  };

  const handleEditExam = (exam: Exam) => {
    setEditingExam(exam);
    setNewExam(exam);
    setShowExamModal(true);
  };

  const addAllowedEmail = () => {
    if (emailInput && !newExam.allowedEmails?.includes(emailInput)) {
      setNewExam({
        ...newExam,
        allowedEmails: [...(newExam.allowedEmails || []), emailInput]
      });
      setEmailInput('');
    }
  };

  const removeAllowedEmail = (email: string) => {
    setNewExam({
      ...newExam,
      allowedEmails: newExam.allowedEmails?.filter(e => e !== email)
    });
  };

  const addQuestion = () => {
    if (!newQuestion.text || newQuestion.options?.some(o => !o)) {
      alert('Please fill question text and all 4 options');
      return;
    }
    const question: Question = {
      id: Math.random().toString(36).substr(2, 9),
      text: newQuestion.text!,
      options: newQuestion.options as string[],
      correctAnswer: newQuestion.correctAnswer!,
      points: newQuestion.points!
    };
    setNewExam({
      ...newExam,
      questions: [...(newExam.questions || []), question]
    });
    setNewQuestion({ text: '', options: ['', '', '', ''], correctAnswer: 0, points: 1 });
  };

  const removeQuestion = (id: string) => {
    setNewExam({
      ...newExam,
      questions: newExam.questions?.filter(q => q.id !== id)
    });
  };

  const [confirmingExamDeleteId, setConfirmingExamDeleteId] = useState<string | null>(null);

  const handleDeleteExam = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'exams', id));
      setConfirmingExamDeleteId(null);
    } catch (error) {
      console.error('Error deleting exam:', error);
    }
  };

  const toggleExamStatus = async (exam: Exam) => {
    const newStatus = exam.status === 'active' ? 'completed' : 'active';
    const updates: any = { status: newStatus };
    if (newStatus === 'active') {
      updates.startTime = serverTimestamp();
    }
    await updateDoc(doc(db, 'exams', exam.id), updates);
  };

  const handleResetSubmission = async (id: string) => {
    try {
      // Grant 15 minutes of special login time
      const expiry = new Date();
      expiry.setMinutes(expiry.getMinutes() + 15);
      
      await updateDoc(doc(db, 'submissions', id), { 
        status: 'retake_allowed',
        specialLoginExpiry: expiry
      });
    } catch (error: any) {
      console.error('Error resetting submission:', error);
      alert('Error resetting submission: ' + error.message);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-20">
        <Loader2 className="animate-spin text-primary" size={40} />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-12 bg-emerald-50/20 min-h-screen">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
        <div>
          <h1 className="font-display text-4xl uppercase tracking-tight mb-2 text-secondary">Admin Dashboard</h1>
          <p className="text-secondary/50">Manage exams, learning resources, and student access.</p>
        </div>

        {/* Wordle Word of the Day Card */}
        <div className="bg-white border border-emerald-100 rounded-[40px] p-6 shadow-sm flex items-center gap-6 max-w-md">
          <div className="bg-emerald-100 p-4 rounded-3xl text-emerald-600">
            <Star size={32} />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">Wordle Word of the Day</span>
            </div>
            <h3 className="text-2xl font-bold text-secondary uppercase tracking-tight">{dailyWord.word}</h3>
            <p className="text-xs text-secondary/50 italic line-clamp-1" title={dailyWord.definition}>{dailyWord.definition}</p>
          </div>
        </div>

        <div className="flex bg-white p-1 rounded-2xl border border-emerald-100 shadow-sm">
          <button 
            onClick={() => setActiveTab('exams')}
            className={`px-6 py-3 rounded-xl text-sm font-bold uppercase tracking-widest text-[10px] transition-all ${activeTab === 'exams' ? 'bg-emerald-900 text-white shadow-lg shadow-emerald-900/20' : 'text-secondary/60 hover:bg-emerald-50'}`}
          >
            Exams
          </button>
          <button 
            onClick={() => setActiveTab('resources')}
            className={`px-6 py-3 rounded-xl text-sm font-bold uppercase tracking-widest text-[10px] transition-all ${activeTab === 'resources' ? 'bg-emerald-900 text-white shadow-lg shadow-emerald-900/20' : 'text-secondary/60 hover:bg-emerald-50'}`}
          >
            Resources
          </button>
          <button 
            onClick={() => setActiveTab('submissions')}
            className={`px-6 py-3 rounded-xl text-sm font-bold uppercase tracking-widest text-[10px] transition-all ${activeTab === 'submissions' ? 'bg-emerald-900 text-white shadow-lg shadow-emerald-900/20' : 'text-secondary/60 hover:bg-emerald-50'}`}
          >
            Submissions
          </button>
        </div>
      </div>

      {activeTab === 'exams' && (
        <div className="space-y-8">
          <div className="flex justify-between items-center">
            <h2 className="font-display text-2xl uppercase tracking-tight flex items-center gap-3 text-secondary">
              <ShieldCheck className="text-primary" />
              Exam Management
            </h2>
            <button 
              onClick={() => setShowExamModal(true)} 
              className="flex items-center gap-2 bg-emerald-900 text-white px-8 py-4 rounded-2xl font-bold uppercase tracking-widest text-sm hover:bg-emerald-800 transition-all shadow-lg shadow-emerald-900/20"
            >
              <Plus size={20} /> Create Exam
            </button>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {exams.map((exam) => (
              <div key={exam.id} className="bg-white border border-emerald-100 rounded-[40px] p-8 shadow-sm hover:shadow-md transition-all flex flex-col justify-between group">
                <div>
                  <div className="flex justify-between items-start mb-6">
                    <span className={`px-3 py-1 text-[10px] font-bold uppercase tracking-widest rounded-full border ${
                      exam.status === 'active' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 
                      exam.status === 'completed' ? 'bg-secondary/5 text-secondary/40 border-emerald-50' : 'bg-orange-50 text-orange-600 border-orange-100'
                    }`}>
                      {exam.status}
                    </span>
                    <div className="flex gap-2">
                      <button onClick={() => handleEditExam(exam)} className="p-2 text-secondary/40 hover:text-primary transition-colors" title="Edit">
                        <Edit3 size={18} />
                      </button>
                      <button onClick={() => toggleExamStatus(exam)} className="p-2 text-secondary/40 hover:text-primary transition-colors" title="Toggle Status">
                        <Settings size={18} />
                      </button>
                      {confirmingExamDeleteId === exam.id ? (
                        <div className="flex items-center gap-1">
                          <button 
                            onClick={() => handleDeleteExam(exam.id)}
                            className="bg-red-500 text-white px-2 py-1 rounded-lg text-[10px] font-bold uppercase tracking-widest hover:bg-red-600 transition-all"
                          >
                            Confirm?
                          </button>
                          <button 
                            onClick={() => setConfirmingExamDeleteId(null)}
                            className="p-1 text-secondary/40 hover:text-secondary transition-colors"
                          >
                            <X size={14} />
                          </button>
                        </div>
                      ) : (
                        <button onClick={() => setConfirmingExamDeleteId(exam.id)} className="p-2 text-secondary/40 hover:text-red-500 transition-colors" title="Delete">
                          <Trash2 size={18} />
                        </button>
                      )}
                    </div>
                  </div>
                  <h3 className="text-xl font-bold mb-3 text-secondary group-hover:text-primary transition-colors">{exam.title}</h3>
                  <p className="text-sm text-secondary/60 mb-8 leading-relaxed line-clamp-2">{exam.description || 'No description provided.'}</p>
                </div>
                
                <div className="flex items-center justify-between pt-6 border-t border-emerald-50">
                  <div className="text-[10px] font-bold uppercase tracking-widest text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full">
                    {exam.questions?.length || 0} Questions
                  </div>
                  <div className="text-[10px] font-bold uppercase tracking-widest text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full">
                    {exam.duration} Minutes
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'resources' && (
        <div className="space-y-8">
          <div className="flex justify-between items-center">
            <h2 className="font-display text-2xl uppercase tracking-tight flex items-center gap-3 text-secondary">
              <BookOpen className="text-primary" />
              Resource Management
            </h2>
            <button className="flex items-center gap-2 bg-emerald-900 text-white px-8 py-4 rounded-2xl font-bold uppercase tracking-widest text-sm hover:bg-emerald-800 transition-all shadow-lg shadow-emerald-900/20">
              <Plus size={20} /> Add Resource
            </button>
          </div>
          
          <div className="bg-white rounded-[40px] border border-emerald-100 overflow-hidden shadow-sm">
            <table className="w-full text-left">
              <thead className="bg-emerald-50/50 text-[10px] font-bold uppercase tracking-widest text-secondary/40">
                <tr>
                  <th className="px-8 py-6">Title</th>
                  <th className="px-8 py-6">Category</th>
                  <th className="px-8 py-6">URL</th>
                  <th className="px-8 py-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-emerald-50">
                {resources.map((res) => (
                  <tr key={res.id} className="hover:bg-emerald-50/30 transition-colors">
                    <td className="px-8 py-6 font-bold text-secondary text-sm">{res.title}</td>
                    <td className="px-8 py-6">
                      <span className="px-3 py-1 bg-emerald-50 text-emerald-600 text-[10px] font-bold uppercase tracking-widest rounded-full border border-emerald-100">
                        {res.category || 'General'}
                      </span>
                    </td>
                    <td className="px-8 py-6 text-xs text-primary truncate max-w-[200px]">{res.url}</td>
                    <td className="px-8 py-6 text-right">
                      <button className="p-2 text-secondary/40 hover:text-red-500 transition-colors">
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'submissions' && (
        <div className="space-y-8">
          <div className="flex justify-between items-center">
            <h2 className="font-display text-2xl uppercase tracking-tight flex items-center gap-3 text-secondary">
              <Users className="text-primary" />
              Student Submissions
            </h2>
          </div>
          
          <div className="bg-white rounded-[40px] border border-emerald-100 overflow-hidden shadow-sm">
            <table className="w-full text-left">
              <thead className="bg-emerald-50/50 text-[10px] font-bold uppercase tracking-widest text-secondary/40">
                <tr>
                  <th className="px-8 py-6">Student</th>
                  <th className="px-8 py-6">Exam Pattern</th>
                  <th className="px-8 py-6">Status</th>
                  <th className="px-8 py-6">Score / Reason</th>
                  <th className="px-8 py-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-emerald-50">
                {submissions.map((sub) => (
                  <tr key={sub.id} className="hover:bg-emerald-50/30 transition-colors">
                    <td className="px-8 py-6">
                      <p className="font-bold text-secondary text-sm">{sub.userName}</p>
                      <p className="text-[10px] text-secondary/40 font-mono">{sub.userId}</p>
                    </td>
                    <td className="px-8 py-6">
                      <span className="px-3 py-1 bg-emerald-50 text-emerald-600 text-[10px] font-bold uppercase tracking-widest rounded-full border border-emerald-100">
                        Pattern {sub.pattern || 'N/A'}
                      </span>
                    </td>
                    <td className="px-8 py-6">
                      <span className={`px-3 py-1 text-[10px] font-bold uppercase tracking-widest rounded-full border ${
                        sub.status === 'submitted' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 
                        sub.status === 'retake_allowed' ? 'bg-blue-50 text-blue-600 border-blue-100' :
                        'bg-red-50 text-red-600 border-red-100'
                      }`}>
                        {sub.status === 'retake_allowed' ? 'Retake Allowed' : sub.status}
                      </span>
                    </td>
                    <td className="px-8 py-6">
                      {sub.status === 'submitted' ? (
                        <p className="text-sm font-bold text-emerald-600">{sub.score} / {sub.totalQuestions}</p>
                      ) : (
                        <p className="text-xs text-red-500 font-medium italic">{sub.reason || 'Malpractice detected'}</p>
                      )}
                    </td>
                    <td className="px-8 py-6 text-right">
                      {sub.status === 'failed' && (
                        <button 
                          onClick={() => handleResetSubmission(sub.id)}
                          className="flex items-center gap-2 bg-emerald-100 text-emerald-700 px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-emerald-200 transition-all ml-auto"
                        >
                          <RotateCcw size={14} /> Allow Retry
                        </button>
                      )}
                      {sub.status === 'retake_allowed' && (
                        <span className="text-[10px] font-bold text-blue-600 uppercase tracking-widest">
                          Retry Granted
                        </span>
                      )}
                      {sub.status === 'submitted' && (
                        <button className="p-2 text-secondary/40 hover:text-red-500 transition-colors">
                          <Trash2 size={16} />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
                {submissions.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-8 py-12 text-center text-secondary/40 italic">No submissions found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Create Exam Modal */}
      <AnimatePresence>
        {showExamModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center px-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowExamModal(false)}
              className="absolute inset-0 bg-emerald-900/40 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative bg-white w-full max-w-2xl rounded-[40px] shadow-2xl overflow-hidden"
            >
              <div className="px-10 py-8 border-b border-emerald-50 bg-emerald-50/30 flex justify-between items-center">
                <h2 className="font-display text-2xl uppercase tracking-tight text-secondary">{editingExam ? 'Edit Exam' : 'Create New Exam'}</h2>
                <button onClick={() => { setShowExamModal(false); setEditingExam(null); }} className="p-2 hover:bg-emerald-50 rounded-full text-secondary/40">
                  <X size={24} />
                </button>
              </div>

              <div className="p-10 space-y-8 max-h-[70vh] overflow-y-auto no-scrollbar">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-secondary/40">Exam Title</label>
                  <input 
                    type="text" 
                    value={newExam.title}
                    onChange={(e) => setNewExam({...newExam, title: e.target.value})}
                    className="w-full px-6 py-4 bg-emerald-50 border border-emerald-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/20" 
                    placeholder="e.g. Data Structures Mid-Term"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-secondary/40">Description</label>
                  <textarea 
                    value={newExam.description}
                    onChange={(e) => setNewExam({...newExam, description: e.target.value})}
                    className="w-full px-6 py-4 bg-emerald-50 border border-emerald-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/20 min-h-[120px] resize-none" 
                    placeholder="Describe the exam scope..."
                  />
                </div>
                <div className="grid grid-cols-2 gap-8">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-secondary/40">Pattern (A, B, C)</label>
                    <input 
                      type="text" 
                      value={newExam.pattern}
                      onChange={(e) => setNewExam({...newExam, pattern: e.target.value})}
                      className="w-full px-6 py-4 bg-emerald-50 border border-emerald-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/20" 
                      placeholder="e.g. A"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-secondary/40">Exam Password</label>
                    <input 
                      type="text" 
                      value={newExam.password}
                      onChange={(e) => setNewExam({...newExam, password: e.target.value})}
                      className="w-full px-6 py-4 bg-emerald-50 border border-emerald-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/20" 
                      placeholder="Secret Password"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-8">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-secondary/40">Duration (Mins)</label>
                    <input 
                      type="number" 
                      value={newExam.duration ?? ''}
                      onChange={(e) => {
                        const val = parseInt(e.target.value);
                        setNewExam({...newExam, duration: isNaN(val) ? 0 : val});
                      }}
                      className="w-full px-6 py-4 bg-emerald-50 border border-emerald-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/20" 
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-secondary/40">Login Window (Mins)</label>
                    <input 
                      type="number" 
                      value={newExam.loginWindow ?? ''}
                      onChange={(e) => {
                        const val = parseInt(e.target.value);
                        setNewExam({...newExam, loginWindow: isNaN(val) ? 0 : val});
                      }}
                      className="w-full px-6 py-4 bg-emerald-50 border border-emerald-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/20" 
                      placeholder="e.g. 5"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-8">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-secondary/40">Initial Status</label>
                    <select 
                      value={newExam.status}
                      onChange={(e) => setNewExam({...newExam, status: e.target.value as any})}
                      className="w-full px-6 py-4 bg-emerald-50 border border-emerald-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/20 appearance-none"
                    >
                      <option value="draft">Draft</option>
                      <option value="active">Active</option>
                    </select>
                  </div>
                </div>

                {/* Allowed Emails Section */}
                <div className="space-y-4">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-secondary/40">Allowed Student Emails</label>
                  <div className="flex gap-2">
                    <input 
                      type="email" 
                      value={emailInput}
                      onChange={(e) => setEmailInput(e.target.value)}
                      className="flex-1 px-6 py-4 bg-emerald-50 border border-emerald-100 rounded-2xl focus:outline-none" 
                      placeholder="student@example.com"
                    />
                    <button 
                      onClick={addAllowedEmail}
                      className="bg-emerald-900 text-white px-6 rounded-2xl font-bold uppercase tracking-widest text-[10px]"
                    >
                      Add
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {newExam.allowedEmails?.map(email => (
                      <span key={email} className="px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full text-xs flex items-center gap-2">
                        {email}
                        <button onClick={() => removeAllowedEmail(email)} className="hover:text-red-500"><X size={12} /></button>
                      </span>
                    ))}
                    {(!newExam.allowedEmails || newExam.allowedEmails.length === 0) && (
                      <p className="text-xs text-secondary/40 italic">No emails added. If empty, any student can take it (based on pattern).</p>
                    )}
                  </div>
                </div>

                {/* Question Builder Section */}
                <div className="space-y-6 pt-6 border-t border-emerald-50">
                  <h3 className="font-display text-xl uppercase tracking-tight text-secondary">Questions ({newExam.questions?.length || 0})</h3>
                  
                  <div className="bg-emerald-50/50 p-6 rounded-3xl border border-emerald-100 space-y-4">
                    <input 
                      type="text" 
                      value={newQuestion.text}
                      onChange={(e) => setNewQuestion({...newQuestion, text: e.target.value})}
                      className="w-full px-6 py-4 bg-white border border-emerald-100 rounded-2xl focus:outline-none" 
                      placeholder="Question text..."
                    />
                    <div className="grid grid-cols-2 gap-4">
                      {newQuestion.options?.map((opt, idx) => (
                        <div key={idx} className="flex items-center gap-2">
                          <input 
                            type="radio" 
                            checked={newQuestion.correctAnswer === idx}
                            onChange={() => setNewQuestion({...newQuestion, correctAnswer: idx})}
                            className="w-4 h-4 accent-emerald-600"
                          />
                          <input 
                            type="text" 
                            value={opt}
                            onChange={(e) => {
                              const opts = [...(newQuestion.options || [])];
                              opts[idx] = e.target.value;
                              setNewQuestion({...newQuestion, options: opts});
                            }}
                            className="w-full px-4 py-2 bg-white border border-emerald-100 rounded-xl focus:outline-none text-sm" 
                            placeholder={`Option ${idx + 1}`}
                          />
                        </div>
                      ))}
                    </div>
                    <button 
                      onClick={addQuestion}
                      className="w-full py-3 bg-emerald-100 text-emerald-900 rounded-xl font-bold uppercase tracking-widest text-[10px] hover:bg-emerald-200 transition-all"
                    >
                      Add Question to Exam
                    </button>
                  </div>

                  <div className="space-y-4">
                    {newExam.questions?.map((q, idx) => (
                      <div key={q.id} className="p-4 bg-white border border-emerald-100 rounded-2xl flex justify-between items-start gap-4">
                        <div className="flex-1">
                          <p className="text-sm font-bold text-secondary">{idx + 1}. {q.text}</p>
                          <div className="grid grid-cols-2 gap-x-4 mt-2">
                            {q.options.map((opt, i) => (
                              <p key={i} className={`text-xs ${i === q.correctAnswer ? 'text-emerald-600 font-bold' : 'text-secondary/50'}`}>
                                • {opt}
                              </p>
                            ))}
                          </div>
                        </div>
                        <button onClick={() => removeQuestion(q.id)} className="text-secondary/30 hover:text-red-500">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="p-10 border-t border-emerald-50 bg-emerald-50/30">
                <button onClick={handleCreateExam} className="w-full py-5 bg-emerald-900 text-white rounded-2xl font-bold uppercase tracking-widest text-sm hover:bg-emerald-800 transition-all shadow-lg shadow-emerald-900/20 flex items-center justify-center gap-2">
                  <Save size={20} /> Save Exam
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
