import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Shield, Clock, BarChart, Target, CheckCircle, Sparkles, Quote, ShieldCheck, Code, Users, Building, Star, GraduationCap, Info, HelpCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function Home() {
  const [showWelcome, setShowWelcome] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setShowWelcome(true), 500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="flex flex-col">
      {/* Welcome Popup */}
      <AnimatePresence>
        {showWelcome && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white rounded-xl shadow-2xl max-w-2xl w-full overflow-hidden"
            >
              <div className="flex items-stretch min-h-64">
                {/* Text Content */}
                <div className="p-5 md:p-6 flex-1 flex flex-col justify-center">
                  <div className="flex items-center gap-2 mb-4">
                    <GraduationCap className="text-emerald-600 w-6 h-6" />
                    <h3 className="text-lg font-bold text-emerald-600 brand">Welcome to Xamplore!</h3>
                  </div>
                  
                  <div className="mb-4">
                    <p className="font-semibold text-gray-800 text-base mb-2">Hi! I'm <span className="text-emerald-600">Xavi the Fox</span></p>
                    <p className="text-sm text-gray-600 mb-2">Your exam controller for secure online examinations.</p>
                    <p className="text-sm text-gray-600">Head to <span className="font-semibold text-emerald-600">Test</span> section to begin!</p>
                  </div>
                  
                  <button 
                    onClick={() => setShowWelcome(false)} 
                    className="mt-4 bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-2 px-6 rounded-lg transition duration-300 text-sm w-fit"
                  >
                    Got it!
                  </button>
                  
                  <div className="text-xs text-gray-500 mt-5">
                    <Info className="inline w-3 h-3 mr-1" />
                    Platform Version: <span className="font-bold">Xam4.0</span>
                  </div>
                </div>
                
                {/* Mascot Image */}
                <div className="w-44 md:w-52 relative overflow-visible flex items-center justify-center">
                  <img 
                    src="https://xamplore1.vercel.app/xavi1-pop.png" 
                    alt="Xavi the Fox" 
                    className="h-full w-auto object-contain relative"
                    style={{ right: '-18px', filter: 'drop-shadow(-5px 0 12px rgba(0, 0, 0, 0.12))' }}
                    referrerPolicy="no-referrer"
                  />
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Hero Section */}
      <section className="py-12 md:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-4xl md:text-5xl font-extrabold brand text-emerald-600 mb-4"
            >
              Smarter Exams. Fairer Assessment.
            </motion.h1>
            <p className="text-xl md:text-2xl font-semibold text-gray-700 mb-6">Built for SRCAS Students</p>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto mb-8">
              Xamplore is a secure online examination platform with advanced anti-cheating measures and strict timing controls.
            </p>
            <Link 
              to="/dashboard" 
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 px-8 rounded-lg shadow-lg transition duration-300 inline-block"
            >
              Start Your Exam Journey
            </Link>
          </div>

          {/* Features Section */}
          <div className="mb-16">
            <h2 className="text-3xl font-bold text-center text-gray-800 mb-12">Why Choose Xamplore?</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200 hover:shadow-xl transition-shadow duration-300">
                <div className="flex items-center gap-3 mb-4">
                  <div className="bg-emerald-100 p-3 rounded-lg">
                    <Shield className="text-emerald-600 w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-800">Secure & Fair</h3>
                </div>
                <p className="text-gray-600">Advanced anti-cheating measures including tab switching detection and real-time monitoring ensure every exam is fair.</p>
              </div>
              
              <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200 hover:shadow-xl transition-shadow duration-300">
                <div className="flex items-center gap-3 mb-4">
                  <div className="bg-emerald-100 p-3 rounded-lg">
                    <Clock className="text-emerald-600 w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-800">Time Control</h3>
                </div>
                <p className="text-gray-600">Flexible exam windows with precise timing controls. Admin-controlled schedules for organized examination sessions.</p>
              </div>
              
              <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200 hover:shadow-xl transition-shadow duration-300">
                <div className="flex items-center gap-3 mb-4">
                  <div className="bg-emerald-100 p-3 rounded-lg">
                    <BarChart className="text-emerald-600 w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-800">Smart Analytics</h3>
                </div>
                <p className="text-gray-600">Comprehensive admin dashboard with real-time student tracking and detailed performance analytics.</p>
              </div>
            </div>
          </div>

          {/* Mission Section */}
          <div className="bg-gradient-to-r from-emerald-50 to-emerald-100 rounded-2xl p-8 md:p-12 mb-16">
            <div className="flex flex-col md:flex-row items-center">
              <div className="md:w-2/3 mb-8 md:mb-0 md:pr-12">
                <h2 className="text-3xl font-bold text-gray-800 mb-6">Our Mission & Vision</h2>
                <p className="text-gray-700 mb-4">
                  Xamplore was created to address online education challenges during the digital transformation era. We maintain academic integrity while providing flexibility for remote learning.
                </p>
                <p className="text-gray-700">
                  Our vision is to create a world where online examinations are as credible and secure as traditional in-person tests.
                </p>
              </div>
              <div className="md:w-1/3">
                <div className="bg-white p-6 rounded-xl shadow-lg">
                  <div className="flex items-center gap-3 mb-4">
                    <Target className="text-emerald-600 w-8 h-8" />
                    <h3 className="text-xl font-bold text-gray-800">Key Objectives</h3>
                  </div>
                  <ul className="space-y-3">
                    <li className="flex items-start gap-2">
                      <CheckCircle className="text-emerald-500 w-5 h-5 mt-0.5 flex-shrink-0" />
                      <span>Prevent academic dishonesty</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="text-emerald-500 w-5 h-5 mt-0.5 flex-shrink-0" />
                      <span>Provide equal opportunity</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="text-emerald-500 w-5 h-5 mt-0.5 flex-shrink-0" />
                      <span>Simplify exam administration</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Meet Xavi Section */}
          <div className="mb-16">
            <h2 className="text-3xl font-bold text-center text-gray-800 mb-12">Meet Your Exam Companion</h2>
            <div className="flex flex-col md:flex-row items-center gap-8">
              <div className="md:w-1/2">
                <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-200">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="bg-emerald-100 p-3 rounded-lg">
                      <Sparkles className="text-emerald-600 w-8 h-8" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-gray-800">Xavi the Fox</h3>
                      <p className="text-sm text-gray-600">Your Trusted Exam Guardian</p>
                    </div>
                  </div>
                  <p className="text-gray-700 mb-4">
                    Xavi isn't just a mascot—he's your personal guide through the Xamplore examination journey. With keen observation skills and a passion for fairness, Xavi ensures every exam is conducted with integrity.
                  </p>
                  <ul className="space-y-4 mb-6">
                    <li className="flex items-start gap-3">
                      <Shield className="text-emerald-500 w-5 h-5 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-medium text-gray-800">Security Sentinel</p>
                        <p className="text-sm text-gray-600">Monitors exam sessions for fairness</p>
                      </div>
                    </li>
                    <li className="flex items-start gap-3">
                      <Clock className="text-emerald-500 w-5 h-5 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-medium text-gray-800">Timekeeper</p>
                        <p className="text-sm text-gray-600">Helps you manage exam time effectively</p>
                      </div>
                    </li>
                    <li className="flex items-start gap-3">
                      <HelpCircle className="text-emerald-500 w-5 h-5 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-medium text-gray-800">Guidance Assistant</p>
                        <p className="text-sm text-gray-600">Appears throughout your exam journey</p>
                      </div>
                    </li>
                  </ul>
                  <div className="bg-emerald-50 p-4 rounded-lg border border-emerald-200">
                    <p className="text-sm text-emerald-700 italic">
                      <Quote className="inline w-4 h-4 mr-1" />
                      "A fair exam is a true test of knowledge. I'm here to make sure everyone gets an equal opportunity to shine!"
                    </p>
                    <p className="text-xs text-emerald-600 mt-2 text-right">- Xavi the Fox</p>
                  </div>
                </div>
              </div>
              
              <div className="md:w-1/2 relative flex justify-center items-center min-h-96">
                <div className="absolute w-80 h-80 md:w-96 md:h-96 rounded-full animate-gradient-pulse"></div>
                <div className="relative z-10">
                  <img 
                    src="https://xamplore1.vercel.app/xavi-intro.png" 
                    alt="Xavi the Fox - Your Exam Companion"
                    className="w-64 h-auto md:w-80 drop-shadow-2xl"
                    referrerPolicy="no-referrer"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Stats Section */}
          <div className="mb-16">
            <h2 className="text-3xl font-bold text-center text-gray-800 mb-12">Platform Highlights</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="text-center p-6 bg-white rounded-xl shadow border border-gray-200">
                <div className="text-3xl font-bold text-emerald-600 mb-2">3+</div>
                <p className="text-gray-600 font-medium">Exam Patterns</p>
              </div>
              <div className="text-center p-6 bg-white rounded-xl shadow border border-gray-200">
                <div className="text-3xl font-bold text-emerald-600 mb-2">100%</div>
                <p className="text-gray-600 font-medium">Secure Platform</p>
              </div>
              <div className="text-center p-6 bg-white rounded-xl shadow border border-gray-200">
                <div className="text-3xl font-bold text-emerald-600 mb-2">24/7</div>
                <p className="text-gray-600 font-medium">Availability</p>
              </div>
              <div className="text-center p-6 bg-white rounded-xl shadow border border-gray-200">
                <div className="text-3xl font-bold text-emerald-600 mb-2">0</div>
                <p className="text-gray-600 font-medium">Cheating Tolerance</p>
              </div>
            </div>
          </div>

          {/* CTA Section */}
          <div className="text-center bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-2xl p-10 text-white">
            <h2 className="text-3xl font-bold mb-4">Ready to Experience Secure Exams?</h2>
            <p className="text-lg mb-6 max-w-2xl mx-auto">Join SRCAS students who trust Xamplore for their online assessments.</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/dashboard" className="bg-white text-emerald-600 hover:bg-gray-100 font-bold py-3 px-8 rounded-lg shadow-lg transition duration-300">
                Start Your Exam
              </Link>
              <Link to="/about" className="bg-transparent border-2 border-white hover:bg-white/10 text-white font-bold py-3 px-8 rounded-lg transition duration-300">
                Learn More
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
