import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useResumeStore } from '../store/resumeStore.js';
import {
  Sparkles,
  FileText,
  Check,
  X,
  Edit2,
  CornerDownRight,
  TrendingUp,
  RefreshCw,
} from 'lucide-react';

interface BulletPointSuggestion {
  id: string;
  original: string;
  suggested: string;
  reason: string;
  category: 'metric' | 'verb' | 'clarity' | 'ats';
}

export default function ResumeRewriter() {
  const { resumeFileName, resumeText } = useResumeStore();
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Static mock demonstration data for the rewriter preview
  const [suggestions, setSuggestions] = useState<BulletPointSuggestion[]>([
    {
      id: '1',
      original: 'Helped write backend APIs for the e-commerce store using Node.js.',
      suggested: 'Engineered a scalable RESTful e-commerce API backend utilizing Node.js, decreasing query response latencies by 35% through SQL query optimization.',
      reason: 'Replaced passive wording with active verb "Engineered" and added quantified latency metric.',
      category: 'metric',
    },
    {
      id: '2',
      original: 'Worked on front-end components and added styling changes.',
      suggested: 'Deployed 15+ reusable responsive web components using React and Tailwind CSS, improving client loading speeds by 22% via asset compression.',
      reason: 'Specified front-end frameworks (React, Tailwind) and quantified components delivered.',
      category: 'verb',
    },
    {
      id: '3',
      original: 'Did some bug fixing and wrote tests for the backend codebase.',
      suggested: 'Maintained 95% backend test coverage by implementing 40+ unit/integration test modules using Jest and Supertest.',
      reason: 'Quantified testing coverage levels and named the testing tools (Jest, Supertest).',
      category: 'ats',
    },
  ]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  };

  const handleAccept = (id: string) => {
    setSuggestions((prev) => prev.filter((s) => s.id !== id));
    showToast('AI suggestion accepted and merged!');
  };

  const handleReject = (id: string) => {
    setSuggestions((prev) => prev.filter((s) => s.id !== id));
    showToast('AI suggestion dismissed.');
  };

  const handleEdit = (id: string) => {
    console.log('Editing bullet point id:', id);
    showToast('Custom editing mode (Coming in Next Milestone)');
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-10">
      
      {/* Toast Alert System */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20, x: '-50%' }}
            animate={{ opacity: 1, y: 0, x: '-50%' }}
            exit={{ opacity: 0, y: -20, x: '-50%' }}
            className="fixed top-6 left-1/2 -translate-x-1/2 z-50 px-4 py-2.5 bg-blue-650 text-xs font-bold text-white rounded-lg shadow-xl shadow-blue-500/10 flex items-center gap-1.5 border border-blue-500"
          >
            <Sparkles className="w-4 h-4 text-yellow-300" /> {toastMessage}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="flex justify-between items-center border-b border-slate-900 pb-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-1.5">
            <Sparkles className="w-5 h-5 text-indigo-400" /> AI Resume Rewriter
          </h1>
          <p className="text-slate-550 text-xs">Instantly refactor weak, passive resume bullet points into high-impact, quantified achievements.</p>
        </div>
      </div>

      {!resumeText ? (
        <div className="p-12 border border-slate-850 bg-slate-900/10 rounded-2xl text-center space-y-4 max-w-xl mx-auto">
          <div className="mx-auto h-12 w-12 rounded-xl bg-slate-950/60 border border-slate-850 flex items-center justify-center text-slate-500">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">No active resume uploaded</h3>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              Before you can rewrite bullet points, you must upload and analyze a resume. Please go to the Resume Analyzer page to scan your resume file.
            </p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          
          {/* Main Rewrite Workspace (Left) */}
          <div className="lg:col-span-3.5 space-y-5 lg:col-span-3">
            <div className="flex justify-between items-center px-1">
              <span className="text-xs font-bold text-slate-350 uppercase tracking-wider">Suggestions for {resumeFileName}</span>
              <span className="text-[10px] text-green-400 font-semibold bg-green-950/40 px-2 py-0.5 border border-green-900/60 rounded">
                {suggestions.length} recommendations pending
              </span>
            </div>

            <div className="space-y-4">
              <AnimatePresence mode="popLayout">
                {suggestions.map((sug) => (
                  <motion.div
                    key={sug.id}
                    layout
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9, x: -30 }}
                    transition={{ duration: 0.3 }}
                    className="p-5 bg-slate-900/10 border border-slate-850 rounded-2xl shadow-xl space-y-4 relative overflow-hidden"
                  >
                    {/* Category Label badge */}
                    <div className="absolute top-0 right-0 bg-indigo-950/40 border-l border-b border-slate-850 px-2.5 py-0.5 rounded-bl text-[8px] font-bold text-indigo-400 uppercase tracking-wider">
                      {sug.category} optimization
                    </div>

                    {/* Original bullet block */}
                    <div className="space-y-1 text-xs">
                      <span className="text-[9px] text-slate-550 font-bold uppercase tracking-wider block">Original Text</span>
                      <p className="text-slate-450 leading-relaxed pl-2 border-l border-slate-800 italic">"{sug.original}"</p>
                    </div>

                    {/* Suggested Refactored block */}
                    <div className="space-y-1.5 text-xs bg-slate-950/50 p-3 rounded-xl border border-slate-900">
                      <span className="text-[9px] text-indigo-400 font-bold uppercase tracking-wider flex items-center gap-1">
                        <CornerDownRight className="w-3 h-3" /> Recommended Refactor
                      </span>
                      <p className="text-white leading-relaxed font-semibold">"{sug.suggested}"</p>
                      
                      <div className="pt-2 flex items-center gap-1 text-[10px] text-slate-500 font-medium">
                        <span className="font-bold text-slate-400">Why:</span>
                        <span>{sug.reason}</span>
                      </div>
                    </div>

                    {/* Action controls row */}
                    <div className="flex justify-between items-center pt-2 border-t border-slate-900/40">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleAccept(sug.id)}
                          className="flex items-center gap-1 px-3 py-1.5 bg-green-950/40 hover:bg-green-900/40 border border-green-900/50 text-green-400 text-[10px] font-bold rounded-lg transition-colors"
                        >
                          <Check className="w-3.5 h-3.5" /> Accept Suggestion
                        </button>
                        <button
                          onClick={() => handleReject(sug.id)}
                          className="flex items-center gap-1 px-3 py-1.5 bg-red-955/30 hover:bg-red-950/45 border border-red-900/40 text-red-400 text-[10px] font-bold rounded-lg transition-colors"
                        >
                          <X className="w-3.5 h-3.5" /> Dismiss
                        </button>
                      </div>

                      <button
                        onClick={() => handleEdit(sug.id)}
                        className="flex items-center gap-1 px-2.5 py-1.5 bg-slate-950 border border-slate-900 hover:bg-slate-900 text-slate-400 hover:text-slate-300 text-[10px] font-medium rounded-lg transition-colors"
                      >
                        <Edit2 className="w-3 h-3" /> Edit
                      </button>
                    </div>

                  </motion.div>
                ))}
              </AnimatePresence>

              {suggestions.length === 0 && (
                <div className="p-8 bg-slate-900/10 border border-slate-850 rounded-2xl text-center text-xs text-slate-500 italic">
                  All AI recommendations processed! Upload a different resume to scan.
                </div>
              )}
            </div>
          </div>

          {/* Quick Stats Column (Right) */}
          <div className="lg:col-span-2 space-y-6">
            <div className="p-5 bg-slate-900/10 border border-slate-850 rounded-2xl space-y-4">
              <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">Rewrite Metrics</h3>
              
              <div className="space-y-3.5 text-xs text-slate-400">
                <div className="flex justify-between items-center">
                  <span>Target verbs density</span>
                  <span className="font-semibold text-green-400 font-mono">Good</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Estimated Score Impact</span>
                  <span className="font-semibold text-indigo-400 font-mono flex items-center gap-0.5">
                    <TrendingUp className="w-3.5 h-3.5" /> +15% Score
                  </span>
                </div>
              </div>

              <div className="pt-2">
                <button
                  onClick={() => showToast('AI processing initiated (Real API matches loaded in next step)')}
                  className="w-full py-2.5 bg-slate-900 border border-slate-800 hover:bg-slate-800 text-xs font-bold text-slate-200 rounded-lg flex items-center justify-center gap-1.5 transition-colors"
                >
                  <RefreshCw className="w-3.5 h-3.5" /> Recalculate Scan
                </button>
              </div>
            </div>
          </div>

        </div>
      )}

    </div>
  );
}
