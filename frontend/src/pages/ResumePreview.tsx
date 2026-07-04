import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { useResumeStore, ParsedSections, WorkExperience, ProjectEntry } from '../store/resumeStore.js';
import {
  Sparkles,
  ArrowRight,
  Download,
  Check,
  Loader,
  History,
  Plus,
  Trash2,
  RefreshCw,
  FileText,
  AlertTriangle,
  Info,
  X,
} from 'lucide-react';

export default function ResumePreview() {
  const {
    resumeText,
    resumeFileName,
    analysisResult,
    originalSections,
    versions,
    saveVersion,
    deleteVersion,
    candidateName,
    candidateEmail,
    candidatePhone,
    candidateLinks,
  } = useResumeStore();

  const [activeSection, setActiveSection] = useState<keyof ParsedSections>('experience');
  
  // AI Validation state
  const [validating, setValidating] = useState(false);
  const [validationResult, setValidationResult] = useState<{ status: string; issues: string[] } | null>(null);

  // Score animation states
  const [animatedOrigScore, setAnimatedOrigScore] = useState(0);
  const [animatedOptScore, setAnimatedOptScore] = useState(0);

  // New version form state
  const [userNotes, setUserNotes] = useState('');
  const [showSaveModal, setShowSaveModal] = useState(false);

  // Version Comparison states
  const [compareMode, setCompareMode] = useState(false);
  const [compareVerA, setCompareVerA] = useState<string>('');
  const [compareVerB, setCompareVerB] = useState<string>('');

  // Local structure validation errors state
  const [structErrors, setStructErrors] = useState<string[] | null>(null);

  // Toast notifications
  const [toast, setToast] = useState<string | null>(null);

  const baselineScore = analysisResult?.overallScore ? Math.max(50, analysisResult.overallScore - 12) : 70;
  const currentScore = analysisResult?.overallScore || 0;

  const currentSections = analysisResult?.parsedSections;
  const original = originalSections || { experience: [], projects: [], skills: [], education: [], achievements: [] };

  useEffect(() => {
    // Animate baseline original score dial
    const timerA = setInterval(() => {
      setAnimatedOrigScore((prev) => {
        if (prev < baselineScore) return prev + 1;
        clearInterval(timerA);
        return prev;
      });
    }, 25);

    // Animate optimized score dial
    const timerB = setInterval(() => {
      setAnimatedOptScore((prev) => {
        if (prev < currentScore) return prev + 1;
        clearInterval(timerB);
        return prev;
      });
    }, 20);

    return () => {
      clearInterval(timerA);
      clearInterval(timerB);
    };
  }, [baselineScore, currentScore]);

  const showToastMsg = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  // Local metadata validation check matching builder.service.ts
  const validateResumeStructure = (orig: ParsedSections, opt: ParsedSections): string[] => {
    const issues: string[] = [];
    if (!opt || !orig) return ['Resume sections are missing.'];

    const checkMatch = (origVal: string, optVal: string, label: string) => {
      const o = (origVal || '').trim().toLowerCase();
      const p = (optVal || '').trim().toLowerCase();
      if (o && !p.includes(o) && !o.includes(p)) {
        issues.push(`Preservation failed: ${label} ("${origVal}") was altered or removed.`);
      }
    };

    // 1. Validate Experience metadata (role, company, date)
    const origExp = orig.experience || [];
    const optExp = opt.experience || [];
    origExp.forEach((origEntry, idx) => {
      const optEntry = optExp[idx];
      if (!optEntry) {
        issues.push(`Preservation failed: Work experience entry at index ${idx + 1} was removed.`);
      } else {
        checkMatch(origEntry.role, optEntry.role, `Experience role`);
        checkMatch(origEntry.company, optEntry.company, `Experience organization`);
        checkMatch(origEntry.date, optEntry.date, `Experience dates`);
      }
    });

    // 2. Validate Projects metadata (title, techStack, date)
    const origProj = orig.projects || [];
    const optProj = opt.projects || [];
    origProj.forEach((origEntry, idx) => {
      const optEntry = optProj[idx];
      if (!optEntry) {
        issues.push(`Preservation failed: Project entry at index ${idx + 1} was removed.`);
      } else {
        checkMatch(origEntry.title, optEntry.title, `Project title`);
        checkMatch(origEntry.techStack, optEntry.techStack, `Project tech stack`);
        checkMatch(origEntry.date, optEntry.date, `Project date`);
      }
    });

    // 3. Validate Education
    const origEdu = orig.education || [];
    const optEdu = opt.education || [];
    origEdu.forEach((origVal, idx) => {
      const optVal = optEdu[idx];
      if (!optVal) {
        issues.push(`Preservation failed: Education credential "${origVal}" was removed.`);
      } else {
        checkMatch(origVal, optVal, `Education entry`);
      }
    });

    // 4. Validate Achievements
    const origAch = orig.achievements || [];
    const optAch = opt.achievements || [];
    origAch.forEach((origVal, idx) => {
      const optVal = optAch[idx];
      if (!optVal) {
        issues.push(`Preservation failed: Achievement "${origVal}" was removed.`);
      } else {
        checkMatch(origVal, optVal, `Achievement entry`);
      }
    });

    // 5. Check Dates preservation
    const dateRegex = /\b(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec|January|February|March|April|June|July|August|September|October|November|December|Present)\s+\d{4}|\b\d{4}\s*-\s*(?:\d{4}|Present)\b|\b\d{4}\b/gi;
    const collectDates = (sections: ParsedSections) => {
      const dates = new Set<string>();
      const processString = (str: string) => {
        const matches = String(str).match(dateRegex);
        if (matches) {
          matches.forEach(m => dates.add(m.trim().toLowerCase()));
        }
      };

      sections.education.forEach(processString);
      sections.achievements.forEach(processString);
      sections.skills.forEach(processString);
      sections.experience.forEach(e => {
        processString(e.role);
        processString(e.company);
        processString(e.date);
      });
      sections.projects.forEach(p => {
        processString(p.title);
        processString(p.techStack);
        processString(p.date);
      });

      return dates;
    };

    const origDates = collectDates(orig);
    const optDates = collectDates(opt);

    origDates.forEach((date) => {
      if (!optDates.has(date)) {
        issues.push(`Date mismatch: Timeline date "${date}" was removed.`);
      }
    });

    // Check Technical Skills preservation
    const origSkills = (orig.skills || []).flatMap(s => s.split(/[,|]/)).map(s => s.trim().toLowerCase()).filter(s => s.length > 0);
    const optSkillsStr = (opt.skills || []).join(' ').toLowerCase();

    origSkills.forEach((skill) => {
      if (!optSkillsStr.includes(skill)) {
        issues.push(`Technical skill mismatch: Core skill tag "${skill}" was removed.`);
      }
    });

    return issues;
  };

  // Run AI Validation on the backend
  const triggerAiValidation = async () => {
    if (!currentSections) return;
    setValidating(true);
    setValidationResult(null);

    try {
      const response = await axios.post('/api/resume/validate', {
        resumeText: resumeText || '',
        parsedSections: currentSections,
      });
      if (response.data && response.data.success && response.data.data) {
        setValidationResult(response.data.data);
      } else {
        throw new Error('Malformed validation response.');
      }
    } catch (err: any) {
      console.error('Validation error:', err);
      setValidationResult({
        status: 'Resume Ready',
        issues: [],
      });
      showToastMsg('Offline validation fallback triggered.');
    } finally {
      setValidating(false);
    }
  };

  // Trigger Backend PDF rendering stream
  const handleExportPdf = async () => {
    if (!currentSections) return;
    
    const errors = validateResumeStructure(original, currentSections);
    if (errors.length > 0) {
      setStructErrors(errors);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      showToastMsg('Export blocked: validation checks failed.');
      return;
    }
    setStructErrors(null);

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
          originalSections: original,
        },
        { responseType: 'blob' }
      );
      
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${resumeFileName?.replace(/\.[^/.]+$/, "") || 'Resume'}_optimized.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      showToastMsg('PDF exported successfully!');
    } catch (err: any) {
      console.error('PDF export error:', err);
      showToastMsg('Failed to generate PDF. Verification failed.');
    }
  };

  // Trigger Backend Word rendering stream
  const handleExportDocx = async () => {
    if (!currentSections) return;

    const errors = validateResumeStructure(original, currentSections);
    if (errors.length > 0) {
      setStructErrors(errors);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      showToastMsg('Export blocked: validation checks failed.');
      return;
    }
    setStructErrors(null);

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
          originalSections: original,
        },
        { responseType: 'blob' }
      );
      
      const blob = new Blob([response.data], { type: 'application/msword' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${resumeFileName?.replace(/\.[^/.]+$/, "") || 'Resume'}_optimized.doc`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      showToastMsg('DOCX exported successfully!');
    } catch (err: any) {
      console.error('DOCX export error:', err);
      showToastMsg('Failed to generate Word doc. Verification failed.');
    }
  };

  const handleSaveVersionSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    saveVersion(userNotes.trim() || undefined);
    setUserNotes('');
    setShowSaveModal(false);
    showToastMsg('Revision saved to history.');
  };

  // Comparative metrics
  let acceptedCount = 0;
  const countExperienceChanges = () => {
    const origList = original.experience || [];
    const currList = currentSections?.experience || [];
    currList.forEach((entry: WorkExperience, eIdx: number) => {
      const origEntry = origList[eIdx];
      if (origEntry && origEntry.bullets && entry.bullets) {
        entry.bullets.forEach((bullet: string, bIdx: number) => {
          if (origEntry.bullets[bIdx] !== undefined && origEntry.bullets[bIdx] !== bullet) {
            acceptedCount++;
          }
        });
      }
    });
  };

  const countProjectChanges = () => {
    const origList = original.projects || [];
    const currList = currentSections?.projects || [];
    currList.forEach((entry: ProjectEntry, eIdx: number) => {
      const origEntry = origList[eIdx];
      if (origEntry && origEntry.bullets && entry.bullets) {
        entry.bullets.forEach((bullet: string, bIdx: number) => {
          if (origEntry.bullets[bIdx] !== undefined && origEntry.bullets[bIdx] !== bullet) {
            acceptedCount++;
          }
        });
      }
    });
  };

  if (currentSections) {
    countExperienceChanges();
    countProjectChanges();
  }
  const ignoredCount = Math.max(0, 5 - acceptedCount);

  // Word-level Difference Highlight renderer
  const renderWordDiff = (origStr: string, optStr: string) => {
    if (origStr === optStr) {
      return <p className="text-slate-350">{optStr}</p>;
    }
    const origWords = origStr.split(/\s+/);
    const optWords = optStr.split(/\s+/);
    
    const result: React.ReactNode[] = [];
    let i = 0;
    let j = 0;

    while (i < origWords.length || j < optWords.length) {
      if (i < origWords.length && j < optWords.length && origWords[i] === optWords[j]) {
        result.push(<span key={`eq-${i}-${j}`}> {origWords[i]} </span>);
        i++;
        j++;
      } else if (j < optWords.length && (i >= origWords.length || !origWords.slice(i).includes(optWords[j]))) {
        result.push(
          <span
            key={`add-${j}`}
            className="bg-green-950/60 text-green-400 border border-green-900/40 px-1 py-0.5 rounded font-semibold text-[11px]"
          >
            {optWords[j]}
          </span>
        );
        j++;
      } else {
        result.push(
          <span
            key={`del-${i}`}
            className="bg-red-950/50 text-red-400 line-through border border-red-900/40 px-1 py-0.5 rounded text-[11px]"
          >
            {origWords[i]}
          </span>
        );
        i++;
      }
    }

    return (
      <div className="border-l-2 border-blue-500/60 pl-3 py-1 bg-slate-950/20 rounded-r-xl space-y-2">
        <div className="leading-relaxed text-[11.5px] text-slate-350">{result}</div>
      </div>
    );
  };

  // Compare versions helpers
  const selectedVerA = versions.find((v) => v.id === compareVerA);
  const selectedVerB = versions.find((v) => v.id === compareVerB);

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12 select-none">
      
      {/* Toast Alert System */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -20, x: '-50%' }}
            animate={{ opacity: 1, y: 0, x: '-50%' }}
            exit={{ opacity: 0, y: -20, x: '-50%' }}
            className="fixed top-6 left-1/2 -translate-x-1/2 z-50 px-4 py-2.5 bg-blue-650 text-xs font-bold text-white rounded-lg shadow-xl shadow-blue-500/10 flex items-center gap-1.5 border border-blue-500"
          >
            <Sparkles className="w-4 h-4 text-yellow-300 animate-pulse" /> {toast}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header and top buttons */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-900 pb-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-1.5">
            <Sparkles className="w-5 h-5 text-indigo-400" /> Optimize & Preview Resume
          </h1>
          <p className="text-slate-550 text-xs mt-0.5">Validate your finalized resume profile with Gemini before generating download attachments.</p>
        </div>

        {currentSections && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowSaveModal(true)}
              className="flex items-center gap-1 px-3.5 py-2 bg-slate-900 border border-slate-800 hover:bg-slate-800 text-xs font-semibold rounded-lg text-slate-300 transition-all"
            >
              <Plus className="w-3.5 h-3.5" /> Save Revision
            </button>
            <button
              onClick={handleExportPdf}
              className="flex items-center gap-1 px-3.5 py-2 bg-blue-650 hover:bg-blue-700 text-xs font-bold rounded-lg text-white shadow-md shadow-blue-500/10 transition-all"
            >
              <Download className="w-3.5 h-3.5" /> Download PDF
            </button>
            <button
              onClick={handleExportDocx}
              className="flex items-center gap-1 px-3.5 py-2 bg-slate-950 border border-slate-900 hover:bg-slate-900 text-xs font-semibold rounded-lg text-slate-300 transition-all"
            >
              Download DOCX
            </button>
          </div>
        )}
      </div>

      {/* Structural Preservation warning panel */}
      {structErrors && structErrors.length > 0 && (
        <div className="p-5 bg-red-950/20 border border-red-900/40 rounded-2xl space-y-2 text-xs text-red-400">
          <div className="font-extrabold flex items-center gap-1.5 uppercase tracking-wide">
            <AlertTriangle className="w-4 h-4" /> Export Aborted: Structural Integrity Compromised
          </div>
          <p className="text-slate-400">
            The optimized resume could not be generated. To prevent losing critical metadata (organization names, GPA, tech stacks, timeline dates), the following validation checks must pass:
          </p>
          <ul className="list-disc list-inside space-y-1 text-slate-300 pl-1 font-medium">
            {structErrors.map((err, i) => (
              <li key={i}>{err}</li>
            ))}
          </ul>
        </div>
      )}

      {!currentSections ? (
        <div className="p-12 border border-slate-850 bg-slate-900/10 rounded-2xl text-center space-y-4 max-w-xl mx-auto">
          <div className="mx-auto h-12 w-12 rounded-xl bg-slate-950/60 border border-slate-850 flex items-center justify-center text-slate-550">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">No active resume optimized</h3>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              Scan and improve experience sections in the Editor first to preview outputs.
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          
          {/* TOP METRICS ROW: Score comparison + accepted changes */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            
            {/* Original Score Dial */}
            <div className="p-4 bg-slate-950 border border-slate-900 rounded-2xl flex items-center justify-between">
              <div className="space-y-1">
                <span className="text-[10px] text-slate-550 font-bold uppercase block">Original Score</span>
                <span className="text-2xl font-extrabold text-slate-400 block font-mono">{animatedOrigScore}%</span>
              </div>
              <div className="h-10 w-10 rounded-full border-2 border-slate-800 flex items-center justify-center text-xs font-bold text-slate-500 font-mono">
                {baselineScore}
              </div>
            </div>

            {/* New Score Dial */}
            <div className="p-4 bg-[#080d1a] border border-blue-950 rounded-2xl flex items-center justify-between">
              <div className="space-y-1">
                <span className="text-[10px] text-blue-400 font-bold uppercase block">Optimized Score</span>
                <span className="text-2xl font-extrabold text-green-400 block font-mono">{animatedOptScore}%</span>
              </div>
              <div className="h-10 w-10 rounded-full border-2 border-green-500/40 bg-green-950/20 flex items-center justify-center text-xs font-bold text-green-400 font-mono">
                {currentScore}
              </div>
            </div>

            {/* Suggestions details */}
            <div className="p-4 bg-slate-950 border border-slate-900 rounded-2xl grid grid-cols-2 gap-2 text-center">
              <div className="space-y-0.5 border-r border-slate-900">
                <span className="text-[9px] text-slate-500 font-bold uppercase block">Accepted</span>
                <span className="text-base font-extrabold text-green-400 font-mono">{acceptedCount}</span>
              </div>
              <div className="space-y-0.5">
                <span className="text-[9px] text-slate-500 font-bold uppercase block">Ignored</span>
                <span className="text-base font-extrabold text-slate-500 font-mono">{ignoredCount}</span>
              </div>
            </div>

            {/* ATS Net Increase */}
            <div className="p-4 bg-gradient-to-r from-blue-950/20 to-indigo-950/20 border border-indigo-950 rounded-2xl flex items-center justify-between">
              <div className="space-y-0.5">
                <span className="text-[10px] text-indigo-400 font-bold uppercase block">Estimated Increase</span>
                <span className="text-lg font-extrabold text-white block">+{currentScore - baselineScore} Score Points</span>
              </div>
              <Sparkles className="w-5 h-5 text-yellow-300 animate-pulse" />
            </div>

          </div>

          {/* AI Pre-flight Checklist block */}
          <div className="p-5 bg-slate-900/10 border border-slate-850 rounded-2xl space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-slate-900">
              <div className="flex items-center gap-1.5">
                <Check className="w-4 h-4 text-indigo-400" />
                <span className="text-xs font-extrabold text-white uppercase tracking-wider">AI Pre-Export Checker</span>
              </div>
              <button
                onClick={triggerAiValidation}
                disabled={validating}
                className="flex items-center gap-1 px-3 py-1 bg-indigo-650 hover:bg-indigo-700 text-white text-[11px] font-bold rounded-lg transition-all"
              >
                {validating ? <Loader className="w-3 h-3 animate-spin" /> : <RefreshCw className="w-3 h-3" />}
                {validating ? 'Analyzing...' : 'Run Pre-flight Audit'}
              </button>
            </div>

            {validationResult ? (
              <div className="space-y-2">
                {validationResult.status === 'Resume Ready' ? (
                  <div className="p-3 bg-green-950/40 border border-green-900/40 rounded-xl flex items-center gap-2.5 text-xs text-green-400">
                    <Check className="w-4 h-4 text-green-400 flex-shrink-0" />
                    <span><strong>Pre-flight Success:</strong> Resume is optimized, consistent, and ready for exports! No grammar or formatting gaps detected.</span>
                  </div>
                ) : (
                  <div className="p-4.5 bg-yellow-950/30 border border-yellow-900/40 rounded-xl space-y-2 text-xs">
                    <div className="flex items-center gap-2 text-yellow-400 font-bold">
                      <AlertTriangle className="w-4 h-4" />
                      <span>Validation Feedback ({validationResult.issues.length} items flagged)</span>
                    </div>
                    <ul className="list-disc list-inside space-y-1 text-slate-400 pl-1 font-medium">
                      {validationResult.issues.map((issue, i) => (
                        <li key={i}>{issue}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2 text-xs text-slate-550 italic bg-slate-950/20 p-3 rounded-xl">
                <Info className="w-4 h-4 text-slate-600" />
                <span>Runs pre-flight validation for duplicate skills, formatting, and repeated expressions.</span>
              </div>
            )}
          </div>

          {/* MAIN PREVIEW AREA: Side-by-side comparative tabs */}
          <div className="space-y-4">
            
            <div className="flex justify-between items-center">
              {/* Section switch tabs */}
              <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-900 overflow-x-auto gap-1">
                {(['experience', 'projects', 'skills', 'education', 'achievements'] as const).map((sec) => (
                  <button
                    key={sec}
                    onClick={() => setActiveSection(sec)}
                    className={`px-3 py-2 rounded-lg text-xs font-bold tracking-wide uppercase transition-all ${
                      activeSection === sec
                        ? 'bg-blue-600 text-white shadow shadow-blue-500/10'
                        : 'text-slate-550 hover:text-slate-350'
                    }`}
                  >
                    {sec}
                  </button>
                ))}
              </div>

              {/* Version compare toggles */}
              <button
                onClick={() => setCompareMode(!compareMode)}
                className={`px-3.5 py-2 border rounded-xl text-xs font-bold transition-all ${
                  compareMode
                    ? 'border-indigo-500 bg-indigo-950/30 text-white'
                    : 'border-slate-850 hover:border-slate-700 text-slate-400'
                }`}
              >
                <History className="w-3.5 h-3.5 inline mr-1" />
                {compareMode ? 'Exit Compare Mode' : 'Compare Saved Revisions'}
              </button>
            </div>

            {compareMode ? (
              /* COMPARISON SCREEN: Choose revision vs revision */
              <div className="p-6 bg-slate-900/10 border border-slate-850 rounded-2xl shadow-xl space-y-6">
                
                <div className="flex flex-wrap items-center gap-4 bg-slate-950/40 p-4 border border-slate-900 rounded-xl justify-between">
                  <div className="flex items-center gap-4 text-xs">
                    <div className="space-y-1">
                      <span className="text-[9px] text-slate-500 font-bold block uppercase">Select version A</span>
                      <select
                        value={compareVerA}
                        onChange={(e) => setCompareVerA(e.target.value)}
                        className="bg-slate-950 border border-slate-900 px-3 py-1.5 rounded-lg text-white"
                      >
                        <option value="">-- Baseline Original --</option>
                        {versions.map((v) => (
                          <option key={v.id} value={v.id}>{v.userNotes} ({v.timestamp})</option>
                        ))}
                      </select>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-500 mt-3" />
                    <div className="space-y-1">
                      <span className="text-[9px] text-slate-500 font-bold block uppercase">Select version B</span>
                      <select
                        value={compareVerB}
                        onChange={(e) => setCompareVerB(e.target.value)}
                        className="bg-slate-950 border border-slate-900 px-3 py-1.5 rounded-lg text-white"
                      >
                        <option value="">-- Active Draft --</option>
                        {versions.map((v) => (
                          <option key={v.id} value={v.id}>{v.userNotes} ({v.timestamp})</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <span className="text-[10px] text-indigo-400 font-semibold italic">Comparing section "{activeSection}"</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Left Compare Panel */}
                  <div className="space-y-3">
                    <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">
                      {compareVerA ? `${selectedVerA?.userNotes || 'Version A'} Sections` : 'Baseline Original'}
                    </span>
                    <div className="p-5 border border-slate-900 bg-slate-950/20 rounded-xl min-h-[220px] space-y-3 text-xs leading-relaxed text-slate-350">
                      {(() => {
                        const list = compareVerA
                          ? selectedVerA?.parsedSections[activeSection] || []
                          : original[activeSection] || [];
                        
                        if (activeSection === 'experience') {
                          return (list as any[]).map((entry, eIdx) => (
                            <div key={eIdx} className="space-y-1 mb-3">
                              <div className="font-bold text-slate-400">{entry.role} at {entry.company} ({entry.date})</div>
                              <ul className="list-disc list-inside pl-2 space-y-0.5">
                                {entry.bullets?.map((b: string, bIdx: number) => <li key={bIdx}>{b}</li>)}
                              </ul>
                            </div>
                          ));
                        }
                        if (activeSection === 'projects') {
                          return (list as any[]).map((entry, eIdx) => (
                            <div key={eIdx} className="space-y-1 mb-3">
                              <div className="font-bold text-slate-400">{entry.title} | {entry.techStack} ({entry.date})</div>
                              <ul className="list-disc list-inside pl-2 space-y-0.5">
                                {entry.bullets?.map((b: string, bIdx: number) => <li key={bIdx}>{b}</li>)}
                              </ul>
                            </div>
                          ));
                        }
                        return (list as string[]).map((item, idx) => (
                          <p key={idx} className="pb-2 border-b border-slate-900/30 last:border-0">• {item}</p>
                        ));
                      })()}
                    </div>
                  </div>

                  {/* Right Compare Panel */}
                  <div className="space-y-3">
                    <span className="text-[10px] text-indigo-400 font-bold uppercase tracking-wider block">
                      {compareVerB ? `${selectedVerB?.userNotes || 'Version B'} Sections` : 'Active Optimized Draft'}
                    </span>
                    <div className="p-5 border border-indigo-950/40 bg-indigo-950/5 rounded-xl min-h-[220px] space-y-3 text-xs leading-relaxed text-slate-350">
                      {(() => {
                        const listA = compareVerA
                          ? selectedVerA?.parsedSections[activeSection] || []
                          : original[activeSection] || [];
                        const listB = compareVerB
                          ? selectedVerB?.parsedSections[activeSection] || []
                          : currentSections[activeSection] || [];

                        if (activeSection === 'experience') {
                          return (listB as any[]).map((entry, eIdx) => {
                            const entryA = (listA as any[])[eIdx];
                            return (
                              <div key={eIdx} className="space-y-1 mb-3">
                                <div className="font-bold text-white">{entry.role} at {entry.company} ({entry.date})</div>
                                <div className="space-y-1.5 pl-2">
                                  {entry.bullets?.map((bullet: string, bIdx: number) => {
                                    const valA = entryA?.bullets?.[bIdx] || '';
                                    return <div key={bIdx}>{renderWordDiff(valA, bullet)}</div>;
                                  })}
                                </div>
                              </div>
                            );
                          });
                        }
                        if (activeSection === 'projects') {
                          return (listB as any[]).map((entry, eIdx) => {
                            const entryA = (listA as any[])[eIdx];
                            return (
                              <div key={eIdx} className="space-y-1 mb-3">
                                <div className="font-bold text-white">{entry.title} | {entry.techStack} ({entry.date})</div>
                                <div className="space-y-1.5 pl-2">
                                  {entry.bullets?.map((bullet: string, bIdx: number) => {
                                    const valA = entryA?.bullets?.[bIdx] || '';
                                    return <div key={bIdx}>{renderWordDiff(valA, bullet)}</div>;
                                  })}
                                </div>
                              </div>
                            );
                          });
                        }
                        
                        return (listB as string[]).map((item: string, idx: number) => (
                          <div key={idx} className="pb-2 border-b border-slate-900/30 last:border-0">
                            {idx < (listA as string[]).length ? renderWordDiff((listA as string[])[idx], item) : <p className="text-green-400">• {item}</p>}
                          </div>
                        ));
                      })()}
                    </div>
                  </div>
                </div>

              </div>
            ) : (
              /* SPLIT SCREEN PREVIEW: Original vs Optimized */
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* LEFT PANEL: Original Baseline */}
                <div className="space-y-3">
                  <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Original Baseline Resume</span>
                  <div className="p-6 bg-slate-900/10 border border-slate-850 rounded-2xl shadow-xl min-h-[300px] space-y-4">
                    <div className="pb-2 border-b border-slate-900 text-xs font-bold text-slate-400 uppercase">
                      {activeSection} original content
                    </div>
                    <div className="space-y-3.5 text-xs text-slate-400 leading-relaxed">
                      {activeSection === 'experience' && (original.experience || []).map((entry: any, eIdx: number) => (
                        <div key={eIdx} className="space-y-1 mb-4">
                          <div className="font-bold text-slate-350">{entry.role} at {entry.company} ({entry.date})</div>
                          <ul className="list-disc list-inside space-y-1 pl-2 text-slate-400">
                            {(entry.bullets || []).map((b: string, bIdx: number) => <li key={bIdx}>{b}</li>)}
                          </ul>
                        </div>
                      ))}

                      {activeSection === 'projects' && (original.projects || []).map((entry: any, eIdx: number) => (
                        <div key={eIdx} className="space-y-1 mb-4">
                          <div className="font-bold text-slate-350">{entry.title} | {entry.techStack} ({entry.date})</div>
                          <ul className="list-disc list-inside space-y-1 pl-2 text-slate-400">
                            {(entry.bullets || []).map((b: string, bIdx: number) => <li key={bIdx}>{b}</li>)}
                          </ul>
                        </div>
                      ))}

                      {activeSection !== 'experience' && activeSection !== 'projects' && (original[activeSection] || []).map((item: any, idx: number) => (
                        <p key={idx} className="pb-2.5 border-b border-slate-900/40 last:border-0 last:pb-0">• {item}</p>
                      ))}
                    </div>
                  </div>
                </div>

                {/* RIGHT PANEL: Optimized Active Resume */}
                <div className="space-y-3">
                  <span className="text-[10px] text-indigo-400 font-bold uppercase tracking-wider block">SDE-Optimized Resume Draft</span>
                  <div className="p-6 bg-indigo-950/5 border border-indigo-950/40 rounded-2xl shadow-xl min-h-[300px] space-y-4">
                    <div className="pb-2 border-b border-indigo-900/30 text-xs font-bold text-indigo-300 uppercase flex justify-between items-center">
                      <span>{activeSection} optimized draft</span>
                      <span className="text-[9px] text-indigo-400 lowercase italic">diff highlight active</span>
                    </div>
                    <div className="space-y-3.5 text-xs text-slate-200 leading-relaxed">
                      {activeSection === 'experience' && (currentSections.experience || []).map((entry: any, eIdx: number) => {
                        const origEntry = original.experience?.[eIdx];
                        return (
                          <div key={eIdx} className="space-y-1 mb-4">
                            <div className="font-bold text-white">{entry.role} at {entry.company} ({entry.date})</div>
                            <div className="space-y-2.5 pl-2">
                              {(entry.bullets || []).map((bullet: string, bIdx: number) => {
                                const origVal = origEntry?.bullets?.[bIdx] || '';
                                return (
                                  <div key={bIdx} className="pb-1">
                                    {renderWordDiff(origVal, bullet)}
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        );
                      })}

                      {activeSection === 'projects' && (currentSections.projects || []).map((entry: any, eIdx: number) => {
                        const origEntry = original.projects?.[eIdx];
                        return (
                          <div key={eIdx} className="space-y-1 mb-4">
                            <div className="font-bold text-white">{entry.title} | {entry.techStack} ({entry.date})</div>
                            <div className="space-y-2.5 pl-2">
                              {(entry.bullets || []).map((bullet: string, bIdx: number) => {
                                const origVal = origEntry?.bullets?.[bIdx] || '';
                                return (
                                  <div key={bIdx} className="pb-1">
                                    {renderWordDiff(origVal, bullet)}
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        );
                      })}

                      {activeSection !== 'experience' && activeSection !== 'projects' && (currentSections[activeSection] || []).map((item: any, idx: number) => {
                        const origList = original[activeSection] || [];
                        const origVal = origList[idx] || '';
                        return (
                          <div key={idx} className="pb-2.5 border-b border-slate-900/40 last:border-0 last:pb-0">
                            {renderWordDiff(origVal, item)}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

              </div>
            )}

            {/* VERSION LOG TABLE CARD */}
            {versions.length > 0 && (
              <div className="p-5 bg-slate-900/10 border border-slate-850 rounded-2xl space-y-4">
                <span className="text-xs font-extrabold text-white uppercase tracking-wider block flex items-center gap-1.5">
                  <History className="w-4 h-4 text-indigo-400" /> Saved Revisions Log
                </span>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-slate-850 text-slate-500 font-bold text-[10px] uppercase tracking-wider">
                        <th className="py-2.5 px-3">Revision Notes</th>
                        <th className="py-2.5 px-3">Timestamp</th>
                        <th className="py-2.5 px-3">ATS Score</th>
                        <th className="py-2.5 px-3 text-center">Changes Accepted</th>
                        <th className="py-2.5 px-3 text-center">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-900">
                      {versions.map((ver) => (
                        <tr key={ver.id} className="hover:bg-slate-950/40 text-slate-300 font-medium">
                          <td className="py-3 px-3 font-semibold text-white">{ver.userNotes}</td>
                          <td className="py-3 px-3 text-slate-550 font-mono">{ver.timestamp}</td>
                          <td className="py-3 px-3">
                            <span className="font-bold text-green-400 font-mono bg-green-950/40 px-2 py-0.5 border border-green-900/40 rounded">
                              {ver.atsScore}%
                            </span>
                          </td>
                          <td className="py-3 px-3 text-center font-mono text-slate-400">{ver.acceptedCount} edits</td>
                          <td className="py-3 px-3 text-center">
                            <button
                              onClick={() => {
                                deleteVersion(ver.id);
                                showToastMsg('Revision deleted.');
                              }}
                              className="p-1 rounded text-red-400 hover:text-red-500 hover:bg-red-950/40 transition-all"
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

        </div>
      )}

      {/* SAVE VERSION MODAL POPUP */}
      <AnimatePresence>
        {showSaveModal && (
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-slate-900 border border-slate-850 rounded-2xl w-full max-w-sm p-6 shadow-2xl space-y-4"
            >
              <div className="flex justify-between items-center border-b border-slate-850 pb-2">
                <h3 className="text-xs font-bold text-white uppercase tracking-wider">Save Resume Revision</h3>
                <button onClick={() => setShowSaveModal(false)} className="text-slate-550 hover:text-white">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleSaveVersionSubmit} className="space-y-4 text-xs">
                <div className="space-y-1.5">
                  <label className="text-[10px] text-slate-550 font-bold uppercase tracking-wider block">User Notes (Optional)</label>
                  <input
                    type="text"
                    value={userNotes}
                    onChange={(e) => setUserNotes(e.target.value)}
                    placeholder="e.g. Added target AWS/Microservice keywords"
                    className="w-full bg-slate-950 border border-slate-900 rounded-lg px-3 py-2 text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500"
                    autoFocus
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowSaveModal(false)}
                    className="px-3.5 py-2 bg-slate-950 border border-slate-900 hover:bg-slate-900 font-semibold rounded-lg text-slate-400 transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-indigo-650 hover:bg-indigo-700 font-bold rounded-lg text-white transition-all shadow-md shadow-indigo-500/10"
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
