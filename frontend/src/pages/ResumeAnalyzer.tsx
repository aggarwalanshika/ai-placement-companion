import { useState } from 'react';
import { Upload, FileText, CheckCircle2, Loader, Cpu, FileSearch } from 'lucide-react';

export default function ResumeAnalyzer() {
  const [file, setFile] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [reportReady, setReportReady] = useState(false);

  const handleSimulatedUpload = () => {
    setUploading(true);
    setReportReady(false);
    setFile('Software_Engineer_Resume_John.pdf');
    
    // Simulate Uploading in 1s
    setTimeout(() => {
      setUploading(false);
      setAnalyzing(true);
      
      // Simulate Deep AI analysis in 1.8s
      setTimeout(() => {
        setAnalyzing(false);
        setReportReady(true);
      }, 1800);
    }, 1000);
  };

  const missingSkills = ['Redis / Memcached', 'Docker Containerization', 'Kubernetes Deployment', 'OAuth 2.0 / SSO'];
  const suggestedImprovements = [
    'Replace passive descriptions with strong action verbs (e.g., replace "helped with database" with "designed database architecture").',
    'Add numerical performance metrics in projects (e.g., "reduced api latency by 40%").',
    'Reduce total resume page count to exactly 1 page for entry-level SDE profiles.',
  ];

  const subScores = [
    { name: 'Keyword Matching', score: 72, color: 'text-yellow-400' },
    { name: 'Grammar & Tone', score: 94, color: 'text-green-400' },
    { name: 'Project Quality', score: 86, color: 'text-emerald-400' },
    { name: 'Overall AI Rating', score: 82, color: 'text-blue-400' },
  ];

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Title */}
      <div>
        <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-1.5">
          <FileSearch className="w-5 h-5 text-blue-400" /> ATS Resume Scanner
        </h1>
        <p className="text-slate-550 text-xs">Verify profile keyword density, sub-scores, and overall ratings before submitting to recruiters.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        
        {/* Upload Column (3 Columns) */}
        <div className="lg:col-span-3 space-y-6">
          <div className="p-8 bg-slate-900/10 border border-slate-900 border-dashed rounded-2xl hover:border-slate-800 transition-all text-center flex flex-col items-center justify-center space-y-4">
            <div className="p-4 bg-slate-950/60 border border-slate-900 rounded-xl text-slate-400">
              <Upload className="h-6 w-6" />
            </div>
            <div>
              <span className="text-xs font-bold text-white block">Drag and drop your PDF resume here</span>
              <span className="text-[10px] text-slate-550 block mt-1">Accepted formats: PDF only (Max size 5MB)</span>
            </div>

            {uploading ? (
              <div className="text-xs text-blue-400 font-semibold flex items-center gap-1.5 animate-pulse">
                <Loader className="animate-spin h-3.5 w-3.5" /> Transferring resume PDF...
              </div>
            ) : analyzing ? (
              <div className="text-xs text-indigo-400 font-semibold flex items-center gap-1.5 animate-pulse">
                <Cpu className="animate-spin h-3.5 w-3.5" /> AI parsing sections & analyzing keywords...
              </div>
            ) : file ? (
              <div className="text-xs text-green-400 font-semibold flex items-center gap-1.5 bg-green-950/20 border border-green-900/60 px-3 py-1 rounded-lg">
                <CheckCircle2 className="w-3.5 h-3.5" /> File loaded: {file}
              </div>
            ) : null}

            <button
              onClick={handleSimulatedUpload}
              disabled={uploading || analyzing}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-xs font-bold rounded-lg text-white transition-all disabled:opacity-50"
            >
              Analyze Simulated Resume
            </button>
          </div>

          {/* AI Report */}
          {reportReady && (
            <div className="p-6 bg-slate-900/20 border border-slate-800/85 rounded-2xl shadow-xl space-y-6">
              
              {/* ATS Headline block */}
              <div className="flex flex-col md:flex-row gap-6 items-center justify-between border-b border-slate-900/60 pb-5">
                <div className="flex items-center gap-4">
                  {/* Circular CSS Gauge */}
                  <div className="relative h-20 w-20 flex items-center justify-center bg-slate-950 border border-slate-900 rounded-full">
                    <span className="text-xl font-extrabold text-green-400">82%</span>
                    {/* Ring border decoration */}
                    <div className="absolute inset-1.5 rounded-full border-2 border-green-400/20 border-t-green-400" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white uppercase tracking-wider">ATS Score Report</h3>
                    <span className="text-[10px] text-slate-500">Resume Strength: Good Match for SDE-1</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <span className="text-[9px] font-bold px-2.5 py-1 bg-green-950/30 border border-green-900/40 text-green-400 rounded-lg">
                    Passed (75% Gate)
                  </span>
                </div>
              </div>

              {/* Subscores stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {subScores.map((sub, idx) => (
                  <div key={idx} className="p-3 bg-slate-950/60 border border-slate-900 rounded-xl space-y-1">
                    <span className="text-[9px] text-slate-500 block">{sub.name}</span>
                    <span className={`text-base font-bold block ${sub.color}`}>{sub.score}%</span>
                  </div>
                ))}
              </div>

              {/* Improvements Section */}
              <div className="space-y-3">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Suggested Improvements</span>
                <ul className="space-y-2 text-xs text-slate-450 leading-relaxed list-disc list-inside">
                  {suggestedImprovements.map((imp, idx) => (
                    <li key={idx} className="marker:text-blue-500">{imp}</li>
                  ))}
                </ul>
              </div>

            </div>
          )}

        </div>

        {/* Missing Skills Gap Column (2 Columns) */}
        <div className="lg:col-span-2 space-y-6">
          <div className="p-5 bg-slate-900/20 border border-slate-800/80 rounded-xl space-y-4">
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">Target Keywords Gap</h3>
            <p className="text-[10px] text-slate-500 leading-tight">These missing skills were found by scanning your resume against target company SDE specs.</p>
            
            <div className="space-y-2">
              {missingSkills.map((sk, idx) => (
                <div key={idx} className="flex justify-between items-center p-3 bg-slate-950/60 border border-slate-900 rounded-lg text-xs">
                  <span className="font-semibold text-white">{sk}</span>
                  <span className="text-[9px] font-bold px-2 py-0.5 rounded bg-red-950/40 border border-red-900/40 text-red-400 uppercase">
                    Missing
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* History */}
          <div className="p-5 bg-slate-900/20 border border-slate-800/80 rounded-xl space-y-4">
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">Analysis History</h3>
            
            <div className="space-y-3 text-xs">
              {[
                { name: 'Software_Engineer_Resume_V2.pdf', score: 82, date: '1 day ago' },
                { name: 'Software_Engineer_Resume_V1.pdf', score: 74, date: '4 days ago' }
              ].map((hist, idx) => (
                <div key={idx} className="flex justify-between items-center p-2.5 bg-slate-950/40 border border-slate-900 rounded-lg">
                  <span className="text-slate-400 flex items-center gap-1.5 hover:text-white transition-colors cursor-pointer">
                    <FileText className="w-3.5 h-3.5 text-blue-400" /> {hist.name}
                  </span>
                  <span className="font-semibold text-green-400 font-mono bg-green-950/40 px-2 py-0.5 rounded border border-green-900/60">{hist.score}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
