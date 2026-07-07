import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { History, FileText, Download, Calendar, Sparkles, AlertCircle, Loader } from 'lucide-react';
import { useResumeStore, ResumeVersion } from '../store/resumeStore.ts';
import { api } from '../services/api.ts';

export default function ResumeHistory() {
  const navigate = useNavigate();
  const versions = useResumeStore((state) => state.versions) || [];
  const setResumeData = useResumeStore((state) => state.setResumeData);

  const [toast, setToast] = useState<string | null>(null);
  const [isRescanning, setIsRescanning] = useState(false);

  const showToastMsg = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const handleDownload = async (ver: ResumeVersion, format: 'pdf' | 'docx') => {
    try {
      showToastMsg(`Downloading version ${ver.id.split('-')[1]} as ${format.toUpperCase()}...`);
      const response = await api.post(
        `/resume/export/${format}`,
        {
          name: ver.parsedSections.personal?.name,
          email: ver.parsedSections.personal?.email,
          phone: ver.parsedSections.personal?.phone,
          links: ver.parsedSections.personal?.links,
          parsedSections: ver.parsedSections,
        },
        { responseType: 'blob' }
      );
      
      const blob = new Blob([response.data], {
        type: format === 'pdf' ? 'application/pdf' : 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${ver.fileName.replace(/\.[^/.]+$/, '')}_v${ver.id.split('-')[1]}.${format}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      showToastMsg('Download completed successfully!');
    } catch (err) {
      console.error(err);
      showToastMsg('Failed to download document.');
    }
  };

  const handleRescan = async (ver: ResumeVersion) => {
    try {
      showToastMsg(`Re-scanning ${ver.fileName || 'stored resume'}...`);
      setIsRescanning(true);

      const text = ver.resumeText || '';
      const blob = new Blob([text], { type: 'text/plain' });
      const filename = ver.fileName || 'resume.pdf';
      const file = new File(
        [blob],
        filename.toLowerCase().endsWith('.txt') ? filename : `${filename}.txt`,
        { type: 'text/plain' }
      );
      
      const formData = new FormData();
      formData.append('resume', file);
      
      const response = await api.post('/resume/analyze', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      setResumeData(text, filename, response.data.data);
      showToastMsg('Re-scan completed successfully!');
      navigate('/resume-rewriter');
    } catch (err) {
      console.error(err);
      showToastMsg('Re-scan failed.');
    } finally {
      setIsRescanning(false);
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-10 relative select-none">
      
      {/* Toast Alert System */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -20, x: '-50%' }}
            animate={{ opacity: 1, y: 0, x: '-50%' }}
            exit={{ opacity: 0, y: -20, x: '-50%' }}
            className="fixed top-6 left-1/2 -translate-x-1/2 z-50 px-4 py-2.5 bg-blue-650 text-xs font-bold text-white rounded-lg shadow-xl flex items-center gap-1.5 border border-blue-500"
          >
            <Sparkles className="w-4 h-4 text-yellow-300 animate-pulse" /> {toast}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="flex justify-between items-center border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-955 flex items-center gap-1.5">
            <History className="w-5 h-5 text-indigo-600" /> Resume Version History
          </h1>
          <p className="text-slate-550 text-xs">Access all previously analyzed drafts and track how your ATS score has improved over time.</p>
        </div>
      </div>

      {isRescanning && (
        <div className="p-4 bg-slate-100 border border-slate-200 rounded-xl flex items-center gap-3 text-xs text-slate-700">
          <Loader className="animate-spin h-5 w-5 text-blue-650" />
          <span>Analyzing stored draft with Gemini models. Please wait...</span>
        </div>
      )}

      <div className="space-y-4">
        {versions.length === 0 ? (
          <div className="p-12 border border-slate-200 bg-white rounded-2xl text-center space-y-4 max-w-md mx-auto mt-8 shadow-xs">
            <AlertCircle className="mx-auto h-8 w-8 text-slate-400" />
            <div>
              <h3 className="text-sm font-semibold text-slate-900">No resume versions yet</h3>
              <p className="text-xs text-slate-550 mt-1">
                Upload your first resume to start tracking improvements.
              </p>
            </div>
          </div>
        ) : (
          versions.map((item, idx) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: idx * 0.05 }}
              className="p-5 bg-white border border-slate-200 rounded-2xl shadow-xs flex flex-wrap items-center justify-between gap-4 text-xs"
            >
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-450 flex-shrink-0">
                  <FileText className="w-5 h-5" />
                </div>
                <div className="space-y-1">
                  <span className="font-bold text-slate-900 block leading-tight">{item.fileName || 'resume.pdf'}</span>
                  <div className="flex flex-wrap items-center gap-3 text-[10px] text-slate-550 font-medium">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" /> {item.timestamp}
                    </span>
                    <span>•</span>
                    <span>Version: {item.id.replace('version-', 'v')}</span>
                    <span>•</span>
                    <span className="text-indigo-650 font-semibold">{item.userNotes || 'Optimized Draft'}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-6">
                <div className="text-right">
                  <span className="text-[10px] text-slate-450 block uppercase font-bold tracking-wide mb-0.5">ATS Score</span>
                  <span className="font-extrabold text-green-600 font-mono text-sm bg-green-50 px-2.5 py-0.5 border border-green-200 rounded">
                    {item.atsScore}%
                  </span>
                </div>
                
                <div className="flex gap-1.5">
                  <button
                    onClick={() => handleRescan(item)}
                    disabled={isRescanning}
                    className="flex items-center gap-1 px-3 py-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-[10px] font-bold rounded-lg transition-all disabled:opacity-50"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-indigo-600" /> Re-scan
                  </button>
                  <button
                    onClick={() => handleDownload(item, 'pdf')}
                    disabled={isRescanning}
                    className="flex items-center gap-1 px-3 py-1.5 bg-blue-650 hover:bg-blue-700 text-white text-[10px] font-bold rounded-lg transition-all disabled:opacity-50"
                  >
                    <Download className="w-3.5 h-3.5" /> PDF
                  </button>
                  <button
                    onClick={() => handleDownload(item, 'docx')}
                    disabled={isRescanning}
                    className="flex items-center gap-1 px-3 py-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-[10px] font-bold rounded-lg transition-all disabled:opacity-50"
                  >
                    <Download className="w-3.5 h-3.5" /> Word
                  </button>
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}
