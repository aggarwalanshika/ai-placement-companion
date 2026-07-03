import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowRight,
  Target,
  Brain,
  MessageSquare,
  Award,
  Map,
  Play,
  Layers,
} from 'lucide-react';

export default function LandingPage() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 25 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] as const } },
  };

  const featureCards = [
    {
      title: 'AI Resume Analyzer',
      description: 'Instant ATS feedback, keyword gap matching, and action verb optimizations for top MNC profiles.',
      icon: Target,
      color: 'text-green-400',
    },
    {
      title: 'AI Interview Simulator',
      description: 'Adaptive speech-to-text panels mimicking real technical, HR, and project description grilling.',
      icon: Brain,
      color: 'text-indigo-400',
    },
    {
      title: 'Job Description Matcher',
      description: 'Compare your skills directly against company listings to spot missing requirements instantly.',
      icon: Layers,
      color: 'text-blue-400',
    },
    {
      title: 'AI Resume Chat',
      description: 'Converse directly with a RAG agent trained on your resume to practice custom interview queries.',
      icon: MessageSquare,
      color: 'text-purple-400',
    },
    {
      title: 'DSA Progress Tracker',
      description: 'Monitor daily targets, difficulty metrics, active streaks, and tailored question feeds.',
      icon: Award,
      color: 'text-orange-400',
    },
    {
      title: 'Personalized Roadmap',
      description: 'Dynamic syllabus maps guiding you from your current skill gap to day-1 interview readiness.',
      icon: Map,
      color: 'text-pink-400',
    },
  ];

  const steps = [
    { num: '01', title: 'Upload Resume', desc: 'Drag your PDF to extract project metrics.' },
    { num: '02', title: 'AI Analysis', desc: 'Locate missing keywords and get an ATS grade.' },
    { num: '03', title: 'Practice Interviews', desc: 'Simulate adaptive voice-based mock panels.' },
    { num: '04', title: 'Improve Skills', desc: 'Target weak topics using tailored daily feeds.' },
    { num: '05', title: 'Land Your Dream Job', desc: 'Approach real placement rounds with confidence.' },
  ];

  const stats = [
    { value: '95%', label: 'Resume Accuracy' },
    { value: '10,000+', label: 'Mock Questions Generated' },
    { value: '5,000+', label: 'Students Prepared' },
    { value: '50+', label: 'Supported Companies' },
  ];

  return (
    <div className="min-h-screen bg-[#070a13] text-slate-100 flex flex-col relative font-sans overflow-x-hidden">
      {/* Glow Blur Blobs */}
      <div className="absolute top-[-10%] left-[20%] w-[500px] h-[500px] bg-blue-600/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-[40%] right-[10%] w-[400px] h-[400px] bg-indigo-600/5 rounded-full blur-[100px] pointer-events-none" />

      {/* Header */}
      <header className="relative z-20 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between border-b border-slate-900/60 bg-[#070a13]/80 backdrop-blur-md sticky top-0">
        <span className="text-base font-bold tracking-tight text-white flex items-center gap-2">
          🎓 AI Placement Companion
        </span>
        <div className="flex items-center gap-4">
          <Link to="/login" className="text-xs font-semibold text-slate-400 hover:text-white transition-colors">
            Sign In
          </Link>
          <Link
            to="/signup"
            className="flex items-center gap-1 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-xs font-bold rounded-lg text-white shadow-md shadow-blue-500/10 transition-all"
          >
            Get Started
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <motion.section
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="relative z-10 w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-8 text-center space-y-6"
      >
        <motion.div
          variants={itemVariants}
          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-950/40 border border-blue-900/60 text-blue-400 text-[10px] font-semibold tracking-wider uppercase mx-auto"
        >
          <span>🚀 Smart Preparation Sandbox</span>
        </motion.div>

        <motion.h1
          variants={itemVariants}
          className="text-4xl md:text-6xl font-extrabold tracking-tight text-white max-w-3xl mx-auto leading-[1.1] font-sans"
        >
          Crack Your Dream <br />
          <span className="text-blue-500 bg-gradient-to-r from-blue-400 via-indigo-400 to-indigo-500 bg-clip-text text-transparent">
            Placement with AI
          </span>
        </motion.h1>

        <motion.p
          variants={itemVariants}
          className="text-slate-400 text-sm md:text-base max-w-xl mx-auto leading-relaxed"
        >
          Upload your resume, practice AI interviews, analyze job descriptions, and prepare smarter—not harder.
        </motion.p>

        <motion.div variants={itemVariants} className="flex items-center justify-center gap-3 pt-2">
          <Link
            to="/signup"
            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-xs font-bold rounded-lg text-white shadow-lg shadow-blue-500/10 transition-all flex items-center gap-1.5"
          >
            Analyze Resume <ArrowRight className="w-3.5 h-3.5" />
          </Link>
          <Link
            to="/login"
            className="px-5 py-2.5 bg-slate-900 border border-slate-800/80 hover:bg-slate-800 text-xs font-semibold rounded-lg text-slate-350 transition-all flex items-center gap-1"
          >
            Watch Demo <Play className="w-3 h-3 fill-slate-350" />
          </Link>
        </motion.div>
      </motion.section>

      {/* Product Preview Card */}
      <section className="relative z-10 w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="relative rounded-2xl border border-slate-800 bg-[#0d1222]/80 backdrop-blur-md shadow-2xl overflow-hidden p-1"
        >
          {/* Top Bar controls */}
          <div className="flex items-center justify-between border-b border-slate-900/60 px-4 py-3 bg-[#0a0e1c]/90">
            <div className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-red-500/40" />
              <span className="h-2.5 w-2.5 rounded-full bg-yellow-500/40" />
              <span className="h-2.5 w-2.5 rounded-full bg-green-500/40" />
            </div>
            <div className="text-[10px] text-slate-500 font-mono bg-slate-950/80 border border-slate-900/60 px-6 py-0.5 rounded-lg">
              ai-placement-companion.edu/dashboard
            </div>
            <div className="w-8" />
          </div>

          <div className="flex min-h-[380px] bg-[#0b0f19]/30">
            {/* Sidebar Mockup */}
            <aside className="w-48 border-r border-slate-900/60 p-3 space-y-4 flex-shrink-0 bg-[#080c16]/50">
              <div className="space-y-1">
                {['Dashboard', 'Resume Analyzer', 'DSA Tracker', 'Interview Hub'].map((menu, i) => (
                  <div
                    key={menu}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg text-[11px] font-semibold ${
                      i === 0 ? 'bg-blue-600/10 text-blue-400 border border-blue-900/30' : 'text-slate-500'
                    }`}
                  >
                    <span className={`h-1.5 w-1.5 rounded-full ${i === 0 ? 'bg-blue-400' : 'bg-transparent'}`} />
                    {menu}
                  </div>
                ))}
              </div>
            </aside>

            {/* Main Area Mockup */}
            <main className="flex-1 p-5 space-y-5">
              {/* Profile Bar */}
              <div className="flex justify-between items-center pb-2 border-b border-slate-900/40">
                <div>
                  <h4 className="text-xs font-bold text-white">Student Dashboard Preview</h4>
                  <span className="text-[9px] text-slate-500">Google SDE Ready Profile</span>
                </div>
                <div className="h-6 w-6 rounded-full bg-blue-600/20 border border-blue-900 flex items-center justify-center text-[9px] text-blue-400 font-bold">
                  JD
                </div>
              </div>

              {/* Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Score Card */}
                <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-xl space-y-1.5">
                  <span className="text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Resume ATS Grade</span>
                  <div className="text-xl font-extrabold text-green-400">84%</div>
                  <div className="h-1 w-full bg-slate-950 rounded-full overflow-hidden">
                    <div className="h-full bg-green-500 w-[84%]" />
                  </div>
                </div>

                {/* Interview Card */}
                <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-xl space-y-1.5">
                  <span className="text-[9px] font-semibold text-slate-500 uppercase tracking-wider">AI Interview Score</span>
                  <div className="text-xl font-extrabold text-indigo-400">7.8 / 10</div>
                  <span className="text-[8px] text-slate-500 block">Feedback: Fluid speech structure</span>
                </div>

                {/* DSA Progress */}
                <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-xl space-y-1.5">
                  <span className="text-[9px] font-semibold text-slate-500 uppercase tracking-wider">DSA solved</span>
                  <div className="text-xl font-extrabold text-blue-400">142 problems</div>
                  <div className="h-1 w-full bg-slate-950 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-500 w-[62%]" />
                  </div>
                </div>
              </div>

              {/* Bottom Insights split */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-slate-900/30 border border-slate-900/60 rounded-xl space-y-2">
                  <span className="text-[9px] font-bold text-slate-300 uppercase block">Missing Skills Gap</span>
                  <div className="flex flex-wrap gap-1.5">
                    {['Redis', 'Docker', 'System Design'].map((s) => (
                      <span key={s} className="text-[8px] font-bold px-2 py-0.5 rounded bg-red-950/40 border border-red-900/40 text-red-400">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="p-4 bg-slate-900/30 border border-slate-900/60 rounded-xl space-y-2">
                  <span className="text-[9px] font-bold text-slate-300 uppercase block">AI Recommended Target</span>
                  <span className="text-[10px] text-slate-400 block font-medium">
                    🔍 Optimize project action verbs inside your experience section.
                  </span>
                </div>
              </div>
            </main>
          </div>
        </motion.div>
      </section>

      {/* Features Grid Section */}
      <section className="relative z-10 w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 border-t border-slate-900/60">
        <div className="text-center space-y-3 mb-12">
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-white">
            Tailored Placement Sandbox Features
          </h2>
          <p className="text-slate-400 text-xs md:text-sm max-w-xl mx-auto">
            Everything structured in a clean, unified dashboard built specifically to get you offer-ready.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {featureCards.map((feat, idx) => (
            <motion.div
              key={idx}
              whileHover={{ y: -5, borderColor: '#3b82f6' }}
              className="p-5 bg-slate-900/30 border border-slate-800/80 rounded-2xl shadow-lg transition-all"
            >
              <div className={`p-2.5 bg-slate-950 border border-slate-850 rounded-xl w-fit ${feat.color}`}>
                <feat.icon className="w-5 h-5" />
              </div>
              <h3 className="mt-4 text-sm font-bold text-white">{feat.title}</h3>
              <p className="mt-2 text-xs text-slate-450 leading-relaxed">{feat.description}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* How It Works Section */}
      <section className="relative z-10 w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 border-t border-slate-900/60">
        <div className="text-center space-y-3 mb-16">
          <h2 className="text-2xl md:text-3xl font-bold text-white">How It Works</h2>
          <p className="text-slate-450 text-xs">Our platform guides you through a progressive timeline directly to your goal.</p>
        </div>

        {/* Animated Horizontal Timeline */}
        <div className="relative grid grid-cols-1 md:grid-cols-5 gap-6 md:gap-4">
          {/* Connector Line for Desktop */}
          <div className="hidden md:block absolute top-[22px] left-[10%] right-[10%] h-[1px] bg-slate-800 z-0" />
          
          {steps.map((step, idx) => (
            <div key={idx} className="relative z-10 text-center space-y-3 bg-[#070a13] p-4 rounded-xl border border-slate-900 md:border-transparent">
              <div className="w-10 h-10 rounded-full bg-slate-950 border border-slate-800/80 flex items-center justify-center text-xs font-bold text-blue-400 mx-auto shadow-md">
                {step.num}
              </div>
              <div>
                <h4 className="text-xs font-bold text-white block">{step.title}</h4>
                <p className="text-[10px] text-slate-500 mt-1 leading-relaxed max-w-[150px] mx-auto">{step.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Social Proof (Statistics) */}
      <section className="relative z-10 w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 border-t border-slate-900/60 bg-[#080d1a]/20">
        <div className="text-center space-y-2 mb-12">
          <h2 className="text-2xl md:text-3xl font-bold text-white">Why Students Succeed With Us</h2>
          <p className="text-slate-400 text-xs">Proven figures backing placement track records.</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
          {stats.map((st, idx) => (
            <div key={idx} className="p-5 text-center bg-slate-900/20 border border-slate-900 rounded-xl space-y-1">
              <span className="text-2xl md:text-3xl font-extrabold text-blue-500 block">{st.value}</span>
              <span className="text-[10px] font-semibold text-slate-400 block tracking-wide uppercase">{st.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-900/60 py-8 relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center sm:flex sm:justify-between text-[11px] text-slate-550">
        <p>© 2026 AI Placement Companion. All rights reserved.</p>
        <p className="mt-2 sm:mt-0 flex justify-center gap-4">
          <span className="hover:text-slate-400 cursor-pointer">Privacy Policy</span>
          <span className="hover:text-slate-400 cursor-pointer">Terms of Service</span>
        </p>
      </footer>
    </div>
  );
}
