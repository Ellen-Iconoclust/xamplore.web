import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { signInWithGoogle } from '../firebase';
import { Shield, AlertCircle, Loader2, LogIn } from 'lucide-react';

export default function Login() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleLogin = async () => {
    setLoading(true);
    setError(null);
    try {
      const user = await signInWithGoogle();
      if (user) {
        navigate('/dashboard');
      }
    } catch (err: any) {
      console.error('Login error:', err);
      let msg = 'Failed to sign in. Please try again.';
      if (err.code === 'auth/popup-blocked') {
        msg = 'The login popup was blocked by your browser. Please allow popups for this site.';
      } else if (err.code === 'auth/unauthorized-domain') {
        msg = 'This domain is not authorized for login. Please add it to the Authorized Domains in Firebase Console.';
      }
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-6 py-12 bg-gray-50">
      <div className="max-w-md w-full">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-2xl p-8 md:p-10 shadow-2xl border border-gray-100 text-center"
        >
          <div className="flex justify-center mb-8">
            <div className="bg-emerald-100 p-4 rounded-full">
              <LogIn className="text-emerald-600 w-12 h-12" />
            </div>
          </div>
          
          <h1 className="text-3xl font-extrabold text-gray-800 mb-2 brand">Student Login</h1>
          <p className="text-gray-500 text-sm mb-8">Access your exams and learning resources securely.</p>
          
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3 text-red-600 text-sm text-left">
              <AlertCircle size={20} className="shrink-0" />
              <p>{error}</p>
            </div>
          )}
          
          <button 
            onClick={handleLogin}
            disabled={loading}
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white flex items-center justify-center gap-3 py-4 rounded-xl font-bold shadow-lg transition duration-300"
          >
            {loading ? (
              <Loader2 className="animate-spin" size={24} />
            ) : (
              <>
                <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-6 h-6" />
                <span>Continue with Google</span>
              </>
            )}
          </button>
          
          <div className="mt-10 pt-8 border-t border-gray-100">
            <div className="flex items-center justify-center gap-2 text-emerald-600 font-bold text-xs uppercase tracking-widest">
              <Shield size={16} />
              <span>Secure Authentication</span>
            </div>
            <p className="text-[10px] text-gray-400 mt-4 leading-relaxed">
              By logging in, you agree to follow the exam rules and regulations. Any attempt to bypass security measures will be logged and reported.
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
