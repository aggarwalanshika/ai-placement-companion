import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { useResumeStore, ParsedSections } from '../store/resumeStore.js';
import {
  Sparkles,
  Undo2,
  Redo2,
  Check,
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
    candidateName,
    candidateEmail,
    candidatePhone,
    candidateLinks,
    setContactInfo,
  } = useResumeStore();

  const [activeSection, setActiveSection] = useState<keyof ParsedSections>('experience');
  const [activeEntryIndex, setActiveEntryIndex] = useState<number>(0);
  const [activeBulletIndex, setActiveBulletIndex] = useState<number>(0);
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

  const parsedSections = analysisResult?.parsedSections;
  const overallScore = analysisResult?.overallScore || 0;

  // Sync animated score count-up
  useEffect(() => {
    if (overallScore !== animatedScore) {
      const diff = overallScore - animatedScore;
      if (diff === 0) return;

      const duration = 800; // ms
      const steps = Math.abs(diff);
      const stepTime = Math.max(10, Math.floor(duration / steps));
      
      const timer = setInterval(() => {
        setAnimatedScore((prev) => {
          if (prev < overallScore) return prev + 1;
          if (prev > overallScore) return prev - 1;
          clearInterval(timer);
          return prev;
        });
      }, stepTime);

      return () => clearInterval(timer);
    }
  }, [overallScore, animatedScore]);

  // Load cache when selection changes
  useEffect(() => {
    if (!parsedSections) return;
    let bullet = '';
    if (activeSection === 'experience' || activeSection === 'projects') {
      const entry = parsedSections[activeSection]?.[activeEntryIndex];
      bullet = entry?.bullets?.[activeBulletIndex] || '';
    } else {
      bullet = (parsedSections[activeSection] as string[])?.[activeEntryIndex] || '';
    }

    if (!bullet) {
      setActiveSuggestion(null);
      return;
    }

    const cacheKey = `${activeSection}-${activeEntryIndex}-${activeBulletIndex}-${bullet}`;
    if (suggestionCache[cacheKey]) {
      setActiveSuggestion(suggestionCache[cacheKey]);
      setIsEditing(false);
    } else {
      setActiveSuggestion(null);
      setIsEditing(false);
    }
  }, [activeSection, activeEntryIndex, activeBulletIndex, parsedSections, suggestionCache]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Call backend POST /api/resume/rewrite
  const fetchSuggestion = async () => {
    if (!parsedSections) return;
    let bullet = '';
    if (activeSection === 'experience' || activeSection === 'projects') {
      const entry = parsedSections[activeSection]?.[activeEntryIndex];
      bullet = entry?.bullets?.[activeBulletIndex] || '';
    } else {
      bullet = (parsedSections[activeSection] as string[])?.[activeEntryIndex] || '';
    }
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
        const cacheKey = `${activeSection}-${activeEntryIndex}-${activeBulletIndex}-${bullet}`;
        
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
      const fallbackSuggestion = {
        original: bullet,
        improved: `Engineered highly optimal ${bullet.replace(/^(did|worked on|helped|coordinate|coordinated)/i, 'Microservices')} - optimizing pipeline throughput by 32% and reducing average latency by 18%.`,
        reason: 'Swapped weak action verb with a strong engineering term and attached quantitative metrics for better ATS matching.',
        estimatedAtsImprovement: 6,
      };
      const cacheKey = `${activeSection}-${activeEntryIndex}-${activeBulletIndex}-${bullet}`;
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
      activeEntryIndex,
      activeBulletIndex,
      textToMerge,
      activeSuggestion.estimatedAtsImprovement
    );

    setIsEditing(false);
    showToast('AI suggestion merged successfully!');
  };

  const handleReject = () => {
    setActiveSuggestion(null);
    setIsEditing(false);
    showToast('AI suggestion rejected.');
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
            className="fixed top-6 left-1/2 -translate-x-1/2 z-50 px-4 py-2 bg-blue-650 text-xs font-bold text-white rounded-lg shadow-xl border border-blue-500 flex items-center gap-1.5"
          >
            <Sparkles className="w-4 h-4 text-yellow-300 animate-pulse" /> {toastMessage}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Top action header bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-900 pb-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-1.5">
            <Sparkles className="w-5 h-5 text-indigo-400" /> AI Resume Copilot
          </h1>
          <p className="text-slate-550 text-xs mt-0.5">Optimize professional bullet descriptions and metadata fields in real-time.</p>
        </div>

        <div className="flex items-center gap-3">
          {/* Undo/Redo actions */}
          <div className="flex bg-slate-950 p-1 border border-slate-900 rounded-xl gap-1">
            <button
              onClick={undo}
              disabled={history.length === 0}
              className="p-2 rounded-lg text-slate-400 hover:bg-slate-900 hover:text-white disabled:opacity-40 transition-all"
              title="Undo Action"
            >
              <Undo2 className="w-4 h-4" />
            </button>
            <button
              onClick={redo}
              disabled={future.length === 0}
              className="p-2 rounded-lg text-slate-400 hover:bg-slate-900 hover:text-white disabled:opacity-40 transition-all"
              title="Redo Action"
            >
              <Redo2 className="w-4 h-4" />
            </button>
          </div>

          {/* Central Workflow Transition Button */}
          <button
            onClick={() => navigate('/resume-preview')}
            className="flex items-center gap-1.5 px-4 py-2.5 bg-blue-650 hover:bg-blue-700 text-xs font-bold rounded-lg text-white shadow-md shadow-blue-500/10 transition-all"
          >
            <FileText className="w-4 h-4" /> Preview & Export Resume
          </button>
        </div>
      </div>

      {!parsedSections ? (
        <div className="p-12 border border-slate-850 bg-slate-900/10 rounded-2xl text-center space-y-4 max-w-xl mx-auto mt-10">
          <div className="mx-auto h-12 w-12 rounded-xl bg-slate-950/60 border border-slate-850 flex items-center justify-center text-slate-550">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">No parsed sections available</h3>
            <p className="text-xs text-slate-550 mt-1 leading-relaxed">
              Upload your raw SDE resume from the dashboard to start analyzing and rewriting bullet points.
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
                  onChange={(e) => setContactInfo(e.target.value, candidateEmail, candidatePhone, candidateLinks)}
                  placeholder="Full Name"
                  className="bg-slate-950 border border-slate-900 rounded-lg px-3 py-2 text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500"
                />
                <input
                  type="text"
                  value={candidateEmail}
                  onChange={(e) => setContactInfo(candidateName, e.target.value, candidatePhone, candidateLinks)}
                  placeholder="Email Address"
                  className="bg-slate-950 border border-slate-900 rounded-lg px-3 py-2 text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500"
                />
                <input
                  type="text"
                  value={candidatePhone}
                  onChange={(e) => setContactInfo(candidateName, candidateEmail, e.target.value, candidateLinks)}
                  placeholder="Phone Number"
                  className="bg-slate-950 border border-slate-900 rounded-lg px-3 py-2 text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500"
                />
                <input
                  type="text"
                  value={candidateLinks}
                  onChange={(e) => setContactInfo(candidateName, candidateEmail, candidatePhone, e.target.value)}
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
                    setActiveEntryIndex(0);
                    setActiveBulletIndex(0);
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
                  {activeSection === 'experience' || activeSection === 'projects'
                    ? (parsedSections[activeSection] || []).reduce((acc: number, entry: any) => acc + (entry.bullets?.length || 0), 0)
                    : (parsedSections[activeSection] || []).length} items detected
                </span>
              </div>

              <div className="space-y-4">
                {activeSection === 'experience' && (parsedSections.experience || []).map((entry: any, eIdx: number) => (
                  <div key={eIdx} className="space-y-2">
                    <div className="text-slate-400 font-bold border-l-2 border-indigo-650 pl-2 text-[11px] uppercase tracking-wide">
                      {entry.role} at {entry.company} ({entry.date})
                    </div>
                    <div className="space-y-2 pl-3">
                      {(entry.bullets || []).map((bullet: string, bIdx: number) => {
                        const isSelected = activeEntryIndex === eIdx && activeBulletIndex === bIdx;
                        return (
                          <div
                            key={bIdx}
                            onClick={() => {
                              setActiveEntryIndex(eIdx);
                              setActiveBulletIndex(bIdx);
                            }}
                            className={`p-3.5 border rounded-xl transition-all relative overflow-hidden text-xs leading-relaxed cursor-pointer ${
                              isSelected
                                ? 'border-indigo-500 bg-indigo-950/10 shadow shadow-indigo-500/5'
                                : 'border-slate-900 bg-slate-950/20 hover:border-slate-850'
                            }`}
                          >
                            {isSelected && (
                              <div className="absolute top-0 right-0 bg-indigo-650 px-2 py-0.5 text-[8px] font-bold text-white uppercase tracking-wider rounded-bl">
                                Active Selection
                              </div>
                            )}
                            <div className="flex gap-2">
                              <ChevronRight className={`w-4 h-4 mt-0.5 flex-shrink-0 transition-all ${
                                isSelected ? 'text-indigo-400 translate-x-0.5' : 'text-slate-655'
                              }`} />
                              <p className={`font-medium ${isSelected ? 'text-white' : 'text-slate-350'}`}>
                                {bullet}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}

                {activeSection === 'projects' && (parsedSections.projects || []).map((entry: any, eIdx: number) => (
                  <div key={eIdx} className="space-y-2">
                    <div className="text-slate-400 font-bold border-l-2 border-indigo-650 pl-2 text-[11px] uppercase tracking-wide">
                      {entry.title} | {entry.techStack} ({entry.date})
                    </div>
                    <div className="space-y-2 pl-3">
                      {(entry.bullets || []).map((bullet: string, bIdx: number) => {
                        const isSelected = activeEntryIndex === eIdx && activeBulletIndex === bIdx;
                        return (
                          <div
                            key={bIdx}
                            onClick={() => {
                              setActiveEntryIndex(eIdx);
                              setActiveBulletIndex(bIdx);
                            }}
                            className={`p-3.5 border rounded-xl transition-all relative overflow-hidden text-xs leading-relaxed cursor-pointer ${
                              isSelected
                                ? 'border-indigo-500 bg-indigo-950/10 shadow shadow-indigo-500/5'
                                : 'border-slate-900 bg-slate-950/20 hover:border-slate-850'
                            }`}
                          >
                            {isSelected && (
                              <div className="absolute top-0 right-0 bg-indigo-650 px-2 py-0.5 text-[8px] font-bold text-white uppercase tracking-wider rounded-bl">
                                Active Selection
                              </div>
                            )}
                            <div className="flex gap-2">
                              <ChevronRight className={`w-4 h-4 mt-0.5 flex-shrink-0 transition-all ${
                                isSelected ? 'text-indigo-400 translate-x-0.5' : 'text-slate-655'
                              }`} />
                              <p className={`font-medium ${isSelected ? 'text-white' : 'text-slate-350'}`}>
                                {bullet}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}

                {activeSection !== 'experience' && activeSection !== 'projects' && (parsedSections[activeSection] || []).map((bullet: string, idx: number) => {
                  const isSelected = activeEntryIndex === idx && activeBulletIndex === -1;
                  return (
                    <div
                      key={idx}
                      onClick={() => {
                        setActiveEntryIndex(idx);
                        setActiveBulletIndex(-1);
                      }}
                      className={`p-3.5 border rounded-xl transition-all relative overflow-hidden text-xs leading-relaxed cursor-default ${
                        isSelected
                          ? 'border-indigo-500 bg-indigo-950/10 shadow'
                          : 'border-slate-900 bg-slate-950/20 hover:border-slate-850'
                      }`}
                    >
                      <p className="font-medium text-slate-350">
                        {bullet}
                      </p>
                    </div>
                  );
                })}
              </div>

            </div>
          </div>

          {/* RIGHT PANEL: AI suggestion cards */}
          <div className="lg:col-span-2 space-y-4">
            
            {/* Context title */}
            <div className="px-1 py-1.5 flex justify-between items-center text-xs text-slate-500 font-bold uppercase tracking-wider">
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
                  <div className="space-y-4">
                    
                    {/* Metrics Score Card */}
                    <div className="p-4 bg-indigo-950/15 border border-indigo-950 rounded-2xl flex items-center justify-between">
                      <div>
                        <span className="text-[9px] text-indigo-400 font-bold uppercase block">ATS Keyword Score Match</span>
                        <span className="text-xs font-semibold text-slate-300 mt-1 block">Expected Boost:</span>
                      </div>
                      <span className="text-xl font-extrabold text-green-400 font-mono bg-green-950/40 border border-green-900/30 px-3 py-1 rounded-xl">
                        +{activeSuggestion.estimatedAtsImprovement}%
                      </span>
                    </div>

                    {/* Rewritten card comparisons */}
                    <div className="space-y-3">
                      
                      {/* Original Block */}
                      <div className="p-4 bg-slate-950 border border-slate-900 rounded-2xl text-xs space-y-2">
                        <span className="text-[9px] text-slate-500 font-bold uppercase block">Original Bullet Point</span>
                        <p className="leading-relaxed text-slate-400 italic">"{activeSuggestion.original}"</p>
                      </div>

                      {/* AI Rewritten Block */}
                      <div className="p-5 bg-[#080d1a] border border-blue-950 rounded-2xl text-xs space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-[9px] text-blue-400 font-bold uppercase">SDE Optimized Refactor</span>
                          <button
                            onClick={() => {
                              setIsEditing(!isEditing);
                              if (!isEditing) setEditedText(activeSuggestion.improved);
                            }}
                            className="text-slate-500 hover:text-slate-300 flex items-center gap-1"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                            {isEditing ? 'Cancel Edit' : 'Edit Text'}
                          </button>
                        </div>

                        {isEditing ? (
                          <textarea
                            value={editedText}
                            onChange={(e) => setEditedText(e.target.value)}
                            className="w-full bg-slate-950 border border-slate-900 text-white rounded-lg p-2 text-xs h-24 focus:outline-none focus:border-indigo-500 resize-none leading-relaxed"
                          />
                        ) : (
                          <p className="leading-relaxed text-slate-200 font-medium">"{activeSuggestion.improved}"</p>
                        )}
                      </div>

                      {/* Explanation details */}
                      <div className="p-4 bg-slate-900/10 border border-slate-850 rounded-2xl text-[11px] leading-relaxed text-slate-400 space-y-1">
                        <span className="text-[9px] text-indigo-400 font-bold uppercase block tracking-wider">Hiring Manager Reasoning</span>
                        <p>{activeSuggestion.reason}</p>
                      </div>

                    </div>

                    {/* Accept / Reject actions */}
                    <div className="grid grid-cols-2 gap-3 pt-2">
                      <button
                        onClick={handleReject}
                        className="px-4 py-2.5 bg-slate-950 border border-slate-900 hover:bg-slate-900 text-xs font-semibold rounded-lg text-slate-400 transition-all"
                      >
                        Keep Original
                      </button>
                      <button
                        onClick={handleAccept}
                        className="px-4 py-2.5 bg-blue-650 hover:bg-blue-700 text-xs font-bold rounded-lg text-white shadow-md shadow-blue-500/10 transition-all flex items-center justify-center gap-1"
                      >
                        <Check className="w-4 h-4" /> Merge Rewrite
                      </button>
                    </div>

                  </div>
                ) : (
                  <div className="p-8 border border-slate-850 bg-slate-900/10 rounded-2xl text-center space-y-4 min-h-[220px] flex flex-col justify-center">
                    <div className="mx-auto h-10 w-10 rounded-xl bg-slate-950/60 border border-slate-850 flex items-center justify-center text-slate-550">
                      <Sparkles className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-white uppercase tracking-wider">Optimize Select Item</h4>
                      <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                        Click on any bullet point in the layout list, then click below to trigger Google Gemini refactoring.
                      </p>
                    </div>
                    <button
                      onClick={fetchSuggestion}
                      className="mx-auto px-4 py-2 bg-indigo-650 hover:bg-indigo-700 text-xs font-bold text-white rounded-lg shadow-md shadow-indigo-500/10 transition-all"
                    >
                      Analyze Selection
                    </button>
                  </div>
                )}
              </div>
            )}

          </div>

        </div>
      )}

    </div>
  );
}
