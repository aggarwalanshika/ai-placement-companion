import { Link } from 'react-router-dom';
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
} from 'lucide-react';

export default function Dashboard() {
  const { resumeFileName, analysisResult } = useResumeStore();

  const atsScore = analysisResult?.overallScore;
  const missingSkills = analysisResult?.missingSkills || ['Docker', 'Redis', 'AWS', 'System Design', 'CI/CD'];
  const improvements = analysisResult?.suggestions || [
    'Add measurable achievements (e.g. latency details or page speed optimization metrics).',
    'Quantify project descriptions using the Google-style STAR/X-Y-Z formula.',
    'Remove passive terminology and replace with strong SDE action verbs.',
  ];

  const topCards = [
    { label: 'Latest Resume', value: resumeFileName || 'No resume uploaded', subtext: resumeFileName ? 'Preloaded' : 'Scan a PDF to get started', icon: FileText },
    { label: 'ATS Score', value: atsScore !== undefined ? `${atsScore}%` : 'N/A', subtext: atsScore !== undefined ? 'Latest AI evaluation score' : 'No scan available', icon: TrendingUp },
    { label: 'Resume Versions', value: resumeFileName ? '3 versions' : '0 versions', subtext: 'Tracked drafts', icon: History },
    { label: 'Last Analysis', value: resumeFileName ? 'Just now' : 'N/A', subtext: 'Last scan timestamp', icon: Clock },
  ];

  const quickActions = [
    { title: 'Upload Resume', desc: 'Scan PDF for ATS keyword gaps', href: '/resume-analyzer', icon: FileText },
    { title: 'Rewrite Resume', desc: 'Refactor bullet points with AI', href: '/resume-rewriter', icon: Sparkles },
    { title: 'Match Job Description', desc: 'Compare profile suitability against JD', href: '/job-description-matcher', icon: Briefcase },
  ];

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-10">
      
      {/* Title Header */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-950 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-indigo-600" /> Dashboard Workspace
          </h1>
          <p className="text-slate-500 text-xs mt-0.5">Build, optimize, and match your resume profiles directly against SDE job listings.</p>
        </div>
        <div className="text-[10px] font-mono text-slate-500 bg-white border border-slate-200 px-3 py-1 rounded-lg">
          Platform: v1.0.0
        </div>
      </div>

      {/* Top Cards grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {topCards.map((card, idx) => (
          <div key={idx} className="p-5 bg-white border border-slate-200 rounded-2xl space-y-3 shadow-xs">
            <div className="flex justify-between items-center text-slate-400">
              <span className="text-[9px] font-bold uppercase tracking-wider">{card.label}</span>
              <card.icon className="h-4 w-4 text-slate-400" />
            </div>
            <div>
              <div className="text-base font-extrabold text-slate-900 truncate max-w-[200px]">{card.value}</div>
              <span className="text-[9px] text-slate-500">{card.subtext}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Main Grid splits */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2 Columns */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Quick Actions (Dashboard Launcher Links) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {quickActions.map((act, idx) => (
              <Link
                key={idx}
                to={act.href}
                className="p-5 bg-white border border-slate-200 hover:border-blue-500/50 hover:bg-slate-50/50 rounded-2xl transition-all space-y-1.5 block group shadow-xs"
              >
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-slate-800 block group-hover:text-blue-600 transition-colors">{act.title}</span>
                  <act.icon className="h-4 w-4 text-indigo-500 group-hover:text-indigo-600 transition-all" />
                </div>
                <p className="text-[10px] text-slate-500 leading-relaxed">{act.desc}</p>
              </Link>
            ))}
          </div>

          {/* Top Missing Skills */}
          <div className="p-6 bg-white border border-slate-200 rounded-2xl space-y-4 shadow-xs">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
              <PlusCircle className="w-4 h-4 text-red-500" /> Top Missing Skills Gaps
            </h3>
            
            <p className="text-[10px] text-slate-500 leading-relaxed">
              These technical keywords are missing or sparse in your latest resume. Adding them will improve your ATS grade.
            </p>

            <div className="flex flex-wrap gap-2">
              {missingSkills.map((s: string, idx: number) => (
                <span key={idx} className="text-xs font-semibold px-2.5 py-1 bg-red-50 border border-red-200 text-red-700 rounded-lg">
                  {s}
                </span>
              ))}
            </div>
          </div>

        </div>

        {/* Right 1 Column */}
        <div className="space-y-6">
          
          {/* Recent improvements recommendations */}
          <div className="p-6 bg-white border border-slate-200 rounded-2xl space-y-4 shadow-xs">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-indigo-500" /> Recent Suggestions
            </h3>
            
            <ul className="space-y-3 pl-4 text-xs text-slate-650 list-disc list-inside leading-relaxed">
              {improvements.slice(0, 4).map((imp: string, idx: number) => (
                <li key={idx} className="marker:text-blue-600">{imp}</li>
              ))}
            </ul>
          </div>

          {/* Quick PDF Export Placeholder */}
          <div className="p-6 bg-white border border-slate-200 rounded-2xl space-y-4 flex flex-col justify-between shadow-xs">
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
              className="w-full py-2.5 bg-slate-100 border border-slate-200 text-slate-400 text-[10px] font-bold rounded-xl cursor-not-allowed text-center transition-colors block mt-2"
            >
              Export Print Version (Next Milestone)
            </button>
          </div>

        </div>

      </div>
    </div>
  );
}
