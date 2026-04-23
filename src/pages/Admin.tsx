import React, { useState, useEffect } from 'react';
import { collection, addDoc, onSnapshot, query, orderBy, deleteDoc, doc, updateDoc, serverTimestamp, getDoc, setDoc } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { User, Exam, Question, Resource, AdminMaterial } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, Trash2, Edit3, Settings, Users, BookOpen, ShieldCheck, Loader2, Save, X, RotateCcw, Lightbulb, Star, Youtube, FileText } from 'lucide-react';
import { getDailyWordObj } from '../utils/wordle';

interface AdminProps {
  user: User;
}

export default function Admin({ user }: AdminProps) {
  const [exams, setExams] = useState<Exam[]>([]);
  const [adminMaterials, setAdminMaterials] = useState<AdminMaterial[]>([]);
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

  // Resource/Admin Material State
  const [showResourceModal, setShowResourceModal] = useState(false);
  const [newMaterial, setNewMaterial] = useState<Partial<AdminMaterial>>({
    topic: '',
    chapter: '',
    details: '',
    content: '',
    videoUrl: '',
    allowedEmails: []
  });
  const [resEmailInput, setResEmailInput] = useState('');
  const [editingMaterial, setEditingMaterial] = useState<AdminMaterial | null>(null);

  useEffect(() => {
    if (!db) return;
    const unsubscribeExams = onSnapshot(query(collection(db, 'exams'), orderBy('status', 'desc')), (snapshot) => {
      setExams(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Exam)));
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'exams');
    });

    const unsubscribeMaterials = onSnapshot(query(collection(db, 'admin_materials'), orderBy('createdAt', 'desc')), (snapshot) => {
      setAdminMaterials(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as AdminMaterial)));
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'admin_materials');
    });

    const unsubscribeSubmissions = onSnapshot(query(collection(db, 'submissions'), orderBy('submittedAt', 'desc')), (snapshot) => {
      setSubmissions(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'submissions');
      setLoading(false);
    });

    return () => {
      unsubscribeExams();
      unsubscribeMaterials();
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
      const questionsWithNoAnswers = examData.questions?.map(q => {
        const { correctAnswer, ...rest } = q;
        return rest;
      });
      
      const answerKey = {
        examId: editingExam?.id || '',
        answers: examData.questions?.reduce((acc, q) => ({
          ...acc,
          [q.id]: q.correctAnswer ?? 0
        }), {})
      };

      if (examData.status === 'active' && !editingExam) {
        examData.startTime = serverTimestamp() as any;
      }
      
      let finalExamId = editingExam?.id;

      if (editingExam) {
        await updateDoc(doc(db, 'exams', editingExam.id), {
          ...examData,
          questions: questionsWithNoAnswers
        });
        await setDoc(doc(db, 'exam_keys', editingExam.id), {
          answers: answerKey.answers,
          examId: editingExam.id
        });
      } else {
        const docRef = await addDoc(collection(db, 'exams'), {
          ...examData,
          questions: questionsWithNoAnswers,
          createdBy: user.uid,
          createdAt: serverTimestamp()
        });
        finalExamId = docRef.id;
        await setDoc(doc(db, 'exam_keys', finalExamId), {
          answers: answerKey.answers,
          examId: finalExamId
        });
      }
      setShowExamModal(false);
      setEditingExam(null);
      setNewExam({ title: '', description: '', duration: 30, loginWindow: 5, status: 'draft', pattern: '', password: '', allowedEmails: [], questions: [] });
    } catch (error) {
      handleFirestoreError(error, editingExam ? OperationType.UPDATE : OperationType.CREATE, 'exams');
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
      handleFirestoreError(error, OperationType.DELETE, `exams/${id}`);
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

  const handleGradeSubmission = async (sub: any) => {
    try {
      const keySnap = await getDoc(doc(db, 'exam_keys', sub.examId));
      if (!keySnap.exists()) {
        alert('Answer key not found for this exam.');
        return;
      }
      
      const { answers: correctAnswers } = keySnap.data();
      const studentAnswers = sub.answers || {};
      
      let score = 0;
      Object.keys(correctAnswers).forEach(qId => {
        if (studentAnswers[qId] !== undefined && String(studentAnswers[qId]) === String(correctAnswers[qId])) {
          score++;
        }
      });
      
      await updateDoc(doc(db, 'submissions', sub.id), {
        score,
        status: 'submitted', // Ensure it's marked as submitted if it wasn't
        gradedAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Error grading submission:', error);
      alert('Failed to grade submission');
    }
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

  const handleSaveMaterial = async () => {
    if (!newMaterial.topic || !newMaterial.chapter || !newMaterial.content) {
      alert('Please fill all required fields (Topic, Chapter, Content)');
      return;
    }

    try {
      if (editingMaterial) {
        await updateDoc(doc(db, 'admin_materials', editingMaterial.id), {
          ...newMaterial
        });
      } else {
        await addDoc(collection(db, 'admin_materials'), {
          ...newMaterial,
          createdBy: user.uid,
          createdAt: serverTimestamp()
        });
      }
      setShowResourceModal(false);
      setEditingMaterial(null);
      setNewMaterial({ topic: '', chapter: '', details: '', content: '', videoUrl: '', allowedEmails: [] });
    } catch (error) {
      handleFirestoreError(error, editingMaterial ? OperationType.UPDATE : OperationType.CREATE, 'admin_materials');
    }
  };

  const handleDeleteMaterial = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this resource?')) return;
    try {
      await deleteDoc(doc(db, 'admin_materials', id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `admin_materials/${id}`);
    }
  };

  const handleEditMaterial = (material: AdminMaterial) => {
    setEditingMaterial(material);
    setNewMaterial(material);
    setShowResourceModal(true);
  };

  const addResAllowedEmail = () => {
    if (resEmailInput && !newMaterial.allowedEmails?.includes(resEmailInput)) {
      setNewMaterial({
        ...newMaterial,
        allowedEmails: [...(newMaterial.allowedEmails || []), resEmailInput]
      });
      setResEmailInput('');
    }
  };

  const removeResAllowedEmail = (email: string) => {
    setNewMaterial({
      ...newMaterial,
      allowedEmails: newMaterial.allowedEmails?.filter(e => e !== email)
    });
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
            <button 
              onClick={() => { setEditingMaterial(null); setNewMaterial({ topic: '', chapter: '', details: '', content: '', videoUrl: '', allowedEmails: [] }); setShowResourceModal(true); }}
              className="flex items-center gap-2 bg-emerald-900 text-white px-8 py-4 rounded-2xl font-bold uppercase tracking-widest text-sm hover:bg-emerald-800 transition-all shadow-lg shadow-emerald-900/20"
            >
              <Plus size={20} /> Add Resource
            </button>
          </div>
          
          <div className="bg-white rounded-[40px] border border-emerald-100 overflow-hidden shadow-sm">
            <table className="w-full text-left">
              <thead className="bg-emerald-50/50 text-[10px] font-bold uppercase tracking-widest text-secondary/40">
                <tr>
                  <th className="px-8 py-6">Topic / Chapter</th>
                  <th className="px-8 py-6">Details</th>
                  <th className="px-8 py-6">Visibility</th>
                  <th className="px-8 py-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-emerald-50">
                {adminMaterials.map((res) => (
                  <tr key={res.id} className="hover:bg-emerald-50/30 transition-colors">
                    <td className="px-8 py-6">
                      <p className="font-bold text-secondary text-sm">{res.topic}</p>
                      <p className="text-[10px] text-secondary/40 font-bold uppercase tracking-widest">{res.chapter}</p>
                    </td>
                    <td className="px-8 py-6">
                      <p className="text-xs text-secondary/60 line-clamp-1">{res.details}</p>
                    </td>
                    <td className="px-8 py-6">
                      <span className={`px-3 py-1 text-[10px] font-bold uppercase tracking-widest rounded-full border ${
                        res.allowedEmails.length === 0 ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-blue-50 text-blue-600 border-blue-100'
                      }`}>
                        {res.allowedEmails.length === 0 ? 'Public' : `${res.allowedEmails.length} Students`}
                      </span>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <div className="flex justify-end gap-2">
                        <button onClick={() => handleEditMaterial(res)} className="p-2 text-secondary/40 hover:text-primary transition-colors">
                          <Edit3 size={16} />
                        </button>
                        <button onClick={() => handleDeleteMaterial(res.id)} className="p-2 text-secondary/40 hover:text-red-500 transition-colors">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {adminMaterials.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-8 py-12 text-center text-secondary/40 italic">No resources uploaded yet.</td>
                  </tr>
                )}
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
                        <div className="flex flex-col">
                          {sub.score !== undefined ? (
                            <p className="text-sm font-bold text-emerald-600">{sub.score} / {sub.totalQuestions}</p>
                          ) : (
                            <button 
                              onClick={() => handleGradeSubmission(sub)}
                              className="text-[10px] font-bold text-primary uppercase underline decoration-primary/30 hover:decoration-primary"
                            >
                              Grade Now
                            </button>
                          )}
                        </div>
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

      {/* Resource Modal */}
      <AnimatePresence>
        {showResourceModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center px-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => { setShowResourceModal(false); setEditingMaterial(null); }}
              className="absolute inset-0 bg-emerald-900/40 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative bg-white w-full max-w-2xl rounded-[40px] shadow-2xl overflow-hidden"
            >
              <div className="px-10 py-8 border-b border-emerald-50 bg-emerald-50/30 flex justify-between items-center">
                <h2 className="font-display text-2xl uppercase tracking-tight text-secondary">{editingMaterial ? 'Edit Resource' : 'Add New Resource'}</h2>
                <button onClick={() => { setShowResourceModal(false); setEditingMaterial(null); }} className="p-2 hover:bg-emerald-50 rounded-full text-secondary/40">
                  <X size={24} />
                </button>
              </div>

              <div className="p-10 space-y-8 max-h-[70vh] overflow-y-auto no-scrollbar">
                <div className="grid grid-cols-2 gap-8">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-secondary/40">Topic</label>
                    <input 
                      type="text" 
                      value={newMaterial.topic}
                      onChange={(e) => setNewMaterial({...newMaterial, topic: e.target.value})}
                      className="w-full px-6 py-4 bg-emerald-50 border border-emerald-100 rounded-2xl focus:outline-none" 
                      placeholder="e.g. Data Structures"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-secondary/40">Chapter</label>
                    <input 
                      type="text" 
                      value={newMaterial.chapter}
                      onChange={(e) => setNewMaterial({...newMaterial, chapter: e.target.value})}
                      className="w-full px-6 py-4 bg-emerald-50 border border-emerald-100 rounded-2xl focus:outline-none" 
                      placeholder="e.g. Chapter 1: Introduction"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-secondary/40">Short Details</label>
                  <input 
                    type="text" 
                    value={newMaterial.details}
                    onChange={(e) => setNewMaterial({...newMaterial, details: e.target.value})}
                    className="w-full px-6 py-4 bg-emerald-50 border border-emerald-100 rounded-2xl focus:outline-none" 
                    placeholder="Brief description of the material..."
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-secondary/40">Concept Content (Markdown/Text)</label>
                  <textarea 
                    value={newMaterial.content}
                    onChange={(e) => setNewMaterial({...newMaterial, content: e.target.value})}
                    className="w-full px-6 py-4 bg-emerald-50 border border-emerald-100 rounded-2xl focus:outline-none min-h-[200px] resize-none" 
                    placeholder="Write the detailed concept text here..."
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-secondary/40">Video Link (Optional)</label>
                  <div className="relative">
                    <Youtube className="absolute left-4 top-4 text-secondary/40" size={20} />
                    <input 
                      type="url" 
                      value={newMaterial.videoUrl}
                      onChange={(e) => setNewMaterial({...newMaterial, videoUrl: e.target.value})}
                      className="w-full pl-12 pr-6 py-4 bg-emerald-50 border border-emerald-100 rounded-2xl focus:outline-none" 
                      placeholder="https://youtube.com/..."
                    />
                  </div>
                </div>

                {/* Allowed Emails Section */}
                <div className="space-y-4">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-secondary/40">Restrict to Students (Optional)</label>
                  <div className="flex gap-2">
                    <input 
                      type="email" 
                      value={resEmailInput}
                      onChange={(e) => setResEmailInput(e.target.value)}
                      className="flex-1 px-6 py-4 bg-emerald-50 border border-emerald-100 rounded-2xl focus:outline-none" 
                      placeholder="student@example.com"
                    />
                    <button 
                      onClick={addResAllowedEmail}
                      className="bg-emerald-900 text-white px-6 rounded-2xl font-bold uppercase tracking-widest text-[10px]"
                    >
                      Add
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {newMaterial.allowedEmails?.map(email => (
                      <span key={email} className="px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full text-xs flex items-center gap-2">
                        {email}
                        <button onClick={() => removeResAllowedEmail(email)} className="hover:text-red-500"><X size={12} /></button>
                      </span>
                    ))}
                    {(!newMaterial.allowedEmails || newMaterial.allowedEmails.length === 0) && (
                      <p className="text-xs text-secondary/40 italic">Visible to all students if no emails are added.</p>
                    )}
                  </div>
                </div>
              </div>

              <div className="p-10 border-t border-emerald-50 bg-emerald-50/30">
                <button onClick={handleSaveMaterial} className="w-full py-5 bg-emerald-900 text-white rounded-2xl font-bold uppercase tracking-widest text-sm hover:bg-emerald-800 transition-all shadow-lg shadow-emerald-900/20 flex items-center justify-center gap-2">
                  <Save size={20} /> Save Resource Material
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
