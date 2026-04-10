import React from 'react';
import { 
  Shield, CheckCircle2, User, Lock, Clock, BarChart3, Code2, Server, 
  ShieldCheck, Star, Building2, Globe, Zap, Gamepad2, Brain, Keyboard,
  MousePointer2, Layout, Database, FileText, Award, Smartphone, Trophy, Target
} from 'lucide-react';
import { motion } from 'motion/react';

export default function About() {
  return (
    <div className="flex flex-col bg-white min-h-screen font-sans text-[#2D3748]">
      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-6 py-16 text-center">
        <motion.h1 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-[42px] font-bold text-[#059669] mb-4 tracking-tight"
        >
          About Xamplore
        </motion.h1>
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-lg text-[#4A5568] font-medium"
        >
          Revolutionizing Online Examination Systems with Security and Innovation
        </motion.p>
      </div>

      {/* Intro Section */}
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-2 gap-8 mb-20">
        <motion.div 
          initial={{ opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          className="bg-[#E6FFFA] p-10 rounded-[32px] border border-[#B2F5EA]"
        >
          <h2 className="text-2xl font-bold mb-6 text-[#1A202C]">What is Xamplore?</h2>
          <div className="space-y-4 text-[#4A5568] leading-relaxed">
            <p>
              Xamplore is a secure online examination platform designed for educational institutions. It transforms traditional exams into digital, controlled environments.
            </p>
            <p>
              It incorporates anti-cheating mechanisms, real-time monitoring, and strict timing controls for fair assessment.
            </p>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, x: 30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          className="bg-white p-10 rounded-[32px] border border-[#E2E8F0] shadow-sm"
        >
          <div className="flex items-center gap-4 mb-8">
            <div className="bg-[#E6FFFA] p-3 rounded-2xl text-[#38B2AC]">
              <Shield size={32} />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-[#1A202C]">Core Philosophy</h2>
              <p className="text-sm text-[#718096]">Equal Opportunity • Academic Integrity</p>
            </div>
          </div>
          
          <div className="space-y-6">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="text-[#38B2AC] mt-1 shrink-0" size={20} />
              <div>
                <h4 className="font-bold text-[#2D3748]">Secure Assessment Environment</h4>
                <p className="text-sm text-[#718096]">Prevents cheating through security layers</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle2 className="text-[#38B2AC] mt-1 shrink-0" size={20} />
              <div>
                <h4 className="font-bold text-[#2D3748]">Remote Examination</h4>
                <p className="text-sm text-[#718096]">Enables exams from anywhere</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle2 className="text-[#38B2AC] mt-1 shrink-0" size={20} />
              <div>
                <h4 className="font-bold text-[#2D3748]">Real-time Analytics</h4>
                <p className="text-sm text-[#718096]">Provides instant feedback</p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Platform Features Grid (New Feature) */}
      <div className="max-w-7xl mx-auto px-6 mb-20">
        <h2 className="text-[32px] font-bold mb-12 text-center text-[#1A202C]">Comprehensive Feature Suite</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="p-8 rounded-[32px] bg-white border border-[#E2E8F0] shadow-sm">
            <Layout className="text-[#059669] mb-4" size={32} />
            <h3 className="text-xl font-bold mb-3">Intuitive Dashboard</h3>
            <p className="text-[#718096] text-sm leading-relaxed">A clean, focused interface for students to access their exams, view results, and track their progress without distractions.</p>
          </div>
          <div className="p-8 rounded-[32px] bg-[#059669] text-white shadow-md">
            <Clock className="mb-4" size={32} />
            <h3 className="text-xl font-bold mb-3">Strict Timing Control</h3>
            <p className="text-emerald-50 text-sm leading-relaxed">Precision timers ensure that every second counts. Automatic submission at the end of the window guarantees fairness for all candidates.</p>
          </div>
          <div className="p-8 rounded-[32px] bg-white border border-[#E2E8F0] shadow-sm">
            <Award className="text-[#059669] mb-4" size={32} />
            <h3 className="text-xl font-bold mb-3">Instant Certification</h3>
            <p className="text-[#718096] text-sm leading-relaxed">Automated grading provides immediate feedback and generates verifiable digital certificates upon successful completion.</p>
          </div>
        </div>
      </div>

      {/* How It Works Section */}
      <div className="max-w-7xl mx-auto px-6 mb-20 text-center">
        <h2 className="text-[32px] font-bold mb-12 text-[#1A202C]">How Xamplore Works</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { step: "1. Student Login", desc: "Authenticate with credentials", icon: User, color: "#E6FFFA", iconColor: "#38B2AC" },
            { step: "2. Security Check", desc: "System enforces security measures", icon: Shield, color: "#E6FFFA", iconColor: "#38B2AC" },
            { step: "3. Timed Examination", desc: "Answer questions within time limits", icon: Clock, color: "#E6FFFA", iconColor: "#38B2AC" },
            { step: "4. Results & Analytics", desc: "Instant scoring with certificates", icon: BarChart3, color: "#E6FFFA", iconColor: "#38B2AC" }
          ].map((item, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="bg-white p-8 rounded-[32px] border border-[#E2E8F0] shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6" style={{ backgroundColor: item.color }}>
                <item.icon size={32} style={{ color: item.iconColor }} />
              </div>
              <h3 className="font-bold text-lg mb-2 text-[#2D3748]">{item.step}</h3>
              <p className="text-sm text-[#718096]">{item.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Gamification Section (New Feature) */}
      <div className="max-w-7xl mx-auto px-6 mb-20">
        <div className="bg-[#1A202C] rounded-[32px] p-10 md:p-16 text-white relative overflow-hidden">
          <div className="relative z-10">
            <h2 className="text-[32px] font-bold mb-8 text-center">Beyond Exams: The Games Lab</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-white/5 p-8 rounded-[24px] border border-white/10">
                <Gamepad2 className="text-emerald-400 mb-4" size={32} />
                <h4 className="font-bold text-xl mb-3">Tech Hangman</h4>
                <p className="text-gray-400 text-sm leading-relaxed">Master programming vocabulary! Guess the hidden tech terms before you run out of lives. Perfect for learning new terminology.</p>
              </div>
              <div className="bg-white/5 p-8 rounded-[24px] border border-white/10">
                <Keyboard className="text-emerald-400 mb-4" size={32} />
                <h4 className="font-bold text-xl mb-3">Tech Wordle</h4>
                <p className="text-gray-400 text-sm leading-relaxed">The daily challenge! Decipher a 5-letter technical word in six tries. A new word every day to keep your brain sharp.</p>
              </div>
              <div className="bg-white/5 p-8 rounded-[24px] border border-white/10">
                <Brain className="text-emerald-400 mb-4" size={32} />
                <h4 className="font-bold text-xl mb-3">Logic Lab</h4>
                <p className="text-gray-400 text-sm leading-relaxed">Solve complex code snippets and logic puzzles. Test your ability to predict code output and understand algorithmic flow.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Anti-Cheating Banner */}
      <div className="max-w-7xl mx-auto px-6 mb-20">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="bg-[#059669] rounded-[32px] p-10 md:p-12 text-white flex flex-col md:flex-row items-center justify-between gap-8"
        >
          <div className="flex-1">
            <h2 className="text-[28px] font-bold mb-8">Advanced Anti-Cheating Technology</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-12">
              <div className="flex items-center gap-3">
                <CheckCircle2 size={18} />
                <span className="font-medium">Tab Switching Detection</span>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle2 size={18} />
                <span className="font-medium">Fullscreen Enforcement</span>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle2 size={18} />
                <span className="font-medium">Copy-Paste Prevention</span>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle2 size={18} />
                <span className="font-medium">Screen Capture Blocking</span>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle2 size={18} />
                <span className="font-medium">Right-Click Disabled</span>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle2 size={18} />
                <span className="font-medium">Real-time Malpractice Logging</span>
              </div>
            </div>
          </div>
          <div className="bg-white/20 p-6 rounded-[24px] backdrop-blur-sm">
            <ShieldCheck size={64} className="text-white" />
          </div>
        </motion.div>
      </div>

      {/* Technology Section */}
      <div className="max-w-7xl mx-auto px-6 mb-20">
        <h2 className="text-[32px] font-bold mb-12 text-center text-[#1A202C]">Technology Behind Xamplore</h2>
        <div className="bg-white rounded-[32px] border border-[#E2E8F0] p-12 shadow-sm grid grid-cols-1 md:grid-cols-3 gap-12">
          <div>
            <div className="flex items-center gap-3 mb-6 text-[#059669]">
              <Code2 size={24} />
              <h3 className="text-xl font-bold">Frontend</h3>
            </div>
            <ul className="space-y-4 text-[#4A5568] font-medium">
              <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-[#059669]" /> React 18 & TypeScript</li>
              <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-[#059669]" /> Tailwind CSS v4</li>
              <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-[#059669]" /> Framer Motion</li>
            </ul>
          </div>
          <div>
            <div className="flex items-center gap-3 mb-6 text-[#059669]">
              <Server size={24} />
              <h3 className="text-xl font-bold">Backend</h3>
            </div>
            <ul className="space-y-4 text-[#4A5568] font-medium">
              <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-[#059669]" /> Node.js & Express</li>
              <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-[#059669]" /> Firebase SDK</li>
              <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-[#059669]" /> RESTful APIs</li>
            </ul>
          </div>
          <div>
            <div className="flex items-center gap-3 mb-6 text-[#059669]">
              <Database size={24} />
              <h3 className="text-xl font-bold">Database</h3>
            </div>
            <ul className="space-y-4 text-[#4A5568] font-medium">
              <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-[#059669]" /> Cloud Firestore</li>
              <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-[#059669]" /> Firebase Auth</li>
              <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-[#059669]" /> Real-time Sync</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Vision Section */}
      <div className="max-w-7xl mx-auto px-6 mb-24">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="bg-[#F0FFF4] rounded-[32px] p-12 border border-[#C6F6D5] text-center"
        >
          <h2 className="text-[28px] font-bold mb-6 text-[#1A202C]">Our Vision for Online Education</h2>
          <p className="text-[#4A5568] max-w-3xl mx-auto mb-12 leading-relaxed font-medium">
            Xamplore represents a shift in online assessment. We believe technology should enhance education, not compromise it.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-left">
            <div className="bg-white p-8 rounded-[24px] border border-[#C6F6D5]">
              <h4 className="text-xl font-bold mb-6 text-[#1A202C]">For Students</h4>
              <ul className="space-y-4">
                <li className="flex items-center gap-3 text-[#4A5568]">
                  <Star className="text-yellow-400" size={20} />
                  <span>Fair assessment of knowledge</span>
                </li>
                <li className="flex items-center gap-3 text-[#4A5568]">
                  <Star className="text-yellow-400" size={20} />
                  <span>Flexibility for remote exams</span>
                </li>
                <li className="flex items-center gap-3 text-[#4A5568]">
                  <Star className="text-yellow-400" size={20} />
                  <span>Immediate feedback</span>
                </li>
              </ul>
            </div>
            <div className="bg-white p-8 rounded-[24px] border border-[#C6F6D5]">
              <h4 className="text-xl font-bold mb-6 text-[#1A202C]">For Institutions</h4>
              <ul className="space-y-4">
                <li className="flex items-center gap-3 text-[#4A5568]">
                  <Building2 className="text-[#38B2AC]" size={20} />
                  <span>Reduced administrative work</span>
                </li>
                <li className="flex items-center gap-3 text-[#4A5568]">
                  <BarChart3 className="text-[#38B2AC]" size={20} />
                  <span>Comprehensive analytics</span>
                </li>
                <li className="flex items-center gap-3 text-[#4A5568]">
                  <ShieldCheck className="text-[#38B2AC]" size={20} />
                  <span>Maintained academic standards</span>
                </li>
              </ul>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Footer Info */}
      <footer className="py-12 border-t border-[#E2E8F0] text-center space-y-4">
        <p className="text-sm font-medium text-[#718096]">Xamplore - Strict Timing Exam Platform</p>
        <p className="text-xs text-[#A0AEC0]">Version 5.0 • Developed for SRCAS</p>
        <div className="flex items-center justify-center gap-8 pt-4">
          <div className="flex items-center gap-2 text-[#718096] text-xs font-medium">
            <Globe size={14} />
            <span>Modern Web Technologies</span>
          </div>
          <div className="flex items-center gap-2 text-[#718096] text-xs font-medium">
            <Lock size={14} />
            <span>100% Secure</span>
          </div>
          <div className="flex items-center gap-2 text-[#718096] text-xs font-medium">
            <Zap size={14} />
            <span>Trusted Platform</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
