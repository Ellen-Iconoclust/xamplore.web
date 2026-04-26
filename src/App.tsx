import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Link, useNavigate } from 'react-router-dom';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { auth, db } from './firebase';
import { User } from './types';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Exam from './pages/Exam';
import Games from './pages/Games';
import Resources from './pages/Resources';
import Admin from './pages/Admin';
import About from './pages/About';
import Profile from './pages/Profile';
import { Loader2 } from 'lucide-react';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Disable right-click context menu
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
    };

    // Disable keyboard shortcuts for developer tools
    const handleKeyDown = (e: KeyboardEvent) => {
      const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
      const cmdOrCtrl = isMac ? e.metaKey : e.ctrlKey;
      const optionOrAlt = e.altKey;
      const shift = e.shiftKey;

      // Block F12
      if (e.key === 'F12' || e.keyCode === 123) {
        e.preventDefault();
        return;
      }

      // Block Ctrl+Shift+I or Cmd+Option+I (Inspect)
      if (cmdOrCtrl && (isMac ? optionOrAlt : shift) && (e.key === 'I' || e.key === 'i' || e.keyCode === 73)) {
        e.preventDefault();
        return;
      }

      // Block Ctrl+Shift+J or Cmd+Option+J (Console)
      if (cmdOrCtrl && (isMac ? optionOrAlt : shift) && (e.key === 'J' || e.key === 'j' || e.keyCode === 74)) {
        e.preventDefault();
        return;
      }

      // Block Ctrl+Shift+C or Cmd+Option+C (Inpsect tool)
      if (cmdOrCtrl && (isMac ? optionOrAlt : shift) && (e.key === 'C' || e.key === 'c' || e.keyCode === 67)) {
        e.preventDefault();
        return;
      }

      // Block Ctrl+U or Cmd+U (View Source)
      if (cmdOrCtrl && (e.key === 'U' || e.key === 'u' || e.keyCode === 85)) {
        e.preventDefault();
        return;
      }

      // Block Ctrl+S or Cmd+S (Save Page)
      if (cmdOrCtrl && (e.key === 'S' || e.key === 's' || e.keyCode === 83)) {
        e.preventDefault();
        return;
      }
    };

    window.addEventListener('contextmenu', handleContextMenu);
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('contextmenu', handleContextMenu);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  useEffect(() => {
    if (!auth) return;
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
        if (userDoc.exists()) {
          const userData = userDoc.data() as User;
          // Ensure the hardcoded admin email always has the admin role in the app state
          if (firebaseUser.email === 'elleniconoclust@gmail.com' && userData.role !== 'admin') {
            userData.role = 'admin';
            // Also update the role in Firestore for future sessions
            updateDoc(doc(db, 'users', firebaseUser.uid), { role: 'admin' })
              .catch(err => console.error('Failed to update admin role in Firestore:', err));
          }
          setUser(userData);
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-white">
        <Loader2 className="w-12 h-12 animate-spin text-emerald-600" />
      </div>
    );
  }

  return (
    <Router>
      <div className="min-h-screen flex flex-col">
        <Navbar user={user} />
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={!user ? <Login /> : <Navigate to="/dashboard" />} />
            <Route path="/dashboard" element={user ? <Dashboard user={user} /> : <Navigate to="/login" />} />
            <Route path="/exam/:examId" element={user ? <Exam user={user} /> : <Navigate to="/login" />} />
            <Route path="/games" element={<Games user={user} />} />
            <Route path="/profile" element={user ? <Profile user={user} /> : <Navigate to="/login" />} />
            <Route path="/resources" element={<Resources user={user} />} />
            <Route path="/about" element={<About />} />
            <Route path="/admin" element={user?.role === 'admin' ? <Admin user={user} /> : <Navigate to="/dashboard" />} />
          </Routes>
        </main>
        <footer className="mt-auto border-t bg-gray-50 py-6">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row justify-between items-center">
              {/* Copyright Info */}
              <div className="mb-4 md:mb-0">
                <p className="text-sm text-gray-600 flex items-center gap-1">
                  <span className="flex items-center gap-1">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-copyright"><circle cx="12" cy="12" r="10"/><path d="M14.83 14.83a4 4 0 1 1 0-5.66"/></svg>
                  </span>
                  <span>2026</span> Xamplore - All Rights Reserved
                </p>
              </div>
              
              {/* Author Link */}
              <div className="flex items-center gap-2">
                <p className="text-sm text-gray-600">Made by</p>
                <a 
                  href="https://ellen-dev.vercel.app" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-emerald-600 hover:text-emerald-700 font-semibold text-sm flex items-center gap-1 hover:underline transition duration-300"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-user"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                  Ellen Iconoclust
                </a>
              </div>
              
              {/* Version Info */}
              <div className="mt-4 md:mt-0">
                <p className="text-xs text-gray-500 flex items-center gap-1">
                  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-code"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>
                  Platform Version: Xam5.0
                </p>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </Router>
  );
}
