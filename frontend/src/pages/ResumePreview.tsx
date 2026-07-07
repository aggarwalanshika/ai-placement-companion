import React, { useState } from 'react';
import { useResumeStore, WorkExperience, ProjectEntry } from '../store/resumeStore.js';
import axios from 'axios';
import { Sparkles, History, Trash2, X, Plus, FileText, ArrowRight, RotateCcw, RotateCw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function ResumePreview() {
  const {
    resumeText,
    resumeFileName,
    analysisResult,
    versions,
    candidateName,
    candidateEmail,
    candidatePhone,
    candidateLinks,
    history,
    future,
    undo,
    redo,
    saveVersion,
    deleteVersion,
    restoreVersion,
  } = useResumeStore();

  const [showSaveModal, setShowSaveModal] = useState(false);
  const [userNotes, setUserNotes] = useState('');
  const [toast, setToast] = useState<string | null>(null);
  
  const [isGenerated, setIsGenerated] = useState(false);

  const currentSections = analysisResult?.parsedSections;

  const showToastMsg = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const handleGenerate = () => {
    setIsGenerated(true);
    showToastMsg('Brand new ATS resume generated successfully!');
  };

  const handleExportPdf = async () => {
    if (!currentSections) return;
    try {
      showToastMsg('Preparing SDE PDF layout...');
      const response = await axios.post(
        '/api/resume/export/pdf',
        {
          name: candidateName,
          email: candidateEmail,
          phone: candidatePhone,
          links: candidateLinks,
          parsedSections: currentSections,
        },
        { responseType: 'blob' }
      );
      
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${resumeFileName?.replace(/\.[^/.]+$/, '') || 'Resume'}_optimized.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      showToastMsg('PDF exported successfully!');
    } catch (err: any) {
      console.error('PDF export error:', err);
      showToastMsg('Failed to generate PDF.');
    }
  };

  const handleExportDocx = async () => {
    if (!currentSections) return;
    try {
      showToastMsg('Preparing SDE Word layout...');
      const response = await axios.post(
        '/api/resume/export/docx',
        {
          name: candidateName,
          email: candidateEmail,
          phone: candidatePhone,
          links: candidateLinks,
          parsedSections: currentSections,
        },
        { responseType: 'blob' }
      );
      
      const blob = new Blob([response.data], { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${resumeFileName?.replace(/\.[^/.]+$/, '') || 'Resume'}_optimized.docx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      showToastMsg('DOCX exported successfully!');
    } catch (err: any) {
      console.error('DOCX export error:', err);
      showToastMsg('Failed to generate Word document.');
    }
  };

  const handleSaveVersionSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    saveVersion(userNotes);
    setUserNotes('');
    setShowSaveModal(false);
    showToastMsg('Revision saved successfully!');
  };

  const personalLinks = currentSections?.personal?.links || [candidateLinks];

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12 select-none">
      
      {/* Toast Alert System */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -20, x: '-50%' }}
            animate={{ opacity: 1, y: 0, x: '-50%' }}
            exit={{ opacity: 0, y: -20, x: '-50%' }}
            className="fixed top-6 left-1/2 -translate-x-1/2 z-50 px-4 py-2.5 bg-blue-600 text-xs font-bold text-white rounded-lg shadow-xl flex items-center gap-1.5 border border-blue-500"
          >
            <Sparkles className="w-4 h-4 text-yellow-300 animate-pulse" /> {toast}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header and Action controls */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-950 flex items-center gap-1.5">
            <Sparkles className="w-5 h-5 text-indigo-600" /> AI Resume Copilot Workspace
          </h1>
          <p className="text-slate-550 text-xs mt-0.5">Generate a professional, ATS-optimized resume directly from structured SDE profiles.</p>
        </div>

        {currentSections && (
          <div className="flex items-center gap-2">
            <button
              onClick={undo}
              disabled={history.length === 0}
              className={`p-2 rounded-lg border text-xs font-semibold flex items-center gap-1 transition-all ${
                history.length === 0
                  ? 'border-slate-200 text-slate-400 cursor-not-allowed'
                  : 'border-slate-200 hover:border-slate-350 bg-white text-slate-700'
              }`}
              title="Undo change"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={redo}
              disabled={future.length === 0}
              className={`p-2 rounded-lg border text-xs font-semibold flex items-center gap-1 transition-all ${
                future.length === 0
                  ? 'border-slate-200 text-slate-400 cursor-not-allowed'
                  : 'border-slate-200 hover:border-slate-350 bg-white text-slate-700'
              }`}
              title="Redo change"
            >
              <RotateCw className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setShowSaveModal(true)}
              className="flex items-center gap-1 px-3.5 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-xs font-semibold rounded-lg text-slate-700 transition-all shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" /> Save Revision
            </button>
          </div>
        )}
      </div>

      {!currentSections ? (
        <div className="p-12 border border-slate-200 bg-white rounded-2xl text-center space-y-4 max-w-xl mx-auto shadow-xs">
          <div className="mx-auto h-12 w-12 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-400">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900">No active resume loaded</h3>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              Upload a resume PDF or DOCX file to begin.
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          
          {/* Main workspace layout: Split panel between Reference & Preview */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Left Column: Original Reference Resume */}
            <div className="space-y-3">
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block flex items-center gap-1">
                <FileText className="w-3.5 h-3.5 text-slate-400" /> Original Uploaded Resume (Reference Only)
              </span>
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl h-[600px] overflow-y-auto font-mono text-[11px] leading-relaxed text-slate-700 whitespace-pre-wrap select-text selection:bg-blue-100">
                {resumeText || 'No text extracted.'}
              </div>
            </div>

            {/* Right Column: ATS Resume Preview Generator */}
            <div className="space-y-3">
              <div className="flex justify-between items-center h-5">
                <span className="text-[10px] text-indigo-600 font-bold uppercase tracking-wider block flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-indigo-600" /> Generated ATS Resume Preview
                </span>
                
                {isGenerated && (
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={handleExportDocx}
                      className="px-3 py-1 bg-white border border-slate-200 hover:bg-slate-50 text-[11px] font-bold rounded-lg text-slate-700 transition-all shadow-xs"
                    >
                      Download DOCX
                    </button>
                    <button
                      onClick={handleExportPdf}
                      className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-[11px] font-bold rounded-lg text-white transition-all shadow-xs"
                    >
                      Download PDF
                    </button>
                  </div>
                )}
              </div>

              {!isGenerated ? (
                /* Generator trigger panel */
                <div className="p-12 border border-slate-200 bg-white rounded-2xl text-center space-y-5 h-[600px] flex flex-col items-center justify-center shadow-xs">
                  <div className="h-10 w-10 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-400">
                    <Sparkles className="w-5 h-5 text-indigo-600 animate-pulse" />
                  </div>
                  <div className="max-w-xs">
                    <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Ready to generate ATS layout</h4>
                    <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                      Compiles a clean, SDE-aligned resume directly from your structured draft profile.
                    </p>
                  </div>
                  <button
                    onClick={handleGenerate}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-xs font-bold text-white rounded-lg shadow-sm transition-all flex items-center gap-1"
                  >
                    Generate Resume <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                /* Raw PDF Preview styled page mockup */
                <div className="bg-white border border-slate-250 rounded-2xl h-[600px] overflow-y-auto p-8 shadow-2xl text-slate-850 font-serif text-[11px] leading-relaxed select-text selection:bg-blue-100">
                  
                  {/* Personal Header */}
                  <div className="text-center space-y-1 pb-4 border-b border-slate-200">
                    <h2 className="text-lg font-bold text-slate-900 uppercase font-sans tracking-wide">
                      {currentSections?.personal?.name || candidateName}
                    </h2>
                    <div className="text-[10px] text-slate-550 font-sans">
                      {[
                        currentSections?.personal?.email || candidateEmail,
                        currentSections?.personal?.phone || candidatePhone,
                        ...personalLinks
                      ].filter(Boolean).join('   |   ')}
                    </div>
                  </div>

                  {/* Education */}
                  {currentSections?.education && currentSections.education.length > 0 && (
                    <div className="mt-4">
                      <h3 className="text-[11px] font-bold text-slate-900 uppercase font-sans border-b border-slate-200 pb-0.5 tracking-wider">
                        Education
                      </h3>
                      <div className="mt-1.5 space-y-1">
                        {currentSections.education.map((edu: string, idx: number) => (
                          <div key={idx} className="text-slate-700 font-sans text-[10px]">{edu}</div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Experience */}
                  {currentSections?.experience && currentSections.experience.length > 0 && (
                    <div className="mt-4">
                      <h3 className="text-[11px] font-bold text-slate-900 uppercase font-sans border-b border-slate-200 pb-0.5 tracking-wider">
                        Experience
                      </h3>
                      <div className="mt-2 space-y-3">
                        {currentSections.experience.map((exp: WorkExperience, idx: number) => (
                          <div key={idx} className="space-y-1">
                            <div className="flex justify-between items-baseline font-sans text-[10.5px]">
                              <span className="font-bold text-slate-900">{exp.role} — {exp.company}</span>
                              <span className="text-slate-500 italic text-[10px]">{exp.date}</span>
                            </div>
                            <ul className="list-disc list-inside pl-1 space-y-0.5 text-slate-700">
                              {exp.bullets?.map((b: string, bIdx: number) => (
                                <li key={bIdx} className="leading-relaxed pl-1 text-slate-700">{b}</li>
                              ))}
                            </ul>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Projects */}
                  {currentSections?.projects && currentSections.projects.length > 0 && (
                    <div className="mt-4">
                      <h3 className="text-[11px] font-bold text-slate-900 uppercase font-sans border-b border-slate-200 pb-0.5 tracking-wider">
                        Projects
                      </h3>
                      <div className="mt-2 space-y-3">
                        {currentSections.projects.map((proj: ProjectEntry, idx: number) => (
                          <div key={idx} className="space-y-1">
                            <div className="flex justify-between items-baseline font-sans text-[10.5px]">
                              <span className="font-bold text-slate-900">{proj.title} <span className="font-normal text-[10px] text-slate-550">[{proj.techStack}]</span></span>
                              <span className="text-slate-500 italic text-[10px]">{proj.date}</span>
                            </div>
                            <ul className="list-disc list-inside pl-1 space-y-0.5 text-slate-700">
                              {proj.bullets?.map((b: string, bIdx: number) => (
                                <li key={bIdx} className="leading-relaxed pl-1 text-slate-700">{b}</li>
                              ))}
                            </ul>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Skills */}
                  {currentSections?.skills && currentSections.skills.length > 0 && (
                    <div className="mt-4">
                      <h3 className="text-[11px] font-bold text-slate-900 uppercase font-sans border-b border-slate-200 pb-0.5 tracking-wider">
                        Skills
                      </h3>
                      <div className="mt-1.5 text-slate-700 font-sans text-[10.5px]">
                        {currentSections.skills.join(', ')}
                      </div>
                    </div>
                  )}

                  {/* Achievements */}
                  {currentSections?.achievements && currentSections.achievements.length > 0 && (
                    <div className="mt-4">
                      <h3 className="text-[11px] font-bold text-slate-900 uppercase font-sans border-b border-slate-200 pb-0.5 tracking-wider">
                        Achievements
                      </h3>
                      <ul className="mt-1.5 list-disc list-inside pl-1 space-y-0.5 text-slate-700">
                        {currentSections.achievements.map((ach: string, idx: number) => (
                          <li key={idx} className="pl-1">{ach}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Certifications */}
                  {currentSections?.certifications && currentSections.certifications.length > 0 && (
                    <div className="mt-4">
                      <h3 className="text-[11px] font-bold text-slate-900 uppercase font-sans border-b border-slate-200 pb-0.5 tracking-wider">
                        Certifications
                      </h3>
                      <ul className="mt-1.5 list-disc list-inside pl-1 space-y-0.5 text-slate-700">
                        {currentSections.certifications.map((cert: string, idx: number) => (
                          <li key={idx} className="pl-1">{cert}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                </div>
              )}
            </div>

          </div>

          {/* Revisions Log Table */}
          {versions.length > 0 && (
            <div className="p-6 bg-white border border-slate-200 rounded-2xl space-y-4 shadow-xs">
              <span className="text-xs font-extrabold text-slate-800 uppercase tracking-wider block flex items-center gap-1.5">
                <History className="w-4 h-4 text-indigo-600" /> Saved Revisions Log
              </span>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 text-slate-400 font-bold text-[10px] uppercase tracking-wider">
                      <th className="py-2.5 px-3">Revision Notes</th>
                      <th className="py-2.5 px-3">Timestamp</th>
                      <th className="py-2.5 px-3">ATS Score</th>
                      <th className="py-2.5 px-3 text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {versions.map((ver) => (
                      <tr key={ver.id} className="hover:bg-slate-50 text-slate-700 font-medium">
                        <td className="py-3 px-3 font-semibold text-slate-900">{ver.userNotes}</td>
                        <td className="py-3 px-3 text-slate-500 font-mono">{ver.timestamp}</td>
                        <td className="py-3 px-3">
                          <span className="font-bold text-green-600 font-mono bg-green-50 px-2 py-0.5 border border-green-200 rounded">
                            {ver.atsScore}%
                          </span>
                        </td>
                        <td className="py-3 px-3 text-center flex items-center justify-center gap-2">
                          <button
                            onClick={() => {
                              restoreVersion(ver.id);
                              showToastMsg('Restored successfully.');
                            }}
                            className="px-2.5 py-1 rounded bg-indigo-600 hover:bg-indigo-700 text-white font-bold transition-all text-[10px]"
                          >
                            Restore
                          </button>
                          <button
                            onClick={() => {
                              deleteVersion(ver.id);
                              showToastMsg('Revision deleted.');
                            }}
                            className="p-1 rounded text-red-500 hover:text-red-600 hover:bg-red-50 transition-all"
                            title="Delete version"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

        </div>
      )}

      {/* SAVE VERSION MODAL POPUP */}
      <AnimatePresence>
        {showSaveModal && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white border border-slate-200 rounded-2xl w-full max-w-sm p-6 shadow-2xl space-y-4"
            >
              <div className="flex justify-between items-center border-b border-slate-200 pb-2">
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Save Resume Revision</h3>
                <button onClick={() => setShowSaveModal(false)} className="text-slate-400 hover:text-slate-800">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleSaveVersionSubmit} className="space-y-4 text-xs">
                <div className="space-y-1.5">
                  <label className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">User Notes (Optional)</label>
                  <input
                    type="text"
                    value={userNotes}
                    onChange={(e) => setUserNotes(e.target.value)}
                    placeholder="e.g. Optimized experience bullet points"
                    className="w-full bg-slate-50 border border-slate-250 rounded-lg px-3 py-2 text-slate-900 placeholder-slate-450 focus:outline-none focus:border-indigo-500"
                    autoFocus
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowSaveModal(false)}
                    className="px-3.5 py-2 bg-white border border-slate-200 hover:bg-slate-50 font-semibold rounded-lg text-slate-600 transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 font-bold rounded-lg text-white transition-all shadow-xs"
                  >
                    Save Revision
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
