import React, { useState, useEffect } from 'react';
import { Search, Star, PlayCircle, ExternalLink, Code, ChevronDown, ChevronUp, Share2, User, BookOpen, Send, XCircle, Loader2, Sparkles, GraduationCap, FileText, Youtube, Info, Clock, Play } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { coursesData } from '../data/coursesData';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { AdminMaterial, User as AppUser } from '../types';

interface ResourcesProps {
  user: AppUser | null;
}

export default function Resources({ user }: ResourcesProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('');
  const [expandedSections, setExpandedSections] = useState<string[]>(['your-materials']);
  const [adminMaterials, setAdminMaterials] = useState<AdminMaterial[]>([]);
  const [selectedMaterial, setSelectedMaterial] = useState<AdminMaterial | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    class: '',
    title: '',
    description: '',
    instructor: '',
    url: ''
  });
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');

  useEffect(() => {
    if (!db) return;
    const q = query(collection(db, 'admin_materials'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const allMaterials = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as AdminMaterial));
      
      // Filter materials
      const filtered = allMaterials.filter(mat => {
        // If public (no restricted emails)
        if (!mat.allowedEmails || mat.allowedEmails.length === 0) return true;
        // If user is logged in and their email is in the list
        if (user && mat.allowedEmails.includes(user.email)) return true;
        // If user is admin (can see all their materials)
        if (user && user.role === 'admin') return true;
        
        return false;
      });
      
      setAdminMaterials(filtered);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'admin_materials');
    });

    return () => unsubscribe();
  }, [user]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('submitting');
    
    try {
      const response = await fetch('https://formspree.io/f/xzdelqel', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });
      
      if (response.ok) {
        setStatus('success');
        setFormData({
          name: '',
          class: '',
          title: '',
          description: '',
          instructor: '',
          url: ''
        });
        // Reset success message after 5 seconds
        setTimeout(() => setStatus('idle'), 5000);
      } else {
        setStatus('error');
      }
    } catch (error) {
      console.error('Submission error:', error);
      setStatus('error');
    }
  };

  const toggleSection = (lang: string) => {
    setExpandedSections(prev => 
      prev.includes(lang) ? prev.filter(l => l !== lang) : [...prev, lang]
    );
  };

  const getLevelColor = (level: string) => {
    switch(level.toLowerCase()) {
      case 'beginner': return 'bg-green-100 text-green-800';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'advanced': return 'bg-red-100 text-red-800';
      default: return 'bg-blue-100 text-blue-800';
    }
  };

  const languageNames: any = {
    'c': 'C Programming',
    'cpp': 'C++ Programming',
    'python': 'Python Programming',
    'java': 'Java Programming',
    'javascript': 'JavaScript',
    'web': 'Web Development (HTML/CSS/Tailwind)',
    'frameworks': 'Frameworks & Libraries',
    'dsa': 'Data Structures & Algorithms',
    'database': 'Database Management (SQL/NoSQL)',
    'cloud': 'Cloud Computing (AWS/Azure/GCP)',
    'cybersecurity': 'Cybersecurity & Ethical Hacking'
  };

  return (
    <section id="courses" className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-extrabold brand text-emerald-600 mb-4">
            Programming Resource Hub
          </h2>
          <p className="text-xl text-gray-600 mb-6">Curated tutorials & learning resources for SRCAS students</p>
          <div className="flex flex-wrap justify-center gap-3 mb-8">
            {['C/C++', 'Python', 'Java', 'JavaScript', 'HTML/CSS', 'Frameworks', 'DSA', 'Databases', 'Cloud', 'Cybersecurity'].map(tag => (
              <span key={tag} className="px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full text-sm font-medium">{tag}</span>
            ))}
          </div>
        </div>

        {/* Search and Filter */}
        <div className="mb-12">
          <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-3.5 text-gray-400 w-5 h-5" />
                <input 
                  type="text" 
                  placeholder="Search tutorials by language, topic, or instructor..." 
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <select 
                className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none transition-all bg-white"
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
              >
                <option value="">All Categories</option>
                <option value="c">C Programming</option>
                <option value="cpp">C++</option>
                <option value="python">Python</option>
                <option value="java">Java</option>
                <option value="javascript">JavaScript</option>
                <option value="web">HTML/CSS/Tailwind</option>
                <option value="frameworks">Frameworks</option>
                <option value="dsa">DSA</option>
                <option value="database">Databases</option>
                <option value="cloud">Cloud Computing</option>
                <option value="cybersecurity">Cybersecurity</option>
              </select>
            </div>
          </div>
        </div>

        {/* Language Sections */}
        <div className="space-y-12">
          {/* Admin Materials Section */}
          {adminMaterials.length > 0 && (
            <div className="mb-14">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-3">
                <div className="flex items-center gap-3">
                  <div className="bg-emerald-100 p-2 rounded-lg">
                    <BookOpen className="text-emerald-600 w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-gray-800 tracking-tight">Your Materials</h3>
                    <p className="text-xs text-secondary/60 font-medium">Specially shared resources & materials</p>
                  </div>
                </div>
                <button 
                  onClick={() => toggleSection('your-materials')}
                  className="text-emerald-600 hover:text-emerald-700 font-bold flex items-center gap-1 self-start sm:self-center"
                >
                  {expandedSections.includes('your-materials') ? <ChevronUp /> : <ChevronDown />}
                  <span>{expandedSections.includes('your-materials') ? 'Collapse' : 'Expand'}</span>
                </button>
              </div>

              <AnimatePresence>
                {expandedSections.includes('your-materials') && (
                  <motion.div 
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-8">
                      {adminMaterials.map((mat) => (
                        <div key={mat.id} className="bg-white p-8 rounded-[40px] shadow-lg border border-emerald-100 hover:border-emerald-500 hover:shadow-xl transition-all duration-300 group flex flex-col justify-between">
                          <div>
                            <div className="flex justify-between items-start mb-6">
                              <span className="bg-emerald-50 text-emerald-600 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border border-emerald-100">
                                {mat.chapter}
                              </span>
                              {mat.videoUrl && (
                                <div className="text-red-500" title="Includes Video">
                                  <Youtube size={18} />
                                </div>
                              )}
                            </div>
                            <h4 className="font-bold text-xl text-secondary mb-3 group-hover:text-emerald-600 transition-colors tracking-tight">
                              {mat.topic}
                            </h4>
                            <p className="text-sm text-secondary/60 mb-8 leading-relaxed line-clamp-3">
                              {mat.details}
                            </p>
                          </div>
                          <button 
                            onClick={() => setSelectedMaterial(mat)}
                            className="w-full bg-emerald-900 hover:bg-emerald-800 text-white py-4 px-6 rounded-2xl text-xs font-bold uppercase tracking-widest text-center transition-all duration-300 flex items-center justify-center gap-2 shadow-lg shadow-emerald-900/10"
                          >
                            <FileText size={16} /> Read Material
                          </button>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}

          {Object.keys(coursesData).map(langKey => {
            if (filter && filter !== langKey) return null;
            const courses = coursesData[langKey];
            if (courses.length === 0 && !searchTerm) return null;

            const filteredCourses = courses.filter((c: any) => 
              c.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
              c.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
              c.instructor.toLowerCase().includes(searchTerm.toLowerCase())
            );

            if (searchTerm && filteredCourses.length === 0) return null;

            return (
              <div key={langKey} className="mb-12">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-3">
                  <div className="flex items-center gap-3">
                    <div className="bg-emerald-100 p-2 rounded-lg">
                      <Code className="text-emerald-600 w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-gray-800">{languageNames[langKey]}</h3>
                      <span className="bg-emerald-100 text-emerald-800 px-2 py-1 rounded-full text-xs font-medium mt-1 inline-block">
                        {filteredCourses.length} tutorials
                      </span>
                    </div>
                  </div>
                  <button 
                    onClick={() => toggleSection(langKey)}
                    className="text-emerald-600 hover:text-emerald-700 font-bold flex items-center gap-1 self-start sm:self-center"
                  >
                    {expandedSections.includes(langKey) ? <ChevronUp /> : <ChevronDown />}
                    <span>{expandedSections.includes(langKey) ? 'Collapse' : 'Expand'}</span>
                  </button>
                </div>

                <AnimatePresence>
                  {expandedSections.includes(langKey) && (
                    <motion.div 
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                        {filteredCourses.map((course: any, idx: number) => (
                          <div key={idx} className="bg-white p-6 rounded-xl shadow-lg border border-gray-200 hover:shadow-xl transition-all duration-300 group">
                            <div className="flex justify-between items-start mb-4">
                              <div className="flex-1">
                                <h4 className="font-bold text-lg text-gray-800 mb-1 group-hover:text-emerald-600 line-clamp-2">
                                  {course.title}
                                </h4>
                                <p className="text-sm text-emerald-600 font-medium">{course.instructor}</p>
                              </div>
                              <div className="flex items-center bg-emerald-50 text-emerald-700 px-2 py-1 rounded">
                                <Star size={14} className="mr-1 fill-emerald-700" />
                                <span className="text-xs font-bold">{course.rating}</span>
                              </div>
                            </div>
                            <p className="text-sm text-gray-600 mb-4 line-clamp-3">{course.description}</p>
                            <div className="flex flex-wrap gap-2 mb-6">
                              <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider ${getLevelColor(course.level)}`}>{course.level}</span>
                              <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-[10px] font-bold uppercase tracking-wider">{course.duration}</span>
                            </div>
                            <a 
                              href={course.url} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-2 px-4 rounded-lg text-sm font-bold text-center transition duration-300 flex items-center justify-center gap-2"
                            >
                              <PlayCircle size={18} /> Watch Tutorial
                            </a>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>

        {/* Featured Platforms */}
        <div className="mt-20 mb-16">
          <h3 className="text-3xl font-bold text-gray-800 mb-12 text-center">Essential Learning Platforms</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { name: 'freeCodeCamp', icon: Code, desc: 'Free interactive coding tutorials and projects', url: 'https://freecodecamp.org' },
              { name: 'MDN Web Docs', icon: BookOpen, desc: 'Complete web development documentation', url: 'https://developer.mozilla.org' },
              { name: 'W3Schools', icon: GraduationCap, desc: 'Web tutorials with interactive examples', url: 'https://w3schools.com' },
              { name: 'LeetCode', icon: Sparkles, desc: 'Coding interview preparation platform', url: 'https://leetcode.com' }
            ].map(site => (
              <a key={site.name} href={site.url} target="_blank" rel="noopener noreferrer" className="group">
                <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-200 hover:shadow-xl transition-all duration-300 text-center h-full">
                  <div className="mb-6">
                    <site.icon className="w-12 h-12 text-emerald-600 mx-auto group-hover:scale-110 transition-transform" />
                  </div>
                  <h4 className="font-bold text-lg text-gray-800 mb-2 group-hover:text-emerald-600">{site.name}</h4>
                  <p className="text-sm text-gray-600">{site.desc}</p>
                </div>
              </a>
            ))}
          </div>
        </div>

        {/* Contribute Section */}
        <div className="mt-20">
          <div className="bg-gradient-to-r from-emerald-50 to-green-50 rounded-2xl p-10 border border-emerald-200">
            <div className="text-center mb-10">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-emerald-100 rounded-full mb-6">
                <Share2 className="w-8 h-8 text-emerald-600" />
              </div>
              <h3 className="text-3xl font-bold text-emerald-800 mb-4">Share Your Knowledge</h3>
              <p className="text-lg text-gray-700 max-w-2xl mx-auto">
                Found a helpful programming tutorial? Share it with the SRCAS community to help others learn!
              </p>
            </div>
            
            <form onSubmit={handleSubmit} className="max-w-2xl mx-auto space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <input 
                  type="text" 
                  name="name"
                  placeholder="Your Name" 
                  className="input-field" 
                  required
                  value={formData.name}
                  onChange={handleInputChange}
                />
                <input 
                  type="text" 
                  name="class"
                  placeholder="Class/Department" 
                  className="input-field" 
                  required
                  value={formData.class}
                  onChange={handleInputChange}
                />
              </div>
              <input 
                type="text" 
                name="title"
                placeholder="Course/Video Title" 
                className="input-field" 
                required
                value={formData.title}
                onChange={handleInputChange}
              />
              <textarea 
                name="description"
                placeholder="Short Description" 
                className="input-field min-h-[100px]" 
                required
                value={formData.description}
                onChange={handleInputChange}
              />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <input 
                  type="text" 
                  name="instructor"
                  placeholder="Channel/Tutor Name" 
                  className="input-field" 
                  required
                  value={formData.instructor}
                  onChange={handleInputChange}
                />
                <input 
                  type="url" 
                  name="url"
                  placeholder="Course URL (YouTube/Link)" 
                  className="input-field" 
                  required
                  value={formData.url}
                  onChange={handleInputChange}
                />
              </div>
              <button 
                type="submit" 
                disabled={status === 'submitting'}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-4 rounded-lg shadow-lg transition flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {status === 'submitting' ? (
                  <>
                    <Loader2 className="animate-spin" size={20} /> Submitting...
                  </>
                ) : (
                  <>
                    <Send size={20} /> Submit for Review
                  </>
                )}
              </button>
              
              {status === 'success' && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-center text-emerald-600 font-bold mt-4"
                >
                  Your submission is sent
                </motion.div>
              )}
              
              {status === 'error' && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-center text-red-600 font-bold mt-4"
                >
                  Something went wrong. Please try again.
                </motion.div>
              )}
            </form>
          </div>
        </div>
      </div>

      {/* Material Detail Modal */}
      <AnimatePresence>
        {selectedMaterial && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center px-4 sm:px-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedMaterial(null)}
              className="absolute inset-0 bg-emerald-900/40 backdrop-blur-md"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 30 }}
              className="relative bg-white w-full max-w-4xl rounded-[40px] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
            >
              <div className="px-8 sm:px-12 py-8 bg-emerald-50/50 border-b border-emerald-100 flex justify-between items-center shrink-0">
                <div className="flex items-center gap-4">
                  <div className="bg-emerald-100 p-3 rounded-2xl text-emerald-600">
                    <FileText size={24} />
                  </div>
                  <div>
                    <h2 className="text-xl sm:text-2xl font-bold text-secondary tracking-tight">{selectedMaterial.topic}</h2>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-emerald-600">{selectedMaterial.chapter}</p>
                  </div>
                </div>
                <button 
                  onClick={() => setSelectedMaterial(null)}
                  className="p-3 hover:bg-emerald-100 rounded-full text-secondary transition-colors"
                >
                  <XCircle size={24} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-8 sm:p-12 space-y-10 custom-scrollbar">
                {/* Details Section */}
                <div className="bg-emerald-50 rounded-3xl p-6 border border-emerald-100 flex items-start gap-4">
                  <Info className="text-emerald-600 mt-1 shrink-0" size={20} />
                  <div>
                    <h3 className="font-bold text-sm text-emerald-800 uppercase tracking-widest mb-1">Concept Overview</h3>
                    <p className="text-emerald-700/80 leading-relaxed italic">{selectedMaterial.details}</p>
                  </div>
                </div>

                {/* Content Section */}
                <div className="prose prose-emerald max-w-none">
                  <h3 className="font-display text-2xl uppercase tracking-tight text-secondary mb-6 border-l-4 border-emerald-500 pl-4 bg-emerald-50/30 py-2">Detailed Content</h3>
                  <div className="text-secondary/80 leading-loose whitespace-pre-wrap text-lg bg-emerald-50/10 p-4 rounded-2xl">
                    {selectedMaterial.content}
                  </div>
                </div>

                {/* Video Section */}
                {selectedMaterial.videoUrl && (
                  <div className="pt-8 border-t border-emerald-100">
                    <h3 className="font-bold text-sm text-secondary uppercase tracking-widest mb-6 flex items-center gap-2">
                      <Youtube className="text-red-500" size={20} /> Video Supplement
                    </h3>
                    <div className="aspect-video bg-secondary/5 rounded-3xl flex flex-col items-center justify-center border-2 border-dashed border-secondary/10 group hover:border-emerald-200 transition-colors p-8">
                      <p className="text-secondary/40 text-sm mb-6 font-medium text-center">This topic includes a video tutorial for better understanding.</p>
                      <a 
                        href={selectedMaterial.videoUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 bg-red-600 hover:bg-red-700 text-white px-8 py-4 rounded-2xl font-bold uppercase tracking-widest text-xs transition-transform hover:scale-105 shadow-xl shadow-red-600/20"
                      >
                        <Play size={18} fill="currentColor" /> Watch on YouTube
                      </a>
                    </div>
                  </div>
                )}
              </div>

              <div className="px-12 py-6 bg-emerald-50/30 border-t border-emerald-100 flex justify-between items-center shrink-0">
                <div className="flex items-center gap-2 text-secondary/40">
                  <Clock size={14} />
                  <span className="text-[10px] font-bold uppercase tracking-widest">Added by Faculty</span>
                </div>
                <button 
                  onClick={() => setSelectedMaterial(null)}
                  className="bg-secondary text-white px-8 py-3 rounded-xl font-bold uppercase tracking-widest text-[10px] hover:bg-secondary/90 transition-all shadow-lg shadow-secondary/10"
                >
                  Mark as Read
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
}
