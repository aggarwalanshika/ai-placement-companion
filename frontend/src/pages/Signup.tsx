import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { CheckCircle2, AlertTriangle, ArrowRight, Loader, Sparkles } from 'lucide-react';
import { api } from '../services/api.ts';
import { useAuthStore } from '../store/authStore.ts';

export default function Signup() {
  const navigate = useNavigate();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [guestLoading, setGuestLoading] = useState(false);
  const [guestStep, setGuestStep] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password.length < 8) {
      setError('Password must be at least 8 characters long');
      return;
    }

    setLoading(true);

    try {
      await api.post('/auth/signup', { fullName, email, password });
      setSuccess(true);
      setTimeout(() => {
        navigate('/login');
      }, 1500);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Signup failed. Please try again.');
      setLoading(false);
    }
  };

  const handleGuestLogin = () => {
    setGuestLoading(true);
    setGuestStep('Setting up sandbox session...');
    
    setTimeout(() => {
      setGuestStep('Securing guest token...');
      setTimeout(() => {
        setGuestStep('Workspace ready!');
        setTimeout(() => {
          useAuthStore.getState().setAuth(
            { id: 'guest-123', email: 'guest@recruiter.com', fullName: 'Guest Recruiter' },
            'mock-guest-token'
          );
          navigate('/dashboard');
        }, 500);
      }, 800);
    }, 800);
  };

  if (guestLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6">
        <div className="space-y-4 text-center max-w-sm">
          <Loader className="animate-spin h-8 w-8 text-blue-600 mx-auto" />
          <div>
            <span className="text-xs font-bold text-slate-800 uppercase tracking-wider block">{guestStep}</span>
            <span className="text-[10px] text-slate-500 block mt-1">Initializing premium guest dashboard profile.</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative select-none">
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <h2 className="text-center text-3xl font-extrabold text-slate-900 tracking-tight">
          Create your account
        </h2>
        <p className="mt-2 text-center text-sm text-slate-550">
          Or{' '}
          <Link to="/login" className="font-semibold text-blue-600 hover:text-blue-500 transition-colors">
            sign in to your existing account
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="bg-white border border-slate-200 py-8 px-4 shadow-2xl rounded-2xl sm:px-10">
          {success ? (
            <div className="rounded-xl bg-green-50 border border-green-200 p-6 text-center space-y-3">
              <CheckCircle2 className="mx-auto h-12 w-12 text-green-500" />
              <h3 className="text-sm font-semibold text-slate-900">Registration Successful!</h3>
              <p className="text-xs text-green-600">
                Redirecting you to the sign in screen...
              </p>
            </div>
          ) : (
            <form className="space-y-6" onSubmit={handleSubmit}>
              {error && (
                <div className="rounded-xl bg-red-50 border border-red-200 p-4 flex gap-3 text-xs text-red-600">
                  <AlertTriangle className="h-5 w-5 text-red-500 flex-shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <div>
                <label htmlFor="name" className="block text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Full Name
                </label>
                <div className="mt-1">
                  <input
                    id="name"
                    name="name"
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="appearance-none block w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm"
                    placeholder="Enter your name"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="email" className="block text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Email Address
                </label>
                <div className="mt-1">
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="appearance-none block w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm"
                    placeholder="name@university.edu"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="password" className="block text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Password
                </label>
                <div className="mt-1">
                  <input
                    id="password"
                    name="password"
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="appearance-none block w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex justify-center items-center gap-2 py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <Loader className="animate-spin h-5 w-5 text-white" />
                  ) : (
                    <>
                      Sign Up <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>

              <div className="pt-2 border-t border-slate-100 mt-6">
                <button
                  type="button"
                  onClick={handleGuestLogin}
                  className="w-full flex justify-center items-center gap-1.5 py-2.5 px-4 border border-slate-200 rounded-xl shadow-2xs text-xs font-bold text-slate-700 bg-white hover:bg-slate-50 focus:outline-none transition-all"
                >
                  <Sparkles className="w-3.5 h-3.5 text-blue-500 animate-pulse" /> Continue as Guest (Demo Access)
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
