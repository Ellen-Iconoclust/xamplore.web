import React, { useState, useEffect } from 'react';
import { Search, Star, PlayCircle, ExternalLink, Code, ChevronDown, ChevronUp, Share2, User, BookOpen, Send, XCircle, Loader2, Sparkles, GraduationCap } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const coursesData: any = {
  c: [
    {
      title: "C Programming For Beginners - Full Course",
      instructor: "freeCodeCamp",
      url: "https://youtu.be/KJgsSFOSQv0",
      description: "Master C programming from scratch with hands-on exercises and practical examples.",
      rating: "4.9",
      duration: "4 hours",
      level: "Beginner",
      tags: ["c", "beginner", "complete-course"]
    },
    {
      title: "C Programming Tutorial for Beginners",
      instructor: "Programming with Mosh",
      url: "https://youtu.be/KJgsSFOSQv0",
      description: "Learn C fundamentals with clear explanations and real-world programming concepts.",
      rating: "4.8",
      duration: "3.5 hours",
      level: "Beginner",
      tags: ["c", "basics", "tutorial"]
    },
    // ... more data can be added here
  ],
  cpp: [
    {
      title: "C++ Programming Course - Beginner to Advanced",
      instructor: "freeCodeCamp",
      url: "https://youtu.be/vLnPwxZdW4Y",
      description: "Complete C++ tutorial covering from basics to STL and OOP concepts.",
      rating: "4.9",
      duration: "31 hours",
      level: "All Levels",
      tags: ["cpp", "complete", "stl"]
    }
  ],
  python: [
    {
      title: "Python for Everybody - Full University Course",
      instructor: "freeCodeCamp",
      url: "https://youtu.be/8DvywoWv6fI",
      description: "Comprehensive Python course covering basics to web scraping and databases.",
      rating: "4.9",
      duration: "15 hours",
      level: "Beginner",
      tags: ["python", "complete", "university"]
    }
  ],
  java: [],
  javascript: [],
  web: [],
  frameworks: []
};

export default function Resources() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('');
  const [expandedSections, setExpandedSections] = useState<string[]>([]);

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
    'frameworks': 'Frameworks & Libraries'
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
            {['C/C++', 'Python', 'Java', 'JavaScript', 'HTML/CSS', 'Frameworks'].map(tag => (
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
                <option value="">All Languages</option>
                <option value="c">C Programming</option>
                <option value="cpp">C++</option>
                <option value="python">Python</option>
                <option value="java">Java</option>
                <option value="javascript">JavaScript</option>
                <option value="web">HTML/CSS/Tailwind</option>
                <option value="frameworks">Frameworks</option>
              </select>
            </div>
          </div>
        </div>

        {/* Language Sections */}
        <div className="space-y-12">
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
            
            <form className="max-w-2xl mx-auto space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <input type="text" placeholder="Your Name" className="input-field" />
                <input type="text" placeholder="Class/Department" className="input-field" />
              </div>
              <input type="text" placeholder="Course/Video Title" className="input-field" />
              <textarea placeholder="Short Description" className="input-field min-h-[100px]" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <input type="text" placeholder="Channel/Tutor Name" className="input-field" />
                <input type="url" placeholder="Course URL (YouTube/Link)" className="input-field" />
              </div>
              <button type="button" className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-4 rounded-lg shadow-lg transition flex items-center justify-center gap-2">
                <Send size={20} /> Submit for Review
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
