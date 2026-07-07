import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useResumeStore } from '../store/resumeStore.js';
import {
  FileText,
  Sparkles,
  Briefcase,
  Download,
  History,
  Clock,
  PlusCircle,
  TrendingUp,
  ArrowRight,
  Check,
  Copy,
} from 'lucide-react';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] as const } },
};

export default function Dashboard() {
  const { resumeFileName, analysisResult } = useResumeStore();
  const [copiedSkill, setCopiedSkill] = useState<string | null>(null);

  const atsScore = analysisResult?.overallScore;
  const missingSkills = analysisResult?.missingSkills || ['Docker', 'Redis', 'AWS', 'System Design', 'CI/CD'];
  const improvements = analysisResult?.suggestions || [
    'Add measurable achievements (e.g. latency details or page speed optimization metrics).',
    'Quantify project descriptions using the Google-style STAR/X-Y-Z formula.',
    'Remove passive terminology and replace with strong SDE action verbs.',
  ];

  const handleCopySkill = (skill: string) => {
    navigator.clipboard.writeText(skill);
    setCopiedSkill(skill);
    setTimeout(() => setCopiedSkill(null), 2000);
  };

  const topCards = [
    {
      label: 'Latest Resume',
      value: resumeFileName || 'No resume uploaded',
      subtext: resumeFileName ? 'Preloaded Reference' : 'Scan a PDF to get started',
      icon: FileText,
      color: 'text-blue-500 bg-blue-50',
    },
    {
      label: 'ATS Score',
      value: atsScore !== undefined ? `${atsScore}%` : 'N/A',
      subtext: atsScore !== undefined ? 'Latest AI evaluation score' : 'No scan available',
      icon: TrendingUp,
      color: 'text-green-600 bg-green-50',
    },
    {
      label: 'Resume Versions',
      value: resumeFileName ? '3 versions' : '0 versions',
      subtext: 'Tracked drafts',
      icon: History,
      color: 'text-indigo-600 bg-indigo-50',
    },
    {
      label: 'Last Analysis',
      value: resumeFileName ? 'Just now' : 'N/A',
      subtext: 'Last scan timestamp',
      icon: Clock,
      color: 'text-purple-600 bg-purple-50',
    },
  ];

  const quickActions = [
    { title: 'Upload Resume', desc: 'Scan PDF for ATS keyword gaps', href: '/resume-analyzer', icon: FileText },
    { title: 'Rewrite Resume', desc: 'Refactor bullet points with AI', href: '/resume-rewriter', icon: Sparkles },
    { title: 'Match Job Description', desc: 'Compare profile suitability against JD', href: '/job-description-matcher', icon: Briefcase },
  ];

  // Circle path calculations for SVG score gauge
  const radius = 32;
  const circumference = 2 * Math.PI * radius;
  const scorePercent = atsScore !== undefined ? atsScore : 0;
  const strokeDashoffset = circumference - (scorePercent / 100) * circumference;

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6 max-w-6xl mx-auto pb-10 select-none font-sans"
    >
      
      {/* Title Header */}
      <motion.div
        variants={itemVariants}
        className="flex items-center justify-between border-b border-slate-200 pb-4"
      >
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-950 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-indigo-600 animate-pulse" /> Dashboard Workspace
          </h1>
          <p className="text-slate-500 text-xs mt-0.5">Build, optimize, and match your resume profiles directly against SDE job listings.</p>
        </div>
        <div className="text-[10px] font-mono text-slate-500 bg-white border border-slate-200 px-3 py-1 rounded-lg shadow-2xs">
          Platform: v1.0.0
        </div>
      </motion.div>

      {/* Top Cards grid */}
      <motion.div
        variants={itemVariants}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
      >
        {topCards.map((card, idx) => (
          <div
            key={idx}
            className="p-5 bg-white border border-slate-200 rounded-2xl space-y-3 shadow-2xs hover:-translate-y-1 hover:shadow-xs transition-all duration-300 group"
          >
            <div className="flex justify-between items-center text-slate-400">
              <span className="text-[9px] font-bold uppercase tracking-wider">{card.label}</span>
              <div className={`p-1.5 rounded-lg border border-slate-100 ${card.color} group-hover:scale-110 transition-transform duration-300`}>
                <card.icon className="h-3.5 w-3.5" />
              </div>
            </div>
            <div>
              <div className="text-base font-extrabold text-slate-900 truncate max-w-[200px]">{card.value}</div>
              <span className="text-[9px] text-slate-500">{card.subtext}</span>
            </div>
          </div>
        ))}
      </motion.div>

      {/* Main Grid splits */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Left 2 Columns */}
        <div className="md:col-span-2 space-y-6">
          
          {/* Quick Actions (Dashboard Launcher Links) */}
          <motion.div
            variants={itemVariants}
            className="grid grid-cols-1 sm:grid-cols-3 gap-4"
          >
            {quickActions.map((act, idx) => (
              <Link
                key={idx}
                to={act.href}
                className="p-5 bg-white border border-slate-200 hover:border-blue-500 hover:bg-slate-50/50 rounded-2xl transition-all duration-300 space-y-1.5 block group shadow-2xs hover:-translate-y-1 hover:shadow-xs"
              >
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-slate-800 block group-hover:text-blue-600 transition-colors">{act.title}</span>
                  <div className="p-1 rounded-lg bg-slate-50 group-hover:bg-blue-50 transition-colors">
                    <ArrowRight className="h-3.5 w-3.5 text-slate-400 group-hover:text-blue-600 group-hover:translate-x-0.5 transition-all" />
                  </div>
                </div>
                <p className="text-[10px] text-slate-500 leading-relaxed">{act.desc}</p>
              </Link>
            ))}
          </motion.div>

          {/* Top Missing Skills */}
          <motion.div
            variants={itemVariants}
            className="p-6 bg-white border border-slate-200 rounded-2xl space-y-4 shadow-2xs"
          >
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
              <PlusCircle className="w-4 h-4 text-red-500" /> Top Missing Skills Gaps
            </h3>
            
            <p className="text-[10px] text-slate-500 leading-relaxed">
              These technical keywords are missing or sparse in your latest resume. Click on any keyword to copy it for SDE profile optimization.
            </p>

            <div className="flex flex-wrap gap-2">
              {missingSkills.map((s: string, idx: number) => {
                const isCopied = copiedSkill === s;
                return (
                  <button
                    key={idx}
                    onClick={() => handleCopySkill(s)}
                    className={`text-xs font-semibold px-2.5 py-1.5 border rounded-lg transition-all flex items-center gap-1 hover:scale-105 active:scale-95 ${
                      isCopied
                        ? 'bg-green-50 border-green-200 text-green-700'
                        : 'bg-red-50/70 border-red-100 text-red-700 hover:bg-red-50'
                    }`}
                  >
                    {s}
                    {isCopied ? <Check className="w-3 h-3" /> : <Copy className="w-2.5 h-2.5 opacity-40" />}
                  </button>
                );
              })}
            </div>
          </motion.div>

        </div>

        {/* Right 1 Column */}
        <div className="space-y-6">
          
          {/* Dynamic Circular ATS Gauge (WOW Factor) */}
          {atsScore !== undefined && (
            <motion.div
              variants={itemVariants}
              className="p-6 bg-white border border-slate-200 rounded-2xl flex items-center gap-6 shadow-2xs hover:shadow-xs transition-shadow duration-300"
            >
              {/* SVG circular gauge */}
              <div className="relative h-20 w-20 flex-shrink-0 flex items-center justify-center">
                <svg className="w-full h-full -rotate-90">
                  <circle cx="40" cy="40" r={radius} fill="transparent" stroke="#f1f5f9" strokeWidth="6" />
                  <motion.circle
                    cx="40"
                    cy="40"
                    r={radius}
                    fill="transparent"
                    stroke="#10b981"
                    strokeWidth="6"
                    strokeDasharray={circumference}
                    initial={{ strokeDashoffset: circumference }}
                    animate={{ strokeDashoffset }}
                    transition={{ duration: 1.2, ease: 'easeOut' }}
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center leading-none">
                  <span className="text-lg font-extrabold text-slate-800">{atsScore}%</span>
                  <span className="text-[7.5px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">ATS</span>
                </div>
              </div>

              <div className="space-y-1">
                <h4 className="text-xs font-bold text-slate-800">ATS Rating Matrix</h4>
                <p className="text-[10px] text-slate-500 leading-relaxed">
                  Your profile meets {atsScore}% of target entry-level parameters. Resolve missing skills to boost scores.
                </p>
              </div>
            </motion.div>
          )}

          {/* Recent improvements recommendations */}
          <motion.div
            variants={itemVariants}
            className="p-6 bg-white border border-slate-200 rounded-2xl space-y-4 shadow-2xs"
          >
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-indigo-500" /> Recent Suggestions
            </h3>
            
            <ul className="space-y-3.5 pl-4 text-xs text-slate-600 list-disc list-inside leading-relaxed">
              {improvements.slice(0, 3).map((imp: string, idx: number) => (
                <li key={idx} className="marker:text-blue-600 pl-1">{imp}</li>
              ))}
            </ul>
          </motion.div>

          {/* Quick PDF Export Placeholder */}
          <motion.div
            variants={itemVariants}
            className="p-6 bg-white border border-slate-200 rounded-2xl space-y-4 flex flex-col justify-between shadow-2xs"
          >
            <div>
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <Download className="w-4 h-4 text-blue-500" /> PDF Print Export
              </h3>
              <p className="text-[10px] text-slate-500 leading-relaxed mt-1">
                Print a clean, single-page, ATS-optimized PDF resume version using executive standards.
              </p>
            </div>
            
            <button
              disabled
              className="w-full py-2.5 bg-slate-50 border border-slate-200 text-slate-400 text-[10px] font-bold rounded-xl cursor-not-allowed text-center transition-colors block mt-2"
            >
              Export Print Version (Next Milestone)
            </button>
          </motion.div>

        </div>

      </div>
    </motion.div>
  );
}
