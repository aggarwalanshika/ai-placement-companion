import { useState } from 'react';
import { Upload, FileText } from 'lucide-react';

export default function ResumeAnalyzer() {
  const [file, setFile] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [score, setScore] = useState<number | null>(null);

  const handleUpload = () => {
    setAnalyzing(true);
    // Simulate parsing in 1.2s
    setTimeout(() => {
      setFile('Mock_Resume_SE.pdf');
      setScore(84);
      setAnalyzing(false);
    }, 1200);
  };

  const keywords = [
    { name: 'Redis Caching', type: 'Missing', importance: 'Critical' },
    { name: 'Vector DB (Qdrant)', type: 'Missing', importance: 'High' },
    { name: 'System Design', type: 'Present', importance: 'Medium' },
    { name: 'TypeScript / React', type: 'Present', importance: 'High' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white">Resume Analyzer</h1>
        <p className="text-slate-450 text-sm">Analyze your resume for ATS score optimization and receive target keyword suggestions.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        
        {/* Upload Container (3 Columns) */}
        <div className="lg:col-span-3 space-y-6">
          <div className="p-8 bg-slate-900/40 border border-slate-800/80 rounded-2xl shadow-xl border-dashed hover:border-slate-700/80 transition-all text-center flex flex-col items-center justify-center space-y-4">
            <div className="p-4 bg-slate-950/60 border border-slate-800 rounded-2xl text-slate-350">
              <Upload className="h-8 w-8" />
            </div>
            <div>
              <span className="text-sm font-semibold text-white block">Drag and drop your PDF resume here</span>
              <span className="text-xs text-slate-500 block mt-1">Files supported: PDF only (Max size 5MB)</span>
            </div>
            
            {analyzing ? (
              <div className="text-xs text-blue-400 font-semibold animate-pulse">
                Parsing structures and scanning keywords...
              </div>
            ) : file ? (
              <div className="text-xs text-green-400 font-semibold flex items-center gap-1 bg-green-950/20 border border-green-900/60 px-3 py-1.5 rounded-xl">
                <FileText className="w-3.5 h-3.5" /> Loaded: {file}
              </div>
            ) : null}

            <button
              onClick={handleUpload}
              disabled={analyzing}
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-xs font-bold rounded-xl text-white shadow-lg shadow-blue-500/20 transition-all disabled:opacity-50"
            >
              Upload simulated resume
            </button>
          </div>

          {score && (
            <div className="p-6 bg-slate-900/40 border border-slate-800/80 rounded-2xl shadow-xl grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex flex-col items-center justify-center border-r border-slate-800/60 p-4">
                <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">ATS Score</span>
                <span className="text-4xl font-extrabold text-green-400 mt-2">{score}%</span>
              </div>
              <div className="md:col-span-2 space-y-2 p-2">
                <span className="text-xs font-bold text-white block">AI ATS Summary Report</span>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Your resume demonstrates strong technical project metrics. However, you lack structural references to microservices or caching systems. Adding these could boost your matching scores.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Keywords Recommendations & History (2 Columns) */}
        <div className="lg:col-span-2 space-y-6">
          <div className="p-6 bg-slate-900/40 border border-slate-800/80 rounded-2xl shadow-xl space-y-4">
            <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider">Keyword Scan Details</h3>
            
            <div className="space-y-2.5">
              {keywords.map((kw, idx) => (
                <div key={idx} className="flex justify-between items-center p-3 bg-slate-950/60 border border-slate-800/50 rounded-xl text-xs">
                  <span className="font-semibold text-white">{kw.name}</span>
                  <div className="flex gap-2">
                    <span className={`text-[9px] font-bold px-2 py-0.5 rounded uppercase ${
                      kw.type === 'Missing' ? 'bg-red-950/60 border border-red-900/60 text-red-400' : 'bg-green-950/60 border border-green-900/60 text-green-400'
                    }`}>
                      {kw.type}
                    </span>
                    <span className="text-[9px] text-slate-500 font-mono">Rank: {kw.importance}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* History */}
          <div className="p-6 bg-slate-900/40 border border-slate-800/80 rounded-2xl shadow-xl space-y-4">
            <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider">Upload History</h3>
            
            <div className="space-y-3">
              {[
                { name: 'Resume_SE_V2.pdf', score: 82, date: '1 day ago' },
                { name: 'Resume_SE_V1.pdf', score: 77, date: '4 days ago' }
              ].map((hist, idx) => (
                <div key={idx} className="flex justify-between items-center text-xs">
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
