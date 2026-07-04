import { motion } from 'framer-motion';
import { History, FileText, Download, Calendar, Sparkles } from 'lucide-react';

export default function ResumeHistory() {
  const historyItems = [
    { name: 'Software_Engineer_Resume_V3.pdf', score: 87, date: 'Jul 3, 2026', version: 'v3.0 (Active)', category: 'Backend Role' },
    { name: 'Software_Engineer_Resume_V2.pdf', score: 82, date: 'Jul 2, 2026', version: 'v2.0', category: 'General SDE' },
    { name: 'Software_Engineer_Resume_V1.pdf', score: 74, date: 'Jun 30, 2026', version: 'v1.0', category: 'Initial Draft' },
  ];

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-10 animate-fade-in">
      {/* Header */}
      <div className="flex justify-between items-center border-b border-slate-900 pb-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-1.5">
            <History className="w-5 h-5 text-indigo-400" /> Resume Version History
          </h1>
          <p className="text-slate-550 text-xs">Access all previously analyzed drafts and track how your ATS score has improved over time.</p>
        </div>
      </div>

      <div className="space-y-4">
        {historyItems.map((item, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: idx * 0.1 }}
            className="p-5 bg-slate-900/10 border border-slate-850 rounded-2xl shadow-lg flex items-center justify-between gap-4 text-xs"
          >
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-slate-950/60 border border-slate-850 flex items-center justify-center text-slate-400 flex-shrink-0">
                <FileText className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <span className="font-bold text-white block leading-tight">{item.name}</span>
                <div className="flex items-center gap-3 text-[10px] text-slate-500 font-medium">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" /> {item.date}
                  </span>
                  <span>•</span>
                  <span>Version: {item.version}</span>
                  <span>•</span>
                  <span>Category: {item.category}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-6">
              <div className="text-right">
                <span className="text-[10px] text-slate-500 block uppercase font-bold tracking-wide mb-0.5">ATS Score</span>
                <span className="font-extrabold text-green-400 font-mono text-sm bg-green-950/40 px-2.5 py-0.5 border border-green-900/50 rounded">
                  {item.score}%
                </span>
              </div>
              
              <div className="flex gap-2">
                <button
                  disabled
                  className="flex items-center gap-1 px-3 py-1.5 bg-slate-950 border border-slate-900 text-slate-400 text-[10px] font-bold rounded-lg cursor-not-allowed"
                >
                  <Sparkles className="w-3.5 h-3.5" /> Re-scan
                </button>
                <button
                  disabled
                  className="flex items-center gap-1 px-3 py-1.5 bg-slate-950 border border-slate-900 text-slate-400 text-[10px] font-bold rounded-lg cursor-not-allowed"
                >
                  <Download className="w-3.5 h-3.5" /> Download
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
