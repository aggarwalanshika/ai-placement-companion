import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowRight,
  Target,
  Sparkles,
  MessageSquare,
  History,
  Download,
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
      color: 'text-green-600 bg-green-50 border-green-200',
    },
    {
      title: 'AI Resume Rewriter',
      description: 'Instantly refactor weak, passive resume bullet points using active SDE action verbs and metrics.',
      icon: Sparkles,
      color: 'text-indigo-600 bg-indigo-50 border-indigo-200',
    },
    {
      title: 'Job Description Matcher',
      description: 'Compare your skills directly against company listings to spot missing requirements instantly.',
      icon: Layers,
      color: 'text-blue-650 bg-blue-50 border-blue-200',
    },
    {
      title: 'AI Resume Chat',
      description: 'Converse directly with a RAG agent trained on your resume to practice custom technical queries.',
      icon: MessageSquare,
      color: 'text-purple-600 bg-purple-50 border-purple-200',
    },
    {
      title: 'Version History',
      description: 'Track resume drafts, edit logs, and monitor how your ATS score has improved over time.',
      icon: History,
      color: 'text-orange-600 bg-orange-50 border-orange-200',
    },
    {
      title: 'Optimal PDF Export',
      description: 'Generate single-page, ATS-optimized print-ready PDFs matching executive scanning layouts.',
      icon: Download,
      color: 'text-pink-600 bg-pink-50 border-pink-200',
    },
  ];

  const steps = [
    { num: '01', title: 'Upload Resume', desc: 'Drag your PDF to extract project metrics.' },
    { num: '02', title: 'AI Analysis', desc: 'Locate missing keywords and get an ATS grade.' },
    { num: '03', title: 'Rewrite Bullets', desc: 'Refactor descriptions with metrics and action verbs.' },
    { num: '04', title: 'Match Job Description', desc: 'Compare profile against listing requirements.' },
    { num: '05', title: 'Export & Apply', desc: 'Generate a clean, optimized single-page resume.' },
  ];

  const stats = [
    { value: '95%', label: 'ATS Score Accuracy' },
    { value: '25,000+', label: 'Bullet Points Rewritten' },
    { value: '8,000+', label: 'Resumes Optimized' },
    { value: '100%', label: 'ATS Keyword Matching' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-slate-50 to-slate-100 text-slate-800 flex flex-col relative font-sans overflow-x-hidden select-none">
      
      {/* Decorative Blur Blobs */}
      <div className="absolute top-[-10%] left-[20%] w-[500px] h-[500px] bg-blue-500/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-[40%] right-[10%] w-[400px] h-[400px] bg-indigo-500/5 rounded-full blur-[100px] pointer-events-none" />

      {/* Header */}
      <header className="relative z-20 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between border-b border-slate-200 bg-white/80 backdrop-blur-md sticky top-0">
        <span className="text-base font-bold tracking-tight text-slate-900 flex items-center gap-2">
          🤖 AI Resume Copilot
        </span>
        <div className="flex items-center gap-4">
          <Link to="/login" className="text-xs font-semibold text-slate-550 hover:text-slate-800 transition-colors">
            Sign In
          </Link>
          <Link
            to="/signup"
            className="flex items-center gap-1 px-3.5 py-1.5 bg-blue-650 hover:bg-blue-700 text-xs font-bold rounded-lg text-white shadow-sm transition-all"
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
          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-[10px] font-bold tracking-wider uppercase mx-auto"
        >
          <span>🚀 Premium AI Resume Builder</span>
        </motion.div>

        <motion.h1
          variants={itemVariants}
          className="text-4xl md:text-6xl font-extrabold tracking-tight text-slate-900 max-w-3xl mx-auto leading-[1.1] font-sans"
        >
          Build ATS-Optimized <br />
          <span className="text-blue-600 bg-gradient-to-r from-blue-650 via-indigo-600 to-indigo-700 bg-clip-text text-transparent">
            Resumes with AI
          </span>
        </motion.h1>

        <motion.p
          variants={itemVariants}
          className="text-slate-500 text-sm md:text-base max-w-xl mx-auto leading-relaxed"
        >
          Upload your resume, refactor project description bullet points, match against job descriptions, and build the perfect profile—all powered by AI.
        </motion.p>

        <motion.div variants={itemVariants} className="flex items-center justify-center gap-3 pt-2">
          <Link
            to="/resume-analyzer"
            className="px-5 py-2.5 bg-blue-655 hover:bg-blue-700 text-xs font-bold rounded-lg text-white shadow-sm transition-all flex items-center gap-1.5"
          >
            Analyze Resume <ArrowRight className="w-3.5 h-3.5" />
          </Link>
          <Link
            to="/login"
            className="px-5 py-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-xs font-semibold rounded-lg text-slate-700 transition-all flex items-center gap-1 shadow-xs"
          >
            Watch Demo <Play className="w-3 h-3 fill-slate-700 text-slate-700" />
          </Link>
        </motion.div>
      </motion.section>

      {/* Product Preview Card */}
      <section className="relative z-10 w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="relative rounded-2xl border border-slate-200 bg-white shadow-2xl overflow-hidden p-1"
        >
          {/* Top Bar controls */}
          <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3 bg-slate-50">
            <div className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-red-400" />
              <span className="h-2.5 w-2.5 rounded-full bg-yellow-400" />
              <span className="h-2.5 w-2.5 rounded-full bg-green-400" />
            </div>
            <div className="text-[10px] text-slate-500 font-mono bg-white border border-slate-200 px-6 py-0.5 rounded-lg shadow-inner">
              resume-copilot.ai/dashboard
            </div>
            <div className="w-8" />
          </div>

          <div className="flex min-h-[380px] bg-slate-50/50">
            {/* Sidebar Mockup */}
            <aside className="w-48 border-r border-slate-200 p-3 space-y-4 flex-shrink-0 bg-slate-50">
              <div className="space-y-1">
                {['Dashboard', 'Resume Analyzer', 'Resume Rewriter', 'Job Matcher', 'Resume History', 'Settings'].map((menu, i) => (
                  <div
                    key={menu}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg text-[11px] font-semibold ${
                      i === 0 ? 'bg-slate-900 text-white shadow-xs' : 'text-slate-500 hover:text-slate-900'
                    }`}
                  >
                    <span className={`h-1.5 w-1.5 rounded-full ${i === 0 ? 'bg-white' : 'bg-transparent'}`} />
                    {menu}
                  </div>
                ))}
              </div>
            </aside>

            {/* Main Area Mockup */}
            <main className="flex-1 p-5 space-y-5 bg-white">
              {/* Profile Bar */}
              <div className="flex justify-between items-center pb-2 border-b border-slate-200">
                <div>
                  <h4 className="text-xs font-bold text-slate-800">Resume Copilot Workspace</h4>
                  <span className="text-[9px] text-slate-500">Active: Resume_Software_Engineer.pdf</span>
                </div>
                <div className="h-6 w-6 rounded-full bg-blue-100 border border-blue-200 flex items-center justify-center text-[9px] text-blue-600 font-bold">
                  JD
                </div>
              </div>

              {/* Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Score Card */}
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5">
                  <span className="text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Resume ATS Grade</span>
                  <div className="text-xl font-extrabold text-green-600">84%</div>
                  <div className="h-1 w-full bg-slate-200 rounded-full overflow-hidden">
                    <div className="h-full bg-green-500 w-[84%]" />
                  </div>
                </div>

                {/* Rewriter Card */}
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5">
                  <span className="text-[9px] font-semibold text-slate-500 uppercase tracking-wider">AI Resume Rewrites</span>
                  <div className="text-xl font-extrabold text-indigo-650">3 pending</div>
                  <span className="text-[8px] text-slate-500 block">+15% score increase potential</span>
                </div>

                {/* Job Match Card */}
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5">
                  <span className="text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Job Match Score</span>
                  <div className="text-xl font-extrabold text-blue-600">78% Match</div>
                  <div className="h-1 w-full bg-slate-200 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-500 w-[78%]" style={{ width: '78%' }} />
                  </div>
                </div>
              </div>

              {/* Bottom Insights split */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                  <span className="text-[9px] font-bold text-slate-700 uppercase block">Missing Skills Gap</span>
                  <div className="flex flex-wrap gap-1.5">
                    {['Redis', 'Docker', 'System Design'].map((s) => (
                      <span key={s} className="text-[8px] font-bold px-2 py-0.5 rounded bg-red-50 border border-red-200 text-red-700">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                  <span className="text-[9px] font-bold text-slate-700 uppercase block">AI Recommended Target</span>
                  <span className="text-[10px] text-slate-500 block font-medium">
                    🔍 Optimize project action verbs inside your experience section.
                  </span>
                </div>
              </div>
            </main>
          </div>
        </motion.div>
      </section>

      {/* Features Grid Section */}
      <section className="relative z-10 w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 border-t border-slate-200">
        <div className="text-center space-y-3 mb-12">
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900">
            AI Resume Copilot Core Features
          </h2>
          <p className="text-slate-500 text-xs md:text-sm max-w-xl mx-auto">
            Everything structured in a clean, unified workspace built specifically to optimize your resume profiles.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {featureCards.map((feat, idx) => (
            <motion.div
              key={idx}
              whileHover={{ y: -5, borderColor: '#2563eb' }}
              className="p-6 bg-white border border-slate-200 rounded-2xl shadow-xs transition-all duration-300"
            >
              <div className={`p-2.5 border rounded-xl w-fit ${feat.color}`}>
                <feat.icon className="w-5 h-5" />
              </div>
              <h3 className="mt-4 text-sm font-bold text-slate-900">{feat.title}</h3>
              <p className="mt-2 text-xs text-slate-500 leading-relaxed">{feat.description}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* How It Works Section */}
      <section className="relative z-10 w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 border-t border-slate-200">
        <div className="text-center space-y-3 mb-16">
          <h2 className="text-2xl md:text-3xl font-bold text-slate-900">How It Works</h2>
          <p className="text-slate-500 text-xs">Our platform guides you from your raw resume to an SDE-optimized application profile.</p>
        </div>

        {/* Horizontal Timeline */}
        <div className="relative grid grid-cols-1 md:grid-cols-5 gap-6 md:gap-4">
          <div className="hidden md:block absolute top-[22px] left-[10%] right-[10%] h-[1px] bg-slate-200 z-0" />
          
          {steps.map((step, idx) => (
            <div key={idx} className="relative z-10 text-center space-y-3 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs md:bg-transparent md:border-transparent md:shadow-none">
              <div className="w-10 h-10 rounded-full bg-white border border-slate-250 flex items-center justify-center text-xs font-bold text-blue-600 mx-auto shadow-xs">
                {step.num}
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-800 block">{step.title}</h4>
                <p className="text-[10px] text-slate-500 mt-1 leading-relaxed max-w-[150px] mx-auto">{step.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Social Proof (Statistics) */}
      <section className="relative z-10 w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 border-t border-slate-200 bg-slate-50/50">
        <div className="text-center space-y-2 mb-12">
          <h2 className="text-2xl md:text-3xl font-bold text-slate-900">Why SDEs Choose Resume Copilot</h2>
          <p className="text-slate-550 text-xs">High-impact conversion rates backed by AI optimization statistics.</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
          {stats.map((st, idx) => (
            <div key={idx} className="p-5 text-center bg-white border border-slate-200 rounded-2xl space-y-1 shadow-xs">
              <span className="text-2xl md:text-3xl font-extrabold text-blue-650 block">{st.value}</span>
              <span className="text-[10px] font-bold text-slate-450 block tracking-wide uppercase">{st.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-200 py-8 relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center sm:flex sm:justify-between text-[11px] text-slate-500">
        <p>© 2026 AI Resume Copilot. All rights reserved.</p>
        <p className="mt-2 sm:mt-0 flex justify-center gap-4">
          <span className="hover:text-slate-800 cursor-pointer">Privacy Policy</span>
          <span className="hover:text-slate-800 cursor-pointer">Terms of Service</span>
        </p>
      </footer>
    </div>
  );
}
