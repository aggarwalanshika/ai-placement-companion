import { Link } from 'react-router-dom';
import { ArrowRight, CheckCircle2, Brain, Zap, Target, Star } from 'lucide-react';

export default function LandingPage() {
  const features = [
    {
      title: 'ATS Resume Scorer',
      description: 'Upload your resume and immediately retrieve your ATS compatibility score alongside missing core keyword recommendations.',
      icon: Target,
    },
    {
      title: 'Mock Interview Simulator',
      description: 'Experience adaptive HR and Technical mock interviews that grade confidence, communication skills, and project descriptions.',
      icon: Brain,
    },
    {
      title: 'DSA Track & Recommendations',
      description: 'Keep track of solved Leetcode/GFG questions and retrieve daily tailored problem recommendations based on your target company.',
      icon: Zap,
    },
  ];

  return (
    <div className="min-h-screen bg-[#0b0f19] text-slate-100 flex flex-col relative select-none font-sans overflow-x-hidden">
      {/* Background Decorative Blur blobs */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <header className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between border-b border-slate-900">
        <span className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
          🎓 AI Placement Companion
        </span>
        <div className="flex items-center gap-4">
          <Link to="/login" className="text-sm font-semibold text-slate-300 hover:text-white transition-colors">
            Sign In
          </Link>
          <Link
            to="/signup"
            className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-sm font-semibold rounded-xl text-white shadow-lg shadow-blue-500/20 transition-all"
          >
            Get Started <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16 text-center space-y-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-950/60 border border-blue-800/80 text-blue-400 text-xs font-semibold tracking-wide w-fit">
          <Star className="w-3.5 h-3.5 fill-blue-400" />
          <span>The Ultimate Student Interview Sandbox</span>
        </div>
        
        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-white max-w-4xl mx-auto leading-none">
          Nail Your Placements With <br />
          <span className="text-blue-500 bg-gradient-to-r from-blue-400 to-indigo-500 bg-clip-text text-transparent">AI Mentorship</span>
        </h1>
        
        <p className="text-slate-400 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed">
          Unlock personalized coding targets, analyze resume keywords for top MNCs, and refine your voice responses in real-time.
        </p>

        <div className="flex items-center justify-center gap-4 pt-4">
          <Link
            to="/signup"
            className="px-6 py-3.5 bg-blue-600 hover:bg-blue-700 text-base font-bold rounded-xl text-white shadow-xl shadow-blue-500/10 transition-all flex items-center gap-2"
          >
            Analyze Resume Free <ArrowRight className="w-5 h-5" />
          </Link>
          <Link
            to="/login"
            className="px-6 py-3.5 bg-slate-900 border border-slate-800 hover:bg-slate-800 text-base font-semibold rounded-xl text-slate-300 transition-all"
          >
            Try Interview Demo
          </Link>
        </div>
      </section>

      {/* Feature Section */}
      <section className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 border-t border-slate-900/60">
        <div className="text-center space-y-4 mb-16">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-white">
            Everything You Need to Land Your Dream Offer
          </h2>
          <p className="text-slate-400 text-base max-w-2xl mx-auto">
            Our multi-agent architecture runs checks across your GitHub commits, DSA logs, and speaking habits.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map((feat, idx) => (
            <div key={idx} className="p-6 bg-slate-900/40 border border-slate-800/80 rounded-2xl shadow-xl hover:border-slate-700/80 transition-all group">
              <div className="p-3 bg-blue-950 border border-blue-900 text-blue-400 rounded-xl w-fit group-hover:scale-110 transition-transform">
                <feat.icon className="w-6 h-6" />
              </div>
              <h3 className="mt-5 text-xl font-bold text-white">{feat.title}</h3>
              <p className="mt-3 text-sm text-slate-400 leading-relaxed">{feat.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing Section */}
      <section className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 border-t border-slate-900/60">
        <div className="text-center space-y-4 mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-white">Straightforward Pricing</h2>
          <p className="text-slate-400 text-base">Start free and upgrade as you prepare for specific MNC rounds.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-3xl mx-auto">
          {/* Free Tier */}
          <div className="p-8 bg-slate-900/40 border border-slate-800 rounded-2xl flex flex-col justify-between">
            <div>
              <h3 className="text-lg font-bold text-slate-400">Basic Tier</h3>
              <div className="mt-4 flex items-baseline text-white">
                <span className="text-5xl font-extrabold tracking-tight">$0</span>
                <span className="ml-1 text-xl text-slate-500">/mo</span>
              </div>
              <ul className="mt-6 space-y-4 text-sm text-slate-400">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-500" /> 3 Resume ATS Checks
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-500" /> Basic DSA Streak Tracker
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-500" /> 1 AI Mock Interview Session
                </li>
              </ul>
            </div>
            <Link
              to="/signup"
              className="mt-8 block w-full text-center py-3 bg-slate-950 border border-slate-850 hover:bg-slate-900 font-semibold rounded-xl text-white transition-all"
            >
              Sign Up Free
            </Link>
          </div>

          {/* Premium Tier */}
          <div className="p-8 bg-blue-950/20 border border-blue-800 rounded-2xl flex flex-col justify-between relative">
            <span className="absolute top-0 right-6 -translate-y-1/2 px-3 py-1 bg-blue-600 text-xs font-bold text-white rounded-full uppercase tracking-wider">
              Popular
            </span>
            <div>
              <h3 className="text-lg font-bold text-blue-400">Placement Premium</h3>
              <div className="mt-4 flex items-baseline text-white">
                <span className="text-5xl font-extrabold tracking-tight">$15</span>
                <span className="ml-1 text-xl text-slate-500">/mo</span>
              </div>
              <ul className="mt-6 space-y-4 text-sm text-slate-450">
                <li className="flex items-center gap-2 text-slate-350">
                  <CheckCircle2 className="w-4 h-4 text-blue-500" /> Unlimited ATS Parsing
                </li>
                <li className="flex items-center gap-2 text-slate-350">
                  <CheckCircle2 className="w-4 h-4 text-blue-500" /> Live AI Chat with your Resume
                </li>
                <li className="flex items-center gap-2 text-slate-350">
                  <CheckCircle2 className="w-4 h-4 text-blue-500" /> Tailored company roadmap builders
                </li>
                <li className="flex items-center gap-2 text-slate-350">
                  <CheckCircle2 className="w-4 h-4 text-blue-500" /> Infinite HR & Tech voice simulations
                </li>
              </ul>
            </div>
            <Link
              to="/signup"
              className="mt-8 block w-full text-center py-3 bg-blue-600 hover:bg-blue-700 font-semibold rounded-xl text-white transition-all shadow-lg shadow-blue-500/20"
            >
              Unlock Premium Access
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-900 py-10 relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center sm:flex sm:justify-between text-xs text-slate-500">
        <p>© 2026 AI Placement Companion. All rights reserved.</p>
        <p className="mt-2 sm:mt-0 flex justify-center gap-4">
          <span className="hover:text-slate-400 cursor-pointer">Privacy Policy</span>
          <span className="hover:text-slate-400 cursor-pointer">Terms of Service</span>
        </p>
      </footer>
    </div>
  );
}
