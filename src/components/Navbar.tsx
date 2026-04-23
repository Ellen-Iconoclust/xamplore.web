import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { GraduationCap, Menu, X, LogOut } from 'lucide-react';
import { User } from '../types';
import { logout } from '../firebase';

interface NavbarProps {
  user: User | null;
}

export default function Navbar({ user }: NavbarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  if (location.pathname.startsWith('/exam/')) {
    return null;
  }

  const handleLogout = async () => {
    await logout();
  };

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Test', path: '/dashboard' },
    { name: 'Courses', path: '/resources' },
    { name: 'Hangman', path: '/games' },
    { name: 'Profile', path: '/profile' },
    { name: 'Admin', path: '/admin', adminOnly: true },
    { name: 'About', path: '/about' },
  ];

  const filteredLinks = navLinks.filter(link => !link.adminOnly || user?.role === 'admin');

  return (
    <nav className="border-b shadow-sm sticky top-0 bg-white z-40">
      <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
        <Link to="/" className="flex items-center gap-2 brand text-2xl font-extrabold text-emerald-600">
          <GraduationCap className="w-8 h-8" /> Xamplore
          <span className="text-xs font-normal bg-emerald-100 text-emerald-700 px-2 py-1 rounded">v4.0</span>
        </Link>

        {/* Desktop Menu */}
        <div className="hidden md:flex gap-8 font-semibold">
          {filteredLinks.map((link) => (
            <Link 
              key={link.path} 
              to={link.path}
              className={`hover:text-emerald-600 transition-colors ${location.pathname === link.path ? 'text-emerald-600' : 'text-gray-700'}`}
            >
              {link.name}
            </Link>
          ))}
          {user && (
            <button 
              onClick={handleLogout}
              className="text-red-600 hover:text-red-700 flex items-center gap-1"
              title="Logout"
            >
              <LogOut size={18} />
            </button>
          )}
        </div>

        {/* Mobile Menu Toggle */}
        <button className="md:hidden text-gray-700" onClick={() => setIsOpen(!isOpen)}>
          {isOpen ? <X /> : <Menu />}
        </button>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden px-6 pb-4 space-y-3 font-semibold bg-white border-t">
          {filteredLinks.map((link) => (
            <Link 
              key={link.path} 
              to={link.path}
              onClick={() => setIsOpen(false)}
              className={`block py-2 transition-colors ${location.pathname === link.path ? 'text-emerald-600' : 'text-gray-700 hover:text-emerald-600'}`}
            >
              {link.name}
            </Link>
          ))}
          {user && (
            <button 
              onClick={handleLogout}
              className="w-full text-left py-2 text-red-600 flex items-center gap-2"
            >
              <LogOut size={18} /> Logout
            </button>
          )}
        </div>
      )}
    </nav>
  );
}
