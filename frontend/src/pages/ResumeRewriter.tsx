import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { useResumeStore, ParsedSections } from '../store/resumeStore.js';
import {
  Sparkles,
  Undo2,
  Redo2,
  Check,
  X,
  Edit2,
  ChevronRight,
  Info,
  FileText,
  Clock,
  Loader,
} from 'lucide-react';

interface SuggestionState {
  original: string;
  improved: string;
  reason: string;
  estimatedAtsImprovement: number;
}

export default function ResumeRewriter() {
  const navigate = useNavigate();
  const {
    resumeText,
    analysisResult,
    history,
    future,
    updateParsedSection,
    undo,
    redo,
  } = useResumeStore();

  const [activeSection, setActiveSection] = useState<keyof ParsedSections>('experience');
  const [activeIndex, setActiveIndex] = useState<number>(0);
  const [loadingSuggestion, setLoadingSuggestion] = useState(false);
  const [activeSuggestion, setActiveSuggestion] = useState<SuggestionState | null>(null);
  
  // Custom suggestion cache to avoid calling Gemini repeatedly for same index
  const [suggestionCache, setSuggestionCache] = useState<Record<string, SuggestionState>>({});
  
  // Inline edit state
  const [isEditing, setIsEditing] = useState(false);
  const [editedText, setEditedText] = useState('');

  // Toast notifications
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  
  // Score count animation state
  const [animatedScore, setAnimatedScore] = useState(0);

  // Candidate contact details inputs (loaded dynamically from resumeText if present)
  const [candidateName, setCandidateName] = useState('Anshika Aggarwal');
  const [candidateEmail, setCandidateEmail] = useState('aggarwalanshika4@gmail.com');
  const [candidatePhone, setCandidatePhone] = useState('+91-8707881770');
  const [candidateLinks, setCandidateLinks] = useState('LinkedIn | LeetCode | GitHub');

  const parsedSections = analysisResult?.parsedSections;
  const overallScore = analysisResult?.overallScore || 0;

  // Extract contact info dynamically from resume text on load
  useEffect(() => {
    if (resumeText) {
      const emailMatch = resumeText.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
      if (emailMatch) setCandidateEmail(emailMatch[0]);

      const phoneMatch = resumeText.match(/(\+?\d{1,3}[-.\s]?)?\d{10}/);
      if (phoneMatch) setCandidatePhone(phoneMatch[0]);

      // Grab first non-empty line as name candidate
      const lines = resumeText.split('\n').map(l => l.trim()).filter(l => l.length > 0);
      if (lines.length > 0) {
        const potentialName = lines[0];
        if (potentialName.length < 50 && !potentialName.includes('@')) {
          setCandidateName(potentialName);
        }
      }
    }
  }, [resumeText]);

  // Sync animated score count-up
  useEffect(() => {
    if (overallScore !== animatedScore) {
      const diff = overallScore - animatedScore;
      if (diff === 0) return;
      const step = diff > 0 ? 1 : -1;
      const timer = setInterval(() => {
        setAnimatedScore((prev) => {
          const next = prev + step;
          if (next === overallScore) {
            clearInterval(timer);
          }
          return next;
        });
      }, 30);
      return () => clearInterval(timer);
    }
  }, [overallScore, animatedScore]);

  // Load suggestion whenever active bullet index changes
  useEffect(() => {
    if (!parsedSections) return;
    const bullets = parsedSections[activeSection] || [];
    const bullet = bullets[activeIndex];
    
    if (!bullet) {
      setActiveSuggestion(null);
      return;
    }

    const cacheKey = `${activeSection}-${activeIndex}-${bullet}`;
    if (suggestionCache[cacheKey]) {
      setActiveSuggestion(suggestionCache[cacheKey]);
      setIsEditing(false);
    } else {
      setActiveSuggestion(null);
      setIsEditing(false);
    }
  }, [activeSection, activeIndex, parsedSections, suggestionCache]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Call backend POST /api/resume/rewrite
  const fetchSuggestion = async () => {
    if (!parsedSections) return;
    const bullets = parsedSections[activeSection] || [];
    const bullet = bullets[activeIndex];
    if (!bullet) return;

    setLoadingSuggestion(true);
    setActiveSuggestion(null);

    try {
      const response = await axios.post('/api/resume/rewrite', {
        resumeText: resumeText || '',
        section: activeSection,
        bulletPoint: bullet,
      });

      if (response.data && response.data.success && response.data.data) {
        const data = response.data.data;
        const cacheKey = `${activeSection}-${activeIndex}-${bullet}`;
        
        const suggestion: SuggestionState = {
          original: bullet,
          improved: data.improved,
          reason: data.reason,
          estimatedAtsImprovement: data.estimatedAtsImprovement || 5,
        };

        setSuggestionCache((prev) => ({ ...prev, [cacheKey]: suggestion }));
        setActiveSuggestion(suggestion);
        setEditedText(data.improved);
      } else {
        throw new Error('API returned malformed suggestion details.');
      }
    } catch (err: any) {
      console.error('Fetch suggestion error:', err);
      // Fallback generator
      const fallbackSuggestion = {
        original: bullet,
        improved: `Engineered highly optimal ${bullet.replace(/^(did|worked on|helped|coordinate|coordinated)/i, 'Microservices')} - optimizing pipeline throughput by 32% and reducing average latency by 18%.`,
        reason: 'Swapped weak action verb with a strong engineering term and attached quantitative metrics for better ATS matching.',
        estimatedAtsImprovement: 6,
      };
      const cacheKey = `${activeSection}-${activeIndex}-${bullet}`;
      setSuggestionCache((prev) => ({ ...prev, [cacheKey]: fallbackSuggestion }));
      setActiveSuggestion(fallbackSuggestion);
      setEditedText(fallbackSuggestion.improved);
      showToast('Offline fallback suggestion generated.');
    } finally {
      setLoadingSuggestion(false);
    }
  };

  const handleAccept = () => {
    if (!activeSuggestion || !parsedSections) return;
    const textToMerge = isEditing ? editedText : activeSuggestion.improved;
    
    // Call Zustand store update action
    updateParsedSection(
      activeSection,
      activeIndex,
      textToMerge,
      activeSuggestion.estimatedAtsImprovement
    );

    setIsEditing(false);
    showToast('AI suggestion merged successfully!');
  };

  const handleReject = () => {
    setActiveSuggestion(null);
    showToast('Suggestion dismissed.');
  };

  // Word alignment diff markup generator
  const renderDiff = (original: string, improved: string) => {
    const origWords = original.split(/\s+/);
    const impWords = improved.split(/\s+/);
    
    const result: React.ReactNode[] = [];
    let i = 0;
    let j = 0;

    while (i < origWords.length || j < impWords.length) {
      if (i < origWords.length && j < impWords.length && origWords[i] === impWords[j]) {
        result.push(<span key={`eq-${i}-${j}`}> {origWords[i]} </span>);
        i++;
        j++;
      } else if (j < impWords.length && (i >= origWords.length || !origWords.slice(i).includes(impWords[j]))) {
        // added word
        result.push(
          <span
            key={`add-${j}`}
            className="bg-green-950/60 text-green-400 border border-green-900/40 px-1.5 py-0.5 rounded font-semibold text-[11px]"
          >
            {impWords[j]}
          </span>
        );
        j++;
      } else {
        // removed word
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

    return <div className="leading-relaxed text-xs text-slate-200 mt-2 bg-slate-950/40 p-4 border border-slate-900 rounded-xl">{result}</div>;
  };



  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-10 select-none">
      
      {/* Toast Alert System */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20, x: '-50%' }}
            animate={{ opacity: 1, y: 0, x: '-50%' }}
            exit={{ opacity: 0, y: -20, x: '-50%' }}
            className="fixed top-6 left-1/2 -translate-x-1/2 z-50 px-4 py-2.5 bg-blue-650 text-xs font-bold text-white rounded-lg shadow-xl shadow-blue-500/10 flex items-center gap-1.5 border border-blue-500"
          >
            <Sparkles className="w-4 h-4 text-yellow-300 animate-pulse" /> {toastMessage}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header Panel */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-900 pb-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-1.5">
            <Sparkles className="w-5 h-5 text-indigo-400" /> AI Resume Editor
          </h1>
          <p className="text-slate-550 text-xs mt-0.5">Select experience or project descriptions on the left panel to scan and refactor them with Gemini.</p>
        </div>

        {/* Undo/Redo/Export row */}
        {parsedSections && (
          <div className="flex items-center gap-4">
            {/* Undo/Redo buttons */}
            <div className="flex items-center bg-slate-900/50 border border-slate-850 p-1 rounded-xl gap-1">
              <button
                onClick={undo}
                disabled={history.length === 0}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                title="Undo Action"
              >
                <Undo2 className="w-4 h-4" />
              </button>
              <button
                onClick={redo}
                disabled={future.length === 0}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                title="Redo Action"
              >
                <Redo2 className="w-4 h-4" />
              </button>
            </div>

            {/* Score Dial */}
            <div className="flex items-center gap-3 bg-slate-950 border border-slate-850 px-4 py-1.5 rounded-xl text-xs">
              <span className="text-slate-500 font-bold uppercase tracking-wider text-[9px]">ATS score</span>
              <span className="font-extrabold text-green-400 font-mono text-sm bg-green-950/40 px-2 py-0.5 border border-green-900/40 rounded">
                {animatedScore}%
              </span>
            </div>

            {/* Transition to Preview page */}
            <div className="flex gap-2">
              <button
                onClick={() => navigate('/resume-preview')}
                className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-blue-650 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-xs font-bold rounded-lg text-white transition-all shadow-md shadow-blue-500/10"
              >
                <Sparkles className="w-3.5 h-3.5 text-yellow-300" /> Preview & Export Resume
              </button>
            </div>
          </div>
        )}
      </div>

      {!parsedSections ? (
        <div className="p-12 border border-slate-850 bg-slate-900/10 rounded-2xl text-center space-y-4 max-w-xl mx-auto">
          <div className="mx-auto h-12 w-12 rounded-xl bg-slate-950/60 border border-slate-850 flex items-center justify-center text-slate-550">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">No active resume analyzed</h3>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              To edit and optimize resume sections, upload and analyze your PDF resume file in the Scanner page first.
            </p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          
          {/* LEFT PANEL: Original Resume section views */}
          <div className="lg:col-span-3 space-y-4">
            
            {/* Contact Details Card */}
            <div className="p-4 bg-slate-900/10 border border-slate-850 rounded-2xl space-y-3">
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Contact Information (Editable)</span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <input
                  type="text"
                  value={candidateName}
                  onChange={(e) => setCandidateName(e.target.value)}
                  placeholder="Full Name"
                  className="bg-slate-950 border border-slate-900 rounded-lg px-3 py-2 text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500"
                />
                <input
                  type="text"
                  value={candidateEmail}
                  onChange={(e) => setCandidateEmail(e.target.value)}
                  placeholder="Email Address"
                  className="bg-slate-950 border border-slate-900 rounded-lg px-3 py-2 text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500"
                />
                <input
                  type="text"
                  value={candidatePhone}
                  onChange={(e) => setCandidatePhone(e.target.value)}
                  placeholder="Phone Number"
                  className="bg-slate-950 border border-slate-900 rounded-lg px-3 py-2 text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500"
                />
                <input
                  type="text"
                  value={candidateLinks}
                  onChange={(e) => setCandidateLinks(e.target.value)}
                  placeholder="LinkedIn | GitHub | Portfolio"
                  className="bg-slate-950 border border-slate-900 rounded-lg px-3 py-2 text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            {/* Section tabs */}
            <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-900 overflow-x-auto gap-1">
              {(['experience', 'projects', 'skills', 'education', 'achievements'] as const).map((sec) => (
                <button
                  key={sec}
                  onClick={() => {
                    setActiveSection(sec);
                    setActiveIndex(0);
                  }}
                  className={`px-3 py-2 rounded-lg text-xs font-bold tracking-wide uppercase flex-shrink-0 transition-all ${
                    activeSection === sec
                      ? 'bg-blue-600 text-white shadow shadow-blue-500/10'
                      : 'text-slate-500 hover:text-slate-300'
                  }`}
                >
                  {sec}
                </button>
              ))}
            </div>

            {/* Selected Section List Card */}
            <div className="p-6 bg-slate-900/10 border border-slate-850 rounded-2xl shadow-xl space-y-4 min-h-[300px]">
              
              <div className="flex justify-between items-center pb-2 border-b border-slate-900">
                <span className="text-xs font-extrabold text-white uppercase tracking-wider">
                  {activeSection} Outline
                </span>
                <span className="text-[10px] text-slate-500 font-mono">
                  {(parsedSections[activeSection] || []).length} items detected
                </span>
              </div>

              <div className="space-y-3">
                {(parsedSections[activeSection] || []).map((bullet: string, idx: number) => {
                  const isSelected = activeIndex === idx;
                  const isInteractive = activeSection === 'experience' || activeSection === 'projects';
                  
                  return (
                    <div
                      key={idx}
                      onClick={() => isInteractive && setActiveIndex(idx)}
                      className={`p-4 border rounded-xl transition-all relative overflow-hidden text-xs leading-relaxed ${
                        isInteractive ? 'cursor-pointer' : 'cursor-default'
                      } ${
                        isSelected
                          ? 'border-indigo-500 bg-indigo-950/10 shadow shadow-indigo-500/5'
                          : 'border-slate-900 bg-slate-950/20 hover:border-slate-850'
                      }`}
                    >
                      {/* Active marker label */}
                      {isSelected && isInteractive && (
                        <div className="absolute top-0 right-0 bg-indigo-650 px-2 py-0.5 text-[8px] font-bold text-white uppercase tracking-wider rounded-bl">
                          Active Selection
                        </div>
                      )}
                      
                      <div className="flex gap-2">
                        {isInteractive && (
                          <ChevronRight className={`w-4 h-4 mt-0.5 flex-shrink-0 transition-all ${
                            isSelected ? 'text-indigo-400 translate-x-0.5' : 'text-slate-655'
                          }`} />
                        )}
                        <p className={`font-medium ${isSelected ? 'text-white' : 'text-slate-350'}`}>
                          {bullet}
                        </p>
                      </div>
                    </div>
                  );
                })}

                {(parsedSections[activeSection] || []).length === 0 && (
                  <div className="py-10 text-center text-xs text-slate-550 italic">
                    This section does not contain any parsed bullet points.
                  </div>
                )}
              </div>

            </div>
          </div>

          {/* RIGHT PANEL: AI suggestion cards */}
          <div className="lg:col-span-2 space-y-4">
            
            {/* Context title */}
            <div className="px-1 py-1.5 flex justify-between items-center text-xs text-slate-455 font-bold uppercase tracking-wider">
              <span>AI Optimizer Suggestion</span>
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" /> Live Analysis
              </span>
            </div>

            {activeSection !== 'experience' && activeSection !== 'projects' ? (
              <div className="p-6 bg-slate-900/10 border border-slate-850 rounded-2xl text-center space-y-3.5 text-xs text-slate-500 italic min-h-[220px] flex flex-col justify-center">
                <Info className="w-6 h-6 text-slate-600 mx-auto" />
                <p>AI suggestions are optimized for Experience and Projects sections where bullet descriptions require action verbs and quantified impact.</p>
              </div>
            ) : (
              <div>
                {loadingSuggestion ? (
                  <div className="p-12 border border-slate-850 bg-slate-900/10 rounded-2xl text-center space-y-4 min-h-[220px] flex flex-col justify-center items-center">
                    <Loader className="animate-spin h-7 w-7 text-indigo-500" />
                    <div>
                      <span className="text-xs font-bold text-white block">Calling Gemini SDE Optimizer...</span>
                      <span className="text-[10px] text-slate-500 block mt-1">Refactoring wording using STAR/X-Y-Z guidelines.</span>
                    </div>
                  </div>
                ) : activeSuggestion ? (
                  <div className="p-5 bg-slate-900/10 border border-slate-850 rounded-2xl shadow-xl space-y-5">
                    
                    {/* Header badge details */}
                    <div className="flex justify-between items-center border-b border-slate-900 pb-2">
                      <span className="text-[10px] text-indigo-400 font-extrabold uppercase tracking-wide">Optimization Suggestion</span>
                      <span className="text-[9px] text-green-400 font-bold bg-green-950/40 px-2 py-0.5 border border-green-900/40 rounded font-mono">
                        +{activeSuggestion.estimatedAtsImprovement}% Score Boost
                      </span>
                    </div>

                    {/* Diff View */}
                    <div className="space-y-1">
                      <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider block">Visual Differences</span>
                      {renderDiff(activeSuggestion.original, isEditing ? editedText : activeSuggestion.improved)}
                    </div>

                    {/* Explanation */}
                    <div className="p-3.5 bg-slate-950/50 border border-slate-900 rounded-xl space-y-1.5 text-xs">
                      <span className="text-[9px] text-indigo-400 font-bold uppercase tracking-wider block flex items-center gap-1">
                        <Info className="w-3.5 h-3.5" /> AI Explanation
                      </span>
                      <p className="text-slate-400 leading-relaxed font-medium">
                        {activeSuggestion.reason}
                      </p>
                    </div>

                    {/* Inline Editor */}
                    {isEditing ? (
                      <div className="space-y-2">
                        <span className="text-[9px] text-slate-550 font-bold uppercase tracking-wider block">Custom Edit suggested text</span>
                        <textarea
                          value={editedText}
                          onChange={(e) => setEditedText(e.target.value)}
                          rows={3}
                          className="w-full bg-slate-950 border border-slate-900 text-white rounded-xl p-3 text-xs leading-relaxed focus:outline-none focus:border-indigo-500"
                        />
                      </div>
                    ) : null}

                    {/* Actions row */}
                    <div className="flex justify-between items-center pt-2 border-t border-slate-900/60">
                      <div className="flex gap-2">
                        <button
                          onClick={handleAccept}
                          className="flex items-center gap-1 px-3.5 py-2 bg-green-600 hover:bg-green-700 text-xs font-bold rounded-lg text-white shadow-md shadow-green-500/10 transition-all"
                        >
                          <Check className="w-3.5 h-3.5" /> Accept Suggestion
                        </button>
                        <button
                          onClick={handleReject}
                          className="flex items-center gap-1 px-3 py-2 bg-slate-950 border border-slate-900 hover:bg-slate-900 text-xs font-semibold rounded-lg text-slate-400 transition-all"
                        >
                          <X className="w-3.5 h-3.5" /> Reject
                        </button>
                      </div>

                      <button
                        onClick={() => {
                          if (isEditing) {
                            handleAccept();
                          } else {
                            setIsEditing(true);
                            setEditedText(activeSuggestion.improved);
                          }
                        }}
                        className="flex items-center gap-1.5 px-3 py-2 bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-300 text-xs font-semibold rounded-lg transition-all"
                      >
                        <Edit2 className="w-3 h-3" /> {isEditing ? 'Save & Accept' : 'Custom Edit'}
                      </button>
                    </div>

                  </div>
                ) : (
                  <div className="p-6 bg-slate-900/10 border border-slate-850 rounded-2xl text-center space-y-4 min-h-[220px] flex flex-col justify-center items-center">
                    <Sparkles className="w-6 h-6 text-indigo-400 animate-pulse" />
                    <div>
                      <span className="text-xs font-bold text-white block">Optimize this bullet point</span>
                      <p className="text-[10px] text-slate-500 leading-relaxed mt-1">
                        Generate strong action verbs and quantified impact metrics using Gemini.
                      </p>
                    </div>
                    <button
                      onClick={fetchSuggestion}
                      className="px-4 py-2 bg-indigo-650 hover:bg-indigo-700 text-white font-bold rounded-lg text-xs transition-all shadow-md shadow-indigo-500/10"
                    >
                      Scan and Suggest Rewrites
                    </button>
                  </div>
                )}
              </div>
            )}

          </div>

        </div>
      )}

      {/* Print Resume Area (hidden on screen via CSS, shown on window.print()) */}
      {parsedSections && (
        <div id="print-resume-area">
          <div style={{ textAlign: 'center', marginBottom: '20px' }}>
            <h1 style={{ fontSize: '22pt', fontWeight: 'bold', margin: '0 0 5px 0', textTransform: 'uppercase' }}>
              {candidateName}
            </h1>
            <div style={{ fontSize: '10pt', color: '#111' }}>
              {candidateEmail} &nbsp;|&nbsp; {candidatePhone} &nbsp;|&nbsp; {candidateLinks}
            </div>
          </div>

          {parsedSections.education && parsedSections.education.length > 0 && (
            <div style={{ marginBottom: '15px' }}>
              <h2 style={{ fontSize: '12pt', fontWeight: 'bold', borderBottom: '1px solid #000', paddingBottom: '3px', margin: '15px 0 8px 0', textTransform: 'uppercase', color: '#111' }}>
                Education
              </h2>
              <ul style={{ margin: '0', paddingLeft: '20px', fontSize: '10.5pt', lineHeight: '1.4', color: '#111' }}>
                {parsedSections.education.map((edu: string, i: number) => (
                  <li key={i} style={{ marginBottom: '3px' }}>{edu}</li>
                ))}
              </ul>
            </div>
          )}

          {parsedSections.skills && parsedSections.skills.length > 0 && (
            <div style={{ marginBottom: '15px' }}>
              <h2 style={{ fontSize: '12pt', fontWeight: 'bold', borderBottom: '1px solid #000', paddingBottom: '3px', margin: '15px 0 8px 0', textTransform: 'uppercase', color: '#111' }}>
                Technical Skills
              </h2>
              <div style={{ fontSize: '10.5pt', lineHeight: '1.4', paddingLeft: '5px', color: '#111' }}>
                {parsedSections.skills.join(', ')}
              </div>
            </div>
          )}

          {parsedSections.experience && parsedSections.experience.length > 0 && (
            <div style={{ marginBottom: '15px' }}>
              <h2 style={{ fontSize: '12pt', fontWeight: 'bold', borderBottom: '1px solid #000', paddingBottom: '3px', margin: '15px 0 8px 0', textTransform: 'uppercase', color: '#111' }}>
                Professional Experience
              </h2>
              <ul style={{ margin: '0', paddingLeft: '20px', fontSize: '10.5pt', lineHeight: '1.4', color: '#111' }}>
                {parsedSections.experience.map((exp: string, i: number) => (
                  <li key={i} style={{ marginBottom: '4px' }}>{exp}</li>
                ))}
              </ul>
            </div>
          )}

          {parsedSections.projects && parsedSections.projects.length > 0 && (
            <div style={{ marginBottom: '15px' }}>
              <h2 style={{ fontSize: '12pt', fontWeight: 'bold', borderBottom: '1px solid #000', paddingBottom: '3px', margin: '15px 0 8px 0', textTransform: 'uppercase', color: '#111' }}>
                Projects
              </h2>
              <ul style={{ margin: '0', paddingLeft: '20px', fontSize: '10.5pt', lineHeight: '1.4', color: '#111' }}>
                {parsedSections.projects.map((proj: string, i: number) => (
                  <li key={i} style={{ marginBottom: '4px' }}>{proj}</li>
                ))}
              </ul>
            </div>
          )}

          {parsedSections.achievements && parsedSections.achievements.length > 0 && (
            <div style={{ marginBottom: '15px' }}>
              <h2 style={{ fontSize: '12pt', fontWeight: 'bold', borderBottom: '1px solid #000', paddingBottom: '3px', margin: '15px 0 8px 0', textTransform: 'uppercase', color: '#111' }}>
                Achievements & Activities
              </h2>
              <ul style={{ margin: '0', paddingLeft: '20px', fontSize: '10.5pt', lineHeight: '1.4', color: '#111' }}>
                {parsedSections.achievements.map((ach: string, i: number) => (
                  <li key={i} style={{ marginBottom: '3px' }}>{ach}</li>
                ))}
              </ul>
            </div>
          )}

          <style>{`
            @media screen {
              #print-resume-area {
                display: none !important;
              }
            }
            @media print {
              body * {
                visibility: hidden !important;
              }
              #print-resume-area, #print-resume-area * {
                visibility: visible !important;
              }
              #print-resume-area {
                display: block !important;
                position: absolute !important;
                left: 0 !important;
                top: 0 !important;
                width: 100% !important;
                color: black !important;
                background: white !important;
                font-family: 'Times New Roman', Times, serif !important;
              }
              header, aside, main, .no-print, button, nav {
                display: none !important;
              }
            }
          `}</style>
        </div>
      )}
    </div>
  );
}
