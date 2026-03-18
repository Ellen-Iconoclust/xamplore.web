import React from 'react';
import { Target, Shield, Clock, BarChart, CheckCircle, GraduationCap, Code, Users, Building, Star, Quote, Sparkles } from 'lucide-react';
import { motion } from 'motion/react';

export default function About() {
  return (
    <div className="flex flex-col py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Hero Section */}
        <div className="text-center mb-20">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-5xl font-extrabold brand text-emerald-600 mb-4"
          >
            About Xamplore
          </motion.h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            A secure, fair, and efficient online examination platform built for the digital age of education.
          </p>
        </div>

        {/* Mission & Vision */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-24">
          <div className="bg-emerald-50 p-10 rounded-3xl border border-emerald-100">
            <div className="bg-white w-12 h-12 rounded-xl flex items-center justify-center mb-6 shadow-sm">
              <Target className="text-emerald-600 w-6 h-6" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Our Mission</h2>
            <p className="text-gray-700 leading-relaxed">
              To provide a robust and secure examination environment that maintains academic integrity while offering flexibility for remote learning. We believe that every student deserves a fair chance to demonstrate their knowledge without the interference of academic dishonesty.
            </p>
          </div>
          
          <div className="bg-blue-50 p-10 rounded-3xl border border-blue-100">
            <div className="bg-white w-12 h-12 rounded-xl flex items-center justify-center mb-6 shadow-sm">
              <Star className="text-blue-600 w-6 h-6" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Our Vision</h2>
            <p className="text-gray-700 leading-relaxed">
              To become the standard for online assessments in higher education, where technology enhances the credibility of examinations rather than compromising it. We envision a future where digital testing is as trusted as traditional in-person proctoring.
            </p>
          </div>
        </div>

        {/* Core Values */}
        <div className="mb-24">
          <h2 className="text-3xl font-bold text-center text-gray-800 mb-16">Our Core Values</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { title: 'Integrity', desc: 'Upholding the highest standards of academic honesty.', icon: Shield },
              { title: 'Innovation', desc: 'Using cutting-edge tech to solve exam challenges.', icon: Sparkles },
              { title: 'Accessibility', desc: 'Making exams accessible from anywhere, anytime.', icon: Clock },
              { title: 'Fairness', desc: 'Ensuring a level playing field for all students.', icon: CheckCircle }
            ].map((value, i) => (
              <div key={i} className="text-center p-8 bg-white rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-shadow">
                <div className="bg-emerald-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                  <value.icon className="text-emerald-600 w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-3">{value.title}</h3>
                <p className="text-gray-600 text-sm">{value.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* The Mascot Section */}
        <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-3xl p-10 md:p-16 text-white mb-24">
          <div className="flex flex-col md:flex-row items-center gap-12">
            <div className="md:w-1/3">
              <img 
                src="https://xamplore1.vercel.app/xavi-intro.png" 
                alt="Xavi the Fox" 
                className="w-64 h-auto mx-auto drop-shadow-2xl"
                referrerPolicy="no-referrer"
              />
            </div>
            <div className="md:w-2/3">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 rounded-full text-sm font-bold mb-6">
                <Sparkles size={16} />
                <span>Meet Xavi the Fox</span>
              </div>
              <h2 className="text-4xl font-bold mb-6">Your Exam Companion</h2>
              <p className="text-lg mb-8 opacity-90 leading-relaxed">
                Xavi was designed to be more than just a mascot. He represents the "cleverness" of our platform—always watchful, always fair. He guides students through the exam process, reminding them of rules and helping them manage their time effectively.
              </p>
              <div className="bg-white/10 p-6 rounded-2xl border border-white/20 italic">
                <Quote className="inline w-6 h-6 mr-2 opacity-50" />
                "Integrity is doing the right thing, even when no one is watching. I'm here to make sure everyone plays by the rules so your hard work truly shines!"
              </div>
            </div>
          </div>
        </div>

        {/* Development Team / Credits */}
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-800 mb-12">Built for SRCAS</h2>
          <div className="flex flex-wrap justify-center gap-12">
            <div className="flex flex-col items-center">
              <div className="bg-gray-100 w-20 h-20 rounded-full flex items-center justify-center mb-4">
                <Building className="text-gray-600 w-10 h-10" />
              </div>
              <h4 className="font-bold text-gray-800">SRCAS</h4>
              <p className="text-sm text-gray-500">Institution</p>
            </div>
            <div className="flex flex-col items-center">
              <div className="bg-gray-100 w-20 h-20 rounded-full flex items-center justify-center mb-4">
                <Code className="text-gray-600 w-10 h-10" />
              </div>
              <h4 className="font-bold text-gray-800">Xamplore Dev Team</h4>
              <p className="text-sm text-gray-500">Development</p>
            </div>
            <div className="flex flex-col items-center">
              <div className="bg-gray-100 w-20 h-20 rounded-full flex items-center justify-center mb-4">
                <Users className="text-gray-600 w-10 h-10" />
              </div>
              <h4 className="font-bold text-gray-800">Student Community</h4>
              <p className="text-sm text-gray-500">Feedback & Testing</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
